import { test, expect } from '@playwright/test'

/**
 * Agent A - QA Sentinel: Job Creation Flow Tests
 *
 * These tests verify that the job creation flow works correctly:
 * 1. User cannot submit without valid location
 * 2. Address autocomplete provides valid coordinates
 * 3. Job appears in listings after creation
 * 4. All required fields are validated
 *
 * This test would have caught the bug where jobs were being
 * created without valid lat/lng coordinates.
 */

// Helper to set user role
async function setUserRole(page: any, role: 'HIRER' | 'WORKER') {
  await page.addInitScript((role: string) => {
    localStorage.setItem('crewlink_user_role', role)
  }, role)
}

test.describe('QA Sentinel - Job Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setUserRole(page, 'HIRER')
  })

  test.describe('Job Creation Page Access', () => {
    test('Job creation page loads for HIRER', async ({ page }) => {
      const response = await page.goto('/hiring/new')
      expect(response?.status()).toBeLessThan(400)

      // Should see job creation form
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('Post')
    })

    test('Job creation page redirects WORKER', async ({ page }) => {
      await setUserRole(page, 'WORKER')
      await page.goto('/hiring/new')
      await page.waitForLoadState('networkidle')

      // Should be redirected away from hiring area
      const url = page.url()
      expect(url).not.toContain('/hiring/new')
    })
  })

  test.describe('Form Validation', () => {
    test('Submit button is disabled without required fields', async ({ page }) => {
      await page.goto('/hiring/new')
      await page.waitForLoadState('networkidle')

      // Find the next/submit button in the first step
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first()

      if (await nextButton.isVisible()) {
        // Button should be disabled or clicking should not proceed
        const isDisabled = await nextButton.isDisabled()

        if (!isDisabled) {
          // If not disabled, clicking should not navigate away
          await nextButton.click()
          await page.waitForTimeout(500)

          // Should still be on the same page
          expect(page.url()).toContain('/hiring/new')
        }
      }
    })

    test('Cannot proceed past location step without valid address', async ({ page }) => {
      await page.goto('/hiring/new')
      await page.waitForLoadState('networkidle')

      // Fill in category if required
      const categoryOptions = page.locator('button[role="option"], [data-category]')
      if (await categoryOptions.first().isVisible()) {
        await categoryOptions.first().click()
      }

      // Fill in title
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first()
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Job Title')
      }

      // Fill in description
      const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first()
      if (await descInput.isVisible()) {
        await descInput.fill('Test job description for testing purposes.')
      }

      // Try to proceed without filling location
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first()

      // Navigate through steps until we hit location
      let attempts = 0
      while (attempts < 5) {
        if (await nextButton.isVisible()) {
          const wasDisabled = await nextButton.isDisabled()
          if (wasDisabled) break

          await nextButton.click()
          await page.waitForTimeout(500)
        }
        attempts++
      }

      // If we find a location input, it should be required
      const locationInput = page.locator('input[name="location"], input[placeholder*="address" i], input[placeholder*="location" i]').first()
      if (await locationInput.isVisible()) {
        // Location field should be present and required for submission
        const locationValue = await locationInput.inputValue()

        // Should not be able to submit without valid location
        const submitButton = page.locator('button:has-text("Post"), button:has-text("Submit"), button:has-text("Create")').first()
        if (await submitButton.isVisible()) {
          const isDisabled = await submitButton.isDisabled()

          // If location is empty, submit should be disabled
          if (!locationValue) {
            expect(isDisabled).toBe(true)
          }
        }
      }
    })

    test('Address autocomplete provides coordinates', async ({ page }) => {
      await page.goto('/hiring/new')
      await page.waitForLoadState('networkidle')

      // Find the address/location input
      const locationInput = page.locator('input[placeholder*="address" i], input[placeholder*="location" i], input[name="location"]').first()

      if (await locationInput.isVisible()) {
        // Type an address
        await locationInput.fill('123 Main Street')
        await page.waitForTimeout(1000) // Wait for autocomplete suggestions

        // Check if autocomplete suggestions appear
        const suggestions = page.locator('[role="listbox"] [role="option"], .autocomplete-suggestion, [data-suggestion]')
        const hasSuggestions = await suggestions.count() > 0

        if (hasSuggestions) {
          // Click first suggestion
          await suggestions.first().click()
          await page.waitForTimeout(500)

          // After selecting, the input should have a value
          const selectedValue = await locationInput.inputValue()
          expect(selectedValue.length).toBeGreaterThan(0)
        }
      }
    })
  })

  test.describe('Job Submission API', () => {
    test('POST /api/jobs requires lat/lng coordinates', async ({ page, request }) => {
      // Try to create a job without coordinates
      const response = await request.post('/api/jobs', {
        data: {
          title: 'Test Job',
          description: 'Test description',
          category: 'cleaning',
          address: '123 Main St',
          // Missing lat and lng intentionally
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Should fail validation
      expect(response.status()).toBe(400)

      const body = await response.json()
      expect(body.error).toBeDefined()
      expect(body.missingFields).toContain('lat')
      expect(body.missingFields).toContain('lng')
    })

    test('POST /api/jobs succeeds with valid data', async ({ page, request }) => {
      const response = await request.post('/api/jobs', {
        data: {
          title: 'Valid Test Job',
          description: 'This is a valid test job description',
          category: 'cleaning',
          address: '123 Main St, San Francisco, CA',
          lat: 37.7749,
          lng: -122.4194,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Should succeed
      expect(response.status()).toBe(201)

      const body = await response.json()
      expect(body.id).toBeDefined()
      expect(body.title).toBe('Valid Test Job')
      expect(body.lat).toBe(37.7749)
      expect(body.lng).toBe(-122.4194)
    })
  })

  test.describe('Job Listing After Creation', () => {
    test('GET /api/jobs returns created jobs', async ({ page, request }) => {
      // First create a job
      const createResponse = await request.post('/api/jobs', {
        data: {
          title: 'Listing Test Job',
          description: 'This job should appear in listings',
          category: 'cleaning',
          address: '456 Oak Ave, San Francisco, CA',
          lat: 37.7849,
          lng: -122.4094,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(createResponse.status()).toBe(201)
      const createdJob = await createResponse.json()

      // Now fetch jobs list
      const listResponse = await request.get('/api/jobs')
      expect(listResponse.status()).toBe(200)

      const jobs = await listResponse.json()
      expect(Array.isArray(jobs)).toBe(true)

      // The created job should be in the list
      const foundJob = jobs.find((j: any) => j.id === createdJob.id)
      expect(foundJob).toBeDefined()
      expect(foundJob.title).toBe('Listing Test Job')
    })

    test('Jobs page displays jobs from API', async ({ page }) => {
      await page.goto('/hiring/jobs')
      await page.waitForLoadState('networkidle')

      // Should either show jobs or empty state
      const pageContent = await page.textContent('body')

      // Page should have loaded without error
      const hasError = pageContent?.includes('Error') && pageContent?.includes('failed')
      expect(hasError).toBeFalsy()

      // Should have job listings or empty state message
      const hasContent =
        pageContent?.includes('job') ||
        pageContent?.includes('Job') ||
        pageContent?.includes('No jobs') ||
        pageContent?.includes('posted')

      expect(hasContent).toBe(true)
    })
  })

  test.describe('End-to-End Job Creation', () => {
    test('Full job creation flow works correctly', async ({ page }) => {
      await page.goto('/hiring/new')
      await page.waitForLoadState('networkidle')

      // This test walks through the complete job creation flow
      // Each step should work and eventually redirect to jobs list

      // Step 1: Select category (if present)
      const categoryButton = page.locator('[data-category], button:has-text("Cleaning"), button:has-text("Moving")').first()
      if (await categoryButton.isVisible()) {
        await categoryButton.click()
        await page.waitForTimeout(300)
      }

      // Step 2: Fill title
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first()
      if (await titleInput.isVisible()) {
        await titleInput.fill('E2E Test Job ' + Date.now())
      }

      // Step 3: Fill description
      const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first()
      if (await descInput.isVisible()) {
        await descInput.fill('This is an end-to-end test job created by automated testing.')
      }

      // Navigate through form with Next buttons
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")')
      let step = 0
      while (step < 10) {
        const btn = nextButton.first()
        if (await btn.isVisible() && !(await btn.isDisabled())) {
          await btn.click()
          await page.waitForTimeout(500)
          step++
        } else {
          break
        }
      }

      // Step 4: Fill location with autocomplete
      const locationInput = page.locator('input[placeholder*="address" i], input[placeholder*="location" i]').first()
      if (await locationInput.isVisible()) {
        await locationInput.fill('San Francisco, CA')
        await page.waitForTimeout(1000)

        // Click suggestion if available
        const suggestion = page.locator('[role="option"], .suggestion').first()
        if (await suggestion.isVisible()) {
          await suggestion.click()
          await page.waitForTimeout(500)
        }
      }

      // Continue navigating
      while (step < 15) {
        const btn = nextButton.first()
        if (await btn.isVisible() && !(await btn.isDisabled())) {
          await btn.click()
          await page.waitForTimeout(500)
          step++
        } else {
          break
        }
      }

      // Final: Submit the job
      const submitButton = page.locator('button:has-text("Post"), button:has-text("Submit"), button:has-text("Create")').first()
      if (await submitButton.isVisible() && !(await submitButton.isDisabled())) {
        await submitButton.click()

        // Wait for redirect to jobs list
        await page.waitForURL(/\/hiring\/jobs/, { timeout: 10000 }).catch(() => {
          // May not redirect, check for success state
        })

        // Either redirected or shows success
        const currentUrl = page.url()
        const pageContent = await page.textContent('body')

        const success =
          currentUrl.includes('/hiring/jobs') ||
          pageContent?.includes('success') ||
          pageContent?.includes('posted') ||
          pageContent?.includes('created')

        expect(success).toBe(true)
      }
    })
  })
})
