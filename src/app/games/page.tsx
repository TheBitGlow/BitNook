'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Grid3X3, Ghost, Crosshair, Blocks, Gamepad2, Crown, Castle, Spade } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const games = [
  { name: '俄罗斯方块', enName: 'Tetris', slug: 'tetris', icon: Blocks, color: '#EC4899', desc: '经典方块消除游戏', enDesc: 'Classic block-clearing game', difficulty: '简单', enDifficulty: 'Easy', players: 1, href: '/games/tetris' },
  { name: '扫雷', enName: 'Minesweeper', slug: 'minesweeper', icon: Ghost, color: '#6366F1', desc: '扫雷专家挑战', enDesc: 'Classic minesweeper challenge', difficulty: '中等', enDifficulty: 'Medium', players: 1, href: '/games/minesweeper' },
  { name: '贪吃蛇', enName: 'Snake', slug: 'snake', icon: Crosshair, color: '#10B981', desc: '控制蛇吃到更多食物', enDesc: 'Guide the snake to eat more food', difficulty: '简单', enDifficulty: 'Easy', players: 1, href: '/games/snake' },
  { name: '五子棋', enName: 'Gomoku', slug: 'gomoku', icon: Grid3X3, color: '#F59E0B', desc: '双人对弈或AI对战', enDesc: 'Play against another player or AI', difficulty: '中等', enDifficulty: 'Medium', players: '1-2', href: '/games/gomoku' },
  { name: '消消乐', enName: 'Match-3', slug: 'match3', icon: Gamepad2, color: '#EF4444', desc: '宝石消除闯关', enDesc: 'Match gems and clear the board', difficulty: '简单', enDifficulty: 'Easy', players: 1, href: '/games/match3' },
  { name: '国际象棋', enName: 'International Chess', slug: 'chess-international', icon: Crown, color: '#8B5CF6', desc: '全球最流行的棋类游戏', enDesc: 'The world famous strategy board game', difficulty: '困难', enDifficulty: 'Hard', players: '1-2', href: '/games/chess-international' },
  { name: '中国象棋', enName: 'Chinese Chess', slug: 'chess-chinese', icon: Castle, color: '#EC4899', desc: '中国传统棋类游戏', enDesc: 'Traditional Chinese strategy board game', difficulty: '困难', enDifficulty: 'Hard', players: '1-2', href: '/games/chess-chinese' },
  { name: '空当接龙', enName: 'FreeCell', slug: 'freecell', icon: Spade, color: '#06B6D4', desc: '纸牌接龙挑战', enDesc: 'Classic solitaire card challenge', difficulty: '中等', enDifficulty: 'Medium', players: 1, href: '/games/freecell' },
]

export default function GamesPage() {
  const { locale } = useI18n()
  const isZh = locale === 'zh'

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-4">{isZh ? '游戏大厅' : 'Games Hall'}</h1>
            <p className="text-[#94A3B8]">{isZh ? '8款经典游戏，支持单人游玩、双人对弈和 AI 对战' : '8 classic games with solo play, two-player modes, and AI opponents'}</p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <Link
                key={game.slug}
                href={game.href}
                className="glass-card overflow-hidden group"
              >
                <div
                  className="h-32 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${game.color}20 0%, ${game.color}05 100%)` }}
                >
                  <game.icon className="w-16 h-16 group-hover:scale-110 transition-transform" style={{ color: game.color }} />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{isZh ? game.name : game.enName}</h3>
                  </div>
                  <p className="text-sm text-[#475569] mb-3">{isZh ? game.desc : game.enDesc}</p>
                  <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <span style={{ color: game.color }}>●</span> {isZh ? game.difficulty : game.enDifficulty}
                    </span>
                    <span>{game.players === 1 ? (isZh ? '单人' : 'Single player') : (isZh ? `${game.players}人` : `${game.players} players`)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
