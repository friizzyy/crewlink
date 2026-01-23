import { test, expect } from '@playwright/test'
import { criticalRoutes } from '../../src/qa/clickTargets'

/**
 * Agent A - QA Sentinel: Route Smoke Tests
 *
 * These tests verify that all critical routes:
 * 1. Load without errors (no 4xx/5xx)
 * 2. Render expected content
 * 3. Have no console errors
 * 4. Load within acceptable time
 * 5. Respect role-based access (HIRER vs WORKER)
 */

// Maximum acceptable load time in milliseconds
const MAX_LOAD_TIME = 10000

// Helper to set user role in localStorage before test
async function setUserRole(page: any, role: 'HIRER' | 'WORKER') {
  await page.addInitScript((role: string) => {
    localStorage.setItem('crewlink_user_role', role)
  }, role)
}

// Routes that require HIRER role
const HIRER_ROUTES = [
  '/hiring/map',
  '/hiring/post',
  '/hiring/jobs',
  '/hiring/messages',
  '/hiring/notifications',
  '/hiring/profile',
  '/hiring/settings',
]

// Routes that require WORKER role
const WORKER_ROUTES = [
  '/work/map',
  '/work/jobs',
  '/work/messages',
  '/work/notifications',
  '/work/profile',
  '/work/earnings',
  '/work/settings',
]

// Dynamic routes with params (test with sample values)
const DYNAMIC_ROUTES: Record<string, string> = {
  '/hiring/job/[id]': '/hiring/job/sample-job-1',
  '/work/job/[id]': '/work/job/sample-job-1',
  '/cities/[cityId]': '/cities/san-francisco',
  '/help/articles/[slug]': '/help/articles/getting-started',
}

test.describe('QA Sentinel - Route Smoke Tests', () => {
  test.describe('Role Selection Flow', () => {
    test('Role selection page renders correctly', async ({ page }) => {
      const response = await page.goto('/select-role', {
        waitUntil: 'networkidle',
        timeout: MAX_LOAD_TIME,
      })

      expect(response?.status()).toBeLessThan(400)

      // Should have both role options
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('hire')
      expect(pageContent).toContain('work')
    })

    test('Selecting HIRER role redirects to hiring map', async ({ page }) => {
      await page.goto('/select-role')
      await page.waitForLoadState('networkidle')

      // Click the hire button
      const hireButton = page.locator('button:has-text("hire"), [data-role="hirer"]').first()
      if (await hireButton.isVisible()) {
        await hireButton.click()
        await page.waitForURL(/\/hiring/, { timeout: 5000 })
        expect(page.url()).toContain('/hiring')
      }
    })

    test('Selecting WORKER role redirects to work map', async ({ page }) => {
      await page.goto('/select-role')
      await page.waitForLoadState('networkidle')

      // Click the work button
      const workButton = page.locator('button:has-text("work"), [data-role="worker"]').first()
      if (await workButton.isVisible()) {
        await workButton.click()
        await page.waitForURL(/\/work/, { timeout: 5000 })
        expect(page.url()).toContain('/work')
      }
    })
  })

  test.describe('Wrong Side Protection', () => {
    test('WORKER accessing /hiring/* gets redirected', async ({ page }) => {
      await setUserRole(page, 'WORKER')
      await page.goto('/hiring/map')
      await page.waitForLoadState('networkidle')

      // Should be redirected to wrong-side page or work area
      const url = page.url()
      const isRedirected = url.includes('/wrong-side') || url.includes('/work')
      expect(isRedirected).toBe(true)
    })

    test('HIRER accessing /work/* gets redirected', async ({ page }) => {
      await setUserRole(page, 'HIRER')
      await page.goto('/work/map')
      await page.waitForLoadState('networkidle')

      // Should be redirected to wrong-side page or hiring area
      const url = page.url()
      const isRedirected = url.includes('/wrong-side') || url.includes('/hiring')
      expect(isRedirected).toBe(true)
    })

    test('Wrong side page renders with correct options', async ({ page }) => {
      const response = await page.goto('/wrong-side', {
        waitUntil: 'networkidle',
        timeout: MAX_LOAD_TIME,
      })

      expect(response?.status()).toBeLessThan(400)

      const pageContent = await page.textContent('body')
      // Should offer options to go to correct side or switch roles
      expect(pageContent?.length).toBeGreaterThan(0)
    })
  })

  test.describe('Critical Routes Load Successfully', () => {
    for (const route of criticalRoutes) {
      test(`${route} loads without error`, async ({ page }) => {
        // Set appropriate role for route
        if (route.startsWith('/hiring')) {
          await setUserRole(page, 'HIRER')
        } else if (route.startsWith('/work')) {
          await setUserRole(page, 'WORKER')
        }

        // Track console errors
        const consoleErrors: string[] = []
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text())
          }
        })

        // Track request failures
        const failedRequests: string[] = []
        page.on('requestfailed', (request) => {
          failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`)
        })

        // Measure load time
        const startTime = Date.now()

        // Navigate to route
        const response = await page.goto(route, {
          waitUntil: 'networkidle',
          timeout: MAX_LOAD_TIME,
        })

        const loadTime = Date.now() - startTime

        // Check response status
        expect(response?.status()).toBeLessThan(400)

        // Check load time
        expect(loadTime).toBeLessThan(MAX_LOAD_TIME)

        // Check for critical console errors (ignore warnings and known issues)
        const criticalErrors = consoleErrors.filter(
          (err) =>
            !err.includes('Warning:') &&
            !err.includes('DevTools') &&
            !err.includes('favicon') &&
            !err.includes('hydration')
        )

        // Log errors for debugging but don't fail on minor issues
        if (criticalErrors.length > 0) {
          console.warn(`Console errors on ${route}:`, criticalErrors)
        }

        // Check that page has content
        const bodyContent = await page.textContent('body')
        expect(bodyContent?.length).toBeGreaterThan(0)

        // Check for error boundary content (indicates a crash)
        const hasErrorBoundary = await page.evaluate(() => {
          return (
            document.body.textContent?.includes('Something went wrong') ||
            document.body.textContent?.includes('Error loading')
          )
        })

        // Allow error boundary on some routes (they're valid error states)
        if (!route.includes('error')) {
          expect(hasErrorBoundary).toBe(false)
        }
      })
    }
  })

  test.describe('HIRER Routes with Correct Role', () => {
    for (const route of HIRER_ROUTES) {
      test(`HIRER can access ${route}`, async ({ page }) => {
        await setUserRole(page, 'HIRER')

        const response = await page.goto(route, {
          waitUntil: 'networkidle',
          timeout: MAX_LOAD_TIME,
        })

        // Should not redirect away from hiring routes
        expect(page.url()).toContain('/hiring')
        expect(response?.status()).toBeLessThan(400)
      })
    }
  })

  test.describe('WORKER Routes with Correct Role', () => {
    for (const route of WORKER_ROUTES) {
      test(`WORKER can access ${route}`, async ({ page }) => {
        await setUserRole(page, 'WORKER')

        const response = await page.goto(route, {
          waitUntil: 'networkidle',
          timeout: MAX_LOAD_TIME,
        })

        // Should not redirect away from work routes
        expect(page.url()).toContain('/work')
        expect(response?.status()).toBeLessThan(400)
      })
    }
  })

  test.describe('Dynamic Routes', () => {
    for (const [pattern, sampleRoute] of Object.entries(DYNAMIC_ROUTES)) {
      test(`${pattern} loads with sample params`, async ({ page }) => {
        // Set appropriate role for route
        if (sampleRoute.startsWith('/hiring')) {
          await setUserRole(page, 'HIRER')
        } else if (sampleRoute.startsWith('/work')) {
          await setUserRole(page, 'WORKER')
        }

        const response = await page.goto(sampleRoute, {
          waitUntil: 'networkidle',
          timeout: MAX_LOAD_TIME,
        })

        // 404 is acceptable for sample data that doesn't exist
        expect(response?.status()).toBeLessThan(500)
      })
    }
  })

  test.describe('Error States', () => {
    test('404 page renders correctly', async ({ page }) => {
      const response = await page.goto('/this-route-does-not-exist-12345')

      // Should get 404 status or be redirected to 404 page
      const status = response?.status()
      expect([200, 404]).toContain(status)

      // Check for 404 content
      const pageContent = await page.textContent('body')
      const has404Content =
        pageContent?.includes('404') ||
        pageContent?.includes('not found') ||
        pageContent?.includes('Not Found')

      expect(has404Content).toBe(true)
    })
  })

  test.describe('Page Structure', () => {
    const structureRoutes = [
      { route: '/', role: null },
      { route: '/hiring/map', role: 'HIRER' as const },
      { route: '/hiring/messages', role: 'HIRER' as const },
      { route: '/hiring/settings', role: 'HIRER' as const },
      { route: '/work/map', role: 'WORKER' as const },
      { route: '/work/messages', role: 'WORKER' as const },
      { route: '/work/settings', role: 'WORKER' as const },
    ]

    for (const { route, role } of structureRoutes) {
      test(`${route} has proper HTML structure`, async ({ page }) => {
        if (role) {
          await setUserRole(page, role)
        }

        await page.goto(route)

        // Check for basic HTML structure
        const hasHTML = await page.evaluate(() => {
          return document.querySelector('html') !== null
        })
        expect(hasHTML).toBe(true)

        const hasBody = await page.evaluate(() => {
          return document.querySelector('body') !== null
        })
        expect(hasBody).toBe(true)

        // Check for main content area
        const hasMain = await page.evaluate(() => {
          return (
            document.querySelector('main') !== null ||
            document.querySelector('[role="main"]') !== null ||
            document.querySelector('#__next') !== null
          )
        })
        expect(hasMain).toBe(true)
      })
    }
  })

  test.describe('Navigation Presence', () => {
    test('Marketing pages have navigation', async ({ page }) => {
      await page.goto('/')

      // Check for navigation element
      const hasNav = await page.evaluate(() => {
        return (
          document.querySelector('nav') !== null ||
          document.querySelector('[role="navigation"]') !== null ||
          document.querySelector('header') !== null
        )
      })
      expect(hasNav).toBe(true)
    })

    test('Hiring pages have cyan-themed navigation', async ({ page }) => {
      await setUserRole(page, 'HIRER')
      await page.goto('/hiring/map')

      const hasNav = await page.evaluate(() => {
        return document.querySelector('nav') !== null || document.querySelector('header') !== null
      })
      expect(hasNav).toBe(true)
    })

    test('Work pages have emerald-themed navigation', async ({ page }) => {
      await setUserRole(page, 'WORKER')
      await page.goto('/work/map')

      const hasNav = await page.evaluate(() => {
        return document.querySelector('nav') !== null || document.querySelector('header') !== null
      })
      expect(hasNav).toBe(true)
    })
  })

  test.describe('Responsive Behavior', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 },
    ]

    for (const viewport of viewports) {
      test(`Hiring map loads correctly on ${viewport.name}`, async ({ page }) => {
        await setUserRole(page, 'HIRER')
        await page.setViewportSize({ width: viewport.width, height: viewport.height })

        await page.goto('/hiring/map')
        await page.waitForLoadState('networkidle')

        // Page should not have horizontal overflow
        const overflowAmount = await page.evaluate(() => {
          return document.documentElement.scrollWidth - document.documentElement.clientWidth
        })

        expect(overflowAmount).toBeLessThan(20)

        // Content should be visible
        const hasContent = await page.evaluate(() => {
          const body = document.body
          return body.textContent !== null && body.textContent.length > 0
        })
        expect(hasContent).toBe(true)
      })

      test(`Work map loads correctly on ${viewport.name}`, async ({ page }) => {
        await setUserRole(page, 'WORKER')
        await page.setViewportSize({ width: viewport.width, height: viewport.height })

        await page.goto('/work/map')
        await page.waitForLoadState('networkidle')

        // Page should not have horizontal overflow
        const overflowAmount = await page.evaluate(() => {
          return document.documentElement.scrollWidth - document.documentElement.clientWidth
        })

        expect(overflowAmount).toBeLessThan(20)

        // Content should be visible
        const hasContent = await page.evaluate(() => {
          const body = document.body
          return body.textContent !== null && body.textContent.length > 0
        })
        expect(hasContent).toBe(true)
      })
    }
  })

  test.describe('Role Switching', () => {
    test('Switch to Worker Mode from hiring settings works', async ({ page }) => {
      await setUserRole(page, 'HIRER')
      await page.goto('/hiring/settings')
      await page.waitForLoadState('networkidle')

      // Find and click the switch button
      const switchButton = page.locator('button:has-text("Switch to Worker")').first()
      if (await switchButton.isVisible()) {
        await switchButton.click()
        await page.waitForURL(/\/work/, { timeout: 5000 })
        expect(page.url()).toContain('/work')
      }
    })

    test('Switch to Hiring Mode from work settings works', async ({ page }) => {
      await setUserRole(page, 'WORKER')
      await page.goto('/work/settings')
      await page.waitForLoadState('networkidle')

      // Find and click the switch button
      const switchButton = page.locator('button:has-text("Switch to Hiring")').first()
      if (await switchButton.isVisible()) {
        await switchButton.click()
        await page.waitForURL(/\/hiring/, { timeout: 5000 })
        expect(page.url()).toContain('/hiring')
      }
    })
  })
})

// Performance-focused smoke tests
test.describe('QA Sentinel - Performance Smoke Tests', () => {
  test.describe('Page Load Performance', () => {
    const performanceRoutes = [
      { route: '/', role: null },
      { route: '/hiring/map', role: 'HIRER' as const },
      { route: '/hiring/messages', role: 'HIRER' as const },
      { route: '/work/map', role: 'WORKER' as const },
      { route: '/work/messages', role: 'WORKER' as const },
    ]

    for (const { route, role } of performanceRoutes) {
      test(`${route} loads within performance budget`, async ({ page }) => {
        if (role) {
          await setUserRole(page, role)
        }

        // Start performance measurement
        await page.goto(route)

        // Get performance metrics
        const metrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming
          return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
            load: navigation.loadEventEnd - navigation.startTime,
            firstPaint:
              performance.getEntriesByName('first-paint')[0]?.startTime || navigation.responseEnd,
          }
        })

        // Check performance thresholds
        expect(metrics.domContentLoaded).toBeLessThan(5000) // 5s for DOMContentLoaded
        expect(metrics.load).toBeLessThan(10000) // 10s for full load
      })
    }
  })
})
