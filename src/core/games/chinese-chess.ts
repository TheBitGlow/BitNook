export type Color = 'red' | 'black'
export type Piece = string | null
export type Board = Piece[][]
export type Pos = { r: number; c: number }

export const ROWS = 10
export const COLS = 9

export const PIECE_CHAR: Record<string, string> = {
  r: '車', n: '馬', b: '相', a: '仕', k: '將', c: '炮', p: '卒',
  R: '車', N: '馬', B: '相', A: '仕', K: '帥', C: '炮', P: '兵',
}

export const INIT_CHINESE_BOARD: Board = [
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

export function isRedPiece(p: Piece): boolean {
  return Boolean(p && p === p.toUpperCase())
}

export function isInPalace(r: number, c: number, red: boolean): boolean {
  if (c < 3 || c > 5) return false
  if (red) return r >= 7 && r <= 9
  return r >= 0 && r <= 2
}

export function isInTerritory(r: number, red: boolean): boolean {
  if (red) return r >= 5
  return r <= 4
}

export function cloneBoard(b: Board): Board {
  return b.map(row => [...row])
}

export function findKing(b: Board, red: boolean): Pos | null {
  const target = red ? 'K' : 'k'
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (b[r][c] === target) return { r, c }
    }
  }
  return null
}

export function kingsFace(b: Board): boolean {
  const redKing = findKing(b, true)
  const blackKing = findKing(b, false)
  if (!redKing || !blackKing || redKing.c !== blackKing.c) return false

  for (let r = blackKing.r + 1; r < redKing.r; r++) {
    if (b[r][blackKing.c]) return false
  }
  return true
}

export function genRawMoves(b: Board, r: number, c: number): Pos[] {
  const p = b[r]?.[c]
  if (!p) return []
  const moves: Pos[] = []
  const red = isRedPiece(p)
  const pt = p.toLowerCase()

  const tryA = (nr: number, nc: number) => {
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      const t = b[nr]?.[nc]
      if (t ? isRedPiece(t) !== red : true) moves.push({ r: nr, c: nc })
    }
  }

  switch (pt) {
    case 'k': {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc
        if (isInPalace(nr, nc, red)) tryA(nr, nc)
      })
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
        if (!b[Math.round(mr)]?.[Math.round(mc)] && nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && isInTerritory(nr, red)) {
          tryA(nr, nc)
        }
      })
      break
    }
    case 'n': {
      [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc
        const legR = Math.abs(dr) === 2 ? r + Math.sign(dr) : r
        const legC = Math.abs(dr) === 2 ? c : c + Math.sign(dc)
        if (!b[legR]?.[legC] && nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          tryA(nr, nc)
        }
      })
      break
    }
    case 'r': {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          tryA(nr, nc)
          if (b[nr]?.[nc]) break
          nr += dr
          nc += dc
        }
      })
      break
    }
    case 'c': {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc
        let j = false
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          if (b[nr]?.[nc]) {
            if (j) {
              tryA(nr, nc)
              break
            }
            j = true
          } else if (!j) {
            tryA(nr, nc)
          }
          nr += dr
          nc += dc
        }
      })
      break
    }
    case 'p': {
      const fr = red ? -1 : 1
      tryA(r + fr, c)
      if ((red && r <= 4) || (!red && r >= 5)) {
        tryA(r, c - 1)
        tryA(r, c + 1)
      }
      break
    }
  }
  return moves
}

export function isKingInCheck(b: Board, red: boolean): boolean {
  const kp = findKing(b, red)
  if (!kp) return true
  if (kingsFace(b)) return true

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r]?.[c]
      if (p && isRedPiece(p) !== red) {
        const ms = genRawMoves(b, r, c)
        if (ms.some(m => m.r === kp.r && m.c === kp.c)) return true
      }
    }
  }
  return false
}

export interface XiangqiMove {
  from: Pos
  to: Pos
}

export function getLegalMoves(board: Board, red: boolean): XiangqiMove[] {
  const moves: XiangqiMove[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r]?.[c]
      if (!p || isRedPiece(p) !== red) continue
      const from = { r, c }
      const rawMoves = genRawMoves(board, r, c)
      for (const to of rawMoves) {
        const nb = cloneBoard(board)
        const pc = nb[from.r][from.c]
        nb[to.r][to.c] = pc
        nb[from.r][from.c] = null
        // Move is only legal if own king is NOT left in check and kings do not face
        if (!isKingInCheck(nb, red)) {
          moves.push({ from, to })
        }
      }
    }
  }
  return moves
}

export type XiangqiGameStatus = 'ongoing' | 'check' | 'checkmate' | 'stalemate'

export function getGameStatus(board: Board, red: boolean): {
  status: XiangqiGameStatus
  winner?: Color
} {
  const legalMoves = getLegalMoves(board, red)
  const inCheck = isKingInCheck(board, red)

  if (legalMoves.length === 0) {
    // If no legal moves:
    // in check -> Checkmate (将死)
    // not in check -> Stalemate / Trapped (困毙) - in Xiangqi, trapped player LOSES!
    return {
      status: inCheck ? 'checkmate' : 'stalemate',
      winner: red ? 'black' : 'red',
    }
  }

  if (inCheck) {
    return { status: 'check' }
  }

  return { status: 'ongoing' }
}
