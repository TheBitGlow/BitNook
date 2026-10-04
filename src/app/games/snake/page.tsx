'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Crosshair, Play, RotateCcw } from 'lucide-react'

const CELL_SIZE = 20
const BOARD_WIDTH = 20
const BOARD_HEIGHT = 20

type Position = { x: number; y: number }

export default function SnakePage() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(150)

  const snakeRef = useRef(snake)
  const foodRef = useRef(food)
  const directionRef = useRef(direction)
  const scoreRef = useRef(score)
  const highScoreRef = useRef(highScore)
  const gameOverRef = useRef(gameOver)
  const isPlayingRef = useRef(isPlaying)
  const speedRef = useRef(speed)

  useEffect(() => { snakeRef.current = snake }, [snake])
  useEffect(() => { foodRef.current = food }, [food])
  useEffect(() => { directionRef.current = direction }, [direction])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { highScoreRef.current = highScore }, [highScore])
  useEffect(() => { gameOverRef.current = gameOver }, [gameOver])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { speedRef.current = speed }, [speed])

  const spawnFood = useCallback(() => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_WIDTH),
        y: Math.floor(Math.random() * BOARD_HEIGHT)
      }
    } while (snakeRef.current.some(s => s.x === newFood.x && s.y === newFood.y))
    setFood(newFood)
    foodRef.current = newFood
  }, [])

  const resetGame = useCallback(() => {
    const startSnake = [{ x: 10, y: 10 }]
    const startFood = { x: 15, y: 15 }
    setSnake(startSnake)
    setFood(startFood)
    setDirection({ x: 1, y: 0 })
    setGameOver(false)
    setScore(0)
    setSpeed(150)
    setIsPlaying(true)

    snakeRef.current = startSnake
    foodRef.current = startFood
    directionRef.current = { x: 1, y: 0 }
    gameOverRef.current = false
    scoreRef.current = 0
    speedRef.current = 150
    isPlayingRef.current = true
  }, [])

  useEffect(() => {
    if (!isPlaying || gameOver) return

    const interval = setInterval(() => {
      const currentSnake = snakeRef.current
      const currentFood = foodRef.current
      const currentDirection = directionRef.current
      const currentScore = scoreRef.current
      const currentHighScore = highScoreRef.current

      const head = { x: currentSnake[0].x + currentDirection.x, y: currentSnake[0].y + currentDirection.y }

      if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT) {
        if (currentScore > currentHighScore) {
          setHighScore(currentScore)
          highScoreRef.current = currentScore
        }
        setGameOver(true)
        gameOverRef.current = true
        setIsPlaying(false)
        isPlayingRef.current = false
        return
      }

      if (currentSnake.some(s => s.x === head.x && s.y === head.y)) {
        if (currentScore > currentHighScore) {
          setHighScore(currentScore)
          highScoreRef.current = currentScore
        }
        setGameOver(true)
        gameOverRef.current = true
        setIsPlaying(false)
        isPlayingRef.current = false
        return
      }

      const ateFood = head.x === currentFood.x && head.y === currentFood.y

      let newSnake: Position[]
      if (ateFood) {
        newSnake = [head, ...currentSnake]
        setScore(s => {
          const newScore = s + 10
          scoreRef.current = newScore
          return newScore
        })
        setSpeed(s => {
          const newSpeed = Math.max(50, s - 2)
          speedRef.current = newSpeed
          return newSpeed
        })
        spawnFood()
      } else {
        newSnake = [head, ...currentSnake.slice(0, -1)]
      }

      setSnake(newSnake)
      snakeRef.current = newSnake
    }, speed)

    return () => clearInterval(interval)
  }, [isPlaying, gameOver, speed, spawnFood])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayingRef.current) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          resetGame()
        }
        return
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          if (directionRef.current.y !== 1) {
            setDirection({ x: 0, y: -1 })
            directionRef.current = { x: 0, y: -1 }
          }
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          if (directionRef.current.y !== -1) {
            setDirection({ x: 0, y: 1 })
            directionRef.current = { x: 0, y: 1 }
          }
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          if (directionRef.current.x !== 1) {
            setDirection({ x: -1, y: 0 })
            directionRef.current = { x: -1, y: 0 }
          }
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          if (directionRef.current.x !== -1) {
            setDirection({ x: 1, y: 0 })
            directionRef.current = { x: 1, y: 0 }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetGame])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Crosshair className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">贪吃蛇</h1>
            </div>
            <p className="text-[#94A3B8]">控制蛇吃到更多食物，注意不要撞墙或咬到自己</p>
          </div>

          {/* Game Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <span className="text-[#10B981] font-mono text-lg">得分: {score}</span>
              <span className="text-[#F59E0B] font-mono text-lg">最高: {highScore}</span>
            </div>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              开始
            </button>
          </div>

          {/* Game Board */}
          <div
            className="relative bg-[#080B14] border-2 border-[rgba(99,102,241,0.3)] rounded-lg overflow-hidden"
            style={{
              width: BOARD_WIDTH * CELL_SIZE,
              height: BOARD_HEIGHT * CELL_SIZE
            }}
          >
            {/* Snake */}
            {snake.map((segment, i) => (
              <div
                key={i}
                className="absolute rounded-sm"
                style={{
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  left: segment.x * CELL_SIZE + 1,
                  top: segment.y * CELL_SIZE + 1,
                  backgroundColor: i === 0 ? '#10B981' : '#059669'
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute rounded-full bg-[#EF4444]"
              style={{
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
                left: food.x * CELL_SIZE + 2,
                top: food.y * CELL_SIZE + 2
              }}
            />

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-white mb-2">游戏结束</p>
                <p className="text-[#94A3B8] mb-4">得分: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-[#10B981] text-white rounded-xl font-medium hover:bg-[#059669] flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  再来一局
                </button>
              </div>
            )}

            {/* Start Overlay */}
            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                <p className="text-[#94A3B8] mb-4">按 开始 或 空格键 启动</p>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            <div />
            <button
              onClick={() => {
                if (isPlayingRef.current && directionRef.current.y !== 1) {
                  setDirection({ x: 0, y: -1 })
                  directionRef.current = { x: 0, y: -1 }
                }
              }}
              className="p-4 bg-[#111827] border border-[rgba(99,102,241,0.3)] rounded-xl text-white text-2xl"
            >
              ↑
            </button>
            <div />
            <button
              onClick={() => {
                if (isPlayingRef.current && directionRef.current.x !== 1) {
                  setDirection({ x: -1, y: 0 })
                  directionRef.current = { x: -1, y: 0 }
                }
              }}
              className="p-4 bg-[#111827] border border-[rgba(99,102,241,0.3)] rounded-xl text-white text-2xl"
            >
              ←
            </button>
            <button
              onClick={() => {
                if (isPlayingRef.current && directionRef.current.y !== -1) {
                  setDirection({ x: 0, y: 1 })
                  directionRef.current = { x: 0, y: 1 }
                }
              }}
              className="p-4 bg-[#111827] border border-[rgba(99,102,241,0.3)] rounded-xl text-white text-2xl"
            >
              ↓
            </button>
            <button
              onClick={() => {
                if (isPlayingRef.current && directionRef.current.x !== -1) {
                  setDirection({ x: 1, y: 0 })
                  directionRef.current = { x: 1, y: 0 }
                }
              }}
              className="p-4 bg-[#111827] border border-[rgba(99,102,241,0.3)] rounded-xl text-white text-2xl"
            >
              →
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-[#111927]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">操作：</span>
              方向键或 WASD 控制方向，空格键暂停/开始。吃到食物得10分，蛇身越长速度越快。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
