'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import DynamicIcon from '@/components/common/DynamicIcon'
import { ToolCard } from '@/components/tool/ToolCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { getAllCategories } from '@/config/categories'
import { getActiveTools } from '@/config/tools'
import { useI18n } from '@/lib/i18n'
import { useFavorites, useRecentTools } from '@/lib/storage'
import { Search, Sparkles, Star, History, Grid, X, ArrowRight } from 'lucide-react'

type TabType = 'all' | 'favorites' | 'recent'

export default function ToolsHubPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { locale } = useI18n()
  const isZh = locale === 'zh'

  const { favorites, isLoaded: favoritesLoaded } = useFavorites()
  const { recentTools, isLoaded: recentLoaded } = useRecentTools()

  const categories = useMemo(() => getAllCategories(), [])
  const allTools = useMemo(() => getActiveTools(), [])

  // Lookup map for fast tool retrieval
  const toolMap = useMemo(() => {
    const map = new Map<string, typeof allTools[0]>()
    for (const tool of allTools) {
      map.set(tool.slug, tool)
    }
    return map
  }, [allTools])

  // Filter tools based on active tab, search query, and category
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
          t.keywordsEn.some((kw) => kw.toLowerCase().includes(q))
        )
      })
    }

    return list
  }, [activeTab, allTools, favorites, recentTools, toolMap, selectedCategory, searchQuery])

  return (
    <div className="flex flex-col min-h-screen bg-[#090D16] text-slate-100">
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isZh ? '全站工具注册中心 · 真实可用' : 'Unified Tool Registry · 100% Authentic'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2.5">
              {isZh ? '工具中心' : 'Tools Hub'}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isZh
                ? `共收录 ${allTools.length} 款完全真实的在线小工具，涵盖财务、健康、格式转换、网络与日常效率。`
                : `Explore all ${allTools.length} authentic online utilities across finance, health, conversion, network, and productivity.`}
            </p>
          </div>

          <AdSlot slotId="tools-top-banner" format="horizontal" />

          {/* Primary View Tabs */}
          <div className="mt-8 mb-6 flex items-center justify-between border-b border-[#1E293B] pb-4 gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0F1523] border border-[#1E293B]">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{isZh ? '全部工具' : 'All Tools'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white/90">
                  {allTools.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'favorites'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>{isZh ? '我的收藏' : 'Favorites'}</span>
                {favoritesLoaded && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white/90">
                    {favorites.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('recent')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'recent'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isZh ? '最近访问' : 'Recent'}</span>
                {recentLoaded && recentTools.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white/90">
                    {recentTools.length}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Stats or Helper */}
            <div className="text-xs text-slate-500 hidden sm:block">
              {activeTab === 'all' && (
                <span>{isZh ? `正在浏览 ${displayedTools.length} 款可用工具` : `Viewing ${displayedTools.length} tools`}</span>
              )}
              {activeTab === 'favorites' && (
                <span>{isZh ? `已收藏 ${favorites.length} 款工具` : `${favorites.length} saved tools`}</span>
              )}
              {activeTab === 'recent' && (
                <span>{isZh ? `已记录 ${recentTools.length} 条最近使用` : `${recentTools.length} recent sessions`}</span>
              )}
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isZh ? '搜索工具名称、功能或关键词...' : 'Search tools, keywords, or tags...'}
                className="w-full pl-10 pr-9 py-2.5 bg-[#0F1523] border border-[#1E293B] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#0F1523] border border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#141C2E]'
                }`}
              >
                {isZh ? '全部类别' : 'All Categories'}
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.slug
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition ${
                      isActive
                        ? 'bg-[#141C2E] text-white border border-slate-700 shadow-sm'
                        : 'bg-[#0F1523] border border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#141C2E]'
                    }`}
                  >
                    <DynamicIcon name={cat.iconName} className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isZh ? cat.name : cat.nameEn}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Categories Grid (Shown only when viewing all, no search query, and category is all) */}
          {activeTab === 'all' && selectedCategory === 'all' && !searchQuery && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
              {categories.map((cat) => {
                const count = allTools.filter((t) => t.category === cat.slug).length
                return (
                  <Link
                    key={cat.slug}
                    href={`/tools/${cat.slug}`}
                    className="group rounded-2xl border border-[#1E293B] bg-[#0F1523] p-4 hover:border-slate-700 hover:bg-[#141C2E] transition-all flex flex-col items-center text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-center mb-2.5 text-blue-400 group-hover:scale-105 group-hover:text-white transition-all">
                      <DynamicIcon name={cat.iconName} className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {isZh ? cat.name : cat.nameEn}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isZh ? `${count} 个工具` : `${count} tools`}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Tool Cards Grid or Empty State */}
          {displayedTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="py-10">
              {activeTab === 'favorites' ? (
                <EmptyState
                  icon={<Star className="w-6 h-6 text-amber-400" />}
                  title={isZh ? '暂无收藏的工具' : 'No Favorite Tools Yet'}
                  description={
                    isZh
                      ? '在浏览任何工具卡片或详情页时，点击星标即可快速加入收藏列表。'
                      : 'Star any tool while browsing to save it here for fast one-click access.'
                  }
                  action={
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition"
                    >
                      {isZh ? '浏览全部工具' : 'Browse All Tools'}
                    </button>
                  }
                />
              ) : activeTab === 'recent' ? (
                <EmptyState
                  icon={<History className="w-6 h-6 text-emerald-400" />}
                  title={isZh ? '暂无最近访问记录' : 'No Recent History'}
                  description={
                    isZh
                      ? '您最近使用过的工具会自动记录在这里，便于下次快速继续工作。'
                      : 'Tools you interact with will automatically appear here for continuous workflows.'
                  }
                  action={
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition"
                    >
                      {isZh ? '去使用工具' : 'Explore Tools'}
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<Search className="w-6 h-6 text-slate-500" />}
                  title={isZh ? '未找到匹配的工具' : 'No Tools Found'}
                  description={
                    isZh
                      ? `未找到与 “${searchQuery}” 匹配的工具，请尝试其他关键词或重置筛选条件。`
                      : `No utilities matched "${searchQuery}". Try different keywords or reset filters.`
                  }
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('all')
                      }}
                      className="px-4 py-2 rounded-xl bg-[#141C2E] hover:bg-[#1A243B] border border-[#1E293B] text-xs font-medium text-white transition"
                    >
                      {isZh ? '重置搜索与筛选' : 'Reset Search & Filters'}
                    </button>
                  }
                />
              )}
            </div>
          )}

          <div className="mt-12">
            <AdSlot slotId="tools-bottom-banner" format="horizontal" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
