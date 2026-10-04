'use client'

import { useState, useCallback, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Spade, RotateCcw, Play, Check } from 'lucide-react'

type Suit = '♠' | '♥' | '♦' | '♣'
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
type Card = { suit: Suit; rank: Rank; id: string } | null
type Column = Card[]

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

let cardIdCounter = 0
const createDeck = (): Card[] => {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `card-${cardIdCounter++}` })
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

const getColor = (card: Card): 'red' | 'black' | null => {
  if (!card) return null
  return card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'
}

const getValue = (card: Card): number => {
  if (!card) return 0
  return RANKS.indexOf(card.rank) + 1
}

export default function FreecellPage() {
  const [columns, setColumns] = useState<Column[]>([])
  const [foundations, setFoundations] = useState<{ [key: string]: Card[] }>({
    '♠': [], '♥': [], '♦': [], '♣': []
  })
  const [freeCells, setFreeCells] = useState<(Card | null)[]>([null, null, null, null])
  const [selected, setSelected] = useState<{ type: 'col' | 'free'; col?: number; index?: number; freeIndex?: number } | null>(null)
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  const initGame = useCallback(() => {
    const deck = createDeck()
    const cols: Column[] = [[], [], [], [], [], [], [], []]
    for (let i = 0; i < 52; i++) {
      cols[i % 8].push(deck[i])
    }
    setColumns(cols)
    setFoundations({ '♠': [], '♥': [], '♦': [], '♣': [] })
    setFreeCells([null, null, null, null])
    setSelected(null)
    setMoves(0)
    setWon(false)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    const totalInFoundations = Object.values(foundations).flat().length
    if (totalInFoundations === 52 && !won) {
      setWon(true)
    }
  }, [foundations, won])

  const canMoveToFoundation = (card: Card, suit: Suit): boolean => {
    if (!card) return false
    const foundation = foundations[suit]
    if (card.suit !== suit) return false
    if (foundation.length === 0) return card.rank === 'A'
    const topCard = foundation[foundation.length - 1]
    return topCard ? getValue(card) === getValue(topCard) + 1 : false
  }

  const canMoveToColumn = (card: Card, targetCol: Column): boolean => {
    if (!card) return false
    if (targetCol.length === 0) return true
    const topCard = targetCol[targetCol.length - 1]
    if (!topCard) return true
    return getColor(card) !== getColor(topCard) && getValue(card) === getValue(topCard) - 1
  }

  const handleColumnClick = (colIndex: number, cardIndex: number) => {
    if (won) return

    if (selected) {
      const { type, col: srcCol, index: srcIndex, freeIndex } = selected
      const isTargetTopOrEmpty = columns[colIndex].length === 0 || cardIndex === columns[colIndex].length - 1

      if (type === 'col' && srcCol !== undefined && srcIndex !== undefined) {
        const card = columns[srcCol][srcIndex]
        if (!card || srcIndex !== columns[srcCol].length - 1) {
          setSelected(null)
          return
        }

        if (canMoveToColumn(card, columns[colIndex]) && isTargetTopOrEmpty) {
          const newCols = columns.map(c => [...c])
          const [cardToMove] = newCols[srcCol].splice(srcIndex, 1)
          newCols[colIndex].push(cardToMove)
          setColumns(newCols)
          setMoves(m => m + 1)
          setSelected(null)
          return
        }
      } else if (type === 'free' && freeIndex !== undefined) {
        const card = freeCells[freeIndex]
        if (!card) {
          setSelected(null)
          return
        }

        // Try to move to foundation
        if (canMoveToFoundation(card, card.suit)) {
          const newFreeCells = [...freeCells]
          newFreeCells[freeIndex] = null
          setFoundations(prev => ({
            ...prev,
            [card.suit]: [...prev[card.suit], card]
          }))
          setFreeCells(newFreeCells)
          setMoves(m => m + 1)
          setSelected(null)
          return
        }

        if (canMoveToColumn(card, columns[colIndex]) && isTargetTopOrEmpty) {
          const newFreeCells = [...freeCells]
          newFreeCells[freeIndex] = null
          const newCols = columns.map(c => [...c])
          newCols[colIndex].push(card)
          setFreeCells(newFreeCells)
          setColumns(newCols)
          setMoves(m => m + 1)
          setSelected(null)
          return
        }
      }

      setSelected(null)
    } else {
      const col = columns[colIndex]
      if (cardIndex === col.length - 1) {
        setSelected({ type: 'col', col: colIndex, index: cardIndex })
      }
    }
  }

  const handleFoundationClick = (suit: Suit) => {
    if (!selected || won) return

    if (selected.type === 'col' && selected.col !== undefined && selected.index !== undefined) {
      const card = columns[selected.col][selected.index]
      if (!card || selected.index !== columns[selected.col].length - 1 || !canMoveToFoundation(card, suit)) {
        setSelected(null)
        return
      }

      const newCols = columns.map(c => [...c])
      newCols[selected.col].splice(selected.index, 1)
      setFoundations(prev => ({ ...prev, [suit]: [...prev[suit], card] }))
      setColumns(newCols)
      setMoves(m => m + 1)
      setSelected(null)
      return
    }

    if (selected.type === 'free' && selected.freeIndex !== undefined) {
      const card = freeCells[selected.freeIndex]
      if (!card || !canMoveToFoundation(card, suit)) {
        setSelected(null)
        return
      }

      const newFreeCells = [...freeCells]
      newFreeCells[selected.freeIndex] = null
      setFoundations(prev => ({ ...prev, [suit]: [...prev[suit], card] }))
      setFreeCells(newFreeCells)
      setMoves(m => m + 1)
      setSelected(null)
    }
  }

  const handleFreeCellClick = (freeIndex: number) => {
    if (won) return

    if (selected && selected.type === 'col' && selected.col !== undefined && selected.index !== undefined) {
      const card = columns[selected.col][selected.index]
      if (!card || selected.index !== columns[selected.col].length - 1) {
        setSelected(null)
        return
      }

      if (freeCells[freeIndex] === null) {
        const newCols = columns.map(c => [...c])
        newCols[selected.col].splice(selected.index, 1)
        setColumns(newCols)
        const newFreeCells = [...freeCells]
        newFreeCells[freeIndex] = card
        setFreeCells(newFreeCells)
        setMoves(m => m + 1)
        setSelected(null)
      } else {
        setSelected(null)
      }
    } else if (freeCells[freeIndex]) {
      setSelected({ type: 'free', freeIndex })
    }
  }

  const autoComplete = () => {
    // 一次性计算所有可以移动到foundation的牌
    const newCols = columns.map(c => [...c])
    const newFoundations = { ...foundations }
    const newFreeCells = [...freeCells]
    let moved = true

    while (moved) {
      moved = false
      // Move Aces to foundations
      for (let c = 0; c < 8; c++) {
        const col = newCols[c]
        const card = col[col.length - 1]
        if (card && card.rank === 'A' && newFoundations[card.suit].length === 0) {
          newCols[c] = col.slice(0, -1)
          newFoundations[card.suit] = [...newFoundations[card.suit], card]
          moved = true
        }
      }

      // Move other cards to foundations if possible
      for (let c = 0; c < 8; c++) {
        const col = newCols[c]
        const card = col[col.length - 1]
        if (card) {
          const foundation = newFoundations[card.suit]
          const canMove = foundation.length === 0
            ? card.rank === 'A'
            : getValue(card) === getValue(foundation[foundation.length - 1]) + 1
          if (canMove) {
            newCols[c] = col.slice(0, -1)
            newFoundations[card.suit] = [...newFoundations[card.suit], card]
            moved = true
          }
        }
      }

      // Move from free cells to foundations
      for (let f = 0; f < 4; f++) {
        const card = newFreeCells[f]
        if (!card) continue
        const foundation = newFoundations[card.suit]
        const canMove = foundation.length === 0
          ? card.rank === 'A'
          : getValue(card) === getValue(foundation[foundation.length - 1]) + 1
        if (canMove) {
          newFreeCells[f] = null
          newFoundations[card.suit] = [...newFoundations[card.suit], card]
          moved = true
        }
      }
    }

    setColumns(newCols)
    setFoundations(newFoundations)
    setFreeCells(newFreeCells)
  }

  const getHint = () => {
    // 找最佳提示
    // 1. 优先移动可以放到foundation的牌
    for (let c = 0; c < 8; c++) {
      const col = columns[c]
      const card = col[col.length - 1]
      if (card && canMoveToFoundation(card, card.suit)) {
        return { from: { type: 'col' as const, col: c, index: col.length - 1 }, message: `将${card.rank}${card.suit}移动到回收区` }
      }
    }

    // 2. 从freecell找
    for (let f = 0; f < 4; f++) {
      const card = freeCells[f]
      if (card && canMoveToFoundation(card, card.suit)) {
        return { from: { type: 'free' as const, freeIndex: f }, message: `将${card.rank}${card.suit}从空位移动到回收区` }
      }
    }

    // 3. 找可以移动到空列的牌
    for (let c = 0; c < 8; c++) {
      if (columns[c].length === 0) {
        // 找最大的一张牌放到空列
        let maxCard: { card: typeof columns[0][0]; index: number; srcCol: number } | null = null
        for (let cc = 0; cc < 8; cc++) {
          if (cc === c) continue
          const col = columns[cc]
          const card = col[col.length - 1]
          if (card && (!maxCard || getValue(card) > getValue(maxCard.card!))) {
            maxCard = { card, index: col.length - 1, srcCol: cc }
          }
        }
        if (maxCard && maxCard.card) {
          return { from: { type: 'col' as const, col: maxCard.srcCol, index: maxCard.index }, message: `将${maxCard.card.rank}${maxCard.card.suit}移动到第${c + 1}列(空列)` }
        }
      }
    }

    // 4. 提示列间移动
    for (let c = 0; c < 8; c++) {
      const col = columns[c]
      const card = col[col.length - 1]
      if (!card) continue
      for (let tc = 0; tc < 8; tc++) {
        if (tc === c) continue
        if (canMoveToColumn(card, columns[tc])) {
          return { from: { type: 'col' as const, col: c, index: col.length - 1 }, message: `将${card.rank}${card.suit}移动到第${tc + 1}列` }
        }
      }
    }

    return { from: null, message: '没有找到提示' }
  }

  const [hint, setHint] = useState<{ from: any; message: string } | null>(null)

  const renderCard = (card: Card, onClick: () => void) => {
    if (!card) return null
    const isRed = getColor(card) === 'red'

    return (
      <div
        onClick={onClick}
        className={`w-14 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
          selected ? 'ring-2 ring-[#F59E0B]' : ''
        }`}
        style={{
          backgroundColor: isRed ? '#FEE2E2' : '#F8FAFC',
          color: isRed ? '#DC2626' : '#1E293B',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          border: isRed ? '2px solid #FECACA' : '2px solid #CBD5E1'
        }}
      >
        <span className="text-sm font-bold self-start ml-1">{card.rank}</span>
        <span className="text-2xl">{card.suit}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
                <Spade className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <h1 className="text-2xl font-bold text-white">空当接龙</h1>
            </div>
            <p className="text-[#94A3B8]">纸牌接龙挑战</p>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <span className="text-[#94A3B8]">步数: {moves}</span>
              <span className="text-[#94A3B8]">
                完成: {Object.values(foundations).flat().length}/52
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={initGame}
                className="px-4 py-2 bg-[#06B6D4] text-white rounded-lg hover:bg-[#0891b2] flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                开始
              </button>
              <button
                onClick={() => { setHint(getHint()); setTimeout(() => setHint(null), 3000) }}
                className="px-4 py-2 bg-[#111827] border border-[rgba(99,102,241,0.3)] text-[#94A3B8] rounded-lg hover:text-white"
              >
                提示
              </button>
              <button
                onClick={autoComplete}
                className="px-4 py-2 bg-[#111927] border border-[rgba(99,102,241,0.3)] text-[#94A3B8] rounded-lg hover:text-white"
              >
                自动完成
              </button>
            </div>
          </div>

          {/* Hint Display */}
          {hint && (
            <div className="mb-4 p-3 bg-[#F59E0B]/20 border border-[#F59E0B]/40 rounded-lg">
              <p className="text-[#F59E0B] text-sm font-medium">{hint.message}</p>
            </div>
          )}

          {/* Foundations */}
          <div className="flex gap-2 mb-4">
            {SUITS.map(suit => (
              <div
                key={suit}
                onClick={() => handleFoundationClick(suit)}
                className="w-14 h-20 rounded-lg flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: '#1A2235',
                  border: '2px dashed rgba(99,102,241,0.2)'
                }}
              >
                {foundations[suit].length > 0 && (() => {
                  const topCard = foundations[suit][foundations[suit].length - 1]
                  const isRedSuit = suit === '♥' || suit === '♦'
                  return topCard ? (
                    <div className="text-center">
                      <span className="text-2xl font-bold" style={{ color: isRedSuit ? '#DC2626' : '#1E293B' }}>
                        {topCard.rank}
                      </span>
                      <span className="text-2xl" style={{ color: isRedSuit ? '#DC2626' : '#1E293B' }}>
                        {suit}
                      </span>
                    </div>
                  ) : null
                })()}
                {foundations[suit].length === 0 && (
                  <span style={{ color: suit === '♥' || suit === '♦' ? '#DC262680' : '#47556980' }}>
                    {suit}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Free Cells */}
          <div className="flex gap-2 mb-4">
            <span className="text-[#94A3B8] text-sm self-center mr-2">空位:</span>
            {freeCells.map((card, i) => (
              <div
                key={i}
                onClick={() => handleFreeCellClick(i)}
                className="cursor-pointer"
              >
                {card ? (
                  <div
                    className="w-14 h-20 rounded-lg flex flex-col items-center justify-center"
                    style={{
                      backgroundColor: getColor(card) === 'red' ? '#FEE2E2' : '#F8FAFC',
                      color: getColor(card) === 'red' ? '#DC2626' : '#1E293B',
                      border: getColor(card) === 'red' ? '2px solid #FECACA' : '2px solid #CBD5E1'
                    }}
                  >
                    <span className="text-sm font-bold self-start ml-1">{card.rank}</span>
                    <span className="text-2xl">{card.suit}</span>
                  </div>
                ) : (
                  <div
                    className="w-14 h-20 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: '#111827',
                      border: '1px dashed rgba(99,102,241,0.2)'
                    }}
                  >
                    <span className="text-[#475569]">+</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Game Board */}
          <div className="glass-card p-4">
            {columns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#475569] mb-4">点击开始按钮开始游戏</p>
                <button
                  onClick={initGame}
                  className="px-6 py-3 bg-[#06B6D4] text-white rounded-xl hover:bg-[#0891b2]"
                >
                  开始游戏
                </button>
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-4">
                {columns.map((col, colIndex) => (
                  <div
                    key={colIndex}
                    className="flex flex-col gap-1 min-w-[60px]"
                  >
                    {col.map((card, cardIndex) => (
                      <div
                        key={card?.id || `${colIndex}-${cardIndex}`}
                        onClick={() => handleColumnClick(colIndex, cardIndex)}
                      >
                        {renderCard(card, () => {})}
                      </div>
                    ))}
                    {col.length === 0 && (
                      <div
                        className="w-14 h-20 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: '#111827',
                          border: '1px dashed rgba(99,102,241,0.2)'
                        }}
                        onClick={() => handleColumnClick(colIndex, 0)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Win */}
          {won && (
            <div className="mt-6 glass-card p-6 text-center">
              <Check className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#10B981] mb-2">恭喜通关！</h2>
              <p className="text-[#94A3B8]">共用 {moves} 步完成</p>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-[#111927]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">规则：</span>
              点击选中纸牌，再次点击目标位置移动。拖动A到顶部区域，按花色从A到K排列。下方空位可临时存放纸牌。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
