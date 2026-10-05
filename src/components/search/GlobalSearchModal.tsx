'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getActiveTools, ToolRegistryItem } from '@/config/tools'
import { getAllGames, GameRegistryItem } from '@/config/games'
import { useI18n } from '@/lib/i18n'
import { useRecentTools } from '@/lib/storage'
import DynamicIcon from '@/components/common/DynamicIcon'
import { PrivacyBadge } from '@/components/tool/PrivacyBadge'
import { Search, X, Command, ArrowRight, Sparkles, Clock, Gamepad2 } from 'lucide-react'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

type SearchItem =
  | { type: 'tool'; item: ToolRegistryItem }
  | { type: 'game'; item: GameRegistryItem }

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const { recentTools } = useRecentTools()

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

  // Filter items
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
          t.keywordsEn.some((k) => k.toLowerCase().includes(q))
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
          g.slug.toLowerCase().includes(q)
        )
      })
      .slice(0, 4)
      .map((item) => ({ type: 'game', item }))

    return [...toolResults, ...gameResults]
  }, [query, allTools, allGames])

  // Recent items when query is empty
  const recentItems = useMemo<ToolRegistryItem[]>(() => {
    if (query) return []
    return recentTools
      .map((slug) => allTools.find((t) => t.slug === slug))
      .filter((t): t is ToolRegistryItem => Boolean(t))
      .slice(0, 4)
  }, [query, recentTools, allTools])

  // Hot suggested items when query is empty
  const hotItems = useMemo<ToolRegistryItem[]>(() => {
    if (query) return []
    const hotSlugs = ['mortgage', 'bmi', 'timestamp', 'qrcode', 'unit', 'password', 'exchange', 'hash']
    return hotSlugs
      .map((slug) => allTools.find((t) => t.slug === slug))
      .filter((t): t is ToolRegistryItem => Boolean(t))
  }, [query, allTools])

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
          const selected = filteredResults[selectedIndex]
          const href = selected.type === 'tool' ? selected.item.href : selected.item.href
          router.push(href)
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredResults, selectedIndex, router, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#1E293B] bg-[#0F1523] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Box */}
        <div className="relative border-b border-[#1E293B] flex items-center px-4 py-3.5 bg-[#141C2E]/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
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
                ? '搜索工具、计算器、游戏 (例如: 房贷, BMI, 时间戳, 二维码, 贪吃蛇)...'
                : 'Search tools, calculators, games (e.g. Mortgage, BMI, QR, Hash)...'
            }
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSelectedIndex(0)
                inputRef.current?.focus()
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-3 flex-1 scrollbar-none space-y-1">
          {query.trim() !== '' ? (
            filteredResults.length > 0 ? (
              filteredResults.map((res, idx) => {
                const isCurrent = idx === selectedIndex
                if (res.type === 'tool') {
                  const tool = res.item
                  return (
                    <button
                      key={tool.slug}
                      type="button"
                      onClick={() => {
                        router.push(tool.href)
                        onClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                        isCurrent
                          ? 'bg-blue-600/15 border border-blue-500/40 text-white'
                          : 'bg-transparent hover:bg-[#141C2E] border border-transparent text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className="w-8 h-8 rounded-lg bg-[#141C2E] border border-[#1E293B] flex items-center justify-center text-blue-400 shrink-0">
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate text-white">
                              {isZh ? tool.name : tool.nameEn}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                              {tool.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {isZh ? tool.description : tool.descriptionEn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <PrivacyBadge mode={tool.privacyMode} variant="compact" />
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isCurrent ? 'text-blue-400 translate-x-0.5' : 'text-slate-600'
                          }`}
                        />
                      </div>
                    </button>
                  )
                } else {
                  const game = res.item
                  return (
                    <button
                      key={game.slug}
                      type="button"
                      onClick={() => {
                        router.push(game.href)
                        onClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                        isCurrent
                          ? 'bg-pink-600/15 border border-pink-500/40 text-white'
                          : 'bg-transparent hover:bg-[#141C2E] border border-transparent text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className="w-8 h-8 rounded-lg bg-[#141C2E] border border-[#1E293B] flex items-center justify-center text-pink-400 shrink-0">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate text-white">
                              {isZh ? game.name : game.nameEn}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-400 shrink-0">
                              GAME
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {isZh ? game.description : game.descriptionEn}
                          </p>
                        </div>
                      </div>

                      <ArrowRight
                        className={`w-4 h-4 transition-transform ${
                          isCurrent ? 'text-pink-400 translate-x-0.5' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  )
                }
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-slate-400 mb-1">
                  {isZh ? `未搜索到与 “${query}” 相关的工具或游戏` : `No results found for "${query}"`}
                </p>
                <p className="text-xs text-slate-500">
                  {isZh ? '可尝试搜索拼音、分类或功能简写' : 'Try searching by category or keywords'}
                </p>
              </div>
            )
          ) : (
            <div className="space-y-4 py-2">
              {/* Recent Tools (if any) */}
              {recentItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isZh ? '最近访问' : 'Recently Visited'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                    {recentItems.map((tool) => (
                      <button
                        key={`recent-${tool.slug}`}
                        type="button"
                        onClick={() => {
                          router.push(tool.href)
                          onClose()
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#141C2E] text-left transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#141C2E] border border-[#1E293B] flex items-center justify-center text-blue-400 shrink-0">
                          <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {isZh ? tool.name : tool.nameEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tools */}
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isZh ? '热门高频推荐' : 'Popular Tools'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                  {hotItems.map((tool) => (
                    <button
                      key={`hot-${tool.slug}`}
                      type="button"
                      onClick={() => {
                        router.push(tool.href)
                        onClose()
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#141C2E] text-left transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#141C2E] border border-[#1E293B] flex items-center justify-center text-blue-400 shrink-0 group-hover:text-white">
                        <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-blue-400 transition-colors block truncate">
                          {isZh ? tool.name : tool.nameEn}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {isZh ? tool.description : tool.descriptionEn}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-[#090D16] border-t border-[#1E293B] text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono text-[10px] mr-1">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono text-[10px] mr-1">
                ↓
              </kbd>
              {isZh ? '选择' : 'Navigate'}
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono text-[10px] mr-1">
                ↵
              </kbd>
              {isZh ? '打开' : 'Open'}
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono text-[10px] mr-1">
                ESC
              </kbd>
              {isZh ? '关闭' : 'Close'}
            </span>
          </div>
          <span className="text-slate-500 font-mono">{allTools.length} Tools</span>
        </div>
      </div>
    </div>
  )
}
