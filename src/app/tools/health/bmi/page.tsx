'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Activity, Scale } from 'lucide-react'

export default function BMIPage() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bmi, setBmi] = useState<number | null>(null)
  const [category, setCategory] = useState('')
  const [categoryColor, setCategoryColor] = useState('')

  const calculateBMI = () => {
    const h = parseFloat(height) / 100
    const w = parseFloat(weight)
    if (!h || !w || h <= 0 || w <= 0) return

    const bmiValue = w / (h * h)
    setBmi(bmiValue)

    if (bmiValue < 18.5) {
      setCategory('偏瘦')
      setCategoryColor('#3B82F6')
    } else if (bmiValue < 24) {
      setCategory('正常')
      setCategoryColor('#10B981')
    } else if (bmiValue < 28) {
      setCategory('偏胖')
      setCategoryColor('#F59E0B')
    } else {
      setCategory('肥胖')
      setCategoryColor('#EF4444')
    }
  }

  const idealWeight = height ? ((parseFloat(height) / 100) ** 2 * 22).toFixed(1) : null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#EF4444]" />
              </div>
              <h1 className="text-2xl font-bold text-white">BMI 计算器</h1>
            </div>
            <p className="text-[#94A3B8]">体质指数评估，了解您的健康状态</p>
          </div>

          {/* Input Form */}
          <div className="glass-card p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">身高 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">体重 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="65"
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                />
              </div>
            </div>

            <button
              onClick={calculateBMI}
              className="w-full btn-gradient py-3"
            >
              计算 BMI
            </button>
          </div>

          {/* Results */}
          {bmi && (
            <div className="glass-card p-6 mb-6">
              <div className="text-center mb-6">
                <p className="text-sm text-[#94A3B8] mb-2">您的 BMI 指数</p>
                <p className="text-5xl font-bold" style={{ color: categoryColor }}>
                  {bmi.toFixed(1)}
                </p>
                <span
                  className="inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                >
                  {category}
                </span>
              </div>

              {/* BMI Scale */}
              <div className="h-4 rounded-full overflow-hidden flex mb-4">
                <div className="flex-1 bg-[#3B82F6]" />
                <div className="flex-1 bg-[#10B981]" />
                <div className="flex-1 bg-[#F59E0B]" />
                <div className="flex-1 bg-[#EF4444]" />
              </div>
              <div className="flex justify-between text-xs text-[#94A3B8] mb-6">
                <span>偏瘦&lt;18.5</span>
                <span>正常18.5-24</span>
                <span>偏胖24-28</span>
                <span>肥胖&gt;28</span>
              </div>

              {/* Ideal Weight */}
              {idealWeight && (
                <div className="p-4 bg-[#111827]/50 rounded-xl flex items-center gap-3">
                  <Scale className="w-5 h-5 text-[#6366F1]" />
                  <div>
                    <p className="text-sm text-[#94A3B8]">理想体重范围</p>
                    <p className="text-white font-medium">
                      {(parseFloat(idealWeight) * 0.9).toFixed(1)} - {(parseFloat(idealWeight) * 1.1).toFixed(1)} kg
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 bg-[#111827]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">免责声明：</span>
              BMI 是常用的健康指标，但不能完全反映身体组成。对于运动员、老年人、孕妇等特殊人群，请咨询专业医生。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
