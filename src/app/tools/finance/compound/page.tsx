'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { TrendingUp } from 'lucide-react'
import Decimal from 'decimal.js'

export default function CompoundPage() {
  const [principal, setPrincipal] = useState(10000)
  const [rate, setRate] = useState(5)
  const [years, setYears] = useState(10)
  const [compoundFreq, setCompoundFreq] = useState(12) // monthly

  const results = useMemo(() => {
    const p = new Decimal(principal)
    const r = new Decimal(rate).dividedBy(100)
    const n = new Decimal(compoundFreq)
    const t = new Decimal(years)

    const amount = p.times(r.dividedBy(n).plus(1).pow(n.times(t)))
    const totalInterest = amount.minus(p)

    // Calculate year by year for chart
    const yearlyData: { year: number; amount: number; principal: number; interest: number }[] = []
    for (let y = 1; y <= years; y++) {
      const yAmount = p.times(r.dividedBy(n).plus(1).pow(n.times(y)))
      yearlyData.push({
        year: y,
        amount: yAmount.toNumber(),
        principal: principal,
        interest: yAmount.minus(p).toNumber()
      })
    }

    return {
      amount: amount.toNumber(),
      totalInterest: totalInterest.toNumber(),
      yearlyData
    }
  }, [principal, rate, years, compoundFreq])

  const formatMoney = (n: number) => n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">复利计算器</h1>
            </div>
            <p className="text-[#94A3B8]">投资复利增长模拟</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">本金 (元)</label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">年利率 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">年限</label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">复利频率</label>
                <select
                  value={compoundFreq}
                  onChange={(e) => setCompoundFreq(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                >
                  <option value={1}>每年</option>
                  <option value={4}>每季度</option>
                  <option value={12}>每月</option>
                  <option value={365}>每天</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass-card p-6 text-center">
              <p className="text-sm text-[#94A3B8] mb-2">本息合计</p>
              <p className="text-3xl font-bold text-[#10B981]">¥{formatMoney(results.amount)}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-sm text-[#94A3B8] mb-2">利息收益</p>
              <p className="text-3xl font-bold text-[#F59E0B]">¥{formatMoney(results.totalInterest)}</p>
            </div>
          </div>

          {/* Year by Year */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">逐年增长</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.yearlyData.map((year) => (
                <div key={year.year} className="flex items-center gap-4 p-3 bg-[#080B14] rounded">
                  <span className="text-[#94A3B8] w-12">第{year.year}年</span>
                  <div className="flex-1">
                    <div className="h-2 bg-[#111827] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full"
                        style={{ width: `${(year.amount / results.amount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-white font-mono w-32 text-right">¥{formatMoney(year.amount)}</span>
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
