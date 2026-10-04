'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Clock } from 'lucide-react'

export default function RetirementPage() {
  const [birthYear, setBirthYear] = useState(1990)
  const [birthMonth, setBirthMonth] = useState(1)
  const [gender, setGender] = useState<'male' | 'female'>('male')

  const calculateRetirement = () => {
    const currentYear = new Date().getFullYear()
    const age = currentYear - birthYear

    // 2025年渐进式退休政策 (simplified)
    let retirementYear: number
    let retirementAge: number

    if (gender === 'male') {
      if (birthYear <= 1965) { retirementAge = 60 }
      else if (birthYear <= 1970) { retirementAge = 63 }
      else if (birthYear <= 1975) { retirementAge = 64 }
      else { retirementAge = 65 }
    } else {
      if (birthYear <= 1970) { retirementAge = 50 }
      else if (birthYear <= 1975) { retirementAge = 55 }
      else if (birthYear <= 1980) { retirementAge = 58 }
      else { retirementAge = 60 }
    }

    retirementYear = birthYear + retirementAge

    const birthDate = new Date(birthYear, birthMonth - 1)
    const retirementDate = new Date(retirementYear, birthMonth - 1)

    return {
      currentAge: age,
      retirementAge,
      retirementYear,
      yearsToRetirement: retirementYear - currentYear,
      retirementDate: retirementDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    }
  }

  const result = calculateRetirement()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">退休计算器</h1>
            </div>
            <p className="text-[#94A3B8]">按最新延迟退休政策计算</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">出生年份</label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">出生月份</label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}月</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">性别</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={gender === 'male'}
                    onChange={() => setGender('male')}
                    className="accent-[#6366F1]"
                  />
                  <span className="text-[#94A3B8]">男性</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={gender === 'female'}
                    onChange={() => setGender('female')}
                    className="accent-[#6366F1]"
                  />
                  <span className="text-[#94A3B8]">女性</span>
                </label>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="glass-card p-6 text-center mb-6">
            <p className="text-sm text-[#94A3B8] mb-2">法定退休时间</p>
            <p className="text-4xl font-bold text-[#6366F1] mb-2">{result.retirementDate}</p>
            <p className="text-[#94A3B8]">
              退休年龄 {result.retirementAge} 岁，距今还有 {result.yearsToRetirement} 年
            </p>
          </div>

          {/* Policy Table */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">2025年渐进式退休政策参考</h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-[#080B14] rounded">
                <p className="text-[#94A3B8]">男性：1965年前出生60岁 → 1975年后出生65岁</p>
              </div>
              <div className="p-3 bg-[#080B14] rounded">
                <p className="text-[#94A3B8]">女性（工人）：1970年前出生50岁 → 1980年后出生60岁</p>
              </div>
              <div className="p-3 bg-[#080B14] rounded">
                <p className="text-[#94A3B8]">女性（干部）：1975年前出生55岁 → 1985年后出生65岁</p>
              </div>
            </div>
            <p className="text-xs text-[#475569] mt-4 text-center">
              注：具体政策以当地最新规定为准，此处为简化估算
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
