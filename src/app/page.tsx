'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import DynamicIcon from '@/components/common/DynamicIcon'
import { ToolCard } from '@/components/tool/ToolCard'
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal'
import { useI18n } from '@/lib/i18n'
import { getAllCategories } from '@/config/categories'
import { getFeaturedTools, getActiveTools, ToolRegistryItem } from '@/config/tools'
import { getAllGames } from '@/config/games'
import { useRecentTools, useFavorites } from '@/lib/storage'
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Gamepad2,
  History,
  Star,
} from 'lucide-react'

export default function HomePage() {
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [myToolsTab, setMyToolsTab] = useState<'recent' | 'favorites'>('recent')
  const { locale } = useI18n()
  const isZh = locale === 'zh'

  const categories = useMemo(() => getAllCategories(), [])
  const featuredTools = useMemo(() => getFeaturedTools().slice(0, 8), [])
  const allTools = useMemo(() => getActiveTools(), [])
  const games = useMemo(() => getAllGames().slice(0, 4), [])

  const { recentTools } = useRecentTools()
  const { favorites } = useFavorites()

  // Tool map for fast lookup
  const toolMap = useMemo(() => {
    const map = new Map<string, ToolRegistryItem>()
    for (const t of allTools) {
      map.set(t.slug, t)
    }
    return map
  }, [allTools])

  // Filtered lists for My Tools
  const recentToolItems = useMemo(
    () => recentTools.map((slug) => toolMap.get(slug)).filter(Boolean) as ToolRegistryItem[],
    [recentTools, toolMap]
  )

  const favoriteToolItems = useMemo(
    () => favorites.map((slug) => toolMap.get(slug)).filter(Boolean) as ToolRegistryItem[],
    [favorites, toolMap]
  )

  const hasMyTools = recentToolItems.length > 0 || favoriteToolItems.length > 0

  // 8 Exact Hot Keywords required by specification
  const popularKeywords = [
    { label: isZh ? '房贷' : 'Mortgage', href: '/tools/finance/mortgage' },
    { label: 'BMI', href: '/tools/health/bmi' },
    { label: isZh ? '时间戳' : 'Timestamp', href: '/tools/convert/timestamp' },
    { label: isZh ? '二维码' : 'QR Code', href: '/tools/convert/qrcode' },
    { label: isZh ? '密码' : 'Password', href: '/tools/daily/password' },
    { label: isZh ? '单位' : 'Unit', href: '/tools/convert/unit' },
    { label: 'JSON', href: '/tools/convert/radix' },
    { label: 'Hash', href: '/tools/convert/hash' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#090D16] text-slate-100">
      <Header />

      <main className="flex-1">
        {/* ==================== 1. BRAND / HERO ==================== */}
        <section className="relative px-4 pt-14 pb-12 sm:pt-20 sm:pb-16 border-b border-[#1E293B] bg-[#0A0E1A] overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Small Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Tools, One Nook · 一站搞定，方寸万象</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              {isZh ? (
                <>
                  一站搞定，<br className="hidden sm:inline" />
                  你的常用效率工具都在这里。
                </>
              ) : (
                <>
                  All Tools, One Nook.<br className="hidden sm:inline" />
                  Everyday Utilities in One Spot.
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-7 leading-relaxed">
              {isZh
                ? '无需下载安装，全站 45 款工具与 8 款经典游戏即开即用。纯净本地优先计算，拒绝虚假模拟，保护数据隐私。'
                : 'Zero installation needed. 45 verified productivity utilities and classic games. Local-first computation with authentic algorithms.'}
            </p>

            {/* Direct Interactive Search Bar in Hero */}
            <div className="max-w-xl mx-auto mb-5">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border border-[#1E293B] bg-[#0F1523] hover:border-slate-600 hover:bg-[#141C2E] shadow-lg text-left transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300">
                    {isZh ? '搜索你要解决的问题……' : 'Search utilities, calculations, tools...'}
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono bg-[#141C2E] text-slate-400 border border-[#1E293B]">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Hot keyword recommendation tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              <span className="text-xs text-slate-500 font-medium mr-1">
                {isZh ? '热门关键词：' : 'Popular:'}
              </span>
              {popularKeywords.map((kw) => (
                <Link
                  key={kw.href}
                  href={kw.href}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#0F1523] border border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-700 hover:bg-[#141C2E] transition-colors"
                >
                  {kw.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== 2. MY TOOLS / RECENT (ONLY IF DATA EXISTS) ==================== */}
        {hasMyTools && (
          <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto border-b border-[#1E293B]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isZh ? '我的工具' : 'My Tools'}</span>
                </h2>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0F1523] border border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setMyToolsTab('recent')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      myToolsTab === 'recent'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <History className="w-3 h-3" />
                    <span>{isZh ? '最近使用' : 'Recent'} ({recentToolItems.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMyToolsTab('favorites')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      myToolsTab === 'favorites'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Star className="w-3 h-3 text-amber-400" />
                    <span>{isZh ? '我的收藏' : 'Favorites'} ({favoriteToolItems.length})</span>
                  </button>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {isZh ? '跨标签页实时同步 · 本地安全存储' : 'Real-time cross-tab sync'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(myToolsTab === 'recent' ? recentToolItems : favoriteToolItems).slice(0, 4).map((tool) => (
                <ToolCard key={`my-${tool.slug}`} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* ==================== 3. POPULAR TOOLS (MAX 8 S-TIER) ==================== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {isZh ? 'S级高频实用' : 'Essential Picks'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isZh ? '热门推荐工具' : 'Popular Utilities'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isZh
                  ? '精选最高频、完全真实、支持本地快速处理的 8 款高价值实用工具'
                  : 'Handpicked top 8 authentic utilities with client-side computation'}
              </p>
            </div>

            <Link
              href="/tools"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>{isZh ? `浏览全部 ${allTools.length} 款工具` : `Explore all ${allTools.length} tools`}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {/* Mid-page Ad Slot */}
        <div className="max-w-7xl mx-auto px-4 my-2">
          <AdSlot slotId="home-mid-banner" format="horizontal" />
        </div>

        {/* ==================== 4. CATEGORIES (6 STANDARD) ==================== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-[#1E293B] bg-[#0A0E1A]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                {isZh ? '六大分类，方寸万象' : 'Browse by Category'}
              </h2>
              <p className="text-xs text-slate-400">
                {isZh
                  ? '涵盖日常办公、财务投资、健康监测、数据转换、网络自查与 AI 辅助'
                  : 'Well-structured utilities organized by domain with strict quality assurance'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = allTools.filter((t) => t.category === cat.slug).length
                return (
                  <Link
                    key={cat.slug}
                    href={`/tools/${cat.slug}`}
                    className="group rounded-2xl border border-[#1E293B] bg-[#0F1523] p-5 hover:border-slate-700 hover:bg-[#141C2E] transition-all flex items-start gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-center text-blue-400 group-hover:text-white shrink-0 group-hover:scale-105 transition-transform">
                      <DynamicIcon name={cat.iconName} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">
                          {isZh ? cat.name : cat.nameEn}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-[#141C2E] border border-[#1E293B]">
                          {count}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {isZh ? cat.description : cat.descriptionEn}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ==================== 5. GAMES (MAX 4) ==================== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Gamepad2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  {isZh ? '工作间歇 · 极简解压' : 'Take a Break'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isZh ? '精选休闲小游戏' : 'Classic Mini-Games'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isZh
                  ? '俄罗斯方块、经典扫雷、贪吃蛇与象棋对弈，纯前端运行，无开局强插广告'
                  : 'Pure client-side canvas mini-games designed for quick cognitive breaks'}
              </p>
            </div>

            <Link
              href="/games"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{isZh ? '进入游戏大厅' : 'View all games'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {games.map((game) => (
              <Link
                key={game.slug}
                href={game.href}
                className="group rounded-2xl border border-[#1E293B] bg-[#0F1523] p-5 hover:border-slate-700 hover:bg-[#141C2E] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-center text-blue-400 group-hover:text-white group-hover:scale-105 transition-transform mb-3.5">
                    <DynamicIcon name={game.iconName} className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm mb-1.5">
                    {isZh ? game.name : game.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {isZh ? game.description : game.descriptionEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono uppercase text-slate-500">
                    {game.category}
                  </span>
                  <span className="text-slate-400 group-hover:text-blue-400 font-medium inline-flex items-center gap-1 text-[11px]">
                    <span>{isZh ? '开始游戏' : 'Play'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ==================== 6. WHY BITNOOK (MAX 3 PILLARS) ==================== */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-[#1E293B] bg-[#0F1523]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
                {isZh ? '为什么选择 BitNook？' : 'Why BitNook?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {isZh ? '坚持拒绝繁琐安装、数据伪造与隐私外泄' : 'Simple, transparent, and privacy-respecting by design'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-[#1E293B] bg-[#141C2E]/60 p-6 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-2">
                  {isZh ? '即开即用 · 零安装负担' : 'Instant & Frictionless'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isZh
                    ? '无需下载任何客户端，不要求繁琐注册。打开浏览器即可直接操作，直奔主题。'
                    : 'No software installation or signup walls required. Open, compute, and finish your task immediately.'}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-[#1E293B] bg-[#141C2E]/60 p-6 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-2">
                  {isZh ? '本地纯净 · 隐私数据零上传' : 'Local-First Privacy'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isZh
                    ? '哈希计算、二维码生成、格式转换等核心功能均在浏览器本地内存运行，绝不窥探或回传您的敏感数据。'
                    : 'Hashes, QR codes, and unit conversions run entirely in client-side memory without transmitting your data.'}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-[#1E293B] bg-[#141C2E]/60 p-6 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-2">
                  {isZh ? '真实算法 · 权威数据来源' : 'Authentic Algorithms'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isZh
                    ? '房贷基于中国央行最新 LPR 基准，BMI 遵从卫健委卫生行业标准，网络检测基于真实 POP 探针，拒绝任何伪造数据。'
                    : 'Calculations adhere strictly to authoritative standards like official benchmark rates and health standards.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  )
}
