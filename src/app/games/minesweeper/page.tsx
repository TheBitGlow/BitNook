'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import GameLayout from '@/components/games/GameLayout'
import { useRecentGames } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import {
  Difficulty,
  MINESWEEPER_CONFIGS,
  CellData,
  createEmptyGrid,
  populateMines,
  revealCell,
  checkMinesweeperWin,
} from '@/core/games/minesweeper'
import {
  Bomb,
  Flag,
  RotateCcw,
  Clock,
  Smile,
  Frown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

const NUMBER_COLORS = [
  '',
  'text-blue-600 dark:text-blue-400 font-bold',
  'text-emerald-600 dark:text-emerald-400 font-bold',
  'text-rose-600 dark:text-rose-400 font-bold',
  'text-purple-600 dark:text-purple-400 font-bold',
  'text-amber-600 dark:text-amber-400 font-bold',
  'text-cyan-600 dark:text-cyan-400 font-bold',
  'text-pink-600 dark:text-pink-400 font-bold',
  'text-zinc-600 dark:text-zinc-300 font-bold',
]

export default function MinesweeperPage() {
  const { recordRecentGame } = useRecentGames()

  useEffect(() => {
    recordRecentGame('minesweeper')
    trackEvent('game_start', { gameSlug: 'minesweeper' })
  }, [recordRecentGame])

  const [diff, setDiff] = useState<Difficulty>('easy')
  const config = MINESWEEPER_CONFIGS[diff]

  const [board, setBoard] = useState<CellData[][]>(() => createEmptyGrid(config.rows, config.cols))
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [timerSec, setTimerSec] = useState(0)
  const [isFlagMode, setIsFlagMode] = useState(false) // Mobile tap toggle

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Count flags
  const flagsCount = useMemo(() => {
    let count = 0
    for (const row of board) {
      for (const cell of row) {
        if (cell.isFlagged) count++
      }
    }
    return count
  }, [board])

  const flagsLeft = config.mines - flagsCount

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      setTimerSec(s => Math.min(999, s + 1))
    }, 1000)
  }, [stopTimer])

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  const startNewGame = useCallback((targetDiff?: Difficulty) => {
    stopTimer()
    const d = targetDiff || diff
    setDiff(d)
    const conf = MINESWEEPER_CONFIGS[d]
    setBoard(createEmptyGrid(conf.rows, conf.cols))
    setStatus('idle')
    setTimerSec(0)
  }, [diff, stopTimer])

  const handleCellClick = (r: number, c: number) => {
    if (status === 'won' || status === 'lost') return

    // Mobile flag toggle mode
    if (isFlagMode) {
      handleToggleFlag(r, c)
      return
    }

    if (board[r][c].isFlagged || board[r][c].isRevealed) return

    let currentGrid = board

    // First click: guaranteed safe 3x3 surrounding
    if (status === 'idle') {
      currentGrid = populateMines(board, config.rows, config.cols, config.mines, r, c)
      setStatus('playing')
      startTimer()
    }

    const { grid: nextGrid, hitMine } = revealCell(currentGrid, config.rows, config.cols, r, c)

    if (hitMine) {
      stopTimer()
      setStatus('lost')
      // Reveal all mines
      const revealedLosingGrid = nextGrid.map(row =>
        row.map(cell => ({
          ...cell,
          isRevealed: cell.isMine ? true : cell.isRevealed,
        }))
      )
      setBoard(revealedLosingGrid)
      return
    }

    setBoard(nextGrid)

    if (checkMinesweeperWin(nextGrid, config.rows, config.cols)) {
      stopTimer()
      setStatus('won')
    }
  }

  const handleToggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (status === 'won' || status === 'lost') return
    if (board[r][c].isRevealed) return

    if (!board[r][c].isFlagged && flagsLeft <= 0) return

    const newGrid = board.map(row => row.map(item => ({ ...item })))
    newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged
    setBoard(newGrid)
  }

  const instructions = [
    { title: '左键点击', desc: '翻开指定方格。首次点击的 3×3 九宫格区域 100% 确保无雷。' },
    { title: '右键插旗', desc: '插上或取消避雷警示旗 🚩。移动端可通过下方触控模式按钮自由切换。' },
    { title: '数字提示', desc: '方格内的数字代表其四周相邻 8 个格子中存在的地雷总数。' },
  ]

  const controls = (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
        <button
          key={d}
          onClick={() => startNewGame(d)}
          className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            diff === d
              ? 'bg-accent text-white shadow-subtle'
              : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          {d === 'easy' ? '初级' : d === 'medium' ? '中级' : '高级'}
        </button>
      ))}
      <button
        onClick={() => startNewGame()}
        className="px-3 py-1.5 rounded-md border border-border bg-surface text-text-primary hover:bg-surface-secondary text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
        title="重置当前难度"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">重置</span>
      </button>
    </div>
  )

  return (
    <GameLayout
      title="经典扫雷"
      titleEn={`Minesweeper (${config.name})`}
      categoryName="益智解谜"
      description="首击九宫格绝对安全算法，支持经典初中高三级难度、数字级联展开与触控插旗切换。"
      controlsNode={controls}
      instructions={instructions}
    >
      <div className="w-full flex flex-col items-center select-none max-w-4xl">
        {/* Status Head Display */}
        <div className="w-full max-w-md flex items-center justify-between p-3.5 mb-5 rounded-xl border border-border bg-surface-secondary/50 font-mono text-sm">
          {/* Flags remaining */}
          <div className="flex items-center gap-2 text-danger">
            <Flag className="w-4 h-4 fill-danger" />
            <span className="text-lg font-bold">{flagsLeft.toString().padStart(3, '0')}</span>
          </div>

          {/* Reset Face */}
          <button
            onClick={() => startNewGame()}
            className="p-2 rounded-lg bg-surface border border-border hover:bg-surface-secondary text-text-primary transition-colors shadow-xs cursor-pointer"
            title="重新开局"
          >
            {status === 'won' ? (
              <Sparkles className="w-5 h-5 text-warning" />
            ) : status === 'lost' ? (
              <Frown className="w-5 h-5 text-danger" />
            ) : (
              <Smile className="w-5 h-5 text-success" />
            )}
          </button>

          {/* Seconds elapsed */}
          <div className="flex items-center gap-2 text-accent">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-bold">
              {Math.min(999, timerSec).toString().padStart(3, '0')}
            </span>
          </div>
        </div>

        {/* Board Surface Grid */}
        <div className="overflow-x-auto max-w-full pb-2">
          <div
            className="grid gap-[2px] p-2.5 rounded-xl border border-border bg-surface-secondary/80 select-none shadow-sm"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, 28px)`,
              gridTemplateRows: `repeat(${config.rows}, 28px)`,
            }}
            onContextMenu={e => e.preventDefault()}
          >
            {board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={e => handleToggleFlag(r, c, e)}
                  className={`w-7 h-7 rounded-[3px] text-xs font-mono font-bold flex items-center justify-center transition-colors cursor-pointer ${
                    cell.isRevealed
                      ? cell.isExploded
                        ? 'bg-danger text-white animate-pulse'
                        : cell.isMine
                        ? 'bg-danger/20 text-danger'
                        : 'bg-surface border border-border/60 shadow-xs'
                      : 'bg-surface-secondary border border-border/80 hover:bg-surface-hover shadow-xs active:scale-95'
                  }`}
                >
                  {cell.isRevealed ? (
                    cell.isMine ? (
                      <Bomb className="w-4 h-4" />
                    ) : cell.neighborMines > 0 ? (
                      <span className={NUMBER_COLORS[cell.neighborMines]}>
                        {cell.neighborMines}
                      </span>
                    ) : null
                  ) : cell.isFlagged ? (
                    <Flag className="w-3.5 h-3.5 text-danger fill-danger" />
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Mobile Flag Mode Toggle Button */}
        <div className="mt-4 flex items-center gap-3 sm:hidden">
          <button
            onClick={() => setIsFlagMode(!isFlagMode)}
            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
              isFlagMode
                ? 'bg-danger text-white shadow-subtle'
                : 'bg-surface border border-border text-text-primary'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{isFlagMode ? '触控：插旗标记 🚩' : '触控：翻开探雷 ⛏️'}</span>
          </button>
        </div>

        {/* Status notification */}
        {status === 'won' && (
          <div className="mt-5 p-4 rounded-xl bg-success-subtle border border-success/30 text-center max-w-sm w-full animate-in fade-in duration-150">
            <div className="flex items-center justify-center gap-2 text-success font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>恭喜排雷通关！总耗时: {timerSec} 秒</span>
            </div>
          </div>
        )}
        {status === 'lost' && (
          <div className="mt-5 p-4 rounded-xl bg-danger-subtle border border-danger/30 text-center max-w-sm w-full animate-in fade-in duration-150">
            <div className="flex items-center justify-center gap-2 text-danger font-bold text-sm">
              <Bomb className="w-4 h-4" />
              <span>触雷爆炸！再接再厉</span>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
