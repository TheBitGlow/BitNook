'use client'

import { useMemo, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Heart, RotateCcw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type Method = 'max' | 'reserve'
type Formula = 'fox' | 'tanaka'

const ZONES = [
  {
    key: 'warmup',
    min: 50,
    max: 60,
    color: '#3B82F6',
    zhName: '热身区',
    enName: 'Warm-up',
    zhDesc: '轻松活动，适合热身、恢复和刚开始运动的人群。',
    enDesc: 'Easy effort for warm-up, recovery, and beginners.',
  },
  {
    key: 'fat',
    min: 60,
    max: 70,
    color: '#10B981',
    zhName: '燃脂区',
    enName: 'Fat burn',
    zhDesc: '中低强度，适合长时间有氧和体重管理。',
    enDesc: 'Low-to-moderate effort for longer aerobic sessions and weight management.',
  },
  {
    key: 'aerobic',
    min: 70,
    max: 80,
    color: '#F59E0B',
    zhName: '有氧区',
    enName: 'Aerobic',
    zhDesc: '中等强度，提升心肺能力和耐力基础。',
    enDesc: 'Moderate effort for cardiovascular fitness and endurance.',
  },
  {
    key: 'threshold',
    min: 80,
    max: 90,
    color: '#EF4444',
    zhName: '阈值区',
    enName: 'Threshold',
    zhDesc: '较高强度，适合间歇训练和速度能力提升。',
    enDesc: 'Hard effort for intervals and speed development.',
  },
  {
    key: 'peak',
    min: 90,
    max: 100,
    color: '#DC2626',
    zhName: '极限区',
    enName: 'Peak',
    zhDesc: '接近最大强度，时间应短，建议有训练基础者谨慎使用。',
    enDesc: 'Near-max effort. Keep it brief and use carefully if well trained.',
  },
]

const clamp = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

const calculateMaxHeartRate = (age: number, formula: Formula) => {
  if (formula === 'tanaka') return Math.round(208 - 0.7 * age)
  return 220 - age
}

export default function HeartRatePage() {
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const [age, setAge] = useState(30)
  const [maxHR, setMaxHR] = useState(190)
  const [restingHR, setRestingHR] = useState(70)
  const [method, setMethod] = useState<Method>('reserve')
  const [formula, setFormula] = useState<Formula>('fox')

  const estimatedMaxHR = useMemo(() => calculateMaxHeartRate(age, formula), [age, formula])
  const heartRateReserve = Math.max(0, maxHR - restingHR)

  const zones = useMemo(() => ZONES.map((zone) => {
    const low = method === 'reserve'
      ? restingHR + heartRateReserve * zone.min / 100
      : maxHR * zone.min / 100
    const high = method === 'reserve'
      ? restingHR + heartRateReserve * zone.max / 100
      : maxHR * zone.max / 100

    return {
      ...zone,
      low: Math.round(low),
      high: Math.round(high),
    }
  }), [heartRateReserve, maxHR, method, restingHR])

  const syncEstimatedMax = () => {
    setMaxHR(clamp(estimatedMaxHR, 80, 240))
  }

  const reset = () => {
    setAge(30)
    setFormula('fox')
    setMaxHR(190)
    setRestingHR(70)
    setMethod('reserve')
  }

  const formulaLabel = formula === 'fox' ? '220 - age' : '208 - 0.7 x age'

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#EF4444]" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                {isZh ? '心率计算器' : 'Heart Rate Calculator'}
              </h1>
            </div>
            <p className="text-[#94A3B8]">
              {isZh
                ? '根据年龄、最大心率和静息心率计算训练心率区间。'
                : 'Calculate training heart-rate zones from age, maximum heart rate, and resting heart rate.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <section className="glass-card p-6">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-semibold text-white">
                  {isZh ? '输入参数' : 'Inputs'}
                </h2>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827] border border-[rgba(99,102,241,0.2)] text-[#94A3B8] hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isZh ? '重置' : 'Reset'}
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">
                    {isZh ? '年龄' : 'Age'}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(clamp(Number(e.target.value), 10, 100))}
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-[#94A3B8]">
                      {isZh ? '最大心率估算公式' : 'Max HR estimate'}
                    </label>
                    <span className="text-xs text-[#64748B]">{formulaLabel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['fox', 'tanaka'] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setFormula(item)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formula === item
                            ? 'bg-[#EF4444] text-white'
                            : 'bg-[#080B14] text-[#94A3B8] border border-[rgba(99,102,241,0.15)] hover:text-white'
                        }`}
                      >
                        {item === 'fox' ? 'Fox' : 'Tanaka'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-[#94A3B8]">
                      {isZh ? '最大心率' : 'Maximum heart rate'}
                    </label>
                    <span className="text-xs text-[#64748B]">
                      {isZh ? '估算值' : 'Estimate'}: {estimatedMaxHR} bpm
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={80}
                      max={240}
                      value={maxHR}
                      onChange={(e) => setMaxHR(clamp(Number(e.target.value), 80, 240))}
                      className="flex-1 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                    />
                    <button
                      type="button"
                      onClick={syncEstimatedMax}
                      className="px-4 py-3 rounded-xl bg-[#111827] border border-[rgba(99,102,241,0.2)] text-[#94A3B8] hover:text-white transition-colors whitespace-nowrap"
                    >
                      {isZh ? '使用估算值' : 'Use estimate'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">
                    {isZh ? '静息心率' : 'Resting heart rate'}
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={120}
                    value={restingHR}
                    onChange={(e) => setRestingHR(clamp(Number(e.target.value), 30, 120))}
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">
                    {isZh ? '计算方法' : 'Calculation method'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod('reserve')}
                      className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        method === 'reserve'
                          ? 'bg-[#EF4444] text-white'
                          : 'bg-[#080B14] text-[#94A3B8] border border-[rgba(99,102,241,0.15)] hover:text-white'
                      }`}
                    >
                      {isZh ? '心率储备法' : 'Heart rate reserve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('max')}
                      className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        method === 'max'
                          ? 'bg-[#EF4444] text-white'
                          : 'bg-[#080B14] text-[#94A3B8] border border-[rgba(99,102,241,0.15)] hover:text-white'
                      }`}
                    >
                      {isZh ? '最大心率百分比' : '% of max HR'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="glass-card p-5">
                  <p className="text-sm text-[#94A3B8] mb-2">{isZh ? '最大心率' : 'Max HR'}</p>
                  <p className="text-3xl font-bold text-white">{maxHR}</p>
                  <p className="text-xs text-[#64748B] mt-1">bpm</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-sm text-[#94A3B8] mb-2">{isZh ? '静息心率' : 'Resting HR'}</p>
                  <p className="text-3xl font-bold text-white">{restingHR}</p>
                  <p className="text-xs text-[#64748B] mt-1">bpm</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-sm text-[#94A3B8] mb-2">{isZh ? '心率储备' : 'HR reserve'}</p>
                  <p className="text-3xl font-bold text-white">{heartRateReserve}</p>
                  <p className="text-xs text-[#64748B] mt-1">bpm</p>
                </div>
              </div>

              <div className="space-y-3">
                {zones.map((zone) => (
                  <div
                    key={zone.key}
                    className="glass-card p-4 border-l-4"
                    style={{ borderLeftColor: zone.color }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="font-medium text-white">{isZh ? zone.zhName : zone.enName}</span>
                        <span className="ml-2 text-xs text-[#64748B]">
                          {zone.min}% - {zone.max}%
                        </span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: zone.color }}>
                        {zone.low} - {zone.high} bpm
                      </span>
                    </div>
                    <p className="text-sm text-[#94A3B8] mb-3">{isZh ? zone.zhDesc : zone.enDesc}</p>
                    <div className="h-2 bg-[#080B14] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${zone.max - zone.min}%`,
                          marginLeft: `${zone.min}%`,
                          backgroundColor: zone.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-6 p-4 bg-[#111827]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              <span className="text-[#F59E0B]">{isZh ? '说明：' : 'Note: '}</span>
              {isZh
                ? '心率储备法公式：目标心率 = 静息心率 + (最大心率 - 静息心率) x 强度比例。最大心率估算存在个体差异，运动处方或疾病相关训练请咨询医生或专业教练。'
                : 'Heart rate reserve formula: target HR = resting HR + (max HR - resting HR) x intensity. Maximum heart-rate estimates vary by person; consult a clinician or qualified coach for medical or prescribed training needs.'}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
