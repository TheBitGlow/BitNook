export const TETRIS_COLS = 10
export const TETRIS_ROWS = 20

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z'

export interface TetrominoShape {
  type: TetrominoType
  matrix: number[][]
  color: string
}

export const TETROMINOES: Record<TetrominoType, TetrominoShape> = {
  I: {
    type: 'I',
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#06B6D4',
  },
  J: {
    type: 'J',
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#3B82F6',
  },
  L: {
    type: 'L',
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#F97316',
  },
  O: {
    type: 'O',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: '#FBBF24',
  },
  S: {
    type: 'S',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#10B981',
  },
  T: {
    type: 'T',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#A855F7',
  },
  Z: {
    type: 'Z',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#EF4444',
  },
}

export function createEmptyTetrisBoard(): string[][] {
  return Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(''))
}

export function rotateMatrix(matrix: number[][]): number[][] {
  const n = matrix.length
  const res: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      res[c][n - 1 - r] = matrix[r][c]
    }
  }
  return res
}

export function checkTetrisCollision(
  board: string[][],
  matrix: number[][],
  pos: { r: number; c: number }
): boolean {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const boardR = pos.r + r
        const boardC = pos.c + c

        if (boardC < 0 || boardC >= TETRIS_COLS || boardR >= TETRIS_ROWS) {
          return true
        }
        if (boardR >= 0 && board[boardR][boardC]) {
          return true
        }
      }
    }
  }
  return false
}

export function clearTetrisLines(board: string[][]): {
  newBoard: string[][]
  linesCleared: number
  scoreAdd: number
} {
  const remainingRows = board.filter(row => row.some(cell => !cell))
  const linesCleared = TETRIS_ROWS - remainingRows.length

  if (linesCleared === 0) {
    return { newBoard: board, linesCleared: 0, scoreAdd: 0 }
  }

  const emptyRows = Array.from({ length: linesCleared }, () => Array(TETRIS_COLS).fill(''))
  const newBoard = [...emptyRows, ...remainingRows]

  const lineScores = [0, 100, 300, 500, 800]
  const scoreAdd = lineScores[linesCleared] || linesCleared * 200

  return { newBoard, linesCleared, scoreAdd }
}
