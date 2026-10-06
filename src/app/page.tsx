'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import DynamicIcon from '@/components/common/DynamicIcon'
import { ToolCard, ToolRow } from '@/components/tool/ToolCard'
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal'
import { useI18n } from '@/lib/i18n'
import { getAllCategories } from '@/config/categories'
import { getFeaturedTools, getActiveTools, ToolRegistryItem } from '@/config/tools'
import { getAllGames } from '@/config/games'
import { useRecentTools, useFavorites } from '@/lib/storage'
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Gamepad2,
  Star,
  History,
  Layers,
} from 'lucide-react'

export default function HomePage() {
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [myToolsTab, setMyToolsTab] = useState<'recent' | 'favorites'>('recent')
  const { locale } = useI18n()
  const isZh = locale === 'zh'

  const categories = useMemo(() => getAllCategories(), [])
  const featuredTools = useMemo(() => getFeaturedTools().slice(0, 6), [])
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

  // 8 Exact Hot Keywords formatted as minimal text chips
  const popularKeywords = [
    { label: isZh ? '房贷计算' : 'Mortgage', href: '/tools/finance/mortgage' },
    { label: 'BMI', href: '/tools/health/bmi' },
    { label: isZh ? '时间戳' : 'Timestamp', href: '/tools/convert/timestamp' },
    { label: isZh ? '二维码' : 'QR Code', href: '/tools/convert/qrcode' },
    { label: isZh ? '密码生成' : 'Password', href: '/tools/daily/password' },
    { label: isZh ? '单位换算' : 'Unit', href: '/tools/convert/unit' },
    { label: 'Hash', href: '/tools/convert/hash' },
    { label: isZh ? '显存估算' : 'GPU VRAM', href: '/tools/ai/gpu-calculator' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="flex-1">
        {/* ==================== 1. SEARCH-FIRST EDITORIAL HERO ==================== */}
        <section className="px-4 sm:px-6 pt-14 pb-12 sm:pt-20 sm:pb-16 border-b border-border/70 bg-surface/30">
          <div className="max-w-3xl mx-auto text-center">
            {/* Small Brand Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-surface text-text-muted text-[11px] font-mono uppercase tracking-wider mb-5 shadow-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>BITNOOK · {isZh ? '你的数字工具角落' : 'YOUR DIGITAL NOOK'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-semibold text-text-primary tracking-tight leading-[1.18] mb-4">
              {isZh ? (
                <>
                  一站搞定，方寸万象。<br />
                  <span className="text-text-secondary text-2xl sm:text-4xl font-normal">
                    你每天都会用到的纯粹工具。
                  </span>
                </>
              ) : (
                <>
                  All Tools, One Nook.<br />
                  <span className="text-text-secondary text-2xl sm:text-4xl font-normal">
                    Quiet, authentic utilities for your daily focus.
                  </span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto leading-relaxed mb-8">
              {isZh
                ? '收录 35 款本地优先计算器与生产力工作台，输入默认不离设备，零弹窗、零多余跳转。'
                : '35 local-first calculators and precision workbenches. Clean, fast, zero telemetry.'}
            </p>

            {/* Commanding Search Trigger Bar */}
            <div className="max-w-xl mx-auto mb-4">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="w-full h-14 sm:h-16 px-4 sm:px-5 rounded-lg border border-border bg-surface hover:border-accent/40 shadow-subtle hover:shadow-dropdown transition-all flex items-center justify-between text-left group cursor-pointer"
                aria-label="开启全局搜索"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Search className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-xs sm:text-sm text-text-muted group-hover:text-text-secondary transition-colors truncate">
                    {isZh ? '搜索工具、计算器、格式转换……' : 'Search tools, calculators, converters...'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border border-border bg-surface-secondary text-text-muted">
                    ⌘ K
                  </kbd>
                </div>
              </button>
            </div>

            {/* Minimal Text Chips for Popular Searches */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-text-muted">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-mono">
                {isZh ? '热门检索:' : 'Popular:'}
              </span>
              {popularKeywords.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-text-secondary hover:text-accent transition-colors underline-offset-2 hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== 2. MY WORKSPACE (CONDITIONAL) ==================== */}
        {hasMyTools && (
          <section className="py-8 border-b border-border/70 bg-surface/20">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-text-primary">
                    {isZh ? '我的工具抽屉' : 'My Tools'}
                  </span>
                  <div className="flex rounded-md border border-border p-0.5 bg-surface-secondary">
                    <button
                      type="button"
                      onClick={() => setMyToolsTab('recent')}
                      className={`px-2.5 py-0.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                        myToolsTab === 'recent'
                          ? 'bg-surface text-text-primary shadow-subtle'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {isZh ? '最近使用' : 'Recent'} ({recentToolItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMyToolsTab('favorites')}
                      className={`px-2.5 py-0.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                        myToolsTab === 'favorites'
                          ? 'bg-surface text-text-primary shadow-subtle'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {isZh ? '我的收藏' : 'Saved'} ({favoriteToolItems.length})
                    </button>
                  </div>
                </div>

                <Link
                  href="/tools"
                  className="text-xs text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  <span>{isZh ? '查看全部' : 'View all'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {(myToolsTab === 'recent' ? recentToolItems : favoriteToolItems)
                  .slice(0, 4)
                  .map((t) => (
                    <ToolCard key={t.slug} tool={t} />
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== 3. POPULAR ESSENTIALS (NUMBERED 01~06) ==================== */}
        <section className="py-12 sm:py-16 border-b border-border/70">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase text-accent mb-1">
                  <span>ESSENTIAL UTILITIES</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
                  {isZh ? '高频工具 · 快速启动' : 'Popular Essentials'}
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  {isZh
                    ? '日常高频使用的旗舰计算器与生产力模块，无弹窗、不卡顿。'
                    : 'Curated daily calculators with exact formulas and zero friction.'}
                </p>
              </div>

              <Link
                href="/tools"
                className="text-xs text-text-muted hover:text-accent font-medium inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
              >
                <span>{isZh ? '浏览全部 35 款工具 →' : 'Browse all 35 tools →'}</span>
              </Link>
            </div>

            {/* High-density Editorial List with Numbering 01~06 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {featuredTools.map((tool, idx) => (
                <ToolRow key={tool.slug} tool={tool} index={idx + 1} />
              ))}
            </div>
          </div>
        </section>

        {/* ==================== 4. CATEGORIES INDEX (COMPARTMENTS) ==================== */}
        <section className="py-12 sm:py-16 border-b border-border/70 bg-surface/30">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase text-text-muted mb-1">
                  <span>TOOL DIRECTORY</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
                  {isZh ? '方寸收纳 · 分类索引' : 'Categories Directory'}
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  {isZh
                    ? '涵盖日常、金融、健康、格式、网络与大模型等领域的专用工具。'
                    : 'Domain-specific tool compartments arranged with architectural clarity.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {categories.map((cat) => {
                const catAllTools = allTools.filter((t) => t.category === cat.slug)
                const catTools = catAllTools.slice(0, 3)
                const toolCount = catAllTools.length
                return (
                  <div
                    key={cat.slug}
                    className="rounded-lg border border-border/80 bg-surface p-4 shadow-subtle hover:border-border-hover transition-colors flex flex-col justify-between"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <DynamicIcon name={cat.iconName} className="w-4 h-4 text-accent" />
                          <span className="text-sm font-semibold text-text-primary">
                            {isZh ? cat.name : cat.nameEn}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-text-muted px-1.5 py-0.2 rounded bg-surface-secondary border border-border/60">
                          {toolCount} {isZh ? '款' : 'tools'}
                        </span>
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">
                        {isZh ? cat.description : cat.descriptionEn}
                      </p>

                      {/* Tool Quick Links */}
                      <div className="space-y-1 mb-3 pt-2.5 border-t border-border/60">
                        {catTools.map((t) => (
                          <Link
                            key={t.slug}
                            href={t.href}
                            className="flex items-center justify-between py-1 text-xs text-text-secondary hover:text-accent transition-colors group"
                          >
                            <span className="truncate">{isZh ? t.name : t.nameEn}</span>
                            <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/tools/${cat.slug}`}
                      className="text-[11px] font-medium text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1 pt-2 border-t border-border/50"
                    >
                      <span>{isZh ? `查看全部 ${toolCount} 款 →` : `View all ${toolCount} →`}</span>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ==================== 5. CLASSIC GAMES BREAK ==================== */}
        <section className="py-12 sm:py-16 border-b border-border/70">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase text-accent mb-1">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>BREAK & PLAY</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
                  {isZh ? '工作之余 · 经典小憩' : 'Classic Break Games'}
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  {isZh
                    ? '无需下载、即开即玩的经典益智小游戏，助您在编码与办公间隙快速切换心境。'
                    : 'Lightweight web games to reset your mind between deep focus sessions.'}
                </p>
              </div>

              <Link
                href="/games"
                className="text-xs text-text-muted hover:text-accent font-medium inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
              >
                <span>{isZh ? '查看全部 8 款游戏 →' : 'View all 8 games →'}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {games.map((g) => (
                <Link
                  key={g.slug}
                  href={`/games/${g.slug}`}
                  className="group rounded-lg border border-border/80 bg-surface p-4 shadow-subtle hover:border-border-hover hover:bg-surface-secondary/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-8 h-8 rounded-md bg-surface-secondary/80 border border-border/60 flex items-center justify-center text-accent group-hover:bg-accent-subtle/50 transition-colors">
                        <DynamicIcon name={g.iconName} className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-[10px] text-text-muted uppercase px-1.5 py-0.2 rounded bg-surface-secondary border border-border/60">
                        {g.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">
                      {isZh ? g.name : g.nameEn}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {isZh ? g.description : g.descriptionEn}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
                    <span className="text-[11px] text-text-muted">{isZh ? '即点即玩' : 'Instant Play'}</span>
                    <span className="text-text-muted group-hover:text-accent font-medium inline-flex items-center gap-1 transition-colors">
                      <span>{isZh ? '开始' : 'Play'}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-page Non-intrusive Ad Container */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 my-6">
          <AdSlot slotId="home-feed-banner" format="horizontal" />
        </div>

        {/* ==================== 6. TRUST & PRINCIPLES MANIFESTO ==================== */}
        <section className="py-12 border-t border-border/70 bg-surface/20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-surface border border-border shadow-subtle flex items-center justify-center text-success shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">
                    {isZh ? '本地运算优先' : 'Local-First Architecture'}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {isZh
                      ? '核心算法均在客户端浏览器完成，输入数据默认不离设备，杜绝任何未经许可的数据上报。'
                      : 'Client-side processing by default. Your inputs stay private in your browser memory.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-surface border border-border shadow-subtle flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">
                    {isZh ? '即开即用 · 零干扰' : 'Zero Friction & Noise'}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {isZh
                      ? '无强迫注册登录，无弹窗打扰，为效率而生的方寸工作台，每一次访问都直接直达结果。'
                      : 'No registration walls, no popups. Straightforward productivity when you need it.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-surface border border-border shadow-subtle flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">
                    {isZh ? '严谨数学 · 拒绝假数据' : 'Mathematical Rigor'}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {isZh
                      ? '使用精确的高精度浮点数模型与官方基准计算，全站工具通过严格红队自动化测试。'
                      : 'Built on rigorous mathematical models, verified by automated end-to-end audits.'}
                  </p>
                </div>
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
