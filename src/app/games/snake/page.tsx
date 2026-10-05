'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import { useRecentGames } from '@/lib/storage'
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react'

const GRID_SIZE = 20

type Position = { x: number; y: number }

export default function SnakeGamePage() {
  const { recordRecentGame } = useRecentGames()

  useEffect(() => {
    recordRecentGame('snake')
  }, [recordRecentGame])

  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ])
  const [food, setFood] = useState<Position>({ x: 15, y: 10 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bitnook_snake_highscore')
        if (saved) return Number(saved)
      } catch {
        // ignore
      }
    }
    return 0
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [wrapMode, setWrapMode] = useState(false)

  // Direction state & input buffer to prevent 180-degree suicide
  const currentDirRef = useRef<Position>({ x: 1, y: 0 })
  const nextDirsQueue = useRef<Position[]>([])
  const snakeRef = useRef(snake)
  const isPlayingRef = useRef(isPlaying)
  const gameOverRef = useRef(gameOver)
  const wrapModeRef = useRef(wrapMode)

  useEffect(() => {
    snakeRef.current = snake
  }, [snake])
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])
  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])
  useEffect(() => {
    wrapModeRef.current = wrapMode
  }, [wrapMode])

  // Spawn food safely outside snake body
  const spawnFood = useCallback((currentSnake: Position[]): Position => {
    const occupied = new Set(currentSnake.map((p) => `${p.x},${p.y}`))
    const freeSpots: Position[] = []

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!occupied.has(`${x},${y}`)) {
          freeSpots.push({ x, y })
        }
      }
    }

    if (freeSpots.length === 0) return { x: 0, y: 0 }
    const chosen = freeSpots[Math.floor(Math.random() * freeSpots.length)]
    return chosen
  }, [])

  // Start / Reset
  const resetGame = useCallback(() => {
    const initSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]
    setSnake(initSnake)
    currentDirRef.current = { x: 1, y: 0 }
    nextDirsQueue.current = []

    const firstFood = spawnFood(initSnake)
    setFood(firstFood)

    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
  }, [spawnFood])

  // Change direction with queue buffer
  const queueDirection = useCallback((newDir: Position) => {
    const lastDir =
      nextDirsQueue.current.length > 0
        ? nextDirsQueue.current[nextDirsQueue.current.length - 1]
        : currentDirRef.current

    // Disallow 180-degree immediate reversal
    if (newDir.x === -lastDir.x && newDir.y === -lastDir.y) return
    // Disallow identical redundant queues
    if (newDir.x === lastDir.x && newDir.y === lastDir.y) return

    if (nextDirsQueue.current.length < 2) {
      nextDirsQueue.current.push(newDir)
    }
  }, [])

  // Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return

    // Dynamic speed based on score (150ms -> down to 70ms)
    const tickInterval = Math.max(70, 150 - Math.floor(score / 30) * 10)

    const timer = setInterval(() => {
      if (!isPlayingRef.current || gameOverRef.current) return

      // Consume buffered direction
      if (nextDirsQueue.current.length > 0) {
        currentDirRef.current = nextDirsQueue.current.shift()!
      }

      const dir = currentDirRef.current
      const curSnake = [...snakeRef.current]
      const head = curSnake[0]

      let nextX = head.x + dir.x
      let nextY = head.y + dir.y

      // Wall collision handling
      if (wrapModeRef.current) {
        if (nextX < 0) nextX = GRID_SIZE - 1
        else if (nextX >= GRID_SIZE) nextX = 0
        if (nextY < 0) nextY = GRID_SIZE - 1
        else if (nextY >= GRID_SIZE) nextY = 0
      } else {
        if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
          setGameOver(true)
          setIsPlaying(false)
          return
        }
      }

      // Self collision handling (check up to tail - 1 if not eating food)
      const isEating = nextX === food.x && nextY === food.y
      const bodyToCheck = isEating ? curSnake : curSnake.slice(0, -1)
      if (bodyToCheck.some((seg) => seg.x === nextX && seg.y === nextY)) {
        setGameOver(true)
        setIsPlaying(false)
        return
      }

      const newHead = { x: nextX, y: nextY }
      const newSnake = [newHead, ...curSnake]

      if (isEating) {
        setScore((s) => {
          const nextScore = s + 10
          if (nextScore > highScore) {
            setHighScore(nextScore)
            try {
              localStorage.setItem('bitnook_snake_highscore', nextScore.toString())
            } catch {
              // ignore
            }
          }
          return nextScore
        })
        setFood(spawnFood(newSnake))
      } else {
        newSnake.pop()
      }

      setSnake(newSnake)
    }, tickInterval)

    return () => clearInterval(timer)
  }, [isPlaying, gameOver, score, food, highScore, spawnFood])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space or KeyP for pause / resume / restart
      if (e.code === 'KeyP' || e.code === 'Space') {
        e.preventDefault()
        if (gameOver) {
          resetGame()
        } else {
          setIsPlaying((p) => !p)
        }
        return
      }

      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault()
        queueDirection({ x: 0, y: -1 })
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault()
        queueDirection({ x: 0, y: 1 })
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault()
        queueDirection({ x: -1, y: 0 })
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault()
        queueDirection({ x: 1, y: 0 })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, resetGame, queueDirection])

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">🐍</span>
              <span>经典贪吃蛇 (Snake)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              防回踩转向缓冲算法 · 安全无重叠食物生成 · 穿墙/实体墙可选 · 按空格键暂停与继续
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setWrapMode(!wrapMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                wrapMode
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-[#0F1523] border-[#1E293B] text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{wrapMode ? '模式: 穿越边界' : '模式: 实体墙壁'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (gameOver) {
                  resetGame()
                } else {
                  setIsPlaying((p) => !p)
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#0F1523] border border-[#1E293B] hover:bg-[#141C2E] text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isPlaying ? '暂停 (空格)' : '继续 (空格)'}</span>
            </button>
            <button
              type="button"
              onClick={resetGame}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>新对局</span>
            </button>
          </div>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[auto,260px] gap-6 justify-center items-start">
          {/* Main Board Canvas */}
          <div className="relative p-3 rounded-2xl border border-[#1E293B] bg-[#0F1523] shadow-sm flex flex-col items-center">
            <div
              className="grid gap-[1px] bg-[#141C2E] border border-[#1E293B] rounded-xl overflow-hidden shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 18px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 18px)`,
              }}
            >
              {Array.from({ length: GRID_SIZE }).map((_, y) =>
                Array.from({ length: GRID_SIZE }).map((_, x) => {
                  const isHead = snake[0].x === x && snake[0].y === y
                  const isBody = !isHead && snake.some((seg) => seg.x === x && seg.y === y)
                  const isFood = food.x === x && food.y === y

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`w-[18px] h-[18px] rounded-[3px] transition-colors duration-75 ${
                        isHead
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 scale-105 z-10'
                          : isBody
                          ? 'bg-emerald-600'
                          : isFood
                          ? 'bg-rose-500 rounded-full animate-pulse shadow-sm shadow-rose-500/50'
                          : 'bg-[#090D16]'
                      }`}
                    />
                  )
                })
              )}
            </div>

            {/* Overlay if GameOver / Paused */}
            {(!isPlaying || gameOver) && (
              <div className="absolute inset-0 bg-[#090D16]/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
                {gameOver ? (
                  <>
                    <span className="text-rose-400 font-bold text-lg mb-1">蛇身碰撞，游戏结束！</span>
                    <span className="text-xs text-slate-400 mb-4 font-mono">最终得分: {score}</span>
                    <button
                      type="button"
                      onClick={resetGame}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
                    >
                      再来一盘
                    </button>
                  </>
                ) : score === 0 ? (
                  <>
                    <span className="text-white font-bold text-base mb-2">贪吃蛇对战就绪</span>
                    <p className="text-xs text-slate-400 mb-4 max-w-xs">
                      使用方向键 (↑↓←→) 或 WASD 控制移动，按空格键可随时暂停与继续
                    </p>
                    <button
                      type="button"
                      onClick={resetGame}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
                    >
                      立即开始
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-amber-400 font-bold text-base mb-2">游戏已暂停</span>
                    <p className="text-xs text-slate-400 mb-4">按空格键或下方按钮即可继续对局</p>
                    <button
                      type="button"
                      onClick={() => setIsPlaying(true)}
                      className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                    >
                      继续对局 (空格)
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Stats & Controls */}
          <div className="space-y-4">
            {/* Score Cards */}
            <div className="p-4 rounded-2xl border border-[#1E293B] bg-[#0F1523] space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">当前得分</span>
                <span className="text-3xl font-mono font-bold text-emerald-400 tabular-nums">{score}</span>
              </div>
              <div className="pt-2 border-t border-[#1E293B]">
                <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>历史最高分</span>
                </span>
                <span className="text-xl font-mono font-bold text-amber-400 tabular-nums">{highScore}</span>
              </div>
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span>蛇身长度:</span>
                </span>
                <span className="font-mono text-white font-semibold tabular-nums">{snake.length} 节</span>
              </div>
            </div>

            {/* Mobile / Screen D-Pad */}
            <div className="p-4 rounded-2xl border border-[#1E293B] bg-[#0F1523] text-center">
              <span className="text-xs font-semibold text-slate-400 block mb-3">方向操纵盘</span>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => queueDirection({ x: 0, y: -1 })}
                  className="p-3 bg-[#141C2E] hover:bg-[#1A243B] text-white rounded-xl active:bg-blue-600 transition border border-[#1E293B]"
                  aria-label="Up"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => queueDirection({ x: -1, y: 0 })}
                    className="p-3 bg-[#141C2E] hover:bg-[#1A243B] text-white rounded-xl active:bg-blue-600 transition border border-[#1E293B]"
                    aria-label="Left"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-[#090D16] border border-[#1E293B]" />
                  <button
                    type="button"
                    onClick={() => queueDirection({ x: 1, y: 0 })}
                    className="p-3 bg-[#141C2E] hover:bg-[#1A243B] text-white rounded-xl active:bg-blue-600 transition border border-[#1E293B]"
                    aria-label="Right"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => queueDirection({ x: 0, y: 1 })}
                  className="p-3 bg-[#141C2E] hover:bg-[#1A243B] text-white rounded-xl active:bg-blue-600 transition border border-[#1E293B]"
                  aria-label="Down"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Non-intrusive AdSlot */}
        <div className="mt-12">
          <AdSlot slotId="game-snake-bottom" format="horizontal" />
        </div>
      </main>

      <Footer />
    </div>
  )
}
