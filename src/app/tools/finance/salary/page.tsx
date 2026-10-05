'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {
  calculateSalary,
  SpecialAdditionalDeductions,
} from '@/lib/finance/salary'
import { Wallet, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react'

export default function SalaryPage() {
  const [grossMonthly, setGrossMonthly] = useState<number>(15000)
  const [housingFundRate, setHousingFundRate] = useState<number>(7)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const [showSchedule, setShowSchedule] = useState<boolean>(false)

  // Special additional deductions
  const [specialDeductions, setSpecialDeductions] = useState<SpecialAdditionalDeductions>({
    childrenEducation: 0,
    infantCare: 0,
    elderlySupport: 0,
    housingLoanOrRent: 1500, // 常见租金或房贷
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
    '输入税前税前月薪金额（如 15,000 元）。',
    '调整公积金缴费比例（法定区间一般为 5% ~ 12%，企业通常匹配 7% 或 12%）。',
    '展开【专项附加扣除配置】，填入子女教育、赡养老人或租金扣除额度。',
    '查看平均税后到手、年度税金支出、五险一金扣除，及 12 个月累计预扣税款明细表。',
  ]

  return (
    <ToolLayout
      toolSlug="salary"
      principlesTitle="中国居民综合所得个税与累计预扣法原理"
      principles={
        <>
          <p>
            <strong>1. 累计预扣法计算公式：</strong>
            <br />
            本期应预扣预缴税额 = （累计收入 - 累计免税收入 - 累计减除费用 - 累计专项扣除 - 累计专项附加扣除）\(\times\) 预扣率 - 速算扣除数 - 累计已预扣预缴税额。
          </p>
          <p>
            <strong>2. 扣除项目说明：</strong>
            基本减除费用按 5,000 元/月（全年 60,000 元）扣除；专项扣除包括个人承担的基本养老保险（8%）、基本医疗保险（2%）、失业保险（0.5%）及住房公积金（5%~12%）。
          </p>
          <p>
            <strong>3. 透明估算假设：</strong>以现行个税法为基准，默认社保公积金基数上限参考主流一二线城市社平标准（约35,283元），下限约6,500元。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer="本工具为【中国居民工资税后估算器】，按国家现行统一综合所得七级累进预扣法测算。因各地区社保公积金缴费基数上下限及补充公积金政策存在地域差异，测算结果供个人财务规划参考，实际工资条以用人单位财务及主管税务机关正式核定为准。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[#0B0F19]/80 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(99,102,241,0.1)] pb-4 mb-6 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
              计算依据：{result.assumptions.taxLawVersion}
            </span>
            <span className="rounded-full bg-[#1E293B] px-3 py-1 font-mono text-[#CBD5E1]">
              法定免征额基准：¥{result.assumptions.standardDeductionPerMonth}/月
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                税前月薪（元）
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={grossMonthly}
                onChange={(e) => setGrossMonthly(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-2xl font-bold font-mono text-white focus:border-[#6366F1] focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-[#64748B]">
                年度税前总额：¥{formatMoney(result.grossAnnual)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                个人住房公积金比例
              </label>
              <select
                aria-label="住房公积金比例"
                value={housingFundRate}
                onChange={(e) => setHousingFundRate(Number(e.target.value))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-white font-medium focus:border-[#6366F1] focus:outline-none"
              >
                {[5, 6, 7, 8, 10, 12].map((r) => (
                  <option key={r} value={r}>
                    {r}% 公积金（常规配置）
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-[#64748B]">
                社保默认：养老 8% + 医疗 2% + 失业 0.5%（合计 10.5%）
              </p>
            </div>
          </div>

          {/* Special Additional Deductions Collapsible */}
          <div className="rounded-xl border border-[rgba(99,102,241,0.15)] bg-[#070A12]/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-between p-4 text-xs sm:text-sm font-semibold text-[#CBD5E1] hover:bg-[#111827] transition-colors"
            >
              <span>
                专项附加扣除配置（当前每月已抵扣：¥
                {result.monthlySchedule[0]?.specialAdditional.toLocaleString()} 元）
              </span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showAdvanced && (
              <div className="p-4 border-t border-[rgba(99,102,241,0.1)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#94A3B8] mb-1">
                    子女教育（2000元/月/孩）
                  </label>
                  <select
                    value={specialDeductions.childrenEducation}
                    onChange={(e) =>
                      setSpecialDeductions({
                        ...specialDeductions,
                        childrenEducation: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(99,102,241,0.18)] bg-[#0B0F19] px-3 py-2 text-white"
                  >
                    <option value={0}>无</option>
                    <option value={1000}>1个孩子（父母各扣50%：1000元/月）</option>
                    <option value={2000}>1个孩子（全额扣除：2000元/月）</option>
                    <option value={4000}>2个孩子（全额扣除：4000元/月）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">
                    3岁以下婴幼儿照护（2000元/月/孩）
                  </label>
                  <select
                    value={specialDeductions.infantCare}
                    onChange={(e) =>
                      setSpecialDeductions({
                        ...specialDeductions,
                        infantCare: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(99,102,241,0.18)] bg-[#0B0F19] px-3 py-2 text-white"
                  >
                    <option value={0}>无</option>
                    <option value={1000}>1孩（父母各扣50%：1000元/月）</option>
                    <option value={2000}>1孩（全额扣除：2000元/月）</option>
                    <option value={4000}>2孩（全额扣除：4000元/月）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">
                    赡养老人（独生3000元/月）
                  </label>
                  <select
                    value={specialDeductions.elderlySupport}
                    onChange={(e) =>
                      setSpecialDeductions({
                        ...specialDeductions,
                        elderlySupport: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(99,102,241,0.18)] bg-[#0B0F19] px-3 py-2 text-white"
                  >
                    <option value={0}>无</option>
                    <option value={1000}>非独生子女分摊（1000元/月）</option>
                    <option value={1500}>非独生子女分摊（1500元/月）</option>
                    <option value={3000}>独生子女扣除（3000元/月）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">
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
                    className="w-full rounded-lg border border-[rgba(99,102,241,0.18)] bg-[#0B0F19] px-3 py-2 text-white"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-5 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">平均税后月到手</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#10B981] font-mono">
              ¥{formatMoney(result.averageMonthlyNet)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">全年税后 ¥{formatMoney(result.annualNetSalary)}</p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-5 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">全年应缴个税</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#EF4444] font-mono">
              ¥{formatMoney(result.annualTax)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">月均个税 ¥{formatMoney(result.averageMonthlyTax)}</p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-5 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">年度五险个人缴纳</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#38BDF8] font-mono">
              ¥{formatMoney(result.annualInsurance)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">养老 + 医疗 + 失业</p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-5 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">年度公积金个人缴纳</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#F59E0B] font-mono">
              ¥{formatMoney(result.annualHousingFund)}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">计入个人公积金账户</p>
          </div>
        </div>

        {/* 12-Month Schedule Table */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0B0F19]/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#6366F1]" />
              <h3 className="font-semibold text-white text-sm sm:text-base">
                1-12月累计预扣法逐月税后收入明细表
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="text-xs text-[#6366F1] hover:text-[#818CF8]"
            >
              {showSchedule ? '收起明细表' : '展开12个月明细'}
            </button>
          </div>

          {showSchedule && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[rgba(99,102,241,0.15)] text-[#64748B]">
                    <th className="py-2.5 px-3">月份</th>
                    <th className="py-2.5 px-3 text-right">税前收入</th>
                    <th className="py-2.5 px-3 text-right">五险一金</th>
                    <th className="py-2.5 px-3 text-right">专项附加扣除</th>
                    <th className="py-2.5 px-3 text-right">累计应纳税所得</th>
                    <th className="py-2.5 px-3 text-right">当月个税</th>
                    <th className="py-2.5 px-3 text-right">税后到手收入</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(99,102,241,0.06)] font-mono">
                  {result.monthlySchedule.map((row) => (
                    <tr key={row.month} className="hover:bg-[#1E293B]/30 transition-colors">
                      <td className="py-2.5 px-3 text-[#94A3B8]">第 {row.month} 月</td>
                      <td className="py-2.5 px-3 text-right text-white">¥{formatMoney(row.gross)}</td>
                      <td className="py-2.5 px-3 text-right text-[#38BDF8]">
                        -¥{formatMoney(row.totalInsuranceFund)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#A78BFA]">
                        -¥{formatMoney(row.specialAdditional)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#94A3B8]">
                        ¥{formatMoney(row.cumulativeTaxableIncome)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#EF4444] font-bold">
                        -¥{formatMoney(row.taxThisMonth)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#10B981] font-bold">
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
