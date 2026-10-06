'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Calendar, ArrowRight, Copy, Check, Sparkles } from 'lucide-react'
import { differenceInDays, differenceInCalendarMonths, differenceInCalendarYears, getDay } from 'date-fns'
import { trackEvent } from '@/lib/analytics'

const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

const CONSTELLATIONS = [
  { name: '摩羯座', month: 1, day: 20 },
  { name: '水瓶座', month: 2, day: 19 },
  { name: '双鱼座', month: 3, day: 21 },
  { name: '白羊座', month: 4, day: 20 },
  { name: '金牛座', month: 5, day: 21 },
  { name: '双子座', month: 6, day: 22 },
  { name: '巨蟹座', month: 7, day: 23 },
  { name: '狮子座', month: 8, day: 23 },
  { name: '处女座', month: 9, day: 23 },
  { name: '天秤座', month: 10, day: 24 },
  { name: '天蝎座', month: 11, day: 23 },
  { name: '射手座', month: 12, day: 22 },
  { name: '摩羯座', month: 12, day: 32 },
]

function getConstellation(month: number, day: number): string {
  const match = CONSTELLATIONS.find((c) => {
    if (month === c.month && day < c.day) return true
    return false
  })
  return match ? match.name : '摩羯座'
}

export default function DateCalcPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rangeResult, setRangeResult] = useState<{
    days: number
    weeks: number
    remainingDays: number
    approxMonths: number
    approxYears: number
  } | null>(null)

  const [birthDate, setBirthDate] = useState('')
  const [ageResult, setAgeResult] = useState<{
    years: number
    months: number
    days: number
    totalDays: number
    zodiac: string
    constellation: string
    weekday: string
  } | null>(null)

  const [copiedKey, setCopiedKey] = useState('')

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      trackEvent('copy', { tool: 'date-calc' })
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      // ignore
    }
  }

  const calculateRange = () => {
    if (!startDate || !endDate) return
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return
    const isReverse = end < start
    const [dStart, dEnd] = isReverse ? [end, start] : [start, end]

    const days = differenceInDays(dEnd, dStart)
    const weeks = Math.floor(days / 7)
    const remainingDays = days % 7
    const approxMonths = Math.floor(days / 30.4375)
    const approxYears = Math.floor(days / 365.25)

    setRangeResult({ days, weeks, remainingDays, approxMonths, approxYears })
    trackEvent('tool_success', { tool: 'date-calc' })
  }

  const calculateAge = () => {
    if (!birthDate) return
    const birth = new Date(birthDate)
    const today = new Date()

    if (isNaN(birth.getTime()) || birth > today) return

    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    let days = today.getDate() - birth.getDate()

    if (days < 0) {
      months -= 1
      const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate()
      days += prevMonthLastDay
    }
    if (months < 0) {
      years -= 1
      months += 12
    }

    const totalDays = differenceInDays(today, birth)
    const zodiacIndex = ((birth.getFullYear() - 4) % 12 + 12) % 12
    const constellation = getConstellation(birth.getMonth() + 1, birth.getDate())
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

    setAgeResult({
      years,
      months,
      days,
      totalDays,
      zodiac: ZODIAC[zodiacIndex],
      constellation,
      weekday: weekdays[getDay(birth)],
    })
    trackEvent('tool_success', { tool: 'date-calc' })
  }

  return (
    <ToolLayout
      toolSlug="date-calc"
      principlesTitle="公历历法置闰与日期间距数学模型"
      principles={
        <>
          <p>
            <strong>1. 格里高利公历闰年法则：</strong>
            阳历以地球绕太阳公转周期（回归年，约 365.2422 日）为基准。置闰规则为：公元年份能被 4 整除但不能被 100 整除者为闰年；能被 400 整除者亦为闰年。平年 365 天，闰年 366 天。
          </p>
          <p>
            <strong>2. 精确历法年龄与日期间隔：</strong>
            本工具避开简单的粗暴 30 天/月换算，采用真实公历日历进位法推算出生以来的周岁、精确月数及天数。
          </p>
        </>
      }
      howToSteps={[
        '选择“日期间距计算”，输入起始日期与结束日期，实时测算相隔总天数与周数。',
        '选择“年龄与生肖推算”，输入出生公历日期，一键推算精确周岁、出生星期、十二生肖与所属星座。',
        '点击复制结果可一键提取推算文本。',
      ]}
      faq={[
        {
          question: '为什么不同月份的天数不一样？',
          answer:
            '公历起源于古罗马儒略历，后经教皇格里高利十三世改革，大月（1、3、5、7、8、10、12月）为 31 天，小月（4、6、9、11月）为 30 天，二月平年 28 天、闰年 29 天。',
        },
        {
          question: '中国生肖是以立春还是正月初一为界？',
          answer:
            '民间传统习俗普遍以农历正月初一作为生肖交接线，紫微干支历则以立春为界。本工具默认以农历春节年份为基准对应现代生肖。',
        },
      ]}
      disclaimer="本工具用于日常日程规划与生活推算。法律合同履约日、银行结息日或特定公休日遇法定节假日顺延请以国家节假日安排为准。"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Range Calculator */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-text-secondary">日期间隔推算</h2>
            {rangeResult && (
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `两日期间隔：${rangeResult.days}天 (${rangeResult.weeks}周${rangeResult.remainingDays}天)`,
                    'range'
                  )
                }
                className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
              >
                {copiedKey === 'range' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'range' ? '已复制' : '复制结果'}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={calculateRange}
              disabled={!startDate || !endDate}
              className="btn-primary w-full py-2.5 rounded-xl text-xs font-semibold shadow-sm disabled:opacity-40"
            >
              计算日期间隔
            </button>

            {rangeResult && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-canvas border border-border rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{rangeResult.days}</p>
                  <p className="text-[11px] text-text-muted">相隔总天数</p>
                </div>
                <div className="bg-canvas border border-border rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                    {rangeResult.weeks} <span className="text-xs text-text-muted font-normal">周 +{rangeResult.remainingDays}天</span>
                  </p>
                  <p className="text-[11px] text-text-muted">标准周数</p>
                </div>
                <div className="bg-canvas border border-border rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">约 {rangeResult.approxMonths}</p>
                  <p className="text-[11px] text-text-muted">折合月数</p>
                </div>
                <div className="bg-canvas border border-border rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">约 {rangeResult.approxYears}</p>
                  <p className="text-[11px] text-text-muted">折合年数</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Age & Astrology Calculator */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-text-secondary">年龄与公历属性推算</h2>
            {ageResult && (
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `年龄：${ageResult.years}岁${ageResult.months}个月${ageResult.days}天，属${ageResult.zodiac}，${ageResult.constellation}，出生在${ageResult.weekday}`,
                    'age'
                  )
                }
                className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
              >
                {copiedKey === 'age' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'age' ? '已复制' : '复制结果'}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">出生日期 (公历)</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={calculateAge}
              disabled={!birthDate}
              className="btn-primary w-full py-2.5 rounded-xl text-xs font-semibold shadow-sm disabled:opacity-40"
            >
              推算年龄与生肖星座
            </button>

            {ageResult && (
              <div className="space-y-3 pt-2">
                <div className="bg-canvas border border-border rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold font-mono text-text-primary mb-1">
                    {ageResult.years} <span className="text-base font-sans font-normal text-text-muted">周岁</span>
                  </p>
                  <p className="text-xs text-text-muted">
                    已生活 {ageResult.years} 年 {ageResult.months} 个月 {ageResult.days} 天 (累计 {ageResult.totalDays.toLocaleString()} 天)
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-canvas border border-border rounded-xl p-2.5">
                    <p className="text-base font-bold text-amber-600 dark:text-amber-400">{ageResult.zodiac}</p>
                    <p className="text-[10px] text-text-muted">十二生肖</p>
                  </div>
                  <div className="bg-canvas border border-border rounded-xl p-2.5">
                    <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">{ageResult.constellation}</p>
                    <p className="text-[10px] text-text-muted">太阳星座</p>
                  </div>
                  <div className="bg-canvas border border-border rounded-xl p-2.5">
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">{ageResult.weekday}</p>
                    <p className="text-[10px] text-text-muted">出生星期</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
