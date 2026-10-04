'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Droplets } from 'lucide-react'

export default function WaterIntakePage() {
  const [weight, setWeight] = useState(65)
  const [activity, setActivity] = useState(1)
  const [climate, setClimate] = useState(1)
  const [intake, setIntake] = useState(0)
  const [customGoal, setCustomGoal] = useState(0)

  const baseGoal = weight * 30 // 30ml per kg
  const recommended = Math.round(baseGoal * activity * climate)

  const glasses = 250 // ml per glass
  const addGlass = (count: number) => {
    setIntake(Math.max(0, intake + count * glasses))
  }

  const reset = () => setIntake(0)

  const percentage = Math.min(100, Math.round((intake / (customGoal || recommended)) * 100))

  const schedule = [
    { time: '7:00', amount: 1, label: '起床后' },
    { time: '9:00', amount: 1, label: '工作前' },
    { time: '11:00', amount: 1, label: '午前' },
    { time: '12:30', amount: 1, label: '午餐前' },
    { time: '14:00', amount: 1, label: '下午茶' },
    { time: '16:00', amount: 1, label: '下班前' },
    { time: '18:30', amount: 1, label: '晚餐前' },
    { time: '20:00', amount: 1, label: '睡前' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">每日饮水量</h1>
            </div>
            <p className="text-[#94A3B8]">个性化饮水建议与追踪</p>
          </div>

          {/* Settings */}
          <div className="glass-card p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
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
                <label className="block text-sm text-[#94A3B8] mb-2">运动强度</label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-lg text-white"
                >
                  <option value={1}>久坐</option>
                  <option value={1.2}>轻度运动</option>
                  <option value={1.4}>中度运动</option>
                  <option value={1.6}>高强度运动</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">气候</label>
                <select
                  value={climate}
                  onChange={(e) => setClimate(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-lg text-white"
                >
                  <option value={1}>温和</option>
                  <option value={1.1}>炎热</option>
                  <option value={1.2}>高温</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="glass-card p-6 mb-6">
            <div className="text-center mb-6">
              <p className="text-sm text-[#94A3B8] mb-2">今日目标</p>
              <p className="text-5xl font-bold text-white">{recommended}</p>
              <p className="text-sm text-[#475569]">毫升</p>
            </div>

            <div className="relative h-8 bg-[#080B14] rounded-full overflow-hidden mb-4">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm text-white font-medium">{percentage}%</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-[#06B6D4]">{intake}ml</p>
              <p className="text-sm text-[#475569]">已摄入</p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => addGlass(-1)}
                disabled={intake < glasses}
                className="px-4 py-2 bg-[#111827] text-[#94A3B8] rounded-lg hover:text-white disabled:opacity-50"
              >
                -1杯
              </button>
              <button
                onClick={() => addGlass(1)}
                className="px-6 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB]"
              >
                +1杯 (250ml)
              </button>
              <button
                onClick={() => addGlass(2)}
                className="px-6 py-2 bg-[#06B6D4] text-white rounded-lg hover:bg-[#0891b2]"
              >
                +2杯
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-[#111827] text-[#94A3B8] rounded-lg hover:text-white"
              >
                重置
              </button>
            </div>
          </div>

          {/* Schedule */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">饮水时间表</h3>
            <div className="space-y-2">
              {schedule.map((item) => (
                <div key={item.time} className="flex items-center justify-between p-3 bg-[#080B14] rounded-lg">
                  <div>
                    <span className="text-white font-medium">{item.time}</span>
                    <span className="text-[#475569] text-sm ml-2">{item.label}</span>
                  </div>
                  <span className="text-[#3B82F6]">+{item.amount * glasses}ml</span>
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
