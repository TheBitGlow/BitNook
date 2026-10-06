'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import DynamicIcon from '@/components/common/DynamicIcon'
import { ToolRow } from '@/components/tool/ToolCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { getAllCategories } from '@/config/categories'
import { getActiveTools, ToolTier } from '@/config/tools'
import { matchPinyin } from '@/config/searchIndex'
import { useI18n } from '@/lib/i18n'
import { useFavorites, useRecentTools } from '@/lib/storage'
import { Search, Star, History, Grid, X } from 'lucide-react'

type TabType = 'all' | 'favorites' | 'recent'
type TierFilter = 'ALL' | 'S' | 'A' | 'B'

export default function ToolsHubPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<TierFilter>('ALL')
  const { locale } = useI18n()
  const isZh = locale === 'zh'

  const { favorites, isLoaded: favoritesLoaded } = useFavorites()
  const { recentTools, isLoaded: recentLoaded } = useRecentTools()

  const categories = useMemo(() => getAllCategories(), [])
  const allTools = useMemo(() => getActiveTools(), [])

  // Lookup map for fast tool retrieval
  const toolMap = useMemo(() => {
    const map = new Map<string, (typeof allTools)[0]>()
    for (const tool of allTools) {
      map.set(tool.slug, tool)
    }
    return map
  }, [allTools])

  // Filter tools based on active tab, search query, category, and tier
  const displayedTools = useMemo(() => {
    let list = allTools

    if (activeTab === 'favorites') {
      list = favorites.map((slug) => toolMap.get(slug)).filter(Boolean) as typeof allTools
    } else if (activeTab === 'recent') {
      list = recentTools.map((slug) => toolMap.get(slug)).filter(Boolean) as typeof allTools
    }

    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory)
    }

    if (tierFilter !== 'ALL') {
      list = list.filter((t) => t.tier === tierFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((t) => {
        return (
          t.name.toLowerCase().includes(q) ||
          t.nameEn.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.descriptionEn.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.keywords.some((kw) => kw.toLowerCase().includes(q)) ||
          t.keywordsEn.some((kw) => kw.toLowerCase().includes(q)) ||
          matchPinyin(t.slug, q)
        )
      })
    }

    return list
  }, [activeTab, allTools, favorites, recentTools, toolMap, selectedCategory, tierFilter, searchQuery])

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto">
          {/* Top Editorial Title */}
          <div className="mb-7 pb-5 border-b border-border/70">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase text-accent mb-1.5">
              <span>TOOL COMPARTMENTS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
              {isZh ? '工具目录 · 35 款在线实用工具' : 'Tools Directory · 35 Authentic Utilities'}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {isZh
                ? '全部工具由客户端浏览器本地运算或 Cloudflare Edge 节点驱动，无弹窗、不收集个人隐私。'
                : 'Direct, local-first utility drawer. Clean, fast, and engineered for daily focus.'}
            </p>
          </div>

          {/* Two-Column Editorial Directory */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* ==================== LEFT CATEGORY INDEX (~220px) ==================== */}
            <aside className="w-full md:w-56 shrink-0 space-y-4">
              {/* Primary View Switcher */}
              <div className="p-1.5 rounded-lg border border-border/80 bg-surface shadow-subtle space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('all')
                    setSelectedCategory('all')
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'all' && selectedCategory === 'all'
                      ? 'bg-surface-secondary text-text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Grid className="w-3.5 h-3.5" />
                    <span>{isZh ? '全部工具' : 'All Tools'}</span>
                  </div>
                  <span className="font-mono text-[10px] text-text-muted">{allTools.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'favorites'
                      ? 'bg-surface-secondary text-text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isZh ? '我的收藏' : 'Saved'}</span>
                  </div>
                  {favoritesLoaded && (
                    <span className="font-mono text-[10px] text-text-muted">{favorites.length}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('recent')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'recent'
                      ? 'bg-surface-secondary text-text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-success" />
                    <span>{isZh ? '最近使用' : 'Recent'}</span>
                  </div>
                  {recentLoaded && (
                    <span className="font-mono text-[10px] text-text-muted">{recentTools.length}</span>
                  )}
                </button>
              </div>

              {/* Categories Index */}
              <div className="p-3 rounded-lg border border-border/80 bg-surface shadow-subtle">
                <div className="text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider mb-2.5 px-1">
                  {isZh ? '领域分类' : 'Categories'}
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-accent-subtle text-accent font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70'
                    }`}
                  >
                    <span>{isZh ? '所有分类' : 'All Categories'}</span>
                    <span className="font-mono text-[10px] text-text-muted">{allTools.length}</span>
                  </button>

                  {categories.map((cat) => {
                    const count = allTools.filter((t) => t.category === cat.slug).length
                    const isActive = selectedCategory === cat.slug
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-accent-subtle text-accent font-semibold'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <DynamicIcon name={cat.iconName} className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          <span className="truncate">{isZh ? cat.name : cat.nameEn}</span>
                        </div>
                        <span className="font-mono text-[10px] text-text-muted shrink-0">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </aside>

            {/* ==================== RIGHT TOOL DIRECTORY ==================== */}
            <section className="flex-1 min-w-0 w-full space-y-3.5">
              {/* Filter Toolbar (Subtle Bar) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-lg border border-border/80 bg-surface shadow-subtle">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isZh ? '过滤当前目录下的工具、拼音或关键词...' : 'Filter tools by name, tag or keyword...'}
                    className="w-full pl-9 pr-8 py-1.5 bg-surface-secondary/70 border border-border/80 rounded-md text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                      aria-label="清空搜索"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tier Filter Toggle */}
                <div className="flex items-center gap-1 text-xs self-start sm:self-auto shrink-0">
                  <span className="text-[11px] text-text-muted uppercase font-mono mr-1">
                    {isZh ? '等级:' : 'Tier:'}
                  </span>
                  {(['ALL', 'S', 'A', 'B'] as TierFilter[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTierFilter(t)}
                      className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                        tierFilter === t
                          ? 'bg-accent text-white font-semibold'
                          : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border/60'
                      }`}
                    >
                      {t === 'ALL' ? (isZh ? '全部' : 'All') : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between text-xs text-text-muted px-1">
                <span>
                  {isZh
                    ? `显示 ${displayedTools.length} 款工具`
                    : `Showing ${displayedTools.length} tools`}
                </span>
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="text-accent hover:underline text-xs cursor-pointer"
                  >
                    {isZh ? '清除分类筛选' : 'Clear Category'}
                  </button>
                )}
              </div>

              {/* Tool Rows List */}
              {displayedTools.length > 0 ? (
                <div className="space-y-1.5">
                  {displayedTools.map((tool) => (
                    <ToolRow key={tool.slug} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="py-8">
                  {activeTab === 'favorites' ? (
                    <EmptyState
                      icon={<Star className="w-5 h-5 text-amber-500" />}
                      title={isZh ? '暂无收藏的工具' : 'No Favorite Tools'}
                      description={
                        isZh
                          ? '点击任意工具卡片或列表上的星标，即可一键加入收藏抽屉。'
                          : 'Star any tool to keep it in your personal favorites drawer.'
                      }
                      action={
                        <button
                          type="button"
                          onClick={() => setActiveTab('all')}
                          className="btn-primary"
                        >
                          {isZh ? '浏览全部工具' : 'Browse All Tools'}
                        </button>
                      }
                    />
                  ) : activeTab === 'recent' ? (
                    <EmptyState
                      icon={<History className="w-5 h-5 text-success" />}
                      title={isZh ? '暂无最近使用记录' : 'No Recent Tools'}
                      description={
                        isZh
                          ? '您在当前浏览器使用过的工具会自动记录在这里。'
                          : 'Tools you use will automatically appear here.'
                      }
                      action={
                        <button
                          type="button"
                          onClick={() => setActiveTab('all')}
                          className="btn-primary"
                        >
                          {isZh ? '去使用工具' : 'Explore Tools'}
                        </button>
                      }
                    />
                  ) : (
                    <EmptyState
                      icon={<Search className="w-5 h-5 text-text-muted" />}
                      title={isZh ? '未找到符合条件的工具' : 'No Matching Tools'}
                      description={
                        isZh
                          ? `未搜索到与 “${searchQuery}” 匹配的工具，请尝试其他词或重置筛选。`
                          : `No tools matched your filters. Try resetting the search.`
                      }
                      action={
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                            setTierFilter('ALL')
                          }}
                          className="btn-secondary"
                        >
                          {isZh ? '重置筛选条件' : 'Reset Filters'}
                        </button>
                      }
                    />
                  )}
                </div>
              )}

              {/* Bottom Ad slot */}
              <div className="pt-6">
                <AdSlot slotId="tools-hub-bottom" format="horizontal" />
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
