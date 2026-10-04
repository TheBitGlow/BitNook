'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Blocks, Play, Pause, RotateCcw } from 'lucide-react'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 28

type Tetromino = {
  shape: number[][]
  color: string
}

const TETROMINOES: Tetromino[] = [
  { shape: [[1, 1, 1, 1]], color: '#06B6D4' },
  { shape: [[1, 1], [1, 1]], color: '#F59E0B' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#8B5CF6' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#3B82F6' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#F97316' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#10B981' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#EF4444' },
]

export default function TetrisPage() {
  const [board, setBoard] = useState<number[][]>(() =>
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  )
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [lines, setLines] = useState(0)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const boardRef = useRef<number[][]>(board)
  const pieceRef = useRef<Tetromino | null>(null)
  const posRef = useRef({ x: 0, y: 0 })

  useEffect(() => { boardRef.current = board }, [board])
  useEffect(() => { pieceRef.current = currentPiece }, [currentPiece])
  useEffect(() => { posRef.current = position }, [position])

  const getRandomPiece = useCallback(() => {
    return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]
  }, [])

  const canMove = useCallback((piece: Tetromino, pos: { x: number; y: number }, currentBoard: number[][]): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x
          const newY = pos.y + y
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false
          if (newY >= 0 && currentBoard[newY][newX]) return false
        }
      }
    }
    return true
  }, [])

  const lockPiece = useCallback(() => {
    const piece = pieceRef.current
    const pos = posRef.current
    const currentBoard = boardRef.current
    if (!piece) return

    const newBoard = currentBoard.map(row => [...row])
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = pos.y + y
          const boardX = pos.x + x
          if (boardY >= 0) {
            newBoard[boardY][boardX] = 1
          }
        }
      }
    }

    let linesCleared = 0
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell)) {
        newBoard.splice(y, 1)
        newBoard.unshift(Array(BOARD_WIDTH).fill(0))
        linesCleared++
        y++
      }
    }

    setBoard(newBoard)
    if (linesCleared > 0) {
      setLines(l => l + linesCleared)
      const points = [0, 100, 300, 500, 800][linesCleared] || 0
      setScore(s => s + points)
    }

    const newPiece = nextPiece || getRandomPiece()
    const newNext = getRandomPiece()
    const newPos = { x: Math.floor((BOARD_WIDTH - newPiece.shape[0].length) / 2), y: 0 }

    if (!canMove(newPiece, newPos, newBoard)) {
      setGameOver(true)
      setIsPlaying(false)
      return
    }

    setCurrentPiece(newPiece)
    setNextPiece(newNext)
    setPosition(newPos)
    pieceRef.current = newPiece
    posRef.current = newPos
  }, [nextPiece, getRandomPiece, canMove])

  const moveDown = useCallback(() => {
    if (!isPlaying || gameOver) return
    const piece = pieceRef.current
    const pos = posRef.current
    const currentBoard = boardRef.current
    if (!piece) return

    if (canMove(piece, { x: pos.x, y: pos.y + 1 }, currentBoard)) {
      const newPos = { x: pos.x, y: pos.y + 1 }
      setPosition(newPos)
      posRef.current = newPos
    } else {
      lockPiece()
    }
  }, [isPlaying, gameOver, canMove, lockPiece])

  const moveLeft = useCallback(() => {
    const piece = pieceRef.current
    const pos = posRef.current
    const currentBoard = boardRef.current
    if (!piece || !isPlaying) return
    if (canMove(piece, { x: pos.x - 1, y: pos.y }, currentBoard)) {
      const newPos = { x: pos.x - 1, y: pos.y }
      setPosition(newPos)
      posRef.current = newPos
    }
  }, [isPlaying, canMove])

  const moveRight = useCallback(() => {
    const piece = pieceRef.current
    const pos = posRef.current
    const currentBoard = boardRef.current
    if (!piece || !isPlaying) return
    if (canMove(piece, { x: pos.x + 1, y: pos.y }, currentBoard)) {
      const newPos = { x: pos.x + 1, y: pos.y }
      setPosition(newPos)
      posRef.current = newPos
    }
  }, [isPlaying, canMove])

  const rotate = useCallback(() => {
    const piece = pieceRef.current
    const pos = posRef.current
    const currentBoard = boardRef.current
    if (!piece || !isPlaying) return
    const rotated = {
      ...piece,
      shape: piece.shape[0].map((_, i) =>
        piece.shape.map(row => row[i]).reverse()
      )
    }
    if (canMove(rotated, pos, currentBoard)) {
      setCurrentPiece(rotated)
      pieceRef.current = rotated
    }
  }, [isPlaying, canMove])

  const hardDrop = useCallback(() => {
    const piece = pieceRef.current
    const pos = posRef.current
    const currentBoard = boardRef.current
    if (!piece || !isPlaying) return
    let newY = pos.y
    while (canMove(piece, { x: pos.x, y: newY + 1 }, currentBoard)) {
      newY++
    }
    const newPos = { x: pos.x, y: newY }
    setPosition(newPos)
    posRef.current = newPos
    lockPiece()
  }, [isPlaying, canMove, lockPiece])

  const startGame = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
    const firstPiece = getRandomPiece()
    const secondPiece = getRandomPiece()
    const startPos = { x: Math.floor((BOARD_WIDTH - firstPiece.shape[0].length) / 2), y: 0 }

    setBoard(newBoard)
    setCurrentPiece(firstPiece)
    setNextPiece(secondPiece)
    setPosition(startPos)
    setScore(0)
    setLines(0)
    setGameOver(false)
    setIsPlaying(true)

    boardRef.current = newBoard
    pieceRef.current = firstPiece
    posRef.current = startPos
  }, [getRandomPiece])

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveDown, 500)
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [isPlaying, gameOver, moveDown])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          startGame()
        }
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          moveLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          moveRight()
          break
        case 'ArrowDown':
          e.preventDefault()
          moveDown()
          break
        case 'ArrowUp':
          e.preventDefault()
          rotate()
          break
        case ' ':
          e.preventDefault()
          hardDrop()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, moveLeft, moveRight, moveDown, rotate, hardDrop, startGame])

  const renderBoard = () => {
    const displayBoard = boardRef.current.map(row => [...row])
    const piece = pieceRef.current
    const pos = posRef.current

    if (piece) {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardY = pos.y + y
            const boardX = pos.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = 2
            }
          }
        }
      }
    }

    return displayBoard
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EC4899]/20 flex items-center justify-center">
                <Blocks className="w-5 h-5 text-[#EC4899]" />
              </div>
              <h1 className="text-2xl font-bold text-white">俄罗斯方块</h1>
            </div>
            <p className="text-[#94A3B8]">经典方块消除游戏</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Game Board */}
            <div className="flex-shrink-0">
              <div
                className="relative bg-[#080B14] border-2 border-[rgba(99,102,241,0.3)] rounded-lg overflow-hidden"
                style={{
                  width: BOARD_WIDTH * CELL_SIZE,
                  height: BOARD_HEIGHT * CELL_SIZE
                }}
              >
                {renderBoard().map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="absolute"
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        left: x * CELL_SIZE,
                        top: y * CELL_SIZE,
                        backgroundColor:
                          cell === 1 ? '#475569' :
                          cell === 2 ? (currentPiece?.color || '#6366F1') : 'transparent',
                        border: cell
                          ? '1px solid rgba(255,255,255,0.1)'
                          : '1px solid rgba(99,102,241,0.05)'
                      }}
                    />
                  ))
                )}

                {gameOver && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white mb-2">游戏结束</p>
                      <p className="text-[#94A3B8]">得分: {score}</p>
                    </div>
                  </div>
                )}

                {!isPlaying && !gameOver && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <p className="text-[#94A3B8]">按 空格键 开始</p>
                  </div>
                )}
              </div>
            </div>

            {/* Side Panel */}
            <div className="flex-1 space-y-4">
              {/* Score */}
              <div className="glass-card p-4 text-center">
                <p className="text-sm text-[#94A3B8] mb-1">得分</p>
                <p className="text-3xl font-bold text-white">{score}</p>
              </div>

              {/* Lines */}
              <div className="glass-card p-4 text-center">
                <p className="text-sm text-[#94A3B8] mb-1">消除行数</p>
                <p className="text-2xl font-bold text-white">{lines}</p>
              </div>

              {/* Next Piece Preview */}
              <div className="glass-card p-4">
                <p className="text-sm text-[#94A3B8] mb-3 text-center">下一个</p>
                <div
                  className="mx-auto bg-[#080B14] rounded"
                  style={{
                    width: 80,
                    height: 80,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 1,
                    padding: 4
                  }}
                >
                  {nextPiece ? (
                    nextPiece.shape.map((row, y) =>
                      row.map((cell, x) => (
                        <div
                          key={`next-${x}-${y}`}
                          style={{
                            width: 16,
                            height: 16,
                            backgroundColor: cell ? nextPiece.color : 'transparent',
                            borderRadius: cell ? 2 : 0,
                          }}
                        />
                      ))
                    )
                  ) : (
                    Array(16).fill(null).map((_, i) => (
                      <div key={`empty-${i}`} style={{ width: 16, height: 16 }} />
                    ))
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="glass-card p-4">
                <h3 className="text-white font-medium mb-3">操作说明</h3>
                <div className="space-y-2 text-sm text-[#94A3B8]">
                  <p>← → 移动</p>
                  <p>↑ 旋转</p>
                  <p>↓ 软降</p>
                  <p>空格 硬降/开始</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="flex-1 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-white font-medium hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  开始
                </button>
                <button
                  onClick={() => setIsPlaying(false)}
                  disabled={!isPlaying}
                  className="px-6 py-3 bg-[#111827] border border-[rgba(99,102,241,0.3)] rounded-xl text-[#94A3B8] hover:text-white disabled:opacity-50 flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Controls */}
              <div className="grid grid-cols-3 gap-2 lg:hidden">
                <button
                  onClick={moveLeft}
                  disabled={!isPlaying}
                  className="p-4 bg-[#111827] border border-[rgba(99,102,241,0.3)] rounded-xl text-white disabled:opacity-50"
                >
                  ←
                </button>
                <button
                  onClick={rotate}
                  disabled={!isPlaying}
                  className="p-4 bg-[#111827] border border-[rgba(99,102,241,0.3)] rounded-xl text-white disabled:opacity-50"
                >
                  ↻
                </button>
                <button
                  onClick={moveRight}
                  disabled={!isPlaying}
                  className="p-4 bg-[#111827] border border-[rgba(99,102,241,0.3)] rounded-xl text-white disabled:opacity-50"
                >
                  →
                </button>
                <button
                  onClick={moveDown}
                  disabled={!isPlaying}
                  className="col-span-2 p-4 bg-[#111827] border border-[rgba(99,102,241,0.3)] rounded-xl text-white disabled:opacity-50"
                >
                  ↓
                </button>
                <button
                  onClick={hardDrop}
                  disabled={!isPlaying}
                  className="p-4 bg-[#6366F1] rounded-xl text-white disabled:opacity-50"
                >
                  ↓↓
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
