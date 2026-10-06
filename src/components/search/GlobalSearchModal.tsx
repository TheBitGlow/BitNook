'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DynamicIcon from '@/components/common/DynamicIcon'
import { ToolRegistryItem, getActiveTools, getSTierTools } from '@/config/tools'
import { GameInfo, getAllGames } from '@/config/games'
import { matchPinyin } from '@/config/searchIndex'
import { useI18n } from '@/lib/i18n'
import { useRecentTools, useFavorites } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import { PrivacyBadge } from '@/components/tool/PrivacyBadge'
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  History,
  Star,
  Gamepad2,
  CornerDownLeft,
} from 'lucide-react'

export interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

type SearchItem =
  | { type: 'tool'; item: ToolRegistryItem; score: number }
  | { type: 'game'; item: GameInfo; score: number }

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const { recentTools } = useRecentTools()
  const { favorites } = useFavorites()

  const allTools = useMemo(() => getActiveTools(), [])
  const allGames = useMemo(() => getAllGames(), [])

  // Reset query and selection on modal open without cascading effect
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Search 2.0: Exact match > Name match > Keyword/Pinyin match > Category match > Description match
  const filteredResults = useMemo<SearchItem[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const scoredToolResults: SearchItem[] = []

    for (const t of allTools) {
      const nameZh = t.name.toLowerCase()
      const nameEn = t.nameEn.toLowerCase()
      const slug = t.slug.toLowerCase()
      const cat = t.category.toLowerCase()
      const descZh = t.description.toLowerCase()
      const descEn = t.descriptionEn.toLowerCase()

      let score = 0

      // 1. Exact match
      if (slug === q || nameZh === q || nameEn === q) {
        score = 1000
      }
      // 2. Name / Slug prefix match
      else if (nameZh.startsWith(q) || nameEn.startsWith(q) || slug.startsWith(q)) {
        score = 500
      }
      // 3. Name / Slug substring match
      else if (nameZh.includes(q) || nameEn.includes(q) || slug.includes(q)) {
        score = 300
      }
      // 4. Keyword / Pinyin match
      else if (
        t.keywords.some((k) => k.toLowerCase() === q) ||
        t.keywordsEn.some((k) => k.toLowerCase() === q)
      ) {
        score = 260
      } else if (
        t.keywords.some((k) => k.toLowerCase().startsWith(q)) ||
        t.keywordsEn.some((k) => k.toLowerCase().startsWith(q))
      ) {
        score = 230
      } else if (
        t.keywords.some((k) => k.toLowerCase().includes(q)) ||
        t.keywordsEn.some((k) => k.toLowerCase().includes(q)) ||
        matchPinyin(t.slug, q)
      ) {
        score = 200
      }
      // 5. Category match
      else if (cat === q || cat.includes(q)) {
        score = 100
      }
      // 6. Description match
      else if (descZh.includes(q) || descEn.includes(q)) {
        score = 50
      }

      if (score > 0) {
        // Boost Tier S (+15) and Tier A (+5)
        if (t.tier === 'S') score += 15
        else if (t.tier === 'A') score += 5

        scoredToolResults.push({ type: 'tool', item: t, score })
      }
    }

    const scoredGameResults: SearchItem[] = []
    for (const g of allGames) {
      const nameZh = g.name.toLowerCase()
      const nameEn = g.nameEn.toLowerCase()
      const slug = g.slug.toLowerCase()

      let score = 0
      if (slug === q || nameZh === q || nameEn === q) {
        score = 900
      } else if (nameZh.startsWith(q) || nameEn.startsWith(q) || slug.startsWith(q)) {
        score = 450
      } else if (nameZh.includes(q) || nameEn.includes(q) || slug.includes(q)) {
        score = 250
      }

      if (score > 0) {
        scoredGameResults.push({ type: 'game', item: g, score })
      }
    }

    return [...scoredToolResults, ...scoredGameResults].sort((a, b) => b.score - a.score)
  }, [query, allTools, allGames])

  // Suggested default lists
  const defaultPopularTools = useMemo(() => getSTierTools().slice(0, 6), [])
  const recentToolItems = useMemo(() => {
    return recentTools
      .map((slug) => allTools.find((t) => t.slug === slug))
      .filter(Boolean) as ToolRegistryItem[]
  }, [recentTools, allTools])

  const favoriteToolItems = useMemo(() => {
    return favorites
      .map((slug) => allTools.find((t) => t.slug === slug))
      .filter(Boolean) as ToolRegistryItem[]
  }, [favorites, allTools])

  const navigateTo = useCallback(
    (item: SearchItem | ToolRegistryItem | GameInfo, type: 'tool' | 'game') => {
      let href = ''
      let slug = ''
      if ('href' in item) {
        href = item.href
        slug = item.slug
      } else if ('item' in item) {
        href = item.item.href
        slug = item.item.slug
      }

      if (href) {
        trackEvent('search_click', {
          queryLength: query.length,
          toolSlug: slug,
        })
        onClose()
        router.push(href)
      }
    },
    [query, onClose, router]
  )

  // Keyboard navigation: ArrowUp, ArrowDown, Enter, Esc
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const count = filteredResults.length
        if (count > 0) {
          setSelectedIndex((prev) => (prev + 1) % count)
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const count = filteredResults.length
        if (count > 0) {
          setSelectedIndex((prev) => (prev - 1 + count) % count)
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
          const target = filteredResults[selectedIndex]
          navigateTo(target, target.type)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, filteredResults, selectedIndex, navigateTo])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]') as HTMLElement | null
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex sm:items-start items-stretch justify-center sm:pt-20 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Command Center: Fullscreen on mobile, 680px modal on desktop */}
      <div className="relative w-full sm:max-w-2xl bg-surface sm:rounded-xl sm:border sm:border-border sm:shadow-modal flex flex-col h-full sm:h-auto sm:max-h-[80vh] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-120">
        {/* Search Header Input Bar */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-surface shrink-0">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder={
              isZh
                ? '搜索工具、游戏、拼音或关键词 (如 房贷、BMI、GPU)...'
                : 'Search tools, games, keywords (e.g. mortgage, password)...'
            }
            className="flex-1 bg-transparent text-sm sm:text-base text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="p-1 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
          )}
        </div>

        {/* Results List / Suggested View */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 divide-y divide-transparent"
        >
          {query.trim() ? (
            filteredResults.length > 0 ? (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  {isZh
                    ? `找到 ${filteredResults.length} 个结果`
                    : `${filteredResults.length} Results Found`}
                </div>
                {filteredResults.map((res, idx) => {
                  const isSelected = idx === selectedIndex
                  const isTool = res.type === 'tool'
                  const item = res.item
                  const name = isZh ? item.name : item.nameEn
                  const desc = isZh ? item.description : item.descriptionEn

                  return (
                    <div
                      key={item.slug}
                      data-active={isSelected}
                      onClick={() => navigateTo(res, res.type)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-secondary text-text-primary'
                          : 'hover:bg-surface-hover text-text-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-md bg-surface border border-border/80 flex items-center justify-center shrink-0 text-accent">
                          <DynamicIcon name={'icon' in item ? item.icon : item.iconName} className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                              {name}
                            </span>
                            <span className="font-mono text-[10px] uppercase text-text-muted px-1.5 py-0.2 rounded bg-surface border border-border/60">
                              {isTool ? (item as ToolRegistryItem).category : 'GAME'}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary truncate mt-0.5">{desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isTool && (
                          <div className="hidden sm:block">
                            <PrivacyBadge
                              mode={(item as ToolRegistryItem).privacyMode}
                              variant="compact"
                            />
                          </div>
                        )}
                        <span className="text-[11px] font-mono text-text-muted opacity-60">
                          <CornerDownLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-text-muted">
                {isZh
                  ? `未找到与 “${query}” 匹配的工具或游戏`
                  : `No tools or games found for "${query}"`}
              </div>
            )
          ) : (
            /* Suggested Default Drawer */
            <div className="space-y-4 py-2">
              {/* Recent Tools */}
              {recentToolItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    <History className="w-3 h-3 text-success" />
                    <span>{isZh ? '最近使用' : 'Recent Tools'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {recentToolItems.slice(0, 4).map((tool) => (
                      <div
                        key={tool.slug}
                        onClick={() => navigateTo(tool, 'tool')}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-surface-secondary text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                      >
                        <DynamicIcon name={tool.icon} className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="text-xs font-medium truncate">
                          {isZh ? tool.name : tool.nameEn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites */}
              {favoriteToolItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span>{isZh ? '我的收藏' : 'Saved Favorites'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {favoriteToolItems.slice(0, 4).map((tool) => (
                      <div
                        key={tool.slug}
                        onClick={() => navigateTo(tool, 'tool')}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-surface-secondary text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                      >
                        <DynamicIcon name={tool.icon} className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-xs font-medium truncate">
                          {isZh ? tool.name : tool.nameEn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular S-Tier Tools */}
              <div>
                <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span>{isZh ? '高频核心' : 'Popular Tools'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {defaultPopularTools.map((tool) => (
                    <div
                      key={tool.slug}
                      onClick={() => navigateTo(tool, 'tool')}
                      className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface-secondary text-text-secondary hover:text-text-primary cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <DynamicIcon name={tool.icon} className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="text-xs font-medium truncate">
                          {isZh ? tool.name : tool.nameEn}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar (Desktop only) */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2 border-t border-border bg-surface-secondary/50 text-[11px] text-text-muted font-mono shrink-0">
          <div className="flex items-center gap-3">
            <span>↑ ↓ 选择</span>
            <span>↵ 确认</span>
            <span>ESC 关闭</span>
          </div>
          <span>BitNook Command Center</span>
        </div>
      </div>
    </div>
  )
}

export default GlobalSearchModal
