'use client'

import React from 'react'
import Link from 'next/link'
import { ToolRegistryItem } from '@/config/tools'
import { PrivacyBadge } from './PrivacyBadge'
import DynamicIcon from '@/components/common/DynamicIcon'
import { useI18n } from '@/lib/i18n'
import { useFavorites } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import { Star, ArrowRight } from 'lucide-react'

export interface ToolCardProps {
  tool: ToolRegistryItem
  className?: string
  index?: number
}

/**
 * Editorial Tool Tile: For Category Page, Related Tools, and My Workspace
 * High typography hierarchy: Name > Description > Category > Privacy
 */
export function ToolCard({ tool, className = '' }: ToolCardProps) {
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(tool.slug)

  const toolName = isZh ? tool.name : tool.nameEn
  const toolDesc = isZh ? tool.description : tool.descriptionEn

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(tool.slug)
    trackEvent('favorite', { toolSlug: tool.slug })
  }

  return (
    <Link
      href={tool.href}
      className={`group relative flex flex-col justify-between rounded-lg border border-border/80 bg-surface p-4 hover:border-border-hover hover:bg-surface-secondary/40 shadow-subtle transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      <div>
        {/* Header: Icon + Status Actions */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-md bg-surface-secondary/80 border border-border/60 flex items-center justify-center text-text-secondary group-hover:text-accent group-hover:bg-accent-subtle/50 transition-colors shrink-0">
            <DynamicIcon name={tool.icon} className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1.5">
            <PrivacyBadge mode={tool.privacyMode} variant="compact" />
            <button
              type="button"
              onClick={handleFavoriteClick}
              className={`p-1 rounded-md border transition-colors cursor-pointer ${
                favorite
                  ? 'border-amber-400/30 bg-amber-400/10 text-amber-500'
                  : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-secondary'
              }`}
              aria-label={favorite ? '取消收藏' : '添加收藏'}
              title={favorite ? '已收藏' : '收藏此工具'}
            >
              <Star className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* 1. Tool Name (Highest visual hierarchy) */}
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1 line-clamp-1">
          {toolName}
        </h3>

        {/* 2. Tool Description (Secondary tier) */}
        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
          {toolDesc}
        </p>
      </div>

      {/* Footer: Category tag (Weak) + Open prompt */}
      <div className="mt-3.5 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
        <span className="font-mono uppercase text-[10px] tracking-wider text-text-muted">
          {tool.category}
        </span>
        <span className="text-text-muted group-hover:text-accent font-medium inline-flex items-center gap-1 transition-colors">
          <span>{isZh ? '打开' : 'Use'}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  )
}

/**
 * Editorial Tool Row: High-density list item for Homepage and Tools Hub Directory
 * Clean hairline border, clear typography, zero nested card soup
 */
export function ToolRow({ tool, className = '', index }: ToolCardProps) {
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(tool.slug)

  const toolName = isZh ? tool.name : tool.nameEn
  const toolDesc = isZh ? tool.description : tool.descriptionEn

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(tool.slug)
    trackEvent('favorite', { toolSlug: tool.slug })
  }

  const formattedIndex = index !== undefined ? String(index).padStart(2, '0') : null

  return (
    <Link
      href={tool.href}
      className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-surface hover:bg-surface-secondary/50 border border-border/80 hover:border-border-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Optional Editorial Numbering (01, 02...) */}
        {formattedIndex && (
          <span className="font-mono text-xs font-semibold text-text-muted group-hover:text-accent w-5 shrink-0 transition-colors">
            {formattedIndex}
          </span>
        )}

        <div className="w-8 h-8 rounded-md bg-surface-secondary/70 border border-border/60 flex items-center justify-center text-text-secondary group-hover:text-accent group-hover:bg-accent-subtle/50 transition-colors shrink-0">
          <DynamicIcon name={tool.icon} className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
              {toolName}
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px] uppercase text-text-muted px-1.5 py-0.2 rounded bg-surface-secondary border border-border/50">
              {tool.category}
            </span>
          </div>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {toolDesc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden md:block">
          <PrivacyBadge mode={tool.privacyMode} variant="compact" />
        </div>

        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`p-1 rounded-md transition-colors cursor-pointer ${
            favorite
              ? 'text-amber-500'
              : 'text-text-muted hover:text-text-secondary hover:bg-surface-secondary'
          }`}
          aria-label={favorite ? '取消收藏' : '添加收藏'}
          title={favorite ? '已收藏' : '收藏此工具'}
        >
          <Star className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
        </button>

        <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  )
}

export default ToolCard
