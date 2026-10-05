'use client'

import React from 'react'

export type AdPlacement =
  | 'tool-bottom'
  | 'tool-result'
  | 'category-top'
  | 'category-bottom'
  | 'game-sidebar'
  | 'home-hero'
  | 'home-mid'
  | 'home-bottom'
  | string

interface AdSlotProps {
  placement?: AdPlacement
  format?: 'banner' | 'rectangle' | 'leaderboard' | 'horizontal'
  className?: string
  slotId?: string
}

export default function AdSlot({
  placement,
  format = 'banner',
  className = '',
  slotId = 'default-ad-slot',
}: AdSlotProps) {
  // Ads are disabled by default unless explicitly enabled via environment variable
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true'

  if (!adsEnabled) {
    return null
  }

  const formatStyles: Record<string, string> = {
    banner: 'min-h-[90px] max-w-[728px]',
    horizontal: 'min-h-[90px] max-w-[728px]',
    rectangle: 'min-h-[250px] max-w-[300px]',
    leaderboard: 'min-h-[90px] max-w-[970px]',
  }

  const activePlacement = placement || slotId

  return (
    <aside
      aria-label="Sponsor Advertisement"
      data-placement={activePlacement}
      data-slot-id={slotId}
      className={`mx-auto my-8 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-[rgba(99,102,241,0.12)] bg-[#0B0F19]/60 p-4 text-center ${formatStyles[format] || ''} ${className}`}
    >
      <div className="mb-2 text-[10px] uppercase tracking-wider text-[#475569]">
        Advertisement / 赞助商广告
      </div>
      <div className="flex w-full flex-1 items-center justify-center rounded-lg border border-dashed border-[rgba(99,102,241,0.15)] bg-[#070A12]/40 py-6 text-xs text-[#64748B]">
        <span>广告位 ({activePlacement})</span>
      </div>
    </aside>
  )
}
