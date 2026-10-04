'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { PiggyBank } from 'lucide-react'

const BANK_RATES = [
  { name: '活期存款', rate: 0.35, min: 0 },
  { name: '3个月定期', rate: 1.50, min: 50 },
  { name: '6个月定期', rate: 1.75, min: 50 },
  { name: '1年定期', rate: 1.95, min: 50 },
  { name: '2年定期', rate: 2.52, min: 50 },
  { name: '3年定期', rate: 3.08, min: 50 },
  { name: '5年定期', rate: 3.75, min: 50 },
  { name: '大额存单(1年)', rate: 2.20, min: 200000 },
  { name: '大额存单(3年)', rate: 3.55, min: 200000 },
]

export default function DepositPage() {
  const [principal, setPrincipal] = useState(100000)
  const [years, setYears] = useState(1)
  const [selectedType, setSelectedType] = useState(0)

  const calculate = () => {
    const type = BANK_RATES[selectedType]
    const rate = type.rate / 100
    const interest = principal * rate * years
    return {
      interest: interest.toFixed(2),
      total: (principal + interest).toFixed(2),
      rate: type.rate
    }
  }

  const result = calculate()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">存款计算器</h1>
            </div>
            <p className="text-[#94A3B8]">活期、定期、大额存单收益对比</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">存款金额 (元)</label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">存期</label>
                <select
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                >
                  {[0.25, 0.5, 1, 2, 3, 5].map(y => (
                    <option key={y} value={y}>{y < 1 ? `${y * 12}个月` : `${y}年`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">存款类型</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                >
                  {BANK_RATES.map((r, i) => (
                    <option key={i} value={i}>{r.name} ({r.rate}%)</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">到期利息</p>
              <p className="text-2xl font-bold text-[#F59E0B]">¥{result.interest}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">本息合计</p>
              <p className="text-2xl font-bold text-[#10B981]">¥{result.total}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">年利率</p>
              <p className="text-2xl font-bold text-white">{result.rate}%</p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">各类型利率对比</h3>
            <div className="space-y-2">
              {BANK_RATES.filter(r => r.min === 0 || principal >= r.min).map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    selectedType === i ? 'bg-[#6366F1]/20 border border-[#6366F1]/40' : 'bg-[#080B14]'
                  }`}
                >
                  <span className="text-[#94A3B8]">{r.name}</span>
                  <span className="text-white font-medium">{r.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
