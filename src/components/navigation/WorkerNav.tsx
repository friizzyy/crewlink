'use client'

/**
 * @deprecated This component is deprecated. Use UniversalNav with routePrefix="/work" instead.
 *
 * Migration guide:
 * Before: <WorkerNav />
 * After:  <UniversalNav variant="app" mode="work" routePrefix="/work" />
 *
 * This file is kept as a thin wrapper for backwards compatibility.
 * TODO: Remove this file once all usages are migrated.
 */

import { UniversalNav } from '@/components/UniversalNav'

export function WorkerNav() {
  console.warn(
    '[DEPRECATED] WorkerNav is deprecated. Use UniversalNav with routePrefix="/work" instead.'
  )
  return <UniversalNav variant="app" mode="work" routePrefix="/work" />
}
