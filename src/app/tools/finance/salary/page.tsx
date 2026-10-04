'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Wallet } from 'lucide-react'

export default function SalaryPage() {
  const [grossSalary, setGrossSalary] = useState(10000)
  const [isAnnual, setIsAnnual] = useState(false)
  const [insuranceRate, setInsuranceRate] = useState(10.5)
  const [housingFund, setHousingFund] = useState(12)
  const [city, setCity] = useState('beijing')

  const cityConfigs: Record<string, { taxThreshold: number; rates: [number, number][] }> = {
    beijing: { taxThreshold: 5000, rates: [[3000, 0.03], [12000, 0.10], [25000, 0.20], [35000, 0.25], [55000, 0.30], [80000, 0.35], [Infinity, 0.45]] },
    shanghai: { taxThreshold: 5000, rates: [[3000, 0.03], [12000, 0.10], [25000, 0.20], [35000, 0.25], [55000, 0.30], [80000, 0.35], [Infinity, 0.45]] },
    other: { taxThreshold: 5000, rates: [[3000, 0.03], [12000, 0.10], [25000, 0.20], [35000, 0.25], [55000, 0.30], [80000, 0.35], [Infinity, 0.45]] },
  }

  const calculate = () => {
    const annual = isAnnual ? grossSalary : grossSalary * 12
    const config = cityConfigs[city]

    // 社保公积金计算基数（简化）
    const insuranceBase = Math.min(annual, 360000) // 上限36万

    const insurance = insuranceBase * (insuranceRate / 100)
    const housing = insuranceBase * (housingFund / 100)
    const totalDeduction = insurance + housing

    const taxableIncome = Math.max(0, annual - totalDeduction - config.taxThreshold * 12)

    // 个税计算
    let tax = 0
    let remaining = taxableIncome
    for (const [threshold, rate] of config.rates) {
      if (taxableIncome <= threshold) break
      const prevThreshold = config.rates[config.rates.findIndex(r => r[0] === threshold) - 1]?.[0] || 0
      tax += (Math.min(taxableIncome, threshold) - prevThreshold) * rate
    }

    const monthlyTax = tax / 12
    const netMonthly = (annual - tax - totalDeduction) / 12

    return {
      gross: annual / 12,
      insurance: insurance / 12,
      housing: housing / 12,
      tax: monthlyTax,
      net: netMonthly
    }
  }

  const result = calculate()

  const formatMoney = (n: number) => n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">工资计算器</h1>
            </div>
            <p className="text-[#94A3B8]">税前税后双向计算</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm text-[#94A3B8] mb-2">税前工资</label>
              <input
                type="number"
                value={grossSalary}
                onChange={(e) => setGrossSalary(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white text-2xl"
              />
            </div>

            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isAnnual}
                  onChange={() => setIsAnnual(false)}
                  className="accent-[#6366F1]"
                />
                <span className="text-[#94A3B8]">月薪</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isAnnual}
                  onChange={() => setIsAnnual(true)}
                  className="accent-[#6366F1]"
                />
                <span className="text-[#94A3B8]">年薪</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">社保费率</label>
                <select
                  value={insuranceRate}
                  onChange={(e) => setInsuranceRate(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                >
                  <option value={8}>8%</option>
                  <option value={10.5}>10.5%</option>
                  <option value={11}>11%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">公积金</label>
                <select
                  value={housingFund}
                  onChange={(e) => setHousingFund(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                >
                  <option value={5}>5%</option>
                  <option value={7}>7%</option>
                  <option value={12}>12%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="glass-card p-6 mb-6">
            <div className="text-center mb-6">
              <p className="text-sm text-[#94A3B8] mb-2">税后月薪</p>
              <p className="text-5xl font-bold text-[#10B981]">¥{formatMoney(result.net)}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#080B14] rounded">
                <span className="text-[#94A3B8]">税前工资</span>
                <span className="text-white font-medium">¥{formatMoney(result.gross)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#080B14] rounded">
                <span className="text-[#94A3B8]">社保</span>
                <span className="text-[#EF4444]">-¥{formatMoney(result.insurance)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#080B14] rounded">
                <span className="text-[#94A3B8]">公积金</span>
                <span className="text-[#EF4444]">-¥{formatMoney(result.housing)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#080B14] rounded">
                <span className="text-[#94A3B8]">个人所得税</span>
                <span className="text-[#EF4444]">-¥{formatMoney(result.tax)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#10B981]/10 rounded border border-[#10B981]/30">
                <span className="text-white font-medium">税后工资</span>
                <span className="text-[#10B981] font-bold">¥{formatMoney(result.net)}</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-[#111927]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              本计算基于2024年最新税率，使用简化算法。实际工资以当地社保公积金政策和个税专项附加扣除为准。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
