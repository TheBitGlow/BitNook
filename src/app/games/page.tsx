'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import DynamicIcon from '@/components/common/DynamicIcon'
import { getAllGames, GameInfo } from '@/config/games'
import { useI18n } from '@/lib/i18n'
import { useRecentGames } from '@/lib/storage'
import { Gamepad2, Sparkles, ArrowRight, History, Play } from 'lucide-react'

type GameCategoryFilter = 'all' | 'puzzle' | 'arcade' | 'strategy' | 'card'

export default function GamesPage() {
  const [selectedCategory, setSelectedCategory] = useState<GameCategoryFilter>('all')
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const games = useMemo(() => getAllGames(), [])
  const { recentGames, isLoaded: recentLoaded } = useRecentGames()

  const gameMap = useMemo(() => {
    const map = new Map<string, GameInfo>()
    for (const g of games) {
      map.set(g.slug, g)
    }
    return map
  }, [games])

  const filteredGames = useMemo(() => {
    if (selectedCategory === 'all') return games
    return games.filter((g) => g.category === selectedCategory)
  }, [games, selectedCategory])

  const recentGameItems = useMemo(() => {
    if (!recentLoaded) return []
    return recentGames.map((slug) => gameMap.get(slug)).filter(Boolean) as GameInfo[]
  }, [recentGames, recentLoaded, gameMap])

  const categoryLabels: Record<GameCategoryFilter, { zh: string; en: string }> = {
    all: { zh: '全部游戏', en: 'All Games' },
    puzzle: { zh: '益智解谜', en: 'Puzzle' },
    arcade: { zh: '休闲街机', en: 'Arcade' },
    strategy: { zh: '策略棋盘', en: 'Strategy' },
    card: { zh: '经典卡牌', en: 'Card' },
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#090D16] text-slate-100">
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isZh ? '纯前端解压小游戏 · 零安装即开即玩' : 'Pure Frontend Mini-Games · Zero Install'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2.5">
              {isZh ? '游戏大厅' : 'Games Hall'}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isZh
                ? `精选 ${games.length} 款经典休闲益智与策略棋类游戏，支持单人闯关、本地双人对弈与智能 AI。`
                : `Enjoy ${games.length} classic puzzle and strategy games featuring single player, local PvP, and heuristic AI.`}
            </p>
          </div>

          <AdSlot slotId="games-top-banner" format="horizontal" />

          {/* Recently Played Shelf */}
          {recentGameItems.length > 0 && (
            <div className="mt-8 mb-8 p-5 rounded-2xl border border-[#1E293B] bg-[#0F1523]">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <History className="w-4 h-4 text-emerald-400" />
                  <span>{isZh ? '最近在玩' : 'Recently Played'}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {isZh ? `${recentGameItems.length} 款记录` : `${recentGameItems.length} games`}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recentGameItems.map((game) => (
                  <Link
                    key={`recent-${game.slug}`}
                    href={game.href}
                    className="group flex items-center gap-3 p-3 rounded-xl border border-[#1E293B] bg-[#141C2E] hover:border-slate-700 hover:bg-[#1A243B] transition"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#090D16] border border-[#1E293B] flex items-center justify-center shrink-0 text-blue-400 group-hover:scale-105 transition-transform">
                      <DynamicIcon name={game.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                        {isZh ? game.name : game.nameEn}
                      </h4>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {game.category}
                      </span>
                    </div>
                    <Play className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="my-6 flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {(['all', 'puzzle', 'arcade', 'strategy', 'card'] as GameCategoryFilter[]).map((cat) => {
              const isActive = selectedCategory === cat
              const count = cat === 'all' ? games.length : games.filter((g) => g.category === cat).length
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'bg-[#0F1523] border border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#141C2E]'
                  }`}
                >
                  <span>{isZh ? categoryLabels[cat].zh : categoryLabels[cat].en}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredGames.map((game) => (
              <Link
                key={game.slug}
                href={game.href}
                className="group rounded-2xl border border-[#1E293B] bg-[#0F1523] p-5 hover:border-slate-700 hover:bg-[#141C2E] transition-all flex flex-col justify-between shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:text-white transition-all">
                      <DynamicIcon name={game.iconName} className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#141C2E] text-slate-400 border border-[#1E293B] font-mono">
                      {game.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm mb-1.5">
                    {isZh ? game.name : game.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {isZh ? game.description : game.descriptionEn}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                    <Gamepad2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isZh ? '即点即玩' : 'Play Now'}</span>
                  </span>
                  <span className="text-slate-400 group-hover:text-blue-400 font-medium inline-flex items-center gap-1 text-[11px] transition-colors">
                    <span>{isZh ? '进入' : 'Launch'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-14">
            <AdSlot slotId="games-bottom-banner" format="horizontal" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
