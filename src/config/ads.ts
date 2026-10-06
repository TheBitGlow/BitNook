/**
 * BitNook Monetization & AdSense Architecture Configuration
 * 
 * Rules & Policy Interlock:
 * 1. ADS_ENABLED defaults to false unless explicitly activated via NEXT_PUBLIC_ADS_ENABLED='true'.
 * 2. Non-intrusive placement: Only below results, inside docs, and in category/footer zones.
 * 3. Never display ads inside game boards, interactive canvas, search inputs, or calculation forms.
 * 4. Zero layout shift (CLS = 0) with strictly reserved bounding containers.
 * 5. GDPR / UK / Swiss / US privacy consent gate interlocked before ad scripts load.
 */

export interface AdPlacementConfig {
  id: string
  name: string
  format: 'banner' | 'rectangle' | 'horizontal' | 'mobile' | 'responsive'
  minHeight: number
  maxWidth: number
  description: string
  allowedRoutes: string[]
}

export const ADS_CONFIG = {
  // Enabled switch: strictly defaults to false unless explicitly enabled in environment
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',

  // Google AdSense Publisher Account ID (Format: ca-pub-XXXXXXXXXXXXXXXX)
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '',

  // Optional site verification token for Google AdSense <meta name="google-adsense-account" content="..." />
  verificationMeta: process.env.NEXT_PUBLIC_ADSENSE_VERIFICATION || '',

  // Storage key for GDPR / CPRA Consent state
  consentStorageKey: 'bitnook_consent_status_v1',

  // Standard Compliant Placements
  placements: {
    'tool-bottom': {
      id: 'tool-bottom',
      name: 'Tool Bottom Sponsor',
      format: 'horizontal',
      minHeight: 90,
      maxWidth: 728,
      description: 'Placed below tool results and calculation tables, above informative documentation.',
      allowedRoutes: ['/tools/*'],
    },
    'tool-docs-inline': {
      id: 'tool-docs-inline',
      name: 'Tool Documentation Subtle',
      format: 'rectangle',
      minHeight: 250,
      maxWidth: 300,
      description: 'Placed inside long technical explanatory documentation or reference guides.',
      allowedRoutes: ['/tools/*'],
    },
    'category-bottom': {
      id: 'category-bottom',
      name: 'Category Directory Footer',
      format: 'horizontal',
      minHeight: 90,
      maxWidth: 728,
      description: 'Placed at the bottom of category tool directories.',
      allowedRoutes: ['/tools', '/tools/category/*'],
    },
    'footer-banner': {
      id: 'footer-banner',
      name: 'Global Pre-Footer Banner',
      format: 'horizontal',
      minHeight: 90,
      maxWidth: 970,
      description: 'Subtle sponsorship slot resting just above the site footer.',
      allowedRoutes: ['/*'],
    },
  } as Record<string, AdPlacementConfig>,

  // Policy-Restricted Routes & Zones: Ads are strictly blocked here
  prohibitedZones: [
    '/tools/dev/regex', // High-density interactive editors
    '/games', // All game directories
    '/games/*', // All 8 interactive game boards
    'search-input', // Search interface
    'hero-section', // Top brand landing hero
  ],
}

/**
 * Checks whether ads should be displayed for a given placement and environment state
 */
export function isAdEnabledForPlacement(placementId: string): boolean {
  if (!ADS_CONFIG.enabled) return false
  if (!ADS_CONFIG.clientId) return false
  return Boolean(ADS_CONFIG.placements[placementId])
}
