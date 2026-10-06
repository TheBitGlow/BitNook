'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {
  calculateMortgage,
  PaymentMethod,
  MortgageInputMode,
  MORTGAGE_POLICY_PRESETS,
} from '@/lib/finance/mortgage'
import { Calculator, FileSpreadsheet, Percent, Copy, Check, Share2, AlertTriangle, ShieldCheck, PieChart, Sparkles, ArrowRight } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export default function MortgagePage() {
  const [inputMode, setInputMode] = useState<MortgageInputMode>('house-price')
  const [housePrice, setHousePrice] = useState<number>(2000000)
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20)
  const [directLoanAmount, setDirectLoanAmount] = useState<number>(1600000)
  const [years, setYears] = useState<number>(30)
  const [annualRate, setAnnualRate] = useState<number>(3.15)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('equal-payment')
  const [showAllSchedule, setShowAllSchedule] = useState<boolean>(false)
  const [copied, setCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareParamCopied, setShareParamCopied] = useState(false)
  const [shareCleanCopied, setShareCleanCopied] = useState(false)

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

  // Current calculation result
  const result = useMemo(() => {
    return calculateMortgage({
      loanAmount: effectiveLoanAmount,
      downPayment: effectiveDownPayment,
      annualRate,
      years,
      paymentMethod,
    })
  }, [effectiveLoanAmount, effectiveDownPayment, annualRate, years, paymentMethod])

  // Alternate calculation result for side-by-side comparison
  const altResult = useMemo(() => {
    return calculateMortgage({
      loanAmount: effectiveLoanAmount,
      downPayment: effectiveDownPayment,
      annualRate,
      years,
      paymentMethod: paymentMethod === 'equal-payment' ? 'equal-principal' : 'equal-payment',
    })
  }, [effectiveLoanAmount, effectiveDownPayment, annualRate, years, paymentMethod])

  const formatMoney = (n: number) =>
    n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const displaySchedule = showAllSchedule ? result.schedule : result.schedule.slice(0, 12)

  // Ratios for visualization
  const totalPay = result.totalPayment || 1
  const principalPct = Math.round((result.loanAmount / totalPay) * 1000) / 10
  const interestPct = Math.round((result.totalInterest / totalPay) * 1000) / 10

  const copyMortgageSummary = () => {
    const text = `【BitNook 房贷月供测算报告】\n贷款本金: ¥${formatMoney(result.loanAmount)} (${(result.loanAmount / 10000).toFixed(1)} 万元)\n贷款年限: ${years} 年 (${years * 12} 期)\n执行年利率: ${annualRate}%\n还款方式: ${paymentMethod === 'equal-payment' ? '等额本息' : '等额本金'}\n${paymentMethod === 'equal-payment' ? '每月还款额' : '首月还款额'}: ¥${formatMoney(result.firstMonthPayment)}\n累计支付利息: ¥${formatMoney(result.totalInterest)} (${(result.totalInterest / 10000).toFixed(1)} 万元)\n本息累计总额: ¥${formatMoney(result.totalPayment)} (${(result.totalPayment / 10000).toFixed(1)} 万元)\n数据来源: BitNook 在线房贷计算器 (https://bitnook.marmalade-thistle.workers.dev/tools/finance/mortgage)`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      trackEvent('copy', { toolSlug: 'mortgage' })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Safe Clean Share (Canonical URL, 0 PII)
  const copyCleanShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bitnook.marmalade-thistle.workers.dev'
    const cleanUrl = `${origin}/tools/finance/mortgage`
    navigator.clipboard.writeText(cleanUrl).then(() => {
      setShareCleanCopied(true)
      trackEvent('copy', { toolSlug: 'mortgage' })
      setTimeout(() => setShareCleanCopied(false), 2000)
    })
  }

  // Parameterized Share (Requires explicit user confirmation)
  const copyParamShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bitnook.marmalade-thistle.workers.dev'
    const query = new URLSearchParams({
      amount: String(effectiveLoanAmount),
      rate: String(annualRate),
      years: String(years),
      method: paymentMethod,
    }).toString()
    const paramUrl = `${origin}/tools/finance/mortgage?${query}`
    navigator.clipboard.writeText(paramUrl).then(() => {
      setShareParamCopied(true)
      trackEvent('copy', { toolSlug: 'mortgage' })
      setTimeout(() => setShareParamCopied(false), 2000)
    })
  }

  const faq = [
    {
      question: '等额本息和等额本金有什么核心区别？',
      answer:
        '等额本息每月还款金额固定，前期还款中利息占比较大，本金占比较小，适合收入稳定但前期预算有限的购房者；等额本金每月归还的本金固定，利息随剩余本金逐月递减，因此首月还款最多，随后逐月减少，虽然总利息支出低于等额本息，但前期还款压力显著偏大。',
    },
    {
      question: '当前商业贷款与公积金贷款利率基准是什么？',
      answer:
        '商业贷款利率以中国人民银行授权全国银行间同业拆借中心公布的 5 年期以上 LPR 为定价基准并由各城市加减基点确定；公积金贷款利率由住建部与央行统一规定，首套与二套利率基准分别为 2.85% 与 3.325%（采样基准）。',
    },
    {
      question: '提前还款应该选择缩短年限还是减少月供？',
      answer:
        '若希望节省最大化的利息支出，选择“月供不变、缩短还款年限”节省的利息通常多于“年限不变、减少月供”；若当前现金流偏紧、希望降低每月刚性支出压力，则可选择“年限不变、减少月供”。',
    },
    {
      question: '房贷月供如何进行现金流压力测试？',
      answer:
        '理财规划建议：家庭月供支出总额不宜超过家庭税后可支配月收入的 35%~50%。若月供占比超过 50%，在遇到收入波动或应急支出时可能产生流动性风险。',
    },
  ]

  const howToSteps = [
    '选择测算模式（按房屋总价及首付比例，或直接输入商业/公积金贷款总额）。',
    '选择或微调贷款年限与执行年利率（可使用顶部央行 LPR 快速预设）。',
    '切换对比“等额本息”与“等额本金”两类主流还款方式的总利息与首月月供。',
    '查看本息结构图与决策建议，点击“复制测算报告”保存或展开逐月还款计划表。',
  ]

  const exampleContent = (
    <div className="space-y-3">
      <div className="p-3.5 rounded-lg bg-surface-secondary/70 border border-border/80">
        <h4 className="font-semibold text-text-primary text-xs sm:text-sm mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>真实购房测算案例：首套 200 万元商品住宅商贷</span>
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          假设在重点城市购置一套总价 <strong>200 万元</strong> 的首套房，首付 <strong>20%（40 万元）</strong>，申请商业住房贷款 <strong>160 万元</strong>，期限 <strong>30 年（360 期）</strong>，按当前市场参考利率 <strong>3.15%</strong> 对比两类还款方式：
        </p>
        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-md bg-surface border border-border/70">
            <p className="font-semibold text-text-primary mb-1">等额本息方案</p>
            <p className="text-text-muted">每月还款：<span className="text-text-primary font-semibold tabular-nums">¥6,875.79</span></p>
            <p className="text-text-muted">累计利息：<span className="text-warning font-semibold tabular-nums">¥87.53 万元</span></p>
            <p className="text-text-muted">本息总计：<span className="text-success font-semibold tabular-nums">¥247.53 万元</span></p>
          </div>
          <div className="p-2.5 rounded-md bg-surface border border-border/70">
            <p className="font-semibold text-text-primary mb-1">等额本金方案</p>
            <p className="text-text-muted">首月还款：<span className="text-text-primary font-semibold tabular-nums">¥8,644.44</span> (月减¥11.67)</p>
            <p className="text-text-muted">累计利息：<span className="text-warning font-semibold tabular-nums">¥75.81 万元</span></p>
            <p className="text-text-muted">本息总计：<span className="text-success font-semibold tabular-nums">¥235.81 万元</span></p>
          </div>
        </div>
        <p className="mt-2.5 text-[11px] text-text-muted leading-relaxed">
          💡 <strong>决策建议</strong>：等额本金比等额本息累计少付利息 <strong>¥117,184.40（约 11.7 万元）</strong>，但首月还款需要多出 <strong>¥1,768.65</strong>。若购房者前期收入较高且追求省息，可优选等额本金；若希望各期支出固定可控，等额本息更具预算友好性。
        </p>
      </div>
    </div>
  )

  return (
    <ToolLayout
      toolSlug="mortgage"
      principlesTitle="房贷核心金融算法公式与定价机制"
      principles={
        <>
          <p>
            <strong>1. 等额本息月供公式：</strong>
            <br />
            每月还款额 = [贷款本金 × 月利率 × (1 + 月利率)^还款月数] ÷ [(1 + 月利率)^还款月数 - 1]
          </p>
          <p>
            <strong>2. 等额本金月供公式：</strong>
            <br />
            每月还款额 = (贷款本金 ÷ 还款月数) + (贷款本金 - 已归还本金累计额) × 月利率
          </p>
          <p>
            <strong>3. 定价基准机制（LPR）：</strong>
            <br />
            中国商业性个人住房贷款全面挂钩贷款市场报价利率（LPR）。月供实际利息按日计息、按月结清。
          </p>
        </>
      }
      howToSteps={howToSteps}
      example={exampleContent}
      faq={faq}
      dataSources={[
        {
          name: '中国人民银行 / 全国银行间同业拆借中心 (LPR)',
          description: '最新全国 5 年期以上贷款市场报价利率及各地区加减点基准',
        },
        {
          name: '住房和城乡建设部公积金利率标准',
          description: '5 年期以上首套及二套个人住房公积金贷款基准利率',
        },
      ]}
      disclaimer="【金融免责声明】本工具测算结果依据标准金融数学模型计算，实际房贷合同还款月供、首次结息日、贷款发放日及各地银行具体利率浮动方案以商业银行最终审批与借款合同签约为准。"
    >
      <div className="space-y-6">
        {/* Policy Presets Pill Bar (Hairline strip) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-border/70">
          <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
            <Percent className="w-3.5 h-3.5 text-accent" />
            <span>基准利率快速预设:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {MORTGAGE_POLICY_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setAnnualRate(preset.commercialRate)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                  annualRate === preset.commercialRate
                    ? 'bg-accent text-white font-semibold shadow-subtle'
                    : 'bg-surface-secondary hover:bg-surface border border-border/80 text-text-secondary hover:text-text-primary'
                }`}
              >
                {preset.name} ({preset.commercialRate}%)
              </button>
            ))}
          </div>
        </div>

        {/* Input Parameters Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">
              1. 贷款基础参数配置
            </span>

            <div className="flex items-center gap-1 p-0.5 rounded-md bg-surface-secondary border border-border/80">
              <button
                type="button"
                onClick={() => setInputMode('house-price')}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition cursor-pointer ${
                  inputMode === 'house-price'
                    ? 'bg-surface text-text-primary font-semibold shadow-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                按房屋总价
              </button>
              <button
                type="button"
                onClick={() => setInputMode('loan-amount')}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition cursor-pointer ${
                  inputMode === 'loan-amount'
                    ? 'bg-surface text-text-primary font-semibold shadow-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                直接输入贷款额
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputMode === 'house-price' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    房屋总价（元）
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="100000"
                    value={housePrice}
                    onChange={(e) => setHousePrice(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-md border border-border/80 bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono tabular-nums"
                  />
                  <p className="mt-1 text-[11px] text-text-muted font-mono">
                    约 {(housePrice / 10000).toFixed(1)} 万元
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    首付比例（%）
                  </label>
                  <select
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full rounded-md border border-border/80 bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {[15, 20, 25, 30, 35, 40, 50, 60, 70].map((pct) => (
                      <option key={pct} value={pct}>
                        {pct}% (首付约 {((housePrice * pct) / 100 / 10000).toFixed(1)} 万元)
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  贷款总金额（元）
                </label>
                <input
                  type="number"
                  step="10000"
                  min="10000"
                  value={directLoanAmount}
                  onChange={(e) => setDirectLoanAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-md border border-border/80 bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono tabular-nums"
                />
                <p className="mt-1 text-[11px] text-text-muted font-mono">
                  约 {(directLoanAmount / 10000).toFixed(1)} 万元
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                贷款年限（年）
              </label>
              <select
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full rounded-md border border-border/80 bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {[5, 10, 15, 20, 25, 30].map((y) => (
                  <option key={y} value={y}>
                    {y} 年 ({y * 12} 期)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                年利率（%）
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="25"
                value={annualRate}
                onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-md border border-border/80 bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono tabular-nums"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                还款方式
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('equal-payment')}
                  className={`flex flex-col items-start p-3 rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'equal-payment'
                      ? 'border-accent bg-accent-subtle/40 text-accent font-semibold'
                      : 'border-border/80 bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
                  }`}
                >
                  <span className="font-semibold text-xs sm:text-sm">等额本息</span>
                  <span className="text-[11px] opacity-75 mt-0.5">每月月供恒定 · 前期还款压力平稳</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('equal-principal')}
                  className={`flex flex-col items-start p-3 rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'equal-principal'
                      ? 'border-accent bg-accent-subtle/40 text-accent font-semibold'
                      : 'border-border/80 bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
                  }`}
                >
                  <span className="font-semibold text-xs sm:text-sm">等额本金</span>
                  <span className="text-[11px] opacity-75 mt-0.5">月供逐月递减 · 累计总利息更省</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== WORKBENCH OUTPUT: THE METRIC SHOWCASE ==================== */}
        <div className="pt-5 border-t border-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">
              2. 测算结论与核心指标
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyMortgageSummary}
                className="btn-secondary !py-1 !px-2.5 !text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制报告' : '复制结果'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="btn-primary !py-1 !px-2.5 !text-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>分享方案</span>
              </button>
            </div>
          </div>

          {/* Unified Architectural Output Frame (Zero nested card soup) */}
          <div className="p-5 sm:p-6 rounded-xl border border-border/90 bg-surface-secondary/40 space-y-5">
            {/* Main Hero Figure */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-border/70">
              <div>
                <span className="text-xs font-medium text-text-muted">
                  {paymentMethod === 'equal-payment' ? '每月固定月供' : '首月还款额'}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary font-mono tabular-nums">
                    ¥{formatMoney(result.firstMonthPayment)}
                  </span>
                  <span className="text-xs font-mono text-text-muted">/ 月</span>
                </div>
              </div>

              {paymentMethod === 'equal-principal' && (
                <div className="text-xs font-mono text-success">
                  <span>末月月供: ¥{formatMoney(result.lastMonthPayment)}</span>
                  <span className="text-text-muted ml-1.5">(每月递减约 ¥{result.monthlyDecrease})</span>
                </div>
              )}
            </div>

            {/* 3 Secondary Financial Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-0.5">贷款实际本金</p>
                <p className="text-xl font-semibold text-accent font-mono tabular-nums">
                  ¥{formatMoney(result.loanAmount)}
                </p>
                <p className="text-[11px] text-text-muted font-mono mt-0.5">
                  {(result.loanAmount / 10000).toFixed(1)} 万元
                </p>
              </div>

              <div>
                <p className="text-xs text-text-muted mb-0.5">累计支付利息</p>
                <p className="text-xl font-semibold text-warning font-mono tabular-nums">
                  ¥{formatMoney(result.totalInterest)}
                </p>
                <p className="text-[11px] text-warning/80 font-mono mt-0.5">
                  {(result.totalInterest / 10000).toFixed(1)} 万元
                </p>
              </div>

              <div>
                <p className="text-xs text-text-muted mb-0.5">累计还款总额 (本息)</p>
                <p className="text-xl font-semibold text-success font-mono tabular-nums">
                  ¥{formatMoney(result.totalPayment)}
                </p>
                <p className="text-[11px] text-text-muted font-mono mt-0.5">
                  本息合计 {(result.totalPayment / 10000).toFixed(1)} 万元
                </p>
              </div>
            </div>

            {/* Visual Ratio Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span>本息构成可视化</span>
                <span>利息/本金比: {((result.totalInterest / (result.loanAmount || 1)) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface border border-border/60 overflow-hidden flex">
                <div
                  style={{ width: `${principalPct}%` }}
                  className="h-full bg-accent transition-all duration-200"
                  title={`本金: ${principalPct}%`}
                />
                <div
                  style={{ width: `${interestPct}%` }}
                  className="h-full bg-warning transition-all duration-200"
                  title={`利息: ${interestPct}%`}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary font-mono pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                  <span>本金: ¥{(result.loanAmount / 10000).toFixed(1)} 万元 ({principalPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-warning inline-block" />
                  <span>利息: ¥{(result.totalInterest / 10000).toFixed(1)} 万元 ({interestPct}%)</span>
                </div>
              </div>
            </div>

            {/* Comparative Editorial Recommendation */}
            <div className="pt-2 text-xs text-text-secondary leading-relaxed border-t border-border/60">
              {paymentMethod === 'equal-principal' ? (
                <p>
                  💡 <strong>方案对比</strong>：与等额本息相比，等额本金累计可省利息{' '}
                  <span className="text-success font-semibold font-mono">
                    ¥{formatMoney(altResult.totalInterest - result.totalInterest)}
                  </span>{' '}
                  元（约 {((altResult.totalInterest - result.totalInterest) / 10000).toFixed(1)} 万元）。
                </p>
              ) : (
                <p>
                  💡 <strong>方案对比</strong>：等额本息首月月供比等额本金少{' '}
                  <span className="text-accent font-semibold font-mono">
                    ¥{formatMoney(altResult.firstMonthPayment - result.firstMonthPayment)}
                  </span>{' '}
                  元，购房初期流动性更平稳；若追求总利息最少，可切换为等额本金。
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Repayment Schedule Table */}
        <div className="pt-5 border-t border-border/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-text-primary text-xs sm:text-sm">
                还款计划明细 ({showAllSchedule ? `全部 ${result.schedule.length} 期` : '前 12 期预览'})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAllSchedule(!showAllSchedule)}
              className="text-xs text-accent hover:underline cursor-pointer"
            >
              {showAllSchedule ? '收起至前12个月' : `查看全部 ${result.schedule.length} 个月明细 →`}
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/80">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-surface-secondary/60 border-b border-border/70 text-text-muted">
                  <th className="py-2.5 px-3">期数</th>
                  <th className="py-2.5 px-3 text-right">月还款额</th>
                  <th className="py-2.5 px-3 text-right">偿还本金</th>
                  <th className="py-2.5 px-3 text-right">偿还利息</th>
                  <th className="py-2.5 px-3 text-right">剩余贷款本金</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono bg-surface">
                {displaySchedule.map((row) => (
                  <tr key={row.month} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-2 px-3 text-text-secondary">第 {row.month} 期</td>
                    <td className="py-2 px-3 text-right font-medium text-text-primary tabular-nums">
                      ¥{formatMoney(row.monthlyPayment)}
                    </td>
                    <td className="py-2 px-3 text-right text-success tabular-nums">
                      ¥{formatMoney(row.principal)}
                    </td>
                    <td className="py-2 px-3 text-right text-warning tabular-nums">
                      ¥{formatMoney(row.interest)}
                    </td>
                    <td className="py-2 px-3 text-right text-text-muted tabular-nums">
                      ¥{formatMoney(row.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safe Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in">
            <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-modal space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-accent" />
                  <span>专属分享链接</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="text-text-muted hover:text-text-primary text-xs px-2 py-1 rounded-md hover:bg-surface-secondary cursor-pointer"
                >
                  关闭
                </button>
              </div>

              {/* Option 1: Clean Canonical URL */}
              <div className="p-3.5 rounded-lg border border-border bg-surface-secondary/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-success" />
                    <span>方式一：分享干净工具链接 (推荐)</span>
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  仅分享房贷计算器网址，<strong>绝不包含</strong>您的任何个人房屋金额、贷款额与财务数字。
                </p>
                <button
                  type="button"
                  onClick={copyCleanShareLink}
                  className="w-full py-1.5 rounded-md bg-surface hover:bg-surface-hover border border-border text-xs font-medium text-text-primary flex items-center justify-center gap-1.5 transition cursor-pointer shadow-subtle"
                >
                  {shareCleanCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{shareCleanCopied ? '已复制标准工具链接' : '复制标准链接'}</span>
                </button>
              </div>

              {/* Option 2: Parameter URL with Explicit Consent Warning */}
              <div className="p-3.5 rounded-lg border border-warning/25 bg-warning-subtle space-y-2">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                  <span>方式二：生成带参数的专属测算链接</span>
                </span>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  ⚠️ <strong>隐私提醒</strong>：专属链接将包含当前输入的房屋金额与利率参数（本金 ¥{(result.loanAmount / 10000).toFixed(1)} 万元、利率 {annualRate}%、{years} 年）。任何收到链接的人均可查看这些数据。请确认后再行分享。
                </p>
                <button
                  type="button"
                  onClick={copyParamShareLink}
                  className="w-full py-1.5 rounded-md bg-surface hover:bg-surface-hover border border-warning/30 text-xs font-medium text-text-primary flex items-center justify-center gap-1.5 transition cursor-pointer shadow-subtle"
                >
                  {shareParamCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{shareParamCopied ? '已复制专属测算链接' : '确认并复制专属分享链接'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
