'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {
  REFERENCE_RATES_DATASET,
  convertCurrency,
} from '@/lib/finance/exchange'
import { ArrowRightLeft, Calendar, Copy, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export default function ExchangePage() {
  const [amount, setAmount] = useState<number>(100)
  const [fromCurrency, setFromCurrency] = useState<string>('USD')
  const [toCurrency, setToCurrency] = useState<string>('CNY')
  const [copied, setCopied] = useState(false)

  const { convertedAmount, rate } = convertCurrency(amount, fromCurrency, toCurrency)

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const fromInfo = REFERENCE_RATES_DATASET.rates.find((c) => c.code === fromCurrency)
  const toInfo = REFERENCE_RATES_DATASET.rates.find((c) => c.code === toCurrency)

  const formattedResult = convertedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

  const handleCopyResult = async () => {
    const text = `${amount} ${fromCurrency} = ${formattedResult} ${toCurrency} (参考汇率 1 ${fromCurrency} ≈ ${rate.toFixed(4)} ${toCurrency})`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      trackEvent('copy', { tool: 'exchange' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

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
            <strong>1. 中间价基准计算：</strong>货币兑换比率按人民币基准价进行交叉推算：Rate(A→B) = BaseRate(A) / BaseRate(B)。换算金额 Amount(B) = Amount(A) × Rate(A→B)。
          </p>
          <p>
            <strong>2. 参考汇率说明：</strong>不宣称实盘逐秒波动，本页面明确标注数据更新来源与日期，提供透明、真实无欺诈的参考换算工具。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      dataSources={[
        { name: REFERENCE_RATES_DATASET.source, description: `更新批次: ${REFERENCE_RATES_DATASET.updatedAt}` },
      ]}
      disclaimer="汇率数据来源于中国外汇交易中心基准价，仅供日常换算与出行预算参考，不构成实盘交易要约。商业银行柜面实际成交受现钞/现汇点差影响。"
    >
      <div className="space-y-6">
        {/* Converter Card */}
        <div className="card p-6 sm:p-8 space-y-6">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-accent-primary" />
              数据来源：{REFERENCE_RATES_DATASET.source}
            </span>
            <span className="rounded-full bg-surface-elevated border border-border px-3 py-1 font-mono text-text-secondary">
              更新批次：{REFERENCE_RATES_DATASET.updatedAt}
            </span>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              换算金额
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-2xl font-bold font-mono text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Currency Selectors & Swap Button */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                持有货币 (From)
              </label>
              <select
                aria-label="持有货币"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-text-primary font-medium focus:border-accent-primary focus:outline-none transition-colors text-sm"
              >
                {REFERENCE_RATES_DATASET.rates.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center pt-5 sm:pt-6">
              <button
                type="button"
                onClick={swapCurrencies}
                aria-label="交换货币"
                className="rounded-full border border-border bg-surface-elevated p-3 text-text-secondary hover:border-accent-primary hover:text-text-primary transition-all shadow-sm"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                目标货币 (To)
              </label>
              <select
                aria-label="目标货币"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-text-primary font-medium focus:border-accent-primary focus:outline-none transition-colors text-sm"
              >
                {REFERENCE_RATES_DATASET.rates.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Banner with Copy */}
          <div className="rounded-xl border border-border bg-surface-elevated p-6 text-center relative group">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={handleCopyResult}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface text-xs font-medium text-text-secondary hover:text-text-primary hover:border-accent-primary/50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success" />
                    <span className="text-success">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>复制</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mb-1">
              {fromInfo?.symbol} {amount.toLocaleString()} {fromCurrency} ({fromInfo?.name}) =
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight my-2">
              {toInfo?.symbol} {formattedResult} {toCurrency}
            </p>
            <p className="text-xs text-text-muted">
              参考基准比率：1 {fromCurrency} ≈ {rate.toFixed(4)} {toCurrency}
            </p>
          </div>
        </div>

        {/* Reference Rates Table */}
        <div className="card p-6">
          <h3 className="font-semibold text-text-primary text-sm sm:text-base mb-4">
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
                    className="flex flex-col justify-between rounded-xl border border-border bg-surface-elevated p-3.5 hover:border-accent-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-text-primary text-sm">
                        {c.code} · {c.name}
                      </span>
                      <span className="text-xs font-mono text-accent-primary font-medium">{c.symbol}</span>
                    </div>
                    <div className="text-xs font-mono text-text-secondary space-y-0.5">
                      <div>1 {c.code} = {oneForeignToCny.toFixed(4)} CNY</div>
                      <div className="text-text-muted">1 CNY = {oneCnyToForeign.toFixed(4)} {c.code}</div>
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
