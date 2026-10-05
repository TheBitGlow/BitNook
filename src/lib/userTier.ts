export type UserTier = 'free' | 'pro'

export interface UserSubscription {
  tier: UserTier
  isActive: boolean
  expiresAt?: string
}

export function getUserTier(): UserSubscription {
  if (typeof window === 'undefined') {
    return { tier: 'free', isActive: false }
  }
  const saved = localStorage.getItem('bitnook-tier')
  if (saved === 'pro') {
    return { tier: 'pro', isActive: true }
  }
  return { tier: 'free', isActive: false }
}

export function isProFeature(toolSlug: string): boolean {
  // All core tools are free. Future bulk processing or heavy cloud jobs can be gated.
  const proGatedTools: string[] = []
  return proGatedTools.includes(toolSlug)
}
