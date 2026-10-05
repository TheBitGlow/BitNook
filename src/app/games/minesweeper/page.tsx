'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import {
  Bomb,
  Flag,
  RotateCcw,
  Trophy,
  Clock,
  Smile,
  Frown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

type Difficulty = 'easy' | 'medium' | 'hard'

interface DiffConfig {
  rows: number
  cols: number
  mines: number
  name: string
}

const CONFIGS: Record<Difficulty, DiffConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, name: '初级 (9×9 · 10雷)' },
  medium: { rows: 16, cols: 16, mines: 40, name: '中级 (16×16 · 40雷)' },
  hard: { rows: 16, cols: 30, mines: 99, name: '高级 (16×30 · 99雷)' },
}

interface CellData {
  r: number
  c: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
  isExploded?: boolean
  isFalseFlag?: boolean
}

const NUMBER_COLORS = [
  '',
  'text-blue-400 font-bold',
  'text-emerald-400 font-bold',
  'text-rose-400 font-bold',
  'text-purple-400 font-bold',
  'text-amber-400 font-bold',
  'text-cyan-400 font-bold',
  'text-pink-400 font-bold',
  'text-slate-200 font-bold',
]

function createEmptyGrid(rows: number, cols: number): CellData[][] {
  const grid: CellData[][] = []
  for (let r = 0; r < rows; r++) {
    grid[r] = []
    for (let c = 0; c < cols; c++) {
      grid[r][c] = {
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }
    }
  }
  return grid
}

// Populate mines ensuring 3x3 surrounding the first click is 100% mine-free
function populateMinesAndNumbers(
  initialGrid: CellData[][],
  firstR: number,
  firstC: number,
  rows: number,
  cols: number,
  totalMines: number
): CellData[][] {
  const grid = initialGrid.map((row) => row.map((cell) => ({ ...cell })))

  // Collect valid candidate spots (excluding 3x3 around first click)
  const candidates: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isProtected = Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1
      if (!isProtected) {
        candidates.push([r, c])
      }
    }
  }

  // Shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  // Place mines
  const placedMines = candidates.slice(0, totalMines)
  placedMines.forEach(([r, c]) => {
    grid[r][c].isMine = true
  })

  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c].isMine) {
        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
              count++
            }
          }
        }
        grid[r][c].neighborMines = count
      }
    }
  }

  return grid
}

export default function MinesweeperPage() {
  const [diff, setDiff] = useState<Difficulty>('easy')
  const config = CONFIGS[diff]

  // Board state
  const [board, setBoard] = useState<CellData[][]>(() => createEmptyGrid(9, 9))
  const [isFirstClick, setIsFirstClick] = useState(true)
  const [isFlagMode, setIsFlagMode] = useState(false) // Mobile tap toggle

  // Game state
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [timerSec, setTimerSec] = useState(0)
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number | null>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bitnook_minesweeper_records')
        if (saved) return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return { easy: null, medium: null, hard: null }
  })

  // Timer tick
  useEffect(() => {
    if (status !== 'playing') return
    const interval = setInterval(() => {
      setTimerSec((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [status])

  // Count flags
  const flagsUsed = useMemo(() => {
    let count = 0
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c].isFlagged) count++
      }
    }
    return count
  }, [board])

  const flagsLeft = Math.max(0, config.mines - flagsUsed)

  // Reset / Change difficulty
  const startNewGame = useCallback((targetDiff?: Difficulty) => {
    const nextDiff = targetDiff || diff
    setDiff(nextDiff)
    const nextCfg = CONFIGS[nextDiff]
    setBoard(createEmptyGrid(nextCfg.rows, nextCfg.cols))
    setIsFirstClick(true)
    setStatus('idle')
    setTimerSec(0)
  }, [diff])

  // Flood fill cascade revealing blanks
  const floodReveal = (grid: CellData[][], startR: number, startC: number) => {
    const rows = config.rows
    const cols = config.cols
    const queue: [number, number][] = [[startR, startC]]
    grid[startR][startC].isRevealed = true

    while (queue.length > 0) {
      const [r, c] = queue.shift()!
      if (grid[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = grid[nr][nc]
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                neighbor.isRevealed = true
                if (neighbor.neighborMines === 0) {
                  queue.push([nr, nc])
                }
              }
            }
          }
        }
      }
    }
  }

  // Check victory condition
  const checkVictory = (grid: CellData[][]) => {
    let unrevealedNonMines = 0
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (!grid[r][c].isMine && !grid[r][c].isRevealed) {
          unrevealedNonMines++
        }
      }
    }

    if (unrevealedNonMines === 0) {
      setStatus('won')
      // Save best record
      setBestTimes((prev) => {
        const currentBest = prev[diff]
        if (currentBest === null || timerSec < currentBest) {
          const updated = { ...prev, [diff]: timerSec }
          try {
            localStorage.setItem('bitnook_minesweeper_records', JSON.stringify(updated))
          } catch {
            // ignore
          }
          return updated
        }
        return prev
      })
    }
  }

  // Click on cell
  const handleCellClick = (r: number, c: number) => {
    if (status === 'won' || status === 'lost') return

    // If mobile flag mode is active, toggle flag instead
    if (isFlagMode) {
      handleToggleFlag(r, c)
      return
    }

    let activeGrid = board
    if (isFirstClick) {
      activeGrid = populateMinesAndNumbers(board, r, c, config.rows, config.cols, config.mines)
      setIsFirstClick(false)
      setStatus('playing')
    }

    const cell = activeGrid[r][c]
    if (cell.isRevealed || cell.isFlagged) return

    const newGrid = activeGrid.map((row) => row.map((item) => ({ ...item })))

    // Hit a mine!
    if (newGrid[r][c].isMine) {
      newGrid[r][c].isRevealed = true
      newGrid[r][c].isExploded = true

      // Reveal all mines and flag errors
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          if (newGrid[row][col].isMine) {
            newGrid[row][col].isRevealed = true
          } else if (newGrid[row][col].isFlagged && !newGrid[row][col].isMine) {
            newGrid[row][col].isFalseFlag = true
          }
        }
      }

      setBoard(newGrid)
      setStatus('lost')
      return
    }

    // Non-mine click
    floodReveal(newGrid, r, c)
    setBoard(newGrid)
    checkVictory(newGrid)
  }

  // Right-click toggle flag
  const handleToggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (status === 'won' || status === 'lost') return
    if (board[r][c].isRevealed) return

    // Prevent placing flag if already reached limit
    if (!board[r][c].isFlagged && flagsLeft <= 0) return

    const newGrid = board.map((row) => row.map((item) => ({ ...item })))
    newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged
    setBoard(newGrid)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header & Difficulty */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">💣</span>
              <span>经典扫雷 (Minesweeper)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              初次点击九宫格绝对安全 · 空白级联展开 · 旗帜计数保护 · 本地历史最佳记录
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => startNewGame(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  diff === d
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d === 'easy' ? '初级' : d === 'medium' ? '中级' : '高级'}
              </button>
            ))}
          </div>
        </div>

        {/* Game Container */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl flex flex-col items-center">
          {/* Top Status Bar */}
          <div className="w-full max-w-xl flex items-center justify-between p-3.5 mb-6 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-sm">
            {/* Flags left */}
            <div className="flex items-center gap-2 text-rose-400">
              <Flag className="w-4 h-4" />
              <span className="text-lg font-bold">{flagsLeft.toString().padStart(3, '0')}</span>
            </div>

            {/* Restart Face Button */}
            <button
              onClick={() => startNewGame()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition shadow-sm"
              title="重置棋盘"
            >
              {status === 'won' ? (
                <Sparkles className="w-5 h-5 text-amber-400" />
              ) : status === 'lost' ? (
                <Frown className="w-5 h-5 text-rose-400" />
              ) : (
                <Smile className="w-5 h-5 text-emerald-400" />
              )}
            </button>

            {/* Timer */}
            <div className="flex items-center gap-2 text-indigo-400">
              <Clock className="w-4 h-4" />
              <span className="text-lg font-bold">
                {Math.min(999, timerSec).toString().padStart(3, '0')}
              </span>
            </div>
          </div>

          {/* Board Grid */}
          <div className="overflow-x-auto max-w-full pb-4">
            <div
              className="grid gap-[2px] bg-slate-800 p-2 rounded-xl border border-slate-700 select-none shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${config.cols}, 28px)`,
                gridTemplateRows: `repeat(${config.rows}, 28px)`,
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {board.map((row, r) =>
                row.map((cell, c) => {
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      onContextMenu={(e) => handleToggleFlag(r, c, e)}
                      className={`w-7 h-7 rounded-[3px] text-xs font-mono font-bold flex items-center justify-center transition-colors ${
                        cell.isRevealed
                          ? cell.isExploded
                            ? 'bg-rose-600 text-white animate-pulse'
                            : cell.isMine
                            ? 'bg-rose-950 text-rose-400'
                            : 'bg-slate-950/80 border border-slate-900/60'
                          : 'bg-slate-700/80 hover:bg-slate-600 shadow-sm border-t border-l border-slate-600 border-b-2 border-r-2 border-slate-900 active:border-none'
                      }`}
                    >
                      {cell.isRevealed ? (
                        cell.isMine ? (
                          <Bomb className="w-4 h-4" />
                        ) : cell.neighborMines > 0 ? (
                          <span className={NUMBER_COLORS[cell.neighborMines]}>{cell.neighborMines}</span>
                        ) : null
                      ) : cell.isFlagged ? (
                        <Flag className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      ) : null}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Mobile Tap Mode Toggle */}
          <div className="mt-4 flex items-center gap-3 sm:hidden">
            <button
              onClick={() => setIsFlagMode(!isFlagMode)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition border ${
                isFlagMode
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>{isFlagMode ? '触控模式: 插旗 🚩' : '触控模式: 翻开 ⛏️'}</span>
            </button>
          </div>

          {/* Results Modal / Notification */}
          {status === 'won' && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/60 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>恭喜通关！耗时: {timerSec} 秒</span>
              </div>
              <p className="text-xs text-slate-300">成功清除所有地雷，技术精湛！</p>
            </div>
          )}

          {status === 'lost' && (
            <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-600/60 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
                <Bomb className="w-4 h-4" />
                <span>触雷遗憾失败！</span>
              </div>
              <p className="text-xs text-slate-300">点击笑脸重新开始，再接再厉！</p>
            </div>
          )}

          {/* Best Record Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-400 border-t border-slate-800 pt-6 w-full">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>初级最佳纪录: </span>
              <strong className="text-white font-mono">{bestTimes.easy ? `${bestTimes.easy}s` : '暂无'}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>中级最佳纪录: </span>
              <strong className="text-white font-mono">{bestTimes.medium ? `${bestTimes.medium}s` : '暂无'}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>高级最佳纪录: </span>
              <strong className="text-white font-mono">{bestTimes.hard ? `${bestTimes.hard}s` : '暂无'}</strong>
            </div>
          </div>
        </div>

        {/* Non-intrusive AdSlot */}
        <AdSlot placement="tool-bottom" className="mt-8" />
      </main>

      <Footer />
    </div>
  )
}
