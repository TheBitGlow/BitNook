'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {
  calculateInvestmentMetrics,
} from '@/lib/finance/roi'
import { TrendingUp, BarChart2, DollarSign, Percent, Plus, Trash2 } from 'lucide-react'

export default function ROIPage() {
  const [initialInvestment, setInitialInvestment] = useState<number>(100000)
  const [discountRate, setDiscountRate] = useState<number>(8)
  const [cashFlowsInput, setCashFlowsInput] = useState<number[]>([
    25000, 30000, 35000, 40000, 45000,
  ])

  const result = useMemo(() => {
    return calculateInvestmentMetrics(initialInvestment, cashFlowsInput, discountRate)
  }, [initialInvestment, cashFlowsInput, discountRate])

  const formatMoney = (n: number) =>
    n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const updateCashFlow = (index: number, val: number) => {
    const next = [...cashFlowsInput]
    next[index] = val
    setCashFlowsInput(next)
  }

  const addYear = () => {
    const last = cashFlowsInput[cashFlowsInput.length - 1] || 30000
    setCashFlowsInput([...cashFlowsInput, last])
  }

  const removeYear = (index: number) => {
    if (cashFlowsInput.length <= 1) return
    setCashFlowsInput(cashFlowsInput.filter((_, i) => i !== index))
  }

  const faq = [
    {
      question: 'NPV（净现值）为正说明什么？',
      answer:
        'NPV 大于 0 说明该项目按设定的折现率折现后，未来现金流入的现值总和超过了初始投资成本，表明该投资除了满足预期的基准回报率外，还能创造超额经济价值。',
    },
    {
      question: 'IRR（内部收益率）与简单 ROI 的区别是什么？',
      answer:
        '简单 ROI 忽略了资金的时间价值（今年收到的10万元与5年后收到的10万元被等同对待）；而 IRR 考虑了现金流发生的具体时间与复利折现，是使项目净现值等于零时的真实折现率，更适合评估多期不同回收周期的商业与理财项目。',
    },
    {
      question: '在什么情况下会计算不出 IRR？',
      answer:
        '如果现金流全为负数（只有支出没有回收）或全为正数（没有初始支出），NPV 曲线与利率横坐标没有交点，数学上不存在内部收益率；此外极少数交替正负剧烈波动的现金流可能存在多重根。',
    },
  ]

  const howToSteps = [
    '填写初始总投资成本（第0年现金流出，如 100,000 元）。',
    '设置基准折现率（资金成本或无风险收益率，如 6% ~ 10%）。',
    '在下方逐年现金流列表中编辑每年的预期回款金额，可增减投资年限。',
    '系统实时测算并呈现真实内部收益率 (IRR)、净现值 (NPV) 与逐年折现现值明细表。',
  ]

  return (
    <ToolLayout
      toolSlug="roi"
      principlesTitle="投资回报率 (ROI)、净现值 (NPV) 与内部收益率 (IRR) 算法"
      principles={
        <>
          <p>
            <strong>1. 净现值 (NPV) 计算公式：</strong>
            {'NPV = -C₀ + ∑ [Cₜ / (1 + r)ᵗ]'}
            ，其中 C₀ 为初始投资本金，Cₜ 为第 t 年末净现金流，r 为折现率。
          </p>
          <p>
            <strong>2. 内部收益率 (IRR) 牛顿迭代法求解：</strong>
            IRR 为令 {'NPV(r) = 0'} 时的折现率 r*。本工具使用数值分析中的牛顿-拉夫逊法结合二分法进行高精度真实迭代收敛求解，拒绝虚假宣传。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[#0B0F19]/80 p-6 sm:p-8 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                初始投资额（第0年流出，元）
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-2xl font-bold font-mono text-white focus:border-[#6366F1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                基准年折现率（资金成本，%）
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={discountRate}
                onChange={(e) => setDiscountRate(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-2xl font-bold font-mono text-white focus:border-[#6366F1] focus:outline-none"
              />
            </div>
          </div>

          {/* Cash Flows List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-[#CBD5E1]">
                各年份预期现金流入（元）
              </label>
              <button
                type="button"
                onClick={addYear}
                className="flex items-center gap-1 rounded-lg border border-[rgba(99,102,241,0.3)] bg-[#111827] px-3 py-1 text-xs text-[#6366F1] hover:text-white hover:border-[#6366F1] transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                增加一年现金流
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {cashFlowsInput.map((val, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border border-[rgba(99,102,241,0.12)] bg-[#070A12]/60 p-2.5"
                >
                  <span className="w-16 text-xs text-[#94A3B8] font-mono">
                    第 {idx + 1} 年:
                  </span>
                  <input
                    type="number"
                    step="1000"
                    value={val}
                    onChange={(e) => updateCashFlow(idx, Number(e.target.value))}
                    className="flex-1 rounded-lg border border-[rgba(99,102,241,0.15)] bg-[#0B0F19] px-2.5 py-1 text-sm font-mono text-white focus:border-[#6366F1] focus:outline-none"
                  />
                  {cashFlowsInput.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeYear(idx)}
                      className="p-1 text-[#64748B] hover:text-[#EF4444] transition-colors"
                      title="删除此年"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-6 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">内部收益率 (IRR)</p>
            <p className="text-3xl font-extrabold text-[#10B981] font-mono tracking-tight my-1">
              {result.irr !== null ? `${result.irr}%` : '无有效数值解'}
            </p>
            <p className="text-[11px] text-[#64748B]">使净现值等于0时的真实贴现率</p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-6 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">净现值 (NPV, {discountRate}%折现)</p>
            <p
              className={`text-3xl font-extrabold font-mono tracking-tight my-1 ${
                result.npv >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {result.npv >= 0 ? '+' : ''}¥{formatMoney(result.npv)}
            </p>
            <p className="text-[11px] text-[#64748B]">
              {result.npv >= 0 ? '超额价值创造（可行方案）' : '未达预期折现收益率'}
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-6 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">简单投资回报率 (ROI)</p>
            <p className="text-3xl font-extrabold text-[#38BDF8] font-mono tracking-tight my-1">
              {result.simpleROI}%
            </p>
            <p className="text-[11px] text-[#64748B]">
              净利润 ¥{formatMoney(result.netProfit)}（未折现）
            </p>
          </div>
        </div>

        {/* Detailed Cashflow Discounting Table */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0B0F19]/80 p-6">
          <h3 className="font-semibold text-white text-sm sm:text-base mb-4">
            逐年现金流折现现值明细 (Discounted Cash Flow Schedule)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left font-mono">
              <thead>
                <tr className="border-b border-[rgba(99,102,241,0.15)] text-[#64748B]">
                  <th className="py-2.5 px-3">周期</th>
                  <th className="py-2.5 px-3 text-right">名义现金流</th>
                  <th className="py-2.5 px-3 text-right">折现系数 (1/(1+r)^t)</th>
                  <th className="py-2.5 px-3 text-right">折现后净现值贡献</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(99,102,241,0.06)]">
                <tr className="hover:bg-[#1E293B]/20 text-[#EF4444]">
                  <td className="py-2.5 px-3">第 0 年 (初始投资)</td>
                  <td className="py-2.5 px-3 text-right">-¥{formatMoney(initialInvestment)}</td>
                  <td className="py-2.5 px-3 text-right">1.0000</td>
                  <td className="py-2.5 px-3 text-right">-¥{formatMoney(initialInvestment)}</td>
                </tr>
                {result.cashFlows.map((cf) => {
                  const factor = 1 / Math.pow(1 + discountRate / 100, cf.period)
                  const pv = cf.amount * factor
                  return (
                    <tr key={cf.period} className="hover:bg-[#1E293B]/20 text-white">
                      <td className="py-2.5 px-3 text-[#94A3B8]">第 {cf.period} 年</td>
                      <td className="py-2.5 px-3 text-right text-[#10B981]">+¥{formatMoney(cf.amount)}</td>
                      <td className="py-2.5 px-3 text-right text-[#94A3B8]">{factor.toFixed(4)}</td>
                      <td className="py-2.5 px-3 text-right text-[#38BDF8]">+¥{formatMoney(pv)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
