'use client'

import React from 'react'
import Link from 'next/link'
import { ToolRegistryItem } from '@/config/tools'
import { PrivacyBadge } from './PrivacyBadge'
import DynamicIcon from '@/components/common/DynamicIcon'
import { useI18n } from '@/lib/i18n'
import { useFavorites } from '@/lib/storage'
import { Star, ArrowRight } from 'lucide-react'

export interface ToolCardProps {
  tool: ToolRegistryItem
  className?: string
}

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
  }

  return (
    <Link
      href={tool.href}
      className={`group relative flex flex-col justify-between rounded-2xl border border-[#1E293B] bg-[#0F1523] p-5 hover:border-slate-700 hover:bg-[#141C2E] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090D16] ${className}`}
    >
      <div>
        {/* Top bar: Icon, Badges, Favorite button */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-center text-blue-400 group-hover:text-white group-hover:border-slate-700 group-hover:scale-105 transition-all">
            <DynamicIcon name={tool.icon} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            <PrivacyBadge mode={tool.privacyMode} variant="compact" />
            <button
              type="button"
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-lg border transition-colors ${
                favorite
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'border-[#1E293B] bg-[#141C2E] text-slate-500 hover:text-slate-300'
              }`}
              aria-label={favorite ? '取消收藏' : '添加收藏'}
              title={favorite ? '已收藏' : '收藏此工具'}
            >
              <Star className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-1.5 line-clamp-1">
          {toolName}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {toolDesc}
        </p>
      </div>

      {/* Bottom bar: Category & Action */}
      <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-500">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {tool.category}
        </span>
        <span className="text-slate-400 group-hover:text-blue-400 font-medium inline-flex items-center gap-1 text-[11px] transition-colors">
          <span>{isZh ? '打开' : 'Launch'}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  )
}
