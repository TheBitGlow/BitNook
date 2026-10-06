export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
export type Point = { x: number; y: number }

export interface SnakeGameState {
  snake: Point[]
  food: Point
  direction: Direction
  score: number
  isGameOver: boolean
}

export const GRID_SIZE = 20

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  if (current === 'UP' && next === 'DOWN') return false
  if (current === 'DOWN' && next === 'UP') return false
  if (current === 'LEFT' && next === 'RIGHT') return false
  if (current === 'RIGHT' && next === 'LEFT') return false
  return true
}

export function spawnFood(snake: Point[], gridSize: number = GRID_SIZE): Point {
  const occupied = new Set(snake.map(p => `${p.x},${p.y}`))
  const available: Point[] = []

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y })
      }
    }
  }

  if (available.length === 0) return { x: 0, y: 0 }
  const idx = Math.floor(Math.random() * available.length)
  return available[idx]
}

export function stepSnake(
  state: SnakeGameState,
  nextDirection?: Direction,
  gridSize: number = GRID_SIZE
): SnakeGameState {
  if (state.isGameOver) return state

  let dir = state.direction
  if (nextDirection && isValidDirectionChange(dir, nextDirection)) {
    dir = nextDirection
  }

  const head = state.snake[0]
  let nextHead: Point

  switch (dir) {
    case 'UP':
      nextHead = { x: head.x, y: head.y - 1 }
      break
    case 'DOWN':
      nextHead = { x: head.x, y: head.y + 1 }
      break
    case 'LEFT':
      nextHead = { x: head.x - 1, y: head.y }
      break
    case 'RIGHT':
      nextHead = { x: head.x + 1, y: head.y }
      break
  }

  // Wall collision check
  if (
    nextHead.x < 0 ||
    nextHead.x >= gridSize ||
    nextHead.y < 0 ||
    nextHead.y >= gridSize
  ) {
    return { ...state, isGameOver: true, direction: dir }
  }

  // Self collision check
  const hitsSelf = state.snake.some(
    (segment, idx) => idx > 0 && segment.x === nextHead.x && segment.y === nextHead.y
  )
  if (hitsSelf) {
    return { ...state, isGameOver: true, direction: dir }
  }

  const eatsFood = nextHead.x === state.food.x && nextHead.y === state.food.y
  const newSnake = [nextHead, ...state.snake]

  if (!eatsFood) {
    newSnake.pop()
    return {
      ...state,
      snake: newSnake,
      direction: dir,
    }
  }

  const newScore = state.score + 10
  const newFood = spawnFood(newSnake, gridSize)

  return {
    snake: newSnake,
    food: newFood,
    direction: dir,
    score: newScore,
    isGameOver: false,
  }
}
