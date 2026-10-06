'use client'

import React, { useState, useCallback, useEffect } from 'react'
import GameLayout from '@/components/games/GameLayout'
import { useRecentGames } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import { RotateCcw, Trophy, Zap, Sparkles, Shuffle } from 'lucide-react'
import {
  MATCH3_SIZE,
  GEM_TYPES,
  GemType,
  Match3Grid,
  createInitialMatch3Grid,
  findMatches,
  hasAnyValidMoves,
} from '@/core/games/match3'

const TOTAL_MOVES = 30

interface GemMeta {
  bg: string
  border: string
  glow: string
  icon: string
  name: string
}

const GEM_METAS: Record<GemType, GemMeta> = {
  ruby: { bg: 'bg-rose-500', border: 'border-rose-400', glow: 'shadow-rose-500/40', icon: '💎', name: '红宝石' },
  topaz: { bg: 'bg-amber-500', border: 'border-amber-400', glow: 'shadow-amber-500/40', icon: '⭐', name: '黄玉' },
  emerald: { bg: 'bg-emerald-500', border: 'border-emerald-400', glow: 'shadow-emerald-500/40', icon: '🍀', name: '翡翠' },
  sapphire: { bg: 'bg-sky-500', border: 'border-sky-400', glow: 'shadow-sky-500/40', icon: '💧', name: '蓝宝石' },
  amethyst: { bg: 'bg-purple-500', border: 'border-purple-400', glow: 'shadow-purple-500/40', icon: '🔮', name: '紫水晶' },
  diamond: { bg: 'bg-pink-500', border: 'border-pink-400', glow: 'shadow-pink-500/40', icon: '🌸', name: '粉钻' },
}

function getNonDeadlockedGrid(): Match3Grid {
  let g = createInitialMatch3Grid()
  let attempts = 0
  while (!hasAnyValidMoves(g) && attempts < 20) {
    g = createInitialMatch3Grid()
    attempts++
  }
  return g
}

export default function Match3Page() {
  const { recordRecentGame } = useRecentGames()

  useEffect(() => {
    recordRecentGame('match3')
    trackEvent('game_start', { gameSlug: 'match3' })
  }, [recordRecentGame])

  const [grid, setGrid] = useState<Match3Grid>(() => getNonDeadlockedGrid())
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

  const startNewGame = useCallback(() => {
    setGrid(getNonDeadlockedGrid())
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

    const matches = findMatches(grid)
    if (matches.length === 0) {
      const endTimer = setTimeout(() => {
        setIsCascading(false)
        // Check for deadlock
        if (movesLeft > 0 && !hasAnyValidMoves(grid)) {
          setIsShuffling(true)
          setTimeout(() => {
            setGrid(getNonDeadlockedGrid())
            setIsShuffling(false)
          }, 1200)
        }
      }, 0)
      return () => clearTimeout(endTimer)
    }

    // A match exists, process elimination
    const timer = setTimeout(() => {
      const newGrid = grid.map(row => [...row])

      // 1. Clear matched cells
      matches.forEach(({ r, c }) => {
        newGrid[r][c] = null
      })

      // Calculate score based on match count and combo
      const basePoints = matches.length * 30
      const currentCombo = combo + 1
      const bonus = matches.length >= 5 ? 500 : matches.length === 4 ? 200 : 0
      const totalPoints = (basePoints + bonus) * currentCombo

      setScore(s => {
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
      for (let c = 0; c < MATCH3_SIZE; c++) {
        let writeRow = MATCH3_SIZE - 1
        for (let r = MATCH3_SIZE - 1; r >= 0; r--) {
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
          const randomGem = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)]
          newGrid[r][c] = randomGem
        }
      }

      setGrid(newGrid)
    }, 320)

    return () => clearTimeout(timer)
  }, [grid, isCascading, combo, movesLeft, highScore])

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || isCascading || isShuffling || movesLeft <= 0) return

    if (!selected) {
      setSelected({ r, c })
      return
    }

    // Check adjacency
    const dist = Math.abs(selected.r - r) + Math.abs(selected.c - c)
    if (dist === 1) {
      // Test swap
      const testGrid = grid.map(row => [...row])
      const temp = testGrid[r][c]
      testGrid[r][c] = testGrid[selected.r][selected.c]
      testGrid[selected.r][selected.c] = temp

      const matches = findMatches(testGrid)
      if (matches.length >= 3) {
        // Valid move!
        setGrid(testGrid)
        setMovesLeft(m => m - 1)
        setCombo(0)
        setSelected(null)
        setIsCascading(true)
      } else {
        // Invalid swap: change selected
        setSelected({ r, c })
      }
    } else {
      setSelected({ r, c })
    }
  }

  const instructions = [
    { title: '消除规则', desc: '点击相邻的两颗宝石进行交换，达成横向或纵向 3 颗以上同色宝石即可爆破消除。' },
    { title: '连击奖励', desc: '重力下落再次引发消除将触发 Combo 连击加成，单次消除 4 颗或 5 颗将额外奖励高额暴击分。' },
    { title: '防死局机制', desc: '当棋盘出现无解死局时，系统将自动识别并触发重新洗牌。' },
  ]

  const controls = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface text-xs font-mono font-medium text-text-primary">
        <Trophy className="w-3.5 h-3.5 text-amber-500" />
        <span>最高分: {highScore}</span>
      </div>
      <button
        onClick={startNewGame}
        className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors shadow-subtle"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>重新开始</span>
      </button>
    </div>
  )

  return (
    <GameLayout
      title="宝石消消乐"
      titleEn="Match 3 · Jewel Cascade"
      categoryName="益智消除"
      description="经典三消益智游戏。连续匹配 3 颗或以上相同宝石触发爆破，支持级联重力下落、死局智能重排与连击高分倍率机制。"
      controlsNode={controls}
      instructions={instructions}
    >
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-[auto,260px] gap-6 items-start justify-center">
        {/* Game Stage Area */}
        <div className="relative p-3 sm:p-5 rounded-2xl border border-border bg-surface-secondary/40 shadow-subtle flex flex-col items-center">
          {/* Shuffling Banner */}
          {isShuffling && (
            <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm z-30 rounded-2xl flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
              <Shuffle className="w-8 h-8 text-amber-500 animate-spin mb-2" />
              <span className="text-sm font-bold text-text-primary">检测到无解死局</span>
              <span className="text-xs text-text-secondary mt-1">正在自动重新洗牌中...</span>
            </div>
          )}

          {/* Game Over Banner */}
          {gameOver && (
            <div className="absolute inset-0 bg-surface/95 backdrop-blur-md z-30 rounded-2xl flex flex-col items-center justify-center text-center p-6">
              <Sparkles className="w-8 h-8 text-amber-500 mb-2" />
              <span className="text-xl font-bold text-text-primary mb-1">步数耗尽，挑战完成！</span>
              <span className="text-sm text-text-secondary mb-4 font-mono">最终得分: {score}</span>
              <button
                onClick={startNewGame}
                className="px-5 py-2.5 rounded-xl bg-accent text-accent-contrast text-xs font-semibold shadow-subtle hover:bg-accent-hover transition-colors"
              >
                再来一盘
              </button>
            </div>
          )}

          {/* Board Grid */}
          <div
            className="grid gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-2xl border border-border bg-surface shadow-inner select-none max-w-full overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${MATCH3_SIZE}, minmax(36px, 48px))`,
              gridTemplateRows: `repeat(${MATCH3_SIZE}, minmax(36px, 48px))`,
            }}
          >
            {grid.map((row, r) =>
              row.map((gemType, c) => {
                const isSel = selected?.r === r && selected?.c === c
                const gem = gemType ? GEM_METAS[gemType] : null

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={isCascading || isShuffling || gameOver}
                    className={`aspect-square rounded-xl text-lg sm:text-xl flex items-center justify-center transition-all duration-150 transform select-none ${
                      isSel
                        ? 'scale-110 ring-4 ring-accent shadow-lg z-20 brightness-110'
                        : 'hover:scale-105 active:scale-95'
                    } ${
                      gem
                        ? `${gem.bg} border-2 ${gem.border} ${gem.glow} shadow-sm text-white`
                        : 'bg-surface-secondary/50'
                    }`}
                  >
                    {gem ? gem.icon : ''}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Status & Dashboard Side Panel */}
        <div className="space-y-4 w-full">
          {/* Moves Left */}
          <div className="p-4 rounded-xl border border-border bg-surface text-center shadow-subtle">
            <span className="text-xs text-text-muted block mb-1">剩余可用步数</span>
            <span
              className={`text-4xl font-mono font-bold tracking-tight ${
                movesLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-accent'
              }`}
            >
              {movesLeft}
            </span>
          </div>

          {/* Score & Combo */}
          <div className="p-4 rounded-xl border border-border bg-surface space-y-3 shadow-subtle">
            <div>
              <span className="text-xs text-text-muted block">当前得分</span>
              <span className="text-3xl font-mono font-bold text-text-primary">{score}</span>
            </div>
            {combo > 1 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 animate-bounce">
                <Zap className="w-4 h-4" />
                <span>{combo} 连击 Combo! 得分加倍</span>
              </div>
            )}
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>最高纪录</span>
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{highScore}</span>
            </div>
          </div>

          {/* Score Rules Card */}
          <div className="p-4 rounded-xl border border-border bg-surface-secondary/40 text-xs text-text-secondary space-y-1.5">
            <span className="font-semibold text-text-primary block">得分与技巧：</span>
            <p>• 基础消除：每颗宝石 30 分</p>
            <p>• 4消暴击：额外 +200 分</p>
            <p>• 5消大奖：额外 +500 超级大奖</p>
            <p>• 级联连击：每次连击得分倍增</p>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}
