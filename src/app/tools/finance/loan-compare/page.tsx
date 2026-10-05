'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { calculateMortgage, PaymentMethod } from '@/lib/finance/mortgage'
import { Plus, Trash2, Award, ArrowUpDown } from 'lucide-react'

interface LoanPlan {
  id: string
  name: string
  amount: number
  years: number
  rate: number
  paymentMethod: PaymentMethod
}

export default function LoanComparePage() {
  const [plans, setPlans] = useState<LoanPlan[]>([
    {
      id: 'plan-1',
      name: '方案 A（商业贷款 3.15% 等额本息）',
      amount: 1000000,
      years: 20,
      rate: 3.15,
      paymentMethod: 'equal-payment',
    },
    {
      id: 'plan-2',
      name: '方案 B（商业贷款 3.15% 等额本金）',
      amount: 1000000,
      years: 20,
      rate: 3.15,
      paymentMethod: 'equal-principal',
    },
    {
      id: 'plan-3',
      name: '方案 C（公积金组合/低息渠道 2.85%）',
      amount: 1000000,
      years: 20,
      rate: 2.85,
      paymentMethod: 'equal-payment',
    },
  ])

  const calculatedPlans = plans.map((p) => {
    const res = calculateMortgage({
      loanAmount: p.amount,
      annualRate: p.rate,
      years: p.years,
      paymentMethod: p.paymentMethod,
    })
    return {
      ...p,
      result: res,
    }
  })

  // Find minimum interest plan
  const minInterestPlanId = calculatedPlans.reduce((minId, cur) => {
    const minVal = calculatedPlans.find((p) => p.id === minId)?.result.totalInterest ?? Infinity
    return cur.result.totalInterest < minVal ? cur.id : minId
  }, calculatedPlans[0]?.id)

  const addPlan = () => {
    if (plans.length >= 5) return
    const nextChar = String.fromCharCode(65 + plans.length)
    setPlans([
      ...plans,
      {
        id: `plan-${Date.now()}`,
        name: `方案 ${nextChar}`,
        amount: 1000000,
        years: 20,
        rate: 3.25,
        paymentMethod: 'equal-payment',
      },
    ])
  }

  const removePlan = (id: string) => {
    if (plans.length <= 2) return
    setPlans(plans.filter((p) => p.id !== id))
  }

  const updatePlan = (id: string, field: keyof LoanPlan, value: any) => {
    setPlans(
      plans.map((p) => {
        if (p.id === id) {
          return { ...p, [field]: value }
        }
        return p
      })
    )
  }

  const formatMoney = (n: number) =>
    n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const faq = [
    {
      question: '不同还款方式（等额本金 vs 等额本息）对比时应如何权衡？',
      answer:
        '在相同贷款本金、利率和年限下，等额本金总利息支出一定少于等额本息。但等额本金首期月供压力显著高于等额本息，需评估前期家庭可支配收入是否充裕；若前期预算较紧或有确定投资渠道能跑赢借款利率，等额本息现金流更平缓。',
    },
    {
      question: '期限缩短5年能省下多少利息？',
      answer:
        '贷款年限由 30 年缩短为 25 年或 20 年，每月还款额会适度增加，但由于计息周期大幅减少，总利息支出通常能削减 20%~35% 以上，可以在本比价器中通过修改年限直观对比两套方案的利息差。',
    },
    {
      question: '消费贷、车贷声称的“月费率0.3%”与房贷年利率如何对比？',
      answer:
        '请特别警惕“分期费率”陷阱。分期手续费通常按借款全额本金计算，不随本金归还而减少，因此名义月费率 0.3%（名义年费率 3.6%）换算为实际内部年化利率（IRR）通常在 6.5%~7.2% 左右，远高于房贷公布的执行年化利率。',
    },
  ]

  const howToSteps = [
    '在不同方案卡片中分别输入借款本金、还款年限、年利率及还款方式。',
    '系统自动按国家金融统一还款算法测算每期月供、总利息支出与还款总额。',
    '点击【+ 添加对比方案】最多可同时并行对比 5 套不同借贷组合。',
    '对比表格中自动标注全场“总利息最低”推荐方案，助您节省财务融资成本。',
  ]

  return (
    <ToolLayout
      toolSlug="loan-compare"
      principlesTitle="多贷款方案成本对比分析逻辑"
      principles={
        <>
          <p>
            <strong>1. 全生命周期总成本对比：</strong>
            借款真实成本不仅取决于单月月供，更取决于全周期累计支付的总利息（\(TotalInterest = TotalPayment - Principal\)）。
          </p>
          <p>
            <strong>2. 精确月度逐期精算：</strong>
            所有方案均调用经 Decimal 精度校验的标准房贷模型，彻底避免了简易估算中的浮点舍入与首末月利息误差。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer="本工具用于不同信贷方案成本多维度对比，实际贷款审批利率、提前还款违约金条款及放款额度以借贷金融机构合同审批为准。"
    >
      <div className="space-y-6">
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {calculatedPlans.map((plan, index) => {
            const isLowestInterest = plan.id === minInterestPlanId && calculatedPlans.length > 1

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 backdrop-blur-md transition-all ${
                  isLowestInterest
                    ? 'border-[#10B981] bg-[#10B981]/5 shadow-lg shadow-[#10B981]/10'
                    : 'border-[rgba(99,102,241,0.18)] bg-[#0B0F19]/80'
                }`}
              >
                {/* Header & Badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      aria-label="方案名称"
                      value={plan.name}
                      onChange={(e) => updatePlan(plan.id, 'name', e.target.value)}
                      className="font-bold text-sm text-white bg-transparent border-b border-transparent hover:border-[#6366F1] focus:border-[#6366F1] outline-none"
                    />
                  </div>
                  {plans.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePlan(plan.id)}
                      className="text-[#64748B] hover:text-[#EF4444] transition-colors p-1"
                      title="删除此方案"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {isLowestInterest && (
                  <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-[#10B981]/20 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Award className="h-3.5 w-3.5" />
                    总利息最省方案
                  </div>
                )}

                {/* Inputs */}
                <div className="space-y-3 mb-5 text-xs">
                  <div>
                    <label className="block text-[#94A3B8] mb-1">贷款金额（元）</label>
                    <input
                      type="number"
                      step="10000"
                      value={plan.amount}
                      onChange={(e) => updatePlan(plan.id, 'amount', Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-lg border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-3 py-2 font-mono text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#94A3B8] mb-1">贷款期限</label>
                      <select
                        aria-label="贷款期限"
                        value={plan.years}
                        onChange={(e) => updatePlan(plan.id, 'years', Number(e.target.value))}
                        className="w-full rounded-lg border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-2.5 py-2 text-white"
                      >
                        {[5, 10, 15, 20, 25, 30].map((y) => (
                          <option key={y} value={y}>
                            {y} 年
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#94A3B8] mb-1">年化利率 (%)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={plan.rate}
                        onChange={(e) => updatePlan(plan.id, 'rate', Math.max(0, Number(e.target.value)))}
                        className="w-full rounded-lg border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-2.5 py-2 font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] mb-1">还款方式</label>
                    <select
                      aria-label="还款方式"
                      value={plan.paymentMethod}
                      onChange={(e) => updatePlan(plan.id, 'paymentMethod', e.target.value)}
                      className="w-full rounded-lg border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-3 py-2 text-white"
                    >
                      <option value="equal-payment">等额本息 (每月还款固定)</option>
                      <option value="equal-principal">等额本金 (每月本金相同)</option>
                    </select>
                  </div>
                </div>

                {/* Results Card */}
                <div className="rounded-xl border border-[rgba(99,102,241,0.1)] bg-[#070A12]/80 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">
                      {plan.paymentMethod === 'equal-payment' ? '月供' : '首月月供'}
                    </span>
                    <span className="font-bold text-sm text-white font-mono">
                      ¥{formatMoney(plan.result.firstMonthPayment)}
                    </span>
                  </div>

                  {plan.paymentMethod === 'equal-principal' && (
                    <div className="flex justify-between items-center text-[11px] text-[#94A3B8]">
                      <span>末月月供</span>
                      <span className="font-mono text-[#CBD5E1]">
                        ¥{formatMoney(plan.result.lastMonthPayment)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">总利息支出</span>
                    <span className="font-bold text-sm text-[#F59E0B] font-mono">
                      ¥{formatMoney(plan.result.totalInterest)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[rgba(99,102,241,0.1)]">
                    <span className="text-[#94A3B8]">还款总额 (本息)</span>
                    <span className="font-bold text-sm text-[#10B981] font-mono">
                      ¥{formatMoney(plan.result.totalPayment)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Plan Button */}
        {plans.length < 5 && (
          <button
            type="button"
            onClick={addPlan}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(99,102,241,0.3)] bg-[#0B0F19]/40 py-3 text-xs sm:text-sm font-semibold text-[#94A3B8] hover:border-[#6366F1] hover:text-white transition-all"
          >
            <Plus className="h-4 w-4" />
            添加对比方案（当前 {plans.length} / 5 组）
          </button>
        )}
      </div>
    </ToolLayout>
  )
}
