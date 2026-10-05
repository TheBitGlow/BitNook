'use client'

import { useState, useCallback, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import { RotateCcw, Trophy, Zap, Sparkles, Shuffle } from 'lucide-react'

const GRID_SIZE = 8
const TOTAL_MOVES = 30

interface GemColor {
  name: string
  bg: string
  border: string
  glow: string
  icon: string
}

const GEMS: GemColor[] = [
  { name: 'ruby', bg: 'bg-rose-500', border: 'border-rose-400', glow: 'shadow-rose-500/50', icon: '💎' },
  { name: 'amber', bg: 'bg-amber-500', border: 'border-amber-400', glow: 'shadow-amber-500/50', icon: '⭐' },
  { name: 'emerald', bg: 'bg-emerald-500', border: 'border-emerald-400', glow: 'shadow-emerald-500/50', icon: '🍀' },
  { name: 'sapphire', bg: 'bg-blue-500', border: 'border-blue-400', glow: 'shadow-blue-500/50', icon: '💧' },
  { name: 'amethyst', bg: 'bg-purple-500', border: 'border-purple-400', glow: 'shadow-purple-500/50', icon: '🔮' },
  { name: 'topaz', bg: 'bg-pink-500', border: 'border-pink-400', glow: 'shadow-pink-500/50', icon: '🌸' },
]

type Grid = (number | null)[][]

function generateMatchFreeGrid(): Grid {
  const g: Grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      let candidate: number
      do {
        candidate = Math.floor(Math.random() * GEMS.length)
      } while (
        (c >= 2 && g[r][c - 1] === candidate && g[r][c - 2] === candidate) ||
        (r >= 2 && g[r - 1][c] === candidate && g[r - 2][c] === candidate)
      )
      g[r][c] = candidate
    }
  }
  return g
}

function findMatches(g: Grid): { coords: Set<string>; maxRun: number } {
  const coords = new Set<string>()
  let maxRun = 0

  // Horizontal runs
  for (let r = 0; r < GRID_SIZE; r++) {
    let matchLen = 1
    for (let c = 1; c < GRID_SIZE; c++) {
      if (g[r][c] !== null && g[r][c] === g[r][c - 1]) {
        matchLen++
      } else {
        if (matchLen >= 3) {
          maxRun = Math.max(maxRun, matchLen)
          for (let k = c - matchLen; k < c; k++) coords.add(`${r},${k}`)
        }
        matchLen = 1
      }
    }
    if (matchLen >= 3) {
      maxRun = Math.max(maxRun, matchLen)
      for (let k = GRID_SIZE - matchLen; k < GRID_SIZE; k++) coords.add(`${r},${k}`)
    }
  }

  // Vertical runs
  for (let c = 0; c < GRID_SIZE; c++) {
    let matchLen = 1
    for (let r = 1; r < GRID_SIZE; r++) {
      if (g[r][c] !== null && g[r][c] === g[r - 1][c]) {
        matchLen++
      } else {
        if (matchLen >= 3) {
          maxRun = Math.max(maxRun, matchLen)
          for (let k = r - matchLen; k < r; k++) coords.add(`${k},${c}`)
        }
        matchLen = 1
      }
    }
    if (matchLen >= 3) {
      maxRun = Math.max(maxRun, matchLen)
      for (let k = GRID_SIZE - matchLen; k < GRID_SIZE; k++) coords.add(`${k},${c}`)
    }
  }

  return { coords, maxRun }
}

function checkValidMovesExist(g: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      // Try swap right
      if (c < GRID_SIZE - 1) {
        const copy = g.map((row) => [...row])
        const temp = copy[r][c]
        copy[r][c] = copy[r][c + 1]
        copy[r][c + 1] = temp
        if (findMatches(copy).coords.size > 0) return true
      }
      // Try swap down
      if (r < GRID_SIZE - 1) {
        const copy = g.map((row) => [...row])
        const temp = copy[r][c]
        copy[r][c] = copy[r + 1][c]
        copy[r + 1][c] = temp
        if (findMatches(copy).coords.size > 0) return true
      }
    }
  }
  return false
}

export default function Match3Page() {
  const [grid, setGrid] = useState<Grid>(() => generateMatchFreeGrid())
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bitnook_match3_highscore')
        if (saved) return Number(saved)
      } catch {
        // ignore
      }
    }
    return 0
  })
  const [movesLeft, setMovesLeft] = useState(TOTAL_MOVES)
  const [combo, setCombo] = useState(0)
  const [isCascading, setIsCascading] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)

  const gameOver = movesLeft <= 0 && !isCascading

  // Start new game
  const startNewGame = useCallback(() => {
    let fresh = generateMatchFreeGrid()
    while (!checkValidMovesExist(fresh)) {
      fresh = generateMatchFreeGrid()
    }
    setGrid(fresh)
    setSelected(null)
    setScore(0)
    setMovesLeft(TOTAL_MOVES)
    setCombo(0)
    setIsCascading(false)
    setIsShuffling(false)
  }, [])

  // Cascade fall & fill loop
  useEffect(() => {
    if (!isCascading) return

    const { coords, maxRun } = findMatches(grid)
    if (coords.size === 0) {
      const endTimer = setTimeout(() => {
        setIsCascading(false)
        // Check for deadlock
        if (movesLeft > 0 && !checkValidMovesExist(grid)) {
          setIsShuffling(true)
          setTimeout(() => {
            let reordered = generateMatchFreeGrid()
            while (!checkValidMovesExist(reordered)) {
              reordered = generateMatchFreeGrid()
            }
            setGrid(reordered)
            setIsShuffling(false)
          }, 1200)
        }
      }, 0)
      return () => clearTimeout(endTimer)
    }

    // A match exists, process elimination
    const timer = setTimeout(() => {
      const newGrid = grid.map((row) => [...row])
      // 1. Clear matched cells
      coords.forEach((key) => {
        const [r, c] = key.split(',').map(Number)
        newGrid[r][c] = null
      })

      // Calculate score based on match count, max run, and combo multiplier
      const basePoints = coords.size * 30
      const runBonus = maxRun >= 5 ? 500 : maxRun === 4 ? 200 : 0
      const currentCombo = combo + 1
      const totalPoints = (basePoints + runBonus) * currentCombo

      setScore((s) => {
        const nextScore = s + totalPoints
        if (nextScore > highScore) {
          setHighScore(nextScore)
          try {
            localStorage.setItem('bitnook_match3_highscore', nextScore.toString())
          } catch {
            // ignore
          }
        }
        return nextScore
      })
      setCombo(currentCombo)

      // 2. Drop existing items downward
      for (let c = 0; c < GRID_SIZE; c++) {
        let writeRow = GRID_SIZE - 1
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (newGrid[r][c] !== null) {
            if (r !== writeRow) {
              newGrid[writeRow][c] = newGrid[r][c]
              newGrid[r][c] = null
            }
            writeRow--
          }
        }
        // 3. Spawn new items from top
        for (let r = writeRow; r >= 0; r--) {
          newGrid[r][c] = Math.floor(Math.random() * GEMS.length)
        }
      }

      setGrid(newGrid)
    }, 350)

    return () => clearTimeout(timer)
  }, [grid, isCascading, combo, movesLeft, highScore])

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    if (gameOver || isCascading || isShuffling || movesLeft <= 0) return

    if (!selected) {
      setSelected({ r, c })
      return
    }

    // Second click: check adjacency
    const isAdjacent =
      (Math.abs(selected.r - r) === 1 && selected.c === c) ||
      (Math.abs(selected.c - c) === 1 && selected.r === r)

    if (isAdjacent) {
      // Test swap
      const testGrid = grid.map((row) => [...row])
      const temp = testGrid[r][c]
      testGrid[r][c] = testGrid[selected.r][selected.c]
      testGrid[selected.r][selected.c] = temp

      const matches = findMatches(testGrid)
      if (matches.coords.size > 0) {
        // Valid move!
        setGrid(testGrid)
        setMovesLeft((m) => m - 1)
        setCombo(0)
        setSelected(null)
        setIsCascading(true)
      } else {
        // Invalid swap: re-select or shake
        setSelected({ r, c })
      }
    } else {
      setSelected({ r, c })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400">💎</span>
              <span>经典宝石消消乐 (Match 3)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              三消四消五消连击规则 · 级联自然重力下落 · 死局自动洗牌 · 步数挑战模式
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startNewGame}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-purple-600/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重新开始</span>
            </button>
          </div>
        </div>

        {/* Game Container */}
        <div className="grid grid-cols-1 md:grid-cols-[auto,240px] gap-6 justify-center items-start">
          {/* Main Board */}
          <div className="relative p-4 rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl flex flex-col items-center">
            {/* Shuffling Banner */}
            {isShuffling && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 rounded-2xl flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
                <Shuffle className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                <span className="text-sm font-bold text-white">检测到无解死局</span>
                <span className="text-xs text-slate-400 mt-1">正在自动重新洗牌...</span>
              </div>
            )}

            {/* Game Over Banner */}
            {gameOver && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                <Sparkles className="w-8 h-8 text-amber-400 mb-2" />
                <span className="text-xl font-bold text-white mb-1">挑战结束！</span>
                <span className="text-xs text-slate-400 mb-4 font-mono">最终得分: {score}</span>
                <button
                  onClick={startNewGame}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition"
                >
                  再来一盘
                </button>
              </div>
            )}

            {/* Board Grid */}
            <div
              className="grid gap-1.5 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 select-none shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 44px)`,
              }}
            >
              {grid.map((row, r) =>
                row.map((gemIdx, c) => {
                  const isSel = selected?.r === r && selected?.c === c
                  const gem = gemIdx !== null ? GEMS[gemIdx] : null

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      disabled={isCascading || isShuffling}
                      className={`w-11 h-11 rounded-xl text-lg flex items-center justify-center transition-all duration-150 transform ${
                        isSel
                          ? 'scale-110 ring-4 ring-white shadow-xl z-20 brightness-110'
                          : 'hover:scale-105 active:scale-95'
                      } ${gem ? `${gem.bg} border-2 ${gem.border} ${gem.glow} shadow-md` : 'bg-slate-950/40'}`}
                    >
                      {gem ? gem.icon : ''}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Stats Panel */}
          <div className="space-y-4">
            {/* Moves Left */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 text-center">
              <span className="text-xs text-slate-400 block mb-1">剩余可用步数</span>
              <span className={`text-4xl font-mono font-bold ${movesLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`}>
                {movesLeft}
              </span>
            </div>

            {/* Score & Combo */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">当前得分</span>
                <span className="text-3xl font-mono font-bold text-purple-400">{score}</span>
              </div>
              {combo > 1 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-950/40 p-2 rounded-xl border border-amber-800/40 animate-bounce">
                  <Zap className="w-4 h-4" />
                  <span>{combo} 连击 Combo! 倍率加成</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>历史最高分</span>
                </span>
                <span className="text-xl font-mono font-bold text-amber-400">{highScore}</span>
              </div>
            </div>

            {/* Hint */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">得分提示：</span>
              <p>• 消除 3 颗宝石得基础分</p>
              <p>• 消除 4 颗触发 +200 暴击加成</p>
              <p>• 消除 5 颗触发 +500 超级大奖</p>
              <p>• 连击越多次数，得分倍率越高！</p>
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
