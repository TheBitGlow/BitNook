import { describe, it, expect } from 'vitest'
import { calculateMortgage } from '../lib/finance/mortgage'
import { calculateRetirement } from '../lib/finance/retirement'
import { calculateSalary } from '../lib/finance/salary'
import { calculateROI, calculateNPV, calculateIRR } from '../lib/finance/roi'
import { calculateDeposit, DEPOSIT_RATE_DATASET } from '../lib/finance/deposit'
import { convertCurrency } from '../lib/finance/exchange'

describe('Finance Tools Logic', () => {
  describe('Mortgage Calculator', () => {
    it('should compute equal payment (等额本息) correctly', () => {
      // 1,000,000 RMB loan, 30 years (360 months), 3.6% annual rate
      const result = calculateMortgage({
        loanAmount: 1000000,
        annualRate: 3.6,
        years: 30,
        paymentMethod: 'equal-payment',
      })

      expect(result.schedule.length).toBe(360)
      expect(result.loanAmount).toBe(1000000)
      // Equal payment gives same monthly payment every month
      expect(result.firstMonthPayment).toBe(result.lastMonthPayment)
      expect(result.firstMonthPayment).toBeGreaterThan(4000)
      expect(result.firstMonthPayment).toBeLessThan(5000)
      expect(result.totalInterest).toBeGreaterThan(0)
      expect(result.totalPayment).toBeCloseTo(result.loanAmount + result.totalInterest, 0)

      // Remaining balance at the end must be 0
      const lastRow = result.schedule[result.schedule.length - 1]
      expect(lastRow.remainingBalance).toBe(0)
    })

    it('should compute equal principal (等额本金) with decreasing monthly payment', () => {
      const result = calculateMortgage({
        loanAmount: 1000000,
        annualRate: 3.6,
        years: 30,
        paymentMethod: 'equal-principal',
      })

      expect(result.schedule.length).toBe(360)
      expect(result.firstMonthPayment).toBeGreaterThan(result.lastMonthPayment)
      expect(result.monthlyDecrease).toBeGreaterThan(0)

      // Each month principal repayment is constant: 1,000,000 / 360 = 2777.78
      const firstRow = result.schedule[0]
      expect(firstRow.principal).toBeCloseTo(1000000 / 360, 1)

      const lastRow = result.schedule[result.schedule.length - 1]
      expect(lastRow.remainingBalance).toBe(0)
    })

    it('should safely handle 0% interest rate without dividing by zero', () => {
      const result = calculateMortgage({
        loanAmount: 120000,
        annualRate: 0,
        years: 1,
        paymentMethod: 'equal-payment',
      })

      expect(result.totalInterest).toBe(0)
      expect(result.firstMonthPayment).toBe(10000)
      expect(result.totalPayment).toBe(120000)
    })
  })

  describe('Retirement Calculator (2025 Progressive Reform)', () => {
    it('should calculate male progressive delay (原60岁 -> 63岁, 每4月延1月)', () => {
      // Male born Jan 1965: reaches 60 in Jan 2025 (month 1 of reform) -> delay 1 month -> Feb 2025
      const res1 = calculateRetirement(1965, 1, 'male')
      expect(res1.delayedMonths).toBe(1)
      expect(res1.statutoryRetirementDate).toBe('2025年02月')

      // Male born in 1990: reaches 60 in 2050 (past the 36 months cap) -> maximum delayed 36 months to 63 years old
      const resYoung = calculateRetirement(1990, 1, 'male')
      expect(resYoung.delayedMonths).toBe(36)
      expect(resYoung.statutoryRetirementAge.years).toBe(63)
      expect(resYoung.statutoryRetirementAge.months).toBe(0)
    })

    it('should calculate female worker progressive delay (原50岁 -> 55岁, 每2月延1月)', () => {
      // Female worker born Jan 1975: reaches 50 in Jan 2025 -> delay 1 month -> Feb 2025
      const res = calculateRetirement(1975, 1, 'female-worker')
      expect(res.delayedMonths).toBe(1)
      expect(res.statutoryRetirementDate).toBe('2025年02月')

      // Younger female worker capped at 60 months delay (55 years old)
      const resYoung = calculateRetirement(1995, 6, 'female-worker')
      expect(resYoung.delayedMonths).toBe(60)
      expect(resYoung.statutoryRetirementAge.years).toBe(55)
    })

    it('should calculate female cadre progressive delay (原55岁 -> 58岁, 每4月延1月)', () => {
      const resYoung = calculateRetirement(1995, 1, 'female-cadre')
      expect(resYoung.delayedMonths).toBe(36)
      expect(resYoung.statutoryRetirementAge.years).toBe(58)
    })
  })

  describe('Salary & Personal Income Tax', () => {
    it('should calculate monthly after-tax income under 5000 threshold with zero tax', () => {
      const result = calculateSalary({
        grossMonthly: 4500,
        pensionRate: 8,
        medicalRate: 2,
        unemploymentRate: 0.5,
        housingFundRate: 7,
      })

      expect(result.annualTax).toBe(0)
      expect(result.annualNetSalary).toBeGreaterThan(0)
      expect(result.annualNetSalary).toBe(result.grossAnnual - result.annualInsurance - result.annualHousingFund)
    })

    it('should calculate progressive withholding tax on high income', () => {
      const result = calculateSalary({
        grossMonthly: 30000,
        specialDeductions: {
          childrenEducation: 2000,
          infantCare: 0,
          elderlySupport: 3000,
          housingLoanOrRent: 1500,
          continuingEducation: 0,
        },
      })

      expect(result.annualTax).toBeGreaterThan(0)
      expect(result.annualTaxableIncome).toBeGreaterThan(0)
      expect(result.monthlySchedule.length).toBe(12)
    })
  })

  describe('ROI, NPV, and IRR', () => {
    it('should calculate simple and annualized ROI', () => {
      const roi = calculateROI(100000, [20000, 30000, 80000], 8)

      expect(roi.totalInflow).toBe(130000)
      expect(roi.netProfit).toBe(30000)
      expect(roi.simpleROI).toBeCloseTo(30, 1)
      expect(roi.npv).toBeDefined()
    })

    it('should solve IRR using Newton-Raphson', () => {
      // Initial outflow 100, future cash flow 110 at period 1 -> IRR must be exactly 10%
      const irr = calculateIRR(100, [110])
      expect(irr).not.toBeNull()
      expect(irr!).toBeCloseTo(10, 1)

      // Test NPV at 10% should be zero
      const npvAt10 = calculateNPV(100, [110], 0.1)
      expect(npvAt10).toBeCloseTo(0, 3)
    })
  })

  describe('Deposit Calculator', () => {
    it('should calculate term deposit interest accurately', () => {
      const oneYearItem = DEPOSIT_RATE_DATASET.find((d) => d.id === 'term-1y')!
      expect(oneYearItem).toBeDefined()

      const res = calculateDeposit(100000, oneYearItem)
      expect(res.principal).toBe(100000)
      expect(res.interest).toBeCloseTo(100000 * (oneYearItem.rate / 100), 2)
      expect(res.totalAmount).toBe(res.principal + res.interest)
    })
  })

  describe('Currency Exchange', () => {
    it('should convert USD to CNY and CNY to USD with proper cross-rates', () => {
      const res = convertCurrency(100, 'USD', 'CNY')
      expect(res.error).toBeUndefined()
      expect(res.convertedAmount).toBeGreaterThan(700)

      const back = convertCurrency(res.convertedAmount, 'CNY', 'USD')
      expect(back.convertedAmount).toBeCloseTo(100, 1)
    })
  })
})
