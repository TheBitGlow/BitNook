'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {
  calculateMortgage,
  PaymentMethod,
  MortgageInputMode,
  MORTGAGE_POLICY_PRESETS,
} from '@/lib/finance/mortgage'
import { Calculator, ArrowRightLeft, FileSpreadsheet, Percent, Info } from 'lucide-react'

export default function MortgagePage() {
  const [inputMode, setInputMode] = useState<MortgageInputMode>('house-price')
  const [housePrice, setHousePrice] = useState<number>(2000000)
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20)
  const [directLoanAmount, setDirectLoanAmount] = useState<number>(1400000)
  const [years, setYears] = useState<number>(30)
  const [annualRate, setAnnualRate] = useState<number>(3.15)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('equal-payment')
  const [showAllSchedule, setShowAllSchedule] = useState<boolean>(false)

  // Independent data model calculations based on input mode
  const effectiveLoanAmount = useMemo(() => {
    if (inputMode === 'house-price') {
      const down = (housePrice * downPaymentPercent) / 100
      return Math.max(0, housePrice - down)
    }
    return Math.max(0, directLoanAmount)
  }, [inputMode, housePrice, downPaymentPercent, directLoanAmount])

  const effectiveDownPayment = useMemo(() => {
    if (inputMode === 'house-price') {
      return (housePrice * downPaymentPercent) / 100
    }
    return 0
  }, [inputMode, housePrice, downPaymentPercent])

  const result = useMemo(() => {
    return calculateMortgage({
      loanAmount: effectiveLoanAmount,
      downPayment: effectiveDownPayment,
      annualRate,
      years,
      paymentMethod,
    })
  }, [effectiveLoanAmount, effectiveDownPayment, annualRate, years, paymentMethod])

  const formatMoney = (n: number) =>
    n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const displaySchedule = showAllSchedule ? result.schedule : result.schedule.slice(0, 12)

  const faq = [
    {
      question: '等额本息和等额本金有什么核心区别？',
      answer:
        '等额本息每月还款金额固定，前期还款中利息占比较大，本金占比较小，适合收入稳定但前期预算有限的购房者；等额本金每月归还的本金固定，利息随剩余本金逐月递减，因此首月还款最多，随后逐月减少，虽然总利息支出低于等额本息，但前期还款压力显著偏大。',
    },
    {
      question: '公积金贷款与商业贷款利率可以组合计算吗？',
      answer:
        '若您的贷款包含公积金与商业两部分，可分别使用本计算器测算各自的月供与总利息后相加，或使用加权平均利率测算综合还款成本。',
    },
    {
      question: '如果考虑未来提前还贷，选哪种还款方式更划算？',
      answer:
        '若计划在贷款前期（如3~5年内）提前大额还款，等额本金方式前期归还本金较多，能更快压低剩余贷款本金；但等额本息若在前期提前还款，同样能够免除后续未产生的大额利息。',
    },
  ]

  const howToSteps = [
    '选择输入模式：支持根据【房屋总价+首付比例】推算，或直接输入【贷款金额】。',
    '选择贷款年限（常见为 10~30 年）并填写商业或公积金执行年利率。',
    '切换【等额本息】或【等额本金】还款方式，查看两者的月供与利息差异。',
    '查看首月月供、末月月供、总利息支出及下方的逐月还款本息计划表。',
  ]

  return (
    <ToolLayout
      toolSlug="mortgage"
      principlesTitle="房贷数学模型与政策基准说明"
      principles={
        <>
          <p>
            <strong>1. 等额本息计算公式：</strong>每月还款额 M = P × [r(1+r)ⁿ] / [(1+r)ⁿ - 1]，其中 P 为贷款本金，r 为月利率（年利率 / 12），n 为还款总月数。每月还款总额恒定，利息逐月减少，本金逐月递增。
          </p>
          <p>
            <strong>2. 等额本金计算公式：</strong>第 m 个月还款额 Mₘ = (P / n) + [P - (m - 1) × (P / n)] × r。每月偿还本金固定为 P / n，每月月供随未还本金减少而逐月递减。
          </p>
          <p>
            <strong>3. 利率政策解耦：</strong>房贷实际执行利率由基准 LPR（5年期以上贷款市场报价利率）加减基点（BP）确定。本工具支持自主调整年利率，不强制绑定特定时点的硬编码利率。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
    >
      <div className="space-y-6">
        {/* Controls Card */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[#0B0F19]/80 p-6 backdrop-blur-md">
          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(99,102,241,0.1)] pb-5 mb-6">
            <div className="flex rounded-xl bg-[#070A12] p-1 border border-[rgba(99,102,241,0.15)]">
              <button
                type="button"
                onClick={() => setInputMode('house-price')}
                className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                  inputMode === 'house-price'
                    ? 'bg-[#6366F1] text-white shadow'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                按房屋总价计算
              </button>
              <button
                type="button"
                onClick={() => setInputMode('loan-amount')}
                className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                  inputMode === 'loan-amount'
                    ? 'bg-[#6366F1] text-white shadow'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                直接输入贷款金额
              </button>
            </div>

            {/* Quick Policy Presets */}
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-[#10B981]" />
              <select
                aria-label="利率政策参考预设"
                className="rounded-lg border border-[rgba(99,102,241,0.15)] bg-[#070A12] px-3 py-1.5 text-xs text-[#94A3B8] focus:border-[#6366F1] focus:outline-none"
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val)) setAnnualRate(val)
                }}
                value={annualRate}
              >
                <option value={annualRate}>参考利率预设 ({annualRate}%)</option>
                {MORTGAGE_POLICY_PRESETS.map((preset, idx) => (
                  <option key={idx} value={preset.commercialRate}>
                    {preset.name} - {preset.commercialRate}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {inputMode === 'house-price' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    房屋总价（元）
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    value={housePrice}
                    onChange={(e) => setHousePrice(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white focus:border-[#6366F1] focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-[#64748B]">
                    约 {(housePrice / 10000).toFixed(1)} 万元
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    首付比例（%）
                  </label>
                  <select
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white focus:border-[#6366F1] focus:outline-none"
                  >
                    {[15, 20, 25, 30, 35, 40, 50, 60, 70, 80].map((p) => (
                      <option key={p} value={p}>
                        {p}% 首付（¥{formatMoney((housePrice * p) / 100)}）
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  贷款金额（元）
                </label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  value={directLoanAmount}
                  onChange={(e) => setDirectLoanAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white text-lg font-mono focus:border-[#6366F1] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#64748B]">
                  约 {(directLoanAmount / 10000).toFixed(1)} 万元
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                贷款年限（年）
              </label>
              <select
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white focus:border-[#6366F1] focus:outline-none"
              >
                {[5, 10, 15, 20, 25, 30].map((y) => (
                  <option key={y} value={y}>
                    {y} 年 ({y * 12} 期)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                年利率（%）
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="25"
                value={annualRate}
                onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white focus:border-[#6366F1] focus:outline-none"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#94A3B8] mb-2">
                还款方式
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('equal-payment')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3.5 border transition-all ${
                    paymentMethod === 'equal-payment'
                      ? 'border-[#10B981] bg-[#10B981]/15 text-white shadow-lg'
                      : 'border-[rgba(99,102,241,0.15)] bg-[#070A12] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span className="font-semibold text-sm">等额本息</span>
                  <span className="text-[11px] opacity-75 mt-0.5">每月月供恒定 · 前期压力相对均匀</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('equal-principal')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3.5 border transition-all ${
                    paymentMethod === 'equal-principal'
                      ? 'border-[#10B981] bg-[#10B981]/15 text-white shadow-lg'
                      : 'border-[rgba(99,102,241,0.15)] bg-[#070A12] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span className="font-semibold text-sm">等额本金</span>
                  <span className="text-[11px] opacity-75 mt-0.5">月供逐月递减 · 总利息支出更省</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-4 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">
              {paymentMethod === 'equal-payment' ? '每月还款额' : '首月还款额'}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white font-mono">
              ¥{formatMoney(result.firstMonthPayment)}
            </p>
            {paymentMethod === 'equal-principal' && (
              <p className="text-[11px] text-[#10B981] mt-1">
                末月: ¥{formatMoney(result.lastMonthPayment)} (每月约减 ¥{result.monthlyDecrease})
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-4 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">贷款实际本金</p>
            <p className="text-xl sm:text-2xl font-bold text-[#38BDF8] font-mono">
              ¥{formatMoney(result.loanAmount)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">
              {(result.loanAmount / 10000).toFixed(1)} 万元
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-4 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">累计支付利息</p>
            <p className="text-xl sm:text-2xl font-bold text-[#F59E0B] font-mono">
              ¥{formatMoney(result.totalInterest)}
            </p>
            <p className="text-[11px] text-[#F59E0B]/80 mt-1">
              {(result.totalInterest / 10000).toFixed(1)} 万元
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-4 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">累计还款总额</p>
            <p className="text-xl sm:text-2xl font-bold text-[#10B981] font-mono">
              ¥{formatMoney(result.totalPayment)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">
              本息合计 {(result.totalPayment / 10000).toFixed(1)} 万元
            </p>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0B0F19]/80 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#6366F1]" />
              <h3 className="font-semibold text-white text-sm sm:text-base">
                还款计划明细 ({showAllSchedule ? `全部 ${result.schedule.length} 期` : '前 12 期预览'})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAllSchedule(!showAllSchedule)}
              className="text-xs text-[#6366F1] hover:text-[#818CF8] transition-colors"
            >
              {showAllSchedule ? '收起至前12个月' : `查看全部 ${result.schedule.length} 个月还款明细`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead>
                <tr className="border-b border-[rgba(99,102,241,0.15)] text-[#64748B]">
                  <th className="py-2.5 px-3">期数</th>
                  <th className="py-2.5 px-3 text-right">月还款额</th>
                  <th className="py-2.5 px-3 text-right">偿还本金</th>
                  <th className="py-2.5 px-3 text-right">偿还利息</th>
                  <th className="py-2.5 px-3 text-right">剩余贷款本金</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(99,102,241,0.06)] font-mono">
                {displaySchedule.map((row) => (
                  <tr key={row.month} className="hover:bg-[#1E293B]/30 transition-colors">
                    <td className="py-2.5 px-3 text-[#94A3B8]">第 {row.month} 期</td>
                    <td className="py-2.5 px-3 text-right font-medium text-white">
                      ¥{formatMoney(row.monthlyPayment)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#10B981]">
                      ¥{formatMoney(row.principal)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#F59E0B]">
                      ¥{formatMoney(row.interest)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#94A3B8]">
                      ¥{formatMoney(row.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
