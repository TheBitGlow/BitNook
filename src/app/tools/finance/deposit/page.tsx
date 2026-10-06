'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {
  DEPOSIT_RATE_DATASET,
  calculateDeposit,
} from '@/lib/finance/deposit'
import { Calendar, AlertTriangle } from 'lucide-react'

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
        <div className="card p-6 sm:p-8 space-y-6">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-accent-primary" />
              数据来源：{selectedItem.source}
            </span>
            <span className="rounded-full bg-surface-elevated border border-border px-3 py-1 font-mono text-text-secondary">
              基准版本：{selectedItem.effectiveDate}（更新于 {selectedItem.updatedAt}）
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                存款本金（元）
              </label>
              <input
                type="number"
                min="1"
                step="1000"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-2xl font-bold font-mono text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
              />
              <p className="mt-1 text-[11px] text-text-muted">
                折合 {(principal / 10000).toFixed(2)} 万元
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                存款品种选择
              </label>
              <select
                aria-label="选择存款品种"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-text-primary font-medium focus:border-accent-primary focus:outline-none transition-colors text-sm"
              >
                {DEPOSIT_RATE_DATASET.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}（基准 {item.rate}%，起存 ¥{item.minAmount.toLocaleString()}）
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-text-muted">{selectedItem.note}</p>
            </div>
          </div>

          {/* Min Amount warning if not eligible */}
          {!result.isEligible && (
            <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3.5 text-xs text-danger">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                注意：当前所选品种【{selectedItem.name}】起存门槛为 ¥{selectedItem.minAmount.toLocaleString()} 元，您当前输入的本金低于起存要求。
              </span>
            </div>
          )}

          {/* Custom Rate Toggle */}
          <div className="rounded-xl border border-border bg-surface-elevated p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-text-secondary">
                <input
                  type="checkbox"
                  checked={customRateEnabled}
                  onChange={(e) => setCustomRateEnabled(e.target.checked)}
                  className="rounded border-border text-accent-primary focus:ring-0"
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
                    className="w-24 rounded-lg border border-accent-primary bg-canvas px-2.5 py-1 text-right text-sm font-mono font-bold text-text-primary focus:outline-none"
                  />
                  <span className="text-xs text-text-muted">%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 text-center">
            <p className="text-xs text-text-muted mb-1">预计到期利息</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              ¥{formatMoney(result.interest)}
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              按年利率 {result.rate}% 计算
            </p>
          </div>

          <div className="card p-5 text-center">
            <p className="text-xs text-text-muted mb-1">到期本息合计</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ¥{formatMoney(result.totalAmount)}
            </p>
            <p className="text-[11px] text-text-muted mt-1">本金 + 利息全额</p>
          </div>

          <div className="card p-5 text-center">
            <p className="text-xs text-text-muted mb-1">测算存期跨度</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {selectedItem.termMonths === 0 ? '活期 (按年化)' : `${selectedItem.termMonths} 个月`}
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              折合 {result.durationYears} 年
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="card p-6">
          <h3 className="font-semibold text-text-primary text-sm sm:text-base mb-4">
            挂牌基准利率数据集参考对照表 (Deposit Rate Dataset)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="py-2.5 px-3">存款类别</th>
                  <th className="py-2.5 px-3">期限</th>
                  <th className="py-2.5 px-3 text-right">参考年利率</th>
                  <th className="py-2.5 px-3 text-right">起存门槛</th>
                  <th className="py-2.5 px-3 text-right">本金测算收益</th>
                  <th className="py-2.5 px-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {DEPOSIT_RATE_DATASET.map((item) => {
                  const itemRes = calculateDeposit(principal, item)
                  const isCurrent = item.id === selectedId
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-surface-elevated transition-colors ${
                        isCurrent ? 'bg-accent-primary/10 text-text-primary' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-medium text-text-primary">{item.name}</td>
                      <td className="py-3 px-3 text-text-muted">
                        {item.termMonths === 0 ? '随存随取' : `${item.termMonths} 个月`}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {item.rate}%
                      </td>
                      <td className="py-3 px-3 text-right text-text-muted">
                        ¥{item.minAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-600 dark:text-amber-400 font-semibold">
                        {itemRes.isEligible ? `¥${formatMoney(itemRes.interest)}` : '门槛不足'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className={`rounded px-2.5 py-1 text-xs font-sans transition-colors ${
                            isCurrent
                              ? 'bg-accent-primary text-white font-medium'
                              : 'bg-surface-elevated border border-border text-text-secondary hover:text-text-primary hover:border-accent-primary/40'
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
