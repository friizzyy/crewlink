import { UniversalNav } from '@/components/UniversalNav'

// ============================================
// PUBLIC HEADER
// Now uses UniversalNav to ensure EXACT match with landing page
// ============================================

export function PublicHeader() {
  // Simply render the UniversalNav with marketing variant
  // This ensures ALL marketing pages have the EXACT same header as landing page
  return <UniversalNav variant="marketing" />
}

export default PublicHeader
