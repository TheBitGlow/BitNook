export type Suit = '♠' | '♥' | '♦' | '♣'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  suit: Suit
  rank: Rank
  id: string
}

export type Column = Card[]

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function getCardColor(c: Card): 'red' | 'black' {
  return c.suit === '♥' || c.suit === '♦' ? 'red' : 'black'
}

export function getCardValue(c: Card): number {
  return RANKS.indexOf(c.rank) + 1
}

/**
 * 经典 Microsoft FreeCell 编号牌局兼容的确定性 LCG 发牌算法
 * Produces deterministic deals #1 .. #32000 compatible with classic Windows FreeCell.
 */
export function generateMsFreeCellDeal(dealNumber: number): Column[] {
  const seed = Math.max(1, Math.floor(dealNumber))
  let state = seed

  const nextRand = (): number => {
    state = (Number((BigInt(state) * 214013n + 2531011n) & 0x7fffffffn))
    return (state >> 16) & 0x7fff
  }

  // Cards in MS order: Clubs (0..12), Diamonds (13..25), Hearts (26..38), Spades (39..51)
  const msSuits: Suit[] = ['♣', '♦', '♥', '♠']
  const deck: Card[] = []

  for (let s = 0; s < 4; s++) {
    for (let r = 0; r < 13; r++) {
      deck.push({
        suit: msSuits[s],
        rank: RANKS[r],
        id: `ms-${msSuits[s]}-${RANKS[r]}`,
      })
    }
  }

  // Shuffle 52 cards
  const remaining = [...deck]
  const shuffled: Card[] = []

  for (let i = 52; i > 0; i--) {
    const j = nextRand() % i
    shuffled.push(remaining[j])
    remaining[j] = remaining[i - 1]
  }

  // Deal into 8 columns
  const columns: Column[] = Array.from({ length: 8 }, () => [])
  for (let i = 0; i < 52; i++) {
    columns[i % 8].push({ ...shuffled[i], id: `c-${i + 1}-${shuffled[i].suit}-${shuffled[i].rank}` })
  }

  return columns
}

export function isValidSequence(cards: Card[]): boolean {
  if (cards.length <= 1) return true
  for (let i = 0; i < cards.length - 1; i++) {
    const cur = cards[i]
    const next = cards[i + 1]
    if (getCardColor(cur) === getCardColor(next)) return false
    if (getCardValue(cur) !== getCardValue(next) + 1) return false
  }
  return true
}

/**
 * FreeCell Capacity Theorem:
 * Maximum cards movable in a single sequence:
 * N = (1 + freeCells) * 2^(emptyColumns)
 * When moving to an empty column, the destination empty column is consumed,
 * so N = (1 + freeCells) * 2^(emptyColumns - 1).
 */
export function getMaxMovableCards(
  emptyFreeCells: number,
  emptyColumns: number,
  isMovingToEmptyColumn: boolean
): number {
  const effectiveEmptyCols = isMovingToEmptyColumn
    ? Math.max(0, emptyColumns - 1)
    : emptyColumns
  return (emptyFreeCells + 1) * Math.pow(2, effectiveEmptyCols)
}

export function canMoveCardToFoundation(
  card: Card,
  foundationTop: Card | null
): boolean {
  if (!foundationTop) {
    return card.rank === 'A'
  }
  return (
    card.suit === foundationTop.suit &&
    getCardValue(card) === getCardValue(foundationTop) + 1
  )
}

export function isFreecellGameWon(foundations: Record<Suit, Card[]>): boolean {
  for (const s of SUITS) {
    if (foundations[s].length !== 13) return false
  }
  return true
}

/**
  * 经典微软 FreeCell 编号 #1 ~ #32000 中，已被数学严格证明为不可解的局号只有 #11982
  */
export const KNOWN_UNSOLVABLE_DEALS = [11982] as const

export function isKnownUnsolvableDeal(dealNumber: number): boolean {
  return dealNumber === 11982
}
