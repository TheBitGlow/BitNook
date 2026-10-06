export type GomokuStone = 'black' | 'white' | null
export type GomokuBoard = GomokuStone[][]

export const GOMOKU_SIZE = 15

export function createEmptyGomokuBoard(): GomokuBoard {
  return Array.from({ length: GOMOKU_SIZE }, () => Array(GOMOKU_SIZE).fill(null))
}

export function checkGomokuWin(
  board: GomokuBoard,
  r: number,
  c: number,
  stone: 'black' | 'white'
): boolean {
  return findGomokuWinLine(board, r, c, stone) !== null
}

export function findGomokuWinLine(
  board: GomokuBoard,
  r: number,
  c: number,
  stone: 'black' | 'white'
): [number, number][] | null {
  if (!stone) return null

  const directions: [number, number][] = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal \
    [1, -1], // diagonal /
  ]

  for (const [dr, dc] of directions) {
    const line: [number, number][] = [[r, c]]

    // forward
    let step = 1
    while (true) {
      const nr = r + dr * step
      const nc = c + dc * step
      if (nr < 0 || nr >= GOMOKU_SIZE || nc < 0 || nc >= GOMOKU_SIZE) break
      if (board[nr][nc] === stone) {
        line.push([nr, nc])
        step++
      } else {
        break
      }
    }

    // backward
    step = 1
    while (true) {
      const nr = r - dr * step
      const nc = c - dc * step
      if (nr < 0 || nr >= GOMOKU_SIZE || nc < 0 || nc >= GOMOKU_SIZE) break
      if (board[nr][nc] === stone) {
        line.push([nr, nc])
        step++
      } else {
        break
      }
    }

    if (line.length >= 5) return line
  }

  return null
}

export function isGomokuBoardFull(board: GomokuBoard): boolean {
  for (let r = 0; r < GOMOKU_SIZE; r++) {
    for (let c = 0; c < GOMOKU_SIZE; c++) {
      if (board[r][c] === null) return false
    }
  }
  return true
}
