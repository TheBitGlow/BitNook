'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Crown, RotateCcw, Bot, User, Trophy } from 'lucide-react'

type Piece = { type: string; color: 'white' | 'black' }
type Board = (Piece | null)[][]
type Pos = { r: number; c: number }

const INITIAL_BOARD: Board = [
  [{ type: 'r', color: 'black' }, { type: 'n', color: 'black' }, { type: 'b', color: 'black' }, { type: 'q', color: 'black' }, { type: 'k', color: 'black' }, { type: 'b', color: 'black' }, { type: 'n', color: 'black' }, { type: 'r', color: 'black' }],
  Array(8).fill(null).map(() => ({ type: 'p', color: 'black' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p', color: 'white' })),
  [{ type: 'r', color: 'white' }, { type: 'n', color: 'white' }, { type: 'b', color: 'white' }, { type: 'q', color: 'white' }, { type: 'k', color: 'white' }, { type: 'b', color: 'white' }, { type: 'n', color: 'white' }, { type: 'r', color: 'white' }],
]

const PIECE_SYMBOLS: { [key: string]: { white: string; black: string } } = {
  k: { white: '♔', black: '♚' },
  q: { white: '♕', black: '♛' },
  r: { white: '♖', black: '♜' },
  b: { white: '♗', black: '♝' },
  n: { white: '♘', black: '♞' },
  p: { white: '♙', black: '♟' },
}

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000
}

const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0]
]

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50]
]

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20]
]

const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0]
]

const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20]
]

const KING_TABLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20]
]

const AI_DEPTH: Record<string, number> = { easy: 2, medium: 3, hard: 4 }

type Move = { from: Pos; to: Pos; score?: number }

function cloneBoard(b: Board): Board {
  return b.map(r => r.map(p => p ? { ...p } : null))
}

function isPathClear(b: Board, from: Pos, to: Pos): boolean {
  const dr = Math.sign(to.r - from.r) || 0
  const dc = Math.sign(to.c - from.c) || 0
  let r = from.r + dr, c = from.c + dc
  while (r !== to.r || c !== to.c) {
    if (b[r]?.[c]) return false
    r += dr; c += dc
  }
  return true
}

function getValidMoves(b: Board, color: 'white' | 'black', castling: { whiteKingside: boolean; whiteQueenside: boolean; blackKingside: boolean; blackQueenside: boolean }, enPassant: Pos | null): Move[] {
  const moves: Move[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r]?.[c]
      if (!p || p.color !== color) continue

      const addMove = (to: Pos) => {
        if (!b[to.r]?.[to.c] || b[to.r][to.c]?.color !== color) {
          moves.push({ from: { r, c }, to })
        }
      }

      switch (p.type) {
        case 'p': {
          const dir = color === 'white' ? -1 : 1
          const startRow = color === 'white' ? 6 : 1
          if (!b[r + dir]?.[c]) {
            moves.push({ from: { r, c }, to: { r: r + dir, c } })
            if (r === startRow && !b[r + 2 * dir]?.[c]) {
              moves.push({ from: { r, c }, to: { r: r + 2 * dir, c } })
            }
          }
          for (const dc of [-1, 1]) {
            const nc = c + dc, nr = r + dir
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr][nc] && b[nr][nc]?.color !== color) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc } })
            }
            if (enPassant && enPassant.r === nr && enPassant.c === nc) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc } })
            }
          }
          break
        }
        case 'n':
          for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
            const nr = r + dr, nc = c + dc
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) addMove({ r: nr, c: nc })
          }
          break
        case 'b':
          for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
            let nr = r + dr, nc = c + dc
            while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
              addMove({ r: nr, c: nc })
              if (b[nr][nc]) break
              nr += dr; nc += dc
            }
          }
          break
        case 'r':
          for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            let nr = r + dr, nc = c + dc
            while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
              addMove({ r: nr, c: nc })
              if (b[nr][nc]) break
              nr += dr; nc += dc
            }
          }
          break
        case 'q':
          for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
            let nr = r + dr, nc = c + dc
            while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
              addMove({ r: nr, c: nc })
              if (b[nr][nc]) break
              nr += dr; nc += dc
            }
          }
          break
        case 'k':
          for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
            const nr = r + dr, nc = c + dc
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) addMove({ r: nr, c: nc })
          }
          if (color === 'white' && r === 7 && c === 4) {
            if (castling.whiteKingside && !b[7][5] && !b[7][6] && b[7][7]?.type === 'r' &&
                !isSquareAttacked(b, { r: 7, c: 4 }, 'black') && !isSquareAttacked(b, { r: 7, c: 5 }, 'black') && !isSquareAttacked(b, { r: 7, c: 6 }, 'black')) {
              moves.push({ from: { r: 7, c: 4 }, to: { r: 7, c: 6 } })
            }
            if (castling.whiteQueenside && !b[7][3] && !b[7][2] && !b[7][1] && b[7][0]?.type === 'r' &&
                !isSquareAttacked(b, { r: 7, c: 4 }, 'black') && !isSquareAttacked(b, { r: 7, c: 3 }, 'black') && !isSquareAttacked(b, { r: 7, c: 2 }, 'black')) {
              moves.push({ from: { r: 7, c: 4 }, to: { r: 7, c: 2 } })
            }
          }
          if (color === 'black' && r === 0 && c === 4) {
            if (castling.blackKingside && !b[0][5] && !b[0][6] && b[0][7]?.type === 'r' &&
                !isSquareAttacked(b, { r: 0, c: 4 }, 'white') && !isSquareAttacked(b, { r: 0, c: 5 }, 'white') && !isSquareAttacked(b, { r: 0, c: 6 }, 'white')) {
              moves.push({ from: { r: 0, c: 4 }, to: { r: 0, c: 6 } })
            }
            if (castling.blackQueenside && !b[0][3] && !b[0][2] && !b[0][1] && b[0][0]?.type === 'r' &&
                !isSquareAttacked(b, { r: 0, c: 4 }, 'white') && !isSquareAttacked(b, { r: 0, c: 3 }, 'white') && !isSquareAttacked(b, { r: 0, c: 2 }, 'white')) {
              moves.push({ from: { r: 0, c: 4 }, to: { r: 0, c: 2 } })
            }
          }
          break
      }
    }
  }
  return moves
}

function isSquareAttacked(b: Board, square: Pos, byColor: 'white' | 'black'): boolean {
  const pawnDir = byColor === 'white' ? -1 : 1
  for (const dc of [-1, 1]) {
    const r = square.r - pawnDir
    const c = square.c - dc
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r][c]?.type === 'p' && b[r][c]?.color === byColor) return true
  }

  for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
    const r = square.r + dr, c = square.c + dc
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r][c]?.type === 'n' && b[r][c]?.color === byColor) return true
  }

  for (const [dr, dc, pieces] of [
    [-1, 0, ['r', 'q']], [1, 0, ['r', 'q']], [0, -1, ['r', 'q']], [0, 1, ['r', 'q']],
    [-1, -1, ['b', 'q']], [-1, 1, ['b', 'q']], [1, -1, ['b', 'q']], [1, 1, ['b', 'q']],
  ] as [number, number, string[]][]) {
    let r = square.r + dr, c = square.c + dc
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const p = b[r][c]
      if (p) {
        if (p.color === byColor && pieces.includes(p.type)) return true
        break
      }
      r += dr
      c += dc
    }
  }

  for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
    const r = square.r + dr, c = square.c + dc
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r][c]?.type === 'k' && b[r][c]?.color === byColor) return true
  }

  return false
}

function isInCheck(b: Board, color: 'white' | 'black'): boolean {
  let kingPos: Pos | null = null
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (b[r][c]?.type === 'k' && b[r][c]?.color === color) {
        kingPos = { r, c }
      }
    }
  }
  if (!kingPos) return false
  const opp = color === 'white' ? 'black' : 'white'
  return isSquareAttacked(b, kingPos, opp)
}

function makeMove(b: Board, move: Move, castling: any, enPassant: Pos | null): { board: Board; captured: Piece | null; newCastling: any; newEnPassant: Pos | null; isEnPassant: boolean } {
  const nb = cloneBoard(b)
  const piece = nb[move.from.r][move.from.c]
  const captured = nb[move.to.r][move.to.c]
  nb[move.to.r][move.to.c] = piece
  nb[move.from.r][move.from.c] = null

  let isEnPassant = false
  if (piece?.type === 'p' && enPassant && move.to.r === enPassant.r && move.to.c === enPassant.c) {
    const captureRow = piece.color === 'white' ? move.to.r + 1 : move.to.r - 1
    nb[captureRow][move.to.c] = null
    isEnPassant = true
  }

  if (piece?.type === 'k' && Math.abs(move.to.c - move.from.c) === 2) {
    if (move.to.c === 6) {
      nb[move.from.r][5] = nb[move.from.r][7]
      nb[move.from.r][7] = null
    } else if (move.to.c === 2) {
      nb[move.from.r][3] = nb[move.from.r][0]
      nb[move.from.r][0] = null
    }
  }

  const newCastling = { ...castling }
  if (piece?.type === 'k') {
    if (piece.color === 'white') { newCastling.whiteKingside = false; newCastling.whiteQueenside = false }
    else { newCastling.blackKingside = false; newCastling.blackQueenside = false }
  }
  if (piece?.type === 'r') {
    if (move.from.r === 7 && move.from.c === 7) newCastling.whiteKingside = false
    if (move.from.r === 7 && move.from.c === 0) newCastling.whiteQueenside = false
    if (move.from.r === 0 && move.from.c === 7) newCastling.blackKingside = false
    if (move.from.r === 0 && move.from.c === 0) newCastling.blackQueenside = false
  }

  let newEnPassant: Pos | null = null
  if (piece?.type === 'p' && Math.abs(move.to.r - move.from.r) === 2) {
    newEnPassant = { r: (move.from.r + move.to.r) / 2, c: move.from.c }
  }

  if (piece?.type === 'p' && (move.to.r === 0 || move.to.r === 7)) {
    nb[move.to.r][move.to.c] = { type: 'q', color: piece.color }
  }

  return { board: nb, captured, newCastling, newEnPassant, isEnPassant }
}

function getLegalMoves(b: Board, color: 'white' | 'black', castling: any, enPassant: Pos | null): Move[] {
  return getValidMoves(b, color, castling, enPassant).filter(move => {
    const { board: nb } = makeMove(b, move, castling, enPassant)
    return !isInCheck(nb, color)
  })
}

function evaluateBoard(b: Board): number {
  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c]
      if (!p) continue
      const sign = p.color === 'white' ? 1 : -1
      let pieceScore = PIECE_VALUES[p.type]
      const rr = p.color === 'white' ? r : 7 - r
      switch (p.type) {
        case 'p': pieceScore += PAWN_TABLE[rr][c]; break
        case 'n': pieceScore += KNIGHT_TABLE[rr][c]; break
        case 'b': pieceScore += BISHOP_TABLE[rr][c]; break
        case 'r': pieceScore += ROOK_TABLE[rr][c]; break
        case 'q': pieceScore += QUEEN_TABLE[rr][c]; break
        case 'k': pieceScore += KING_TABLE[rr][c]; break
      }
      score += sign * pieceScore
    }
  }
  return score
}

function minimax(b: Board, depth: number, alpha: number, beta: number, maximizing: boolean, aiColor: 'white' | 'black', castling: any, enPassant: Pos | null): number {
  if (depth === 0) return evaluateBoard(b)

  const moves = getLegalMoves(b, maximizing ? aiColor : (aiColor === 'white' ? 'black' : 'white'), castling, enPassant)
  if (moves.length === 0) {
    const color = maximizing ? aiColor : (aiColor === 'white' ? 'black' : 'white')
    return isInCheck(b, color) ? (maximizing ? -50000 : 50000) : 0
  }

  if (maximizing) {
    let best = -Infinity
    for (const move of moves) {
      const { board: nb, newCastling, newEnPassant } = makeMove(b, move, castling, enPassant)
      const score = minimax(nb, depth - 1, alpha, beta, false, aiColor, newCastling, newEnPassant)
      if (score > best) best = score
      if (score > alpha) alpha = score
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const move of moves) {
      const { board: nb, newCastling, newEnPassant } = makeMove(b, move, castling, enPassant)
      const score = minimax(nb, depth - 1, alpha, beta, true, aiColor, newCastling, newEnPassant)
      if (score < best) best = score
      if (score < beta) beta = score
      if (beta <= alpha) break
    }
    return best
  }
}

export default function ChessInternationalPage() {
  const [board, setBoard] = useState<Board>(() => INITIAL_BOARD.map(row => [...row]))
  const [selected, setSelected] = useState<Pos | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white')
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<'white' | 'black' | null>(null)
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')
  const [thinking, setThinking] = useState(false)
  const [castlingRights, setCastlingRights] = useState({
    whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true
  })
  const [enPassantTarget, setEnPassantTarget] = useState<Pos | null>(null)
  const [validMoves, setValidMoves] = useState<Pos[]>([])

  const boardRef = useRef(board)
  const castlingRightsRef = useRef(castlingRights)
  const enPassantTargetRef = useRef(enPassantTarget)
  useEffect(() => { boardRef.current = board }, [board])
  useEffect(() => { castlingRightsRef.current = castlingRights }, [castlingRights])
  useEffect(() => { enPassantTargetRef.current = enPassantTarget }, [enPassantTarget])

  const aiMove = useCallback(() => {
    setThinking(true)
    setTimeout(() => {
      const currentBoard = boardRef.current
      const depth = AI_DEPTH[difficulty]
      const aiColor = playerColor === 'white' ? 'black' : 'white'
      const humanColor = playerColor
      const currentCastling = castlingRightsRef.current
      const currentEnPassant = enPassantTargetRef.current

      const filteredHumanMoves = getLegalMoves(currentBoard, humanColor, currentCastling, currentEnPassant)

      if (filteredHumanMoves.length === 0) {
        setGameOver(true)
        setWinner(aiColor)
        setThinking(false)
        return
      }

      const filteredAiMoves = getLegalMoves(currentBoard, aiColor, currentCastling, currentEnPassant)

      if (filteredAiMoves.length === 0) {
        setGameOver(true)
        setWinner(humanColor)
        setThinking(false)
        return
      }

      let bestScore = aiColor === 'white' ? -Infinity : Infinity
      let bestMove = filteredAiMoves[0]

      for (const move of filteredAiMoves) {
        const { board: nb, newCastling, newEnPassant } = makeMove(currentBoard, move, currentCastling, currentEnPassant)
        const score = minimax(nb, depth - 1, -Infinity, Infinity, false, aiColor, newCastling, newEnPassant)
        if (aiColor === 'white' ? score > bestScore : score < bestScore) {
          bestScore = score
          bestMove = move
        }
      }

      const { board: nb, captured, newCastling, newEnPassant } = makeMove(currentBoard, bestMove, currentCastling, currentEnPassant)

      if (captured?.type === 'k') {
        setBoard(nb)
        boardRef.current = nb
        setGameOver(true)
        setWinner(aiColor)
        setThinking(false)
        return
      }

      setBoard(nb)
      boardRef.current = nb
      setCastlingRights(newCastling)
      castlingRightsRef.current = newCastling
      setEnPassantTarget(newEnPassant)
      enPassantTargetRef.current = newEnPassant
      setMoves(m => m + 1)
      setCurrentPlayer(humanColor)
      setThinking(false)
    }, 500)
  }, [difficulty, playerColor])

  const handleClick = (r: number, c: number) => {
    if (gameOver || thinking) return
    if (gameMode === 'ai' && currentPlayer !== playerColor) return

    if (selected) {
      if (selected.r === r && selected.c === c) {
        setSelected(null)
        setValidMoves([])
        return
      }

      const isValid = validMoves.some(m => m.r === r && m.c === c)
      if (isValid) {
        const move: Move = { from: selected, to: { r, c } }
        const { board: nb, captured, newCastling, newEnPassant } = makeMove(board, move, castlingRights, enPassantTarget)

        if (captured?.type === 'k') {
          setBoard(nb)
          boardRef.current = nb
          setGameOver(true)
          setWinner(currentPlayer)
          setSelected(null)
          setValidMoves([])
          return
        }

        setBoard(nb)
        boardRef.current = nb
        setCastlingRights(newCastling)
        castlingRightsRef.current = newCastling
        setEnPassantTarget(newEnPassant)
        enPassantTargetRef.current = newEnPassant
        setMoves(m => m + 1)
        setSelected(null)
        setValidMoves([])

        const next = currentPlayer === 'white' ? 'black' : 'white'
        setCurrentPlayer(next)

        if (gameMode === 'ai' && !gameOver) aiMove()
        return
      }

      const piece = board[r][c]
      if (piece && piece.color === currentPlayer) {
        setSelected({ r, c })
        const filteredMoves = getLegalMoves(board, currentPlayer, castlingRights, enPassantTarget).filter(m => m.from.r === r && m.from.c === c)
        setValidMoves(filteredMoves.map(m => m.to))
      } else {
        setSelected(null)
        setValidMoves([])
      }
    } else {
      const piece = board[r][c]
      if (piece && piece.color === currentPlayer) {
        setSelected({ r, c })
        const filteredMoves = getLegalMoves(board, currentPlayer, castlingRights, enPassantTarget).filter(m => m.from.r === r && m.from.c === c)
        setValidMoves(filteredMoves.map(m => m.to))
      }
    }
  }

  const resetGame = () => {
    const initial = INITIAL_BOARD.map(row => [...row])
    setBoard(initial)
    boardRef.current = initial
    setSelected(null)
    setCurrentPlayer('white')
    setMoves(0)
    setGameOver(false)
    setWinner(null)
    setCastlingRights({ whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true })
    castlingRightsRef.current = { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true }
    setEnPassantTarget(null)
    enPassantTargetRef.current = null
    setValidMoves([])
    setThinking(false)
  }

  const switchMode = (mode: 'pvp' | 'ai') => {
    setGameMode(mode)
    resetGame()
  }

  const switchSide = () => {
    const newColor = playerColor === 'white' ? 'black' : 'white'
    setPlayerColor(newColor)
    resetGame()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">国际象棋</h1>
              <span className="px-2 py-1 text-xs rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6]">
                {gameMode === 'ai' ? 'AI对战' : '双人对弈'}
              </span>
            </div>
            <p className="text-[#94A3B8]">经典策略游戏，白方先手</p>
          </div>

          {/* Game Mode & Difficulty */}
          <div className="glass-card p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-2 flex-1">
                <button
                  onClick={() => switchMode('ai')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${gameMode === 'ai' ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/30' : 'bg-[#111827] text-[#94A3B8] hover:bg-[#1F2937]'}`}
                >
                  <Bot className="w-4 h-4" />AI对战
                </button>
                <button
                  onClick={() => switchMode('pvp')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${gameMode === 'pvp' ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/30' : 'bg-[#111827] text-[#94A3B8] hover:bg-[#1F2937]'}`}
                >
                  <User className="w-4 h-4" />双人对战
                </button>
              </div>
              {gameMode === 'ai' && (
                <div className="flex items-center gap-2">
                  <span className="text-[#94A3B8] text-xs">难度:</span>
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${difficulty === d ? 'bg-[#06B6D4] text-white' : 'bg-[#111827] text-[#94A3B8] hover:bg-[#1F2937]'}`}
                    >
                      {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Game Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full ${currentPlayer === 'white' ? 'bg-white' : 'bg-black'} ring-2 ring-offset-2 ring-offset-[#080B14] ${currentPlayer === 'white' ? 'ring-white' : 'ring-gray-500'}`} />
              <span className="text-white font-medium">
                {gameOver ? (
                  <span className={winner === 'white' ? 'text-[#10B981]' : 'text-[#EF4444]'}>{winner === 'white' ? '白方获胜！' : '黑方获胜！'}</span>
                ) : thinking ? (
                  <span className="text-[#06B6D4]">AI思考中...</span>
                ) : (
                  `${currentPlayer === 'white' ? '白方' : '黑方'}走棋`
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#94A3B8] text-sm">步数: {moves}</span>
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-all text-sm font-medium flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />重新开始
              </button>
            </div>
          </div>

          {/* Board */}
          <div className="glass-card p-4">
            <div
              className="grid gap-0 mx-auto shadow-xl rounded-lg overflow-hidden"
              style={{ gridTemplateColumns: `repeat(8, 1fr)`, maxWidth: '480px' }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selected?.r === r && selected?.c === c
                  const isLight = (r + c) % 2 === 0
                  const isValid = validMoves.some(m => m.r === r && m.c === c)

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleClick(r, c)}
                      className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl transition-all relative ${
                        isSelected ? 'z-10' : ''
                      }`}
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                          : isLight
                            ? 'linear-gradient(135deg, #E8D5B7 0%, #D4B896 100%)'
                            : 'linear-gradient(135deg, #8B6914 0%, #724A10 100%)',
                        boxShadow: isSelected ? '0 0 0 3px #F59E0B, 0 4px 12px rgba(0,0,0,0.3)' : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                      }}
                    >
                      {isValid && !cell && (
                        <div className="w-4 h-4 rounded-full bg-black/30" />
                      )}
                      {isValid && cell && (
                        <div className="absolute inset-0 rounded-sm ring-2 ring-orange-500 ring-inset" />
                      )}
                      {cell && (
                        <span
                          className="filter drop-shadow-lg"
                          style={{
                            color: cell.color === 'white' ? '#FFFFFF' : '#1a1a1a',
                            textShadow: cell.color === 'white'
                              ? '0 1px 2px rgba(0,0,0,0.5)'
                              : '0 1px 2px rgba(255,255,255,0.2)',
                            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
                          }}
                        >
                          {PIECE_SYMBOLS[cell.type]?.[cell.color]}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-sm shadow">♔</div>
              <span className="text-[#94A3B8]">白方{playerColor === 'white' && gameMode === 'ai' ? '(你)' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-sm shadow">♚</div>
              <span className="text-[#94A3B8]">黑方{playerColor === 'black' && gameMode === 'ai' ? '(你)' : ''}</span>
            </div>
          </div>

          {/* Game Over */}
          {gameOver && (
            <div className="mt-6 glass-card p-8 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-[#F59E0B]" />
              <h2 className="text-3xl font-bold text-white mb-2">
                {winner === 'white' ? '白方获胜！' : '黑方获胜！'}
              </h2>
              <p className="text-[#94A3B8] mb-6">共用 {moves} 步</p>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-[#8B5CF6] text-white rounded-xl font-medium hover:bg-[#7C3AED] flex items-center gap-2 mx-auto transition-all"
              >
                <RotateCcw className="w-5 h-5" />再来一局
              </button>
            </div>
          )}

          {/* Rules */}
          <div className="mt-6 p-4 glass-card">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#8B5CF6] font-medium">规则：</span>
              {gameMode === 'ai' ? `你执${playerColor === 'white' ? '白方(先行)' : '黑方(后行)'}。` : '白方先手。'}
              消灭对方国王获胜。兵只能前进（白向上，黑向下），吃子斜走。兵到达对方底线自动升变为后。车横竖走，马走日，象斜走，后横竖斜走，王一步一格。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
