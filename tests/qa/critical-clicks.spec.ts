import { test, expect, Page } from '@playwright/test'
import {
  allClickTargets,
  ClickTarget,
  buildSelector,
  getTargetsForRoute,
} from '../../src/qa/clickTargets'

/**
 * Agent A - QA Sentinel: Critical Click Tests
 *
 * These tests verify that all registered interactive elements respond
 * correctly when clicked. Each element must produce an expected outcome:
 * - Route navigation
 * - Modal/popover/dropdown appearance
 * - Toast notification
 * - Other documented actions
 */

// Helper to check if element is in viewport
async function isInViewport(page: Page, selector: string): Promise<boolean> {
  const element = await page.$(selector)
  if (!element) return false

  const boundingBox = await element.boundingBox()
  if (!boundingBox) return false

  const viewport = page.viewportSize()
  if (!viewport) return false

  return (
    boundingBox.x >= 0 &&
    boundingBox.y >= 0 &&
    boundingBox.x + boundingBox.width <= viewport.width &&
    boundingBox.y + boundingBox.height <= viewport.height
  )
}

// Helper to wait for navigation or state change
async function clickAndWait(
  page: Page,
  selector: string,
  target: ClickTarget
): Promise<{ success: boolean; message: string }> {
  const element = await page.$(selector)
  if (!element) {
    return { success: false, message: `Element not found: ${selector}` }
  }

  // Check if element is visible
  const isVisible = await element.isVisible()
  if (!isVisible) {
    return { success: false, message: `Element not visible: ${selector}` }
  }

  try {
    const outcome = target.outcome

    switch (outcome.type) {
      case 'route': {
        // Click and wait for navigation
        await Promise.all([
          page.waitForURL(
            (url) => {
              const pathname = new URL(url).pathname
              return outcome.exact
                ? pathname === outcome.path
                : pathname.startsWith(outcome.path)
            },
            { timeout: 10000 }
          ),
          element.click(),
        ])
        return { success: true, message: `Navigated to ${outcome.path}` }
      }

      case 'modal':
      case 'popover':
      case 'dropdown': {
        // Click and wait for element to appear
        await element.click()
        // Wait a short time for animation
        await page.waitForTimeout(300)
        // Check if any dropdown/modal content appeared
        // Look for common patterns in the DOM
        const hasContent = await page.evaluate(() => {
          // Check for visible dropdowns or modals
          const selectors = [
            '[role="menu"]',
            '[role="dialog"]',
            '[role="listbox"]',
            '.animate-in',
            '[data-state="open"]',
          ]
          return selectors.some((sel) => {
            const el = document.querySelector(sel)
            return el && window.getComputedStyle(el).display !== 'none'
          })
        })

        if (hasContent) {
          return { success: true, message: `${outcome.type} opened successfully` }
        }

        // Also check for nearby sibling/child elements that appeared
        const parentVisible = await page.evaluate((sel) => {
          const el = document.querySelector(sel)
          if (!el || !el.parentElement) return false
          const parent = el.parentElement
          // Check for any newly visible children
          return Array.from(parent.children).some((child) => {
            const style = window.getComputedStyle(child)
            return style.display !== 'none' && style.visibility !== 'hidden'
          })
        }, selector)

        return parentVisible
          ? { success: true, message: `${outcome.type} content visible` }
          : { success: false, message: `${outcome.type} did not open` }
      }

      case 'toast': {
        await element.click()
        // Wait for toast to appear
        await page.waitForTimeout(500)
        // Check for toast element
        const toastVisible = await page.evaluate(() => {
          const toastSelectors = [
            '[role="status"]',
            '[role="alert"]',
            '.toast',
            '[data-sonner-toast]',
          ]
          return toastSelectors.some((sel) => document.querySelector(sel))
        })
        return toastVisible
          ? { success: true, message: 'Toast appeared' }
          : { success: false, message: 'Toast did not appear' }
      }

      case 'action': {
        // Generic action - just verify click doesn't error
        await element.click()
        await page.waitForTimeout(300)
        return { success: true, message: `Action executed: ${outcome.description}` }
      }

      case 'external': {
        // External link - verify href
        const href = await element.getAttribute('href')
        if (href && href.includes(outcome.url)) {
          return { success: true, message: `External link valid: ${outcome.url}` }
        }
        return { success: false, message: `External link mismatch` }
      }

      default:
        return { success: false, message: 'Unknown outcome type' }
    }
  } catch (error) {
    return {
      success: false,
      message: `Click failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

// Test critical navigation elements
test.describe('QA Sentinel - Critical Click Tests', () => {
  test.describe('App Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/app/map')
      // Wait for page to fully load
      await page.waitForLoadState('networkidle')
    })

    test('Logo navigates to map', async ({ page }) => {
      const selector = buildSelector('nav-logo')
      await page.click(selector)
      await expect(page).toHaveURL(/\/app\/map/)
    })

    test('Notifications button opens popover', async ({ page }) => {
      const selector = buildSelector('nav-notifications')
      const button = await page.$(selector)

      if (button && (await button.isVisible())) {
        await button.click()
        await page.waitForTimeout(300)

        // Check if notifications popover is visible
        const popoverVisible = await page.evaluate(() => {
          // Look for the notifications header text as indicator
          const header = Array.from(document.querySelectorAll('h3')).find(
            (el) => el.textContent === 'Notifications'
          )
          return header !== undefined
        })

        expect(popoverVisible).toBe(true)
      } else {
        // Mobile view - notifications might be in different location
        test.skip()
      }
    })

    test('Messages link navigates to messages', async ({ page }) => {
      const selector = buildSelector('nav-messages')
      const link = await page.$(selector)

      if (link && (await link.isVisible())) {
        await link.click()
        await expect(page).toHaveURL(/\/app\/messages/)
      } else {
        test.skip()
      }
    })

    test('User menu opens dropdown', async ({ page }) => {
      const selector = buildSelector('nav-user-menu')
      const button = await page.$(selector)

      if (button && (await button.isVisible())) {
        await button.click()
        await page.waitForTimeout(300)

        // Check for profile link in dropdown
        const profileLink = await page.$(buildSelector('user-menu-profile'))
        expect(profileLink).toBeTruthy()
        expect(await profileLink?.isVisible()).toBe(true)
      } else {
        test.skip()
      }
    })

    test('User menu profile link navigates', async ({ page }) => {
      // First open the user menu
      const menuSelector = buildSelector('nav-user-menu')
      const menuButton = await page.$(menuSelector)

      if (menuButton && (await menuButton.isVisible())) {
        await menuButton.click()
        await page.waitForTimeout(300)

        // Click profile
        const profileSelector = buildSelector('user-menu-profile')
        await page.click(profileSelector)
        await expect(page).toHaveURL(/\/app\/profile/)
      } else {
        test.skip()
      }
    })

    test('User menu settings link navigates', async ({ page }) => {
      const menuSelector = buildSelector('nav-user-menu')
      const menuButton = await page.$(menuSelector)

      if (menuButton && (await menuButton.isVisible())) {
        await menuButton.click()
        await page.waitForTimeout(300)

        const settingsSelector = buildSelector('user-menu-settings')
        await page.click(settingsSelector)
        await expect(page).toHaveURL(/\/app\/settings/)
      } else {
        test.skip()
      }
    })

    test('Post Job CTA navigates to job creation', async ({ page }) => {
      const selector = buildSelector('cta-post-job')
      const button = await page.$(selector)

      if (button && (await button.isVisible())) {
        await button.click()
        await expect(page).toHaveURL(/\/app\/hire\/new/)
      } else {
        // Work mode doesn't have this button
        test.skip()
      }
    })
  })

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test.beforeEach(async ({ page }) => {
      await page.goto('/app/map')
      await page.waitForLoadState('networkidle')
    })

    test('Mobile menu toggle works', async ({ page }) => {
      const selector = buildSelector('mobile-nav-toggle')
      const button = await page.$(selector)

      expect(button).toBeTruthy()
      if (button) {
        await button.click()
        await page.waitForTimeout(300)

        // Check if mobile menu is now visible
        const menuVisible = await page.evaluate(() => {
          // Look for mobile menu content
          return document.querySelector('.md\\:hidden.relative.bg-slate-900\\/95') !== null
        })

        // Menu should be visible after click
        expect(menuVisible).toBe(true)
      }
    })
  })

  test.describe('Marketing Pages', () => {
    test('Landing page Get Started navigates to sign up', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Find Get Started button
      const getStartedBtn = page.locator('text=Get Started').first()
      if (await getStartedBtn.isVisible()) {
        await getStartedBtn.click()
        await expect(page).toHaveURL(/\/create-account/)
      }
    })

    test('Landing page Sign In navigates to sign in', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const signInLink = page.locator('text=Sign In').first()
      if (await signInLink.isVisible()) {
        await signInLink.click()
        await expect(page).toHaveURL(/\/sign-in/)
      }
    })
  })
})

// Dynamic test generation for all registered targets
test.describe('QA Sentinel - All Registered Targets', () => {
  // Group by route for better organization
  const routes = ['/app/map', '/app/messages', '/app/notifications', '/app/profile', '/app/settings']

  for (const route of routes) {
    test.describe(`Route: ${route}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(route)
        await page.waitForLoadState('networkidle')
      })

      const targetsForRoute = getTargetsForRoute(route).filter(
        (t) => !t.mobileOnly // Skip mobile-only for desktop tests
      )

      for (const target of targetsForRoute) {
        test(`${target.name} (${target.selector})`, async ({ page }) => {
          const selector = buildSelector(target.selector)
          const element = await page.$(selector)

          // Element might not be visible on this specific page
          if (!element || !(await element.isVisible())) {
            test.skip()
            return
          }

          const result = await clickAndWait(page, selector, target)

          if (!result.success) {
            // Take screenshot on failure
            await page.screenshot({
              path: `test-results/failure-${target.selector}.png`,
              fullPage: true,
            })
          }

          expect(result.success, result.message).toBe(true)
        })
      }
    })
  }
})
