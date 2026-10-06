'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import GameLayout from '@/components/games/GameLayout'
import { useRecentGames } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import { RotateCcw, Bot, User, Trophy, Sparkles } from 'lucide-react'
import {
  GOMOKU_SIZE,
  GomokuBoard,
  GomokuStone,
  createEmptyGomokuBoard,
  findGomokuWinLine,
  isGomokuBoardFull,
} from '@/core/games/gomoku'

type Pos = { r: number; c: number }

const STAR_POINTS = [
  [3, 3], [3, 7], [3, 11],
  [7, 3], [7, 7], [7, 11],
  [11, 3], [11, 7], [11, 11],
]

const AI_DEPTH: Record<string, number> = { easy: 2, medium: 3, hard: 4 }
const DIRS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]

function evaluateLine(board: GomokuBoard, r: number, c: number, dr: number, dc: number, player: GomokuStone): number {
  if (!player) return 0
  let count = 0
  let openEnds = 0
  let nr = r + dr, nc = c + dc
  while (nr >= 0 && nr < GOMOKU_SIZE && nc >= 0 && nc < GOMOKU_SIZE && board[nr][nc] === player) {
    count++
    nr += dr; nc += dc
  }
  if (nr >= 0 && nr < GOMOKU_SIZE && nc >= 0 && nc < GOMOKU_SIZE && board[nr][nc] === null) openEnds++

  nr = r - dr; nc = c - dc
  while (nr >= 0 && nr < GOMOKU_SIZE && nc >= 0 && nc < GOMOKU_SIZE && board[nr][nc] === player) {
    count++
    nr -= dr; nc -= dc
  }
  if (nr >= 0 && nr < GOMOKU_SIZE && nc >= 0 && nc < GOMOKU_SIZE && board[nr][nc] === null) openEnds++

  if (count >= 5) return 100000
  if (count === 4 && openEnds === 2) return 10000
  if (count === 4 && openEnds === 1) return 1000
  if (count === 3 && openEnds === 2) return 500
  if (count === 3 && openEnds === 1) return 100
  if (count === 2 && openEnds === 2) return 50
  if (count === 2 && openEnds === 1) return 10
  return count
}

function evaluateBoard(board: GomokuBoard, player: GomokuStone): number {
  let score = 0
  const opp: GomokuStone = player === 'black' ? 'white' : 'black'
  for (let r = 0; r < GOMOKU_SIZE; r++) {
    for (let c = 0; c < GOMOKU_SIZE; c++) {
      if (board[r][c] === player) {
        for (const [dr, dc] of DIRS) {
          score += evaluateLine(board, r, c, dr, dc, player)
        }
      } else if (board[r][c] === opp) {
        for (const [dr, dc] of DIRS) {
          score -= evaluateLine(board, r, c, dr, dc, opp) * 1.15
        }
      }
    }
  }
  return score
}

function findWinningMove(board: GomokuBoard, player: 'black' | 'white'): Pos | null {
  for (let r = 0; r < GOMOKU_SIZE; r++) {
    for (let c = 0; c < GOMOKU_SIZE; c++) {
      if (!board[r][c]) {
        board[r][c] = player
        if (findGomokuWinLine(board, r, c, player)) {
          board[r][c] = null
          return { r, c }
        }
        board[r][c] = null
      }
    }
  }
  return null
}

function minimax(board: GomokuBoard, depth: number, alpha: number, beta: number, maximizing: boolean, aiPlayer: 'black' | 'white'): number {
  const human: 'black' | 'white' = aiPlayer === 'black' ? 'white' : 'black'

  for (let r = 0; r < GOMOKU_SIZE; r++) {
    for (let c = 0; c < GOMOKU_SIZE; c++) {
      const stone = board[r][c]
      if (stone) {
        if (findGomokuWinLine(board, r, c, stone)) {
          return stone === aiPlayer ? 1000000 + depth : -1000000 - depth
        }
      }
    }
  }

  if (depth === 0) return evaluateBoard(board, aiPlayer)

  const candidates: Pos[] = []
  const checked = new Set<string>()
  for (let r = 0; r < GOMOKU_SIZE; r++) {
    for (let c = 0; c < GOMOKU_SIZE; c++) {
      if (board[r][c]) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr, nc = c + dc
            const key = `${nr},${nc}`
            if (nr >= 0 && nr < GOMOKU_SIZE && nc >= 0 && nc < GOMOKU_SIZE && !board[nr][nc] && !checked.has(key)) {
              checked.add(key)
              candidates.push({ r: nr, c: nc })
            }
          }
        }
      }
    }
  }

  candidates.sort((a, b) => {
    const ca = Math.abs(a.r - 7) + Math.abs(a.c - 7)
    const cb = Math.abs(b.r - 7) + Math.abs(b.c - 7)
    return ca - cb
  })

  const maxNodes = depth === 1 ? 50 : depth === 2 ? 30 : 15
  const limitedCandidates = candidates.slice(0, maxNodes)

  if (maximizing) {
    let best = -Infinity
    for (const pos of limitedCandidates) {
      board[pos.r][pos.c] = aiPlayer
      best = Math.max(best, minimax(board, depth - 1, alpha, beta, false, aiPlayer))
      board[pos.r][pos.c] = null
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const pos of limitedCandidates) {
      board[pos.r][pos.c] = human
      best = Math.min(best, minimax(board, depth - 1, alpha, beta, true, aiPlayer))
      board[pos.r][pos.c] = null
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

export default function GomokuPage() {
  const { recordRecentGame } = useRecentGames()

  useEffect(() => {
    recordRecentGame('gomoku')
    trackEvent('game_start', { gameSlug: 'gomoku' })
  }, [recordRecentGame])

  const [wins, setWins] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bitnook_gomoku_wins')
        if (saved) return Number(saved)
      } catch {
        // ignore
      }
    }
    return 0
  })

  const [board, setBoard] = useState<GomokuBoard>(() => createEmptyGomokuBoard())
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black')
  const [winner, setWinner] = useState<GomokuStone>(null)
  const [winLine, setWinLine] = useState<[number, number][]>([])
  const [lastMove, setLastMove] = useState<Pos | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [playerColor, setPlayerColor] = useState<'black' | 'white'>('black')
  const [thinking, setThinking] = useState(false)

  const boardRef = useRef(board)
  useEffect(() => { boardRef.current = board }, [board])

  const aiMove = useCallback(() => {
    setThinking(true)
    setTimeout(() => {
      const currentBoard = boardRef.current
      const depth = AI_DEPTH[difficulty]
      const aiPlayer: 'black' | 'white' = playerColor === 'black' ? 'white' : 'black'
      const human = playerColor

      // 1. Check if AI can win immediately
      const winPos = findWinningMove(currentBoard, aiPlayer)
      if (winPos) {
        const nb = currentBoard.map(r => [...r])
        nb[winPos.r][winPos.c] = aiPlayer
        setBoard(nb)
        setLastMove(winPos)
        const wl = findGomokuWinLine(nb, winPos.r, winPos.c, aiPlayer)
        if (wl) { setWinLine(wl); setWinner(aiPlayer); setGameOver(true) }
        setThinking(false)
        return
      }

      // 2. Block human if they can win next turn
      const blockPos = findWinningMove(currentBoard, human)
      if (blockPos) {
        const nb = currentBoard.map(r => [...r])
        nb[blockPos.r][blockPos.c] = aiPlayer
        setBoard(nb)
        setLastMove(blockPos)
        const wl = findGomokuWinLine(nb, blockPos.r, blockPos.c, aiPlayer)
        if (wl) { setWinLine(wl); setWinner(aiPlayer); setGameOver(true) }
        else setCurrentPlayer(human)
        setThinking(false)
        return
      }

      // 3. Minimax heuristic
      const candidates: Pos[] = []
      const checked = new Set<string>()
      for (let r = 0; r < GOMOKU_SIZE; r++) {
        for (let c = 0; c < GOMOKU_SIZE; c++) {
          if (currentBoard[r][c]) {
            for (let dr = -2; dr <= 2; dr++) {
              for (let dc = -2; dc <= 2; dc++) {
                const nr = r + dr, nc = c + dc
                const key = `${nr},${nc}`
                if (nr >= 0 && nr < GOMOKU_SIZE && nc >= 0 && nc < GOMOKU_SIZE && !currentBoard[nr][nc] && !checked.has(key)) {
                  checked.add(key)
                  candidates.push({ r: nr, c: nc })
                }
              }
            }
          }
        }
      }
      candidates.sort((a, b) => {
        const ca = Math.abs(a.r - 7) + Math.abs(a.c - 7)
        const cb = Math.abs(b.r - 7) + Math.abs(b.c - 7)
        return ca - cb
      })

      let bestScore = -Infinity
      let bestMove = candidates[0] || { r: 7, c: 7 }
      const maxNodes = depth === 1 ? 50 : depth === 2 ? 30 : 15
      const limitedCandidates = candidates.slice(0, maxNodes)

      for (const pos of limitedCandidates) {
        currentBoard[pos.r][pos.c] = aiPlayer
        const score = minimax(currentBoard, depth - 1, -Infinity, Infinity, false, aiPlayer)
        currentBoard[pos.r][pos.c] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = pos
        }
      }

      const nb = currentBoard.map(r => [...r])
      nb[bestMove.r][bestMove.c] = aiPlayer
      setBoard(nb)
      setLastMove(bestMove)
      const wl = findGomokuWinLine(nb, bestMove.r, bestMove.c, aiPlayer)
      if (wl) { setWinLine(wl); setWinner(aiPlayer); setGameOver(true) }
      else setCurrentPlayer(human)
      setThinking(false)
    }, 400)
  }, [difficulty, playerColor])

  const handleClick = (row: number, col: number) => {
    if (gameOver || thinking) return
    if (gameMode === 'ai' && currentPlayer !== playerColor) return
    if (board[row][col]) return

    const newBoard = board.map(r => [...r])
    newBoard[row][col] = currentPlayer
    setBoard(newBoard)
    setLastMove({ r: row, c: col })
    boardRef.current = newBoard

    const winResult = findGomokuWinLine(newBoard, row, col, currentPlayer)
    if (winResult) {
      setWinner(currentPlayer)
      setWinLine(winResult)
      setGameOver(true)
      if (gameMode === 'ai' && currentPlayer === playerColor) {
        const nextWins = wins + 1
        setWins(nextWins)
        try {
          localStorage.setItem('bitnook_gomoku_wins', String(nextWins))
        } catch {
          // ignore
        }
      }
      trackEvent('game_complete', { gameSlug: 'gomoku', status: 'success' })
      return
    }

    if (isGomokuBoardFull(newBoard)) {
      setGameOver(true)
      return
    }

    const next = currentPlayer === 'black' ? 'white' : 'black'
    setCurrentPlayer(next)

    if (gameMode === 'ai' && !gameOver) {
      aiMove()
    }
  }

  const resetGame = () => {
    setBoard(createEmptyGomokuBoard())
    setCurrentPlayer('black')
    setWinner(null)
    setWinLine([])
    setLastMove(null)
    setGameOver(false)
    setThinking(false)
  }

  const switchMode = (mode: 'pvp' | 'ai') => {
    setGameMode(mode)
    resetGame()
  }

  const switchSide = () => {
    const newColor = playerColor === 'black' ? 'white' : 'black'
    setPlayerColor(newColor)
    resetGame()
    if (newColor === 'white') {
      setThinking(true)
      setTimeout(() => {
        const aiPlayer = 'black'
        const nb = createEmptyGomokuBoard()
        nb[7][7] = aiPlayer
        setBoard(nb)
        setLastMove({ r: 7, c: 7 })
        setCurrentPlayer('white')
        setThinking(false)
      }, 400)
    }
  }

  const isWinningCell = (row: number, col: number) => {
    return winLine.some(([r, c]) => r === row && c === col)
  }

  const instructions = [
    { title: '对弈模式', desc: '可自由在 AI 对战与双人同屏对战之间切换。' },
    { title: '先手规则', desc: '传统规则黑子先手。在 AI 模式下可一键切换执黑或执白。' },
    { title: '胜负判定', desc: '任意一方在横向、竖向或对角线连续落成 5 颗同色棋子即判定获胜。' },
  ]

  const controls = (
    <div className="flex items-center gap-2 flex-wrap">
      {wins > 0 && (
        <span className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 font-mono font-medium">
          <Trophy className="w-3.5 h-3.5" />
          <span>{wins} 胜</span>
        </span>
      )}
      <button
        onClick={resetGame}
        className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors shadow-subtle"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>重新开始</span>
      </button>
    </div>
  )

  return (
    <GameLayout
      title="五子棋"
      titleEn="Gomoku · Five in a Row"
      categoryName="经典棋盘"
      description="经典 15×15 棋盘五子棋。支持多深度 Minimax 启发式 AI 引擎与本地双人对战，支持先后手互换与连续胜局统计。"
      controlsNode={controls}
      instructions={instructions}
    >
      <div className="w-full max-w-[560px] flex flex-col items-center">
        {/* Mode & Difficulty Settings */}
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 p-3 rounded-xl border border-border bg-surface-secondary/50">
          <div className="flex rounded-lg border border-border bg-surface p-0.5">
            <button
              onClick={() => switchMode('ai')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                gameMode === 'ai'
                  ? 'bg-accent text-accent-contrast shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>人机对战</span>
            </button>
            <button
              onClick={() => switchMode('pvp')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                gameMode === 'pvp'
                  ? 'bg-accent text-accent-contrast shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>双人对战</span>
            </button>
          </div>

          {gameMode === 'ai' && (
            <div className="flex items-center gap-2 justify-between sm:justify-end">
              <div className="flex items-center gap-1 text-xs">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      difficulty === d
                        ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {d === 'easy' ? '初级' : d === 'medium' ? '中级' : '大师'}
                  </button>
                ))}
              </div>
              <button
                onClick={switchSide}
                className="px-2.5 py-1 rounded text-xs font-medium border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors"
                title="切换黑白方先后手"
              >
                执{playerColor === 'black' ? '黑先行' : '白后行'} (换边)
              </button>
            </div>
          )}
        </div>

        {/* Turn Status Alert */}
        <div className="w-full flex items-center justify-between px-3 py-2.5 mb-4 rounded-xl border border-border bg-surface shadow-subtle">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-4 h-4 rounded-full shadow-inner border ${
                currentPlayer === 'black'
                  ? 'bg-slate-900 border-slate-700'
                  : 'bg-white border-slate-300'
              }`}
            />
            <span className="text-xs sm:text-sm font-semibold text-text-primary">
              {winner
                ? `${winner === 'black' ? '黑方' : '白方'}取得胜利！`
                : gameOver
                ? '棋盘走满，双方平局'
                : thinking
                ? 'AI 正在推演棋路中...'
                : `${currentPlayer === 'black' ? '黑方' : '白方'}走棋`}
            </span>
          </div>

          {winner && (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>对局结束</span>
            </span>
          )}
        </div>

        {/* Wooden Gomoku Board Container */}
        <div className="relative p-2.5 sm:p-4 rounded-2xl bg-[#E3C28D] dark:bg-[#B38F56] border-4 border-[#8B5E34] shadow-2xl overflow-hidden max-w-full">
          <div
            className="relative select-none"
            style={{
              width: '100%',
              maxWidth: 480,
              aspectRatio: '1 / 1',
            }}
          >
            {/* SVG Grid Overlay for Crisp Resolution Scaling */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              {Array.from({ length: GOMOKU_SIZE }).map((_, i) => {
                const pos = (i + 0.5) * (100 / GOMOKU_SIZE)
                const start = 0.5 * (100 / GOMOKU_SIZE)
                const end = (GOMOKU_SIZE - 0.5) * (100 / GOMOKU_SIZE)
                return (
                  <g key={i}>
                    {/* Horizontal */}
                    <line
                      x1={start}
                      y1={pos}
                      x2={end}
                      y2={pos}
                      stroke="#5D3A1A"
                      strokeWidth="0.35"
                    />
                    {/* Vertical */}
                    <line
                      x1={pos}
                      y1={start}
                      x2={pos}
                      y2={end}
                      stroke="#5D3A1A"
                      strokeWidth="0.35"
                    />
                  </g>
                )
              })}

              {/* Star Points */}
              {STAR_POINTS.map(([r, c]) => {
                const cx = (c + 0.5) * (100 / GOMOKU_SIZE)
                const cy = (r + 0.5) * (100 / GOMOKU_SIZE)
                return (
                  <circle
                    key={`star-${r}-${c}`}
                    cx={cx}
                    cy={cy}
                    r="0.8"
                    fill="#5D3A1A"
                  />
                )
              })}
            </svg>

            {/* Clickable Grid Cells & Stones */}
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${GOMOKU_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GOMOKU_SIZE}, 1fr)`,
              }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isWinning = isWinningCell(r, c)
                  const isLast = lastMove?.r === r && lastMove?.c === c

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleClick(r, c)}
                      disabled={gameOver || thinking || (gameMode === 'ai' && currentPlayer !== playerColor)}
                      className="relative w-full h-full flex items-center justify-center p-0.5 transition-transform focus:outline-none"
                    >
                      {cell && (
                        <div
                          className={`w-[84%] h-[84%] rounded-full shadow-md flex items-center justify-center transition-all ${
                            cell === 'black'
                              ? 'bg-gradient-to-br from-slate-700 via-slate-900 to-black border border-slate-900'
                              : 'bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-slate-300'
                          } ${
                            isWinning
                              ? 'ring-4 ring-amber-400 scale-105 animate-pulse z-20'
                              : ''
                          }`}
                        >
                          {/* Last Move Indicator */}
                          {isLast && !isWinning && (
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                cell === 'black' ? 'bg-amber-400' : 'bg-rose-500'
                              }`}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 shadow-sm inline-block" />
            <span>黑方 {gameMode === 'ai' && (playerColor === 'black' ? '(你)' : '(AI)')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 shadow-sm inline-block" />
            <span>白方 {gameMode === 'ai' && (playerColor === 'white' ? '(你)' : '(AI)')}</span>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}
