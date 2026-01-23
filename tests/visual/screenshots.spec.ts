import { test, expect } from '@playwright/test'

/**
 * Agent B - UI Consistency Enforcer: Visual Regression Tests
 *
 * These tests capture screenshots of key screens and compare them
 * against baseline images to detect unintended visual changes.
 *
 * To update baselines: npm run test:visual -- --update-snapshots
 */

// Key screens to capture
const screenshotTargets = [
  { name: 'landing-hero', route: '/', waitFor: 'networkidle' },
  { name: 'app-map', route: '/app/map', waitFor: 'networkidle' },
  { name: 'app-messages', route: '/app/messages', waitFor: 'networkidle' },
  { name: 'app-notifications', route: '/app/notifications', waitFor: 'networkidle' },
  { name: 'app-profile', route: '/app/profile', waitFor: 'networkidle' },
  { name: 'app-settings', route: '/app/settings', waitFor: 'networkidle' },
  { name: 'sign-in', route: '/sign-in', waitFor: 'networkidle' },
  { name: 'create-account', route: '/create-account', waitFor: 'networkidle' },
]

test.describe('Agent B - Visual Regression: Full Page Screenshots', () => {
  // Desktop viewport
  test.describe('Desktop', () => {
    test.use({ viewport: { width: 1280, height: 720 } })

    for (const target of screenshotTargets) {
      test(`${target.name} matches baseline`, async ({ page }) => {
        await page.goto(target.route)
        await page.waitForLoadState(target.waitFor as 'networkidle' | 'load' | 'domcontentloaded')

        // Wait for animations to settle
        await page.waitForTimeout(500)

        // Hide dynamic content that changes between runs
        await page.evaluate(() => {
          // Hide timestamps
          document.querySelectorAll('[data-testid="timestamp"]').forEach((el) => {
            ;(el as HTMLElement).style.visibility = 'hidden'
          })
          // Hide any loading spinners
          document.querySelectorAll('.animate-spin').forEach((el) => {
            ;(el as HTMLElement).style.visibility = 'hidden'
          })
        })

        await expect(page).toHaveScreenshot(`desktop-${target.name}.png`, {
          fullPage: true,
          maxDiffPixels: 100,
        })
      })
    }
  })

  // Mobile viewport
  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    const mobileTargets = screenshotTargets.filter(
      (t) => !['app-map'].includes(t.name) // Skip map on mobile due to complexity
    )

    for (const target of mobileTargets) {
      test(`${target.name} matches baseline`, async ({ page }) => {
        await page.goto(target.route)
        await page.waitForLoadState(target.waitFor as 'networkidle' | 'load' | 'domcontentloaded')
        await page.waitForTimeout(500)

        await expect(page).toHaveScreenshot(`mobile-${target.name}.png`, {
          fullPage: true,
          maxDiffPixels: 150, // Slightly more tolerance for mobile
        })
      })
    }
  })
})

test.describe('Agent B - Visual Regression: Component Screenshots', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Navbar component matches baseline', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(300)

    const navbar = page.locator('header').first()
    await expect(navbar).toHaveScreenshot('component-navbar.png', {
      maxDiffPixels: 50,
    })
  })

  test('Notifications popover matches baseline', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    // Open notifications
    await page.click('[data-qa="nav-notifications"]')
    await page.waitForTimeout(300)

    // Capture the popover area
    const popover = page.locator('.absolute.right-0.mt-2.w-80').first()
    if (await popover.isVisible()) {
      await expect(popover).toHaveScreenshot('component-notifications-popover.png', {
        maxDiffPixels: 50,
      })
    }
  })

  test('User menu dropdown matches baseline', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    // Open user menu
    await page.click('[data-qa="nav-user-menu"]')
    await page.waitForTimeout(300)

    // Capture the dropdown
    const dropdown = page.locator('.absolute.right-0.mt-2.w-56').first()
    if (await dropdown.isVisible()) {
      await expect(dropdown).toHaveScreenshot('component-user-menu.png', {
        maxDiffPixels: 50,
      })
    }
  })
})

test.describe('Agent B - Visual Regression: Interactive States', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Button hover states', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    // Hover over Post Job button
    const postJobBtn = page.locator('[data-qa="cta-post-job"]')
    if (await postJobBtn.isVisible()) {
      await postJobBtn.hover()
      await page.waitForTimeout(200)
      await expect(postJobBtn).toHaveScreenshot('state-button-hover.png', {
        maxDiffPixels: 30,
      })
    }
  })

  test('Navigation active states', async ({ page }) => {
    // Test messages active state
    await page.goto('/app/messages')
    await page.waitForLoadState('networkidle')

    const messagesLink = page.locator('[data-qa="nav-messages"]')
    if (await messagesLink.isVisible()) {
      await expect(messagesLink).toHaveScreenshot('state-nav-active.png', {
        maxDiffPixels: 20,
      })
    }
  })
})

test.describe('Agent B - Visual Regression: Dark Theme Consistency', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Background colors are consistent across pages', async ({ page }) => {
    const routes = ['/app/map', '/app/messages', '/app/settings', '/app/profile']

    for (const route of routes) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      // Get background color of body
      const bgColor = await page.evaluate(() => {
        const body = document.body
        return window.getComputedStyle(body).backgroundColor
      })

      // Should be slate-950 or very close
      // slate-950 is rgb(2, 6, 23)
      expect(bgColor).toMatch(/rgb\(2,\s*6,\s*23\)|rgba\(2,\s*6,\s*23/)
    }
  })

  test('No unexpected white backgrounds', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    // Check for any elements with white or very light backgrounds
    const lightBgs = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      const lightElements: string[] = []

      elements.forEach((el) => {
        const bg = window.getComputedStyle(el).backgroundColor
        // Parse RGB values
        const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (match) {
          const [, r, g, b] = match.map(Number)
          // If all values are > 200, it's a very light color
          if (r > 200 && g > 200 && b > 200) {
            const tagName = el.tagName.toLowerCase()
            const className = el.className
            // Ignore known white elements (like text inputs when focused)
            if (!className.includes('placeholder') && tagName !== 'input') {
              lightElements.push(`${tagName}.${className}`)
            }
          }
        }
      })

      return lightElements.slice(0, 10) // Return first 10
    })

    // There shouldn't be many unexpected light backgrounds
    expect(lightBgs.length).toBeLessThan(5)
  })
})
