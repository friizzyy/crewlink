'use client'

/**
 * @deprecated This component is deprecated. Use UniversalNav with routePrefix="/hiring" instead.
 *
 * Migration guide:
 * Before: <HiringNav />
 * After:  <UniversalNav variant="app" mode="hire" routePrefix="/hiring" />
 *
 * This file is kept as a thin wrapper for backwards compatibility.
 * TODO: Remove this file once all usages are migrated.
 */

import { UniversalNav } from '@/components/UniversalNav'

export function HiringNav() {
  console.warn(
    '[DEPRECATED] HiringNav is deprecated. Use UniversalNav with routePrefix="/hiring" instead.'
  )
  return <UniversalNav variant="app" mode="hire" routePrefix="/hiring" />
}
