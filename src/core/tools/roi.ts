export interface CashFlowPeriod {
  period: number // year
  amount: number
}

export interface ROIResult {
  initialInvestment: number
  totalInflow: number
  netProfit: number
  simpleROI: number // percentage
  annualizedROI: number // percentage
  npv: number // Net Present Value at discount rate
  irr: number | null // Internal Rate of Return in percentage, or null if no solution
  irrStatus: 'converged' | 'no-solution' | 'multiple-roots'
  cashFlows: CashFlowPeriod[]
}

/**
 * Calculates Net Present Value for an initial investment and cash flows at discount rate r.
 * r is expressed as a decimal (e.g. 0.08 for 8%).
 */
export function calculateNPV(initialOutflow: number, cashFlows: number[], r: number): number {
  let npv = -initialOutflow
  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + r, t + 1)
  }
  return npv
}

/**
 * Derivative of NPV with respect to discount rate r.
 */
function npvDerivative(cashFlows: number[], r: number): number {
  let d = 0
  for (let t = 0; t < cashFlows.length; t++) {
    d -= ((t + 1) * cashFlows[t]) / Math.pow(1 + r, t + 2)
  }
  return d
}

/**
 * Calculates Internal Rate of Return (IRR) using Newton-Raphson with bisection fallback.
 * Returns IRR as percentage (e.g. 14.5 for 14.5%), or null if no valid IRR exists.
 */
export function calculateIRR(initialOutflow: number, cashFlows: number[]): number | null {
  if (initialOutflow <= 0 || cashFlows.length === 0) return null

  // Check if all cashflows are negative or all positive (cannot have IRR)
  const hasPositive = cashFlows.some(c => c > 0)
  if (!hasPositive) return null

  // Newton-Raphson method
  let r = 0.1 // initial guess: 10%
  const maxIterations = 100
  const tolerance = 1e-7

  for (let i = 0; i < maxIterations; i++) {
    if (r <= -0.999) r = -0.99

    const f = calculateNPV(initialOutflow, cashFlows, r)
    if (Math.abs(f) < tolerance) {
      return Math.round(r * 10000) / 100
    }

    const df = npvDerivative(cashFlows, r)
    if (Math.abs(df) < 1e-12) break

    const nextR = r - f / df

    // If diverged out of reasonable bounds, break to bisection
    if (isNaN(nextR) || nextR < -0.99 || nextR > 50) break
    r = nextR
  }

  // Bisection fallback on [-0.99, 10.0]
  let low = -0.99
  let high = 10.0
  const fLow = calculateNPV(initialOutflow, cashFlows, low)
  const fHigh = calculateNPV(initialOutflow, cashFlows, high)

  if (fLow * fHigh > 0) {
    // No sign change in reasonable domain
    return null
  }

  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2
    const fMid = calculateNPV(initialOutflow, cashFlows, mid)

    if (Math.abs(fMid) < tolerance || (high - low) / 2 < tolerance) {
      return Math.round(mid * 10000) / 100
    }

    if (fMid * calculateNPV(initialOutflow, cashFlows, low) < 0) {
      high = mid
    } else {
      low = mid
    }
  }

  return Math.round(((low + high) / 2) * 10000) / 100
}

export function calculateInvestmentMetrics(
  initialInvestment: number,
  cashFlowsList: number[],
  discountRatePercent: number
): ROIResult {
  const discountRate = discountRatePercent / 100
  const totalInflow = cashFlowsList.reduce((sum, val) => sum + val, 0)
  const netProfit = totalInflow - initialInvestment

  const simpleROI =
    initialInvestment > 0
      ? Math.round((netProfit / initialInvestment) * 10000) / 100
      : 0

  const years = cashFlowsList.length
  let annualizedROI = 0
  if (years > 0 && initialInvestment > 0 && totalInflow > 0) {
    annualizedROI =
      Math.round((Math.pow(totalInflow / initialInvestment, 1 / years) - 1) * 10000) / 100
  }

  const npv =
    Math.round(calculateNPV(initialInvestment, cashFlowsList, discountRate) * 100) / 100

  const irr = calculateIRR(initialInvestment, cashFlowsList)

  const cashFlows: CashFlowPeriod[] = cashFlowsList.map((amt, idx) => ({
    period: idx + 1,
    amount: amt,
  }))

  return {
    initialInvestment,
    totalInflow: Math.round(totalInflow * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    simpleROI,
    annualizedROI,
    npv,
    irr,
    irrStatus: irr !== null ? 'converged' : 'no-solution',
    cashFlows,
  }
}

export const calculateROI = calculateInvestmentMetrics
