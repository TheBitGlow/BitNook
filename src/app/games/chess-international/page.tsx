'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import GameLayout from '@/components/games/GameLayout'
import { useRecentGames } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import {
  INITIAL_CHESS_BOARD,
  ChessBoard,
  ChessColor,
  ChessPieceType,
  Pos,
  CastlingRights,
  ChessMove,
  cloneChessBoard,
  isChessKingInCheck,
  getLegalChessMoves,
  executeMoveSimulation,
  getChessGameStatus,
} from '@/core/games/international-chess'
import { RotateCcw, Undo2, Trophy, Bot, User, AlertTriangle } from 'lucide-react'

const PIECE_SYMBOLS: Record<ChessPieceType, { white: string; black: string }> = {
  k: { white: '♔', black: '♚' },
  q: { white: '♕', black: '♛' },
  r: { white: '♖', black: '♜' },
  b: { white: '♗', black: '♝' },
  n: { white: '♘', black: '♞' },
  p: { white: '♙', black: '♟' },
}

const PIECE_VALUES: Record<ChessPieceType, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
}

const AI_DEPTH = { easy: 1, medium: 2, hard: 3 }

function evaluateBoard(b: ChessBoard): number {
  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = b[r][c]
      if (!piece) continue
      const val = PIECE_VALUES[piece.type] || 0
      score += piece.color === 'white' ? val : -val
    }
  }
  return score
}

function minimax(
  b: ChessBoard,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  cRights: CastlingRights,
  epTarget: Pos | null
): number {
  if (depth === 0) return evaluateBoard(b)

  const color: ChessColor = isMaximizing ? 'white' : 'black'
  const legalMoves = getLegalChessMoves(b, color, cRights, epTarget)

  if (legalMoves.length === 0) {
    if (isChessKingInCheck(b, color)) {
      return isMaximizing ? -100000 : 100000
    }
    return 0 // stalemate
  }

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const m of legalMoves) {
      const sim = executeMoveSimulation(b, m, cRights, epTarget)
      const evalScore = minimax(
        sim.board,
        depth - 1,
        alpha,
        beta,
        false,
        sim.newCastling,
        sim.newEnPassant
      )
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const m of legalMoves) {
      const sim = executeMoveSimulation(b, m, cRights, epTarget)
      const evalScore = minimax(
        sim.board,
        depth - 1,
        alpha,
        beta,
        true,
        sim.newCastling,
        sim.newEnPassant
      )
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

export default function ChessInternationalPage() {
  const { recordRecentGame } = useRecentGames()

  useEffect(() => {
    recordRecentGame('chess-international')
    trackEvent('game_start', { gameSlug: 'chess-international' })
  }, [recordRecentGame])

  const [board, setBoard] = useState<ChessBoard>(() => cloneChessBoard(INITIAL_CHESS_BOARD))
  const [selected, setSelected] = useState<Pos | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<ChessColor>('white')
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<ChessColor | null>(null)
  const [isStalemate, setIsStalemate] = useState(false)
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [playerColor] = useState<ChessColor>('white')
  const [thinking, setThinking] = useState(false)
  const [castlingRights, setCastlingRights] = useState<CastlingRights>({
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true,
  })
  const [enPassantTarget, setEnPassantTarget] = useState<Pos | null>(null)
  const [validMoves, setValidMoves] = useState<Pos[]>([])
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Pos
    to: Pos
    color: ChessColor
  } | null>(null)
  const [history, setHistory] = useState<
    {
      board: ChessBoard
      currentPlayer: ChessColor
      castlingRights: CastlingRights
      enPassantTarget: Pos | null
      moves: number
    }[]
  >([])

  const boardRef = useRef(board)
  const castlingRightsRef = useRef(castlingRights)
  const enPassantTargetRef = useRef(enPassantTarget)

  useEffect(() => { boardRef.current = board }, [board])
  useEffect(() => { castlingRightsRef.current = castlingRights }, [castlingRights])
  useEffect(() => { enPassantTargetRef.current = enPassantTarget }, [enPassantTarget])

  const inCheck = useMemo(
    () => isChessKingInCheck(board, currentPlayer),
    [board, currentPlayer]
  )

  const pushHistory = useCallback(() => {
    setHistory(prev => [
      ...prev.slice(-20),
      {
        board: cloneChessBoard(board),
        currentPlayer,
        castlingRights: { ...castlingRights },
        enPassantTarget: enPassantTarget ? { ...enPassantTarget } : null,
        moves,
      },
    ])
  }, [board, currentPlayer, castlingRights, enPassantTarget, moves])

  const handleUndo = () => {
    if (history.length === 0 || thinking || pendingPromotion) return
    const prev = history[history.length - 1]
    setBoard(prev.board)
    boardRef.current = prev.board
    setCurrentPlayer(prev.currentPlayer)
    setCastlingRights(prev.castlingRights)
    castlingRightsRef.current = prev.castlingRights
    setEnPassantTarget(prev.enPassantTarget)
    enPassantTargetRef.current = prev.enPassantTarget
    setMoves(prev.moves)
    setSelected(null)
    setValidMoves([])
    setGameOver(false)
    setWinner(null)
    setIsStalemate(false)
    setHistory(h => h.slice(0, -1))
  }

  const aiMove = useCallback(() => {
    setThinking(true)
    setTimeout(() => {
      const curBoard = boardRef.current
      const depth = AI_DEPTH[difficulty]
      const aiColor: ChessColor = playerColor === 'white' ? 'black' : 'white'
      const curCastling = castlingRightsRef.current
      const curEnPassant = enPassantTargetRef.current

      const legalMoves = getLegalChessMoves(curBoard, aiColor, curCastling, curEnPassant)

      if (legalMoves.length === 0) {
        const status = getChessGameStatus(curBoard, aiColor, curCastling, curEnPassant)
        setGameOver(true)
        if (status.status === 'checkmate') {
          setWinner(playerColor)
        } else {
          setIsStalemate(true)
        }
        setThinking(false)
        return
      }

      let bestScore = aiColor === 'white' ? -Infinity : Infinity
      let bestMove = legalMoves[0]

      for (const m of legalMoves) {
        const sim = executeMoveSimulation(curBoard, m, curCastling, curEnPassant)
        const score = minimax(
          sim.board,
          depth - 1,
          -Infinity,
          Infinity,
          aiColor === 'black', // next player is maximizing (white)
          sim.newCastling,
          sim.newEnPassant
        )
        if (aiColor === 'white' ? score > bestScore : score < bestScore) {
          bestScore = score
          bestMove = m
        }
      }

      const sim = executeMoveSimulation(curBoard, bestMove, curCastling, curEnPassant)
      setBoard(sim.board)
      boardRef.current = sim.board
      setCastlingRights(sim.newCastling)
      castlingRightsRef.current = sim.newCastling
      setEnPassantTarget(sim.newEnPassant)
      enPassantTargetRef.current = sim.newEnPassant
      setMoves(m => m + 1)
      setCurrentPlayer(playerColor)
      setThinking(false)

      const humanStatus = getChessGameStatus(sim.board, playerColor, sim.newCastling, sim.newEnPassant)
      if (humanStatus.status === 'checkmate') {
        setGameOver(true)
        setWinner(aiColor)
      } else if (humanStatus.status === 'stalemate') {
        setGameOver(true)
        setIsStalemate(true)
      }
    }, 200)
  }, [difficulty, playerColor])

  const completeMove = (from: Pos, to: Pos, promoType?: ChessPieceType) => {
    pushHistory()
    const move: ChessMove = { from, to, promotionType: promoType }
    const sim = executeMoveSimulation(board, move, castlingRights, enPassantTarget)

    setBoard(sim.board)
    boardRef.current = sim.board
    setCastlingRights(sim.newCastling)
    castlingRightsRef.current = sim.newCastling
    setEnPassantTarget(sim.newEnPassant)
    enPassantTargetRef.current = sim.newEnPassant
    setMoves(m => m + 1)
    setSelected(null)
    setValidMoves([])

    const nextColor: ChessColor = currentPlayer === 'white' ? 'black' : 'white'
    setCurrentPlayer(nextColor)

    const nextStatus = getChessGameStatus(sim.board, nextColor, sim.newCastling, sim.newEnPassant)
    if (nextStatus.status === 'checkmate') {
      setGameOver(true)
      setWinner(currentPlayer)
      return
    } else if (nextStatus.status === 'stalemate') {
      setGameOver(true)
      setIsStalemate(true)
      return
    }

    if (gameMode === 'ai' && !gameOver) {
      setTimeout(() => aiMove(), 150)
    }
  }

  const handlePromoteSelect = (type: ChessPieceType) => {
    if (!pendingPromotion) return
    const { from, to } = pendingPromotion
    setPendingPromotion(null)
    completeMove(from, to, type)
  }

  const handleClick = (r: number, c: number) => {
    if (gameOver || thinking || pendingPromotion) return
    if (gameMode === 'ai' && currentPlayer !== playerColor) return

    if (selected) {
      if (selected.r === r && selected.c === c) {
        setSelected(null)
        setValidMoves([])
        return
      }

      const isValid = validMoves.some(m => m.r === r && m.c === c)
      if (isValid) {
        const piece = board[selected.r][selected.c]
        const isPromotion = piece?.type === 'p' && (r === 0 || r === 7)

        if (isPromotion) {
          setPendingPromotion({ from: selected, to: { r, c }, color: piece.color })
          return
        }

        completeMove(selected, { r, c })
      } else {
        const piece = board[r][c]
        if (piece && piece.color === currentPlayer) {
          setSelected({ r, c })
          const allLegals = getLegalChessMoves(board, currentPlayer, castlingRights, enPassantTarget)
          const movesFromHere = allLegals.filter(m => m.from.r === r && m.from.c === c).map(m => m.to)
          setValidMoves(movesFromHere)
        } else {
          setSelected(null)
          setValidMoves([])
        }
      }
    } else {
      const piece = board[r][c]
      if (piece && piece.color === currentPlayer) {
        setSelected({ r, c })
        const allLegals = getLegalChessMoves(board, currentPlayer, castlingRights, enPassantTarget)
        const movesFromHere = allLegals.filter(m => m.from.r === r && m.from.c === c).map(m => m.to)
        setValidMoves(movesFromHere)
      }
    }
  }

  const resetGame = () => {
    const initB = cloneChessBoard(INITIAL_CHESS_BOARD)
    setBoard(initB)
    boardRef.current = initB
    setSelected(null)
    setCurrentPlayer('white')
    setMoves(0)
    setGameOver(false)
    setWinner(null)
    setIsStalemate(false)
    setPendingPromotion(null)
    setHistory([])
    setCastlingRights({ whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true })
    castlingRightsRef.current = { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true }
    setEnPassantTarget(null)
    enPassantTargetRef.current = null
    setValidMoves([])
    setThinking(false)
  }

  const instructions = [
    { title: '正规规则', desc: '支持王翼/后翼易位（Castling）、吃过路兵（En Passant）与兵到底线升变（Promotion）。' },
    { title: '胜负判定', desc: '严格依据国际棋联 (FIDE) 规则，以将死（Checkmate）判定胜负，无合法着法且未受将军则为逼和（Stalemate）。' },
    { title: '升变选择', desc: '当兵推进至第 8 排时，将弹出标准升变对话框供选择后 (Queen)、车 (Rook)、象 (Bishop) 或马 (Knight)。' },
  ]

  const controls = (
    <div className="flex items-center gap-2">
      <button
        onClick={handleUndo}
        disabled={history.length === 0 || thinking || Boolean(pendingPromotion)}
        className="px-3 py-1.5 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
      >
        <Undo2 className="w-3.5 h-3.5" />
        <span>悔棋</span>
      </button>
      <button
        onClick={resetGame}
        className="px-3 py-1.5 rounded-md border border-border bg-surface text-text-primary hover:bg-surface-secondary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>重新开始</span>
      </button>
    </div>
  )

  return (
    <GameLayout
      title="国际象棋"
      titleEn="International Chess"
      categoryName="策略棋盘"
      description="严格遵循国际棋联 FIDE 规范，支持王车易位、过路兵、兵升变选择与智能 AI 对局。"
      controlsNode={controls}
      instructions={instructions}
    >
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* Left Side Controls */}
        <div className="w-full lg:w-56 space-y-3 shrink-0">
          {/* Status Box */}
          <div className="p-4 rounded-xl border border-border bg-surface-secondary/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full border ${
                    currentPlayer === 'white'
                      ? 'bg-white border-border shadow-xs'
                      : 'bg-zinc-900 border-zinc-700'
                  }`}
                />
                <span className="text-sm font-semibold text-text-primary">
                  {gameOver
                    ? isStalemate
                      ? '平局 (逼和 Stalemate)'
                      : winner === 'white'
                      ? '白方获胜！'
                      : '黑方获胜！'
                    : `${currentPlayer === 'white' ? '白方' : '黑方'}走棋`}
                </span>
              </div>
            </div>

            <div className="text-xs text-text-muted font-mono mt-1">
              累计步数: {moves} 步
            </div>

            {inCheck && !gameOver && (
              <div className="mt-2 py-1 px-2 rounded-md bg-danger/15 text-danger border border-danger/30 text-xs font-bold text-center animate-pulse flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>将军！</span>
              </div>
            )}
            {thinking && (
              <div className="mt-2 py-1 px-2 rounded-md bg-accent-subtle text-accent border border-accent/20 text-xs font-medium text-center">
                AI 运算推演中...
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50">
            <div className="text-xs font-semibold text-text-secondary mb-2">对局模式</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setGameMode('pvp')
                  resetGame()
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
                  resetGame()
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
              <div className="text-xs font-semibold text-text-secondary mb-2">AI 难度等级</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      difficulty === d
                        ? 'bg-accent text-white shadow-subtle'
                        : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {d === 'easy' ? '初级' : d === 'medium' ? '中级' : '大师'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Central Chess Board Surface */}
        <div className="relative w-full max-w-[460px] sm:max-w-[480px] rounded-2xl border-4 border-border bg-surface p-2 shadow-xl">
          {/* Pawn Promotion Modal */}
          {pendingPromotion && (
            <div className="absolute inset-0 bg-canvas/90 backdrop-blur-xs z-30 rounded-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-120">
              <span className="text-text-primary font-bold text-base mb-1">
                小兵升变 (Pawn Promotion)
              </span>
              <span className="text-xs text-text-secondary mb-4">
                请选择小兵推进到底线后升变的高级兵种
              </span>
              <div className="flex gap-2.5">
                {[
                  { type: 'q' as const, name: '后 (Queen)', symbol: pendingPromotion.color === 'white' ? '♕' : '♛' },
                  { type: 'r' as const, name: '车 (Rook)', symbol: pendingPromotion.color === 'white' ? '♖' : '♜' },
                  { type: 'b' as const, name: '象 (Bishop)', symbol: pendingPromotion.color === 'white' ? '♗' : '♝' },
                  { type: 'n' as const, name: '马 (Knight)', symbol: pendingPromotion.color === 'white' ? '♘' : '♞' },
                ].map(p => (
                  <button
                    key={p.type}
                    onClick={() => handlePromoteSelect(p.type)}
                    className="p-3 bg-surface hover:bg-surface-secondary border border-border hover:border-accent rounded-xl flex flex-col items-center gap-1 transition-all shadow-subtle cursor-pointer hover:scale-105"
                  >
                    <span className="text-3xl">{p.symbol}</span>
                    <span className="text-[11px] text-text-primary font-semibold">{p.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 8x8 Grid */}
          <div
            className="grid gap-0 mx-auto rounded-lg overflow-hidden border border-border shadow-inner"
            style={{ gridTemplateColumns: `repeat(8, 1fr)` }}
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
                    className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl transition-all relative cursor-pointer select-none ${
                      isSelected ? 'z-10' : ''
                    }`}
                    style={{
                      background: isSelected
                        ? '#F59E0B'
                        : isLight
                        ? '#F0D9B5'
                        : '#B58863',
                      boxShadow: isSelected
                        ? 'inset 0 0 0 3px #D97706, 0 2px 8px rgba(0,0,0,0.2)'
                        : 'none',
                    }}
                  >
                    {isValid && !cell && (
                      <div className="w-3.5 h-3.5 rounded-full bg-black/25" />
                    )}
                    {isValid && cell && (
                      <div className="absolute inset-0 ring-3 ring-orange-500 ring-inset" />
                    )}
                    {cell && (
                      <span
                        className="transition-transform hover:scale-105"
                        style={{
                          color: cell.color === 'white' ? '#FFFFFF' : '#18181B',
                          filter:
                            cell.color === 'white'
                              ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.85))'
                              : 'drop-shadow(0 1px 1px rgba(255,255,255,0.4))',
                          fontSize: 'clamp(1.4rem, 4vw, 2.3rem)',
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
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-2xl text-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-warning" />
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              {isStalemate
                ? '和局 (逼和 Stalemate)！'
                : winner === 'white'
                ? '白方获胜！'
                : '黑方获胜！'}
            </h2>
            <p className="text-xs text-text-secondary mb-5">
              {isStalemate
                ? '一方无合法步法且未处于将军状态，双方握手言和'
                : '依据 FIDE 正规规则达成将死 (Checkmate)'}
            </p>
            <button
              onClick={resetGame}
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
