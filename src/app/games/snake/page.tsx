'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import GameLayout from '@/components/games/GameLayout'
import { useRecentGames } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import {
  GRID_SIZE,
  Direction,
  Point,
  isValidDirectionChange,
  spawnFood,
} from '@/core/games/snake'
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

export default function SnakeGamePage() {
  const { recordRecentGame } = useRecentGames()

  useEffect(() => {
    recordRecentGame('snake')
    trackEvent('game_start', { gameSlug: 'snake' })
  }, [recordRecentGame])

  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ])
  const [food, setFood] = useState<Point>({ x: 15, y: 10 })
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

  const currentDirRef = useRef<Direction>('RIGHT')
  const nextDirsQueue = useRef<Direction[]>([])
  const snakeRef = useRef(snake)
  const isPlayingRef = useRef(isPlaying)
  const gameOverRef = useRef(gameOver)
  const wrapModeRef = useRef(wrapMode)

  useEffect(() => { snakeRef.current = snake }, [snake])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { gameOverRef.current = gameOver }, [gameOver])
  useEffect(() => { wrapModeRef.current = wrapMode }, [wrapMode])

  const resetGame = useCallback(() => {
    const initSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]
    setSnake(initSnake)
    snakeRef.current = initSnake
    currentDirRef.current = 'RIGHT'
    nextDirsQueue.current = []
    setFood(spawnFood(initSnake, GRID_SIZE))
    setScore(0)
    setGameOver(false)
    gameOverRef.current = false
    setIsPlaying(true)
    isPlayingRef.current = true
  }, [])

  const queueDirection = useCallback((nextDir: Direction) => {
    const activeDir =
      nextDirsQueue.current.length > 0
        ? nextDirsQueue.current[nextDirsQueue.current.length - 1]
        : currentDirRef.current

    if (isValidDirectionChange(activeDir, nextDir)) {
      if (nextDirsQueue.current.length < 3) {
        nextDirsQueue.current.push(nextDir)
      }
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (gameOverRef.current) {
          resetGame()
        } else {
          setIsPlaying(p => !p)
        }
        return
      }

      if (!isPlayingRef.current || gameOverRef.current) return

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          queueDirection('UP')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          queueDirection('DOWN')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          queueDirection('LEFT')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          queueDirection('RIGHT')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [queueDirection, resetGame])

  // Game step loop
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const baseSpeed = Math.max(70, 150 - Math.floor(score / 30) * 10)

    const timer = setInterval(() => {
      if (nextDirsQueue.current.length > 0) {
        currentDirRef.current = nextDirsQueue.current.shift()!
      }

      const dir = currentDirRef.current
      const curSnake = [...snakeRef.current]
      const head = curSnake[0]

      let nextX = head.x
      let nextY = head.y

      if (dir === 'UP') nextY -= 1
      else if (dir === 'DOWN') nextY += 1
      else if (dir === 'LEFT') nextX -= 1
      else if (dir === 'RIGHT') nextX += 1

      // Wrap or Wall Collision
      if (wrapModeRef.current) {
        nextX = (nextX + GRID_SIZE) % GRID_SIZE
        nextY = (nextY + GRID_SIZE) % GRID_SIZE
      } else {
        if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
          setGameOver(true)
          setIsPlaying(false)
          return
        }
      }

      // Self collision
      const hitsSelf = curSnake.some((seg, idx) => idx > 0 && seg.x === nextX && seg.y === nextY)
      if (hitsSelf) {
        setGameOver(true)
        setIsPlaying(false)
        return
      }

      const nextHead = { x: nextX, y: nextY }
      const eatsFood = nextX === food.x && nextY === food.y
      const newSnake = [nextHead, ...curSnake]

      if (!eatsFood) {
        newSnake.pop()
        setSnake(newSnake)
      } else {
        const nextScore = score + 10
        setScore(nextScore)
        if (nextScore > highScore) {
          setHighScore(nextScore)
          try {
            localStorage.setItem('bitnook_snake_highscore', String(nextScore))
          } catch {
            // ignore
          }
        }
        setSnake(newSnake)
        setFood(spawnFood(newSnake, GRID_SIZE))
      }
    }, baseSpeed)

    return () => clearInterval(timer)
  }, [isPlaying, gameOver, food, score, highScore])

  const instructions = [
    { title: '键盘操作', desc: '使用方向键 (↑↓←→) 或 WASD 控制移动，按空格键可随时暂停与继续。' },
    { title: '防转向自杀', desc: '内置双层指令缓冲队列，避免快速连按方向键导致 180 度即时掉头撞身。' },
    { title: '穿墙模式', desc: '开启无界穿墙模式后，撞击边界将自动从对侧出现，适合休闲练习。' },
  ]

  const controls = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setWrapMode(!wrapMode)}
        className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
          wrapMode
            ? 'bg-accent text-white shadow-subtle'
            : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
        }`}
      >
        <Shield className="w-3.5 h-3.5" />
        <span>{wrapMode ? '穿墙模式: 开' : '穿墙模式: 关'}</span>
      </button>

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        disabled={gameOver}
        className="px-3 py-1.5 rounded-md border border-border bg-surface text-text-primary hover:bg-surface-secondary text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span>{isPlaying ? '暂停' : '继续'}</span>
      </button>

      <button
        onClick={resetGame}
        className="px-3 py-1.5 rounded-md border border-border bg-surface text-text-primary hover:bg-surface-secondary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>重置</span>
      </button>
    </div>
  )

  return (
    <GameLayout
      title="贪吃蛇"
      titleEn="Retro Snake"
      categoryName="休闲街机"
      description="经典的复古贪吃蛇，支持无界穿墙切换、平滑输入缓冲队列与本地历史最高纪录。"
      controlsNode={controls}
      instructions={instructions}
    >
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 select-none max-w-3xl">
        {/* Central Snake Canvas Board */}
        <div className="relative p-3 rounded-2xl border border-border bg-surface-secondary/80 shadow-md">
          <div
            className="grid gap-[2px] p-2 rounded-xl border border-border bg-surface shadow-inner"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 16px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 16px)`,
            }}
          >
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => {
                const isHead = snake[0].x === x && snake[0].y === y
                const isBody = !isHead && snake.some(seg => seg.x === x && seg.y === y)
                const isFood = food.x === x && food.y === y

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`w-4 h-4 rounded-[2px] transition-colors duration-75 ${
                      isHead
                        ? 'bg-emerald-500 shadow-xs scale-105 z-10'
                        : isBody
                        ? 'bg-emerald-600/80'
                        : isFood
                        ? 'bg-danger rounded-full animate-pulse shadow-xs'
                        : 'bg-surface-secondary/40'
                    }`}
                  />
                )
              })
            )}
          </div>

          {/* Overlay if GameOver / Paused */}
          {(!isPlaying || gameOver) && (
            <div className="absolute inset-0 bg-canvas/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in duration-120">
              {gameOver ? (
                <>
                  <span className="text-danger font-bold text-base mb-1">游戏结束</span>
                  <span className="text-xs text-text-secondary mb-4 font-mono">
                    最终得分: {score}
                  </span>
                  <button
                    onClick={resetGame}
                    className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer"
                  >
                    再来一盘
                  </button>
                </>
              ) : score === 0 ? (
                <>
                  <span className="text-text-primary font-bold text-base mb-2">对战就绪</span>
                  <p className="text-xs text-text-secondary mb-4 max-w-xs">
                    使用方向键 (↑↓←→) 或 WASD 控制移动，空格键暂停与继续
                  </p>
                  <button
                    onClick={resetGame}
                    className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer"
                  >
                    开始游戏
                  </button>
                </>
              ) : (
                <>
                  <span className="text-warning font-bold text-base mb-2">已暂停</span>
                  <p className="text-xs text-text-secondary mb-4">按空格键或下方按钮继续游戏</p>
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    继续游戏
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Stats & Virtual D-Pad */}
        <div className="w-full sm:w-56 space-y-3 shrink-0">
          {/* Score Box */}
          <div className="p-4 rounded-xl border border-border bg-surface-secondary/50 space-y-3">
            <div>
              <span className="text-xs text-text-secondary block mb-1">当前得分</span>
              <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {score}
              </span>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-warning" />
                <span>最高分</span>
              </span>
              <span className="font-mono font-bold text-warning tabular-nums text-sm">
                {highScore}
              </span>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span>蛇身长度</span>
              </span>
              <span className="font-mono text-text-primary font-semibold tabular-nums">
                {snake.length} 节
              </span>
            </div>
          </div>

          {/* Direction Pad */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 text-center">
            <span className="text-xs font-semibold text-text-secondary block mb-2.5">
              屏幕虚拟操纵盘
            </span>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => queueDirection('UP')}
                className="p-2.5 bg-surface hover:bg-surface-hover text-text-primary rounded-lg border border-border shadow-xs active:scale-95 transition-all cursor-pointer"
                aria-label="Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => queueDirection('LEFT')}
                  className="p-2.5 bg-surface hover:bg-surface-hover text-text-primary rounded-lg border border-border shadow-xs active:scale-95 transition-all cursor-pointer"
                  aria-label="Left"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-6 h-6 rounded-full bg-surface-secondary border border-border" />
                <button
                  onClick={() => queueDirection('RIGHT')}
                  className="p-2.5 bg-surface hover:bg-surface-hover text-text-primary rounded-lg border border-border shadow-xs active:scale-95 transition-all cursor-pointer"
                  aria-label="Right"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => queueDirection('DOWN')}
                className="p-2.5 bg-surface hover:bg-surface-hover text-text-primary rounded-lg border border-border shadow-xs active:scale-95 transition-all cursor-pointer"
                aria-label="Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}
