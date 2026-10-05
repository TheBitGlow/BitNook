'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Space,
  Bookmark,
} from 'lucide-react'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

type PieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z'

interface TetrominoDef {
  type: PieceType
  shape: number[][]
  color: string
}

const PIECE_DEFS: Record<PieceType, TetrominoDef> = {
  I: {
    type: 'I',
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#06B6D4', // Cyan
  },
  J: {
    type: 'J',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#3B82F6', // Blue
  },
  L: {
    type: 'L',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#F97316', // Orange
  },
  O: {
    type: 'O',
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#F59E0B', // Yellow
  },
  S: {
    type: 'S',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#10B981', // Green
  },
  T: {
    type: 'T',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#8B5CF6', // Purple
  },
  Z: {
    type: 'Z',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#EF4444', // Red
  },
}

const PIECE_TYPES: PieceType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

function createShuffledBag(): PieceType[] {
  const bag = [...PIECE_TYPES]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

function rotateMatrix(matrix: number[][]): number[][] {
  const N = matrix.length
  const res = Array.from({ length: N }, () => Array(N).fill(0))
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      res[c][N - 1 - r] = matrix[r][c]
    }
  }
  return res
}

function checkCollision(shape: number[][], pos: { x: number; y: number }, board: (string | null)[][]): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const x = pos.x + c
        const y = pos.y + r
        if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return true
        if (y >= 0 && board[y][x] !== null) return true
      }
    }
  }
  return false
}

export default function TetrisGamePage() {
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null))
  )

  const [currentPiece, setCurrentPiece] = useState<TetrominoDef | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 3, y: 0 })
  const [nextPiece, setNextPiece] = useState<TetrominoDef | null>(null)
  const [holdPiece, setHoldPiece] = useState<TetrominoDef | null>(null)
  const [canHold, setCanHold] = useState(true)

  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bitnook_tetris_highscore')
        if (saved) return Number(saved)
      } catch {
        // ignore
      }
    }
    return 0
  })

  // 7-Bag generator ref
  const bagRef = useRef<PieceType[]>([])

  const getNextFromBag = useCallback((): TetrominoDef => {
    if (bagRef.current.length === 0) {
      bagRef.current = createShuffledBag()
    }
    const type = bagRef.current.pop()!
    return { ...PIECE_DEFS[type], shape: PIECE_DEFS[type].shape.map((row) => [...row]) }
  }, [])

  // Calculate ghost position for rendering
  const ghostY = useMemo(() => {
    if (!currentPiece) return 0
    let gy = pos.y
    while (!checkCollision(currentPiece.shape, { x: pos.x, y: gy + 1 }, board)) {
      gy++
    }
    return gy
  }, [currentPiece, pos, board])

  // Initialize Game
  const startNewGame = useCallback(() => {
    bagRef.current = createShuffledBag()
    const p1 = getNextFromBag()
    const p2 = getNextFromBag()

    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(null))
    )
    setCurrentPiece(p1)
    setPos({ x: 3, y: 0 })
    setNextPiece(p2)
    setHoldPiece(null)
    setCanHold(true)
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPlaying(true)
  }, [getNextFromBag])

  // Lock current piece into board
  const lockPiece = useCallback(() => {
    if (!currentPiece) return

    const newBoard = board.map((row) => [...row])
    let isTopOut = false

    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c]) {
          const x = pos.x + c
          const y = pos.y + r
          if (y < 0) {
            isTopOut = true
          } else if (y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            newBoard[y][x] = currentPiece.color
          }
        }
      }
    }

    if (isTopOut) {
      setGameOver(true)
      setIsPlaying(false)
      return
    }

    // Line clearing
    let cleared = 0
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every((cell) => cell !== null)) {
        newBoard.splice(y, 1)
        newBoard.unshift(Array(BOARD_WIDTH).fill(null))
        cleared++
        y++ // Recheck same row
      }
    }

    if (cleared > 0) {
      const lineScores = [0, 100, 300, 500, 800]
      const pts = (lineScores[cleared] || 800) * level
      setScore((s) => {
        const nextScore = s + pts
        if (nextScore > highScore) {
          setHighScore(nextScore)
          try {
            localStorage.setItem('bitnook_tetris_highscore', nextScore.toString())
          } catch {
            // ignore
          }
        }
        return nextScore
      })
      setLines((l) => {
        const totalLines = l + cleared
        setLevel(Math.floor(totalLines / 10) + 1)
        return totalLines
      })
    }

    setBoard(newBoard)

    // Spawn next piece
    const upcoming = nextPiece || getNextFromBag()
    const nextUpcoming = getNextFromBag()

    if (checkCollision(upcoming.shape, { x: 3, y: 0 }, newBoard)) {
      setGameOver(true)
      setIsPlaying(false)
    } else {
      setCurrentPiece(upcoming)
      setPos({ x: 3, y: 0 })
      setNextPiece(nextUpcoming)
      setCanHold(true)
    }
  }, [currentPiece, pos, board, level, nextPiece, getNextFromBag, highScore])

  // Move helpers
  const moveLeft = useCallback(() => {
    if (!isPlaying || !currentPiece) return
    if (!checkCollision(currentPiece.shape, { x: pos.x - 1, y: pos.y }, board)) {
      setPos((p) => ({ ...p, x: p.x - 1 }))
    }
  }, [isPlaying, currentPiece, pos, board])

  const moveRight = useCallback(() => {
    if (!isPlaying || !currentPiece) return
    if (!checkCollision(currentPiece.shape, { x: pos.x + 1, y: pos.y }, board)) {
      setPos((p) => ({ ...p, x: p.x + 1 }))
    }
  }, [isPlaying, currentPiece, pos, board])

  const moveDown = useCallback(() => {
    if (!isPlaying || !currentPiece) return
    if (!checkCollision(currentPiece.shape, { x: pos.x, y: pos.y + 1 }, board)) {
      setPos((p) => ({ ...p, y: p.y + 1 }))
      setScore((s) => s + 1)
    } else {
      lockPiece()
    }
  }, [isPlaying, currentPiece, pos, board, lockPiece])

  const hardDrop = useCallback(() => {
    if (!isPlaying || !currentPiece) return
    let dropDistance = 0
    let curY = pos.y
    while (!checkCollision(currentPiece.shape, { x: pos.x, y: curY + 1 }, board)) {
      curY++
      dropDistance++
    }
    setPos({ x: pos.x, y: curY })
    setScore((s) => s + dropDistance * 2)

    // Immediately trigger lock
    setTimeout(() => {
      lockPiece()
    }, 0)
  }, [isPlaying, currentPiece, pos, board, lockPiece])

  // SRS Wall Kick basic rotation
  const rotatePiece = useCallback(() => {
    if (!isPlaying || !currentPiece) return
    const rotated = rotateMatrix(currentPiece.shape)

    // Wall kick offsets to try: [0, +1, -1, +2, -2]
    const kicks = [0, 1, -1, 2, -2]
    for (const dx of kicks) {
      if (!checkCollision(rotated, { x: pos.x + dx, y: pos.y }, board)) {
        setCurrentPiece({ ...currentPiece, shape: rotated })
        setPos((p) => ({ ...p, x: p.x + dx }))
        return
      }
    }
  }, [isPlaying, currentPiece, pos, board])

  // Hold piece
  const handleHold = useCallback(() => {
    if (!isPlaying || !currentPiece || !canHold) return
    setCanHold(false)

    if (holdPiece) {
      const temp = holdPiece
      setHoldPiece(PIECE_DEFS[currentPiece.type])
      setCurrentPiece(temp)
      setPos({ x: 3, y: 0 })
    } else {
      setHoldPiece(PIECE_DEFS[currentPiece.type])
      const upcoming = nextPiece || getNextFromBag()
      setCurrentPiece(upcoming)
      setPos({ x: 3, y: 0 })
      setNextPiece(getNextFromBag())
    }
  }, [isPlaying, currentPiece, canHold, holdPiece, nextPiece, getNextFromBag])

  // Game Loop Timer based on Level
  useEffect(() => {
    if (!isPlaying || gameOver) return

    // Speed formula (ms per drop)
    const dropInterval = Math.max(100, 800 - (level - 1) * 70)
    const timer = setInterval(() => {
      moveDown()
    }, dropInterval)

    return () => clearInterval(timer)
  }, [isPlaying, gameOver, level, moveDown])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying && e.code === 'KeyP') {
        setIsPlaying(true)
        return
      }
      if (e.code === 'KeyP') {
        setIsPlaying((p) => !p)
        return
      }
      if (!isPlaying) return

      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        moveLeft()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        moveRight()
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        moveDown()
      } else if (e.code === 'ArrowUp' || e.code === 'KeyX') {
        e.preventDefault()
        rotatePiece()
      } else if (e.code === 'Space') {
        e.preventDefault()
        hardDrop()
      } else if (e.code === 'KeyC') {
        e.preventDefault()
        handleHold()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, moveLeft, moveRight, moveDown, rotatePiece, hardDrop, handleHold])

  // Render combined grid strictly from React state (never refs)
  const displayGrid = useMemo(() => {
    const grid: { color: string | null; isGhost?: boolean }[][] = board.map((row) =>
      row.map((cell) => ({ color: cell }))
    )

    if (currentPiece) {
      // Paint ghost piece
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c]) {
            const gx = pos.x + c
            const gy = ghostY + r
            if (gy >= 0 && gy < BOARD_HEIGHT && gx >= 0 && gx < BOARD_WIDTH) {
              if (!grid[gy][gx].color) {
                grid[gy][gx] = { color: currentPiece.color, isGhost: true }
              }
            }
          }
        }
      }

      // Paint active piece
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c]) {
            const px = pos.x + c
            const py = pos.y + r
            if (py >= 0 && py < BOARD_HEIGHT && px >= 0 && px < BOARD_WIDTH) {
              grid[py][px] = { color: currentPiece.color }
            }
          }
        }
      }
    }

    return grid
  }, [board, currentPiece, pos, ghostY])

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400">🎮</span>
              <span>经典俄罗斯方块 (Tetris)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              标准 7-Bag 随机算法 · 踢墙旋转系统 · 实时影子预览 · 暂存功能
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              disabled={gameOver || !currentPiece}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? '暂停 (P)' : '继续 (P)'}</span>
            </button>
            <button
              onClick={startNewGame}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>新游戏</span>
            </button>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[160px,auto,160px] gap-6 justify-center items-start">
          {/* Left Panel: Hold & Stats */}
          <div className="space-y-4">
            {/* Hold */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 text-center">
              <span className="text-xs font-semibold text-slate-400 block mb-2">暂存 (C键)</span>
              <div className="w-20 h-20 mx-auto bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-center p-2">
                {holdPiece ? (
                  <div
                    className="grid gap-0.5"
                    style={{ gridTemplateColumns: `repeat(${holdPiece.shape[0].length}, 14px)` }}
                  >
                    {holdPiece.shape.map((row, r) =>
                      row.map((val, c) => (
                        <div
                          key={`${r}-${c}`}
                          className="w-3.5 h-3.5 rounded-sm"
                          style={{ backgroundColor: val ? holdPiece.color : 'transparent' }}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-600">空</span>
                )}
              </div>
            </div>

            {/* Level & Lines */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">当前难度等级</span>
                <span className="text-xl font-mono font-bold text-indigo-400">Level {level}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">已消除行数</span>
                <span className="text-xl font-mono font-bold text-white">{lines}</span>
              </div>
            </div>
          </div>

          {/* Center: Main Game Board */}
          <div className="relative p-3 rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl shadow-indigo-950/40">
            <div
              className="grid gap-[1px] bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, 26px)`,
                gridTemplateRows: `repeat(${BOARD_HEIGHT}, 26px)`,
              }}
            >
              {displayGrid.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className={`w-[26px] h-[26px] rounded-[2px] transition-colors duration-75 ${
                      cell.color
                        ? cell.isGhost
                          ? 'border border-dashed border-slate-500/50 bg-slate-800/20'
                          : 'shadow-inner'
                        : 'bg-slate-950/90'
                    }`}
                    style={{
                      backgroundColor: cell.isGhost ? undefined : cell.color || undefined,
                      borderColor: cell.isGhost ? cell.color || undefined : undefined,
                    }}
                  />
                ))
              )}
            </div>

            {/* Overlay if Paused or Game Over */}
            {(!isPlaying || gameOver) && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                {gameOver ? (
                  <>
                    <span className="text-rose-400 font-bold text-xl mb-1">游戏结束</span>
                    <span className="text-xs text-slate-400 mb-4">方块触顶，本次得分: {score}</span>
                    <button
                      onClick={startNewGame}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
                    >
                      再来一局
                    </button>
                  </>
                ) : !currentPiece ? (
                  <>
                    <span className="text-white font-bold text-lg mb-2">准备好了吗？</span>
                    <button
                      onClick={startNewGame}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
                    >
                      开始经典对局
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-amber-400 font-bold text-lg mb-1">游戏已暂停</span>
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="mt-3 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                    >
                      继续游戏 (P)
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Next Piece & Score */}
          <div className="space-y-4">
            {/* Next Piece */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 text-center">
              <span className="text-xs font-semibold text-slate-400 block mb-2">下一个方块</span>
              <div className="w-20 h-20 mx-auto bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-center p-2">
                {nextPiece ? (
                  <div
                    className="grid gap-0.5"
                    style={{ gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 14px)` }}
                  >
                    {nextPiece.shape.map((row, r) =>
                      row.map((val, c) => (
                        <div
                          key={`${r}-${c}`}
                          className="w-3.5 h-3.5 rounded-sm"
                          style={{ backgroundColor: val ? nextPiece.color : 'transparent' }}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-600">待开始</span>
                )}
              </div>
            </div>

            {/* Score & High Score */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">当前得分</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">{score}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>历史最高分</span>
                </span>
                <span className="text-lg font-mono font-bold text-amber-400">{highScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile On-Screen Controls */}
        <div className="mt-8 max-w-sm mx-auto p-4 rounded-2xl border border-slate-800 bg-slate-900/40 block lg:hidden">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleHold}
              className="p-3 bg-slate-800 rounded-xl flex flex-col items-center text-xs text-slate-300"
            >
              <Bookmark className="w-4 h-4 mb-0.5" />
              <span>暂存</span>
            </button>
            <button
              onClick={rotatePiece}
              className="p-3 bg-indigo-600 text-white rounded-xl flex flex-col items-center text-xs font-semibold shadow-md"
            >
              <RotateCw className="w-4 h-4 mb-0.5" />
              <span>旋转</span>
            </button>
            <button
              onClick={hardDrop}
              className="p-3 bg-amber-600 text-white rounded-xl flex flex-col items-center text-xs font-semibold shadow-md"
            >
              <Space className="w-4 h-4 mb-0.5" />
              <span>硬降</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              onClick={moveLeft}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex justify-center items-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={moveDown}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex justify-center items-center"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onClick={moveRight}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex justify-center items-center"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Non-intrusive AdSlot */}
        <AdSlot placement="tool-bottom" className="mt-8" />
      </main>

      <Footer />
    </div>
  )
}
