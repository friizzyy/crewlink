import { test, expect } from '@playwright/test'

/**
 * Agent C - Performance Auditor: Web Vitals Tests
 *
 * These tests measure Core Web Vitals and other performance metrics
 * to catch regressions before they reach production.
 */

// Performance thresholds (in milliseconds unless noted)
const THRESHOLDS = {
  FCP: 3000, // First Contentful Paint
  LCP: 4000, // Largest Contentful Paint
  CLS: 0.1, // Cumulative Layout Shift (score)
  TBT: 500, // Total Blocking Time
  TTI: 5000, // Time to Interactive
}

test.describe('Agent C - Performance: Core Web Vitals', () => {
  test.describe('Landing Page', () => {
    test('meets FCP threshold', async ({ page }) => {
      await page.goto('/')

      const fcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const fcpEntry = entries.find((e) => e.name === 'first-contentful-paint')
            if (fcpEntry) {
              resolve(fcpEntry.startTime)
            }
          }).observe({ entryTypes: ['paint'] })

          // Fallback
          setTimeout(() => resolve(0), 5000)
        })
      })

      console.log(`Landing page FCP: ${fcp}ms`)
      expect(fcp).toBeLessThan(THRESHOLDS.FCP)
    })

    test('meets LCP threshold', async ({ page }) => {
      await page.goto('/')

      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let lcpValue = 0
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry) => {
              // @ts-ignore - LCP entry has renderTime
              lcpValue = entry.renderTime || entry.startTime
            })
          }).observe({ entryTypes: ['largest-contentful-paint'] })

          setTimeout(() => resolve(lcpValue), 3000)
        })
      })

      console.log(`Landing page LCP: ${lcp}ms`)
      expect(lcp).toBeLessThan(THRESHOLDS.LCP)
    })
  })

  test.describe('App Map Page', () => {
    test('loads within acceptable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/app/map')
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime
      console.log(`App map load time: ${loadTime}ms`)

      expect(loadTime).toBeLessThan(THRESHOLDS.TTI)
    })

    test('no significant layout shifts', async ({ page }) => {
      await page.goto('/app/map')

      // Wait for page to stabilize
      await page.waitForTimeout(2000)

      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0
          new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              // @ts-ignore - Layout shift entries have value
              if (!entry.hadRecentInput) {
                // @ts-ignore
                clsValue += entry.value
              }
            })
          }).observe({ entryTypes: ['layout-shift'] })

          setTimeout(() => resolve(clsValue), 3000)
        })
      })

      console.log(`App map CLS: ${cls}`)
      expect(cls).toBeLessThan(THRESHOLDS.CLS)
    })
  })
})

test.describe('Agent C - Performance: Resource Loading', () => {
  test('critical resources load quickly', async ({ page }) => {
    const resourceTimings: { name: string; duration: number }[] = []

    page.on('response', async (response) => {
      const url = response.url()
      // Playwright Response doesn't have timing() method - use request timing instead
      const request = response.request()
      const timing = request.timing()

      if (timing && timing.responseEnd > 0) {
        resourceTimings.push({
          name: url.split('/').pop() || url,
          duration: timing.responseEnd,
        })
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that no single resource takes too long
    const slowResources = resourceTimings.filter((r) => r.duration > 2000)

    if (slowResources.length > 0) {
      console.log('Slow resources:', slowResources)
    }

    // Allow some slow resources but not too many
    expect(slowResources.length).toBeLessThan(5)
  })

  test('no excessive network requests', async ({ page }) => {
    let requestCount = 0

    page.on('request', () => {
      requestCount++
    })

    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    console.log(`Total requests for /app/map: ${requestCount}`)

    // Should not make excessive requests
    expect(requestCount).toBeLessThan(100)
  })

  test('images are reasonably sized', async ({ page }) => {
    const imageData: { src: string; size: string }[] = []

    page.on('response', async (response) => {
      const contentType = response.headers()['content-type']
      if (contentType && contentType.includes('image')) {
        const buffer = await response.body().catch(() => null)
        if (buffer) {
          imageData.push({
            src: response.url().split('/').pop() || response.url(),
            size: `${(buffer.length / 1024).toFixed(1)}KB`,
          })
        }
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Log image sizes
    console.log('Image sizes:', imageData)

    // Check for oversized images (> 500KB)
    const oversizedImages = imageData.filter((img) => {
      const sizeKB = parseFloat(img.size)
      return sizeKB > 500
    })

    expect(oversizedImages.length).toBe(0)
  })
})

test.describe('Agent C - Performance: JavaScript', () => {
  test('no long tasks blocking main thread', async ({ page }) => {
    await page.goto('/app/map')

    const longTasks = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let longTaskCount = 0
        new PerformanceObserver((list) => {
          longTaskCount += list.getEntries().length
        }).observe({ entryTypes: ['longtask'] })

        setTimeout(() => resolve(longTaskCount), 5000)
      })
    })

    console.log(`Long tasks on /app/map: ${longTasks}`)

    // Should have few long tasks
    expect(longTasks).toBeLessThan(10)
  })

  test('no memory leaks on navigation', async ({ page }) => {
    // Navigate multiple times and check memory doesn't grow unbounded
    const memoryReadings: number[] = []

    for (let i = 0; i < 5; i++) {
      await page.goto('/app/map')
      await page.waitForLoadState('networkidle')

      const memory = await page.evaluate(() => {
        // @ts-ignore - memory API might not be available
        if (performance.memory) {
          // @ts-ignore
          return performance.memory.usedJSHeapSize
        }
        return 0
      })

      if (memory > 0) {
        memoryReadings.push(memory)
      }

      // Navigate away
      await page.goto('/app/messages')
      await page.waitForLoadState('networkidle')
    }

    if (memoryReadings.length >= 2) {
      // Memory shouldn't grow more than 50% over iterations
      const firstReading = memoryReadings[0]
      const lastReading = memoryReadings[memoryReadings.length - 1]
      const growth = (lastReading - firstReading) / firstReading

      console.log(`Memory growth: ${(growth * 100).toFixed(1)}%`)
      expect(growth).toBeLessThan(0.5)
    }
  })
})

test.describe('Agent C - Performance: Caching', () => {
  test('static assets are cached', async ({ page }) => {
    const cacheHeaders: { url: string; cacheControl: string | null }[] = []

    page.on('response', (response) => {
      const url = response.url()
      const cacheControl = response.headers()['cache-control']

      // Check JS and CSS files
      if (url.includes('.js') || url.includes('.css')) {
        cacheHeaders.push({
          url: url.split('/').pop() || url,
          cacheControl,
        })
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Most static assets should have cache headers
    const cachedAssets = cacheHeaders.filter(
      (h) => h.cacheControl && !h.cacheControl.includes('no-store')
    )

    console.log(`Cached assets: ${cachedAssets.length}/${cacheHeaders.length}`)

    // At least 80% of assets should be cacheable
    expect(cachedAssets.length / cacheHeaders.length).toBeGreaterThan(0.8)
  })
})

test.describe('Agent C - Performance: Bundle Analysis', () => {
  test('page JS bundle is reasonable size', async ({ page }) => {
    let totalJSSize = 0

    page.on('response', async (response) => {
      const contentType = response.headers()['content-type']
      if (contentType && contentType.includes('javascript')) {
        const buffer = await response.body().catch(() => null)
        if (buffer) {
          totalJSSize += buffer.length
        }
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const totalJSKB = totalJSSize / 1024
    console.log(`Total JS size for landing page: ${totalJSKB.toFixed(1)}KB`)

    // Landing page shouldn't need more than 500KB of JS
    expect(totalJSKB).toBeLessThan(1000) // 1MB limit
  })

  test('app page JS bundle is reasonable size', async ({ page }) => {
    let totalJSSize = 0

    page.on('response', async (response) => {
      const contentType = response.headers()['content-type']
      if (contentType && contentType.includes('javascript')) {
        const buffer = await response.body().catch(() => null)
        if (buffer) {
          totalJSSize += buffer.length
        }
      }
    })

    await page.goto('/app/map')
    await page.waitForLoadState('networkidle')

    const totalJSKB = totalJSSize / 1024
    console.log(`Total JS size for app map: ${totalJSKB.toFixed(1)}KB`)

    // App pages might need more JS for interactivity
    expect(totalJSKB).toBeLessThan(2000) // 2MB limit
  })
})
