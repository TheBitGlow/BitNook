'use client'

import React from 'react'
import { ADS_CONFIG } from '@/config/ads'
import { useConsentStatus } from '@/lib/useConsent'

export type AdPlacement =
  | 'tool-bottom'
  | 'tool-docs-inline'
  | 'category-bottom'
  | 'footer-banner'
  | string

interface AdSlotProps {
  placement?: AdPlacement
  format?: 'banner' | 'rectangle' | 'leaderboard' | 'horizontal' | 'mobile'
  className?: string
  slotId?: string
}

export default function AdSlot({
  placement = 'tool-bottom',
  format = 'horizontal',
  className = '',
  slotId = 'default-ad-slot',
}: AdSlotProps) {
  const consentGranted = useConsentStatus()

  // If ads are disabled in config, or no client configured, render nothing
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.clientId) {
    return null
  }

  // Under strict privacy mode, require user consent before rendering ad tags
  if (!consentGranted) {
    return null
  }

  const formatStyles: Record<string, string> = {
    horizontal: 'min-h-[90px] max-w-[728px]',
    banner: 'min-h-[90px] max-w-[728px]',
    rectangle: 'min-h-[250px] max-w-[300px]',
    mobile: 'min-h-[50px] max-w-[320px]',
    leaderboard: 'min-h-[90px] max-w-[970px]',
  }

  const activePlacement = placement || slotId

  return (
    <aside
      aria-label="Sponsor Advertisement"
      data-placement={activePlacement}
      data-slot-id={slotId}
      className={`mx-auto my-8 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-surface p-4 text-center shadow-subtle ${formatStyles[format] || ''} ${className}`}
    >
      <div className="mb-2 text-[10px] uppercase tracking-wider text-text-muted font-medium">
        Advertisement / 赞助商内容
      </div>
      
      {/* Real Google AdSense Tag Wrapper */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADS_CONFIG.clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
