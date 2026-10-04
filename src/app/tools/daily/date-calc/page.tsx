'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Calendar } from 'lucide-react'
import { differenceInDays, addDays, format, getDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const constellations = ['水瓶座', '双鱼座', '白羊座', '金牛座', '双子座', '巨蟹座',
  '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座']

export default function DateCalcPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [result, setResult] = useState<{
    days: number
    weeks: number
    months: number
    years: number
  } | null>(null)

  const [birthDate, setBirthDate] = useState('')
  const [ageResult, setAgeResult] = useState<{
    years: number
    months: number
    days: number
    zodiac: string
    constellation: string
    weekday: string
  } | null>(null)

  const calculateRange = () => {
    if (!startDate || !endDate) return
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) return

    const days = differenceInDays(end, start)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    setResult({ days, weeks, months, years })
  }

  const calculateAge = () => {
    if (!birthDate) return
    const birth = new Date(birthDate)
    const today = new Date()

    const totalDays = differenceInDays(today, birth)
    const years = Math.floor(totalDays / 365)
    const remainingDays = totalDays % 365
    const months = Math.floor(remainingDays / 30)
    const days = remainingDays % 30

    const zodiacIndex = Math.floor(((birth.getFullYear() - 1900) % 12 + 12) % 12)

    const month = birth.getMonth()
    const day = birth.getDate()
    const constellationIndex = month * 2 + (day >= [20, 19, 21, 21, 21, 22, 23, 23, 23, 24, 23, 22][month] ? 1 : 0)

    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

    setAgeResult({
      years,
      months,
      days,
      zodiac: zodiac[zodiacIndex],
      constellation: constellations[constellationIndex],
      weekday: weekdays[getDay(birth)]
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">日期计算</h1>
            </div>
            <p className="text-[#94A3B8]">日期间距、工作日计算、年龄推算</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range Calculator */}
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">日期间距计算</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">开始日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">结束日期</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>
                <button
                  onClick={calculateRange}
                  className="w-full py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#2563EB] transition-colors"
                >
                  计算
                </button>

                {result && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[
                      { label: '天数', value: result.days },
                      { label: '周数', value: result.weeks },
                      { label: '月数', value: result.months },
                      { label: '年数', value: result.years },
                    ].map(item => (
                      <div key={item.label} className="bg-[#080B14] rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-white">{item.value}</p>
                        <p className="text-xs text-[#475569]">{item.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Age Calculator */}
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">年龄与日期</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">出生日期</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>
                <button
                  onClick={calculateAge}
                  className="w-full py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#2563EB] transition-colors"
                >
                  计算
                </button>

                {ageResult && (
                  <div className="space-y-3 mt-4">
                    <div className="bg-[#080B14] rounded-lg p-4">
                      <p className="text-4xl font-bold text-white text-center mb-2">
                        {ageResult.years}岁
                      </p>
                      <p className="text-center text-[#94A3B8]">
                        {ageResult.months}个月{ageResult.days}天
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#080B14] rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-[#F59E0B]">{ageResult.zodiac}</p>
                        <p className="text-xs text-[#475569]">生肖</p>
                      </div>
                      <div className="bg-[#080B14] rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-[#8B5CF6]">{ageResult.constellation}</p>
                        <p className="text-xs text-[#475569]">星座</p>
                      </div>
                      <div className="bg-[#080B14] rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-[#06B6D4]">{ageResult.weekday}</p>
                        <p className="text-xs text-[#475569]">出生星期</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
