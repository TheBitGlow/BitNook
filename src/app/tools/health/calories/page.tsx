'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Activity } from 'lucide-react'

export default function CaloriesPage() {
  const [weight, setWeight] = useState(65)
  const [height, setHeight] = useState(170)
  const [age, setAge] = useState(30)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [activityLevel, setActivityLevel] = useState(1.2)

  const activityLevels = [
    { value: 1.2, label: '久坐（很少运动）' },
    { value: 1.375, label: '轻度（每周1-3天）' },
    { value: 1.55, label: '中度（每周3-5天）' },
    { value: 1.725, label: '高度（每周6-7天）' },
    { value: 1.9, label: '极高度（运动员）' },
  ]

  // BMR calculation (Mifflin-St Jeor)
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161

  const tdee = Math.round(bmr * activityLevel)

  const goals = [
    { label: '减脂 -500', value: tdee - 500, color: '#EF4444' },
    { label: '维持', value: tdee, color: '#10B981' },
    { label: '增肌 +300', value: tdee + 300, color: '#3B82F6' },
  ]

  const macros = {
    protein: Math.round(weight * 1.6),
    fat: Math.round(tdee * 0.25 / 9),
    carbs: Math.round((tdee - weight * 4 - tdee * 0.25) / 4),
  }

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
              <h1 className="text-2xl font-bold text-white">卡路里计算器</h1>
            </div>
            <p className="text-[#94A3B8]">计算基础代谢与每日消耗</p>
          </div>

          {/* Input Form */}
          <div className="glass-card p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">体重 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">身高 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">年龄</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">性别</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 py-3 rounded-xl text-sm ${
                      gender === 'male' ? 'bg-[#3B82F6] text-white' : 'bg-[#080B14] text-[#94A3B8]'
                    }`}
                  >
                    男
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 py-3 rounded-xl text-sm ${
                      gender === 'female' ? 'bg-[#EC4899] text-white' : 'bg-[#080B14] text-[#94A3B8]'
                    }`}
                  >
                    女
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">活动水平</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none"
              >
                {activityLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">基础代谢 (BMR)</p>
              <p className="text-3xl font-bold text-white">{Math.round(bmr)}</p>
              <p className="text-xs text-[#475569]">千卡/天</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">每日消耗 (TDEE)</p>
              <p className="text-3xl font-bold text-[#10B981]">{tdee}</p>
              <p className="text-xs text-[#475569]">千卡/天</p>
            </div>
          </div>

          {/* Goals */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-white font-medium mb-4">目标摄入</h3>
            <div className="grid grid-cols-3 gap-3">
              {goals.map(goal => (
                <div key={goal.label} className="text-center p-3 bg-[#080B14] rounded-xl">
                  <p className="text-sm text-[#94A3B8] mb-1">{goal.label}</p>
                  <p className="text-xl font-bold" style={{ color: goal.color }}>{goal.value}</p>
                  <p className="text-xs text-[#475569]">千卡/天</p>
                </div>
              ))}
            </div>
          </div>

          {/* Macros */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">营养素建议（维持）</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-[#080B14] rounded-xl">
                <p className="text-sm text-[#94A3B8] mb-1">蛋白质</p>
                <p className="text-xl font-bold text-[#EF4444]">{macros.protein}g</p>
              </div>
              <div className="text-center p-3 bg-[#080B14] rounded-xl">
                <p className="text-sm text-[#94A3B8] mb-1">脂肪</p>
                <p className="text-xl font-bold text-[#F59E0B]">{macros.fat}g</p>
              </div>
              <div className="text-center p-3 bg-[#080B14] rounded-xl">
                <p className="text-sm text-[#94A3B8] mb-1">碳水</p>
                <p className="text-xl font-bold text-[#3B82F6]">{macros.carbs}g</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
