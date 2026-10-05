'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import Decimal from 'decimal.js'
import { TrendingUp, Coins, PiggyBank, Calendar } from 'lucide-react'

export default function CompoundPage() {
  const [principal, setPrincipal] = useState<number>(100000)
  const [rate, setRate] = useState<number>(5)
  const [years, setYears] = useState<number>(10)
  const [compoundFreq, setCompoundFreq] = useState<number>(12) // monthly

  const results = useMemo(() => {
    if (principal <= 0 || rate < 0 || years <= 0) {
      return {
        amount: 0,
        totalInterest: 0,
        yearlyData: [],
        doublingYears: 0,
      }
    }

    const p = new Decimal(principal)
    const r = new Decimal(rate).dividedBy(100)
    const n = new Decimal(compoundFreq)
    const t = new Decimal(years)

    const amount = p.times(r.dividedBy(n).plus(1).pow(n.times(t)))
    const totalInterest = amount.minus(p)

    // Calculate year by year for chart / list
    const yearlyData: {
      year: number
      amount: number
      principal: number
      interest: number
    }[] = []

    for (let y = 1; y <= years; y++) {
      const yAmount = p.times(r.dividedBy(n).plus(1).pow(n.times(y)))
      yearlyData.push({
        year: y,
        amount: Math.round(yAmount.toNumber() * 100) / 100,
        principal,
        interest: Math.round(yAmount.minus(p).toNumber() * 100) / 100,
      })
    }

    const doublingYears = rate > 0 ? Math.round((72 / rate) * 10) / 10 : 0

    return {
      amount: Math.round(amount.toNumber() * 100) / 100,
      totalInterest: Math.round(totalInterest.toNumber() * 100) / 100,
      yearlyData,
      doublingYears,
    }
  }, [principal, rate, years, compoundFreq])

  const formatMoney = (n: number) =>
    n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const faq = [
    {
      question: '复利与单利的本质差异是什么？',
      answer:
        '单利计算中，只有初始本金会产生利息，前期产生的利息在后续年份不参与计息；而复利计算（俗称“利滚利”）中，每一计息周期产生的利息都会转入下一期的本金基数中一同生息，随着时间推移，收益增长曲线呈指数级加速上升。',
    },
    {
      question: '什么是 72 法则？',
      answer:
        '72 法则是金融学中用于心算资产翻倍所需时间的著名经验公式：资产翻倍年限 ≈ 72 ÷ 年化复合收益率百分比。例如按 6% 年化复利投资，约 72 ÷ 6 = 12 年资产翻倍；按 8% 年化复利，约 9 年翻倍。',
    },
    {
      question: '复利计息频率（按年、按季、按月）对收益影响大吗？',
      answer:
        '计息频率越高，实际产生的有效年化收益率（EAR）略高，因为利息更早进入本金滚存。例如 5% 年利率下，按月复利的实际年收益率约为 5.116%，长期投资下高频复利的收益优势更为显著。',
    },
  ]

  const howToSteps = [
    '填写初始投资本金（如 100,000 元）。',
    '设置预估年化复合收益率（%）与规划投资期限（如 10 年、20 年）。',
    '选择计息与复利滚存频率（按月、按季、按年）。',
    '查阅最终本息合计、利息总增益、72法则资产翻倍预估年限及逐年资产增长明细表。',
  ]

  return (
    <ToolLayout
      toolSlug="compound"
      principlesTitle="复利增长数学模型与金融 72 法则原理"
      principles={
        <>
          <p>
            <strong>1. 复利终值公式：</strong>
            {'A = P × (1 + r/n)^(nt)'}
            ，其中 P 为初始本金，r 为名义年化利率，n 为每年计息复利次数，t 为投资总年数，A 为期末本息总金额。
          </p>
          <p>
            <strong>2. 资产翻倍 72 法则：</strong>
            {'根据微积分对数泰勒展开近似，在收益率在 4%~12% 区间内，投资资产翻倍所需时间 t ≈ 72 / (r × 100)。'}
          </p>
          <p>
            <strong>3. 长期时间价值：</strong>在复利投资前期，本金占主要份额；在中后期，利息自身产生的再投资收益（复利效应）将逐渐超越本金总额。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer="本工具用于投资复利增长规律演示与财务规划测算。实际金融投资产品的收益率会随市场波动，投资有风险，入市需谨慎。"
    >
      <div className="space-y-6">
        {/* Controls Card */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[#0B0F19]/80 p-6 sm:p-8 backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                初始投资本金（元）
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white font-mono focus:border-[#6366F1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                年化复合收益率（%）
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={rate}
                onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white font-mono focus:border-[#6366F1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                投资期限（年）
              </label>
              <select
                aria-label="投资期限"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white font-medium focus:border-[#6366F1] focus:outline-none"
              >
                {[1, 3, 5, 10, 15, 20, 25, 30].map((y) => (
                  <option key={y} value={y}>
                    {y} 年
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                复利计息周期
              </label>
              <select
                aria-label="复利计息周期"
                value={compoundFreq}
                onChange={(e) => setCompoundFreq(Number(e.target.value))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white font-medium focus:border-[#6366F1] focus:outline-none"
              >
                <option value={12}>按月复利 (常见基金理财)</option>
                <option value={4}>按季度复利</option>
                <option value={1}>按年复利</option>
                <option value={365}>按日复利 (货币基金等)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-6 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">期末本息总金额</p>
            <p className="text-3xl font-extrabold text-[#10B981] font-mono tracking-tight my-1">
              ¥{formatMoney(results.amount)}
            </p>
            <p className="text-xs text-[#64748B]">
              本金的 {(results.amount / (principal || 1)).toFixed(2)} 倍
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-6 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">累计复利利息收益</p>
            <p className="text-3xl font-extrabold text-[#F59E0B] font-mono tracking-tight my-1">
              +¥{formatMoney(results.totalInterest)}
            </p>
            <p className="text-xs text-[#64748B]">
              纯利息回报率 {((results.totalInterest / (principal || 1)) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-6 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">72法则资产翻倍预估</p>
            <p className="text-3xl font-extrabold text-[#38BDF8] font-mono tracking-tight my-1">
              约 {results.doublingYears > 0 ? `${results.doublingYears} 年` : '未设定'}
            </p>
            <p className="text-xs text-[#64748B]">按当前 {rate}% 年化收益率推算</p>
          </div>
        </div>

        {/* Yearly Breakdown */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0B0F19]/80 p-6">
          <h3 className="font-semibold text-white text-sm sm:text-base mb-4">
            逐年复利增长轨迹明细表
          </h3>
          <div className="space-y-3">
            {results.yearlyData.map((row) => {
              const totalAmount = results.amount || 1
              const principalPct = Math.min(100, (row.principal / totalAmount) * 100)
              const interestPct = Math.min(100, (row.interest / totalAmount) * 100)

              return (
                <div
                  key={row.year}
                  className="rounded-xl border border-[rgba(99,102,241,0.1)] bg-[#070A12]/60 p-3 sm:p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs sm:text-sm">
                    <span className="font-medium text-[#94A3B8]">第 {row.year} 年末</span>
                    <span className="font-bold text-white font-mono">
                      ¥{formatMoney(row.amount)}
                      <span className="text-xs font-normal text-[#10B981] ml-2">
                        (利息: +¥{formatMoney(row.interest)})
                      </span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[#111827] rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-[#3B82F6]"
                      style={{ width: `${principalPct}%` }}
                      title="初始本金"
                    />
                    <div
                      className="h-full bg-[#10B981]"
                      style={{ width: `${interestPct}%` }}
                      title="累计利息收益"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
