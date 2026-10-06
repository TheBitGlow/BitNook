'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {
  calculateRetirement,
  RetirementCategory,
  RETIREMENT_POLICY_METADATA,
} from '@/lib/finance/retirement'
import { ShieldCheck } from 'lucide-react'

export default function RetirementPage() {
  const [birthYear, setBirthYear] = useState<number>(1985)
  const [birthMonth, setBirthMonth] = useState<number>(6)
  const [category, setCategory] = useState<RetirementCategory>('male')

  const result = useMemo(() => {
    return calculateRetirement(birthYear, birthMonth, category)
  }, [birthYear, birthMonth, category])

  const faq = [
    {
      question: '国家渐进式延迟法定退休年龄是何时开始施行的？',
      answer:
        '依据第十四届全国人民代表大会常务委员会第十一次会议通过的《关于实施渐进式延迟法定退休年龄的决定》，该政策自 2025 年 1 月 1 日起正式施行，用 15 年时间逐步将男职工法定退休年龄延迟至 63 周岁，女职工分别延迟至 58 周岁、55 周岁。',
    },
    {
      question: '什么是“自愿、弹性”退休原则？',
      answer:
        '职工达到最低缴费年限，可以自愿选择弹性提前退休，提前时间最长不超过3年，且不得低于原法定退休年龄；达到法定退休年龄后，所在单位同意的，可以自愿选择弹性延迟退休，延迟时间最长不超过3年。',
    },
    {
      question: '领取基本养老金的最低缴费年限是如何调整的？',
      answer:
        '从 2030 年 1 月 1 日起，将职工按月领取基本养老金最低缴费年限由 15 年逐步提高至 20 年，每年提高 6 个月。2030 年前达到法定退休年龄的，最低缴费年限依然为 15 年。',
    },
  ]

  const howToSteps = [
    '选择出生年份（例如 1975、1985、1990）与具体出生月份。',
    '选择原退休人员身份类别：男职工、女职工（干部/管理技术岗）、女职工（工人岗）。',
    '系统自动按国家法定渐进改革月度对照公式精算延迟月份与退休年月。',
    '查阅弹性提前与延迟退休范围、以及该年份对应的最低基本养老保险缴费年限。',
  ]

  return (
    <ToolLayout
      toolSlug="retirement"
      principlesTitle="渐进式延迟法定退休年龄计算规则"
      principles={
        <>
          <p>
            <strong>1. 渐进式延迟节奏：</strong>自 2025 年 1 月 1 日起：
            <br />
            - 男职工：原 60 周岁，每 4 个月延迟 1 个月，逐步延迟至 63 周岁；
            <br />
            - 原 55 周岁女职工（管理/技术岗）：每 4 个月延迟 1 个月，逐步延迟至 58 周岁；
            <br />
            - 原 50 周岁女职工（工人岗）：每 2 个月延迟 1 个月，逐步延迟至 55 周岁。
          </p>
          <p>
            <strong>2. 弹性退休边界约束：</strong>提前退休不得低于原法定退休年龄（男60岁、女干部55岁、女工人50岁），且须满足届时最低缴费年限。延迟退休需经用人单位协商一致，最长不超3年。
          </p>
          <p>
            <strong>3. 政策依据：</strong>{RETIREMENT_POLICY_METADATA.policyName}（{RETIREMENT_POLICY_METADATA.passDate} 通过，{RETIREMENT_POLICY_METADATA.effectiveDate} 施行）。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer={RETIREMENT_POLICY_METADATA.disclaimer}
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="card p-6 sm:p-8 space-y-6">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-primary" />
              政策来源：{RETIREMENT_POLICY_METADATA.source}
            </span>
            <span className="rounded-full bg-surface-elevated border border-border px-3 py-1 font-mono text-text-secondary">
              政策生效时间：{RETIREMENT_POLICY_METADATA.effectiveDate}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                出生年份
              </label>
              <input
                type="number"
                min="1940"
                max="2010"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-xl font-bold font-mono text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                出生月份
              </label>
              <select
                aria-label="出生月份"
                value={birthMonth}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-text-primary font-medium focus:border-accent-primary focus:outline-none transition-colors text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m} 月
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                原法定退休类别与人员身份
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCategory('male')}
                  className={`rounded-xl p-3.5 border text-left transition-all ${
                    category === 'male'
                      ? 'border-accent-primary bg-accent-primary/10 text-text-primary shadow-sm'
                      : 'border-border bg-surface-elevated text-text-muted hover:text-text-primary hover:border-accent-primary/40'
                  }`}
                >
                  <div className="font-semibold text-sm">男职工</div>
                  <div className="text-[11px] opacity-75 mt-1">原60周岁 → 逐步延至63周岁</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('female-cadre')}
                  className={`rounded-xl p-3.5 border text-left transition-all ${
                    category === 'female-cadre'
                      ? 'border-accent-primary bg-accent-primary/10 text-text-primary shadow-sm'
                      : 'border-border bg-surface-elevated text-text-muted hover:text-text-primary hover:border-accent-primary/40'
                  }`}
                >
                  <div className="font-semibold text-sm">女干部 / 管理与技术岗</div>
                  <div className="text-[11px] opacity-75 mt-1">原55周岁 → 逐步延至58周岁</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('female-worker')}
                  className={`rounded-xl p-3.5 border text-left transition-all ${
                    category === 'female-worker'
                      ? 'border-accent-primary bg-accent-primary/10 text-text-primary shadow-sm'
                      : 'border-border bg-surface-elevated text-text-muted hover:text-text-primary hover:border-accent-primary/40'
                  }`}
                >
                  <div className="font-semibold text-sm">女工人</div>
                  <div className="text-[11px] opacity-75 mt-1">原50周岁 → 逐步延至55周岁</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6 text-center">
            <p className="text-xs text-text-muted mb-1">改革后法定退休时间</p>
            <p className="text-3xl font-extrabold text-accent-primary font-mono tracking-tight my-1">
              {result.statutoryRetirementDate}
            </p>
            <p className="text-xs text-text-muted">
              退休年龄：
              <span className="font-bold text-text-primary">
                {result.statutoryRetirementAge.years} 岁
                {result.statutoryRetirementAge.months > 0 && ` ${result.statutoryRetirementAge.months} 个月`}
              </span>
            </p>
          </div>

          <div className="card p-6 text-center">
            <p className="text-xs text-text-muted mb-1">延迟退休月份数</p>
            <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight my-1">
              +{result.delayedMonths} <span className="text-sm font-sans text-text-muted font-normal">个月</span>
            </p>
            <p className="text-xs text-text-muted">
              原法定退休时间：{result.originalRetirementDate}（{result.originalRetirementAge}周岁）
            </p>
          </div>

          <div className="card p-6 text-center">
            <p className="text-xs text-text-muted mb-1">基本养老金最低缴费年限</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight my-1">
              {result.minContributionYears} <span className="text-sm font-sans text-text-muted font-normal">年</span>
            </p>
            <p className="text-xs text-text-muted">
              {result.minContributionYears > 15 ? '2030年起逐步过渡至20年' : '2030年前保持15年基准'}
            </p>
          </div>
        </div>

        {/* Flexible Retirement Card */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-text-primary text-sm sm:text-base">
            自愿弹性退休区间（提前与延迟）
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-surface-elevated p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">弹性提前退休（最早）</span>
                <span className="text-xs text-text-muted">需达最低缴费年限</span>
              </div>
              <p className="text-xl font-bold font-mono text-text-primary">
                {result.earliestFlexibleRetirementDate}
              </p>
              <p className="text-xs text-text-muted mt-1">
                提前时间最长不超过 3 年，且不得早于原法定退休年龄（{result.originalRetirementAge} 周岁）。
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-elevated p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">弹性延迟退休（最晚）</span>
                <span className="text-xs text-text-muted">需用人单位协商同意</span>
              </div>
              <p className="text-xl font-bold font-mono text-text-primary">
                {result.latestFlexibleRetirementDate}
              </p>
              <p className="text-xs text-text-muted mt-1">
                达到法定退休年龄后，经与用人单位协商一致，延迟时间最长不超过 3 年。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
