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
import { ArrowRight, History, Play, Gamepad2, Sparkles } from 'lucide-react'

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
    <div className="flex flex-col min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Top Game Portal Hero Header */}
          <div className="mb-7 pb-5 border-b border-border/70">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase text-accent mb-1.5">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>MINI GAME PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
              {isZh ? '经典小憩 · 8 款解压益智游戏' : 'Classic Break Games · 8 Mini-Games'}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {isZh
                ? '无需安装、即开即玩的纯前端桌游与策略游戏，在深度工作与编码间隙重拾专注心境。'
                : 'Lightweight, client-only games designed to reset your focus between tasks.'}
            </p>
          </div>

          {/* Continue Playing / Recently Played (If exists) */}
          {recentGameItems.length > 0 && (
            <div className="mb-8 p-3.5 rounded-lg border border-border/80 bg-surface shadow-subtle">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                  <History className="w-3.5 h-3.5 text-success" />
                  <span>{isZh ? '最近在玩' : 'Continue Playing'}</span>
                </div>
                <span className="text-[11px] text-text-muted font-mono">
                  {recentGameItems.length} {isZh ? '款记录' : 'games'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {recentGameItems.map((game) => (
                  <Link
                    key={`recent-${game.slug}`}
                    href={game.href}
                    className="group flex items-center gap-2.5 p-2 rounded-lg border border-border/70 bg-surface-secondary/60 hover:bg-surface-secondary hover:border-border transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md bg-surface border border-border/60 flex items-center justify-center shrink-0 text-accent group-hover:bg-accent-subtle/50 transition-colors">
                      <DynamicIcon name={game.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                        {isZh ? game.name : game.nameEn}
                      </h4>
                      <span className="text-[10px] text-text-muted capitalize font-mono">
                        {game.category}
                      </span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-text-muted group-hover:text-accent shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
            {(Object.keys(categoryLabels) as GameCategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-accent text-white font-semibold shadow-subtle'
                    : 'bg-surface border border-border/80 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70'
                }`}
              >
                {isZh ? categoryLabels[cat].zh : categoryLabels[cat].en}
              </button>
            ))}
          </div>

          {/* 8 Modern Game Portal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {filteredGames.map((game) => (
              <Link
                key={game.slug}
                href={game.href}
                className="group rounded-xl border border-border/80 bg-surface p-4 shadow-subtle hover:border-border-hover hover:bg-surface-secondary/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-secondary/80 border border-border/70 flex items-center justify-center text-accent group-hover:bg-accent-subtle/50 transition-colors">
                      <DynamicIcon name={game.iconName} className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase text-text-muted px-1.5 py-0.5 rounded bg-surface-secondary border border-border/60">
                      {game.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">
                    {isZh ? game.name : game.nameEn}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {isZh ? game.description : game.descriptionEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
                  <span className="text-[11px] font-mono text-text-muted">
                    {isZh ? '免下载 · 即开即玩' : 'Instant Web'}
                  </span>
                  <span className="text-text-muted group-hover:text-accent font-medium inline-flex items-center gap-1 transition-colors">
                    <span>{isZh ? '开始游戏' : 'Play'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Ad Slot */}
          <div className="pt-2">
            <AdSlot slotId="games-hub-bottom" format="horizontal" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
