'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import GameLayout from '@/components/games/GameLayout'
import { useRecentGames } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import {
  TETRIS_COLS,
  TETRIS_ROWS,
  TetrominoType,
  TetrominoShape,
  TETROMINOES,
  rotateMatrix,
  checkTetrisCollision,
} from '@/core/games/tetris'
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
} from 'lucide-react'

const PIECE_TYPES: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

function createShuffledBag(): TetrominoType[] {
  const bag = [...PIECE_TYPES]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

export default function TetrisGamePage() {
  const { recordRecentGame } = useRecentGames()

  useEffect(() => {
    recordRecentGame('tetris')
    trackEvent('game_start', { gameSlug: 'tetris' })
  }, [recordRecentGame])

  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array(TETRIS_ROWS)
      .fill(null)
      .map(() => Array(TETRIS_COLS).fill(null))
  )

  const [currentPiece, setCurrentPiece] = useState<TetrominoShape | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 3, y: 0 })
  const [nextPiece, setNextPiece] = useState<TetrominoShape | null>(null)
  const [holdPiece, setHoldPiece] = useState<TetrominoShape | null>(null)
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

  const bagRef = useRef<TetrominoType[]>([])

  const getNextFromBag = useCallback((): TetrominoShape => {
    if (bagRef.current.length === 0) {
      bagRef.current = createShuffledBag()
    }
    const type = bagRef.current.pop()!
    return {
      type,
      matrix: TETROMINOES[type].matrix.map(row => [...row]),
      color: TETROMINOES[type].color,
    }
  }, [])

  const checkCollisionLocal = useCallback(
    (shape: number[][], p: { x: number; y: number }, curBoard: (string | null)[][]): boolean => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const x = p.x + c
            const y = p.y + r
            if (x < 0 || x >= TETRIS_COLS || y >= TETRIS_ROWS) return true
            if (y >= 0 && curBoard[y][x] !== null) return true
          }
        }
      }
      return false
    },
    []
  )

  // Ghost projection
  const ghostY = useMemo(() => {
    if (!currentPiece) return 0
    let gy = pos.y
    while (!checkCollisionLocal(currentPiece.matrix, { x: pos.x, y: gy + 1 }, board)) {
      gy++
    }
    return gy
  }, [currentPiece, pos, board, checkCollisionLocal])

  const startNewGame = useCallback(() => {
    bagRef.current = createShuffledBag()
    const p1 = getNextFromBag()
    const p2 = getNextFromBag()

    setBoard(
      Array(TETRIS_ROWS)
        .fill(null)
        .map(() => Array(TETRIS_COLS).fill(null))
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

  const lockPiece = useCallback(() => {
    if (!currentPiece) return

    const newBoard = board.map(row => [...row])
    let isTopOut = false

    for (let r = 0; r < currentPiece.matrix.length; r++) {
      for (let c = 0; c < currentPiece.matrix[r].length; c++) {
        if (currentPiece.matrix[r][c]) {
          const x = pos.x + c
          const y = pos.y + r
          if (y < 0) {
            isTopOut = true
          } else if (y < TETRIS_ROWS && x >= 0 && x < TETRIS_COLS) {
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
    for (let y = TETRIS_ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== null)) {
        newBoard.splice(y, 1)
        newBoard.unshift(Array(TETRIS_COLS).fill(null))
        cleared++
        y++
      }
    }

    if (cleared > 0) {
      const lineScores = [0, 100, 300, 500, 800]
      const scoreAdd = (lineScores[cleared] || cleared * 200) * level
      const newScore = score + scoreAdd
      const newLines = lines + cleared
      const newLevel = Math.floor(newLines / 10) + 1

      setScore(newScore)
      setLines(newLines)
      setLevel(newLevel)

      if (newScore > highScore) {
        setHighScore(newScore)
        try {
          localStorage.setItem('bitnook_tetris_highscore', String(newScore))
        } catch {
          // ignore
        }
      }
    }

    setBoard(newBoard)

    const next = nextPiece || getNextFromBag()
    const futureNext = getNextFromBag()

    if (checkCollisionLocal(next.matrix, { x: 3, y: 0 }, newBoard)) {
      setGameOver(true)
      setIsPlaying(false)
    } else {
      setCurrentPiece(next)
      setNextPiece(futureNext)
      setPos({ x: 3, y: 0 })
      setCanHold(true)
    }
  }, [
    currentPiece,
    pos,
    board,
    score,
    lines,
    level,
    highScore,
    nextPiece,
    getNextFromBag,
    checkCollisionLocal,
  ])

  // Soft drop
  const dropPiece = useCallback(() => {
    if (!currentPiece) return
    if (!checkCollisionLocal(currentPiece.matrix, { x: pos.x, y: pos.y + 1 }, board)) {
      setPos(p => ({ ...p, y: p.y + 1 }))
    } else {
      lockPiece()
    }
  }, [currentPiece, pos, board, checkCollisionLocal, lockPiece])

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPiece) return
    let dropY = pos.y
    while (!checkCollisionLocal(currentPiece.matrix, { x: pos.x, y: dropY + 1 }, board)) {
      dropY++
    }
    setPos({ x: pos.x, y: dropY })
    setTimeout(() => lockPiece(), 20)
  }, [currentPiece, pos, board, checkCollisionLocal, lockPiece])

  // Move horizontally
  const moveHorizontally = useCallback(
    (dx: number) => {
      if (!currentPiece) return
      if (!checkCollisionLocal(currentPiece.matrix, { x: pos.x + dx, y: pos.y }, board)) {
        setPos(p => ({ ...p, x: p.x + dx }))
      }
    },
    [currentPiece, pos, board, checkCollisionLocal]
  )

  // Rotate piece with wall kicks
  const rotatePiece = useCallback(() => {
    if (!currentPiece) return
    const rotated = rotateMatrix(currentPiece.matrix)

    const kicks = [0, -1, 1, -2, 2]
    for (const kx of kicks) {
      if (!checkCollisionLocal(rotated, { x: pos.x + kx, y: pos.y }, board)) {
        setCurrentPiece({ ...currentPiece, matrix: rotated })
        setPos(p => ({ ...p, x: p.x + kx }))
        return
      }
    }
  }, [currentPiece, pos, board, checkCollisionLocal])

  // Hold feature
  const holdCurrent = useCallback(() => {
    if (!currentPiece || !canHold) return
    setCanHold(false)

    if (holdPiece === null) {
      setHoldPiece(currentPiece)
      const next = nextPiece || getNextFromBag()
      setCurrentPiece(next)
      setNextPiece(getNextFromBag())
      setPos({ x: 3, y: 0 })
    } else {
      const prevHold = holdPiece
      setHoldPiece(currentPiece)
      setCurrentPiece(prevHold)
      setPos({ x: 3, y: 0 })
    }
  }, [currentPiece, canHold, holdPiece, nextPiece, getNextFromBag])

  // Gravity ticker
  useEffect(() => {
    if (!isPlaying || gameOver || !currentPiece) return
    const speed = Math.max(100, 750 - (level - 1) * 60)
    const interval = setInterval(() => {
      dropPiece()
    }, speed)
    return () => clearInterval(interval)
  }, [isPlaying, gameOver, currentPiece, level, dropPiece])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === 'p' || e.key === 'P') {
        if (!gameOver && currentPiece) setIsPlaying(p => !p)
        return
      }

      if (!isPlaying || gameOver) return

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveHorizontally(-1)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveHorizontally(1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          dropPiece()
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          rotatePiece()
          break
        case ' ':
        case 'Space':
          hardDrop()
          break
        case 'c':
        case 'C':
          holdCurrent()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, gameOver, currentPiece, moveHorizontally, dropPiece, rotatePiece, hardDrop, holdCurrent])

  // Compose display grid
  const displayGrid = useMemo(() => {
    const grid: { color: string; isGhost?: boolean }[][] = Array.from(
      { length: TETRIS_ROWS },
      () => Array(TETRIS_COLS).fill(null)
    )

    for (let y = 0; y < TETRIS_ROWS; y++) {
      for (let x = 0; x < TETRIS_COLS; x++) {
        if (board[y][x]) {
          grid[y][x] = { color: board[y][x]! }
        }
      }
    }

    // Ghost piece
    if (currentPiece && isPlaying && !gameOver) {
      for (let r = 0; r < currentPiece.matrix.length; r++) {
        for (let c = 0; c < currentPiece.matrix[r].length; c++) {
          if (currentPiece.matrix[r][c]) {
            const gx = pos.x + c
            const gy = ghostY + r
            if (gy >= 0 && gy < TETRIS_ROWS && gx >= 0 && gx < TETRIS_COLS && !grid[gy][gx]) {
              grid[gy][gx] = { color: currentPiece.color, isGhost: true }
            }
          }
        }
      }
    }

    // Active falling piece
    if (currentPiece) {
      for (let r = 0; r < currentPiece.matrix.length; r++) {
        for (let c = 0; c < currentPiece.matrix[r].length; c++) {
          if (currentPiece.matrix[r][c]) {
            const px = pos.x + c
            const py = pos.y + r
            if (py >= 0 && py < TETRIS_ROWS && px >= 0 && px < TETRIS_COLS) {
              grid[py][px] = { color: currentPiece.color }
            }
          }
        }
      }
    }

    return grid
  }, [board, currentPiece, pos, ghostY, isPlaying, gameOver])

  const instructions = [
    { title: '左右移动', desc: '按 ← / → 键或 A / D 左右平移方块。' },
    { title: '旋转与硬降', desc: '按 ↑ 键旋转，按空格键瞬间硬降到底，↓ 键加速下落。' },
    { title: '暂存与 7-Bag', desc: '按 C 键暂存当前方块；采用正规 7-Bag 随机算法，杜绝极端连续同型卡块。' },
  ]

  const controls = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsPlaying(p => !p)}
        disabled={gameOver || !currentPiece}
        className="px-3 py-1.5 rounded-md border border-border bg-surface text-text-primary hover:bg-surface-secondary text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span>{isPlaying ? '暂停 (P)' : '继续 (P)'}</span>
      </button>
      <button
        onClick={startNewGame}
        className="px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium flex items-center gap-1.5 shadow-subtle transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>新游戏</span>
      </button>
    </div>
  )

  return (
    <GameLayout
      title="俄罗斯方块"
      titleEn="Classic Tetris (7-Bag)"
      categoryName="休闲街机"
      description="正统 7-Bag 随机袋算法与踢墙旋转系统，支持影子落点预览、C 键暂存与逐级加速。"
      controlsNode={controls}
      instructions={instructions}
    >
      <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-center gap-6 select-none max-w-2xl">
        {/* Left Side: Hold & Current Level */}
        <div className="w-full md:w-36 space-y-3 shrink-0">
          {/* Hold Piece Container */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 text-center">
            <span className="text-xs font-semibold text-text-secondary block mb-2">暂存 (C键)</span>
            <div className="w-18 h-18 mx-auto bg-surface border border-border rounded-lg flex items-center justify-center p-2 shadow-inner">
              {holdPiece ? (
                <div
                  className="grid gap-0.5"
                  style={{ gridTemplateColumns: `repeat(${holdPiece.matrix[0].length}, 12px)` }}
                >
                  {holdPiece.matrix.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`${r}-${c}`}
                        className="w-3 h-3 rounded-[1px]"
                        style={{ backgroundColor: val ? holdPiece.color : 'transparent' }}
                      />
                    ))
                  )}
                </div>
              ) : (
                <span className="text-xs text-text-muted font-mono">空</span>
              )}
            </div>
          </div>

          {/* Level Stats */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 space-y-2.5">
            <div>
              <span className="text-[11px] text-text-secondary block">当前速度等级</span>
              <span className="text-base font-mono font-bold text-accent">Level {level}</span>
            </div>
            <div className="pt-2 border-t border-border">
              <span className="text-[11px] text-text-secondary block">已消除行数</span>
              <span className="text-base font-mono font-bold text-text-primary">{lines} 行</span>
            </div>
          </div>
        </div>

        {/* Center: Main Tetris 10x20 Grid */}
        <div className="relative p-2 rounded-2xl border border-border bg-surface-secondary/80 shadow-md">
          <div
            className="grid gap-[1px] bg-surface border border-border rounded-lg overflow-hidden shadow-inner"
            style={{
              gridTemplateColumns: `repeat(${TETRIS_COLS}, 24px)`,
              gridTemplateRows: `repeat(${TETRIS_ROWS}, 24px)`,
            }}
          >
            {displayGrid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className="w-6 h-6 rounded-[2px] transition-colors"
                  style={{
                    backgroundColor: cell
                      ? cell.isGhost
                        ? `${cell.color}25`
                        : cell.color
                      : 'var(--surface-secondary)',
                    border: cell?.isGhost
                      ? `1px dashed ${cell.color}80`
                      : cell
                      ? '1px solid rgba(255,255,255,0.2)'
                      : 'none',
                  }}
                />
              ))
            )}
          </div>

          {/* Game Over / Pause Overlay */}
          {(!isPlaying || gameOver) && (
            <div className="absolute inset-0 bg-canvas/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in duration-120">
              {gameOver ? (
                <>
                  <span className="text-danger font-bold text-base mb-1">触顶出局</span>
                  <span className="text-xs text-text-secondary mb-4 font-mono">
                    最终得分: {score}
                  </span>
                  <button
                    onClick={startNewGame}
                    className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer"
                  >
                    重开新局
                  </button>
                </>
              ) : (
                <>
                  <span className="text-text-primary font-bold text-base mb-2">对战就绪</span>
                  <p className="text-xs text-text-secondary mb-4 max-w-xs">
                    方向键移动与旋转，空格硬降，C键暂存
                  </p>
                  <button
                    onClick={startNewGame}
                    className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer"
                  >
                    开始游戏
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Next Piece & High Scores */}
        <div className="w-full md:w-36 space-y-3 shrink-0">
          {/* Next Piece */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 text-center">
            <span className="text-xs font-semibold text-text-secondary block mb-2">下一块</span>
            <div className="w-18 h-18 mx-auto bg-surface border border-border rounded-lg flex items-center justify-center p-2 shadow-inner">
              {nextPiece ? (
                <div
                  className="grid gap-0.5"
                  style={{ gridTemplateColumns: `repeat(${nextPiece.matrix[0].length}, 12px)` }}
                >
                  {nextPiece.matrix.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`${r}-${c}`}
                        className="w-3 h-3 rounded-[1px]"
                        style={{ backgroundColor: val ? nextPiece.color : 'transparent' }}
                      />
                    ))
                  )}
                </div>
              ) : (
                <span className="text-xs text-text-muted font-mono">--</span>
              )}
            </div>
          </div>

          {/* Scores */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 space-y-2">
            <div>
              <span className="text-[11px] text-text-secondary block">当前得分</span>
              <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {score}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <span className="text-[11px] text-text-secondary flex items-center gap-1">
                <Trophy className="w-3 h-3 text-warning" />
                <span>最高分</span>
              </span>
              <span className="text-sm font-mono font-bold text-warning tabular-nums">
                {highScore}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}
