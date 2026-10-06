export type Difficulty = 'easy' | 'medium' | 'hard'

export interface MinesweeperConfig {
  rows: number
  cols: number
  mines: number
  name: string
}

export const MINESWEEPER_CONFIGS: Record<Difficulty, MinesweeperConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, name: '初级 (9×9 · 10雷)' },
  medium: { rows: 16, cols: 16, mines: 40, name: '中级 (16×16 · 40雷)' },
  hard: { rows: 16, cols: 30, mines: 99, name: '高级 (16×30 · 99雷)' },
}

export interface CellData {
  r: number
  c: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
  isExploded?: boolean
}

export function createEmptyGrid(rows: number, cols: number): CellData[][] {
  const grid: CellData[][] = []
  for (let r = 0; r < rows; r++) {
    grid[r] = []
    for (let c = 0; c < cols; c++) {
      grid[r][c] = {
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }
    }
  }
  return grid
}

export function populateMines(
  grid: CellData[][],
  rows: number,
  cols: number,
  minesCount: number,
  firstR: number,
  firstC: number
): CellData[][] {
  const newGrid: CellData[][] = grid.map(row => row.map(cell => ({ ...cell })))
  let placed = 0

  while (placed < minesCount) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)

    // Ensure 3x3 surrounding first click is completely mine-free
    if (Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1) continue
    if (newGrid[r][c].isMine) continue

    newGrid[r][c].isMine = true
    placed++
  }

  // Calculate neighbor mines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newGrid[r][c].isMine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc].isMine) {
            count++
          }
        }
      }
      newGrid[r][c].neighborMines = count
    }
  }

  return newGrid
}

export function revealCell(
  grid: CellData[][],
  rows: number,
  cols: number,
  r: number,
  c: number
): { grid: CellData[][]; hitMine: boolean } {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })))
  const cell = newGrid[r][c]

  if (cell.isRevealed || cell.isFlagged) {
    return { grid: newGrid, hitMine: false }
  }

  if (cell.isMine) {
    cell.isRevealed = true
    cell.isExploded = true
    return { grid: newGrid, hitMine: true }
  }

  // Flood fill reveal
  const queue: [number, number][] = [[r, c]]
  cell.isRevealed = true

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!
    const cur = newGrid[cr][cc]

    if (cur.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = cr + dr, nc = cc + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const neighbor = newGrid[nr][nc]
            if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
              neighbor.isRevealed = true
              if (neighbor.neighborMines === 0) {
                queue.push([nr, nc])
              }
            }
          }
        }
      }
    }
  }

  return { grid: newGrid, hitMine: false }
}

export function checkMinesweeperWin(grid: CellData[][], rows: number, cols: number): boolean {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c]
      if (!cell.isMine && !cell.isRevealed) {
        return false
      }
    }
  }
  return true
}
