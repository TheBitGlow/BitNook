'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Flame, Utensils, Copy, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export default function CaloriesPage() {
  const [weight, setWeight] = useState(65)
  const [height, setHeight] = useState(170)
  const [age, setAge] = useState(30)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [activityLevel, setActivityLevel] = useState(1.2)
  const [copied, setCopied] = useState(false)

  const activityLevels = [
    { value: 1.2, label: '久坐办公（几乎不运动）' },
    { value: 1.375, label: '轻度活动（每周轻度运动 1-3 天）' },
    { value: 1.55, label: '中度活动（每周中等运动 3-5 天）' },
    { value: 1.725, label: '高度活跃（每周高强度运动 6-7 天）' },
    { value: 1.9, label: '专业级 / 重体力劳动（每日大负荷）' },
  ]

  // BMR calculation (Mifflin-St Jeor)
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161

  const tdee = Math.round(bmr * activityLevel)

  const goals = [
    {
      label: '健康减脂 (-500 kcal)',
      desc: '建议每周稳步减重约 0.4~0.5 kg',
      value: Math.max(1200, tdee - 500),
      colorClass: 'text-rose-600 dark:text-rose-400',
    },
    {
      label: '体重维持 (±0 kcal)',
      desc: '摄入与消耗平衡，维持现有体重',
      value: tdee,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: '增肌增重 (+300 kcal)',
      desc: '配合阻力力量训练，促进肌肉合成',
      value: tdee + 300,
      colorClass: 'text-blue-600 dark:text-blue-400',
    },
  ]

  const macros = {
    protein: Math.round(weight * 1.6),
    fat: Math.round((tdee * 0.25) / 9),
    carbs: Math.round((tdee - weight * 1.6 * 4 - tdee * 0.25) / 4),
  }

  const handleCopyReport = async () => {
    const report = [
      `【BitNook 卡路里与能量代谢测算报告】`,
      `• 生理体征：${gender === 'male' ? '男性' : '女性'} / ${age}岁 / ${height}cm / ${weight}kg`,
      `• 基础代谢率 (BMR)：${Math.round(bmr)} kcal/天`,
      `• 每日总能量消耗 (TDEE)：${tdee} kcal/天`,
      `• 目标摄入推荐：`,
      `  - 减脂目标：${Math.max(1200, tdee - 500)} kcal/天`,
      `  - 维持目标：${tdee} kcal/天`,
      `  - 增肌目标：${tdee + 300} kcal/天`,
      `• 推荐三大营养素基准：蛋白质 ${macros.protein}g / 脂肪 ${macros.fat}g / 碳水 ${macros.carbs}g`,
      `测算来源：遵循 Mifflin-St Jeor 临床方程与中国居民膳食营养素参考摄入量 (DRIs)。`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(report)
      setCopied(true)
      trackEvent('copy', { tool: 'calories' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const faq = [
    {
      question: '什么是 BMR（基础代谢）与 TDEE（每日总能量消耗）？',
      answer:
        'BMR 是人体在完全安静、清醒且空腹状态下维持呼吸、心跳、细胞代谢等基础生命活动所消耗的最低热量；TDEE 是在 BMR 基础上加上日常走动、工作、运动及食物热效应后的全天真实能量总消耗。',
    },
    {
      question: '减脂期每天少吃 500 大卡为什么是黄金热量缺口？',
      answer:
        '人体消耗 1 公斤脂肪约需 7,700 大卡热量差。每天创造约 500 大卡缺口，半个月可制造 7,500 大卡缺口，既能保证正常激素代谢与肌肉量不流失，又可达到可持续的平稳减脂节奏。极低热量节食会导致基础代谢损伤与快速反弹。',
    },
    {
      question: '三大营养素（碳水、蛋白质、脂肪）应当如何分配？',
      answer:
        '常规健康比例中，蛋白质建议按体重 1.2~1.8g/kg（保证机体修复）；脂肪占全天总能量约 20%~30%（维持正常内分泌）；其余热量由复合碳水化合物提供。',
    },
  ]

  const howToSteps = [
    '输入当前体重（kg）、身高（cm）、年龄与生理性别。',
    '根据每周实际运动频次选择日常身体活动水平系数。',
    '系统自动采用 Mifflin-St Jeor 公式计算基础代谢 (BMR) 与总消耗 (TDEE)。',
    '根据减脂、维持或增肌目标查看推荐热量摄入及三大营养素克数方案。',
  ]

  return (
    <ToolLayout
      toolSlug="calories"
      principlesTitle="基础代谢 (BMR) 与能量总消耗 (TDEE) 生理学模型"
      principles={
        <>
          <p>
            <strong>1. Mifflin-St Jeor 临床方程：</strong>
            <br />
            - 男性：BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 + 5
            <br />
            - 女性：BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 - 161
            <br />
            经过临床医学双盲验证，Mifflin-St Jeor 公式对现代健康成人的预测精度显著优于传统 Harris-Benedict 方程。
          </p>
          <p>
            <strong>2. 身体活动系数 (Physical Activity Level, PAL)：</strong>
            根据国际标准，久坐系数约为 1.2，轻度活动 1.375，中度 1.55，重度 1.725。TDEE = BMR × PAL。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      dataSources={[
        {
          name: '美国临床营养学杂志 (AJCN) - Mifflin et al.',
          description: '健康成年人群静息代谢率预测模型验证',
        },
        {
          name: '中国营养学会《中国居民膳食营养素参考摄入量 (DRIs)》',
          description: '三大宏量营养素供能比与成人能量平衡标准',
        },
      ]}
      disclaimer="本工具用于日常体态管理与膳食热量参考。患有甲亢/甲减、糖尿病等代谢内分泌疾病患者或孕产妇请遵临床医嘱定制营养方案。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="card p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                体重 (kg)
              </label>
              <input
                type="number"
                min="30"
                max="250"
                value={weight}
                onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-text-primary font-mono focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                身高 (cm)
              </label>
              <input
                type="number"
                min="100"
                max="240"
                value={height}
                onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-text-primary font-mono focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                年龄 (岁)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-text-primary font-mono focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                生理性别
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`rounded-xl py-2.5 text-xs font-semibold border transition-all ${
                    gender === 'male'
                      ? 'border-accent-primary bg-accent-primary/10 text-text-primary shadow-sm'
                      : 'border-border bg-canvas text-text-muted hover:text-text-primary'
                  }`}
                >
                  男性
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`rounded-xl py-2.5 text-xs font-semibold border transition-all ${
                    gender === 'female'
                      ? 'border-accent-primary bg-accent-primary/10 text-text-primary shadow-sm'
                      : 'border-border bg-canvas text-text-muted hover:text-text-primary'
                  }`}
                >
                  女性
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              日常身体活动水平
            </label>
            <select
              aria-label="日常活动水平"
              value={activityLevel}
              onChange={(e) => setActivityLevel(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-text-primary font-medium focus:border-accent-primary focus:outline-none transition-colors text-sm"
            >
              {activityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Header with Copy */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-secondary">代谢与热量测算结果</h2>
          <button
            type="button"
            onClick={handleCopyReport}
            className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                <span className="text-success">已复制报告</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>复制分析报告</span>
              </>
            )}
          </button>
        </div>

        {/* Results Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-6 text-center">
            <p className="text-xs text-text-muted mb-1">基础代谢率 (BMR)</p>
            <p className="text-4xl font-extrabold text-text-primary font-mono tracking-tight my-1">
              {Math.round(bmr)}{' '}
              <span className="text-base font-sans text-text-muted font-normal">kcal/天</span>
            </p>
            <p className="text-xs text-text-muted">人体维持基本生命体征所需底线热量</p>
          </div>

          <div className="card p-6 text-center">
            <p className="text-xs text-text-muted mb-1">每日总能量消耗 (TDEE)</p>
            <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight my-1">
              {tdee} <span className="text-base font-sans text-text-muted font-normal">kcal/天</span>
            </p>
            <p className="text-xs text-text-muted">包含日常工作生活与运动在内的真实总消耗</p>
          </div>
        </div>

        {/* Goal Intake Breakdown */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-text-primary text-sm sm:text-base flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-500" />
            不同体态管理目标下的建议每日热量摄入
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {goals.map((g) => (
              <div
                key={g.label}
                className="rounded-xl border border-border bg-surface-elevated p-4 text-center"
              >
                <span className="font-semibold text-xs text-text-secondary">{g.label}</span>
                <p
                  className={`text-3xl font-extrabold font-mono my-2 ${g.colorClass}`}
                >
                  {g.value}{' '}
                  <span className="text-xs font-normal text-text-muted">kcal</span>
                </p>
                <p className="text-[11px] text-text-muted">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-text-primary text-sm sm:text-base flex items-center gap-2">
            <Utensils className="h-5 w-5 text-accent-primary" />
            三大宏量营养素参考配比（维持基准）
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-surface-elevated p-4 text-center">
              <span className="text-xs text-text-muted">蛋白质 (约1.6g/kg)</span>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono my-1">
                {macros.protein} <span className="text-xs font-sans text-text-muted font-normal">克/天</span>
              </p>
              <p className="text-[11px] text-text-muted">
                约 {macros.protein * 4} kcal (占总能量约 {Math.round(((macros.protein * 4) / tdee) * 100)}%)
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-elevated p-4 text-center">
              <span className="text-xs text-text-muted">健康脂肪 (约25%热量)</span>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono my-1">
                {macros.fat} <span className="text-xs font-sans text-text-muted font-normal">克/天</span>
              </p>
              <p className="text-[11px] text-text-muted">
                约 {macros.fat * 9} kcal (维持健康必需脂肪酸)
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-elevated p-4 text-center">
              <span className="text-xs text-text-muted">优质碳水 (余量补充)</span>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono my-1">
                {macros.carbs} <span className="text-xs font-sans text-text-muted font-normal">克/天</span>
              </p>
              <p className="text-[11px] text-text-muted">
                约 {macros.carbs * 4} kcal (全谷物与根茎类为主)
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
