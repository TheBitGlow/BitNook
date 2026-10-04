'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Footprints } from 'lucide-react'

export default function StepsPage() {
  const [age, setAge] = useState(30)
  const [weight, setWeight] = useState(65)
  const [height, setHeight] = useState(170)
  const [currentSteps, setCurrentSteps] = useState(0)

  const recommendedSteps = Math.round(8000 / 70 * weight) // base 8000 steps for 70kg

  const calculateCalories = (steps: number) => {
    // Approximate: 1 step = 0.04-0.05 calories
    return Math.round(steps * 0.045 * (weight / 65))
  }

  const calculateDistance = (steps: number) => {
    // Approximate stride length = height * 0.415 (women) or 0.415 (men)
    const strideLength = height * 0.000415 // in km
    return (steps * strideLength).toFixed(2)
  }

  const percentage = Math.min(100, Math.round((currentSteps / recommendedSteps) * 100))

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Footprints className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">步数目标</h1>
            </div>
            <p className="text-[#94A3B8]">个性化步数建议与换算</p>
          </div>

          {/* Settings */}
          <div className="glass-card p-6 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">年龄</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">体重 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">身高 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="glass-card p-6 mb-6">
            <div className="text-center mb-6">
              <p className="text-sm text-[#94A3B8] mb-2">今日目标</p>
              <p className="text-5xl font-bold text-[#10B981]">{recommendedSteps.toLocaleString()}</p>
              <p className="text-sm text-[#475569]">步</p>
            </div>

            <div className="relative h-6 bg-[#080B14] rounded-full overflow-hidden mb-4">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="text-center mb-6">
              <input
                type="number"
                value={currentSteps}
                onChange={(e) => setCurrentSteps(Number(e.target.value))}
                placeholder="今日步数"
                className="text-3xl font-bold text-center w-40 px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
              />
              <p className="text-sm text-[#475569] mt-2">输入今日步数</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-white">{percentage}%</p>
              <p className="text-sm text-[#475569]">完成率</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-[#F59E0B]">{calculateCalories(currentSteps)}</p>
              <p className="text-sm text-[#475569]">千卡消耗</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-[#3B82F6]">{calculateDistance(currentSteps)}</p>
              <p className="text-sm text-[#475569]">公里数</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">步数建议</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#080B14] rounded-lg">
                <span className="text-[#94A3B8]">久坐人群</span>
                <span className="text-white font-medium">6,000步</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#080B14] rounded-lg">
                <span className="text-[#94A3B8]">轻度活跃</span>
                <span className="text-white font-medium">8,000步</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#080B14] rounded-lg">
                <span className="text-[#94A3B8]">活跃</span>
                <span className="text-white font-medium">10,000步</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#080B14] rounded-lg">
                <span className="text-[#94A3B8]">高活跃</span>
                <span className="text-white font-medium">12,000+步</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
