export type RetirementCategory =
  | 'male' // 男职工 (原60岁 -> 63岁, 每4个月延1个月)
  | 'female-cadre' // 女职工/干部/管理技术岗位 (原55岁 -> 58岁, 每4个月延1个月)
  | 'female-worker' // 女职工/工人岗位 (原50岁 -> 55岁, 每2个月延1个月)

export interface RetirementCalculationResult {
  birthYear: number
  birthMonth: number
  category: RetirementCategory
  categoryLabel: string
  originalRetirementAge: number
  originalRetirementDate: string // YYYY-MM
  delayedMonths: number
  statutoryRetirementAge: { years: number; months: number }
  statutoryRetirementDate: string // YYYY-MM
  earliestFlexibleRetirementDate: string // YYYY-MM (弹性提前退休)
  latestFlexibleRetirementDate: string // YYYY-MM (弹性延迟退休)
  minContributionYears: number // 最低缴费年限
  policySource: string
  policyEffectiveDate: string
  updatedAt: string
}

export const RETIREMENT_POLICY_METADATA = {
  policyName: '《全国人民代表大会常务委员会关于实施渐进式延迟法定退休年龄的决定》',
  passDate: '2024-09-13',
  effectiveDate: '2025-01-01',
  updatedAt: '2026-03-25',
  source: '全国人民代表大会常务委员会公报 / 人力资源和社会保障部',
  disclaimer:
    '本工具依据国家法定改革方案实施时间表与计算对照表设计。如地方或行业有特殊提前退休政策（如高空、高温、特繁体力劳动或病退），请以当地社保局正式审批档案为准。',
}

/**
 * Calculates statutory retirement according to China's 2025 progressive reform.
 */
export function calculateRetirement(
  birthYear: number,
  birthMonth: number,
  category: RetirementCategory
): RetirementCalculationResult {
  // Validate month bounds
  const m = Math.max(1, Math.min(12, Math.floor(birthMonth)))
  const y = Math.floor(birthYear)

  // Configuration for category
  let originalAgeYears = 60
  let targetAgeYears = 63
  let delayCycleMonths = 4 // delay 1 month every N months
  let categoryLabel = '男职工'

  if (category === 'female-cadre') {
    originalAgeYears = 55
    targetAgeYears = 58
    delayCycleMonths = 4
    categoryLabel = '女职工（干部/管理与专业技术岗位，原55周岁）'
  } else if (category === 'female-worker') {
    originalAgeYears = 50
    targetAgeYears = 55
    delayCycleMonths = 2
    categoryLabel = '女职工（工人岗位，原50周岁）'
  } else {
    categoryLabel = '男职工（原60周岁）'
  }

  // Original retirement date: birthYear + originalAge, birthMonth
  const origRetireYear = y + originalAgeYears
  const origRetireMonth = m

  // Check if original retirement falls before policy effective date (2025-01-01)
  const isBeforeReform =
    origRetireYear < 2025 || (origRetireYear === 2025 && origRetireMonth < 1)

  let delayedMonths = 0
  const maxDelayMonths = (targetAgeYears - originalAgeYears) * 12

  if (!isBeforeReform) {
    // Months between 2025-01 and original retirement month (inclusive: 2025-01 is month 1)
    const diffMonths = (origRetireYear - 2025) * 12 + (origRetireMonth - 1) + 1
    // Statutory formula: Math.ceil(diffMonths / delayCycleMonths)
    const calculatedDelay = Math.ceil(diffMonths / delayCycleMonths)
    delayedMonths = Math.min(maxDelayMonths, Math.max(1, calculatedDelay))
  }

  // Statutory retirement month = original retirement month + delayedMonths
  const totalMonthsFromZero = origRetireYear * 12 + (origRetireMonth - 1) + delayedMonths
  const statutoryYear = Math.floor(totalMonthsFromZero / 12)
  const statutoryMonth = (totalMonthsFromZero % 12) + 1

  const statutoryAgeTotalMonths = originalAgeYears * 12 + delayedMonths
  const statutoryAgeYears = Math.floor(statutoryAgeTotalMonths / 12)
  const statutoryAgeRemainingMonths = statutoryAgeTotalMonths % 12

  // Flexible early retirement: can be advanced up to 3 years (36 months),
  // but cannot be earlier than original statutory age.
  const maxEarlyMonths = Math.min(36, delayedMonths)
  const earlyTotalMonths = totalMonthsFromZero - maxEarlyMonths
  const earlyYear = Math.floor(earlyTotalMonths / 12)
  const earlyMonth = (earlyTotalMonths % 12) + 1

  // Flexible late retirement: can be delayed up to 3 years (36 months).
  const lateTotalMonths = totalMonthsFromZero + 36
  const lateYear = Math.floor(lateTotalMonths / 12)
  const lateMonth = (lateTotalMonths % 12) + 1

  // Minimum pension contribution years progression:
  // From 2030, gradually increase from 15 to 20 years (+6 months every year from 2030 to 2039)
  let minContributionYears = 15
  if (statutoryYear >= 2030) {
    const yearsPast2030 = statutoryYear - 2030 + 1
    const extraYears = Math.min(5, yearsPast2030 * 0.5)
    minContributionYears = 15 + extraYears
  }

  const formatYM = (year: number, month: number) =>
    `${year}年${month.toString().padStart(2, '0')}月`

  return {
    birthYear: y,
    birthMonth: m,
    category,
    categoryLabel,
    originalRetirementAge: originalAgeYears,
    originalRetirementDate: formatYM(origRetireYear, origRetireMonth),
    delayedMonths,
    statutoryRetirementAge: {
      years: statutoryAgeYears,
      months: statutoryAgeRemainingMonths,
    },
    statutoryRetirementDate: formatYM(statutoryYear, statutoryMonth),
    earliestFlexibleRetirementDate: formatYM(earlyYear, earlyMonth),
    latestFlexibleRetirementDate: formatYM(lateYear, lateMonth),
    minContributionYears,
    policySource: RETIREMENT_POLICY_METADATA.source,
    policyEffectiveDate: RETIREMENT_POLICY_METADATA.effectiveDate,
    updatedAt: RETIREMENT_POLICY_METADATA.updatedAt,
  }
}
