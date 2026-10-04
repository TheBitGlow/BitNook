'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Gamepad2, Play, RotateCcw } from 'lucide-react'

const GRID_SIZE = 8
const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']
const COLOR_SYMBOLS = ['🔴', '🟠', '🟢', '🔵', '🟣', '🩷']

type Grid = (number | null)[][]

export default function Match3Page() {
  const [grid, setGrid] = useState<Grid>([])
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [combo, setCombo] = useState(0)

  const gridRef = useRef(grid)
  useEffect(() => { gridRef.current = grid }, [grid])
  const processingRef = useRef(false)

  const createGrid = useCallback((): Grid => {
    const newGrid: Grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let colorIdx: number
        do {
          colorIdx = Math.floor(Math.random() * COLORS.length)
        } while (
          (c >= 2 && newGrid[r][c - 1] === colorIdx && newGrid[r][c - 2] === colorIdx) ||
          (r >= 2 && newGrid[r - 1]?.[c] === colorIdx && newGrid[r - 2]?.[c] === colorIdx)
        )
        newGrid[r][c] = colorIdx
      }
    }
    return newGrid
  }, [])

  const hasMatch = useCallback((g: Grid): boolean => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        if (g[r][c] !== null && g[r][c] === g[r][c + 1] && g[r][c] === g[r][c + 2]) {
          return true
        }
      }
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        if (g[r][c] !== null && g[r][c] === g[r + 1][c] && g[r][c] === g[r + 2][c]) {
          return true
        }
      }
    }
    return false
  }, [])

  const removeMatchesAndFill = useCallback((g: Grid): { grid: Grid; matches: number } => {
    const newGrid = g.map(row => [...row])
    let matchCount = 0

    const toRemove = new Set<string>()
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        if (newGrid[r][c] !== null &&
            newGrid[r][c] === newGrid[r][c + 1] &&
            newGrid[r][c] === newGrid[r][c + 2]) {
          toRemove.add(`${r},${c}`)
          toRemove.add(`${r},${c + 1}`)
          toRemove.add(`${r},${c + 2}`)
        }
      }
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        if (newGrid[r][c] !== null &&
            newGrid[r][c] === newGrid[r + 1][c] &&
            newGrid[r][c] === newGrid[r + 2][c]) {
          toRemove.add(`${r},${c}`)
          toRemove.add(`${r + 1},${c}`)
          toRemove.add(`${r + 2},${c}`)
        }
      }
    }

    if (toRemove.size > 0) {
      matchCount = toRemove.size
      toRemove.forEach(key => {
        const [r, c] = key.split(',').map(Number)
        newGrid[r][c] = null
      })
    }

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
      for (let r = writeRow; r >= 0; r--) {
        newGrid[r][c] = Math.floor(Math.random() * COLORS.length)
      }
    }

    return { grid: newGrid, matches: matchCount }
  }, [])

  const canSwap = useCallback((g: Grid, r1: number, c1: number, r2: number, c2: number): boolean => {
    const newGrid = g.map(row => [...row])
    const temp = newGrid[r1][c1]
    newGrid[r1][c1] = newGrid[r2][c2]
    newGrid[r2][c2] = temp
    return hasMatch(newGrid)
  }, [hasMatch])

  const canMakeMove = useCallback((g: Grid): boolean => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (c < GRID_SIZE - 1 && canSwap(g, r, c, r, c + 1)) return true
        if (r < GRID_SIZE - 1 && canSwap(g, r, c, r + 1, c)) return true
      }
    }
    return false
  }, [canSwap])

  const initGame = useCallback(() => {
    const newGrid = createGrid()
    setGrid(newGrid)
    gridRef.current = newGrid
    setScore(0)
    setMoves(0)
    setGameOver(false)
    setIsPlaying(true)
    setCombo(0)
    processingRef.current = false
  }, [createGrid])

  useEffect(() => {
    if (!isPlaying || gameOver || processingRef.current) return

    if (!hasMatch(gridRef.current)) {
      processingRef.current = false
      if (moves > 0 && !canMakeMove(gridRef.current)) {
        setGameOver(true)
      }
      return
    }

    processingRef.current = true
    const timer = setTimeout(() => {
      setGrid(prev => {
        const result = removeMatchesAndFill(prev)
        setCombo(c => c + 1)
        setScore(s => s + result.matches * 10)
        gridRef.current = result.grid
        processingRef.current = false
        return result.grid
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [grid, isPlaying, gameOver, moves, hasMatch, removeMatchesAndFill, canMakeMove])

  const handleClick = (r: number, c: number) => {
    if (!isPlaying || gameOver || processingRef.current) return

    if (!selected) {
      setSelected({ r, c })
    } else {
      const { r: sr, c: sc } = selected
      const isAdjacent = (Math.abs(r - sr) === 1 && c === sc) || (Math.abs(c - sc) === 1 && r === sr)

      if (isAdjacent && canSwap(gridRef.current, sr, sc, r, c)) {
        const newGrid = gridRef.current.map(row => [...row])
        const temp = newGrid[r][c]
        newGrid[r][c] = newGrid[sr][sc]
        newGrid[sr][sc] = temp

        setGrid(newGrid)
        gridRef.current = newGrid
        setMoves(m => m + 1)
        setCombo(0)
      }
      setSelected(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-[#EF4444]" />
              </div>
              <h1 className="text-2xl font-bold text-white">消消乐</h1>
            </div>
            <p className="text-[#94A3B8]">宝石消除闯关</p>
          </div>

          {/* Game Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <span className="text-[#10B981] font-bold">得分: {score}</span>
              <span className="text-[#94A3B8]">步数: {moves}</span>
              {combo > 0 && <span className="text-[#F59E0B]">连击: {combo}</span>}
            </div>
            <button
              onClick={initGame}
              className="px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isPlaying ? '重新开始' : '开始'}
            </button>
          </div>

          {/* Grid */}
          <div className="glass-card p-4">
            <div
              className="grid gap-1 mx-auto"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleClick(r, c)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                      selected?.r === r && selected?.c === c
                        ? 'ring-2 ring-white scale-110'
                        : ''
                    }`}
                    style={{
                      backgroundColor: cell !== null ? COLORS[cell] : '#1A2235',
                      boxShadow: cell !== null ? `0 2px 8px ${COLORS[cell]}60` : 'none'
                    }}
                  >
                    {cell !== null && COLOR_SYMBOLS[cell]}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Game Over */}
          {gameOver && (
            <div className="mt-6 glass-card p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">游戏结束！</h2>
              <p className="text-[#94A3B8]">最终得分: {score}</p>
              <button
                onClick={initGame}
                className="mt-4 px-6 py-3 bg-[#EF4444] text-white rounded-xl font-medium hover:bg-[#DC2626] flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                再来一局
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-[#111927]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">规则：</span>
              点击两个相邻的宝石交换位置，3个或以上相同颜色的宝石连成一线即可消除。连击得分更高！
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
