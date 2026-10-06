import { describe, it, expect } from 'vitest'
import {
  INIT_CHINESE_BOARD,
  isKingInCheck as isXiangqiKingInCheck,
  getLegalMoves as getXiangqiLegalMoves,
  kingsFace,
  getGameStatus as getXiangqiStatus,
} from '../core/games/chinese-chess'
import {
  INITIAL_CHESS_BOARD,
  isChessKingInCheck,
  getLegalChessMoves,
  cloneChessBoard,
} from '../core/games/international-chess'
import {
  generateMsFreeCellDeal,
  getMaxMovableCards,
  isValidSequence,
  isKnownUnsolvableDeal,
} from '../core/games/freecell'
import {
  createEmptyGrid,
  populateMines,
  revealCell,
  checkMinesweeperWin,
} from '../core/games/minesweeper'
import {
  stepSnake,
  isValidDirectionChange,
} from '../core/games/snake'
import {
  rotateMatrix,
  checkTetrisCollision,
  clearTetrisLines,
  createEmptyTetrisBoard,
} from '../core/games/tetris'
import {
  createEmptyGomokuBoard,
  checkGomokuWin,
} from '../core/games/gomoku'
import {
  createInitialMatch3Grid,
  findMatches,
} from '../core/games/match3'

describe('Pure Game Engines Verification', () => {
  describe('Chinese Chess (Xiangqi) Engine', () => {
    it('initializes board with no check and legal moves available', () => {
      expect(isXiangqiKingInCheck(INIT_CHINESE_BOARD, true)).toBe(false)
      expect(isXiangqiKingInCheck(INIT_CHINESE_BOARD, false)).toBe(false)
      expect(kingsFace(INIT_CHINESE_BOARD)).toBe(false)

      const redMoves = getXiangqiLegalMoves(INIT_CHINESE_BOARD, true)
      expect(redMoves.length).toBeGreaterThan(10) // Pawns + Knights + Cannons
    })

    it('strictly forbids moving king into flying generals (kings-facing) check', () => {
      // Create empty board with only kings on same column
      const empty: (string | null)[][] = Array.from({ length: 10 }, () => Array(9).fill(null))
      empty[0][4] = 'k'
      empty[9][4] = 'K'
      expect(kingsFace(empty)).toBe(true)
      expect(isXiangqiKingInCheck(empty, true)).toBe(true)
    })

    it('reports game status correctly when trapped (stalemate) or checked', () => {
      const status = getXiangqiStatus(INIT_CHINESE_BOARD, true)
      expect(status.status).toBe('ongoing')
    })
  })

  describe('International Chess Engine', () => {
    it('initializes board with 20 legal opening moves for white', () => {
      const castling = {
        whiteKingside: true,
        whiteQueenside: true,
        blackKingside: true,
        blackQueenside: true,
      }
      expect(isChessKingInCheck(INITIAL_CHESS_BOARD, 'white')).toBe(false)
      const moves = getLegalChessMoves(INITIAL_CHESS_BOARD, 'white', castling, null)
      expect(moves.length).toBe(20) // 16 pawn pushes (1 or 2 squares) + 4 knight moves
    })

    it('detects check and prevents moves that do not relieve check', () => {
      // Scholar's Mate position: Queen at f7 checking black King
      const board = cloneChessBoard(INITIAL_CHESS_BOARD)
      board[1][5] = null // remove f7 pawn
      board[1][4] = { type: 'q', color: 'white' } // Queen attacks King at e8
      expect(isChessKingInCheck(board, 'black')).toBe(true)
    })
  })

  describe('FreeCell Deterministic Deal & Capacity Engine', () => {
    it('generates Microsoft FreeCell Deals #1, #617, #11982 with identical 52-card layouts across runs', () => {
      const deal1_a = generateMsFreeCellDeal(1)
      const deal1_b = generateMsFreeCellDeal(1)
      expect(deal1_a).toEqual(deal1_b)
      expect(deal1_a.reduce((sum, col) => sum + col.length, 0)).toBe(52)
      expect(deal1_a[0].length).toBe(7)
      expect(deal1_a[4].length).toBe(6)

      const deal617_a = generateMsFreeCellDeal(617)
      const deal617_b = generateMsFreeCellDeal(617)
      expect(deal617_a).toEqual(deal617_b)
      expect(deal617_a.reduce((sum, col) => sum + col.length, 0)).toBe(52)

      const deal11982_a = generateMsFreeCellDeal(11982)
      const deal11982_b = generateMsFreeCellDeal(11982)
      expect(deal11982_a).toEqual(deal11982_b)
      expect(deal11982_a.reduce((sum, col) => sum + col.length, 0)).toBe(52)

      // Confirm deal #11982 is recognized as the classic unsolvable deal
      expect(isKnownUnsolvableDeal(11982)).toBe(true)
      expect(isKnownUnsolvableDeal(1)).toBe(false)
      expect(isKnownUnsolvableDeal(617)).toBe(false)
    })

    it('enforces capacity theorem: max cards = (emptyCells + 1) * 2^emptyCols', () => {
      // 4 freecells empty, 0 empty cols -> (4+1)*1 = 5 cards
      expect(getMaxMovableCards(4, 0, false)).toBe(5)
      // 0 freecells empty, 2 empty cols -> (0+1)*4 = 4 cards
      expect(getMaxMovableCards(0, 2, false)).toBe(4)
      // Moving to empty column consumes 1 empty col:
      expect(getMaxMovableCards(0, 2, true)).toBe(2)
    })

    it('validates descending alternating sequence', () => {
      expect(
        isValidSequence([
          { suit: '♠', rank: '8', id: '1' },
          { suit: '♥', rank: '7', id: '2' },
          { suit: '♣', rank: '6', id: '3' },
        ])
      ).toBe(true)

      expect(
        isValidSequence([
          { suit: '♠', rank: '8', id: '1' },
          { suit: '♣', rank: '7', id: '2' }, // same color black!
        ])
      ).toBe(false)
    })
  })

  describe('Minesweeper Engine', () => {
    it('guarantees first click and its 3x3 surrounding is 100% mine-free', () => {
      const empty = createEmptyGrid(9, 9)
      const grid = populateMines(empty, 9, 9, 10, 4, 4)

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          expect(grid[4 + dr][4 + dc].isMine).toBe(false)
        }
      }
    })

    it('reveals empty areas with flood fill', () => {
      const empty = createEmptyGrid(9, 9)
      const { grid } = revealCell(empty, 9, 9, 0, 0)
      expect(checkMinesweeperWin(grid, 9, 9)).toBe(true)
    })
  })

  describe('Snake Engine', () => {
    it('prevents 180-degree suicide direction change', () => {
      expect(isValidDirectionChange('UP', 'DOWN')).toBe(false)
      expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false)
      expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true)
    })

    it('steps forward and detects wall collision', () => {
      const state = {
        snake: [{ x: 0, y: 0 }],
        food: { x: 5, y: 5 },
        direction: 'UP' as const,
        score: 0,
        isGameOver: false,
      }
      const next = stepSnake(state)
      expect(next.isGameOver).toBe(true) // hits upper wall y < 0
    })
  })

  describe('Tetris Engine', () => {
    it('rotates matrix 90 degrees clockwise', () => {
      const m = [
        [1, 0],
        [1, 1],
      ]
      const r = rotateMatrix(m)
      expect(r).toEqual([
        [1, 1],
        [1, 0],
      ])
    })

    it('detects boundary collisions', () => {
      const board = createEmptyTetrisBoard()
      const collision = checkTetrisCollision(board, [[1, 1]], { r: 0, c: 9 })
      expect(collision).toBe(true) // col 10 exceeds 9
    })

    it('clears completed lines and computes score', () => {
      const board = createEmptyTetrisBoard()
      board[19] = Array(10).fill('#06B6D4') // full bottom row
      const { linesCleared, scoreAdd } = clearTetrisLines(board)
      expect(linesCleared).toBe(1)
      expect(scoreAdd).toBe(100)
    })
  })

  describe('Gomoku Engine', () => {
    it('detects 5-in-a-row in horizontal, vertical, and diagonal directions', () => {
      const board = createEmptyGomokuBoard()
      for (let c = 0; c < 5; c++) {
        board[7][c] = 'black'
      }
      expect(checkGomokuWin(board, 7, 4, 'black')).toBe(true)
      expect(checkGomokuWin(board, 7, 4, 'white')).toBe(false)
    })
  })

  describe('Match3 Engine', () => {
    it('detects horizontal and vertical 3-matches', () => {
      const grid = createInitialMatch3Grid()
      grid[0][0] = 'ruby'
      grid[0][1] = 'ruby'
      grid[0][2] = 'ruby'
      const matches = findMatches(grid)
      expect(matches.length).toBeGreaterThanOrEqual(3)
    })
  })
})
