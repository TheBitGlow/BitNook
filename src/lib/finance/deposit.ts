export interface DepositRateItem {
  id: string
  name: string
  nameEn: string
  termMonths: number
  rate: number // annual rate in %
  minAmount: number
  category: 'demand' | 'term' | 'cd' // demand=活期, term=整存整取, cd=大额存单
  dataType: 'bank-listed-benchmark'
  source: string
  effectiveDate: string
  updatedAt: string
  note: string
}

export const DEPOSIT_RATE_DATASET: DepositRateItem[] = [
  {
    id: 'demand-standard',
    name: '活期存款',
    nameEn: 'Demand Deposit',
    termMonths: 0,
    rate: 0.15,
    minAmount: 1,
    category: 'demand',
    dataType: 'bank-listed-benchmark',
    source: '六大国有商业银行挂牌基准利率参考',
    effectiveDate: '2025-01-01',
    updatedAt: '2026-03-01',
    note: '随存随取，按季结息',
  },
  {
    id: 'term-3m',
    name: '3个月定期整存整取',
    nameEn: '3-Month Term Deposit',
    termMonths: 3,
    rate: 0.90,
    minAmount: 50,
    category: 'term',
    dataType: 'bank-listed-benchmark',
    source: '主流商业银行公布执行挂牌利率',
    effectiveDate: '2025-01-01',
    updatedAt: '2026-03-01',
    note: '到期一次还本付息',
  },
  {
    id: 'term-6m',
    name: '6个月定期整存整取',
    nameEn: '6-Month Term Deposit',
    termMonths: 6,
    rate: 1.10,
    minAmount: 50,
    category: 'term',
    dataType: 'bank-listed-benchmark',
    source: '主流商业银行公布执行挂牌利率',
    effectiveDate: '2025-01-01',
    updatedAt: '2026-03-01',
    note: '到期一次还本付息',
  },
  {
    id: 'term-1y',
    name: '1年期定期整存整取',
    nameEn: '1-Year Term Deposit',
    termMonths: 12,
    rate: 1.25,
    minAmount: 50,
    category: 'term',
    dataType: 'bank-listed-benchmark',
    source: '主流商业银行公布执行挂牌利率',
    effectiveDate: '2025-01-01',
    updatedAt: '2026-03-01',
    note: '普遍适用的短期整存整取',
  },
  {
    id: 'term-2y',
    name: '2年期定期整存整取',
    nameEn: '2-Year Term Deposit',
    termMonths: 24,
    rate: 1.35,
    minAmount: 50,
    category: 'term',
    dataType: 'bank-listed-benchmark',
    source: '主流商业银行公布执行挂牌利率',
    effectiveDate: '2025-01-01',
    updatedAt: '2026-03-01',
    note: '中长期稳健储蓄',
  },
  {
    id: 'term-3y',
    name: '3年期定期整存整取',
    nameEn: '3-Year Term Deposit',
    termMonths: 36,
    rate: 1.65,
    minAmount: 50,
    category: 'term',
    dataType: 'bank-listed-benchmark',
    source: '主流商业银行公布执行挂牌利率',
    effectiveDate: '2025-01-01',
    updatedAt: '2026-03-01',
    note: '长期定期存款',
  },
  {
    id: 'term-5y',
    name: '5年期定期整存整取',
    nameEn: '5-Year Term Deposit',
    termMonths: 60,
    rate: 1.70,
    minAmount: 50,
    category: 'term',
    dataType: 'bank-listed-benchmark',
    source: '主流商业银行公布执行挂牌利率',
    effectiveDate: '2025-01-01',
    updatedAt: '2026-03-01',
    note: '最长法定挂牌整存整取期限',
  },
  {
    id: 'cd-1y',
    name: '大额存单 (1年期)',
    nameEn: 'Certificate of Deposit (1-Year)',
    termMonths: 12,
    rate: 1.45,
    minAmount: 200000,
    category: 'cd',
    dataType: 'bank-listed-benchmark',
    source: '商业银行大额存单发行基准参数',
    effectiveDate: '2025-01-01',
    updatedAt: '2026-03-01',
    note: '起存起点 20 万元人民币，可转让',
  },
  {
    id: 'cd-3y',
    name: '大额存单 (3年期)',
    nameEn: 'Certificate of Deposit (3-Year)',
    termMonths: 36,
    rate: 1.90,
    minAmount: 200000,
    category: 'cd',
    dataType: 'bank-listed-benchmark',
    source: '商业银行大额存单发行基准参数',
    effectiveDate: '2025-01-01',
    updatedAt: '2026-03-01',
    note: '起存起点 20 万元人民币，可转让',
  },
]

export interface DepositCalculationResult {
  principal: number
  interest: number
  totalAmount: number
  rate: number
  durationYears: number
  isEligible: boolean
  minRequiredAmount: number
}

export function calculateDeposit(
  principal: number,
  depositItem: DepositRateItem,
  customRate?: number
): DepositCalculationResult {
  const effectiveRate = customRate !== undefined && !isNaN(customRate) ? customRate : depositItem.rate
  const durationYears = depositItem.termMonths > 0 ? depositItem.termMonths / 12 : 1
  const isEligible = principal >= depositItem.minAmount

  const interest = Math.round(principal * (effectiveRate / 100) * durationYears * 100) / 100
  const totalAmount = Math.round((principal + interest) * 100) / 100

  return {
    principal,
    interest,
    totalAmount,
    rate: effectiveRate,
    durationYears,
    isEligible,
    minRequiredAmount: depositItem.minAmount,
  }
}
