import { calculateMortgage, PaymentMethod, MortgageResult } from './mortgage'

export interface LoanPlanInput {
  id: string
  name: string
  amount: number
  years: number
  rate: number
  paymentMethod: PaymentMethod
}

export interface ComparedPlan extends LoanPlanInput {
  result: MortgageResult
  isLowestInterest: boolean
  isLowestMonthly: boolean
}

export function compareLoanPlans(plans: LoanPlanInput[]): ComparedPlan[] {
  if (!plans.length) return []

  const evaluated = plans.map(p => {
    const res = calculateMortgage({
      loanAmount: p.amount,
      annualRate: p.rate,
      years: p.years,
      paymentMethod: p.paymentMethod,
    })
    return {
      ...p,
      result: res,
      isLowestInterest: false,
      isLowestMonthly: false,
    }
  })

  let minInterest = Infinity
  let minMonthly = Infinity

  for (const item of evaluated) {
    if (item.result.totalInterest < minInterest) {
      minInterest = item.result.totalInterest
    }
    if (item.result.firstMonthPayment < minMonthly) {
      minMonthly = item.result.firstMonthPayment
    }
  }

  for (const item of evaluated) {
    if (item.result.totalInterest === minInterest) {
      item.isLowestInterest = true
    }
    if (item.result.firstMonthPayment === minMonthly) {
      item.isLowestMonthly = true
    }
  }

  return evaluated
}
