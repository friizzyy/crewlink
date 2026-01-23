import { test, expect } from '@playwright/test'

/**
 * Agent B - UI Consistency Enforcer: Theme Consistency Tests
 *
 * These tests verify that UI elements follow the design system tokens
 * and maintain visual consistency across the application.
 */

test.describe('Agent B - Theme Consistency: Color Tokens', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Primary accent color is consistent', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    // Find elements with cyan accent
    const cyanElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      const cyanColors = new Set<string>()

      elements.forEach((el) => {
        const styles = window.getComputedStyle(el)
        const colors = [styles.color, styles.backgroundColor, styles.borderColor]

        colors.forEach((color) => {
          // Check for cyan-ish colors (around rgb(6, 182, 212))
          const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
          if (match) {
            const [, r, g, b] = match.map(Number)
            // Cyan range: r < 50, g 150-220, b 180-230
            if (r < 100 && g > 150 && g < 230 && b > 180 && b < 240) {
              cyanColors.add(color)
            }
          }
        })
      })

      return Array.from(cyanColors)
    })

    // Should have consistent cyan colors (not many variations)
    expect(cyanElements.length).toBeLessThan(5)
  })

  test('No random gray colors', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    const grayAnalysis = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      const grayColors = new Map<string, number>()

      elements.forEach((el) => {
        const styles = window.getComputedStyle(el)
        const colors = [styles.color, styles.backgroundColor]

        colors.forEach((color) => {
          const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
          if (match) {
            const [, r, g, b] = match.map(Number)
            // Check if it's a gray (r, g, b are close to each other)
            const avg = (r + g + b) / 3
            const variance = Math.abs(r - avg) + Math.abs(g - avg) + Math.abs(b - avg)
            if (variance < 30 && avg > 20 && avg < 200) {
              const count = grayColors.get(color) || 0
              grayColors.set(color, count + 1)
            }
          }
        })
      })

      return Object.fromEntries(grayColors)
    })

    // Should use slate palette consistently
    const grayCount = Object.keys(grayAnalysis).length
    expect(grayCount).toBeLessThan(15) // Allow some variation but not too many
  })
})

test.describe('Agent B - Theme Consistency: Typography', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Font family is Inter', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    const fontFamilies = await page.evaluate(() => {
      const elements = document.querySelectorAll('body, h1, h2, h3, p, span, a, button')
      const families = new Set<string>()

      elements.forEach((el) => {
        const fontFamily = window.getComputedStyle(el).fontFamily
        families.add(fontFamily.split(',')[0].trim().replace(/"/g, ''))
      })

      return Array.from(families)
    })

    // Primary font should be Inter or system fonts
    const validFonts = ['Inter', 'var(--font-inter)', 'system-ui', '-apple-system']
    const hasValidFont = fontFamilies.some((f) =>
      validFonts.some((vf) => f.toLowerCase().includes(vf.toLowerCase()))
    )
    expect(hasValidFont).toBe(true)
  })

  test('No arbitrary font sizes', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    const fontSizes = await page.evaluate(() => {
      const elements = document.querySelectorAll('body *')
      const sizes = new Map<string, number>()

      elements.forEach((el) => {
        const fontSize = window.getComputedStyle(el).fontSize
        const count = sizes.get(fontSize) || 0
        sizes.set(fontSize, count + 1)
      })

      return Object.fromEntries(sizes)
    })

    // Tailwind font sizes: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96px
    const validSizes = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96]
    const sizesUsed = Object.keys(fontSizes).map((s) => parseFloat(s))

    // Most sizes should be from the standard scale
    const nonStandardSizes = sizesUsed.filter(
      (size) => !validSizes.includes(size) && Math.abs(size - Math.round(size)) < 0.01
    )

    // Allow some variation but flag if too many non-standard sizes
    expect(nonStandardSizes.length).toBeLessThan(5)
  })
})

test.describe('Agent B - Theme Consistency: Border Radius', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Border radius follows design system', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    const borderRadii = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      const radii = new Map<string, number>()

      elements.forEach((el) => {
        const br = window.getComputedStyle(el).borderRadius
        if (br && br !== '0px') {
          const count = radii.get(br) || 0
          radii.set(br, count + 1)
        }
      })

      return Object.fromEntries(radii)
    })

    // Valid border-radius values from Tailwind
    // rounded-sm: 2px, rounded: 4px, rounded-md: 6px, rounded-lg: 8px
    // rounded-xl: 12px, rounded-2xl: 16px, rounded-3xl: 24px, rounded-full: 9999px
    const validRadii = [2, 4, 6, 8, 12, 16, 24, 9999]

    const radiiUsed = Object.keys(borderRadii).map((r) => {
      const match = r.match(/(\d+)px/)
      return match ? parseInt(match[1]) : 0
    })

    // Most radii should be from standard scale
    const nonStandardRadii = radiiUsed.filter(
      (r) => r > 0 && !validRadii.includes(r) && r !== 9999
    )

    expect(nonStandardRadii.length).toBeLessThan(5)
  })
})

test.describe('Agent B - Theme Consistency: Icons', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Icon sizes are consistent', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    const iconSizes = await page.evaluate(() => {
      // Lucide icons are SVGs
      const svgs = document.querySelectorAll('svg')
      const sizes = new Map<string, number>()

      svgs.forEach((svg) => {
        const width = svg.getAttribute('width') || window.getComputedStyle(svg).width
        const height = svg.getAttribute('height') || window.getComputedStyle(svg).height
        const size = `${width}x${height}`
        const count = sizes.get(size) || 0
        sizes.set(size, count + 1)
      })

      return Object.fromEntries(sizes)
    })

    // Valid icon sizes: 12, 16, 20, 24, 32, 40, 48px
    const validSizes = ['12px', '16px', '20px', '24px', '32px', '40px', '48px']

    const sizeKeys = Object.keys(iconSizes)
    const invalidSizes = sizeKeys.filter((size) => {
      const [w, h] = size.split('x')
      return !validSizes.includes(w) || !validSizes.includes(h)
    })

    // Allow some variation (decorative elements may have different sizes)
    expect(invalidSizes.length).toBeLessThan(sizeKeys.length * 0.3) // Less than 30% invalid
  })

  test('Chevron icons are consistent direction', async ({ page }) => {
    await page.goto('/app/settings')
    await page.waitForLoadState('networkidle')

    // Check that all list chevrons point the same direction
    const chevronDirections = await page.evaluate(() => {
      const chevrons = document.querySelectorAll('[class*="chevron"], [data-lucide*="chevron"]')
      const directions = new Set<string>()

      chevrons.forEach((el) => {
        // Check the class or data attribute for direction hints
        const className = el.className.toString()
        if (className.includes('right')) directions.add('right')
        if (className.includes('left')) directions.add('left')
        if (className.includes('up')) directions.add('up')
        if (className.includes('down')) directions.add('down')
      })

      return Array.from(directions)
    })

    // In a settings list, chevrons should be consistently right-pointing
    // This test just ensures we don't have random mixed directions
    expect(chevronDirections.length).toBeLessThan(3)
  })
})

test.describe('Agent B - Theme Consistency: Spacing', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Padding follows Tailwind scale', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    const paddings = await page.evaluate(() => {
      const elements = document.querySelectorAll('.p-1, .p-2, .p-3, .p-4, .p-5, .p-6, .p-8')
      return elements.length
    })

    // Should have elements using standard padding classes
    expect(paddings).toBeGreaterThan(0)
  })

  test('No arbitrary spacing values', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    // This is a heuristic check - look for inline styles with px values
    const inlineStyles = await page.evaluate(() => {
      const elements = document.querySelectorAll('[style*="margin"], [style*="padding"]')
      return elements.length
    })

    // Should have minimal inline margin/padding styles
    expect(inlineStyles).toBeLessThan(10)
  })
})

test.describe('Agent B - Theme Consistency: CTA Button Alignment', () => {
  // Test CTA alignment at different breakpoints
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
  ]

  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } })

      test('Landing page CTAs are properly aligned', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Find the hero CTA buttons
        const ctaHire = await page.$('[data-qa="cta-hire-help"]')
        const ctaWork = await page.$('[data-qa="cta-find-work"]')

        if (ctaHire && ctaWork) {
          const hireBox = await ctaHire.boundingBox()
          const workBox = await ctaWork.boundingBox()

          if (hireBox && workBox) {
            if (viewport.width >= 640) {
              // Desktop/tablet: CTAs should be horizontally aligned
              // They should be on the same row (similar Y position)
              const yDiff = Math.abs(hireBox.y - workBox.y)
              expect(yDiff).toBeLessThan(10)

              // They should have consistent spacing
              const gap = workBox.x - (hireBox.x + hireBox.width)
              expect(gap).toBeGreaterThan(0)
              expect(gap).toBeLessThan(32) // Max 32px gap
            } else {
              // Mobile: CTAs should be stacked vertically
              // Work button should be below hire button
              expect(workBox.y).toBeGreaterThan(hireBox.y + hireBox.height - 10)

              // Both should have same width and x position (full width)
              const xDiff = Math.abs(hireBox.x - workBox.x)
              expect(xDiff).toBeLessThan(5)
            }
          }
        }
      })

      test('CTA buttons have consistent height', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const buttons = await page.$$('[data-qa^="cta-"]')
        if (buttons.length >= 2) {
          const heights: number[] = []

          for (const btn of buttons) {
            const box = await btn.boundingBox()
            if (box) heights.push(box.height)
          }

          // All CTA buttons should have the same height
          const firstHeight = heights[0]
          for (const height of heights) {
            expect(Math.abs(height - firstHeight)).toBeLessThan(2)
          }
        }
      })

      test('CTA buttons are not clipped or overflowing', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const ctaButtons = await page.$$('[data-qa^="cta-"]')
        const viewportWidth = viewport.width
        const viewportHeight = viewport.height

        for (const btn of ctaButtons) {
          const box = await btn.boundingBox()
          if (box) {
            // Button should be fully within viewport
            expect(box.x).toBeGreaterThanOrEqual(0)
            expect(box.y).toBeGreaterThanOrEqual(0)
            expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth)
            expect(box.y + box.height).toBeLessThanOrEqual(viewportHeight + 500) // Allow some scroll
          }
        }
      })
    })
  }

  test('Pricing page CTA has proper spacing', async ({ page }) => {
    await page.goto('/pricing')
    await page.waitForLoadState('networkidle')

    // Check that Get Started buttons in pricing cards are aligned
    const ctaButtons = await page.$$('a:has-text("Get Started")')
    if (ctaButtons.length >= 2) {
      const positions: { y: number; height: number }[] = []

      for (const btn of ctaButtons) {
        const box = await btn.boundingBox()
        if (box) {
          positions.push({ y: box.y, height: box.height })
        }
      }

      // If buttons are visible and in a row, their Y positions should match
      const uniqueYs = Array.from(new Set(positions.map((p) => Math.round(p.y / 10) * 10)))

      // Should have at most 2 rows of CTAs (desktop vs mobile)
      expect(uniqueYs.length).toBeLessThanOrEqual(3)
    }
  })
})

test.describe('Agent B - Theme Consistency: Animations Preserved', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Ambient background animations exist', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    // Check for animated elements
    const hasAnimations = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      let animatedCount = 0

      elements.forEach((el) => {
        const styles = window.getComputedStyle(el)
        if (
          styles.animation !== 'none' ||
          styles.animationName !== 'none' ||
          el.className.toString().includes('animate-')
        ) {
          animatedCount++
        }
      })

      return animatedCount
    })

    // Should have some animated elements (ambient background, etc.)
    expect(hasAnimations).toBeGreaterThan(0)
  })

  test('Pulse animation on notification indicator', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    // Find the notification indicator
    const hasPulse = await page.evaluate(() => {
      const indicator = document.querySelector('[data-qa="nav-notifications"] span')
      if (!indicator) return false

      const className = indicator.className
      const styles = window.getComputedStyle(indicator)

      return className.includes('animate-pulse') || styles.animation.includes('pulse')
    })

    expect(hasPulse).toBe(true)
  })

  test('Transition classes are applied', async ({ page }) => {
    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    const transitionElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="transition"]')
      return elements.length
    })

    // Should have elements with transition classes for smooth interactions
    expect(transitionElements).toBeGreaterThan(10)
  })
})
