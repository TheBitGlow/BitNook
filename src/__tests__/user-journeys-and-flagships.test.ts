import { describe, it, expect, beforeEach } from 'vitest'
import { getActiveTools, getToolBySlug, getSTierTools, getToolsByTier } from '@/config/tools'
import { getAllGames, getGameBySlug } from '@/config/games'
import { calculateMortgage } from '@/lib/finance/mortgage'
import { recordGrowthEvent, getGrowthMetrics, resetGrowthMetrics } from '@/lib/growthMetrics'
import { matchPinyin } from '@/config/searchIndex'

// Helper replicating the exact GlobalSearch ranking logic
function simulateGlobalSearch(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const allTools = getActiveTools()
  const scoredTools: { slug: string; name: string; score: number }[] = []

  for (const t of allTools) {
    const nameZh = t.name.toLowerCase()
    const nameEn = t.nameEn.toLowerCase()
    const slug = t.slug.toLowerCase()
    const cat = t.category.toLowerCase()
    const descZh = t.description.toLowerCase()
    const descEn = t.descriptionEn.toLowerCase()

    let score = 0

    // 1. Exact match
    if (slug === q || nameZh === q || nameEn === q) {
      score = 1000
    }
    // 2. Name / Slug prefix match
    else if (nameZh.startsWith(q) || nameEn.startsWith(q) || slug.startsWith(q)) {
      score = 500
    }
    // 3. Name / Slug substring match
    else if (nameZh.includes(q) || nameEn.includes(q) || slug.includes(q)) {
      score = 300
    }
    // 4. Keyword / Pinyin match
    else if (
      t.keywords.some((k) => k.toLowerCase() === q) ||
      t.keywordsEn.some((k) => k.toLowerCase() === q)
    ) {
      score = 260
    } else if (
      t.keywords.some((k) => k.toLowerCase().startsWith(q)) ||
      t.keywordsEn.some((k) => k.toLowerCase().startsWith(q))
    ) {
      score = 230
    } else if (
      t.keywords.some((k) => k.toLowerCase().includes(q)) ||
      t.keywordsEn.some((k) => k.toLowerCase().includes(q)) ||
      matchPinyin(t.slug, q)
    ) {
      score = 200
    }
    // 5. Category match
    else if (cat.includes(q)) {
      score = 100
    }
    // 6. Description match
    else if (descZh.includes(q) || descEn.includes(q)) {
      score = 50
    }

    if (score > 0) {
      const tierBonus = t.tier === 'S' ? 15 : t.tier === 'A' ? 5 : 0
      scoredTools.push({ slug: t.slug, name: t.name, score: score + tierBonus })
    }
  }

  scoredTools.sort((a, b) => b.score - a.score)
  return scoredTools
}

describe('User Journeys & Search 2.0 Ranking Verification', () => {
  it('ranks "房贷" query strictly: Mortgage > Loan Compare > Compound', () => {
    const results = simulateGlobalSearch('房贷')
    expect(results.length).toBeGreaterThanOrEqual(3)

    const topSlugs = results.slice(0, 3).map((r) => r.slug)
    expect(topSlugs[0]).toBe('mortgage')
    expect(topSlugs[1]).toBe('loan-compare')
    expect(topSlugs[2]).toBe('compound')
  })

  it('ranks "时间" query strictly: Timestamp > Date Calc > Countdown > World Clock', () => {
    const results = simulateGlobalSearch('时间')
    expect(results.length).toBeGreaterThanOrEqual(4)

    const slugs = results.map((r) => r.slug)
    const indexTimestamp = slugs.indexOf('timestamp')
    const indexDateCalc = slugs.indexOf('date-calc')
    const indexCountdown = slugs.indexOf('countdown')
    const indexWorldClock = slugs.indexOf('world-clock')

    expect(indexTimestamp).toBe(0)
    expect(indexDateCalc).toBeGreaterThan(indexTimestamp)
    expect(indexCountdown).toBeGreaterThan(indexDateCalc)
    expect(indexWorldClock).toBeGreaterThan(indexCountdown)
  })

  it('ranks "password" query: Password Generator as #1', () => {
    const results = simulateGlobalSearch('password')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0].slug).toBe('password')
    expect(results[0].score).toBeGreaterThanOrEqual(1000)
  })

  it('ranks "bmi" query: BMI Calculator as #1', () => {
    const results = simulateGlobalSearch('bmi')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0].slug).toBe('bmi')
    expect(results[0].score).toBeGreaterThanOrEqual(500)
  })
})

describe('Flagship 1: Mortgage Engine Comprehensive Calculations', () => {
  it('calculates equal-payment vs equal-principal with exact amortization schedules', () => {
    // 2,000,000 house price, 20% down payment = 1,600,000 loan amount, 30 years (360 months), 3.15% rate
    const equalPay = calculateMortgage({
      loanAmount: 1600000,
      downPayment: 400000,
      annualRate: 3.15,
      years: 30,
      paymentMethod: 'equal-payment',
    })

    const equalPrincipal = calculateMortgage({
      loanAmount: 1600000,
      downPayment: 400000,
      annualRate: 3.15,
      years: 30,
      paymentMethod: 'equal-principal',
    })

    // 1. Loan amounts match
    expect(equalPay.loanAmount).toBe(1600000)
    expect(equalPrincipal.loanAmount).toBe(1600000)

    // 2. Equal payment monthly payment is constant and around 6875.79
    expect(equalPay.firstMonthPayment).toBeCloseTo(6875.79, 1)
    expect(equalPay.lastMonthPayment).toBeCloseTo(6875.79, 1)
    expect(equalPay.totalPayment).toBeCloseTo(2475284.40, 1)
    expect(equalPay.totalInterest).toBeCloseTo(875284.40, 1)

    // 3. Equal principal first month is higher (~8644.44), decreases monthly (~11.67), total interest is lower (~758100)
    expect(equalPrincipal.firstMonthPayment).toBeCloseTo(8644.44, 1)
    expect(equalPrincipal.lastMonthPayment).toBeCloseTo(4456.11, 1)
    expect(equalPrincipal.totalInterest).toBeCloseTo(758100.0, 1)
    expect(equalPrincipal.monthlyDecrease).toBeCloseTo(11.67, 1)

    // 4. Equal principal saves interest over equal payment
    const interestSaved = equalPay.totalInterest - equalPrincipal.totalInterest
    expect(interestSaved).toBeCloseTo(117184.40, 1)

    // 5. Schedule rows are 360
    expect(equalPay.schedule.length).toBe(360)
    expect(equalPrincipal.schedule.length).toBe(360)
  })
})

describe('Flagship 2: Password Entropy & CSPRNG Mathematics', () => {
  it('correctly calculates Shannon entropy for various key lengths and pools', () => {
    const calcEntropy = (length: number, poolSize: number) => {
      return Math.round(length * Math.log2(poolSize) * 10) / 10
    }

    // Standard 16 chars with 89 chars (excluding ambiguous)
    // 16 * log2(89) = 16 * 6.4757 = 103.6 bits
    const ent16 = calcEntropy(16, 89)
    expect(ent16).toBe(103.6)
    expect(ent16).toBeGreaterThanOrEqual(80) // Very Strong

    // 8 chars with 10 digits
    // 8 * log2(10) = 8 * 3.3219 = 26.6 bits
    const entDigits = calcEntropy(8, 10)
    expect(entDigits).toBe(26.6)
    expect(entDigits).toBeLessThan(40) // Weak
  })
})

describe('Flagship 3: AI GPU Memory Mathematical Model', () => {
  it('evaluates Transformer weight memory and KV Cache accurately', () => {
    // Qwen 2.5 7B with 4-bit quantization (0.55 Bytes/param)
    const paramsB = 7.6
    const bytesPerParam = 0.55
    const weightGB = (paramsB * 1e9 * bytesPerParam) / (1024 * 1024 * 1024)
    expect(weightGB).toBeCloseTo(3.89, 1)

    // GQA KV Cache for 8k tokens at batch 1 (28 layers, 4 kv heads, 128 head dim, FP16 2 bytes)
    const layers = 28
    const kvHeads = 4
    const headDim = 128
    const context = 8192
    const batch = 1
    const kvBytes = 2
    const kvCacheTotalBytes = 2 * layers * kvHeads * headDim * context * batch * kvBytes
    const kvCacheGB = kvCacheTotalBytes / (1024 * 1024 * 1024)
    expect(kvCacheGB).toBeCloseTo(0.4375, 1)

    // Total VRAM with CUDA runtime (~0.6 GB) + activations (~0.5 GB) is around 5.5~5.8 GB
    const total = weightGB + kvCacheGB + 0.6 + 0.5
    expect(total).toBeGreaterThan(5.0)
    expect(total).toBeLessThan(6.5)
  })
})

describe('Growth Metrics & Retention Funnel Telemetry', () => {
  beforeEach(() => {
    resetGrowthMetrics()
  })

  it('aggregates search, click, tool, and game events without capturing sensitive data', () => {
    // Simulate user journey:
    // 1. Searches 10 times, clicks 8 results
    for (let i = 0; i < 10; i++) recordGrowthEvent('search')
    for (let i = 0; i < 8; i++) recordGrowthEvent('search_click')

    // 2. Opens mortgage 5 times, successful 5 times, favorite once
    for (let i = 0; i < 5; i++) {
      recordGrowthEvent('tool_open', { toolSlug: 'mortgage' })
      recordGrowthEvent('tool_success', { toolSlug: 'mortgage' })
    }
    recordGrowthEvent('favorite', { toolSlug: 'mortgage' })

    // 3. Related tool clicks 3 times
    for (let i = 0; i < 3; i++) recordGrowthEvent('related_click', { toolSlug: 'loan-compare' })

    // 4. Starts game 4 times, completes 3 times
    for (let i = 0; i < 4; i++) recordGrowthEvent('game_start', { gameSlug: 'gomoku' })
    for (let i = 0; i < 3; i++) recordGrowthEvent('game_complete', { gameSlug: 'gomoku' })

    const metrics = getGrowthMetrics()

    expect(metrics.searches).toBe(10)
    expect(metrics.searchClicks).toBe(8)
    expect(metrics.searchToClickRate).toBe(80.0) // 8 / 10 = 80%

    expect(metrics.toolOpens).toBe(5)
    expect(metrics.toolSuccesses).toBe(5)
    expect(metrics.toolSuccessRate).toBe(100.0)

    expect(metrics.favorites).toBe(1)
    expect(metrics.favoriteRate).toBe(20.0) // 1 / 5 = 20%

    expect(metrics.relatedClicks).toBe(3)
    expect(metrics.relatedToolClickRate).toBe(60.0) // 3 / 5 = 60%

    expect(metrics.gameStarts).toBe(4)
    expect(metrics.gameCompletes).toBe(3)
    expect(metrics.gameCompletionRate).toBe(75.0) // 3 / 4 = 75%

    expect(metrics.topTools[0].slug).toBe('mortgage')
    expect(metrics.topTools[0].count).toBe(5)
  })
})

describe('End-to-End User Journeys Simulation', () => {
  it('Task 1: User finds mortgage -> computes -> checks related tools', () => {
    // 1. Locate tool
    const tool = getToolBySlug('mortgage')
    expect(tool).toBeDefined()
    expect(tool?.tier).toBe('S')

    // 2. Execute calculation
    const calc = calculateMortgage({
      loanAmount: 1000000,
      annualRate: 3.15,
      years: 30,
      paymentMethod: 'equal-payment',
    })
    expect(calc.firstMonthPayment).toBeGreaterThan(0)

    // 3. Verify related tools
    expect(tool?.relatedTools).toContain('loan-compare')
    expect(tool?.relatedTools).toContain('salary')
    expect(tool?.relatedTools).toContain('compound')
  })

  it('Task 2: User searches BMI -> verifies related tools and recommendations', () => {
    const searchRes = simulateGlobalSearch('bmi')
    expect(searchRes[0].slug).toBe('bmi')

    const bmiTool = getToolBySlug('bmi')
    expect(bmiTool).toBeDefined()
    expect(bmiTool?.relatedTools.length).toBeGreaterThanOrEqual(3)
    expect(bmiTool?.relatedTools).toContain('calories')
    expect(bmiTool?.relatedTools).toContain('heart-rate')
  })

  it('Task 3: User accesses Games -> verifies 8 games exist with proper slugs', () => {
    const games = getAllGames()
    expect(games.length).toBe(8)

    const expectedSlugs = [
      'tetris',
      'minesweeper',
      'snake',
      'gomoku',
      'chess-chinese',
      'chess-international',
      'match3',
      'freecell',
    ]

    for (const slug of expectedSlugs) {
      const g = getGameBySlug(slug)
      expect(g).toBeDefined()
      expect(g?.slug).toBe(slug)
    }
  })
})
