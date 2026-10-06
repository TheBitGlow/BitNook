export type ChessColor = 'white' | 'black'
export type ChessPieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'

export interface ChessPiece {
  type: ChessPieceType
  color: ChessColor
}

export type ChessBoard = (ChessPiece | null)[][]
export type Pos = { r: number; c: number }

export interface CastlingRights {
  whiteKingside: boolean
  whiteQueenside: boolean
  blackKingside: boolean
  blackQueenside: boolean
}

export interface ChessMove {
  from: Pos
  to: Pos
  promotionType?: ChessPieceType
}

export const INITIAL_CHESS_BOARD: ChessBoard = [
  [
    { type: 'r', color: 'black' },
    { type: 'n', color: 'black' },
    { type: 'b', color: 'black' },
    { type: 'q', color: 'black' },
    { type: 'k', color: 'black' },
    { type: 'b', color: 'black' },
    { type: 'n', color: 'black' },
    { type: 'r', color: 'black' },
  ],
  Array(8).fill(null).map(() => ({ type: 'p', color: 'black' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p', color: 'white' })),
  [
    { type: 'r', color: 'white' },
    { type: 'n', color: 'white' },
    { type: 'b', color: 'white' },
    { type: 'q', color: 'white' },
    { type: 'k', color: 'white' },
    { type: 'b', color: 'white' },
    { type: 'n', color: 'white' },
    { type: 'r', color: 'white' },
  ],
]

export function cloneChessBoard(board: ChessBoard): ChessBoard {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)))
}

export function findChessKing(board: ChessBoard, color: ChessColor): Pos | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (p && p.type === 'k' && p.color === color) {
        return { r, c }
      }
    }
  }
  return null
}

export function isSquareAttacked(
  board: ChessBoard,
  pos: Pos,
  byColor: ChessColor
): boolean {
  const { r, c } = pos

  // 1. Pawn attacks
  const pawnDir = byColor === 'white' ? 1 : -1
  const pawnFromR = r + pawnDir
  if (pawnFromR >= 0 && pawnFromR < 8) {
    if (c - 1 >= 0) {
      const p = board[pawnFromR][c - 1]
      if (p && p.type === 'p' && p.color === byColor) return true
    }
    if (c + 1 < 8) {
      const p = board[pawnFromR][c + 1]
      if (p && p.type === 'p' && p.color === byColor) return true
    }
  }

  // 2. Knight attacks
  const knightDeltas = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ]
  for (const [dr, dc] of knightDeltas) {
    const nr = r + dr
    const nc = c + dc
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc]
      if (p && p.type === 'n' && p.color === byColor) return true
    }
  }

  // 3. Bishop / Queen diagonal attacks
  const diagDeltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  for (const [dr, dc] of diagDeltas) {
    let nr = r + dr
    let nc = c + dc
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc]
      if (p) {
        if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true
        break
      }
      nr += dr
      nc += dc
    }
  }

  // 4. Rook / Queen straight attacks
  const straightDeltas = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  for (const [dr, dc] of straightDeltas) {
    let nr = r + dr
    let nc = c + dc
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc]
      if (p) {
        if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true
        break
      }
      nr += dr
      nc += dc
    }
  }

  // 5. King attacks
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = board[nr][nc]
        if (p && p.type === 'k' && p.color === byColor) return true
      }
    }
  }

  return false
}

export function isChessKingInCheck(board: ChessBoard, color: ChessColor): boolean {
  const kp = findChessKing(board, color)
  if (!kp) return true
  const oppColor = color === 'white' ? 'black' : 'white'
  return isSquareAttacked(board, kp, oppColor)
}

export function getPseudoLegalMoves(
  board: ChessBoard,
  from: Pos,
  castlingRights: CastlingRights,
  enPassantTarget: Pos | null
): Pos[] {
  const piece = board[from.r][from.c]
  if (!piece) return []

  const moves: Pos[] = []
  const { color, type } = piece
  const oppColor = color === 'white' ? 'black' : 'white'

  const tryMove = (toR: number, toC: number): boolean => {
    if (toR < 0 || toR >= 8 || toC < 0 || toC >= 8) return false
    const dest = board[toR][toC]
    if (!dest) {
      moves.push({ r: toR, c: toC })
      return true
    }
    if (dest.color === oppColor) {
      moves.push({ r: toR, c: toC })
    }
    return false
  }

  switch (type) {
    case 'p': {
      const dir = color === 'white' ? -1 : 1
      const startR = color === 'white' ? 6 : 1
      // Forward 1
      const forwardR = from.r + dir
      if (forwardR >= 0 && forwardR < 8 && !board[forwardR][from.c]) {
        moves.push({ r: forwardR, c: from.c })
        // Forward 2 from initial rank
        const forward2R = from.r + 2 * dir
        if (from.r === startR && !board[forward2R][from.c]) {
          moves.push({ r: forward2R, c: from.c })
        }
      }
      // Diagonal captures
      for (const dc of [-1, 1]) {
        const toC = from.c + dc
        if (forwardR >= 0 && forwardR < 8 && toC >= 0 && toC < 8) {
          const target = board[forwardR][toC]
          if (target && target.color === oppColor) {
            moves.push({ r: forwardR, c: toC })
          } else if (
            enPassantTarget &&
            enPassantTarget.r === forwardR &&
            enPassantTarget.c === toC
          ) {
            moves.push({ r: forwardR, c: toC })
          }
        }
      }
      break
    }
    case 'n': {
      const deltas = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ]
      deltas.forEach(([dr, dc]) => tryMove(from.r + dr, from.c + dc))
      break
    }
    case 'b': {
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      dirs.forEach(([dr, dc]) => {
        let r = from.r + dr, c = from.c + dc
        while (tryMove(r, c)) { r += dr; c += dc }
      })
      break
    }
    case 'r': {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      dirs.forEach(([dr, dc]) => {
        let r = from.r + dr, c = from.c + dc
        while (tryMove(r, c)) { r += dr; c += dc }
      })
      break
    }
    case 'q': {
      const dirs = [
        [-1, -1], [-1, 1], [1, -1], [1, 1],
        [-1, 0], [1, 0], [0, -1], [0, 1],
      ]
      dirs.forEach(([dr, dc]) => {
        let r = from.r + dr, c = from.c + dc
        while (tryMove(r, c)) { r += dr; c += dc }
      })
      break
    }
    case 'k': {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          tryMove(from.r + dr, from.c + dc)
        }
      }

      // Castling
      const homeR = color === 'white' ? 7 : 0
      if (from.r === homeR && from.c === 4 && !isChessKingInCheck(board, color)) {
        // Kingside
        const ksRight = color === 'white' ? castlingRights.whiteKingside : castlingRights.blackKingside
        if (
          ksRight &&
          !board[homeR][5] &&
          !board[homeR][6] &&
          !isSquareAttacked(board, { r: homeR, c: 5 }, oppColor) &&
          !isSquareAttacked(board, { r: homeR, c: 6 }, oppColor)
        ) {
          moves.push({ r: homeR, c: 6 })
        }

        // Queenside
        const qsRight = color === 'white' ? castlingRights.whiteQueenside : castlingRights.blackQueenside
        if (
          qsRight &&
          !board[homeR][3] &&
          !board[homeR][2] &&
          !board[homeR][1] &&
          !isSquareAttacked(board, { r: homeR, c: 3 }, oppColor) &&
          !isSquareAttacked(board, { r: homeR, c: 2 }, oppColor)
        ) {
          moves.push({ r: homeR, c: 2 })
        }
      }
      break
    }
  }

  return moves
}

export function executeMoveSimulation(
  board: ChessBoard,
  move: ChessMove,
  castlingRights: CastlingRights,
  enPassantTarget: Pos | null
): {
  board: ChessBoard
  captured: ChessPiece | null
  newCastling: CastlingRights
  newEnPassant: Pos | null
} {
  const nb = cloneChessBoard(board)
  const p = nb[move.from.r][move.from.c]
  if (!p) {
    return { board: nb, captured: null, newCastling: castlingRights, newEnPassant: null }
  }

  let captured = nb[move.to.r][move.to.c]
  let newEnPassant: Pos | null = null
  const newCastling = { ...castlingRights }

  // En passant capture
  if (
    p.type === 'p' &&
    enPassantTarget &&
    move.to.r === enPassantTarget.r &&
    move.to.c === enPassantTarget.c
  ) {
    const capR = p.color === 'white' ? move.to.r + 1 : move.to.r - 1
    captured = nb[capR][move.to.c]
    nb[capR][move.to.c] = null
  }

  // Pawn 2-square move sets en passant target
  if (p.type === 'p' && Math.abs(move.to.r - move.from.r) === 2) {
    newEnPassant = {
      r: (move.from.r + move.to.r) / 2,
      c: move.from.c,
    }
  }

  // Castling king move updates rook
  if (p.type === 'k' && Math.abs(move.to.c - move.from.c) === 2) {
    const rRow = move.from.r
    if (move.to.c === 6) {
      // Kingside: rook moves from 7 to 5
      nb[rRow][5] = nb[rRow][7]
      nb[rRow][7] = null
    } else if (move.to.c === 2) {
      // Queenside: rook moves from 0 to 3
      nb[rRow][3] = nb[rRow][0]
      nb[rRow][0] = null
    }
  }

  // Revoke castling rights on king/rook move or rook capture
  if (p.type === 'k') {
    if (p.color === 'white') {
      newCastling.whiteKingside = false
      newCastling.whiteQueenside = false
    } else {
      newCastling.blackKingside = false
      newCastling.blackQueenside = false
    }
  }
  if (p.type === 'r') {
    if (move.from.r === 7 && move.from.c === 0) newCastling.whiteQueenside = false
    if (move.from.r === 7 && move.from.c === 7) newCastling.whiteKingside = false
    if (move.from.r === 0 && move.from.c === 0) newCastling.blackQueenside = false
    if (move.from.r === 0 && move.from.c === 7) newCastling.blackKingside = false
  }

  // Move the piece
  let placedPiece: ChessPiece = p
  if (p.type === 'p' && (move.to.r === 0 || move.to.r === 7)) {
    placedPiece = { type: move.promotionType || 'q', color: p.color }
  }

  nb[move.to.r][move.to.c] = placedPiece
  nb[move.from.r][move.from.c] = null

  return { board: nb, captured, newCastling, newEnPassant }
}

export function getLegalChessMoves(
  board: ChessBoard,
  color: ChessColor,
  castlingRights: CastlingRights,
  enPassantTarget: Pos | null
): ChessMove[] {
  const legal: ChessMove[] = []

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p || p.color !== color) continue
      const from = { r, c }
      const pseudo = getPseudoLegalMoves(board, from, castlingRights, enPassantTarget)

      for (const to of pseudo) {
        const move: ChessMove = { from, to }
        const sim = executeMoveSimulation(board, move, castlingRights, enPassantTarget)
        if (!isChessKingInCheck(sim.board, color)) {
          legal.push(move)
        }
      }
    }
  }

  return legal
}

export type ChessGameStatus = 'ongoing' | 'check' | 'checkmate' | 'stalemate'

export function getChessGameStatus(
  board: ChessBoard,
  color: ChessColor,
  castlingRights: CastlingRights,
  enPassantTarget: Pos | null
): { status: ChessGameStatus; winner?: ChessColor } {
  const legal = getLegalChessMoves(board, color, castlingRights, enPassantTarget)
  const inCheck = isChessKingInCheck(board, color)

  if (legal.length === 0) {
    if (inCheck) {
      return {
        status: 'checkmate',
        winner: color === 'white' ? 'black' : 'white',
      }
    } else {
      return { status: 'stalemate' }
    }
  }

  if (inCheck) {
    return { status: 'check' }
  }

  return { status: 'ongoing' }
}
