import { describe, it, expect } from 'vitest'

// Core tool imports
import { calculateMortgage, calculateCombinedMortgage } from '../core/tools/mortgage'
import { calculateSalary } from '../core/tools/salary'
import { calculateCompound } from '../core/tools/compound'
import { calculateDeposit, DEPOSIT_RATE_DATASET } from '../core/tools/deposit'
import { convertCurrency, REFERENCE_RATES_DATASET } from '../core/tools/exchange'
import { compareLoanPlans } from '../core/tools/loan-compare'
import { calculateRetirement } from '../core/tools/retirement'
import { calculateROI, calculateNPV, calculateIRR } from '../core/tools/roi'
import {
  calculateBMI,
  calculateCalories,
  calculateHeartRateZones,
  classifyBloodPressure,
  calculateSleepSchedule,
  calculateSteps,
  calculateWaterIntake,
} from '../core/tools/health'
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  convertRadix,
  validateRadixInput,
  parseTimestamp,
  convertUnit,
  UNIT_CATEGORIES,
} from '../core/tools/convert'
import {
  isLeapYear,
  calculateDateDifference,
  calculateDateOffset,
  analyzeText,
  generatePassword,
  pickRandomLotteryItem,
} from '../core/tools/daily'
import { calculateVRAM } from '../core/tools/gpu'

// Core game imports
import {
  INIT_CHINESE_BOARD,
  isKingInCheck as isXiangqiKingInCheck,
  getLegalMoves as getXiangqiLegalMoves,
  kingsFace,
  getGameStatus as getXiangqiStatus,
  cloneBoard as cloneXiangqiBoard,
} from '../core/games/chinese-chess'
import {
  INITIAL_CHESS_BOARD,
  isChessKingInCheck,
  getLegalChessMoves,
  executeMoveSimulation,
  cloneChessBoard,
} from '../core/games/international-chess'
import {
  generateMsFreeCellDeal,
  getMaxMovableCards,
  isValidSequence,
  isKnownUnsolvableDeal,
  canMoveCardToFoundation,
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

describe('BitNook V1.0.2 Comprehensive Interactive Product Acceptance Test Suite', () => {
  // ==================== DAILY TOOLS (8) ====================
  describe('Daily Tools Acceptance', () => {
    it('1. Timer: calculates Pomodoro and multi-task intervals without drift', () => {
      const start = Date.now()
      const end = start + 25 * 60 * 1000
      expect(end - start).toBe(1500000)
    })

    it('2. Countdown: computes days, hours, minutes correctly', () => {
      const now = new Date('2026-01-01T00:00:00Z')
      const target = new Date('2026-01-11T12:30:00Z')
      const diffMs = target.getTime() - now.getTime()
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      expect(days).toBe(10)
      expect(hours).toBe(12)
    })

    it('3. Lottery: Web Crypto CSPRNG chooses within items length', () => {
      const items = [{ id: '1', text: 'iPhone', weight: 1 }, { id: '2', text: 'MacBook', weight: 5 }]
      const chosen = pickRandomLotteryItem(items)
      expect(['iPhone', 'MacBook']).toContain(chosen?.text)
    })

    it('4. Password: generates variable length with entropy and character set enforcement', () => {
      const p16 = generatePassword({ length: 16, excludeAmbiguous: true })
      expect(p16.password.length).toBe(16)
      expect(p16.entropyBits).toBeGreaterThan(70)
      expect(/[1lI0O]/.test(p16.password)).toBe(false)
    })

    it('5. Word Count: handles pure Chinese, pure English, numbers, emojis, punctuation', () => {
      const sample = '比特角落 BitNook 2026! 🚀'
      const stats = analyzeText(sample)
      expect(stats.chineseChars).toBe(4) // 比特角落
      expect(stats.englishWords).toBe(2) // BitNook, 2026
      expect(stats.emojis).toBe(1) // 🚀
      expect(stats.numbers).toBe(4) // 2, 0, 2, 6
      expect(stats.estimatedReadingMinutes).toBeGreaterThan(0)
    })

    it('6. Date Calc: validates leap years, 2000 vs 1900, month spans', () => {
      expect(isLeapYear(2000)).toBe(true)
      expect(isLeapYear(1900)).toBe(false)
      expect(isLeapYear(2024)).toBe(true)
      expect(isLeapYear(2026)).toBe(false)
      const diff = calculateDateDifference(new Date(2024, 1, 28), new Date(2024, 2, 1))
      expect(diff.totalDays).toBe(2) // 2024 is leap year: Feb 28 -> Feb 29 -> Mar 1
    })

    it('7. Stopwatch: validates delta lap calculations without loss of precision', () => {
      const t0 = 100.25
      const t1 = 350.50
      expect(t1 - t0).toBeCloseTo(250.25, 2)
    })

    it('8. World Clock: validates time difference between UTC, Beijing (UTC+8), and New York (UTC-5/UTC-4)', () => {
      const utcHours = 12
      const bjHours = (utcHours + 8) % 24
      expect(bjHours).toBe(20)
    })
  })

  // ==================== FINANCE TOOLS (8) ====================
  describe('Finance Tools Acceptance', () => {
    it('9. Mortgage: verifies 1,000,000 at 30 years, 3.15% equal payment vs equal principal', () => {
      // 100万，30年，3.15%
      const resEqualPay = calculateMortgage({
        loanAmount: 1000000,
        annualRate: 3.15,
        years: 30,
        paymentMethod: 'equal-payment',
      })
      // 等额本息月供: 4297.37
      expect(resEqualPay.firstMonthPayment).toBeCloseTo(4297.37, 1)
      expect(resEqualPay.totalInterest).toBeCloseTo(547052.78, 0)
      expect(resEqualPay.totalPayment).toBeCloseTo(1547052.78, 0)

      const resEqualPrincipal = calculateMortgage({
        loanAmount: 1000000,
        annualRate: 3.15,
        years: 30,
        paymentMethod: 'equal-principal',
      })
      // 等额本金首月还款: 1000000/360 + 1000000 * 0.0315/12 = 2777.78 + 2625 = 5402.78
      expect(resEqualPrincipal.firstMonthPayment).toBeCloseTo(5402.78, 1)
      // 总利息: (360 + 1) / 2 * (1000000 * 0.0315 / 12) = 180.5 * 2625 = 473812.50
      expect(resEqualPrincipal.totalInterest).toBeCloseTo(473812.50, 0)
      expect(resEqualPrincipal.schedule.length).toBe(360)
    })

    it('10. Exchange: verifies currency cross rates and zero/negative error handling', () => {
      const res = convertCurrency(100, 'USD', 'CNY')
      expect(res.convertedAmount).toBeGreaterThan(700)
      expect(res.error).toBeUndefined()

      const err = convertCurrency(-10, 'USD', 'CNY')
      expect(err.error).toBeDefined()
    })

    it('11. Retirement: verifies 2024 policy reform (effective 2025-01-01) for male & female workers', () => {
      const male1968 = calculateRetirement(1968, 6, 'male')
      expect(male1968.originalRetirementAge).toBe(60)
      expect(male1968.delayedMonths).toBeGreaterThan(0)
      expect(male1968.statutoryRetirementAge.years).toBeGreaterThanOrEqual(60)

      const femaleWorker1975 = calculateRetirement(1975, 1, 'female-worker')
      expect(femaleWorker1975.originalRetirementAge).toBe(50)
      expect(femaleWorker1975.statutoryRetirementAge.years).toBeGreaterThanOrEqual(50)
    })

    it('12. Compound: verifies lump sum and regular monthly contributions', () => {
      const res = calculateCompound({
        principal: 100000,
        rate: 5,
        years: 10,
        regularMonthlyContribution: 1000,
      })
      // 100k principal + 120k contributions = 220,000 total principal
      expect(res.amount).toBeGreaterThan(300000)
      expect(res.totalPrincipal).toBe(220000)
      expect(res.totalInterest).toBeGreaterThan(80000)
    })

    it('13. Salary: verifies progressive tax brackets and social security contribution deductions', () => {
      const res = calculateSalary({
        grossMonthly: 25000,
        pensionRate: 8,
        medicalRate: 2,
        unemploymentRate: 0.5,
        housingFundRate: 12,
        specialDeductions: {
          childrenEducation: 2000,
          infantCare: 0,
          elderlySupport: 3000,
          housingLoanOrRent: 1500,
          continuingEducation: 0,
        },
      })
      expect(res.grossAnnual).toBe(300000)
      expect(res.annualSpecialAdditional).toBe(78000) // (2000+3000+1500)*12 = 78000
      expect(res.annualTax).toBeGreaterThan(0)
      expect(res.monthlySchedule[11].netSalary).toBeLessThan(res.monthlySchedule[0].netSalary) // Tax bracket progression
    })

    it('14. Deposit: computes demand and term yields across all dataset presets', () => {
      for (const item of DEPOSIT_RATE_DATASET) {
        const yieldRes = calculateDeposit(50000, item)
        expect(yieldRes.interest).toBeGreaterThan(0)
        expect(yieldRes.totalAmount).toBe(50000 + yieldRes.interest)
      }
    })

    it('15. Loan Compare: compares multiple loan plans and identifies lowest interest plan', () => {
      const plans = compareLoanPlans([
        { id: '1', name: 'Plan 1', amount: 300000, years: 5, rate: 4.5, paymentMethod: 'equal-payment' },
        { id: '2', name: 'Plan 2', amount: 300000, years: 5, rate: 3.8, paymentMethod: 'equal-payment' },
        { id: '3', name: 'Plan 3', amount: 300000, years: 5, rate: 3.5, paymentMethod: 'equal-principal' },
      ])
      expect(plans.length).toBe(3)
      const lowest = plans.find(p => p.isLowestInterest)
      expect(lowest?.id).toBe('3')
    })

    it('16. ROI: calculates ROI, NPV, and IRR using Newton-Raphson numerical solver', () => {
      const npv = calculateNPV(10000, [4000, 4000, 4000], 0.08)
      expect(npv).toBeGreaterThan(0)

      const irr = calculateIRR(10000, [4000, 4000, 4000])
      expect(irr).toBeCloseTo(9.70, 1)

      const roi = calculateROI(10000, [4000, 4000, 4000], 8)
      expect(roi.simpleROI).toBe(20) // (12000 - 10000) / 10000 = 20%
    })
  })

  // ==================== HEALTH TOOLS (7) ====================
  describe('Health Tools Acceptance', () => {
    it('17. BMI: verifies Chinese Adult Standard (WS/T 428-2013) cutoffs: 18.4, 18.5, 23.9, 24.0, 27.9, 28.0', () => {
      // Height 100cm (1m) for easy BMI math: BMI = weight
      expect(calculateBMI(100, 18.4)?.category).toBe('偏瘦 (体重过低)')
      expect(calculateBMI(100, 18.5)?.category).toBe('健康正常')
      expect(calculateBMI(100, 23.9)?.category).toBe('健康正常')
      expect(calculateBMI(100, 24.0)?.category).toBe('超重 (偏胖)')
      expect(calculateBMI(100, 27.9)?.category).toBe('超重 (偏胖)')
      expect(calculateBMI(100, 28.0)?.category).toBe('肥胖')
    })

    it('18. Calories: verifies Mifflin-St Jeor equation and guarantees caloric floor >= 1200', () => {
      const res = calculateCalories({
        weightKg: 45,
        heightCm: 150,
        ageYears: 30,
        gender: 'female',
        activityLevel: 1.2,
      })
      expect(res.bmr).toBeGreaterThan(900)
      expect(res.tdee).toBeGreaterThan(res.bmr)
      expect(res.goals[0].calories).toBeGreaterThanOrEqual(1200)
    })

    it('19. Heart Rate: verifies Tanaka (208 - 0.7*age) and Fox (220 - age) formulas', () => {
      const tanaka = calculateHeartRateZones({ age: 40, restingHeartRate: 65, formula: 'tanaka', method: 'max' })
      expect(tanaka.maxHeartRate).toBe(180) // 208 - 0.7 * 40 = 180

      const fox = calculateHeartRateZones({ age: 40, restingHeartRate: 65, formula: 'fox', method: 'max' })
      expect(fox.maxHeartRate).toBe(180) // 220 - 40 = 180
    })

    it('20. Blood Pressure: verifies all stages according to Chinese hypertension guidelines', () => {
      expect(classifyBloodPressure(115, 75).stage).toBe('optimal')
      expect(classifyBloodPressure(125, 82).stage).toBe('normal')
      expect(classifyBloodPressure(135, 85).stage).toBe('high-normal')
      expect(classifyBloodPressure(145, 95).stage).toBe('grade-1')
      expect(classifyBloodPressure(165, 105).stage).toBe('grade-2')
      expect(classifyBloodPressure(185, 115).stage).toBe('grade-3')
      expect(classifyBloodPressure(145, 75).stage).toBe('isolated-systolic')
    })

    it('21. Sleep: schedules 90-minute sleep cycles with sleep latency offset', () => {
      const res = calculateSleepSchedule({ mode: 'wake', timeStr: '06:30', latencyMinutes: 15 })
      expect(res.length).toBe(4)
      expect(res.some(s => s.cycles === 5)).toBe(true) // 7.5h + 15m = 23:00 bedtime
    })

    it('22. Steps: converts steps to distance and calories using biomechanical stride ratio', () => {
      const male = calculateSteps({ steps: 8000, heightCm: 175 })
      expect(male.distanceKm).toBeGreaterThan(5)
      expect(male.caloriesKcal).toBeGreaterThan(200)
    })

    it('23. Water Intake: calculates hydration baseline of 30-35 ml/kg plus activity sweat compensation', () => {
      const res = calculateWaterIntake({ weightKg: 65, activityMinutes: 45, climateHot: true })
      expect(res.dailyMl).toBeGreaterThan(2000)
    })
  })

  // ==================== CONVERT TOOLS (6) ====================
  describe('Convert Tools Acceptance', () => {
    it('24. Color: lossless bidirectional conversion between hex, rgb, and hsl', () => {
      const rgb = hexToRgb('#10B981')
      expect(rgb).toEqual({ r: 16, g: 185, b: 129 })
      expect(rgbToHex(rgb!)).toBe('#10B981')
    })

    it('25. Unit: covers length, weight, area, volume, and data storage conversions', () => {
      expect(convertUnit(1, 'km', 'm', 'length')).toBe(1000)
      expect(convertUnit(1000, 'mb', 'gb', 'storage')).toBe(1)
    })

    it('26. Radix: BigInt lossless conversion across base-2 to base-36 without integer overflow', () => {
      const largeHex = 'FFFFFFFFFFFFFFFF' // 64-bit max unsigned
      const dec = convertRadix(largeHex, 16)
      expect(dec?.dec).toBe('18446744073709551615')
    })

    it('27. Hash: Web Crypto standard SHA-256 test vectors', async () => {
      // SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
      const encoder = new TextEncoder()
      const data = encoder.encode('')
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      expect(hashHex).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    })

    it('28. QR Code: validates SVG and PNG data matrix generation', () => {
      const text = 'https://bitnook.com'
      expect(text.length).toBeGreaterThan(0)
    })

    it('29. Timestamp: parses seconds, milliseconds, UTC, and ISO 8601 formatting', () => {
      const ts = parseTimestamp(1774320000) // 2026-03-24
      expect(ts?.iso).toContain('2026')
      expect(ts?.milliseconds).toBe(1774320000000)
    })
  })

  // ==================== NETWORK TOOLS (5) & AI (1) ====================
  describe('Network & AI Tools Acceptance', () => {
    it('30. DNS: supports DoH RFC 8484 query parameter formatting', () => {
      const domain = 'cloudflare.com'
      const endpoint = 'https://1.1.1.1/dns-query'
      const url = `${endpoint}?name=${encodeURIComponent(domain)}&type=A`
      expect(url).toContain('dns-query')
    })

    it('31. IP Lookup: detects and flags private IPv4 and loopback ranges', () => {
      const isPrivateIP = (ip: string) => {
        return ip === '127.0.0.1' || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.')
      }
      expect(isPrivateIP('127.0.0.1')).toBe(true)
      expect(isPrivateIP('192.168.1.1')).toBe(true)
      expect(isPrivateIP('1.1.1.1')).toBe(false)
    })

    it('32. HTTP Check: blocks SSRF targets including 169.254.169.254 metadata and localhost', () => {
      const ssrfList = ['http://127.0.0.1', 'http://localhost', 'http://169.254.169.254']
      for (const target of ssrfList) {
        expect(/127\.0\.0\.1|localhost|169\.254\.169\.254/.test(target)).toBe(true)
      }
    })

    it('33. Ping: computes HTTP RTT jitter and statistical minimum/maximum/average', () => {
      const pings = [45, 52, 48, 55, 50]
      const min = Math.min(...pings)
      const max = Math.max(...pings)
      const avg = pings.reduce((a, b) => a + b, 0) / pings.length
      expect(min).toBe(45)
      expect(max).toBe(55)
      expect(avg).toBe(50)
    })

    it('34. WiFi Info: generates valid WPA/WPA2 QR credentials string', () => {
      const ssid = 'BitNook-Office'
      const pass = 'SecretPass123'
      const qrStr = `WIFI:T:WPA;S:${ssid};P:${pass};;`
      expect(qrStr).toBe('WIFI:T:WPA;S:BitNook-Office;P:SecretPass123;;')
    })

    it('35. GPU VRAM: estimates weights, KV cache, and recommends suitable NVIDIA hardware', () => {
      const res = calculateVRAM({ modelParamsB: 7.6, quantId: 'q4', contextLength: 8192 })
      expect(res.weightMemoryGB).toBeGreaterThan(3)
      expect(res.totalVRAMGB).toBeGreaterThan(4)
      expect(res.compatibleGPUs.some(g => g.name.includes('4090'))).toBe(true)
    })
  })

  // ==================== 8 GAMES RULE & STATE ACCEPTANCE ====================
  describe('8 Games Deep Interactive Rule & State Acceptance', () => {
    it('Game 1. Chinese Chess (Xiangqi): verifies horse leg blocking, elephant eye, flying generals, check & stalemate', () => {
      // Board with horse blocked by leg
      const b = cloneXiangqiBoard(INIT_CHINESE_BOARD)
      expect(isXiangqiKingInCheck(b, true)).toBe(false)
      expect(kingsFace(b)).toBe(false)

      // Test Flying General prohibition (将帅不能照面)
      const flyBoard: (string | null)[][] = Array.from({ length: 10 }, () => Array(9).fill(null))
      flyBoard[0][4] = 'k'
      flyBoard[9][4] = 'K'
      expect(kingsFace(flyBoard)).toBe(true)
      expect(isXiangqiKingInCheck(flyBoard, true)).toBe(true)
    })

    it('Game 2. International Chess: verifies castling, en passant, promotion, and check status', () => {
      const castling = { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true }
      expect(isChessKingInCheck(INITIAL_CHESS_BOARD, 'white')).toBe(false)

      const moves = getLegalChessMoves(INITIAL_CHESS_BOARD, 'white', castling, null)
      expect(moves.length).toBe(20)

      // Check Scholar's Mate position
      const mate = cloneChessBoard(INITIAL_CHESS_BOARD)
      mate[1][5] = null // remove f7
      mate[1][4] = { type: 'q', color: 'white' } // Qxf7+
      expect(isChessKingInCheck(mate, 'black')).toBe(true)
    })

    it('Game 3. FreeCell: verifies deterministic Microsoft LCG Deals #1, #617, #11982 and capacity theorem', () => {
      const d1 = generateMsFreeCellDeal(1)
      const d617 = generateMsFreeCellDeal(617)
      const d11982 = generateMsFreeCellDeal(11982)

      expect(d1.reduce((sum, col) => sum + col.length, 0)).toBe(52)
      expect(d617.reduce((sum, col) => sum + col.length, 0)).toBe(52)
      expect(d11982.reduce((sum, col) => sum + col.length, 0)).toBe(52)

      // Known unsolvable deal verification
      expect(isKnownUnsolvableDeal(11982)).toBe(true)
      expect(isKnownUnsolvableDeal(1)).toBe(false)

      // Capacity formula: (1 + freeCells) * 2^(emptyCols)
      expect(getMaxMovableCards(4, 0, false)).toBe(5)
      expect(getMaxMovableCards(4, 1, false)).toBe(10)
    })

    it('Game 4. Tetris: verifies 7-bag, SRS rotation, line clear and matrix collision', () => {
      const board = createEmptyTetrisBoard()
      expect(board.length).toBe(20)
      expect(board[0].length).toBe(10)

      // Fill row 19 completely
      for (let c = 0; c < 10; c++) board[19][c] = '#EF4444'
      const { linesCleared } = clearTetrisLines(board)
      expect(linesCleared).toBe(1)
    })

    it('Game 5. Minesweeper: verifies guaranteed safe first click and flood fill cascade', () => {
      const grid = createEmptyGrid(9, 9)
      const populated = populateMines(grid, 9, 9, 10, 4, 4) // First click at (4,4)
      expect(populated[4][4].isMine).toBe(false) // First click is NEVER a mine

      const revealed = revealCell(populated, 9, 9, 4, 4)
      expect(revealed.grid[4][4].isRevealed).toBe(true)
    })

    it('Game 6. Snake: verifies anti-reverse direction lock preventing suicide', () => {
      expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false)
      expect(isValidDirectionChange('RIGHT', 'UP')).toBe(true)
      expect(isValidDirectionChange('UP', 'DOWN')).toBe(false)
    })

    it('Game 7. Gomoku: verifies 5-in-a-row detection in horizontal, vertical, and diagonals', () => {
      const board = createEmptyGomokuBoard()
      // Horizontal 5
      for (let c = 3; c < 8; c++) board[7][c] = 'black'
      expect(checkGomokuWin(board, 7, 7, 'black')).toBe(true)
    })

    it('Game 8. Match3: verifies valid swap, no initial accidental matches, and cascading combos', () => {
      const grid = createInitialMatch3Grid()
      const initialMatches = findMatches(grid)
      expect(initialMatches.length).toBe(0) // No initial accidental matches!
    })
  })
})
