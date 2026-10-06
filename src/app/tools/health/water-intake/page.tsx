'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Droplets, Plus, Minus, RotateCcw } from 'lucide-react'

export default function WaterIntakePage() {
  const [weight, setWeight] = useState<number>(65)
  const [activityFactor, setActivityFactor] = useState<number>(1.0)
  const [climateFactor, setClimateFactor] = useState<number>(1.0)
  const [intake, setIntake] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const todayStr = new Date().toISOString().slice(0, 10)
        const savedDate = localStorage.getItem('bitnook_water_date')
        if (savedDate === todayStr) {
          const savedAmount = localStorage.getItem('bitnook_water_intake')
          if (savedAmount) return Number(savedAmount)
        }
      } catch {
        // ignore
      }
    }
    return 0
  })
  const [cupSize, setCupSize] = useState<number>(250)

  const recommendedGoal = useMemo(() => {
    // Chinese Dietary Guidelines: 30-35ml per kg of bodyweight
    const base = weight * 32
    return Math.round(base * activityFactor * climateFactor)
  }, [weight, activityFactor, climateFactor])

  const addWater = (amount: number) => {
    const next = Math.max(0, intake + amount)
    setIntake(next)
    try {
      localStorage.setItem('bitnook_water_intake', next.toString())
      localStorage.setItem('bitnook_water_date', new Date().toISOString().slice(0, 10))
    } catch {
      // ignore
    }
  }

  const resetToday = () => {
    setIntake(0)
    try {
      localStorage.setItem('bitnook_water_intake', '0')
    } catch {
      // ignore
    }
  }

  const percentage = Math.min(100, Math.round((intake / recommendedGoal) * 100))

  const scheduleSlots = [
    { time: '07:30', amount: cupSize, label: '晨起温水 · 补充夜间水分流失' },
    { time: '09:30', amount: cupSize, label: '工作专注前 · 提升大脑含水量' },
    { time: '11:30', amount: cupSize, label: '午餐前30分钟 · 润泽肠胃' },
    { time: '14:00', amount: cupSize, label: '午休醒后 · 驱除午后困倦' },
    { time: '16:00', amount: cupSize, label: '工间小憩 · 站立走动饮水' },
    { time: '18:30', amount: cupSize, label: '晚餐前或下班前' },
    { time: '20:30', amount: cupSize, label: '睡前适量小口 · 避免夜尿频繁' },
  ]

  const faq = [
    {
      question: '每日推荐饮水量包括汤和饮料吗？',
      answer:
        '《中国居民膳食指南》推荐的成年人每日 1,500 ~ 1,700 毫升为温水、白开水或淡茶水等直接饮水量。食物中（如蔬菜、水果、煮汤）含有的大约 1,000 毫升水分不计入纯饮水目标。',
    },
    {
      question: '短时间内大量喝水有什么风险？',
      answer:
        '切忌短时间内（如半小时内）暴饮数升清水，否则可能导致血钠浓度急剧稀释引发“低钠血症”（俗称水中毒）。应采取“少量多次、小口慢饮”原则。',
    },
    {
      question: '哪些特殊人群不能按此公式饮水？',
      answer:
        '患有慢性肾脏病、心力衰竭、重度肝硬化腹水等伴随水肿或体液潴留疾病的人群，必须严格遵从临床主管医师给出的每日出入量医嘱，切勿自行增加饮水量。',
    },
  ]

  const howToSteps = [
    '输入当前体重（kg），并选择日常运动量与气候环境（炎热天气会增加出汗排泄）。',
    '系统根据国家膳食指南基线计算全天推荐纯饮水毫升目标。',
    '每次喝水后点击【+250ml】或快捷按钮，实时更新打卡进度条并保存在本地。',
    '参考分段定时作息饮水表，培养定时补水而非渴了才喝水的健康习惯。',
  ]

  return (
    <ToolLayout
      toolSlug="water-intake"
      principlesTitle="水分平衡计算原理与指南依据"
      principles={
        <>
          <p>
            <strong>1. 水分需要量测算模型：</strong>一般健康成年人在温和气候与轻体力活动下，每日水分总需要量约为 2500ml。其中直接饮水约 1500~1700ml（或按体重 30~35 ml/kg 粗算），其余由一日三餐食物供给。
          </p>
          <p>
            <strong>2. 环境与运动校正：</strong>高强度运动出汗、夏季炎热或冬季干燥暖气环境下，体表蒸发与排汗显著增加，需适当上浮 10%~30% 补水量，运动中可适当补充淡盐水或电解质水。
          </p>
          <p>
            <strong>3. 科学提示：</strong>本计算器仅作为日常生活打卡和饮水习惯规划参考，严禁作为临床体液疗法或特殊肾脏疾病的医疗依据。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer="本饮水规划器用于日常生活作息补水打卡与健康习惯养成。患有慢性肾衰竭、充血性心力衰竭、肝腹水等需严格限制水钠摄入疾病的人群，必须严格遵从临床医生医嘱。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                体重 (kg)
              </label>
              <input
                type="number"
                min="30"
                max="200"
                value={weight}
                onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-2xl font-bold font-mono text-center text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                日常活动 / 运动量
              </label>
              <select
                aria-label="运动量"
                value={activityFactor}
                onChange={(e) => setActivityFactor(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-text-primary font-medium focus:border-accent-primary focus:outline-none transition-colors text-sm"
              >
                <option value={1.0}>轻体力 / 久坐办公 (基准1.0)</option>
                <option value={1.15}>中度活动 / 每日散步 (1.15)</option>
                <option value={1.3}>高强度运动 / 规律健身 (1.30)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                气候与室内环境
              </label>
              <select
                aria-label="气候环境"
                value={climateFactor}
                onChange={(e) => setClimateFactor(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-text-primary font-medium focus:border-accent-primary focus:outline-none transition-colors text-sm"
              >
                <option value={1.0}>温和湿润 (基准1.0)</option>
                <option value={1.1}>夏季炎热 / 干燥暖气房 (1.1)</option>
                <option value={1.2}>高温暴晒 / 户外高热作业 (1.2)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Progress & Tracking Card */}
        <div className="card p-6 sm:p-8 text-center space-y-4">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
            今日计划纯饮水目标
          </p>
          <p className="text-4xl sm:text-5xl font-extrabold text-text-primary font-mono tracking-tight my-2">
            {recommendedGoal} <span className="text-xl font-sans text-accent-primary font-bold">ml</span>
          </p>
          <p className="text-xs text-text-muted mb-4">
            约合 {(recommendedGoal / cupSize).toFixed(1)} 杯（按每杯 {cupSize}ml 计算）
          </p>

          {/* Progress Bar */}
          <div className="relative h-6 rounded-full bg-canvas overflow-hidden max-w-xl mx-auto mb-4 border border-border">
            <div
              className="absolute left-0 top-0 h-full bg-accent-primary transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary drop-shadow">
              已完成 {percentage}% ({intake} / {recommendedGoal} ml)
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => addWater(-cupSize)}
              disabled={intake < cupSize}
              className="btn-secondary px-4 py-2.5 rounded-xl text-xs disabled:opacity-30"
            >
              -1杯 ({cupSize}ml)
            </button>

            <button
              type="button"
              onClick={() => addWater(cupSize)}
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm"
            >
              +1杯 ({cupSize}ml)
            </button>

            <button
              type="button"
              onClick={() => addWater(cupSize * 2)}
              className="btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-accent-primary border-accent-primary/30"
            >
              +2杯 ({cupSize * 2}ml)
            </button>

            <button
              type="button"
              onClick={resetToday}
              className="btn-secondary flex items-center gap-1 px-3.5 py-2.5 rounded-xl text-xs text-text-muted hover:text-danger"
              title="清空今日饮水打卡"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              清零重置
            </button>
          </div>
        </div>

        {/* Schedule */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-text-primary text-sm sm:text-base flex items-center gap-2">
            <Droplets className="h-5 w-5 text-accent-primary" />
            科学分段作息饮水参考时刻表
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scheduleSlots.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated p-3.5"
              >
                <div>
                  <span className="font-mono text-sm font-bold text-text-primary mr-2">
                    {slot.time}
                  </span>
                  <span className="text-xs text-text-muted">{slot.label}</span>
                </div>
                <span className="text-xs font-mono text-accent-primary font-medium">
                  +{slot.amount}ml
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
