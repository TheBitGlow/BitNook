'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Ghost, Play, Trophy, Flag } from 'lucide-react'

type Cell = { isMine: boolean; isRevealed: boolean; isFlagged: boolean; neighborMines: number }

const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
}

const CELL_COLORS = ['', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899', '#F1F5F9']

export default function MinesweeperPage() {
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTIES>('easy')
  const [board, setBoard] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [time, setTime] = useState(0)
  const [flagsLeft, setFlagsLeft] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [firstClick, setFirstClick] = useState<{ r: number; c: number } | null>(null)

  const boardRef = useRef(board)
  useEffect(() => { boardRef.current = board }, [board])

  const initBoard = useCallback((rows: number, cols: number, mines: number, firstClickPos?: { r: number; c: number }): Cell[][] => {
    const newBoard: Cell[][] = []

    for (let r = 0; r < rows; r++) {
      newBoard[r] = []
      for (let c = 0; c < cols; c++) {
        newBoard[r][c] = { isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 }
      }
    }

    let minesPlaced = 0
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows)
      const c = Math.floor(Math.random() * cols)
      const isFirstClick = firstClickPos && r === firstClickPos.r && c === firstClickPos.c
      if (!newBoard[r][c].isMine && !isFirstClick) {
        newBoard[r][c].isMine = true
        minesPlaced++
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
                count++
              }
            }
          }
          newBoard[r][c].neighborMines = count
        }
      }
    }

    return newBoard
  }, [])

  const startGame = useCallback((firstClickPos?: { r: number; c: number }) => {
    const { rows, cols, mines } = DIFFICULTIES[difficulty]
    const newBoard = initBoard(rows, cols, mines, firstClickPos)
    setBoard(newBoard)
    boardRef.current = newBoard
    setFlagsLeft(mines)
    setTime(0)
    setGameOver(false)
    setGameWon(false)
    setGameStarted(false)
    setFirstClick(firstClickPos || null)
  }, [difficulty, initBoard])

  useEffect(() => {
    startGame()
  }, [difficulty])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (gameStarted && !gameOver && !gameWon) {
      interval = setInterval(() => setTime(t => t + 1), 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [gameStarted, gameOver, gameWon])

  const revealCell = useCallback((r: number, c: number): Cell[][] => {
    const { rows, cols } = DIFFICULTIES[difficulty]
    const currentBoard = boardRef.current
    const cell = currentBoard[r][c]

    if (cell.isRevealed || cell.isFlagged) return currentBoard

    const newBoard = currentBoard.map(row => row.map(c => ({ ...c })))
    const queue: { r: number; c: number }[] = [{ r, c }]

    while (queue.length > 0) {
      const pos = queue.shift()!
      const target = newBoard[pos.r][pos.c]
      if (target.isRevealed || target.isFlagged) continue

      target.isRevealed = true
      if (target.isMine || target.neighborMines > 0) continue

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = pos.r + dr, nc = pos.c + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const neighbor = newBoard[nr][nc]
            if (!neighbor.isRevealed && !neighbor.isFlagged) queue.push({ r: nr, c: nc })
          }
        }
      }
    }

    return newBoard
  }, [difficulty])

  const handleLeftClick = (r: number, c: number) => {
    if (gameOver || gameWon) return

    const { rows, cols, mines } = DIFFICULTIES[difficulty]
    let newBoard: Cell[][]

    if (!gameStarted) {
      newBoard = initBoard(rows, cols, mines, { r, c })
      setBoard(newBoard)
      boardRef.current = newBoard
      setGameStarted(true)
    } else {
      newBoard = boardRef.current
    }

    const targetCell = newBoard[r][c]

    if (targetCell.isRevealed || targetCell.isFlagged) return

    if (targetCell.isMine) {
      targetCell.isRevealed = true
      setBoard([...newBoard])
      setGameOver(true)
      return
    }

    const revealed = revealCell(r, c)
    setBoard([...revealed])
    boardRef.current = revealed

    let revealedCount = 0
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (revealed[i][j].isRevealed) revealedCount++
      }
    }
    if (revealedCount === rows * cols - mines) {
      setGameWon(true)
    }
  }

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    if (gameOver || gameWon || board[r][c].isRevealed) return

    const newBoard = board.map(row => row.map(cell => ({ ...cell })))
    newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged
    setBoard(newBoard)
    boardRef.current = newBoard
    setFlagsLeft(prev => newBoard[r][c].isFlagged ? prev - 1 : prev + 1)
  }

  const { rows, cols } = DIFFICULTIES[difficulty]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <Ghost className="w-5 h-5 text-[#6366F1]" />
              </div>
              <h1 className="text-2xl font-bold text-white">扫雷</h1>
            </div>
            <p className="text-[#94A3B8]">经典扫雷游戏，左键翻开，右键标记</p>
          </div>

          {/* Difficulty Selector */}
          <div className="flex gap-2 mb-6">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  difficulty === d ? 'bg-[#6366F1] text-white' : 'bg-[#111827] text-[#94A3B8] hover:text-white'
                }`}
              >
                {d === 'easy' ? '初级' : d === 'medium' ? '中级' : '高级'}
              </button>
            ))}
          </div>

          {/* Game Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <span className="text-[#EF4444] font-mono text-lg flex items-center gap-1">
                <Flag className="w-4 h-4" /> {flagsLeft}
              </span>
              <span className="text-[#06B6D4] font-mono text-lg">⏱ {time}s</span>
            </div>
            <button onClick={() => startGame()} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5558E3] flex items-center gap-2">
              <Play className="w-4 h-4" />
              重新开始
            </button>
          </div>

          {/* Game Board */}
          <div className="glass-card p-4 overflow-x-auto">
            <div
              className="grid gap-0.5 mx-auto"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(28px, 1fr))` }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleLeftClick(r, c)}
                    onContextMenu={(e) => handleRightClick(e, r, c)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                      cell.isRevealed
                        ? cell.isMine
                          ? 'bg-[#EF4444] text-white'
                          : 'bg-[#1A2235] text-white'
                        : cell.isFlagged
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                        : 'bg-[#374151] hover:bg-[#4B5563] text-[#94A3B8]'
                    }`}
                  >
                    {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && (
                      <span style={{ color: CELL_COLORS[cell.neighborMines] }}>
                        {cell.neighborMines}
                      </span>
                    )}
                    {!cell.isRevealed && cell.isFlagged && <Flag className="w-4 h-4" />}
                    {cell.isRevealed && cell.isMine && <span>💣</span>}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Game Over Overlay */}
          {(gameOver || gameWon) && (
            <div className="mt-6 glass-card p-6 text-center">
              {gameWon ? (
                <>
                  <Trophy className="w-12 h-12 text-[#F59E0B] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">恭喜通关！</h2>
                  <p className="text-[#94A3B8]">用时 {time} 秒</p>
                </>
              ) : (
                <>
                  <Ghost className="w-12 h-12 text-[#EF4444] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">游戏结束</h2>
                  <p className="text-[#94A3B8]">踩到地雷了</p>
                </>
              )}
              <button
                onClick={() => startGame()}
                className="mt-4 px-6 py-3 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#5558E3] flex items-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4" />
                再来一局
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-[#111927]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">提示：</span>
              左键点击翻开方格，右键点击标记地雷。数字表示周围8个方格中的地雷数量。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
