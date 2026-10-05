'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DynamicIcon from '@/components/common/DynamicIcon'
import { ToolRegistryItem, getActiveTools, getSTierTools } from '@/config/tools'
import { GameInfo, getAllGames } from '@/config/games'
import { matchPinyin } from '@/config/searchIndex'
import { useI18n } from '@/lib/i18n'
import { useRecentTools, useFavorites } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
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
  | { type: 'tool'; item: ToolRegistryItem }
  | { type: 'game'; item: GameInfo }

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

  // Multi-dimensional search matching (Chinese, English, Pinyin, Slug, Category, Keywords)
  const filteredResults = useMemo<SearchItem[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const toolResults: SearchItem[] = allTools
      .filter((t) => {
        return (
          t.name.toLowerCase().includes(q) ||
          t.nameEn.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.descriptionEn.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q)) ||
          t.keywordsEn.some((k) => k.toLowerCase().includes(q)) ||
          matchPinyin(t.slug, q)
        )
      })
      .slice(0, 10)
      .map((item) => ({ type: 'tool', item }))

    const gameResults: SearchItem[] = allGames
      .filter((g) => {
        return (
          g.name.toLowerCase().includes(q) ||
          g.nameEn.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.descriptionEn.toLowerCase().includes(q) ||
          g.slug.toLowerCase().includes(q) ||
          matchPinyin(g.slug, q)
        )
      })
      .slice(0, 4)
      .map((item) => ({ type: 'game', item }))

    return [...toolResults, ...gameResults]
  }, [query, allTools, allGames])

  // Track search query length
  useEffect(() => {
    if (query.trim().length > 1) {
      trackEvent('search', { queryLength: query.trim().length })
    }
  }, [query])

  // Recent items when query is empty
  const recentItems = useMemo<ToolRegistryItem[]>(() => {
    if (query) return []
    return recentTools
      .map((slug) => allTools.find((t) => t.slug === slug))
      .filter((t): t is ToolRegistryItem => Boolean(t))
      .slice(0, 4)
  }, [query, recentTools, allTools])

  // Favorite items when query is empty
  const favoriteItems = useMemo<ToolRegistryItem[]>(() => {
    if (query) return []
    return favorites
      .map((slug) => allTools.find((t) => t.slug === slug))
      .filter((t): t is ToolRegistryItem => Boolean(t))
      .slice(0, 4)
  }, [query, favorites, allTools])

  // Hot suggested S-tier items when query is empty
  const hotItems = useMemo<ToolRegistryItem[]>(() => {
    if (query) return []
    return getSTierTools().slice(0, 6)
  }, [query])

  // Selection handler
  const handleSelect = (item: SearchItem | { type: 'tool'; item: ToolRegistryItem }) => {
    trackEvent('search_click', { toolSlug: item.item.slug })
    router.push(item.item.href)
    onClose()
  }

  // Keyboard navigation inside search results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredResults, selectedIndex, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#1E293B] bg-[#0F1523] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-[#1E293B] bg-[#090D16]/50">
          <Search className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
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
                ? '搜索工具、拼音 (如 fangdai, mima)、算法或小游戏...'
                : 'Search tools, pinyin (e.g. fangdai), algorithms, games...'
            }
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            aria-label="Search tools"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSelectedIndex(0)
                inputRef.current?.focus()
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-white transition"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 border border-[#1E293B] bg-[#141C2E]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results / Suggestions Container */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 scrollbar-none">
          {query.trim() ? (
            filteredResults.length > 0 ? (
              <div className="space-y-1">
                {filteredResults.map((res, idx) => {
                  const isSelected = idx === selectedIndex
                  const isTool = res.type === 'tool'
                  const title = isZh ? res.item.name : res.item.nameEn
                  const desc = isZh ? res.item.description : res.item.descriptionEn

                  return (
                    <button
                      key={`${res.type}-${res.item.slug}`}
                      type="button"
                      onClick={() => handleSelect(res)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600/15 border border-blue-500/40 text-white'
                          : 'border border-transparent text-slate-300 hover:bg-[#141C2E]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#141C2E] border border-[#1E293B] flex items-center justify-center shrink-0 text-blue-400">
                          <DynamicIcon
                            name={isTool ? (res.item as ToolRegistryItem).icon : (res.item as GameInfo).iconName}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{title}</span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#141C2E] text-slate-400 border border-[#1E293B]">
                              {res.item.category}
                            </span>
                            {isTool && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Tier-{(res.item as ToolRegistryItem).tier}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{desc}</p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 text-[11px] text-slate-500">
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">{isZh ? `未找到与 “${query}” 相关的工具` : `No utilities matching "${query}"`}</p>
              </div>
            )
          ) : (
            <div className="space-y-5 p-2">
              {/* Recent Tools Shelf */}
              {recentItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2.5">
                    <History className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isZh ? '最近访问' : 'Recently Used'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {recentItems.map((tool) => (
                      <button
                        key={`recent-${tool.slug}`}
                        type="button"
                        onClick={() => handleSelect({ type: 'tool', item: tool })}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#1E293B] bg-[#141C2E]/60 hover:border-slate-700 hover:bg-[#1A243B] text-left transition"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#090D16] border border-[#1E293B] flex items-center justify-center shrink-0 text-blue-400">
                          <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-white truncate">
                          {isZh ? tool.name : tool.nameEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites Shelf */}
              {favoriteItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isZh ? '我的收藏' : 'My Favorites'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {favoriteItems.map((tool) => (
                      <button
                        key={`fav-${tool.slug}`}
                        type="button"
                        onClick={() => handleSelect({ type: 'tool', item: tool })}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#1E293B] bg-[#141C2E]/60 hover:border-slate-700 hover:bg-[#1A243B] text-left transition"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#090D16] border border-[#1E293B] flex items-center justify-center shrink-0 text-amber-400">
                          <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-white truncate">
                          {isZh ? tool.name : tool.nameEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* S-Tier Popular Picks */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isZh ? '热门推荐 (S-Tier)' : 'Popular (S-Tier)'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {hotItems.map((tool) => (
                    <button
                      key={`hot-${tool.slug}`}
                      type="button"
                      onClick={() => handleSelect({ type: 'tool', item: tool })}
                      className="flex items-center gap-2 p-2 rounded-xl border border-[#1E293B] bg-[#141C2E]/60 hover:border-slate-700 hover:bg-[#1A243B] text-left transition"
                    >
                      <div className="w-6 h-6 rounded-md bg-[#090D16] border border-[#1E293B] flex items-center justify-center shrink-0 text-blue-400">
                        <DynamicIcon name={tool.icon} className="w-3 h-3" />
                      </div>
                      <span className="text-xs text-slate-300 font-medium truncate">
                        {isZh ? tool.name : tool.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls Helper */}
        <div className="px-4 py-2.5 border-t border-[#1E293B] bg-[#090D16]/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#141C2E] border border-[#1E293B] text-slate-400 font-mono">↑↓</kbd>{' '}
              {isZh ? '选择' : 'Navigate'}
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#141C2E] border border-[#1E293B] text-slate-400 font-mono">↵</kbd>{' '}
              {isZh ? '直达' : 'Open'}
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#141C2E] border border-[#1E293B] text-slate-400 font-mono">ESC</kbd>{' '}
              {isZh ? '关闭' : 'Close'}
            </span>
          </div>
          <span className="font-mono text-slate-500">{allTools.length} tools · 8 games</span>
        </div>
      </div>
    </div>
  )
}
