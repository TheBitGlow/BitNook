export const MATCH3_SIZE = 8
export const GEM_TYPES = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'] as const
export type GemType = typeof GEM_TYPES[number]

export type Match3Grid = (GemType | null)[][]

export function createInitialMatch3Grid(): Match3Grid {
  const grid: Match3Grid = []
  for (let r = 0; r < MATCH3_SIZE; r++) {
    grid[r] = []
    for (let c = 0; c < MATCH3_SIZE; c++) {
      let allowed = [...GEM_TYPES]
      // avoid initial matches
      if (c >= 2 && grid[r][c - 1] === grid[r][c - 2]) {
        allowed = allowed.filter(g => g !== grid[r][c - 1])
      }
      if (r >= 2 && grid[r - 1][c] === grid[r - 2][c]) {
        allowed = allowed.filter(g => g !== grid[r - 1][c])
      }
      grid[r][c] = allowed[Math.floor(Math.random() * allowed.length)]
    }
  }
  return grid
}

export function findMatches(grid: Match3Grid): { r: number; c: number }[] {
  const matchedSet = new Set<string>()

  // Horizontal matches
  for (let r = 0; r < MATCH3_SIZE; r++) {
    for (let c = 0; c < MATCH3_SIZE - 2; c++) {
      const g = grid[r][c]
      if (g && g === grid[r][c + 1] && g === grid[r][c + 2]) {
        matchedSet.add(`${r},${c}`)
        matchedSet.add(`${r},${c + 1}`)
        matchedSet.add(`${r},${c + 2}`)
      }
    }
  }

  // Vertical matches
  for (let c = 0; c < MATCH3_SIZE; c++) {
    for (let r = 0; r < MATCH3_SIZE - 2; r++) {
      const g = grid[r][c]
      if (g && g === grid[r + 1][c] && g === grid[r + 2][c]) {
        matchedSet.add(`${r},${c}`)
        matchedSet.add(`${r + 1},${c}`)
        matchedSet.add(`${r + 2},${c}`)
      }
    }
  }

  return Array.from(matchedSet).map(s => {
    const [r, c] = s.split(',').map(Number)
    return { r, c }
  })
}

export function isValidMatch3Swap(
  grid: Match3Grid,
  pos1: { r: number; c: number },
  pos2: { r: number; c: number }
): boolean {
  // Check adjacency
  const dist = Math.abs(pos1.r - pos2.r) + Math.abs(pos1.c - pos2.c)
  if (dist !== 1) return false

  // Simulate swap
  const simulated = grid.map(row => [...row])
  const temp = simulated[pos1.r][pos1.c]
  simulated[pos1.r][pos1.c] = simulated[pos2.r][pos2.c]
  simulated[pos2.r][pos2.c] = temp

  const matches = findMatches(simulated)
  return matches.length >= 3
}

export function hasAnyValidMoves(grid: Match3Grid): boolean {
  for (let r = 0; r < MATCH3_SIZE; r++) {
    for (let c = 0; c < MATCH3_SIZE; c++) {
      // try right
      if (c < MATCH3_SIZE - 1) {
        if (isValidMatch3Swap(grid, { r, c }, { r, c: c + 1 })) return true
      }
      // try down
      if (r < MATCH3_SIZE - 1) {
        if (isValidMatch3Swap(grid, { r, c }, { r: r + 1, c })) return true
      }
    }
  }
  return false
}
