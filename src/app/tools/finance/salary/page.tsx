'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {
  calculateSalary,
  SpecialAdditionalDeductions,
} from '@/lib/finance/salary'
import { ChevronDown, ChevronUp, FileSpreadsheet, Copy, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export default function SalaryPage() {
  const [grossMonthly, setGrossMonthly] = useState<number>(15000)
  const [housingFundRate, setHousingFundRate] = useState<number>(7)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const [showSchedule, setShowSchedule] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  // Special additional deductions
  const [specialDeductions, setSpecialDeductions] = useState<SpecialAdditionalDeductions>({
    childrenEducation: 0,
    infantCare: 0,
    elderlySupport: 0,
    housingLoanOrRent: 1500, // 常见主要城市租金
    continuingEducation: 0,
  })

  const result = useMemo(() => {
    return calculateSalary({
      grossMonthly,
      housingFundRate,
      specialDeductions,
    })
  }, [grossMonthly, housingFundRate, specialDeductions])

  const formatMoney = (n: number) =>
    n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const copySalarySummary = () => {
    const text = `【税后到手工资估算结果（BitNook）】\n税前月薪: ¥${formatMoney(grossMonthly)}\n公积金费率: ${housingFundRate}%\n平均税后月到手: ¥${formatMoney(result.averageMonthlyNet)}\n全年实际到手收入: ¥${formatMoney(result.annualNetSalary)}\n全年应缴个人所得税: ¥${formatMoney(result.annualTax)}\n年度个人社保总额: ¥${formatMoney(result.annualInsurance)}\n年度个人公积金储存: ¥${formatMoney(result.annualHousingFund)}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      trackEvent('copy', { toolSlug: 'salary' })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const faq = [
    {
      question: '为什么不同月份的个税扣除额会逐渐增加（前低后高）？',
      answer:
        '现行《个人所得税法》对工资薪金所得采用【累计预扣法】。在年初（1~3月），年度累计应纳税所得额较低，适用 3% 最低档税率；随着下半年收入累积，累计应纳税额跨过 3.6 万、14.4 万元等分界点，税率跳档至 10%、20%，因此下半年扣税额会多于上半年，这是法定累进计税规则的正常现象。',
    },
    {
      question: '专项附加扣除标准有哪些？',
      answer:
        '现行标准主要包括：3岁以下婴幼儿照护（2000元/月/孩）、子女教育（2000元/月/孩）、赡养老人（独生子女3000元/月）、住房贷款利息（1000元/月）或住房租金（主要城市1500元/月）、继续教育（学历教育400元/月）。',
    },
    {
      question: '本工具是否等同于全国所有城市的精确工资条？',
      answer:
        '本工具为【中国居民工资税后估算器】。全国个税税率与专项附加扣除标准统一，但各城市社保与公积金缴费基数上下限（通常为当地上年度社平工资的 60% 至 300%）存在地域差异。本估算器基于主流城市中位数参数测算，供方案参考。',
    },
  ]

  const howToSteps = [
    '输入税前月薪金额（如 15,000 元）。',
    '调整公积金缴费比例（法定区间一般为 5% ~ 12%，企业通常匹配 7% 或 12%）。',
    '展开【专项附加扣除配置】，填入子女教育、赡养老人或租金扣除额度。',
    '查看平均税后到手、年度税金支出、五险一金扣除，及 12 个月累计预扣税款明细表。',
  ]

  return (
    <ToolLayout
      toolSlug="salary"
      principlesTitle="个税累计预扣法与五险一金代扣计算依据"
      principles={
        <>
          <p>
            <strong>1. 累计预扣法计税公式：</strong>
            <br />
            本期应预扣预缴税额 = (累计收入 - 累计免税收入 - 累计减除费用 - 累计专项扣除 - 累计专项附加扣除) × 预扣率 - 速算扣除数 - 累计已预扣预缴税额
          </p>
          <p>
            <strong>2. 五险一金法定个人代扣基准比例：</strong>
            <br />
            养老保险 8% + 医疗保险 2% (+大病等) + 失业保险 0.5% + 住房公积金 (5% ~ 12%)。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      dataSources={[
        {
          name: '计算方法 (Calculation Method)',
          description: '居民个人综合所得法定【累计预扣法】逐月递进扣缴模型',
        },
        {
          name: '法规政策依据 (Policy Basis)',
          description: '《中华人民共和国个人所得税法》及现行专项附加扣除暂行办法（含照护/教育2000元、老人3000元新规）',
        },
        {
          name: '基准数据性质 (Reference Dataset)',
          description: '社保公积金基数（参考下限 6,500 元、上限 35,283 元）为主流一线城市参考标准，非2026年全国统一定值',
        },
        {
          name: '时效状态 (Updated At)',
          description: '2026-03 校验现行税法及扣除标准有效',
        },
      ]}
      disclaimer="【薪资估算声明】本工具为【中国居民工资税后估算器】。全国个税税率与专项附加扣除标准法定统一，但各地社保公积金缴费基数上限与下限依当地上年度社会平均工资核定。实际到手薪资以用人单位发放工资条与个人所得税 App 年度汇算清缴为准。"
    >
      <div className="space-y-6">
        {/* Input Form Panel */}
        <div className="card p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                税前月薪（元）
              </label>
              <input
                type="number"
                step="500"
                min="1000"
                value={grossMonthly}
                onChange={(e) => setGrossMonthly(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-text-primary font-mono text-base focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                个人公积金缴纳比例（%）
              </label>
              <select
                value={housingFundRate}
                onChange={(e) => setHousingFundRate(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-text-primary focus:border-accent-primary focus:outline-none transition-colors text-sm"
              >
                {[5, 6, 7, 8, 9, 10, 11, 12].map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}% {rate === 7 ? '(常规推荐)' : rate === 12 ? '(最高上限)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Special Additional Deductions Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-accent-primary hover:underline flex items-center gap-1 font-semibold transition"
            >
              <span>{showAdvanced ? '收起个税专项附加扣除配置' : '配置个税专项附加扣除（子女、租金、赡养等）'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-xl border border-border bg-canvas grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-text-muted mb-1">
                    3岁以下婴幼儿照护
                  </label>
                  <select
                    value={specialDeductions.infantCare}
                    onChange={(e) =>
                      setSpecialDeductions({
                        ...specialDeductions,
                        infantCare: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary"
                  >
                    <option value={0}>无</option>
                    <option value={1000}>1个孩子（父母各扣1000元）</option>
                    <option value={2000}>1个孩子（单人全扣2000元）</option>
                    <option value={4000}>2个孩子（单人全扣4000元）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-text-muted mb-1">子女教育扣除</label>
                  <select
                    value={specialDeductions.childrenEducation}
                    onChange={(e) =>
                      setSpecialDeductions({
                        ...specialDeductions,
                        childrenEducation: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary"
                  >
                    <option value={0}>无</option>
                    <option value={1000}>1个子女（父母各扣1000元）</option>
                    <option value={2000}>1个子女（单人全扣2000元）</option>
                    <option value={4000}>2个子女（单人全扣4000元）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-text-muted mb-1">赡养老人扣除</label>
                  <select
                    value={specialDeductions.elderlySupport}
                    onChange={(e) =>
                      setSpecialDeductions({
                        ...specialDeductions,
                        elderlySupport: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary"
                  >
                    <option value={0}>无</option>
                    <option value={1500}>非独生子女约定分摊（1500元/月）</option>
                    <option value={3000}>独生子女扣除（3000元/月）</option>
                  </select>
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-[11px] text-text-muted mb-1">
                    住房贷款利息 / 住房租金
                  </label>
                  <select
                    value={specialDeductions.housingLoanOrRent}
                    onChange={(e) =>
                      setSpecialDeductions({
                        ...specialDeductions,
                        housingLoanOrRent: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary"
                  >
                    <option value={0}>无</option>
                    <option value={1000}>首套房贷利息（1000元/月）</option>
                    <option value={1100}>中等城市租金（1100元/月）</option>
                    <option value={1500}>主要城市租金（1500元/月）</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="card p-4 text-center">
            <p className="text-xs text-text-muted mb-1">平均税后月到手</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              ¥{formatMoney(result.averageMonthlyNet)}
            </p>
            <p className="text-[10px] text-text-muted mt-1">全年税后 ¥{formatMoney(result.annualNetSalary)}</p>
          </div>

          <div className="card p-4 text-center">
            <p className="text-xs text-text-muted mb-1">全年应缴个税</p>
            <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              ¥{formatMoney(result.annualTax)}
            </p>
            <p className="text-[10px] text-text-muted mt-1">月均个税 ¥{formatMoney(result.averageMonthlyTax)}</p>
          </div>

          <div className="card p-4 text-center">
            <p className="text-xs text-text-muted mb-1">年度五险个人代扣</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
              ¥{formatMoney(result.annualInsurance)}
            </p>
            <p className="text-[10px] text-text-muted mt-1">养老 + 医疗 + 失业</p>
          </div>

          <div className="card p-4 text-center">
            <p className="text-xs text-text-muted mb-1">年度公积金个人代扣</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              ¥{formatMoney(result.annualHousingFund)}
            </p>
            <p className="text-[10px] text-text-muted mt-1">计入个人公积金账户</p>
          </div>
        </div>

        {/* Copy Result Bar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={copySalarySummary}
            className="btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制估算报告' : '复制估算结果'}</span>
          </button>
        </div>

        {/* 12-Month Schedule Table */}
        <div className="card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-accent-primary" />
              <h3 className="font-semibold text-text-primary text-xs sm:text-sm">
                1-12月累计预扣法逐月税后收入明细表
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="text-xs text-accent-primary hover:underline transition"
            >
              {showSchedule ? '收起明细表' : '展开12个月明细'}
            </button>
          </div>

          {showSchedule && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="py-2.5 px-3">月份</th>
                    <th className="py-2.5 px-3 text-right">税前收入</th>
                    <th className="py-2.5 px-3 text-right">五险一金</th>
                    <th className="py-2.5 px-3 text-right">专项附加扣除</th>
                    <th className="py-2.5 px-3 text-right">累计应纳税所得</th>
                    <th className="py-2.5 px-3 text-right">当月个税</th>
                    <th className="py-2.5 px-3 text-right">税后到手收入</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-mono">
                  {result.monthlySchedule.map((row) => (
                    <tr key={row.month} className="hover:bg-surface-elevated transition-colors">
                      <td className="py-2.5 px-3 text-text-muted">第 {row.month} 月</td>
                      <td className="py-2.5 px-3 text-right text-text-primary tabular-nums">¥{formatMoney(row.gross)}</td>
                      <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400 tabular-nums">
                        -¥{formatMoney(row.totalInsuranceFund)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-text-muted tabular-nums">
                        -¥{formatMoney(row.specialAdditional)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-text-muted tabular-nums">
                        ¥{formatMoney(row.cumulativeTaxableIncome)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-bold tabular-nums">
                        -¥{formatMoney(row.taxThisMonth)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                        ¥{formatMoney(row.netSalary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
