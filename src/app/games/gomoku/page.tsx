'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Grid3X3, RotateCcw, Bot, User } from 'lucide-react'

const BOARD_SIZE = 15
const WIN_COUNT = 5
const CELL_SIZE = 32

type Player = 'black' | 'white' | null
type Board = Player[][]
type Pos = { r: number; c: number }

const STAR_POINTS = [
  [3, 3], [3, 7], [3, 11],
  [7, 3], [7, 7], [7, 11],
  [11, 3], [11, 7], [11, 11]
]

// AI难度深度
const AI_DEPTH: Record<string, number> = { easy: 2, medium: 3, hard: 4 }

// 方向向量
const DIRS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]

// 评估棋型分数
function evaluateLine(board: Board, r: number, c: number, dr: number, dc: number, player: Player): number {
  if (!player) return 0
  let count = 0
  let openEnds = 0
  let nr = r + dr, nc = c + dc
  while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
    count++
    nr += dr; nc += dc
  }
  if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) openEnds++
  nr = r - dr; nc = c - dc
  while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
    count++
    nr -= dr; nc -= dc
  }
  if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) openEnds++

  if (count >= 5) return 100000
  if (count === 4 && openEnds === 2) return 10000
  if (count === 4 && openEnds === 1) return 1000
  if (count === 3 && openEnds === 2) return 500
  if (count === 3 && openEnds === 1) return 100
  if (count === 2 && openEnds === 2) return 50
  if (count === 2 && openEnds === 1) return 10
  return count
}

function evaluateBoard(board: Board, player: Player): number {
  let score = 0
  const opp = player === 'black' ? 'white' : 'black'
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === player) {
        for (const [dr, dc] of DIRS) {
          score += evaluateLine(board, r, c, dr, dc, player)
        }
      } else if (board[r][c] === opp) {
        for (const [dr, dc] of DIRS) {
          score -= evaluateLine(board, r, c, dr, dc, opp) * 1.1
        }
      }
    }
  }
  return score
}

function findWinningMove(board: Board, player: Player): Pos | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!board[r][c]) {
        board[r][c] = player
        if (checkWin(board, r, c, player)) {
          board[r][c] = null
          return { r, c }
        }
        board[r][c] = null
      }
    }
  }
  return null
}

function checkWin(board: Board, row: number, col: number, player: Player): boolean {
  if (!player) return false
  for (const [dr, dc] of DIRS) {
    let count = 1
    let nr = row + dr, nc = col + dc
    while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
      count++; nr += dr; nc += dc
    }
    nr = row - dr; nc = col - dc
    while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
      count++; nr -= dr; nc -= dc
    }
    if (count >= 5) return true
  }
  return false
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, aiPlayer: Player): number {
  const human = aiPlayer === 'black' ? 'white' : 'black'

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]) {
        if (checkWin(board, r, c, board[r][c])) {
          return board[r][c] === aiPlayer ? 1000000 + depth : -1000000 - depth
        }
      }
    }
  }

  if (depth === 0) return evaluateBoard(board, aiPlayer)

  const candidates: Pos[] = []
  const checked = new Set<string>()
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr, nc = c + dc
            const key = `${nr},${nc}`
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !board[nr][nc] && !checked.has(key)) {
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

  const maxNodes = depth === 1 ? 50 : depth === 2 ? 30 : 20
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
  const [board, setBoard] = useState<Board>(() =>
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black')
  const [winner, setWinner] = useState<Player>(null)
  const [winLine, setWinLine] = useState<[number, number][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [playerColor, setPlayerColor] = useState<'black' | 'white'>('black')
  const [thinking, setThinking] = useState(false)

  const boardRef = useRef(board)
  useEffect(() => { boardRef.current = board }, [board])

  const checkWinLine = useCallback((board: Board, row: number, col: number, player: Player): [number, number][] | null => {
    if (!player) return null
    for (const [dr, dc] of DIRS) {
      const line: [number, number][] = [[row, col]]
      for (let i = 1; i < WIN_COUNT; i++) {
        const r = row + dr * i, c = col + dc * i
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
          line.push([r, c])
        } else break
      }
      for (let i = 1; i < WIN_COUNT; i++) {
        const r = row - dr * i, c = col - dc * i
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
          line.push([r, c])
        } else break
      }
      if (line.length >= WIN_COUNT) return line
    }
    return null
  }, [])

  const aiMove = useCallback(() => {
    setThinking(true)
    setTimeout(() => {
      const currentBoard = boardRef.current
      const depth = AI_DEPTH[difficulty]
      const aiPlayer = playerColor === 'black' ? 'white' : 'black'

      const winPos = findWinningMove(currentBoard, aiPlayer)
      if (winPos) {
        const nb = currentBoard.map(r => [...r])
        nb[winPos.r][winPos.c] = aiPlayer
        setBoard(nb)
        const wl = checkWinLine(nb, winPos.r, winPos.c, aiPlayer)
        if (wl) { setWinLine(wl); setWinner(aiPlayer); setGameOver(true) }
        setThinking(false)
        return
      }

      const human = playerColor
      const blockPos = findWinningMove(currentBoard, human)
      if (blockPos) {
        const nb = currentBoard.map(r => [...r])
        nb[blockPos.r][blockPos.c] = aiPlayer
        setBoard(nb)
        const wl = checkWinLine(nb, blockPos.r, blockPos.c, aiPlayer)
        if (wl) { setWinLine(wl); setWinner(aiPlayer); setGameOver(true) }
        else setCurrentPlayer(human)
        setThinking(false)
        return
      }

      const candidates: Pos[] = []
      const checked = new Set<string>()
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (currentBoard[r][c]) {
            for (let dr = -2; dr <= 2; dr++) {
              for (let dc = -2; dc <= 2; dc++) {
                const nr = r + dr, nc = c + dc
                const key = `${nr},${nc}`
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !currentBoard[nr][nc] && !checked.has(key)) {
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
      const wl = checkWinLine(nb, bestMove.r, bestMove.c, aiPlayer)
      if (wl) { setWinLine(wl); setWinner(aiPlayer); setGameOver(true) }
      else setCurrentPlayer(human)
      setThinking(false)
    }, 500)
  }, [difficulty, playerColor, checkWinLine])

  const handleClick = (row: number, col: number) => {
    if (gameOver || thinking) return
    if (gameMode === 'ai' && currentPlayer !== playerColor) return
    if (board[row][col]) return

    const newBoard = board.map(r => [...r])
    newBoard[row][col] = currentPlayer
    setBoard(newBoard)
    boardRef.current = newBoard

    const winResult = checkWinLine(newBoard, row, col, currentPlayer)
    if (winResult) {
      setWinner(currentPlayer)
      setWinLine(winResult)
      setGameOver(true)
      return
    }

    const isDraw = newBoard.every(r => r.every(c => c !== null))
    if (isDraw) {
      setGameOver(true)
      return
    }

    const next = currentPlayer === 'black' ? 'white' : 'black'
    setCurrentPlayer(next)

    if (gameMode === 'ai' && !gameOver) aiMove()
  }

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)))
    setCurrentPlayer('black')
    setWinner(null)
    setWinLine([])
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
        const nb = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
        nb[7][7] = aiPlayer
        setBoard(nb)
        setCurrentPlayer('white')
        setThinking(false)
      }, 500)
    }
  }

  const isWinningCell = (row: number, col: number) => {
    return winLine.some(([r, c]) => r === row && c === col)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h1 className="text-2xl font-bold text-white">五子棋</h1>
              <span className="px-2 py-1 text-xs rounded-full bg-[#F59E0B]/20 text-[#F59E0B]">
                {gameMode === 'ai' ? 'AI对战' : '双人对弈'}
              </span>
            </div>
            <p className="text-[#94A3B8]">{gameMode === 'ai' ? '你执黑方先行，AI执白方后行' : '双人对弈模式'}</p>
          </div>

          {/* Game Mode */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => switchMode('ai')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${gameMode === 'ai' ? 'bg-[#F59E0B] text-white' : 'bg-[#111827] text-[#94A3B8] hover:text-white'}`}
            >
              <Bot className="w-4 h-4" />AI对战
            </button>
            <button
              onClick={() => switchMode('pvp')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${gameMode === 'pvp' ? 'bg-[#F59E0B] text-white' : 'bg-[#111827] text-[#94A3B8] hover:text-white'}`}
            >
              <User className="w-4 h-4" />双人对战
            </button>
          </div>

          {/* AI Difficulty */}
          {gameMode === 'ai' && (
            <div className="flex gap-2 mb-4">
              <span className="text-[#94A3B8] text-sm self-center">难度:</span>
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium ${difficulty === d ? 'bg-[#06B6D4] text-white' : 'bg-[#111827] text-[#94A3B8]'}`}
                >
                  {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                </button>
              ))}
              <button
                onClick={switchSide}
                className="ml-auto py-1.5 px-3 rounded-lg text-xs font-medium bg-[#111827] text-[#94A3B8] hover:text-white"
              >
                换先手
              </button>
            </div>
          )}

          {/* Game Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full ${currentPlayer === 'black' ? 'bg-[#1a1a1a] border-2 border-white' : 'bg-white'}`} />
              <span className="text-white font-medium">
                {winner ? `${winner === 'black' ? '黑方' : '白方'}获胜！` :
                  gameOver ? '平局' : thinking ? 'AI思考中...' : `${currentPlayer === 'black' ? '黑方' : '白方'}执子`}
              </span>
            </div>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重新开始
            </button>
          </div>

          {/* Game Board */}
          <div className="bg-[#1A2235] rounded-xl p-4">
            <div
              className="relative mx-auto bg-[#DEB887] rounded"
              style={{
                width: BOARD_SIZE * CELL_SIZE,
                height: BOARD_SIZE * CELL_SIZE,
              }}
            >
              {/* Grid Lines - horizontal */}
              {Array(BOARD_SIZE).fill(null).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute bg-[#8B7355]"
                  style={{
                    left: CELL_SIZE / 2 - 1,
                    right: CELL_SIZE / 2 - 1,
                    height: 2,
                    top: CELL_SIZE / 2 + i * CELL_SIZE - 1,
                  }}
                />
              ))}

              {/* Grid Lines - vertical */}
              {Array(BOARD_SIZE).fill(null).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute bg-[#8B7355]"
                  style={{
                    top: CELL_SIZE / 2 - 1,
                    bottom: CELL_SIZE / 2 - 1,
                    width: 2,
                    left: CELL_SIZE / 2 + i * CELL_SIZE - 1,
                  }}
                />
              ))}

              {/* Star Points */}
              {STAR_POINTS.map(([r, c]) => (
                <div
                  key={`star-${r}-${c}`}
                  className="absolute w-3 h-3 rounded-full bg-[#8B7355]"
                  style={{
                    left: CELL_SIZE / 2 + c * CELL_SIZE - 1.5,
                    top: CELL_SIZE / 2 + r * CELL_SIZE - 1.5,
                  }}
                />
              ))}

              {/* Pieces */}
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleClick(r, c)}
                    className="absolute w-8 h-8 rounded-full flex items-center justify-center z-10"
                    style={{
                      left: CELL_SIZE / 2 + c * CELL_SIZE - 16,
                      top: CELL_SIZE / 2 + r * CELL_SIZE - 16,
                    }}
                  >
                    {cell && (
                      <div
                        className={`w-7 h-7 rounded-full transition-transform ${
                          cell === 'black'
                            ? 'bg-[#1a1a1a]'
                            : 'bg-white border border-gray-200'
                        } ${isWinningCell(r, c) ? 'ring-4 ring-[#F59E0B]' : ''}`}
                      />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#1a1a1a] border-2 border-white" />
              <span className="text-[#94A3B8]">黑方{playerColor === 'black' && gameMode === 'ai' ? '(你)' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white border border-gray-300" />
              <span className="text-[#94A3B8]">白方{playerColor === 'white' && gameMode === 'ai' ? '(你)' : ''}</span>
            </div>
          </div>

          {/* Rules */}
          <div className="mt-6 p-4 bg-[#111927]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">规则：</span>
              {gameMode === 'ai' ? '你执黑方先行，AI执白方后行。' : ''}
              最先将5子连成一条线（横、竖、斜）者获胜。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
