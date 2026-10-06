'use client'

import { useState, useCallback, useEffect } from 'react'
import GameLayout from '@/components/games/GameLayout'
import { useRecentGames } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import {
  INIT_CHINESE_BOARD,
  ROWS,
  COLS,
  Piece,
  Board,
  Pos,
  isRedPiece,
  cloneBoard,
  genRawMoves,
  isKingInCheck,
  getGameStatus,
  PIECE_CHAR,
} from '@/core/games/chinese-chess'
import { RotateCcw, FlipVertical, Undo2, Trophy, Bot, User } from 'lucide-react'

const CELL = 54
const BOARD_W = COLS * CELL
const BOARD_H = ROWS * CELL

type Difficulty = 'easy' | 'medium' | 'hard'

const AI_DEPTH: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }
const PIECE_VAL: Record<string, number> = {
  k: 10000, r: 1000, n: 450, c: 450, b: 200, a: 200, p: 100,
}

function evalBoard(b: Board): number {
  let score = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r][c]
      if (!p) continue
      const val = PIECE_VAL[p.toLowerCase()] || 0
      score += isRedPiece(p) ? val : -val
    }
  }
  return score
}

function minimax(
  b: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; move?: { from: Pos; to: Pos } } {
  if (depth === 0) return { score: evalBoard(b) }

  const moves: { from: Pos; to: Pos }[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r][c]
      if (!p || isRedPiece(p) !== isMaximizing) continue
      const raw = genRawMoves(b, r, c)
      for (const to of raw) {
        const nb = cloneBoard(b)
        nb[to.r][to.c] = nb[r][c]
        nb[r][c] = null
        if (!isKingInCheck(nb, isMaximizing)) {
          moves.push({ from: { r, c }, to })
        }
      }
    }
  }

  if (moves.length === 0) {
    return { score: isMaximizing ? -200000 : 200000 }
  }

  let bestMove = moves[0]

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const m of moves) {
      const nb = cloneBoard(b)
      nb[m.to.r][m.to.c] = nb[m.from.r][m.from.c]
      nb[m.from.r][m.from.c] = null
      const evalRes = minimax(nb, depth - 1, alpha, beta, false)
      if (evalRes.score > maxEval) {
        maxEval = evalRes.score
        bestMove = m
      }
      alpha = Math.max(alpha, evalRes.score)
      if (beta <= alpha) break
    }
    return { score: maxEval, move: bestMove }
  } else {
    let minEval = Infinity
    for (const m of moves) {
      const nb = cloneBoard(b)
      nb[m.to.r][m.to.c] = nb[m.from.r][m.from.c]
      nb[m.from.r][m.from.c] = null
      const evalRes = minimax(nb, depth - 1, alpha, beta, true)
      if (evalRes.score < minEval) {
        minEval = evalRes.score
        bestMove = m
      }
      beta = Math.min(beta, evalRes.score)
      if (beta <= alpha) break
    }
    return { score: minEval, move: bestMove }
  }
}

export default function ChessChinesePage() {
  const { recordRecentGame } = useRecentGames()

  useEffect(() => {
    recordRecentGame('chess-chinese')
    trackEvent('game_start', { gameSlug: 'chess-chinese' })
  }, [recordRecentGame])

  const [board, setBoard] = useState<Board>(() => cloneBoard(INIT_CHINESE_BOARD))
  const [selected, setSelected] = useState<Pos | null>(null)
  const [curPlayer, setCurPlayer] = useState<'red' | 'black'>('red')
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<'red' | 'black' | null>(null)
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [playerColor] = useState<'red' | 'black'>('red')
  const [thinking, setThinking] = useState(false)
  const [lastMove, setLastMove] = useState<{ from: Pos; to: Pos } | null>(null)
  const [validMoves, setValidMoves] = useState<Pos[]>([])
  const [history, setHistory] = useState<{ from: Pos; to: Pos; piece: Piece }[]>([])
  const [flipped, setFlipped] = useState(false)
  const [check, setCheck] = useState(false)

  // AI Move Execution
  const aiMove = useCallback(
    (b: Board, aiRed: boolean) => {
      setThinking(true)
      setTimeout(() => {
        const depth = AI_DEPTH[difficulty]
        const { move: bestMv } = minimax(b, depth, -Infinity, Infinity, aiRed)

        if (!bestMv || !bestMv.from || !bestMv.to) {
          setThinking(false)
          return
        }

        const { from, to } = bestMv
        const nb = cloneBoard(b)
        const pc = nb[from.r][from.c]
        nb[to.r][to.c] = pc
        nb[from.r][from.c] = null

        setBoard(nb)
        setLastMove({ from, to })
        setHistory(h => [...h, { from, to, piece: pc }])

        const next = aiRed ? 'black' : 'red'
        const gameStatus = getGameStatus(nb, next === 'red')
        if (gameStatus.status === 'checkmate' || gameStatus.status === 'stalemate') {
          setGameOver(true)
          setWinner(gameStatus.winner || (aiRed ? 'red' : 'black'))
          setCheck(gameStatus.status === 'checkmate')
        } else {
          setCurPlayer(next)
          setCheck(gameStatus.status === 'check')
        }
        setThinking(false)
      }, 100)
    },
    [difficulty]
  )

  // Cell Click Handler
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
        nb[r][c] = pc
        nb[selected.r][selected.c] = null

        setBoard(nb)
        setLastMove({ from: selected, to: { r, c } })
        setHistory(h => [...h, { from: selected, to: { r, c }, piece: pc }])
        setSelected(null)
        setValidMoves([])

        const next = curPlayer === 'red' ? 'black' : 'red'
        const gameStatus = getGameStatus(nb, next === 'red')

        if (gameStatus.status === 'checkmate' || gameStatus.status === 'stalemate') {
          setGameOver(true)
          setWinner(gameStatus.winner || curPlayer)
          setCheck(gameStatus.status === 'checkmate')
        } else {
          setCurPlayer(next)
          setCheck(gameStatus.status === 'check')
          if (gameMode === 'ai') {
            aiMove(nb, next === 'red')
          }
        }
      } else {
        const piece = board[r][c]
        if (piece && isRedPiece(piece) === (curPlayer === 'red')) {
          setSelected({ r, c })
          setValidMoves(
            genRawMoves(board, r, c).filter(m => {
              if (!m) return false
              const nb = cloneBoard(board)
              nb[m.r][m.c] = piece
              nb[r][c] = null
              return !isKingInCheck(nb, curPlayer === 'red')
            })
          )
        } else {
          setSelected(null)
          setValidMoves([])
        }
      }
    } else {
      const piece = board[r][c]
      if (piece && isRedPiece(piece) === (curPlayer === 'red')) {
        setSelected({ r, c })
        setValidMoves(
          genRawMoves(board, r, c).filter(m => {
            if (!m) return false
            const nb = cloneBoard(board)
            nb[m.r][m.c] = piece
            nb[r][c] = null
            return !isKingInCheck(nb, curPlayer === 'red')
          })
        )
      }
    }
  }

  const reset = () => {
    setBoard(cloneBoard(INIT_CHINESE_BOARD))
    setSelected(null)
    setCurPlayer('red')
    setGameOver(false)
    setWinner(null)
    setLastMove(null)
    setValidMoves([])
    setHistory([])
    setCheck(false)
    setThinking(false)
  }

  const undo = () => {
    if (!history.length || thinking) return
    reset()
    if (history.length > 1) {
      const ents = history.slice(0, -2)
      let b = cloneBoard(INIT_CHINESE_BOARD)
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

  const getDisp = (r: number, c: number) => (flipped ? { r: 9 - r, c: 8 - c } : { r, c })

  const instructions = [
    { title: '点击落子', desc: '点击己方棋子后，棋盘将高亮显示所有符合楚河汉界与象棋规矩的合法步法。' },
    { title: '胜负判定', desc: '严格依据中国象棋棋规，以将死（Checkmate）或困毙（Stalemate）裁定胜负，严禁吃将。' },
    { title: '将帅照面', desc: '两方将帅同列且中间无其他棋子阻隔时构成将军，任何引起照面的移动均属非法。' },
  ]

  const controls = (
    <div className="flex items-center gap-2">
      <button
        onClick={reset}
        className="px-3 py-1.5 rounded-md border border-border bg-surface text-text-primary hover:bg-surface-secondary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>重新开始</span>
      </button>
      <button
        onClick={() => setFlipped(!flipped)}
        className="px-3 py-1.5 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <FlipVertical className="w-3.5 h-3.5" />
        <span>翻转</span>
      </button>
    </div>
  )

  return (
    <GameLayout
      title="中国象棋"
      titleEn="Chinese Chess (Xiangqi)"
      categoryName="策略棋盘"
      description="严格遵循楚河汉界与官方象棋规则，支持智能 AI 对弈与双人轮流落子，无吃将违规漏洞。"
      controlsNode={controls}
      instructions={instructions}
    >
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* Left Side Panel */}
        <div className="w-full lg:w-56 space-y-3 shrink-0">
          {/* Status Box */}
          <div className="p-4 rounded-xl border border-border bg-surface-secondary/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    curPlayer === 'red'
                      ? 'bg-danger ring-2 ring-danger/30'
                      : 'bg-text-primary ring-2 ring-text-muted/30'
                  }`}
                />
                <span className="text-sm font-semibold text-text-primary">
                  {gameOver
                    ? winner === 'red'
                      ? '红方获胜！'
                      : winner === 'black'
                      ? '黑方获胜！'
                      : '和棋'
                    : `${curPlayer === 'red' ? '红方' : '黑方'}走棋`}
                </span>
              </div>
            </div>

            {check && !gameOver && (
              <div className="mt-2 py-1 px-2 rounded-md bg-danger/15 text-danger border border-danger/30 text-xs font-bold text-center animate-pulse">
                将军！
              </div>
            )}
            {thinking && (
              <div className="mt-2 py-1 px-2 rounded-md bg-accent-subtle text-accent border border-accent/20 text-xs font-medium text-center">
                AI 深度思考中...
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50">
            <div className="text-xs font-semibold text-text-secondary mb-2">对弈模式</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setGameMode('pvp')
                  reset()
                }}
                className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  gameMode === 'pvp'
                    ? 'bg-accent text-white shadow-subtle'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>双人</span>
              </button>
              <button
                onClick={() => {
                  setGameMode('ai')
                  reset()
                }}
                className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  gameMode === 'ai'
                    ? 'bg-accent text-white shadow-subtle'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>人机</span>
              </button>
            </div>
          </div>

          {/* Difficulty */}
          {gameMode === 'ai' && (
            <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50">
              <div className="text-xs font-semibold text-text-secondary mb-2">AI 算力难度</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      difficulty === d
                        ? 'bg-accent text-white shadow-subtle'
                        : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Undo Button */}
          <button
            onClick={undo}
            disabled={history.length === 0 || thinking}
            className="w-full py-2 px-3 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>悔棋一步</span>
          </button>
        </div>

        {/* Central Xiangqi Board Surface */}
        <div className="relative aspect-[9/10] w-full max-w-[480px] sm:max-w-[520px] rounded-2xl border-[8px] border-[#532E16] bg-[#753D1C] p-2 shadow-xl shadow-black/30">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
            className="block rounded-lg"
            style={{
              background:
                'radial-gradient(circle at 25% 16%, rgba(255,255,255,0.22), transparent 18%), linear-gradient(145deg, #E6BD6E 0%, #D19C4A 42%, #BA7B32 100%)',
            }}
          >
            {/* Outer border */}
            <rect
              x="2"
              y="2"
              width={BOARD_W - 4}
              height={BOARD_H - 4}
              fill="none"
              stroke="#5C3D1E"
              strokeWidth="4"
              rx="4"
            />

            {/* Horizontal lines */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => (
              <line
                key={`h${r}`}
                x1={CELL / 2}
                y1={r * CELL + CELL / 2}
                x2={BOARD_W - CELL / 2}
                y2={r * CELL + CELL / 2}
                stroke="#5C3D1E"
                strokeWidth="1.5"
              />
            ))}

            {/* Vertical lines: Outer border connects all rows */}
            <line
              x1={CELL / 2}
              y1={CELL / 2}
              x2={CELL / 2}
              y2={4 * CELL + CELL / 2}
              stroke="#5C3D1E"
              strokeWidth="1.5"
            />
            <line
              x1={CELL / 2}
              y1={5 * CELL + CELL / 2}
              x2={CELL / 2}
              y2={BOARD_H - CELL / 2}
              stroke="#5C3D1E"
              strokeWidth="1.5"
            />
            <line
              x1={BOARD_W - CELL / 2}
              y1={CELL / 2}
              x2={BOARD_W - CELL / 2}
              y2={4 * CELL + CELL / 2}
              stroke="#5C3D1E"
              strokeWidth="1.5"
            />
            <line
              x1={BOARD_W - CELL / 2}
              y1={5 * CELL + CELL / 2}
              x2={BOARD_W - CELL / 2}
              y2={BOARD_H - CELL / 2}
              stroke="#5C3D1E"
              strokeWidth="1.5"
            />

            {/* Inner vertical lines (separated by River) */}
            {[1, 2, 3, 4, 5, 6, 7].map(c => (
              <g key={`v${c}`}>
                <line
                  x1={c * CELL + CELL / 2}
                  y1={CELL / 2}
                  x2={c * CELL + CELL / 2}
                  y2={4 * CELL + CELL / 2}
                  stroke="#5C3D1E"
                  strokeWidth="1.5"
                />
                <line
                  x1={c * CELL + CELL / 2}
                  y1={5 * CELL + CELL / 2}
                  x2={c * CELL + CELL / 2}
                  y2={BOARD_H - CELL / 2}
                  stroke="#5C3D1E"
                  strokeWidth="1.5"
                />
              </g>
            ))}

            {/* Palaces diagonal cross */}
            <line
              x1={3 * CELL + CELL / 2}
              y1={CELL / 2}
              x2={5 * CELL + CELL / 2}
              y2={2 * CELL + CELL / 2}
              stroke="#5C3D1E"
              strokeWidth="1.5"
            />
            <line
              x1={5 * CELL + CELL / 2}
              y1={CELL / 2}
              x2={3 * CELL + CELL / 2}
              y2={2 * CELL + CELL / 2}
              stroke="#5C3D1E"
              strokeWidth="1.5"
            />
            <line
              x1={3 * CELL + CELL / 2}
              y1={7 * CELL + CELL / 2}
              x2={5 * CELL + CELL / 2}
              y2={9 * CELL + CELL / 2}
              stroke="#5C3D1E"
              strokeWidth="1.5"
            />
            <line
              x1={5 * CELL + CELL / 2}
              y1={7 * CELL + CELL / 2}
              x2={3 * CELL + CELL / 2}
              y2={9 * CELL + CELL / 2}
              stroke="#5C3D1E"
              strokeWidth="1.5"
            />

            {/* River characters */}
            <text
              x={BOARD_W / 2}
              y={4.5 * CELL + CELL / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="#5C3D1E"
              fontWeight="bold"
              fontFamily="serif"
            >
              楚 河
            </text>
            <text
              x={BOARD_W / 2}
              y={5.5 * CELL + CELL / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="#5C3D1E"
              fontWeight="bold"
              fontFamily="serif"
            >
              漢 界
            </text>
          </svg>

          {/* Interactive Click Layer */}
          <div className="absolute inset-0 z-10">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const { r: dr, c: dc } = getDisp(r, c)
                const isValid = validMoves.some(m => m && m.r === r && m.c === c)
                const isLast =
                  lastMove &&
                  ((lastMove.from.r === r && lastMove.from.c === c) ||
                    (lastMove.to.r === r && lastMove.to.c === c))

                return (
                  <button
                    key={`cell${r}${c}`}
                    onClick={() => onCell(r, c)}
                    className="absolute flex items-center justify-center rounded-full focus:outline-none cursor-pointer"
                    style={{
                      left: `${(dc / COLS) * 100}%`,
                      top: `${(dr / ROWS) * 100}%`,
                      width: `${100 / COLS}%`,
                      height: `${100 / ROWS}%`,
                    }}
                    aria-label={`第${r + 1}行第${c + 1}列`}
                  >
                    {isValid && !cell && (
                      <span className="h-3.5 w-3.5 rounded-full bg-emerald-600/80 shadow-[0_0_0_5px_rgba(5,150,105,0.2)] animate-pulse" />
                    )}
                    {isLast && !cell && <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />}
                  </button>
                )
              })
            )}
          </div>

          {/* Chess Pieces Layer */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {board.map((row, r) =>
              row.map((cell, c) => {
                if (!cell) return null
                const { r: dr, c: dc } = getDisp(r, c)
                const isSel = selected?.r === r && selected?.c === c
                const isLast =
                  lastMove &&
                  ((lastMove.from.r === r && lastMove.from.c === c) ||
                    (lastMove.to.r === r && lastMove.to.c === c))
                const isValid = validMoves.some(m => m && m.r === r && m.c === c)
                const red = isRedPiece(cell)

                return (
                  <button
                    key={`p${r}${c}`}
                    onClick={() => onCell(r, c)}
                    className="absolute flex items-center justify-center pointer-events-auto cursor-pointer"
                    style={{
                      left: `${(dc / COLS) * 100}%`,
                      top: `${(dr / ROWS) * 100}%`,
                      width: `${100 / COLS}%`,
                      height: `${100 / ROWS}%`,
                    }}
                  >
                    {isValid && cell && (
                      <div className="pointer-events-none absolute inset-[6%] rounded-full border-[3px] border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]" />
                    )}
                    <div
                      className={`flex h-[82%] w-[82%] rounded-full items-center justify-center font-bold text-[clamp(1rem,3.2vw,1.45rem)] select-none transition-transform ${
                        isSel ? 'scale-110 z-10 ring-2 ring-accent ring-offset-2' : 'hover:scale-[1.04]'
                      } ${isLast ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}
                      style={{
                        background: red
                          ? 'radial-gradient(circle at 35% 25%, #FEE2E2 0%, #DC2626 54%, #7F1D1D 100%)'
                          : 'radial-gradient(circle at 35% 25%, #F3F4F6 0%, #374151 54%, #111827 100%)',
                        color: red ? '#FEF3C7' : '#F9FAFB',
                        boxShadow: red
                          ? 'inset 0 3px 5px rgba(255,255,255,0.35), inset 0 -4px 7px rgba(0,0,0,0.35), 0 5px 10px rgba(0,0,0,0.35), 0 0 0 2px #7F1D1D'
                          : 'inset 0 3px 5px rgba(255,255,255,0.18), inset 0 -4px 7px rgba(0,0,0,0.45), 0 5px 10px rgba(0,0,0,0.45), 0 0 0 2px #111827',
                        border: red ? '2px solid #FECACA' : '2px solid #9CA3AF',
                      }}
                    >
                      <span className="font-serif">{PIECE_CHAR[cell]}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side Move History */}
        <div className="w-full lg:w-56 shrink-0">
          <div className="p-4 rounded-xl border border-border bg-surface-secondary/50 max-h-[460px] flex flex-col">
            <h3 className="text-xs font-semibold text-text-primary mb-3">走棋着法记录</h3>
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs pr-1">
              {history.length === 0 ? (
                <p className="text-text-muted text-xs">暂无走棋着法</p>
              ) : (
                history.map((e, i) => (
                  <div
                    key={i}
                    className={`py-1 px-2 rounded flex items-center justify-between ${
                      i % 2 === 0 ? 'bg-surface' : 'bg-surface-secondary'
                    }`}
                  >
                    <span className="text-text-muted">{Math.floor(i / 2) + 1}.</span>
                    <span className={isRedPiece(e.piece) ? 'text-danger font-bold' : 'text-text-primary font-bold'}>
                      {PIECE_CHAR[e.piece!] || '移动'}
                    </span>
                    <span className="text-text-muted text-[10px]">
                      ({e.from.r},{e.from.c})→({e.to.r},{e.to.c})
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-2xl text-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-warning" />
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              {winner === 'red' ? '红方获胜！' : winner === 'black' ? '黑方获胜！' : '平局！'}
            </h2>
            <p className="text-xs text-text-secondary mb-5">
              {winner ? '依照象棋正规竞赛规则将死裁定获胜' : '双方子力不足或无子可动'}
            </p>
            <button
              onClick={reset}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新再来一局</span>
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  )
}
