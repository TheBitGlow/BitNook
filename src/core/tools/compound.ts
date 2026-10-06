import Decimal from 'decimal.js'

export interface CompoundYearRow {
  year: number
  amount: number
  principal: number
  interest: number
}

export interface CompoundResult {
  amount: number
  totalPrincipal: number
  totalInterest: number
  yearlyData: CompoundYearRow[]
  doublingYears: number
}

export function calculateCompound(params: {
  principal: number
  rate: number // annual rate in %
  years: number
  compoundFreq?: number // default 12 (monthly)
  regularMonthlyContribution?: number // monthly regular addition
}): CompoundResult {
  const {
    principal,
    rate,
    years,
    compoundFreq = 12,
    regularMonthlyContribution = 0,
  } = params

  if (principal < 0 || rate < 0 || years <= 0) {
    return {
      amount: 0,
      totalPrincipal: 0,
      totalInterest: 0,
      yearlyData: [],
      doublingYears: 0,
    }
  }

  const p = new Decimal(principal)
  const r = new Decimal(rate).dividedBy(100)
  const n = new Decimal(compoundFreq)
  const monthlyContrib = new Decimal(Math.max(0, regularMonthlyContribution))

  const yearlyData: CompoundYearRow[] = []
  let currentBalance = p
  let cumulativePrincipal = p

  // If no regular contribution, standard formula
  if (monthlyContrib.isZero()) {
    for (let y = 1; y <= years; y++) {
      const t = new Decimal(y)
      const yAmount = p.times(r.dividedBy(n).plus(1).pow(n.times(t)))
      const yAmountNum = Math.round(yAmount.toNumber() * 100) / 100
      const interestNum = Math.round(yAmount.minus(p).toNumber() * 100) / 100

      yearlyData.push({
        year: y,
        amount: yAmountNum,
        principal,
        interest: interestNum,
      })
    }

    const finalAmount = yearlyData[yearlyData.length - 1]?.amount || principal
    const totalInterest = Math.round((finalAmount - principal) * 100) / 100
    const doublingYears = rate > 0 ? Math.round((72 / rate) * 10) / 10 : 0

    return {
      amount: finalAmount,
      totalPrincipal: principal,
      totalInterest,
      yearlyData,
      doublingYears,
    }
  }

  // Monthly simulation for regular contributions
  const periodicRate = r.dividedBy(12)
  for (let m = 1; m <= years * 12; m++) {
    currentBalance = currentBalance.times(periodicRate.plus(1)).plus(monthlyContrib)
    cumulativePrincipal = cumulativePrincipal.plus(monthlyContrib)

    if (m % 12 === 0) {
      const currentYear = m / 12
      const amountNum = Math.round(currentBalance.toNumber() * 100) / 100
      const principalNum = Math.round(cumulativePrincipal.toNumber() * 100) / 100
      const interestNum = Math.round((amountNum - principalNum) * 100) / 100

      yearlyData.push({
        year: currentYear,
        amount: amountNum,
        principal: principalNum,
        interest: Math.max(0, interestNum),
      })
    }
  }

  const finalAmount = yearlyData[yearlyData.length - 1]?.amount || principal
  const finalPrincipal = yearlyData[yearlyData.length - 1]?.principal || principal
  const totalInterest = Math.round((finalAmount - finalPrincipal) * 100) / 100
  const doublingYears = rate > 0 ? Math.round((72 / rate) * 10) / 10 : 0

  return {
    amount: finalAmount,
    totalPrincipal: finalPrincipal,
    totalInterest,
    yearlyData,
    doublingYears,
  }
}
