'use client'

import { useMemo, useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { RotateCcw, Activity } from 'lucide-react'

type Method = 'reserve' | 'max'
type Formula = 'fox' | 'tanaka'

const ZONES = [
  {
    key: 'warmup',
    min: 50,
    max: 60,
    color: '#3B82F6',
    name: '热身放松区 (50%~60%)',
    desc: '极低强度活动，适合运动前动态热身、运动后乳酸恢复排酸与久坐初练人群。',
  },
  {
    key: 'fat',
    min: 60,
    max: 70,
    color: '#10B981',
    name: '燃脂有氧区 (60%~70%)',
    desc: '低强度舒适区间，脂肪供能比例最高，可持续长时间慢跑、骑行，适合减脂控重。',
  },
  {
    key: 'aerobic',
    min: 70,
    max: 80,
    color: '#F59E0B',
    name: '耐力有氧区 (70%~80%)',
    desc: '中等强度，能有效增强心脏泵血效率与肺活量，是马拉松等耐力项目的核心训练区间。',
  },
  {
    key: 'threshold',
    min: 80,
    max: 90,
    color: '#EF4444',
    name: '乳酸阈值区 (80%~90%)',
    desc: '高强度间歇，体内乳酸产生与清除达到动态平衡临界点，适合提升速度耐力与抗乳酸能力。',
  },
  {
    key: 'peak',
    min: 90,
    max: 100,
    color: '#DC2626',
    name: '极限无氧区 (90%~100%)',
    desc: '接近最大摄氧量与极限负荷，极度消耗，单次持续时间应控制在数秒至极短冲刺内。',
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
  const [age, setAge] = useState(30)
  const [maxHR, setMaxHR] = useState(190)
  const [restingHR, setRestingHR] = useState(70)
  const [method, setMethod] = useState<Method>('reserve')
  const [formula, setFormula] = useState<Formula>('fox')

  const estimatedMaxHR = useMemo(() => calculateMaxHeartRate(age, formula), [age, formula])
  const heartRateReserve = Math.max(0, maxHR - restingHR)

  const zones = useMemo(
    () =>
      ZONES.map((zone) => {
        const low =
          method === 'reserve'
            ? restingHR + (heartRateReserve * zone.min) / 100
            : (maxHR * zone.min) / 100
        const high =
          method === 'reserve'
            ? restingHR + (heartRateReserve * zone.max) / 100
            : (maxHR * zone.max) / 100

        return {
          ...zone,
          low: Math.round(low),
          high: Math.round(high),
        }
      }),
    [heartRateReserve, maxHR, method, restingHR]
  )

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

  const faq = [
    {
      question: '为什么心率储备法（Karvonen 公式）通常被认为比最大心率百分比更精确？',
      answer:
        '最大心率百分比法仅考虑年龄估算的最高极限，忽略了个体的基础体质；而心率储备法（HRR = 最大心率 - 静息心率）将静息心率纳入基底，真实反映了心脏的可动用储备空间。静息心率越低，通常意味着心肌收缩力越强，储备区间越宽。',
    },
    {
      question: 'Tanaka 公式与经典的 220 - 年龄 有什么不同？',
      answer:
        '220 - 年龄（Fox 公式）源自 1971 年的经验归纳，对中青年估算较好，但容易高估老年人的最大心率；Tanaka 公式（208 - 0.7 × 年龄）通过对数千名涵盖不同年龄与体能水平的大规模临床样本元分析回归得出，对中老年人及长期训练者准确度更高。',
    },
    {
      question: '运动手表测出的心率漂移（Cardiovascular Drift）是怎么回事？',
      answer:
        '长时间有氧运动（如长跑1小时以上）且环境温度较高时，由于体表散热出汗导致血容量轻微下降，为了维持同等心输出量，心脏跳动频率会自然逐渐上浮（每分钟增加 5~15 次），这是正常的体温调节生理代偿现象。',
    },
  ]

  const howToSteps = [
    '输入当前周岁年龄与清晨静息心率（静坐静息状态下测量，通常在 55~80 次/分）。',
    '选择最大心率估算公式（推荐 Fox 或 Tanaka），或直接输入体检实测最大心率。',
    '选择心率区间计算模型（推荐个性化更精准的【心率储备法 Karvonen】）。',
    '查阅 5 大运动强度区间（热身、燃脂、有氧、乳酸阈值、极限无氧）的目标心率范围。',
  ]

  return (
    <ToolLayout
      toolSlug="heart-rate"
      principlesTitle="训练心率区间与运动生理学计算原理（估算模型）"
      principles={
        <>
          <p>
            <strong>1. 最大心率估算模型：</strong>
            <br />
            - Fox 经典公式：{'HR_max = 220 - 年龄'}
            <br />
            - Tanaka 严谨公式：{'HR_max = 208 - 0.7 × 年龄'}
          </p>
          <p>
            <strong>2. Karvonen 心率储备计算公式：</strong>
            {'目标心率 = 静息心率 + (HR_max - 静息心率) × 强度百分比'}。
          </p>
          <p>
            <strong>3. 五区划分法（Zones）：</strong>按运动生理学能量代谢系统分为热身区（50%-60%）、燃脂区（60%-70%）、有氧耐力区（70%-80%）、无氧阈值区（80%-90%）与极限红区（90%-100%）。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer="本工具用于运动健身科学训练区间规划与体能参考。心血管疾病患者、高血压患者或正在服用 β-受体阻滞剂等影响心率药物的人群，运动心率上限须经专科医师运动压力测试核定。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="font-semibold text-text-primary text-sm sm:text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent-primary" />
              生理参数与计算模型设置
            </h3>
            <button
              type="button"
              onClick={reset}
              className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              恢复默认
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                年龄 (岁)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={age}
                onChange={(e) => setAge(clamp(Number(e.target.value), 10, 100))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-text-primary font-mono focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                静息心率 (bpm)
              </label>
              <input
                type="number"
                min={30}
                max={120}
                value={restingHR}
                onChange={(e) => setRestingHR(clamp(Number(e.target.value), 30, 120))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-text-primary font-mono focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                最大心率算法
              </label>
              <select
                aria-label="最大心率算法"
                value={formula}
                onChange={(e) => setFormula(e.target.value as Formula)}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-text-primary font-medium focus:border-accent-primary focus:outline-none transition-colors text-sm"
              >
                <option value="fox">Fox 公式 (220 - 年龄)</option>
                <option value="tanaka">Tanaka 公式 (208 - 0.7×年龄)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                区间计算方法
              </label>
              <select
                aria-label="区间计算方法"
                value={method}
                onChange={(e) => setMethod(e.target.value as Method)}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-text-primary font-medium focus:border-accent-primary focus:outline-none transition-colors text-sm"
              >
                <option value="reserve">心率储备法 (Karvonen 推荐)</option>
                <option value="max">最大心率百分比法 (%HRmax)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-surface-elevated rounded-xl p-3 border border-border">
            <span className="text-text-muted">
              当前估算最大心率：<strong className="text-text-primary font-mono">{estimatedMaxHR} bpm</strong>
              ，实际设定：<strong className="text-text-primary font-mono">{maxHR} bpm</strong>
            </span>
            <button
              type="button"
              onClick={syncEstimatedMax}
              className="text-accent-primary hover:underline font-semibold"
            >
              一键同步为公式估算值 ({estimatedMaxHR} bpm)
            </button>
          </div>
        </div>

        {/* Results Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 text-center">
            <p className="text-xs text-text-muted mb-1">基准最大心率 (Max HR)</p>
            <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tracking-tight my-1">
              {maxHR} <span className="text-sm font-sans text-text-muted font-normal">bpm</span>
            </p>
            <p className="text-xs text-text-muted">生理安全绝对极限</p>
          </div>

          <div className="card p-5 text-center">
            <p className="text-xs text-text-muted mb-1">静息清晨心率 (Resting HR)</p>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-tight my-1">
              {restingHR} <span className="text-sm font-sans text-text-muted font-normal">bpm</span>
            </p>
            <p className="text-xs text-text-muted">清晨未下床安静状态</p>
          </div>

          <div className="card p-5 text-center">
            <p className="text-xs text-text-muted mb-1">有效心率储备 (HR Reserve)</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight my-1">
              {heartRateReserve} <span className="text-sm font-sans text-text-muted font-normal">bpm</span>
            </p>
            <p className="text-xs text-text-muted">心功能可动用缓冲空间</p>
          </div>
        </div>

        {/* Zones Spectrum Cards */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-text-primary text-sm sm:text-base">
            5 大运动生理学靶心率区间 (Target Heart Rate Zones)
          </h3>
          <div className="space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.key}
                className="rounded-xl border border-border bg-surface-elevated p-4 border-l-4 transition-all"
                style={{ borderLeftColor: zone.color }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary text-sm">{zone.name}</span>
                  </div>
                  <span
                    className="font-mono text-base font-extrabold"
                    style={{ color: zone.color }}
                  >
                    {zone.low} ~ {zone.high} <span className="text-xs font-normal text-text-muted">bpm</span>
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-3 leading-relaxed">{zone.desc}</p>
                <div className="h-2 bg-canvas rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full rounded-full transition-all"
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
        </div>
      </div>
    </ToolLayout>
  )
}
