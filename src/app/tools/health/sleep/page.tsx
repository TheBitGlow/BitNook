'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Moon } from 'lucide-react'

export default function SleepPage() {
  const [mode, setMode] = useState<'wake' | 'sleep'>('wake')
  const [inputTime, setInputTime] = useState('07:00')

  const parseTime = (time: string): { hours: number; minutes: number } => {
    const [h, m] = time.split(':').map(Number)
    return { hours: h, minutes: m }
  }

  const calculateSleepTimes = (targetTime: string, isWakeTime: boolean) => {
    const { hours, minutes } = parseTime(targetTime)
    const cycles = [6, 5, 4, 3] // Number of 90-min cycles

    const results: { cycles: number; hours: number; bedTime: string; quality: string }[] = []

    for (const cycle of cycles) {
      const totalMinutes = cycle * 90 // 90 min per cycle
      const sleepMinutes = isWakeTime ? -totalMinutes : totalMinutes

      let newHours = hours + Math.floor(sleepMinutes / 60)
      let newMinutes = minutes + (sleepMinutes % 60)

      if (newMinutes < 0) {
        newMinutes += 60
        newHours -= 1
      }
      if (newHours < 0) newHours += 24
      if (newHours >= 24) newHours -= 24

      const quality = cycle >= 5 ? '最佳' : cycle >= 4 ? '良好' : '一般'

      results.push({
        cycles: cycle,
        hours: Math.round((cycle * 90) / 60 * 10) / 10,
        bedTime: `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`,
        quality
      })
    }

    return results
  }

  const sleepTimes = calculateSleepTimes(inputTime, mode === 'wake')

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <Moon className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">睡眠计算器</h1>
            </div>
            <p className="text-[#94A3B8]">基于睡眠周期优化入睡/起床时间</p>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('wake')}
              className={`flex-1 py-3 rounded-xl font-medium ${
                mode === 'wake' ? 'bg-[#8B5CF6] text-white' : 'bg-[#111827] text-[#94A3B8]'
              }`}
            >
              我想几点起床
            </button>
            <button
              onClick={() => setMode('sleep')}
              className={`flex-1 py-3 rounded-xl font-medium ${
                mode === 'sleep' ? 'bg-[#8B5CF6] text-white' : 'bg-[#111827] text-[#94A3B8]'
              }`}
            >
              我想几点入睡
            </button>
          </div>

          {/* Time Input */}
          <div className="glass-card p-6 mb-6">
            <label className="block text-sm text-[#94A3B8] mb-2">
              {mode === 'wake' ? '计划起床时间' : '计划入睡时间'}
            </label>
            <input
              type="time"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
              className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white text-2xl text-center"
            />
          </div>

          {/* Results */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">
              {mode === 'wake' ? '建议入睡时间' : '建议起床时间'}
            </h3>
            <div className="space-y-3">
              {sleepTimes.map((result) => (
                <div
                  key={result.cycles}
                  className={`p-4 rounded-xl ${
                    result.quality === '最佳'
                      ? 'bg-[#10B981]/10 border border-[#10B981]/30'
                      : result.quality === '良好'
                      ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/30'
                      : 'bg-[#111827]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {mode === 'wake' ? result.bedTime : calculateWakeTime(result.bedTime, result.cycles)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        result.quality === '最佳'
                          ? 'bg-[#10B981] text-white'
                          : result.quality === '良好'
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-[#475569] text-white'
                      }`}
                    >
                      {result.quality}
                    </span>
                  </div>
                  <p className="text-sm text-[#94A3B8]">
                    {result.cycles}个睡眠周期 · 约{result.hours}小时
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-[#111827]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">原理：</span>
              每个睡眠周期约90分钟。入睡后需要约15分钟进入第一个周期。睡满4-6个完整周期最为理想。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function calculateWakeTime(bedTime: string, cycles: number): string {
  const [h, m] = bedTime.split(':').map(Number)
  const totalMinutes = h * 60 + m + cycles * 90
  const newH = Math.floor(totalMinutes / 60) % 24
  const newM = totalMinutes % 60
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`
}
