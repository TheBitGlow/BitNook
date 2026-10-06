export interface SalaryTaxBracket {
  limit: number // Annual taxable income upper bound
  rate: number // Tax rate (0.03 = 3%)
  quickDeduction: number // 速算扣除数
}

// 现行个人所得税居民综合所得税率表（七级超额累进）
export const ANNUAL_TAX_BRACKETS: SalaryTaxBracket[] = [
  { limit: 36000, rate: 0.03, quickDeduction: 0 },
  { limit: 144000, rate: 0.10, quickDeduction: 2520 },
  { limit: 300000, rate: 0.20, quickDeduction: 16920 },
  { limit: 420000, rate: 0.25, quickDeduction: 31920 },
  { limit: 660000, rate: 0.30, quickDeduction: 52920 },
  { limit: 960000, rate: 0.35, quickDeduction: 85920 },
  { limit: Infinity, rate: 0.45, quickDeduction: 181920 },
]

export interface SpecialAdditionalDeductions {
  childrenEducation: number // 子女教育 (2000/月/孩)
  infantCare: number // 3岁以下婴幼儿照护 (2000/月/孩)
  elderlySupport: number // 赡养老人 (独生3000/月, 非独生分摊)
  housingLoanOrRent: number // 住房贷款利息(1000/月) 或 住房租金(1500/月)
  continuingEducation: number // 继续教育 (400/月)
}

export interface SalaryInputParams {
  grossMonthly: number
  pensionRate?: number // 养老保险 默认 8%
  medicalRate?: number // 医疗保险 默认 2%
  unemploymentRate?: number // 失业保险 默认 0.5%
  housingFundRate?: number // 公积金 默认 7% (5%~12%)
  socialSecurityBaseCap?: number // 社保公积金缴费基数上限 (如35283)
  socialSecurityBaseFloor?: number // 缴费基数下限 (如6500)
  specialDeductions?: SpecialAdditionalDeductions
}

export interface MonthlyTaxDetail {
  month: number
  gross: number
  pension: number
  medical: number
  unemployment: number
  housingFund: number
  totalInsuranceFund: number
  specialAdditional: number
  taxableIncomeThisMonth: number
  cumulativeTaxableIncome: number
  cumulativeTax: number
  taxThisMonth: number
  netSalary: number
}

export interface SalaryCalculationResult {
  grossMonthly: number
  grossAnnual: number
  annualInsurance: number
  annualHousingFund: number
  annualSpecialAdditional: number
  annualStandardDeduction: number // 60,000 (5000*12)
  annualTaxableIncome: number
  annualTax: number
  annualNetSalary: number
  averageMonthlyTax: number
  averageMonthlyNet: number
  monthlySchedule: MonthlyTaxDetail[]
  assumptions: {
    standardDeductionPerMonth: number
    pensionRate: number
    medicalRate: number
    unemploymentRate: number
    housingFundRate: number
    taxLawVersion: string
  }
}

export function calculateSalary(params: SalaryInputParams): SalaryCalculationResult {
  const {
    grossMonthly,
    pensionRate = 8,
    medicalRate = 2,
    unemploymentRate = 0.5,
    housingFundRate = 7,
    socialSecurityBaseCap = 35283,
    socialSecurityBaseFloor = 6500,
    specialDeductions = {
      childrenEducation: 0,
      infantCare: 0,
      elderlySupport: 0,
      housingLoanOrRent: 0,
      continuingEducation: 0,
    },
  } = params

  if (grossMonthly <= 0) {
    const emptySchedule: MonthlyTaxDetail[] = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      gross: 0,
      pension: 0,
      medical: 0,
      unemployment: 0,
      housingFund: 0,
      totalInsuranceFund: 0,
      specialAdditional: 0,
      taxableIncomeThisMonth: 0,
      cumulativeTaxableIncome: 0,
      cumulativeTax: 0,
      taxThisMonth: 0,
      netSalary: 0,
    }))

    return {
      grossMonthly: 0,
      grossAnnual: 0,
      annualInsurance: 0,
      annualHousingFund: 0,
      annualSpecialAdditional: 0,
      annualStandardDeduction: 60000,
      annualTaxableIncome: 0,
      annualTax: 0,
      annualNetSalary: 0,
      averageMonthlyTax: 0,
      averageMonthlyNet: 0,
      monthlySchedule: emptySchedule,
      assumptions: {
        standardDeductionPerMonth: 5000,
        pensionRate,
        medicalRate,
        unemploymentRate,
        housingFundRate,
        taxLawVersion: '现行《中华人民共和国个人所得税法》累计预扣法',
      },
    }
  }

  const effectiveBase = Math.min(
    socialSecurityBaseCap,
    Math.max(socialSecurityBaseFloor, grossMonthly)
  )

  const monthlyPension = (effectiveBase * pensionRate) / 100
  const monthlyMedical = (effectiveBase * medicalRate) / 100
  const monthlyUnemployment = (effectiveBase * unemploymentRate) / 100
  const monthlyHousingFund = (effectiveBase * housingFundRate) / 100
  const monthlyTotalInsurance =
    monthlyPension + monthlyMedical + monthlyUnemployment + monthlyHousingFund

  const monthlySpecialAdditional =
    specialDeductions.childrenEducation +
    specialDeductions.infantCare +
    specialDeductions.elderlySupport +
    specialDeductions.housingLoanOrRent +
    specialDeductions.continuingEducation

  const standardDeductionPerMonth = 5000

  // Cumulative withholding calculation across 12 months
  const monthlySchedule: MonthlyTaxDetail[] = []
  let cumulativeTaxPaid = 0

  for (let m = 1; m <= 12; m++) {
    const cumulativeGross = grossMonthly * m
    const cumulativeInsurance = monthlyTotalInsurance * m
    const cumulativeSpecialAdd = monthlySpecialAdditional * m
    const cumulativeStandard = standardDeductionPerMonth * m

    const cumulativeTaxable = Math.max(
      0,
      cumulativeGross - cumulativeInsurance - cumulativeSpecialAdd - cumulativeStandard
    )

    // Find bracket for cumulativeTaxable
    let totalTaxDue = 0
    for (const bracket of ANNUAL_TAX_BRACKETS) {
      if (cumulativeTaxable <= bracket.limit) {
        totalTaxDue = Math.max(0, cumulativeTaxable * bracket.rate - bracket.quickDeduction)
        break
      }
    }

    const taxThisMonth = Math.max(0, totalTaxDue - cumulativeTaxPaid)
    cumulativeTaxPaid += taxThisMonth

    const netSalary = grossMonthly - monthlyTotalInsurance - taxThisMonth

    monthlySchedule.push({
      month: m,
      gross: grossMonthly,
      pension: Math.round(monthlyPension * 100) / 100,
      medical: Math.round(monthlyMedical * 100) / 100,
      unemployment: Math.round(monthlyUnemployment * 100) / 100,
      housingFund: Math.round(monthlyHousingFund * 100) / 100,
      totalInsuranceFund: Math.round(monthlyTotalInsurance * 100) / 100,
      specialAdditional: Math.round(monthlySpecialAdditional * 100) / 100,
      taxableIncomeThisMonth: Math.max(
        0,
        grossMonthly - monthlyTotalInsurance - monthlySpecialAdditional - standardDeductionPerMonth
      ),
      cumulativeTaxableIncome: Math.round(cumulativeTaxable * 100) / 100,
      cumulativeTax: Math.round(totalTaxDue * 100) / 100,
      taxThisMonth: Math.round(taxThisMonth * 100) / 100,
      netSalary: Math.round(netSalary * 100) / 100,
    })
  }

  const annualGross = grossMonthly * 12
  const annualInsurance = (monthlyPension + monthlyMedical + monthlyUnemployment) * 12
  const annualHousingFund = monthlyHousingFund * 12
  const annualSpecialAdditional = monthlySpecialAdditional * 12
  const annualStandardDeduction = standardDeductionPerMonth * 12
  const annualTax = cumulativeTaxPaid
  const annualNetSalary = annualGross - monthlyTotalInsurance * 12 - annualTax

  return {
    grossMonthly,
    grossAnnual: annualGross,
    annualInsurance: Math.round(annualInsurance * 100) / 100,
    annualHousingFund: Math.round(annualHousingFund * 100) / 100,
    annualSpecialAdditional: Math.round(annualSpecialAdditional * 100) / 100,
    annualStandardDeduction,
    annualTaxableIncome: monthlySchedule[11].cumulativeTaxableIncome,
    annualTax: Math.round(annualTax * 100) / 100,
    annualNetSalary: Math.round(annualNetSalary * 100) / 100,
    averageMonthlyTax: Math.round((annualTax / 12) * 100) / 100,
    averageMonthlyNet: Math.round((annualNetSalary / 12) * 100) / 100,
    monthlySchedule,
    assumptions: {
      standardDeductionPerMonth,
      pensionRate,
      medicalRate,
      unemploymentRate,
      housingFundRate,
      taxLawVersion: '现行《中华人民共和国个人所得税法》累计预扣法',
    },
  }
}
