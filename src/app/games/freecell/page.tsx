'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import GameLayout from '@/components/games/GameLayout'
import { useRecentGames } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import {
  generateMsFreeCellDeal,
  getMaxMovableCards,
  isValidSequence,
  canMoveCardToFoundation,
  isFreecellGameWon,
  isKnownUnsolvableDeal,
  Card,
  Column,
  Suit,
  SUITS,
  getCardColor,
  getCardValue,
} from '@/core/games/freecell'
import { RotateCcw, Undo2, Sparkles, Trophy, Dices, AlertTriangle } from 'lucide-react'

interface GameState {
  columns: Column[]
  foundations: Record<Suit, Card[]>
  freeCells: (Card | null)[]
  moves: number
}

export default function FreeCellPage() {
  const { recordRecentGame } = useRecentGames()

  useEffect(() => {
    recordRecentGame('freecell')
    trackEvent('game_start', { gameSlug: 'freecell' })
  }, [recordRecentGame])

  const [dealNumber, setDealNumber] = useState<number>(() => Math.floor(Math.random() * 32000) + 1)
  const [dealInput, setDealInput] = useState<string>('')
  const [columns, setColumns] = useState<Column[]>(() => generateMsFreeCellDeal(dealNumber))
  const [foundations, setFoundations] = useState<Record<Suit, Card[]>>({
    '♠': [],
    '♥': [],
    '♦': [],
    '♣': [],
  })
  const [freeCells, setFreeCells] = useState<(Card | null)[]>([null, null, null, null])
  const [moves, setMoves] = useState(0)

  // Selection state
  const [selected, setSelected] = useState<
    | { type: 'col'; colIdx: number; startIdx: number }
    | { type: 'free'; freeIdx: number }
    | null
  >(null)

  // History stack for Undo
  const [history, setHistory] = useState<GameState[]>([])

  const isWon = useMemo(() => isFreecellGameWon(foundations), [foundations])

  const pushHistory = useCallback(() => {
    setHistory(prev => [
      ...prev.slice(-25),
      {
        columns: columns.map(c => [...c]),
        foundations: {
          '♠': [...foundations['♠']],
          '♥': [...foundations['♥']],
          '♦': [...foundations['♦']],
          '♣': [...foundations['♣']],
        },
        freeCells: [...freeCells],
        moves,
      },
    ])
  }, [columns, foundations, freeCells, moves])

  const startNewGame = useCallback((specificDeal?: number) => {
    const nextDeal = specificDeal !== undefined ? specificDeal : Math.floor(Math.random() * 32000) + 1
    setDealNumber(nextDeal)
    setColumns(generateMsFreeCellDeal(nextDeal))
    setFoundations({ '♠': [], '♥': [], '♦': [], '♣': [] })
    setFreeCells([null, null, null, null])
    setMoves(0)
    setSelected(null)
    setHistory([])
  }, [])

  const handleSelectDeal = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(dealInput, 10)
    if (!isNaN(num) && num >= 1 && num <= 32000) {
      startNewGame(num)
      setDealInput('')
    }
  }

  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setColumns(prev.columns)
    setFoundations(prev.foundations)
    setFreeCells(prev.freeCells)
    setMoves(prev.moves)
    setSelected(null)
    setHistory(h => h.slice(0, -1))
  }, [history])

  // Move single card to FreeCell
  const handleFreeCellClick = (idx: number) => {
    if (isWon) return

    if (!selected) {
      if (freeCells[idx]) {
        setSelected({ type: 'free', freeIdx: idx })
      }
      return
    }

    if (selected.type === 'free') {
      if (selected.freeIdx === idx) {
        setSelected(null)
      } else if (!freeCells[idx]) {
        pushHistory()
        const newFree = [...freeCells]
        newFree[idx] = newFree[selected.freeIdx]
        newFree[selected.freeIdx] = null
        setFreeCells(newFree)
        setMoves(m => m + 1)
        setSelected(null)
      } else {
        setSelected({ type: 'free', freeIdx: idx })
      }
      return
    }

    if (selected.type === 'col') {
      const col = columns[selected.colIdx]
      if (selected.startIdx === col.length - 1 && freeCells[idx] === null) {
        pushHistory()
        const newCols = columns.map(c => [...c])
        const [movedCard] = newCols[selected.colIdx].splice(selected.startIdx, 1)
        const newFree = [...freeCells]
        newFree[idx] = movedCard

        setColumns(newCols)
        setFreeCells(newFree)
        setMoves(m => m + 1)
        setSelected(null)
      } else {
        setSelected(null)
      }
    }
  }

  // Move to Foundation
  const handleFoundationClick = (suit: Suit) => {
    if (isWon || !selected) return

    const foundation = foundations[suit]
    const topCard = foundation.length > 0 ? foundation[foundation.length - 1] : null

    if (selected.type === 'free') {
      const card = freeCells[selected.freeIdx]
      if (card && canMoveCardToFoundation(card, topCard)) {
        pushHistory()
        const newFree = [...freeCells]
        newFree[selected.freeIdx] = null
        setFreeCells(newFree)
        setFoundations(f => ({ ...f, [suit]: [...f[suit], card] }))
        setMoves(m => m + 1)
        setSelected(null)
      } else {
        setSelected(null)
      }
      return
    }

    if (selected.type === 'col') {
      const col = columns[selected.colIdx]
      if (selected.startIdx === col.length - 1) {
        const card = col[selected.startIdx]
        if (canMoveCardToFoundation(card, topCard)) {
          pushHistory()
          const newCols = columns.map(c => [...c])
          const [movedCard] = newCols[selected.colIdx].splice(selected.startIdx, 1)
          setColumns(newCols)
          setFoundations(f => ({ ...f, [suit]: [...f[suit], movedCard] }))
          setMoves(m => m + 1)
          setSelected(null)
        } else {
          setSelected(null)
        }
      } else {
        setSelected(null)
      }
    }
  }

  // Column click & multi-card sequence move logic
  const handleColumnClick = (targetColIdx: number, cardIdx?: number) => {
    if (isWon) return

    if (!selected) {
      const col = columns[targetColIdx]
      if (col.length === 0) return

      const startIdx = cardIdx !== undefined ? cardIdx : col.length - 1
      if (isValidSequence(col.slice(startIdx))) {
        setSelected({ type: 'col', colIdx: targetColIdx, startIdx })
      }
      return
    }

    if (selected.type === 'free') {
      const card = freeCells[selected.freeIdx]
      if (!card) {
        setSelected(null)
        return
      }

      const targetCol = columns[targetColIdx]
      let canPlace = false
      if (targetCol.length === 0) {
        canPlace = true
      } else {
        const topCard = targetCol[targetCol.length - 1]
        canPlace =
          getCardColor(card) !== getCardColor(topCard) &&
          getCardValue(card) === getCardValue(topCard) - 1
      }

      if (canPlace) {
        pushHistory()
        const newFree = [...freeCells]
        newFree[selected.freeIdx] = null
        const newCols = columns.map(c => [...c])
        newCols[targetColIdx].push(card)

        setFreeCells(newFree)
        setColumns(newCols)
        setMoves(m => m + 1)
        setSelected(null)
      } else {
        setSelected(null)
      }
      return
    }

    if (selected.type === 'col') {
      const srcColIdx = selected.colIdx
      const startIdx = selected.startIdx

      if (srcColIdx === targetColIdx) {
        setSelected(null)
        return
      }

      const srcCol = columns[srcColIdx]
      const targetCol = columns[targetColIdx]
      const sequenceToMove = srcCol.slice(startIdx)
      const count = sequenceToMove.length
      const baseCard = sequenceToMove[0]

      const emptyFreeCells = freeCells.filter(c => c === null).length
      let emptyColsCount = 0
      for (let i = 0; i < 8; i++) {
        if (i !== srcColIdx && i !== targetColIdx && columns[i].length === 0) {
          emptyColsCount++
        }
      }

      const maxMovable = getMaxMovableCards(
        emptyFreeCells,
        emptyColsCount,
        targetCol.length === 0
      )

      let canPlace = false
      if (targetCol.length === 0) {
        canPlace = count <= maxMovable
      } else {
        const topCard = targetCol[targetCol.length - 1]
        const alternating = getCardColor(baseCard) !== getCardColor(topCard)
        const sequenceOk = getCardValue(baseCard) === getCardValue(topCard) - 1
        canPlace = alternating && sequenceOk && count <= maxMovable
      }

      if (canPlace) {
        pushHistory()
        const newCols = columns.map(c => [...c])
        const movedCards = newCols[srcColIdx].splice(startIdx, count)
        newCols[targetColIdx].push(...movedCards)

        setColumns(newCols)
        setMoves(m => m + 1)
        setSelected(null)
      } else {
        setSelected(null)
      }
    }
  }

  // Automatic Foundation collection
  const handleAutoCollect = () => {
    let changed = false
    const newCols = columns.map(c => [...c])
    const newFree = [...freeCells]
    const newFoundations = {
      '♠': [...foundations['♠']],
      '♥': [...foundations['♥']],
      '♦': [...foundations['♦']],
      '♣': [...foundations['♣']],
    }

    let progress = true
    while (progress) {
      progress = false

      // Check FreeCells
      for (let i = 0; i < 4; i++) {
        const card = newFree[i]
        if (card) {
          const targetFound = newFoundations[card.suit]
          const topCard = targetFound.length > 0 ? targetFound[targetFound.length - 1] : null
          if (canMoveCardToFoundation(card, topCard)) {
            targetFound.push(card)
            newFree[i] = null
            changed = true
            progress = true
          }
        }
      }

      // Check Column tops
      for (let c = 0; c < 8; c++) {
        const col = newCols[c]
        if (col.length > 0) {
          const card = col[col.length - 1]
          const targetFound = newFoundations[card.suit]
          const topCard = targetFound.length > 0 ? targetFound[targetFound.length - 1] : null
          if (canMoveCardToFoundation(card, topCard)) {
            col.pop()
            targetFound.push(card)
            changed = true
            progress = true
          }
        }
      }
    }

    if (changed) {
      pushHistory()
      setColumns(newCols)
      setFreeCells(newFree)
      setFoundations(newFoundations)
      setMoves(m => m + 1)
      setSelected(null)
    }
  }

  const instructions = [
    { title: '空当暂存', desc: '左上角 4 个暂存格可临时存放单张任意扑克，方便挪腾主牌区通道。' },
    { title: '顺牌规则', desc: '主牌区 8 列须红黑花色交替、点数连续递减排列；符合顺牌条件的多张牌可批量整体移动。' },
    { title: '最大移牌定理', desc: '批量移动上限严格遵循定理：(空当数+1) × 2^(空列数)。若移入空列，则该空列不计入临时转运槽。' },
  ]

  const controls = (
    <div className="flex items-center gap-2">
      <form onSubmit={handleSelectDeal} className="hidden sm:flex items-center gap-1.5">
        <input
          type="number"
          min={1}
          max={32000}
          value={dealInput}
          onChange={e => setDealInput(e.target.value)}
          placeholder={`#${dealNumber}`}
          className="w-20 px-2 py-1 text-xs rounded border border-border bg-surface text-text-primary text-center font-mono focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="px-2.5 py-1 rounded border border-border bg-surface hover:bg-surface-secondary text-xs text-text-primary font-medium cursor-pointer"
        >
          选局
        </button>
      </form>
      <button
        onClick={() => startNewGame()}
        className="px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-secondary text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        title="随机新牌局"
      >
        <Dices className="w-3.5 h-3.5" />
        <span>随机局</span>
      </button>
      <button
        onClick={handleAutoCollect}
        disabled={isWon}
        className="px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium flex items-center gap-1.5 shadow-subtle transition-colors disabled:opacity-50 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>自动收牌</span>
      </button>
      <button
        onClick={handleUndo}
        disabled={history.length === 0 || isWon}
        className="px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
      >
        <Undo2 className="w-3.5 h-3.5" />
        <span>悔棋</span>
      </button>
    </div>
  )

  return (
    <GameLayout
      title="空当接龙"
      titleEn={`FreeCell (Deal #${dealNumber})`}
      categoryName="经典卡牌"
      description="经典 Microsoft FreeCell 编号牌局兼容的确定性 LCG 发牌算法，严格实现空当接龙卡牌容量定理，支持智能一键收牌与撤销悔棋。"
      controlsNode={controls}
      instructions={instructions}
    >
      <div className="w-full flex flex-col items-center select-none max-w-4xl">
        {/* Deal #11982 Notice */}
        {isKnownUnsolvableDeal(dealNumber) && (
          <div className="w-full mb-4 px-3.5 py-2.5 rounded-lg border border-warning/40 bg-warning-subtle text-warning flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>经典不可解牌局提醒</strong>：Deal #11982 为经典 Microsoft FreeCell 前 32000 局中唯一被数学严格证明为不可解的著名死局。
              </span>
            </div>
            <button
              onClick={() => startNewGame()}
              className="px-2 py-0.5 rounded bg-surface border border-warning/30 text-[11px] hover:bg-surface-secondary text-text-primary transition shrink-0 cursor-pointer"
            >
              换一局
            </button>
          </div>
        )}

        {/* Top Header Stats */}
        <div className="w-full flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium text-text-secondary px-2.5 py-1 rounded bg-surface-secondary border border-border">
              牌局编号: <strong className="text-text-primary">#{dealNumber}</strong>
            </span>
            <span className="text-xs font-mono font-medium text-text-secondary px-2.5 py-1 rounded bg-surface-secondary border border-border">
              移动步数: <strong className="text-text-primary">{moves}</strong>
            </span>
          </div>

          <button
            onClick={() => startNewGame(dealNumber)}
            className="px-3 py-1 rounded border border-border bg-surface hover:bg-surface-secondary text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重打本局</span>
          </button>
        </div>

        {/* Top Free Cells & Foundations Area */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 4 Free Cells (Left) */}
          <div>
            <div className="text-xs font-semibold text-text-secondary mb-2 flex items-center justify-between">
              <span>空当暂存区 (4 格)</span>
              <span className="text-[11px] font-mono text-text-muted">单张中转</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              {freeCells.map((card, idx) => {
                const isSelected = selected?.type === 'free' && selected.freeIdx === idx
                return (
                  <button
                    key={idx}
                    onClick={() => handleFreeCellClick(idx)}
                    className={`h-24 sm:h-28 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-accent bg-accent-subtle shadow-md ring-2 ring-accent'
                        : card
                        ? 'bg-surface border-border hover:border-border-hover shadow-xs'
                        : 'border-dashed border-border bg-surface-secondary/40 hover:border-border-hover'
                    }`}
                  >
                    {card ? (
                      <div
                        className={`font-bold font-mono text-center ${
                          getCardColor(card) === 'red' ? 'text-danger' : 'text-text-primary'
                        }`}
                      >
                        <div className="text-sm sm:text-base">{card.rank}</div>
                        <div className="text-lg sm:text-xl leading-none mt-1">{card.suit}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted font-mono">空</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4 Foundations (Right) */}
          <div>
            <div className="text-xs font-semibold text-text-secondary mb-2 flex items-center justify-between">
              <span>目标回收区 (A 至 K)</span>
              <span className="text-[11px] font-mono text-text-muted">花色同向递增</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              {SUITS.map(suit => {
                const list = foundations[suit]
                const topCard = list.length > 0 ? list[list.length - 1] : null
                const isRed = suit === '♥' || suit === '♦'

                return (
                  <button
                    key={suit}
                    onClick={() => handleFoundationClick(suit)}
                    className="h-24 sm:h-28 rounded-xl border-2 border-dashed border-border bg-surface-secondary/40 hover:border-border-hover flex items-center justify-center shadow-inner transition cursor-pointer"
                  >
                    {topCard ? (
                      <div
                        className={`font-bold font-mono text-center ${
                          isRed ? 'text-danger' : 'text-text-primary'
                        }`}
                      >
                        <div className="text-sm sm:text-base">{topCard.rank}</div>
                        <div className="text-lg sm:text-xl leading-none mt-1">{topCard.suit}</div>
                      </div>
                    ) : (
                      <span
                        className={`text-2xl font-bold opacity-30 ${
                          isRed ? 'text-danger' : 'text-text-muted'
                        }`}
                      >
                        {suit}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Tableau Columns: 8 Cascades */}
        <div className="w-full">
          <div className="text-xs font-semibold text-text-secondary mb-2">主牌区：8 列交替顺牌</div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 min-h-[440px]">
            {columns.map((col, colIdx) => (
              <div
                key={colIdx}
                onClick={() => handleColumnClick(colIdx)}
                className="relative min-h-[380px] rounded-xl border border-dashed border-border bg-surface-secondary/25 p-1 flex flex-col items-center cursor-pointer hover:bg-surface-secondary/40 transition-colors"
              >
                {col.length === 0 ? (
                  <span className="text-[11px] text-text-muted font-mono mt-4">空列</span>
                ) : (
                  col.map((card, cardIdx) => {
                    const isPartOfSelection =
                      selected?.type === 'col' &&
                      selected.colIdx === colIdx &&
                      cardIdx >= selected.startIdx
                    const isRed = getCardColor(card) === 'red'

                    return (
                      <div
                        key={card.id}
                        onClick={e => {
                          e.stopPropagation()
                          handleColumnClick(colIdx, cardIdx)
                        }}
                        className={`w-full h-18 sm:h-20 rounded-lg border flex flex-col justify-between p-1.5 transition-all shadow-xs ${
                          isPartOfSelection
                            ? 'border-accent bg-accent-subtle ring-2 ring-accent z-20 -translate-y-0.5'
                            : 'border-border bg-surface hover:border-border-hover'
                        }`}
                        style={{
                          marginTop: cardIdx === 0 ? '0px' : '-44px',
                        }}
                      >
                        <div
                          className={`flex items-center justify-between text-xs font-bold font-mono ${
                            isRed ? 'text-danger' : 'text-text-primary'
                          }`}
                        >
                          <span>{card.rank}</span>
                          <span className="text-sm">{card.suit}</span>
                        </div>
                        <div
                          className={`text-center text-sm font-bold ${
                            isRed ? 'text-danger' : 'text-text-primary'
                          }`}
                        >
                          {card.suit}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Win Celebration Modal */}
      {isWon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="p-8 rounded-2xl border border-border bg-surface shadow-2xl text-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
            <Trophy className="w-14 h-14 mx-auto mb-3 text-warning" />
            <h2 className="text-2xl font-bold text-text-primary mb-1">恭喜通关！</h2>
            <p className="text-xs text-text-secondary mb-4">
              成功完成 FreeCell 牌局 #{dealNumber}，共消耗 {moves} 步
            </p>
            <button
              onClick={() => startNewGame()}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>开始下一局</span>
            </button>
          </div>
        </div>
      )}
    </GameLayout>
  )
}
