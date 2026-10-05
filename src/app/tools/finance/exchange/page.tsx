'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {
  REFERENCE_RATES_DATASET,
  convertCurrency,
} from '@/lib/finance/exchange'
import { ArrowRightLeft, DollarSign, RefreshCw, Calendar, ShieldAlert } from 'lucide-react'

export default function ExchangePage() {
  const [amount, setAmount] = useState<number>(100)
  const [fromCurrency, setFromCurrency] = useState<string>('USD')
  const [toCurrency, setToCurrency] = useState<string>('CNY')

  const { convertedAmount, rate } = convertCurrency(amount, fromCurrency, toCurrency)

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const fromInfo = REFERENCE_RATES_DATASET.rates.find(c => c.code === fromCurrency)
  const toInfo = REFERENCE_RATES_DATASET.rates.find(c => c.code === toCurrency)

  const faq = [
    {
      question: '为什么换算结果和手机银行现钞结汇价格有微小差异？',
      answer:
        '本工具基于中国人民银行及中国外汇交易中心公开的中间价/基准参考汇率换算。商业银行在实际办理业务时，会区分现汇买入价、现钞买入价、现汇卖出价和现钞卖出价，银行会在此基础上浮动少许点差作为手续费。',
    },
    {
      question: '日元或泰铢为什么标注（100单位）？',
      answer:
        '在国际外汇交易习惯中，部分单价较低的货币（如日元 JPY、韩元 KRW、泰铢 THB）通常以 100 单位为基准公布对人民币汇率，本工具已自动统一换算为单单位进行精确计算。',
    },
  ]

  const howToSteps = [
    '输入需要换算的金额数字。',
    '选择原始货币（如 USD 美元）与目标货币（如 CNY 人民币）。',
    '可点击中间对调按钮随时互换两种货币。',
    '下方实时显示转换结果、单价换算比率、数据来源及基准有效时间。',
  ]

  return (
    <ToolLayout
      toolSlug="exchange"
      principlesTitle="汇率计算原理与外汇参考说明"
      principles={
        <>
          <p>
            <strong>1. 中间价基准计算：</strong>货币兑换比率按人民币基准价进行交叉推算：{'Rate(A→B) = BaseRate(A) / BaseRate(B)'}。换算金额 {'Amount(B) = Amount(A) × Rate(A→B)'}。
          </p>
          <p>
            <strong>2. 参考汇率说明：</strong>停止宣称虚假的实时逐秒波动，本页面明确标注数据更新来源与日期，提供透明、真实无欺诈的参考换算工具。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
    >
      <div className="space-y-6">
        {/* Converter Card */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[#0B0F19]/80 p-6 sm:p-8 backdrop-blur-md">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(99,102,241,0.1)] pb-4 mb-6 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#10B981]" />
              数据来源：{REFERENCE_RATES_DATASET.source}
            </span>
            <span className="rounded-full bg-[#1E293B] px-3 py-1 font-mono text-[#CBD5E1]">
              更新批次：{REFERENCE_RATES_DATASET.updatedAt}
            </span>
          </div>

          {/* Amount input */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              换算金额
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-2xl font-bold font-mono text-white focus:border-[#6366F1] focus:outline-none"
            />
          </div>

          {/* Currency Selectors & Swap Button */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                持有货币 (From)
              </label>
              <select
                aria-label="持有货币"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-white font-medium focus:border-[#6366F1] focus:outline-none"
              >
                {REFERENCE_RATES_DATASET.rates.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center pt-5">
              <button
                type="button"
                onClick={swapCurrencies}
                aria-label="交换货币"
                className="rounded-full border border-[rgba(99,102,241,0.3)] bg-[#111827] p-3 text-[#94A3B8] hover:border-[#6366F1] hover:text-white hover:scale-105 transition-all shadow-md"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                目标货币 (To)
              </label>
              <select
                aria-label="目标货币"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-white font-medium focus:border-[#6366F1] focus:outline-none"
              >
                {REFERENCE_RATES_DATASET.rates.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Banner */}
          <div className="rounded-2xl border border-[rgba(16,185,129,0.2)] bg-gradient-to-r from-[#10B981]/10 via-[#0A0D16] to-[#0A0D16] p-6 text-center">
            <p className="text-xs sm:text-sm text-[#94A3B8] mb-1">
              {fromInfo?.symbol} {amount.toLocaleString()} {fromCurrency} ({fromInfo?.name}) =
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#10B981] font-mono tracking-tight my-2">
              {toInfo?.symbol} {convertedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCurrency}
            </p>
            <p className="text-xs text-[#64748B]">
              参考基准比率：1 {fromCurrency} ≈ {rate.toFixed(4)} {toCurrency}
            </p>
          </div>
        </div>

        {/* Reference Rates Table */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0B0F19]/80 p-6">
          <h3 className="font-semibold text-white text-sm sm:text-base mb-4">
            主流币种参考汇率对照表（以人民币 CNY 为基准）
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REFERENCE_RATES_DATASET.rates
              .filter((c) => c.code !== 'CNY')
              .map((c) => {
                const oneForeignToCny = c.cnyPerUnit
                const oneCnyToForeign = 1 / c.cnyPerUnit
                return (
                  <div
                    key={c.code}
                    className="flex flex-col justify-between rounded-xl border border-[rgba(99,102,241,0.08)] bg-[#070A12]/60 p-3.5 hover:border-[rgba(99,102,241,0.2)] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">
                        {c.code} · {c.name}
                      </span>
                      <span className="text-xs font-mono text-[#38BDF8]">{c.symbol}</span>
                    </div>
                    <div className="text-xs font-mono text-[#94A3B8] space-y-0.5">
                      <div>1 {c.code} = {oneForeignToCny.toFixed(4)} CNY</div>
                      <div className="text-[#64748B]">1 CNY = {oneCnyToForeign.toFixed(4)} {c.code}</div>
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
