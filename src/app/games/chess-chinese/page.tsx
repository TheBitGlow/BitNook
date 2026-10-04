'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Castle, RotateCcw, FlipVertical, Undo2, Trophy, Bot, User } from 'lucide-react'

// ============ 常量定义 ============
const ROWS = 10
const COLS = 9
const CELL = 54
const BOARD_W = COLS * CELL
const BOARD_H = ROWS * CELL

type Piece = string | null
type Board = Piece[][]
type Pos = { r: number; c: number } | null

// 棋子显示字符 - 传统书法风格
const PIECE_CHAR: Record<string, string> = {
  r: '車', n: '馬', b: '相', a: '仕', k: '將', c: '炮', p: '卒',
  R: '車', N: '馬', B: '相', A: '仕', K: '帥', C: '炮', P: '兵'
}

// 初始棋盘
const INIT_BOARD: Board = [
  ['r', 'n', 'b', 'a', 'k', 'a', 'b', 'n', 'r'],
  [null, null, null, null, null, null, null, null, null],
  [null, 'c', null, null, null, null, null, 'c', null],
  ['p', null, 'p', null, 'p', null, 'p', null, 'p'],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  ['P', null, 'P', null, 'P', null, 'P', null, 'P'],
  [null, 'C', null, null, null, null, null, 'C', null],
  [null, null, null, null, null, null, null, null, null],
  ['R', 'N', 'B', 'A', 'K', 'A', 'B', 'N', 'R'],
]

// 棋子价值
const PIECE_VAL: Record<string, number> = {
  k: 10000, r: 1000, n: 450, c: 450, b: 200, a: 200, p: 100,
}

// ============ 辅助函数 ============
function isRed(p: Piece): boolean {
  return Boolean(p && p === p.toUpperCase())
}

function isInPalace(r: number, c: number, red: boolean): boolean {
  if (c < 3 || c > 5) return false
  // 棋盘行号从上到下：黑方九宫在 0-2 行，红方九宫在 7-9 行。
  if (red) return r >= 7 && r <= 9
  return r >= 0 && r <= 2
}

function isInTerritory(r: number, red: boolean): boolean {
  // 相/象不能过河：红方守下半盘，黑方守上半盘。
  if (red) return r >= 5
  return r <= 4
}

function cloneBoard(b: Board): Board {
  return b.map(row => [...row])
}

function findKing(b: Board, red: boolean): Pos {
  const target = red ? 'K' : 'k'
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (b[r][c] === target) return { r, c }
    }
  }
  return null
}

function kingsFace(b: Board): boolean {
  const redKing = findKing(b, true)
  const blackKing = findKing(b, false)
  if (!redKing || !blackKing || redKing.c !== blackKing.c) return false

  for (let r = blackKing.r + 1; r < redKing.r; r++) {
    if (b[r][blackKing.c]) return false
  }
  return true
}

// ============ 走法生成 ============
function genRawMoves(b: Board, r: number, c: number): Pos[] {
  const p = b[r]?.[c]
  if (!p) return []
  const moves: Pos[] = []
  const red = isRed(p)
  const pt = p.toLowerCase()

  const tryA = (nr: number, nc: number) => {
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      const t = b[nr]?.[nc]
      if (t ? isRed(t) !== red : true) moves.push({ r: nr, c: nc })
    }
  }

  switch (pt) {
    case 'k': {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc
        if (isInPalace(nr, nc, red)) tryA(nr, nc)
      })

      // 将帅同线且中间无子时可以互相攻击，也用于禁止“照面”局面。
      const step = red ? -1 : 1
      let nr = r + step
      while (nr >= 0 && nr < ROWS) {
        const target = b[nr][c]
        if (target) {
          if (target.toLowerCase() === 'k' && isRed(target) !== red) {
            moves.push({ r: nr, c })
          }
          break
        }
        nr += step
      }
      break
    }
    case 'a': {
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc
        if (isInPalace(nr, nc, red)) tryA(nr, nc)
      })
      break
    }
    case 'b': {
      [[2, 2], [2, -2], [-2, 2], [-2, -2]].forEach(([dr, dc]) => {
        const mr = r + dr / 2, mc = c + dc / 2
        const nr = r + dr, nc = c + dc
        if (!b[Math.round(mr)]?.[Math.round(mc)] && nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && isInTerritory(nr, red)) tryA(nr, nc)
      })
      break
    }
    case 'n': {
      [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc
        // 马腿：蹩马腿位置（L形的拐角）
        // 马走L形两步一直一曲，腿在拐角处
        const legR = Math.abs(dr) === 2 ? r + Math.sign(dr) : r
        const legC = Math.abs(dr) === 2 ? c : c + Math.sign(dc)
        if (!b[legR]?.[legC] && nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) tryA(nr, nc)
      })
      break
    }
    case 'r': {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          tryA(nr, nc)
          if (b[nr]?.[nc]) break
          nr += dr; nc += dc
        }
      })
      break
    }
    case 'c': {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc, j = false
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          if (b[nr]?.[nc]) {
            if (j) { tryA(nr, nc); break }
            j = true
          } else if (!j) tryA(nr, nc)
          nr += dr; nc += dc
        }
      })
      break
    }
    case 'p': {
      // 兵/卒：红兵向上(fr=-1)，黑卒向下(fr=+1)
      const fr = red ? -1 : 1
      tryA(r + fr, c)
      // 越过楚河后可以左右移动
      if ((red && r <= 4) || (!red && r >= 5)) {
        tryA(r, c - 1)
        tryA(r, c + 1)
      }
      break
    }
  }
  return moves
}

function kingInCheck(b: Board, red: boolean): boolean {
  const kp = findKing(b, red)
  if (!kp) return false
  if (kingsFace(b)) return true

  const opp = red ? 'black' : 'red'
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r]?.[c]
      if (p && isRed(p) === (opp === 'red')) {
        const ms = genRawMoves(b, r, c)
        if (ms.some(m => m && m.r === kp.r && m.c === kp.c)) return true
      }
    }
  }
  return false
}

function genMoves(board: Board, red: boolean): { from: Pos; to: Pos }[] {
  const moves: { from: Pos; to: Pos }[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r]?.[c]
      if (!p || isRed(p) !== red) continue
      const from = { r, c }
      const rawMoves = genRawMoves(board, r, c)
      rawMoves.forEach(to => {
        if (!to) return
        const nb = cloneBoard(board)
        const pc = nb[from.r][from.c]
        nb[to.r][to.c] = pc
        nb[from.r][from.c] = null
        if (!kingInCheck(nb, red)) {
          moves.push({ from, to })
        }
      })
    }
  }
  return moves
}

// ============ AI 相关 ============
const AI_DEPTH: Record<string, number> = { easy: 1, medium: 2, hard: 3 }
const MATE_SCORE = 2000000

const ROOK_BONUS = [
  [14, 14, 12, 18, 16, 18, 12, 14, 14],
  [16, 20, 18, 24, 26, 24, 18, 20, 16],
  [12, 14, 12, 16, 18, 16, 12, 14, 12],
  [12, 16, 14, 18, 20, 18, 14, 16, 12],
  [12, 14, 12, 16, 18, 16, 12, 14, 12],
  [12, 14, 12, 16, 18, 16, 12, 14, 12],
  [12, 16, 14, 18, 20, 18, 14, 16, 12],
  [16, 14, 12, 16, 18, 16, 12, 14, 16],
  [16, 20, 16, 22, 22, 22, 16, 20, 16],
  [14, 16, 14, 18, 20, 18, 14, 16, 14],
]

const KNIGHT_BONUS = [
  [10, 12, 14, 12, 10, 12, 14, 12, 10],
  [12, 14, 16, 18, 16, 18, 16, 14, 12],
  [8, 16, 12, 18, 20, 18, 12, 16, 8],
  [10, 14, 16, 20, 22, 20, 16, 14, 10],
  [8, 12, 14, 18, 20, 18, 14, 12, 8],
  [8, 14, 12, 16, 18, 16, 12, 14, 8],
  [10, 12, 10, 14, 16, 14, 10, 12, 10],
  [10, 14, 10, 12, 14, 12, 10, 14, 10],
  [10, 12, 8, 10, 12, 10, 8, 12, 10],
  [6, 8, 6, 8, 8, 8, 6, 8, 6],
]

const CANNON_BONUS = [
  [6, 4, 6, 8, 10, 8, 6, 4, 6],
  [4, 2, 4, 6, 8, 6, 4, 2, 4],
  [4, 2, 4, 6, 10, 6, 4, 2, 4],
  [6, 4, 6, 8, 10, 8, 6, 4, 6],
  [6, 6, 8, 10, 12, 10, 8, 6, 6],
  [6, 6, 8, 10, 12, 10, 8, 6, 6],
  [6, 4, 6, 8, 10, 8, 6, 4, 6],
  [4, 2, 4, 6, 10, 6, 4, 2, 4],
  [4, 2, 4, 6, 8, 6, 4, 2, 4],
  [6, 4, 6, 8, 10, 8, 6, 4, 6],
]

const PAWN_BONUS = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [10, 20, 30, 45, 55, 45, 30, 20, 10],
  [20, 40, 50, 65, 75, 65, 50, 40, 20],
  [30, 50, 65, 80, 90, 80, 65, 50, 30],
  [30, 50, 65, 80, 90, 80, 65, 50, 30],
  [20, 40, 50, 65, 75, 65, 50, 40, 20],
  [10, 20, 30, 45, 55, 45, 30, 20, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
]

function evaluate(b: Board): number {
  let s = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r]?.[c]
      if (p) {
        const v = PIECE_VAL[p.toLowerCase()] || 0
        const red = isRed(p)
        const rr = red ? r : 9 - r
        const cc = red ? c : 8 - c
        let bonus = 0
        switch (p.toLowerCase()) {
          case 'r': bonus = ROOK_BONUS[rr][cc]; break
          case 'n': bonus = KNIGHT_BONUS[rr][cc]; break
          case 'c': bonus = CANNON_BONUS[rr][cc]; break
          case 'p': bonus = PAWN_BONUS[rr][cc]; break
          case 'k': bonus = red ? 500 : -500; break
        }
        s += red ? v + bonus : -(v + bonus)
      }
    }
  }
  return s
}

function applyBoardMove(b: Board, mv: { from: Pos; to: Pos }): Board {
  const nb = cloneBoard(b)
  if (!mv.from || !mv.to) return nb
  const pc = nb[mv.from.r][mv.from.c]
  nb[mv.to.r][mv.to.c] = pc
  nb[mv.from.r][mv.from.c] = null
  return nb
}

function moveHeuristic(b: Board, mv: { from: Pos; to: Pos }, redToMove: boolean): number {
  if (!mv.from || !mv.to) return 0
  const piece = b[mv.from.r][mv.from.c]
  const captured = b[mv.to.r][mv.to.c]
  let score = 0

  if (captured) {
    score += (PIECE_VAL[captured.toLowerCase()] || 0) * 12
    score -= (PIECE_VAL[piece?.toLowerCase() || ''] || 0)
  }

  const nb = applyBoardMove(b, mv)
  if (kingInCheck(nb, !redToMove)) score += 650

  if (piece?.toLowerCase() === 'p') {
    score += redToMove ? Math.max(0, 6 - mv.to.r) * 16 : Math.max(0, mv.to.r - 3) * 16
  }

  score += 8 - Math.abs(4 - mv.to.c)
  return score
}

function orderedMoves(b: Board, moves: { from: Pos; to: Pos }[], redToMove: boolean) {
  return [...moves].sort((a, bMove) => moveHeuristic(b, bMove, redToMove) - moveHeuristic(b, a, redToMove))
}

function minimax(b: Board, depth: number, redToMove: boolean, alpha: number, beta: number, ply = 0): number {
  const moves = genMoves(b, redToMove)
  if (moves.length === 0) {
    if (!kingInCheck(b, redToMove)) return 0
    return redToMove ? -MATE_SCORE + ply : MATE_SCORE - ply
  }

  if (depth === 0) {
    const mobility = genMoves(b, true).length - genMoves(b, false).length
    return evaluate(b) + mobility * 4
  }

  const sortedMoves = orderedMoves(b, moves, redToMove)

  if (redToMove) {
    let best = -Infinity
    for (const mv of sortedMoves) {
      const sc = minimax(applyBoardMove(b, mv), depth - 1, false, alpha, beta, ply + 1)
      if (sc > best) best = sc
      if (sc > alpha) alpha = sc
      if (beta <= alpha) break
    }
    return best
  }

  let best = Infinity
  for (const mv of sortedMoves) {
    const sc = minimax(applyBoardMove(b, mv), depth - 1, true, alpha, beta, ply + 1)
    if (sc < best) best = sc
    if (sc < beta) beta = sc
    if (beta <= alpha) break
  }
  return best
}

// ============ 类型 ============
type GameMode = 'pvp' | 'ai'
type Difficulty = 'easy' | 'medium' | 'hard'
type MoveEntry = { from: Pos; to: Pos; piece: Piece }

// ============ 组件 ============
export default function ChessChinesePage() {
  const [board, setBoard] = useState<Board>(() => INIT_BOARD.map(r => [...r]))
  const [selected, setSelected] = useState<Pos>(null)
  const [curPlayer, setCurPlayer] = useState<'red' | 'black'>('red')
  const [gameMode, setGameMode] = useState<GameMode>('pvp')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [playerColor] = useState<'red' | 'black'>('red')
  const [thinking, setThinking] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<'red' | 'black' | null>(null)
  const [lastMove, setLastMove] = useState<{ from: Pos; to: Pos } | null>(null)
  const [validMoves, setValidMoves] = useState<Pos[]>([])
  const [history, setHistory] = useState<MoveEntry[]>([])
  const [capR, setCapR] = useState<Piece[]>([])
  const [capB, setCapB] = useState<Piece[]>([])
  const [flipped, setFlipped] = useState(false)
  const [check, setCheck] = useState(false)

  // AI 走棋
  const aiMove = useCallback((b: Board, aiRed: boolean) => {
    setThinking(true)
    setTimeout(() => {
      const depth = AI_DEPTH[difficulty]
      const moves = orderedMoves(b, genMoves(b, aiRed), aiRed)

      // 无子力移动 = 检查是否被将死
      if (moves.length === 0) {
        const inCheck = kingInCheck(b, aiRed)
        if (inCheck) {
          // 被将死，对方获胜
          setGameOver(true)
          setWinner(aiRed ? 'black' : 'red')
        } else {
          // 无子可动（逼和），判和
          setGameOver(true)
          setWinner(null)
        }
        setThinking(false)
        return
      }

      // 用红方优势分做 alpha-beta 搜索：红方取最大，黑方取最小。
      let best = aiRed ? -Infinity : Infinity
      let bestMv = moves[0]

      moves.forEach(mv => {
        if (!mv.from || !mv.to) return
        const nb = applyBoardMove(b, mv)
        const sc = minimax(nb, depth - 1, !aiRed, -Infinity, Infinity, 1)
        if (aiRed ? sc > best : sc < best) {
          best = sc
          bestMv = mv
        }
      })

      if (!bestMv || !bestMv.from || !bestMv.to) {
        setThinking(false)
        return
      }

      const { from, to } = bestMv
      const nb = cloneBoard(b)
      const pc = nb[from.r][from.c]
      const cap = nb[to.r][to.c]
      nb[to.r][to.c] = pc
      nb[from.r][from.c] = null

      if (cap) {
        aiRed ? setCapR(p => [...p, cap]) : setCapB(p => [...p, cap])
      }

      if (cap?.toLowerCase() === 'k') {
        setBoard(nb)
        setGameOver(true)
        setWinner(aiRed ? 'red' : 'black')
        setLastMove({ from, to })
        setThinking(false)
        return
      }

      setBoard(nb)
      setLastMove({ from, to })
      setCurPlayer(aiRed ? 'black' : 'red')
      setCheck(kingInCheck(nb, !aiRed))
      setHistory(h => [...h, { from, to, piece: pc }])
      setThinking(false)
    }, 80)
  }, [difficulty])

  // 点击格子
  const onCell = (r: number, c: number) => {
    if (gameOver || thinking) return
    if (gameMode === 'ai' && curPlayer !== playerColor) return

    if (selected) {
      if (selected.r === r && selected.c === c) {
        setSelected(null)
        setValidMoves([])
        return
      }
      const isValid = validMoves.some(m => m && m.r === r && m.c === c)
      if (isValid) {
        const nb = cloneBoard(board)
        const pc = nb[selected.r][selected.c]
        const cap = nb[r][c]
        nb[r][c] = pc
        nb[selected.r][selected.c] = null

        if (cap) {
          curPlayer === 'red' ? setCapR(p => [...p, cap]) : setCapB(p => [...p, cap])
        }

        if (cap?.toLowerCase() === 'k') {
          setBoard(nb)
          setGameOver(true)
          setWinner(curPlayer)
          setLastMove({ from: selected, to: { r, c } })
          setSelected(null)
          setValidMoves([])
          return
        }

        setBoard(nb)
        setLastMove({ from: selected, to: { r, c } })
        setHistory(h => [...h, { from: selected, to: { r, c }, piece: pc }])
        const next = curPlayer === 'red' ? 'black' : 'red'
        setCurPlayer(next)
        setCheck(kingInCheck(nb, next === 'red'))
        setSelected(null)
        setValidMoves([])
        if (gameMode === 'ai' && !gameOver) aiMove(nb, next === 'red')
      } else {
        const piece = board[r][c]
        if (piece && isRed(piece) === (curPlayer === 'red')) {
          setSelected({ r, c })
          setValidMoves(genRawMoves(board, r, c).filter(m => {
            if (!m) return false
            const nb = cloneBoard(board)
            nb[m.r][m.c] = piece
            nb[r][c] = null
            return !kingInCheck(nb, curPlayer === 'red')
          }))
        } else {
          setSelected(null)
          setValidMoves([])
        }
      }
    } else {
      const piece = board[r][c]
      if (piece && isRed(piece) === (curPlayer === 'red')) {
        setSelected({ r, c })
        setValidMoves(genRawMoves(board, r, c).filter(m => {
          if (!m) return false
          const nb = cloneBoard(board)
          nb[m.r][m.c] = piece
          nb[r][c] = null
          return !kingInCheck(nb, curPlayer === 'red')
        }))
      }
    }
  }

  const reset = () => {
    setBoard(INIT_BOARD.map(r => [...r]))
    setSelected(null)
    setCurPlayer('red')
    setGameOver(false)
    setWinner(null)
    setLastMove(null)
    setValidMoves([])
    setHistory([])
    setCapR([])
    setCapB([])
    setCheck(false)
  }

  const undo = () => {
    if (!history.length || thinking) return
    reset()
    if (history.length > 1) {
      const ents = history.slice(0, -2)
      let b = INIT_BOARD.map(r => [...r])
      ents.forEach(e => {
        if (e.from && e.to) {
          const p = b[e.from.r][e.from.c]
          b[e.to.r][e.to.c] = p
          b[e.from.r][e.from.c] = null
        }
      })
      setBoard(b)
      setCurPlayer(ents.length % 2 === 0 ? 'black' : 'red')
      setHistory(ents)
    }
  }

  // 翻转处理
  const getDisp = (r: number, c: number) => flipped ? { r: 9 - r, c: 8 - c } : { r, c }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-4 py-6 bg-[radial-gradient(circle_at_50%_0%,rgba(236,72,153,0.12),transparent_32%),radial-gradient(circle_at_15%_35%,rgba(245,158,11,0.08),transparent_26%)]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EC4899]/20 flex items-center justify-center">
                <Castle className="w-5 h-5 text-[#EC4899]" />
              </div>
              <h1 className="text-2xl font-bold text-white">中国象棋</h1>
              <span className="px-2 py-1 text-xs rounded-full bg-[#EC4899]/20 text-[#EC4899]">AI对战</span>
            </div>
            <p className="text-[#94A3B8]">经典策略游戏 · 红方先手</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
            {/* 左侧面板 */}
            <div className="lg:w-56 space-y-3">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${curPlayer === 'red' ? 'bg-[#EF4444]' : 'bg-[#1a1a1a] border-2 border-gray-500'}`} />
                    <span className="text-white text-sm font-medium">
                      {gameOver ? (winner === 'red' ? '红胜' : winner === 'black' ? '黑胜' : '平局') : `${curPlayer === 'red' ? '红方' : '黑方'}走棋`}
                    </span>
                  </div>
                </div>
                {check && !gameOver && <div className="p-2 bg-[#EF4444]/20 rounded-lg text-center text-[#EF4444] text-sm font-bold animate-pulse">将军！</div>}
                {thinking && <div className="p-2 bg-[#06B6D4]/20 rounded-lg text-center text-[#06B6D4] text-sm">AI思考中...</div>}
              </div>

              <div className="glass-card p-4">
                <h3 className="text-white font-medium mb-3 text-sm">游戏模式</h3>
                <div className="flex gap-2">
                  <button onClick={() => { setGameMode('pvp'); reset() }} className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${gameMode === 'pvp' ? 'bg-[#EC4899] text-white' : 'bg-[#080B14] text-[#94A3B8]'}`}>
                    <User className="w-4 h-4 mx-auto mb-1" />双人
                  </button>
                  <button onClick={() => { setGameMode('ai'); reset() }} className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${gameMode === 'ai' ? 'bg-[#EC4899] text-white' : 'bg-[#080B14] text-[#94A3B8]'}`}>
                    <Bot className="w-4 h-4 mx-auto mb-1" />AI
                  </button>
                </div>
              </div>

              {gameMode === 'ai' && (
                <div className="glass-card p-4">
                  <h3 className="text-white font-medium mb-3 text-sm">AI难度</h3>
                  <div className="flex gap-1">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                      <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${difficulty === d ? 'bg-[#06B6D4] text-white' : 'bg-[#080B14] text-[#94A3B8]'}`}>
                        {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="glass-card p-4">
                <h3 className="text-white font-medium mb-2 text-sm">红方吃子</h3>
                <div className="flex flex-wrap gap-1 min-h-[24px]">
                  {capR.length === 0 && <span className="text-[#475569] text-xs">无</span>}
                  {capR.map((p, i) => <span key={i} className="text-lg text-[#EF4444] font-bold">{PIECE_CHAR[p!]}</span>)}
                </div>
                <h3 className="text-white font-medium mb-2 mt-3 text-sm">黑方吃子</h3>
                <div className="flex flex-wrap gap-1 min-h-[24px]">
                  {capB.length === 0 && <span className="text-[#475569] text-xs">无</span>}
                  {capB.map((p, i) => <span key={i} className="text-lg text-gray-800 font-bold">{PIECE_CHAR[p!]}</span>)}
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={reset} className="py-2 px-2 rounded-lg bg-[#080B14] text-[#94A3B8] hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                    <RotateCcw className="w-3 h-3" />重新开始
                  </button>
                  <button onClick={() => setFlipped(!flipped)} className="py-2 px-2 rounded-lg bg-[#080B14] text-[#94A3B8] hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                    <FlipVertical className="w-3 h-3" />翻转棋盘
                  </button>
                  <button onClick={undo} disabled={history.length === 0 || thinking} className="col-span-2 py-2 px-2 rounded-lg bg-[#080B14] text-[#94A3B8] hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-40">
                    <Undo2 className="w-3 h-3" />悔棋
                  </button>
                </div>
              </div>
            </div>

            {/* 棋盘 */}
            <div className="relative mx-auto aspect-[9/10] w-full max-w-[540px] rounded-[22px] border-[10px] border-[#4B260F] bg-[#6B3516] p-2 shadow-2xl shadow-black/60">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
                className="block rounded-xl"
                style={{ background: 'radial-gradient(circle at 25% 16%, rgba(255,255,255,0.24), transparent 18%), linear-gradient(145deg, #E8BD68 0%, #D29B43 42%, #B9792E 100%)' }}
              >
                {/* 外框 */}
                <rect x="2" y="2" width={BOARD_W - 4} height={BOARD_H - 4} fill="none" stroke="#5C3D1E" strokeWidth="4" rx="4" />

                {/* 横线 */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => (
                  <line key={`h${r}`} x1={CELL / 2} y1={r * CELL + CELL / 2} x2={BOARD_W - CELL / 2} y2={r * CELL + CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />
                ))}

                {/* 竖线 - 左边第一列 */}
                <line x1={CELL / 2} y1={CELL / 2} x2={CELL / 2} y2={4 * CELL + CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />
                <line x1={CELL / 2} y1={5 * CELL + CELL / 2} x2={CELL / 2} y2={BOARD_H - CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />

                {/* 竖线 - 右边第一列 */}
                <line x1={BOARD_W - CELL / 2} y1={CELL / 2} x2={BOARD_W - CELL / 2} y2={4 * CELL + CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />
                <line x1={BOARD_W - CELL / 2} y1={5 * CELL + CELL / 2} x2={BOARD_W - CELL / 2} y2={BOARD_H - CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />

                {/* 中间竖线 */}
                {[1, 2, 3, 4, 5, 6, 7].map(c => (
                  <g key={`v${c}`}>
                    <line x1={c * CELL + CELL / 2} y1={CELL / 2} x2={c * CELL + CELL / 2} y2={4 * CELL + CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />
                    <line x1={c * CELL + CELL / 2} y1={5 * CELL + CELL / 2} x2={c * CELL + CELL / 2} y2={BOARD_H - CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />
                  </g>
                ))}

                {/* 九宫格 - 红方 */}
                <line x1={3 * CELL + CELL / 2} y1={CELL / 2} x2={5 * CELL + CELL / 2} y2={2 * CELL + CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />
                <line x1={5 * CELL + CELL / 2} y1={CELL / 2} x2={3 * CELL + CELL / 2} y2={2 * CELL + CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />

                {/* 九宫格 - 黑方 */}
                <line x1={3 * CELL + CELL / 2} y1={7 * CELL + CELL / 2} x2={5 * CELL + CELL / 2} y2={9 * CELL + CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />
                <line x1={5 * CELL + CELL / 2} y1={7 * CELL + CELL / 2} x2={3 * CELL + CELL / 2} y2={9 * CELL + CELL / 2} stroke="#5C3D1E" strokeWidth="1.5" />

                {/* 楚河汉界 */}
                <text x={BOARD_W / 2} y={4.5 * CELL + CELL / 2} textAnchor="middle" dominantBaseline="middle" fontSize="24" fill="#5C3D1E" fontWeight="bold" fontFamily="serif">楚 河</text>
                <text x={BOARD_W / 2} y={5.5 * CELL + CELL / 2} textAnchor="middle" dominantBaseline="middle" fontSize="24" fill="#5C3D1E" fontWeight="bold" fontFamily="serif">漢 界</text>

                {/* 坐标标注 */}
                {['九', '八', '七', '六', '五', '四', '三', '二', '一'].map((label, i) => (
                  <text key={`r${i}`} x={i * CELL + CELL / 2} y={CELL * 0.3} textAnchor="middle" fontSize="12" fill="#8B7355" fontFamily="serif">{label}</text>
                ))}
                {['１', '２', '３', '４', '５', '６', '７', '８', '９'].map((label, i) => (
                  <text key={`b${i}`} x={i * CELL + CELL / 2} y={BOARD_H - CELL * 0.3} textAnchor="middle" fontSize="12" fill="#8B7355" fontFamily="serif">{label}</text>
                ))}
              </svg>

              {/* 全棋盘点击层：让空交叉点也能落子 */}
              <div className="absolute left-0 top-0 z-10" style={{ width: '100%', height: '100%' }}>
                {board.map((row, r) =>
                  row.map((cell, c) => {
                    const { r: dr, c: dc } = getDisp(r, c)
                    const isValid = validMoves.some(m => m && m.r === r && m.c === c)
                    const isLast = lastMove && lastMove.from && lastMove.to && (
                      (lastMove.from.r === r && lastMove.from.c === c) ||
                      (lastMove.to.r === r && lastMove.to.c === c)
                    )

                    return (
                      <button
                        key={`cell${r}${c}`}
                        onClick={() => onCell(r, c)}
                        className="absolute flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/80"
                        style={{
                          left: `${(dc / COLS) * 100}%`,
                          top: `${(dr / ROWS) * 100}%`,
                          width: `${100 / COLS}%`,
                          height: `${100 / ROWS}%`,
                        }}
                        aria-label={`第${r + 1}行第${c + 1}列`}
                      >
                        {isValid && !cell && <span className="h-4 w-4 rounded-full bg-[#14532D]/85 shadow-[0_0_0_7px_rgba(20,83,45,0.16),0_0_18px_rgba(20,83,45,0.3)]" />}
                        {isLast && !cell && <span className="h-3 w-3 rounded-full bg-[#FACC15]" />}
                      </button>
                    )
                  })
                )}
              </div>

              {/* 棋子层 */}
              <div className="absolute left-0 top-0 z-20 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                {board.map((row, r) =>
                  row.map((cell, c) => {
                    if (!cell) return null
                    const { r: dr, c: dc } = getDisp(r, c)
                    const px = `${(dc / COLS) * 100}%`
                    const py = `${(dr / ROWS) * 100}%`
                    const isSel = selected?.r === r && selected?.c === c
                    const isLast = lastMove && lastMove.from && lastMove.to && (
                      (lastMove.from.r === r && lastMove.from.c === c) ||
                      (lastMove.to.r === r && lastMove.to.c === c)
                    )
                    const isValid = validMoves.some(m => m && m.r === r && m.c === c)
                    const red = isRed(cell)

                    return (
                      <button
                        key={`p${r}${c}`}
                        onClick={() => onCell(r, c)}
                        className="absolute flex items-center justify-center transition-transform pointer-events-auto"
                        style={{ left: px, top: py, width: `${100 / COLS}%`, height: `${100 / ROWS}%`, transform: 'translateY(0)' }}
                      >
                        {isValid && cell && <div className="pointer-events-none absolute inset-[8%] rounded-full border-[3px] border-[#F97316] shadow-[0_0_18px_rgba(249,115,22,0.55)]" />}
                        {cell && (
                          <div
                            className={`flex h-[82%] w-[82%] rounded-full items-center justify-center font-bold text-[clamp(1rem,3.2vw,1.45rem)] transition-transform ${isSel ? 'scale-110 z-10' : 'hover:scale-[1.03]'} ${isLast ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent' : ''}`}
                            style={{
                              background: red
                                ? 'radial-gradient(circle at 35% 25%, #FEE2E2 0%, #DC2626 54%, #7F1D1D 100%)'
                                : 'radial-gradient(circle at 35% 25%, #E5E7EB 0%, #334155 54%, #020617 100%)',
                              color: red ? '#FEF3C7' : '#F9FAFB',
                              boxShadow: red
                                ? 'inset 0 3px 5px rgba(255,255,255,0.35), inset 0 -4px 7px rgba(0,0,0,0.35), 0 7px 14px rgba(0,0,0,0.38), 0 0 0 3px #7F1D1D'
                                : 'inset 0 3px 5px rgba(255,255,255,0.16), inset 0 -4px 7px rgba(0,0,0,0.45), 0 7px 14px rgba(0,0,0,0.45), 0 0 0 3px #0F172A',
                              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                              border: red ? '2px solid #FECACA' : '2px solid #D1D5DB',
                            }}
                          >
                            <span style={{
                              textShadow: red
                                ? '0 1px 3px rgba(0,0,0,0.6), 0 0 20px rgba(253,230,138,0.3)'
                                : '0 1px 3px rgba(0,0,0,0.8)'
                            }}>{PIECE_CHAR[cell]}</span>
                          </div>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* 右侧走棋记录 */}
            <div className="lg:w-56">
              <div className="glass-card p-4 h-full max-h-[600px] overflow-hidden flex flex-col">
                <h3 className="text-white font-medium mb-3 text-sm">走棋记录</h3>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {history.length === 0 ? (
                    <p className="text-[#475569] text-xs">暂无记录</p>
                  ) : (
                    history.map((e, i) => (
                      <div key={i} className={`text-xs py-1 px-2 rounded ${i % 2 === 0 ? 'bg-[#080B14]' : ''}`}>
                        <span className="text-[#475569] mr-1">{Math.floor(i / 2) + 1}.</span>
                        <span className={isRed(e.piece) ? 'text-[#EF4444]' : 'text-gray-400'}>
                          {PIECE_CHAR[e.piece!] || '移'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {gameOver && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="glass-card p-8 text-center max-w-sm mx-4">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-[#F59E0B]" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  {winner === 'red' ? '红方获胜！' : winner === 'black' ? '黑方获胜！' : '平局！'}
                </h2>
                <p className="text-[#94A3B8] mb-6">{winner === null ? '双方无子可动' : '游戏结束'}</p>
                <button onClick={reset} className="px-8 py-3 bg-[#EC4899] text-white rounded-xl font-medium hover:bg-[#DB2777] flex items-center gap-2 mx-auto">
                  <RotateCcw className="w-5 h-5" />再来一局
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
