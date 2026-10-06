export interface CurrencyInfo {
  code: string
  name: string
  nameEn: string
  symbol: string
  // Price in CNY: 1 Unit of Currency = cnyPerUnit CNY
  // e.g. 1 USD = 7.235 CNY, 1 JPY = 0.0482 CNY, 1 EUR = 7.842 CNY
  cnyPerUnit: number
}

export interface ExchangeRateDataset {
  source: string
  effectiveDate: string
  updatedAt: string
  disclaimer: string
  rates: CurrencyInfo[]
}

// Published reference benchmarks from central banks / interbank market
export const REFERENCE_RATES_DATASET: ExchangeRateDataset = {
  source: '中国外汇交易中心 (CFETS) 与央行基准参考汇率',
  effectiveDate: '2026-03-25',
  updatedAt: '2026-03-25 10:00:00 UTC+8',
  disclaimer: '本汇率换算器提供中行与外汇交易中心公开基准参考汇率，银行实际柜台结汇/售汇价存在买入卖出差价，请以经办金融机构实际成交结果为准。',
  rates: [
    { code: 'CNY', name: '人民币', nameEn: 'Chinese Yuan', symbol: '¥', cnyPerUnit: 1.0 },
    { code: 'USD', name: '美元', nameEn: 'US Dollar', symbol: '$', cnyPerUnit: 7.235 },
    { code: 'EUR', name: '欧元', nameEn: 'Euro', symbol: '€', cnyPerUnit: 7.842 },
    { code: 'GBP', name: '英镑', nameEn: 'British Pound', symbol: '£', cnyPerUnit: 9.185 },
    { code: 'HKD', name: '港币', nameEn: 'Hong Kong Dollar', symbol: 'HK$', cnyPerUnit: 0.928 },
    { code: 'JPY', name: '日元 (100单位)', nameEn: 'Japanese Yen (per 100)', symbol: '¥', cnyPerUnit: 4.82 },
    { code: 'AUD', name: '澳大利亚元', nameEn: 'Australian Dollar', symbol: 'A$', cnyPerUnit: 4.685 },
    { code: 'CAD', name: '加拿大元', nameEn: 'Canadian Dollar', symbol: 'C$', cnyPerUnit: 5.245 },
    { code: 'SGD', name: '新加坡元', nameEn: 'Singapore Dollar', symbol: 'S$', cnyPerUnit: 5.412 },
    { code: 'CHF', name: '瑞士法郎', nameEn: 'Swiss Franc', symbol: 'CHF', cnyPerUnit: 8.165 },
    { code: 'KRW', name: '韩元 (100单位)', nameEn: 'South Korean Won (per 100)', symbol: '₩', cnyPerUnit: 0.528 },
    { code: 'NZD', name: '新西兰元', nameEn: 'New Zealand Dollar', symbol: 'NZ$', cnyPerUnit: 4.312 },
    { code: 'MYR', name: '马来西亚林吉特', nameEn: 'Malaysian Ringgit', symbol: 'RM', cnyPerUnit: 1.625 },
    { code: 'THB', name: '泰铢 (100单位)', nameEn: 'Thai Baht (per 100)', symbol: '฿', cnyPerUnit: 20.85 },
    { code: 'RUB', name: '俄罗斯卢布 (100单位)', nameEn: 'Russian Ruble (per 100)', symbol: '₽', cnyPerUnit: 7.85 },
  ],
}

export function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string,
  dataset: ExchangeRateDataset = REFERENCE_RATES_DATASET
): { convertedAmount: number; rate: number; error?: string } {
  if (amount < 0 || isNaN(amount)) {
    return { convertedAmount: 0, rate: 1, error: '金额必须为正数' }
  }

  const fromCurr = dataset.rates.find(c => c.code === fromCode)
  const toCurr = dataset.rates.find(c => c.code === toCode)

  if (!fromCurr || !toCurr) {
    return { convertedAmount: 0, rate: 1, error: '未找到指定货币汇率数据' }
  }

  // 1 fromCurr = cnyPerUnit CNY
  // 1 toCurr = cnyPerUnit CNY
  // Rate: 1 fromCurr = (fromCurr.cnyPerUnit / toCurr.cnyPerUnit) toCurr
  const directRate = fromCurr.cnyPerUnit / toCurr.cnyPerUnit
  const convertedAmount = Math.round(amount * directRate * 10000) / 10000

  return { convertedAmount, rate: directRate }
}
