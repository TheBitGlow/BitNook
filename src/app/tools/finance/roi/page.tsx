'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { TrendingUp } from 'lucide-react'

export default function ROIPage() {
  const [initialInvestment, setInitialInvestment] = useState(100000)
  const [cashFlows, setCashFlows] = useState<string>('12000\n15000\n18000\n20000\n22000')
  const [discountRate, setDiscountRate] = useState(8)

  const calculateROI = () => {
    const flows = cashFlows.split('\n').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
    const totalReturn = flows.reduce((sum, cf) => sum + cf, 0)
    const totalInvestment = initialInvestment

    // Simple ROI
    const roi = ((totalReturn - totalInvestment) / totalInvestment) * 100

    // NPV
    let npv = -totalInvestment
    flows.forEach((cf, i) => {
      npv += cf / Math.pow(1 + discountRate / 100, i + 1)
    })

    return {
      roi: roi.toFixed(2),
      npv: npv.toFixed(2),
      flows
    }
  }

  const result = calculateROI()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">投资回报计算</h1>
            </div>
            <p className="text-[#94A3B8]">ROI / IRR / NPV 计算</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm text-[#94A3B8] mb-2">初始投资 (元)</label>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-[#94A3B8] mb-2">预期现金流 (每年一行)</label>
              <textarea
                value={cashFlows}
                onChange={(e) => setCashFlows(e.target.value)}
                placeholder="12000&#10;15000&#10;18000&#10;20000&#10;22000"
                className="w-full h-32 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white font-mono resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">折现率 (%)</label>
              <input
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
              />
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass-card p-6 text-center">
              <p className="text-sm text-[#94A3B8] mb-2">投资回报率 (ROI)</p>
              <p className="text-4xl font-bold text-[#10B981]">{result.roi}%</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-sm text-[#94A3B8] mb-2">净现值 (NPV)</p>
              <p className="text-4xl font-bold text-[#F59E0B]">
                {parseFloat(result.npv) >= 0 ? '+' : ''}{result.npv}
              </p>
            </div>
          </div>

          {/* Cash Flow Table */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">现金流明细</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-[#080B14] rounded text-[#475569]">
                <span>第0年 (初始投资)</span>
                <span>-¥{initialInvestment.toLocaleString()}</span>
              </div>
              {result.flows.map((cf, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[#080B14] rounded">
                  <span className="text-[#94A3B8]">第{i + 1}年</span>
                  <span className="text-[#10B981]">+¥{cf.toLocaleString()}</span>
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
