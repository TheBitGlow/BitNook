import Decimal from 'decimal.js'

export type PaymentMethod = 'equal-payment' | 'equal-principal'
export type MortgageInputMode = 'house-price' | 'loan-amount'

export interface MortgageScheduleRow {
  month: number
  monthlyPayment: number
  principal: number
  interest: number
  remainingBalance: number
}

export interface MortgageResult {
  loanAmount: number
  downPayment: number
  totalPayment: number
  totalInterest: number
  firstMonthPayment: number
  lastMonthPayment: number
  monthlyDecrease?: number // For equal-principal
  schedule: MortgageScheduleRow[]
  paymentMethod: PaymentMethod
}

export type MortgageDataType = 'market-sample' | 'benchmark-reference' | 'historical-reference'

export interface MortgagePolicyPreset {
  name: string
  commercialRate: number
  providentRate: number
  description: string
  dataType: MortgageDataType
  source: string
  effectiveDate: string
  updatedAt: string
}

export const MORTGAGE_POLICY_PRESETS: MortgagePolicyPreset[] = [
  {
    name: '2025-2026 市场调研参考 (非全国统一定价)',
    commercialRate: 3.15,
    providentRate: 2.85,
    description: '重点城市首套房商业房贷主流执行利率抽样中位数（LPR加减点因城而异，仅供参考）',
    dataType: 'market-sample',
    source: '重点一二线城市主流商业银行放款利率中位数调研',
    effectiveDate: '2025-01-01',
    updatedAt: '2026-03-25',
  },
  {
    name: '基准 5 年期以上 LPR (3.60%)',
    commercialRate: 3.60,
    providentRate: 2.85,
    description: '中国人民银行授权全国银行间同业拆借中心公布的 5 年期以上 LPR 定价基准',
    dataType: 'benchmark-reference',
    source: '中国人民银行 / 全国银行间同业拆借中心 (NIFC)',
    effectiveDate: '2024-10-21',
    updatedAt: '2026-03-20',
  },
  {
    name: '存量房贷调整后历史参考 (3.90%)',
    commercialRate: 3.90,
    providentRate: 3.10,
    description: '早期发放经批量下调后的存量房贷历史参考利率，非当前新发利率',
    dataType: 'historical-reference',
    source: '存量商业性个人住房贷款利率批量调整公告',
    effectiveDate: '2024-10-31',
    updatedAt: '2026-03-01',
  },
]

export function calculateMortgage(params: {
  loanAmount: number
  downPayment?: number
  annualRate: number // e.g. 3.15 for 3.15%
  years: number
  paymentMethod: PaymentMethod
}): MortgageResult {
  const { loanAmount, downPayment = 0, annualRate, years, paymentMethod } = params

  if (loanAmount <= 0 || years <= 0) {
    return {
      loanAmount: 0,
      downPayment,
      totalPayment: 0,
      totalInterest: 0,
      firstMonthPayment: 0,
      lastMonthPayment: 0,
      schedule: [],
      paymentMethod,
    }
  }

  const principal = new Decimal(loanAmount)
  const totalMonths = years * 12
  const schedule: MortgageScheduleRow[] = []

  // Edge case: 0% interest rate
  if (annualRate <= 0) {
    const monthlyPrincipal = principal.dividedBy(totalMonths).toNumber()
    let balance = principal.toNumber()

    for (let m = 1; m <= totalMonths; m++) {
      const p = m === totalMonths ? balance : Math.round(monthlyPrincipal * 100) / 100
      balance = Math.max(0, balance - p)
      schedule.push({
        month: m,
        monthlyPayment: p,
        principal: p,
        interest: 0,
        remainingBalance: balance,
      })
    }

    return {
      loanAmount,
      downPayment,
      totalPayment: loanAmount,
      totalInterest: 0,
      firstMonthPayment: schedule[0]?.monthlyPayment || 0,
      lastMonthPayment: schedule[schedule.length - 1]?.monthlyPayment || 0,
      schedule,
      paymentMethod,
    }
  }

  const monthlyRate = new Decimal(annualRate).dividedBy(100).dividedBy(12)

  if (paymentMethod === 'equal-payment') {
    // 等额本息 (Equal Principal & Interest)
    // Monthly = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const onePlusR = monthlyRate.plus(1)
    const powN = onePlusR.pow(totalMonths)
    const monthlyPaymentDec = principal.times(monthlyRate).times(powN).dividedBy(powN.minus(1))
    const fixedMonthlyPayment = monthlyPaymentDec.toNumber()

    let balance = principal.toNumber()
    let sumInterest = 0

    for (let m = 1; m <= totalMonths; m++) {
      const interest = balance * monthlyRate.toNumber()
      let p = fixedMonthlyPayment - interest
      if (m === totalMonths) {
        p = balance
      }
      balance = Math.max(0, balance - p)
      sumInterest += interest

      schedule.push({
        month: m,
        monthlyPayment: Math.round((p + interest) * 100) / 100,
        principal: Math.round(p * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        remainingBalance: Math.round(balance * 100) / 100,
      })
    }

    const totalPayment = loanAmount + sumInterest

    return {
      loanAmount,
      downPayment,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(sumInterest * 100) / 100,
      firstMonthPayment: schedule[0]?.monthlyPayment || 0,
      lastMonthPayment: schedule[schedule.length - 1]?.monthlyPayment || 0,
      schedule,
      paymentMethod,
    }
  } else {
    // 等额本金 (Equal Principal)
    // 每月本金相同 = P / n
    // 每月利息 = 剩余本金 * r
    const monthlyPrincipalDec = principal.dividedBy(totalMonths)
    const fixedPrincipal = monthlyPrincipalDec.toNumber()

    let balance = principal.toNumber()
    let sumInterest = 0
    let monthlyDecrease = 0

    for (let m = 1; m <= totalMonths; m++) {
      const interest = balance * monthlyRate.toNumber()
      const p = m === totalMonths ? balance : fixedPrincipal
      const monthlyPayment = p + interest
      balance = Math.max(0, balance - p)
      sumInterest += interest

      if (m === 2) {
        monthlyDecrease = schedule[0].monthlyPayment - monthlyPayment
      }

      schedule.push({
        month: m,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        principal: Math.round(p * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        remainingBalance: Math.round(balance * 100) / 100,
      })
    }

    const totalPayment = loanAmount + sumInterest

    return {
      loanAmount,
      downPayment,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(sumInterest * 100) / 100,
      firstMonthPayment: schedule[0]?.monthlyPayment || 0,
      lastMonthPayment: schedule[schedule.length - 1]?.monthlyPayment || 0,
      monthlyDecrease: Math.round(monthlyDecrease * 100) / 100,
      schedule,
      paymentMethod,
    }
  }
}
