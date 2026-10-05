'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {
  DEPOSIT_RATE_DATASET,
  DepositRateItem,
  calculateDeposit,
} from '@/lib/finance/deposit'
import { PiggyBank, Calendar, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function DepositPage() {
  const [principal, setPrincipal] = useState<number>(100000)
  const [selectedId, setSelectedId] = useState<string>('term-1y')
  const [customRateEnabled, setCustomRateEnabled] = useState<boolean>(false)
  const [customRate, setCustomRate] = useState<number>(1.50)

  const selectedItem = useMemo(() => {
    return (
      DEPOSIT_RATE_DATASET.find((item) => item.id === selectedId) ||
      DEPOSIT_RATE_DATASET[3]
    )
  }, [selectedId])

  const result = useMemo(() => {
    return calculateDeposit(
      principal,
      selectedItem,
      customRateEnabled ? customRate : undefined
    )
  }, [principal, selectedItem, customRateEnabled, customRate])

  const formatMoney = (n: number) =>
    n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const faq = [
    {
      question: '为什么不同银行给出的定期存款利率不同？',
      answer:
        '自利率市场化改革推进以来，各商业银行以央行基准利率为底，根据自身负债端成本、网点吸收存款需求在自律机制允许的上限内自主加点定价，因此国有大行、股份制银行与城商行/农商行存在阶梯式利率差异。',
    },
    {
      question: '定期存款若提前支取，利息如何计算？',
      answer:
        '绝大多数普通人民币定期存款若在到期日前部分或全部提前支取，提前支取的部分将按支取日当天商业银行挂牌的活期存款基准利率计息，未支取部分通常继续按原存单约定期限计息。',
    },
    {
      question: '大额存单 20 万元起存有什么特点？',
      answer:
        '大额存单（CD）是由银行业金融机构面向个人发行的记账式大额存款凭证，属于一般性存款，享有《存款保险条例》最高 50 万元偿付保障，且许多银行支持存单二级市场转让功能。',
    },
  ]

  const howToSteps = [
    '输入计划存入的本金金额（元）。',
    '从基准数据集中选择存款品种（活期、3个月~5年整存整取、大额存单）。',
    '如银行有专属特色存款或浮动加点，可勾选【自定义利率】手动输入真实执行利率。',
    '查看预期到期利息收益、本息合计及各期限品种对比明细。',
  ]

  return (
    <ToolLayout
      toolSlug="deposit"
      principlesTitle="存款利息计算公式与参数规范"
      principles={
        <>
          <p>
            <strong>1. 利息计算基本公式：</strong>单利计息公式为：{'利息 = 本金 × 年利率 × 存期（年）'}。其中定期整存整取按对年对月对日计算，不足整月的按实际天数计算。
          </p>
          <p>
            <strong>2. 数据参数规范说明：</strong>本计算器默认提供的主流银行挂牌利率均来自公开金融数据，页面明确标示执行日期与生效基准，仅作为财务估算参数，不代表特定银行的收益承诺。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[#0B0F19]/80 p-6 sm:p-8 backdrop-blur-md">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(99,102,241,0.1)] pb-4 mb-6 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#10B981]" />
              数据来源：{selectedItem.source}
            </span>
            <span className="rounded-full bg-[#1E293B] px-3 py-1 font-mono text-[#CBD5E1]">
              基准版本：{selectedItem.effectiveDate}（更新于 {selectedItem.updatedAt}）
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                存款本金（元）
              </label>
              <input
                type="number"
                min="1"
                step="1000"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-2xl font-bold font-mono text-white focus:border-[#6366F1] focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-[#64748B]">
                折合 {(principal / 10000).toFixed(2)} 万元
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                存款品种选择
              </label>
              <select
                aria-label="选择存款品种"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-white font-medium focus:border-[#6366F1] focus:outline-none"
              >
                {DEPOSIT_RATE_DATASET.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}（基准 {item.rate}%，起存 ¥{item.minAmount.toLocaleString()}）
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-[#64748B]">{selectedItem.note}</p>
            </div>
          </div>

          {/* Min Amount warning if not eligible */}
          {!result.isEligible && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3.5 text-xs text-[#EF4444]">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                注意：当前所选品种【{selectedItem.name}】起存门槛为 ¥{selectedItem.minAmount.toLocaleString()} 元，您当前输入的本金低于起存要求。
              </span>
            </div>
          )}

          {/* Custom Rate Toggle */}
          <div className="rounded-xl border border-[rgba(99,102,241,0.1)] bg-[#070A12]/50 p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-[#CBD5E1]">
                <input
                  type="checkbox"
                  checked={customRateEnabled}
                  onChange={(e) => setCustomRateEnabled(e.target.checked)}
                  className="rounded border-[rgba(99,102,241,0.3)] bg-[#111827] text-[#6366F1] focus:ring-0"
                />
                自定义年执行利率（手动输入银行给出的实际加点利率）
              </label>
              {customRateEnabled && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="15"
                    value={customRate}
                    onChange={(e) => setCustomRate(Math.max(0, Number(e.target.value)))}
                    className="w-24 rounded-lg border border-[#6366F1] bg-[#0B0F19] px-2.5 py-1 text-right text-sm font-mono font-bold text-white focus:outline-none"
                  />
                  <span className="text-xs text-[#94A3B8]">%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-5 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">预计到期利息</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#F59E0B] font-mono">
              ¥{formatMoney(result.interest)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">
              按年利率 {result.rate}% 计算
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-5 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">到期本息合计</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#10B981] font-mono">
              ¥{formatMoney(result.totalAmount)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">本金 + 利息全额</p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-5 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">测算存期跨度</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#38BDF8] font-mono">
              {selectedItem.termMonths === 0 ? '活期 (按年化)' : `${selectedItem.termMonths} 个月`}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">
              折合 {result.durationYears} 年
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0B0F19]/80 p-6">
          <h3 className="font-semibold text-white text-sm sm:text-base mb-4">
            挂牌基准利率数据集参考对照表 (Deposit Rate Dataset)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead>
                <tr className="border-b border-[rgba(99,102,241,0.15)] text-[#64748B]">
                  <th className="py-2.5 px-3">存款类别</th>
                  <th className="py-2.5 px-3">期限</th>
                  <th className="py-2.5 px-3 text-right">参考年利率</th>
                  <th className="py-2.5 px-3 text-right">起存门槛</th>
                  <th className="py-2.5 px-3 text-right">本金测算收益</th>
                  <th className="py-2.5 px-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(99,102,241,0.06)] font-mono">
                {DEPOSIT_RATE_DATASET.map((item) => {
                  const itemRes = calculateDeposit(principal, item)
                  const isCurrent = item.id === selectedId
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#1E293B]/30 transition-colors ${
                        isCurrent ? 'bg-[#6366F1]/10 text-white' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-medium text-white">{item.name}</td>
                      <td className="py-3 px-3 text-[#94A3B8]">
                        {item.termMonths === 0 ? '随存随取' : `${item.termMonths} 个月`}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#10B981]">
                        {item.rate}%
                      </td>
                      <td className="py-3 px-3 text-right text-[#94A3B8]">
                        ¥{item.minAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-[#F59E0B]">
                        {itemRes.isEligible ? `¥${formatMoney(itemRes.interest)}` : '门槛不足'}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className={`rounded px-2.5 py-1 text-xs font-sans transition-colors ${
                            isCurrent
                              ? 'bg-[#6366F1] text-white'
                              : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          {isCurrent ? '当前选中' : '选择测算'}
                        </button>
                      </td>
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
