'use client'

import { useState, useCallback, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import { RotateCcw, Undo2, Sparkles, CheckCircle2, Play } from 'lucide-react'

type Suit = '♠' | '♥' | '♦' | '♣'
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

interface Card {
  suit: Suit
  rank: Rank
  id: string
}

type Column = Card[]

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

let cardIdSeq = 0
function createShuffledDeck(): Card[] {
  const deck: Card[] = []
  for (const s of SUITS) {
    for (const r of RANKS) {
      deck.push({ suit: s, rank: r, id: `c-${++cardIdSeq}` })
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function dealColumns(deck: Card[]): Column[] {
  const cols: Column[] = Array.from({ length: 8 }, () => [])
  for (let i = 0; i < 52; i++) {
    cols[i % 8].push(deck[i])
  }
  return cols
}

function getCardColor(c: Card): 'red' | 'black' {
  return c.suit === '♥' || c.suit === '♦' ? 'red' : 'black'
}

function getCardValue(c: Card): number {
  return RANKS.indexOf(c.rank) + 1
}

// Verify if a slice from idx to end of column forms a descending alternating sequence
function isValidSequence(col: Column, startIdx: number): boolean {
  for (let i = startIdx; i < col.length - 1; i++) {
    const cur = col[i]
    const next = col[i + 1]
    if (getCardColor(cur) === getCardColor(next)) return false
    if (getCardValue(cur) !== getCardValue(next) + 1) return false
  }
  return true
}

interface GameState {
  columns: Column[]
  foundations: Record<Suit, Card[]>
  freeCells: (Card | null)[]
  moves: number
}

export default function FreeCellPage() {
  const [columns, setColumns] = useState<Column[]>(() => dealColumns(createShuffledDeck()))
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

  // Win condition: all 52 cards are gathered in foundations
  const isWon = useMemo(() => {
    return Object.values(foundations).every((f) => f.length === 13)
  }, [foundations])

  // Save snapshot to history
  const pushHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev.slice(-25), // keep last 25 moves
      {
        columns: columns.map((c) => [...c]),
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

  // Start new game
  const startNewGame = useCallback(() => {
    setColumns(dealColumns(createShuffledDeck()))
    setFoundations({ '♠': [], '♥': [], '♦': [], '♣': [] })
    setFreeCells([null, null, null, null])
    setMoves(0)
    setSelected(null)
    setHistory([])
  }, [])

  // Undo move
  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setColumns(prev.columns)
    setFoundations(prev.foundations)
    setFreeCells(prev.freeCells)
    setMoves(prev.moves)
    setSelected(null)
    setHistory((h) => h.slice(0, -1))
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
        // Move from one freecell to empty freecell
        pushHistory()
        const newFree = [...freeCells]
        newFree[idx] = newFree[selected.freeIdx]
        newFree[selected.freeIdx] = null
        setFreeCells(newFree)
        setMoves((m) => m + 1)
        setSelected(null)
      } else {
        setSelected({ type: 'free', freeIdx: idx })
      }
      return
    }

    // Moving from column to freecell (only single top card allowed)
    if (selected.type === 'col') {
      const col = columns[selected.colIdx]
      if (selected.startIdx === col.length - 1 && freeCells[idx] === null) {
        pushHistory()
        const newCols = columns.map((c) => [...c])
        const [movedCard] = newCols[selected.colIdx].splice(selected.startIdx, 1)
        const newFree = [...freeCells]
        newFree[idx] = movedCard

        setColumns(newCols)
        setFreeCells(newFree)
        setMoves((m) => m + 1)
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
    const nextVal = foundation.length === 0 ? 1 : getCardValue(foundation[foundation.length - 1]) + 1

    if (selected.type === 'free') {
      const card = freeCells[selected.freeIdx]
      if (card && card.suit === suit && getCardValue(card) === nextVal) {
        pushHistory()
        const newFree = [...freeCells]
        newFree[selected.freeIdx] = null
        setFreeCells(newFree)
        setFoundations((f) => ({ ...f, [suit]: [...f[suit], card] }))
        setMoves((m) => m + 1)
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
        if (card.suit === suit && getCardValue(card) === nextVal) {
          pushHistory()
          const newCols = columns.map((c) => [...c])
          const [movedCard] = newCols[selected.colIdx].splice(selected.startIdx, 1)
          setColumns(newCols)
          setFoundations((f) => ({ ...f, [suit]: [...f[suit], movedCard] }))
          setMoves((m) => m + 1)
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
      if (isValidSequence(col, startIdx)) {
        setSelected({ type: 'col', colIdx: targetColIdx, startIdx })
      }
      return
    }

    // Attempting move to target column
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
        canPlace = getCardColor(card) !== getCardColor(topCard) && getCardValue(card) === getCardValue(topCard) - 1
      }

      if (canPlace) {
        pushHistory()
        const newFree = [...freeCells]
        newFree[selected.freeIdx] = null
        const newCols = columns.map((c) => [...c])
        newCols[targetColIdx].push(card)

        setFreeCells(newFree)
        setColumns(newCols)
        setMoves((m) => m + 1)
        setSelected(null)
      } else {
        setSelected(null)
      }
      return
    }

    if (selected.type === 'col') {
      const srcColIdx = selected.colIdx
      const startIdx = selected.startIdx

      // Same column re-selection or cancellation
      if (srcColIdx === targetColIdx) {
        setSelected(null)
        return
      }

      const srcCol = columns[srcColIdx]
      const targetCol = columns[targetColIdx]
      const sequenceToMove = srcCol.slice(startIdx)
      const count = sequenceToMove.length
      const baseCard = sequenceToMove[0]

      // Windows Freecell sequence move capacity theorem:
      // Max = (emptyFreeCells + 1) * 2^(emptyColumns)
      // Note: If target column is empty, it does not count towards 2^(emptyColumns).
      const emptyFreeCells = freeCells.filter((c) => c === null).length
      let emptyColsCount = 0
      for (let i = 0; i < 8; i++) {
        if (i !== srcColIdx && i !== targetColIdx && columns[i].length === 0) {
          emptyColsCount++
        }
      }

      const maxMovable = (emptyFreeCells + 1) * Math.pow(2, emptyColsCount)

      let canPlace = false
      if (targetCol.length === 0) {
        canPlace = true
      } else {
        const topCard = targetCol[targetCol.length - 1]
        canPlace =
          getCardColor(baseCard) !== getCardColor(topCard) &&
          getCardValue(baseCard) === getCardValue(topCard) - 1
      }

      if (canPlace && count <= maxMovable) {
        pushHistory()
        const newCols = columns.map((c) => [...c])
        const movedCards = newCols[srcColIdx].splice(startIdx, count)
        newCols[targetColIdx].push(...movedCards)

        setColumns(newCols)
        setMoves((m) => m + 1)
        setSelected(null)
      } else {
        // Can't place or exceeds limit; switch selection if valid
        const col = columns[targetColIdx]
        if (col.length > 0) {
          const clickIdx = cardIdx !== undefined ? cardIdx : col.length - 1
          if (isValidSequence(col, clickIdx)) {
            setSelected({ type: 'col', colIdx: targetColIdx, startIdx: clickIdx })
            return
          }
        }
        setSelected(null)
      }
    }
  }

  // Automatic foundation collector (Aces & safe cards)
  const handleAutoCollect = () => {
    let changed = false
    let curCols = columns.map((c) => [...c])
    let curFoundations = { ...foundations }
    let curFree = [...freeCells]

    let pass = true
    while (pass) {
      pass = false

      // 1. Check freecells
      for (let i = 0; i < 4; i++) {
        const card = curFree[i]
        if (card) {
          const targetFoundation = curFoundations[card.suit]
          const nextVal = targetFoundation.length === 0 ? 1 : getCardValue(targetFoundation[targetFoundation.length - 1]) + 1
          if (getCardValue(card) === nextVal) {
            curFoundations = { ...curFoundations, [card.suit]: [...curFoundations[card.suit], card] }
            curFree[i] = null
            changed = true
            pass = true
          }
        }
      }

      // 2. Check top card of each column
      for (let c = 0; c < 8; c++) {
        const col = curCols[c]
        if (col.length > 0) {
          const card = col[col.length - 1]
          const targetFoundation = curFoundations[card.suit]
          const nextVal = targetFoundation.length === 0 ? 1 : getCardValue(targetFoundation[targetFoundation.length - 1]) + 1
          if (getCardValue(card) === nextVal) {
            curFoundations = { ...curFoundations, [card.suit]: [...curFoundations[card.suit], card] }
            curCols[c].pop()
            changed = true
            pass = true
          }
        }
      }
    }

    if (changed) {
      pushHistory()
      setColumns(curCols)
      setFoundations(curFoundations)
      setFreeCells(curFree)
      setMoves((m) => m + 1)
      setSelected(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Title & Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400">♠️</span>
              <span>经典空当接龙 (FreeCell)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              经典 Windows 规则 · 真多张顺牌批量移动算法 · 一键智能回收 · 悔棋支持
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              步数: <strong className="text-white">{moves}</strong>
            </span>
            <button
              onClick={handleAutoCollect}
              disabled={isWon}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="自动将符合要求的卡牌收集至回收区"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>自动回收</span>
            </button>
            <button
              onClick={handleUndo}
              disabled={history.length === 0 || isWon}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>悔棋</span>
            </button>
            <button
              onClick={startNewGame}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>新牌局</span>
            </button>
          </div>
        </div>

        {/* FreeCell Table Container */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl flex flex-col items-center select-none">
          {/* Top Row: 4 Free Cells + 4 Foundations */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 4 Free Cells (Top-Left) */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">左上：空当暂存区 (4格)</span>
              <div className="grid grid-cols-4 gap-2.5">
                {freeCells.map((card, idx) => {
                  const isSelected = selected?.type === 'free' && selected.freeIdx === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => handleFreeCellClick(idx)}
                      className={`h-24 sm:h-28 rounded-xl border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-indigo-400 bg-indigo-950/60 shadow-lg ring-2 ring-indigo-400'
                          : card
                          ? 'bg-slate-950 border-slate-700 shadow-md'
                          : 'border-dashed border-slate-800 bg-slate-950/40 hover:border-slate-700'
                      }`}
                    >
                      {card ? (
                        <div
                          className={`font-bold font-mono text-center ${
                            getCardColor(card) === 'red' ? 'text-rose-500' : 'text-slate-100'
                          }`}
                        >
                          <div className="text-base">{card.rank}</div>
                          <div className="text-xl">{card.suit}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-700 font-mono">空</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 4 Foundations (Top-Right) */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">右上：目标回收区 (A至K)</span>
              <div className="grid grid-cols-4 gap-2.5">
                {SUITS.map((suit) => {
                  const list = foundations[suit]
                  const topCard = list.length > 0 ? list[list.length - 1] : null
                  const isRed = suit === '♥' || suit === '♦'

                  return (
                    <button
                      key={suit}
                      onClick={() => handleFoundationClick(suit)}
                      className="h-24 sm:h-28 rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/40 hover:border-slate-700 flex items-center justify-center shadow-inner transition"
                    >
                      {topCard ? (
                        <div
                          className={`font-bold font-mono text-center ${isRed ? 'text-rose-500' : 'text-slate-100'}`}
                        >
                          <div className="text-base">{topCard.rank}</div>
                          <div className="text-xl">{topCard.suit}</div>
                        </div>
                      ) : (
                        <span
                          className={`text-2xl font-bold opacity-30 ${isRed ? 'text-rose-500' : 'text-slate-400'}`}
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

          {/* Bottom Columns: 8 Cascades */}
          <div className="w-full">
            <span className="text-xs font-semibold text-slate-400 block mb-2">主牌区：8列递减顺牌</span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 min-h-[420px]">
              {columns.map((col, colIdx) => {
                return (
                  <div
                    key={colIdx}
                    onClick={() => handleColumnClick(colIdx)}
                    className="relative min-h-[380px] rounded-xl border border-dashed border-slate-800/80 bg-slate-950/20 p-1 flex flex-col items-center cursor-pointer"
                  >
                    {col.length === 0 ? (
                      <span className="text-[11px] text-slate-700 mt-4">空列</span>
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleColumnClick(colIdx, cardIdx)
                            }}
                            className={`w-full h-12 rounded-lg border px-2 py-1 flex items-center justify-between transition-all select-none ${
                              isPartOfSelection
                                ? 'bg-indigo-950 border-indigo-400 ring-2 ring-indigo-400 z-20 brightness-110 shadow-lg'
                                : 'bg-slate-950 border-slate-700/80 shadow-sm hover:border-slate-500'
                            }`}
                            style={{
                              marginTop: cardIdx === 0 ? 0 : '-18px',
                              zIndex: isPartOfSelection ? 20 + cardIdx : cardIdx,
                            }}
                          >
                            <span className={`font-mono font-bold text-xs ${isRed ? 'text-rose-500' : 'text-slate-100'}`}>
                              {card.rank}
                            </span>
                            <span className={`text-sm ${isRed ? 'text-rose-500' : 'text-slate-100'}`}>
                              {card.suit}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Victory Overlay */}
          {isWon && (
            <div className="mt-6 p-6 rounded-2xl bg-emerald-950/70 border-2 border-emerald-500 text-center space-y-2 animate-fadeIn">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-white">恭喜胜利通关！</h3>
              <p className="text-xs text-slate-300">
                完美归位全部 52 张扑克牌，共用步数：<span className="font-mono font-bold text-white">{moves}</span>
              </p>
              <button
                onClick={startNewGame}
                className="mt-3 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition"
              >
                再开一局
              </button>
            </div>
          )}
        </div>

        {/* Non-intrusive AdSlot */}
        <AdSlot placement="tool-bottom" className="mt-8" />
      </main>

      <Footer />
    </div>
  )
}
