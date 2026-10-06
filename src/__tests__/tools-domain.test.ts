import { describe, it, expect } from 'vitest'
import { calculateMortgage, calculateCombinedMortgage } from '../core/tools/mortgage'
import { calculateSalary } from '../core/tools/salary'
import { calculateCompound } from '../core/tools/compound'
import { calculateDeposit, DEPOSIT_RATE_DATASET } from '../core/tools/deposit'
import { convertCurrency } from '../core/tools/exchange'
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

describe('Pure Tools Domain Modules Verification', () => {
  describe('Mortgage Engine', () => {
    it('calculates equal payment mortgage correctly', () => {
      const res = calculateMortgage({
        loanAmount: 1000000,
        annualRate: 3.6,
        years: 30,
        paymentMethod: 'equal-payment',
      })
      expect(res.loanAmount).toBe(1000000)
      expect(res.schedule.length).toBe(360)
      expect(res.firstMonthPayment).toBeCloseTo(4546.45, 0)
      expect(res.totalPayment).toBeGreaterThan(1000000)
    })

    it('handles 0% rate edge case without NaN or division by zero', () => {
      const res = calculateMortgage({
        loanAmount: 120000,
        annualRate: 0,
        years: 1,
        paymentMethod: 'equal-payment',
      })
      expect(res.totalInterest).toBe(0)
      expect(res.totalPayment).toBe(120000)
      expect(res.firstMonthPayment).toBe(10000)
    })

    it('calculates combined mortgage correctly', () => {
      const res = calculateCombinedMortgage({
        commercialAmount: 1000000,
        commercialRate: 3.15,
        providentAmount: 500000,
        providentRate: 2.85,
        years: 20,
        paymentMethod: 'equal-payment',
      })
      expect(res.loanAmount).toBe(1500000)
      expect(res.schedule.length).toBe(240)
      expect(res.firstMonthPayment).toBeGreaterThan(5000)
    })
  })

  describe('Salary & Progressive Tax Engine', () => {
    it('calculates zero gross without error', () => {
      const res = calculateSalary({ grossMonthly: 0 })
      expect(res.annualTax).toBe(0)
      expect(res.annualNetSalary).toBe(0)
    })

    it('calculates standard salary under 2024 cumulative withholding rules', () => {
      const res = calculateSalary({
        grossMonthly: 20000,
        pensionRate: 8,
        medicalRate: 2,
        unemploymentRate: 0.5,
        housingFundRate: 7,
      })
      expect(res.grossAnnual).toBe(240000)
      expect(res.annualTax).toBeGreaterThan(0)
      expect(res.annualNetSalary).toBeLessThan(res.grossAnnual)
      expect(res.monthlySchedule.length).toBe(12)
    })
  })

  describe('Compound Interest Engine', () => {
    it('calculates compound interest with and without regular contributions', () => {
      const lump = calculateCompound({
        principal: 100000,
        rate: 6,
        years: 10,
      })
      expect(lump.amount).toBeGreaterThan(170000)
      expect(lump.doublingYears).toBe(12)

      const regular = calculateCompound({
        principal: 10000,
        rate: 8,
        years: 5,
        regularMonthlyContribution: 1000,
      })
      expect(regular.amount).toBeGreaterThan(regular.totalPrincipal)
    })
  })

  describe('Deposit Yield Engine', () => {
    it('calculates bank deposit yields across term presets', () => {
      const item = DEPOSIT_RATE_DATASET.find(d => d.id === 'term-1y')!
      const res = calculateDeposit(100000, item)
      expect(res.principal).toBe(100000)
      expect(res.interest).toBe(1250)
      expect(res.totalAmount).toBe(101250)
      expect(res.isEligible).toBe(true)
    })
  })

  describe('Exchange Currency Engine', () => {
    it('converts USD to CNY and vice-versa', () => {
      const res1 = convertCurrency(100, 'USD', 'CNY')
      expect(res1.convertedAmount).toBeCloseTo(723.5, 1)

      const res2 = convertCurrency(723.5, 'CNY', 'USD')
      expect(res2.convertedAmount).toBeCloseTo(100, 0)
    })

    it('returns error on negative amount', () => {
      const err = convertCurrency(-50, 'USD', 'CNY')
      expect(err.error).toBeDefined()
    })
  })

  describe('Loan Compare Engine', () => {
    it('flags lowest interest and lowest monthly plans', () => {
      const plans = compareLoanPlans([
        { id: '1', name: 'Plan A', amount: 500000, years: 10, rate: 3.5, paymentMethod: 'equal-payment' },
        { id: '2', name: 'Plan B', amount: 500000, years: 10, rate: 3.0, paymentMethod: 'equal-payment' },
      ])
      expect(plans[1].isLowestInterest).toBe(true)
    })
  })

  describe('Retirement Progressive Policy Engine', () => {
    it('calculates statutory retirement for male born in 1968', () => {
      const res = calculateRetirement(1968, 5, 'male')
      expect(res.originalRetirementAge).toBe(60)
      expect(res.delayedMonths).toBeGreaterThan(0)
      expect(res.statutoryRetirementAge.years).toBeGreaterThanOrEqual(60)
    })
  })

  describe('ROI, NPV, IRR Engine', () => {
    it('calculates NPV and Newton-Raphson IRR correctly', () => {
      const npv = calculateNPV(1000, [600, 600], 0.1)
      expect(npv).toBeGreaterThan(0)

      const irr = calculateIRR(1000, [600, 600])
      expect(irr).toBeCloseTo(13.07, 0)

      const res = calculateROI(1000, [600, 600], 10)
      expect(res.simpleROI).toBe(20)
      expect(res.irrStatus).toBe('converged')
    })
  })

  describe('Health Domain Modules', () => {
    it('BMI calculates Chinese adult standard WS/T 428-2013 accurately', () => {
      const normal = calculateBMI(175, 65)
      expect(normal?.category).toBe('健康正常')
      expect(normal?.idealWeightRange.min).toBeCloseTo(56.7, 1)

      const overweight = calculateBMI(170, 75)
      expect(overweight?.category).toBe('超重 (偏胖)')

      const invalid = calculateBMI(-170, 0)
      expect(invalid).toBeNull()
    })

    it('Calories BMR/TDEE Mifflin-St Jeor equation computes macros', () => {
      const res = calculateCalories({
        weightKg: 70,
        heightCm: 175,
        ageYears: 28,
        gender: 'male',
        activityLevel: 1.55,
      })
      expect(res.bmr).toBeGreaterThan(1500)
      expect(res.tdee).toBeGreaterThan(res.bmr)
      expect(res.macros.proteinGrams).toBe(112)
    })

    it('Heart Rate Karvonen reserve zones compute boundaries', () => {
      const res = calculateHeartRateZones({
        age: 30,
        restingHeartRate: 60,
        method: 'reserve',
        formula: 'tanaka',
      })
      expect(res.maxHeartRate).toBe(187) // 208 - 0.7 * 30 = 187
      expect(res.zones.length).toBe(5)
      expect(res.zones[0].minRate).toBeLessThan(res.zones[4].maxRate)
    })

    it('Blood pressure classifier follows Chinese hypertension guidelines', () => {
      expect(classifyBloodPressure(118, 76).stage).toBe('optimal')
      expect(classifyBloodPressure(135, 88).stage).toBe('high-normal')
      expect(classifyBloodPressure(145, 92).stage).toBe('grade-1')
      expect(classifyBloodPressure(165, 102).stage).toBe('grade-2')
      expect(classifyBloodPressure(185, 115).stage).toBe('grade-3')
      expect(classifyBloodPressure(85, 55).stage).toBe('low')
      expect(classifyBloodPressure(145, 80).stage).toBe('isolated-systolic')
    })

    it('Sleep cycle calculator schedules 90-min intervals', () => {
      const schedule = calculateSleepSchedule({ mode: 'wake', timeStr: '07:00', latencyMinutes: 15 })
      expect(schedule.length).toBe(4)
      expect(schedule.some(s => s.cycles === 5)).toBe(true)
    })

    it('Steps estimator converts to km and calories', () => {
      const res = calculateSteps({ steps: 10000, heightCm: 175 })
      expect(res.distanceKm).toBeGreaterThan(6)
      expect(res.caloriesKcal).toBeGreaterThan(300)
    })

    it('Water intake computes daily ml', () => {
      const res = calculateWaterIntake({ weightKg: 70, activityMinutes: 30 })
      expect(res.dailyMl).toBeGreaterThan(2500)
      expect(res.schedule.length).toBe(7)
    })
  })

  describe('Conversion Domain Modules', () => {
    it('converts colors bi-directionally between hex, rgb, hsl', () => {
      const rgb = hexToRgb('#2563EB')
      expect(rgb).toEqual({ r: 37, g: 99, b: 235 })
      expect(rgbToHex(rgb!)).toBe('#2563EB')

      const hsl = rgbToHsl(rgb!)
      expect(hsl.h).toBeGreaterThan(200)
    })

    it('Radix BigInt converts bases without overflow', () => {
      expect(validateRadixInput('1010', 2)).toBe(true)
      expect(validateRadixInput('102', 2)).toBe(false)

      const conv = convertRadix('255', 10)
      expect(conv?.hex).toBe('FF')
      expect(conv?.bin).toBe('11111111')
    })

    it('Unit conversions cover 10 categories', () => {
      expect(UNIT_CATEGORIES.length).toBe(10)
      const res = convertUnit(1000, 'm', 'km', 'length')
      expect(res).toBe(1)
    })

    it('Timestamp parses seconds and ISO', () => {
      const res = parseTimestamp(1711360000)
      expect(res?.iso).toBeDefined()
      expect(res?.seconds).toBe(1711360000)
    })
  })

  describe('Daily Domain Modules', () => {
    it('Date difference respects leap year rules', () => {
      expect(isLeapYear(2024)).toBe(true)
      expect(isLeapYear(2026)).toBe(false)
      expect(isLeapYear(2000)).toBe(true)
      expect(isLeapYear(1900)).toBe(false)

      const diff = calculateDateDifference(new Date(2024, 1, 28), new Date(2024, 2, 1))
      expect(diff.totalDays).toBe(2)

      const offset = calculateDateOffset(new Date(2026, 0, 1), 10)
      expect(offset.getDate()).toBe(11)
    })

    it('Text analysis counts Chinese characters and English words', () => {
      const res = analyzeText('你好世界 Hello World! 123')
      expect(res.chineseChars).toBe(4)
      expect(res.englishWords).toBe(3) // Hello, World, 123
      expect(res.estimatedReadingMinutes).toBeGreaterThan(0)
    })

    it('Password generator produces strong entropy', () => {
      const res = generatePassword({ length: 20, excludeAmbiguous: true })
      expect(res.password.length).toBe(20)
      expect(res.entropyBits).toBeGreaterThan(90)
      expect(res.strength).toBe('very-strong')
    })

    it('Lottery picker chooses item fairly', () => {
      const items = [{ id: '1', text: 'A', weight: 1 }, { id: '2', text: 'B', weight: 99 }]
      const pick = pickRandomLotteryItem(items)
      expect(pick).toBeDefined()
    })
  })

  describe('GPU VRAM Calculator Engine', () => {
    it('estimates weights and KV cache for LLMs', () => {
      const res = calculateVRAM({ modelParamsB: 7.6, quantId: 'q4', contextLength: 8192 })
      expect(res.weightMemoryGB).toBeGreaterThan(3)
      expect(res.totalVRAMGB).toBeGreaterThan(4)
      expect(res.compatibleGPUs.length).toBeGreaterThan(0)
    })
  })
})
