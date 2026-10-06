'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Scale, Copy, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export default function BMIPage() {
  const [height, setHeight] = useState<number>(172)
  const [weight, setWeight] = useState<number>(66)
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    if (height <= 0 || weight <= 0) return null

    const hMeters = height / 100
    const bmiVal = Math.round((weight / (hMeters * hMeters)) * 10) / 10

    // Chinese standard (WS/T 428-2013)
    let category = '健康正常'
    let colorClass = 'text-emerald-600 dark:text-emerald-400'
    let bgClass = 'bg-emerald-500/10 border-emerald-500/30'
    let advice = '处于适宜体质指数范围，患心血管与代谢疾病的相对风险处于最低基线。'

    if (bmiVal < 18.5) {
      category = '偏瘦 (体重过低)'
      colorClass = 'text-blue-600 dark:text-blue-400'
      bgClass = 'bg-blue-500/10 border-blue-500/30'
      advice = '体重低于标准范围，建议适当增加优质蛋白质与能量摄入，排除消化吸收等健康问题。'
    } else if (bmiVal < 24.0) {
      category = '健康正常'
      colorClass = 'text-emerald-600 dark:text-emerald-400'
      bgClass = 'bg-emerald-500/10 border-emerald-500/30'
      advice = '处于适宜体质指数范围，患心血管与代谢疾病的相对风险处于最低基线。'
    } else if (bmiVal < 28.0) {
      category = '超重 (偏胖)'
      colorClass = 'text-amber-600 dark:text-amber-400'
      bgClass = 'bg-amber-500/10 border-amber-500/30'
      advice = '体质指数超出健康范围，建议减少高糖高油饮食，每周保持至少 150 分钟中等强度有氧运动。'
    } else {
      category = '肥胖'
      colorClass = 'text-rose-600 dark:text-rose-400'
      bgClass = 'bg-rose-500/10 border-rose-500/30'
      advice = '已达临床肥胖标准，可能增加高血压、2型糖尿病与脂肪肝风险，建议咨询临床医生进行系统减重指导。'
    }

    // Ideal weight bounds for 18.5 ~ 23.9
    const minIdealWeight = Math.round(18.5 * hMeters * hMeters * 10) / 10
    const maxIdealWeight = Math.round(23.9 * hMeters * hMeters * 10) / 10

    return {
      bmi: bmiVal,
      category,
      colorClass,
      bgClass,
      advice,
      minIdealWeight,
      maxIdealWeight,
    }
  }, [height, weight])

  const copySummary = () => {
    if (!result) return
    const text = `【BMI 体质指数测评（中国成人 18+）】\n身高: ${height} cm\n体重: ${weight} kg\nBMI指数: ${result.bmi}\n健康状态: ${result.category}\n推荐理想体重范围: ${result.minIdealWeight} ~ ${result.maxIdealWeight} kg\n测评参考标准: 国家卫健委 WS/T 428-2013`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      trackEvent('copy', { toolSlug: 'bmi' })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const faq = [
    {
      question: '中国成人 BMI 标准与世界卫生组织（WHO）国际标准有何不同？',
      answer:
        'WHO 国际标准中超重阈值为 25.0、肥胖为 30.0。然而流行病学研究证实，东亚人群在相对较低的 BMI 下就更容易堆积腹部内脏脂肪并表现出代谢综合征。因此《中国成人超重和肥胖症预防控制指南》（WS/T 428-2013）将 24.0 定为超重界限、28.0 定为肥胖界限，更贴合国人健康风险评估。',
    },
    {
      question: '肌肉量很大的人（如健美/力量运动员）BMI 超标代表不健康吗？',
      answer:
        '不代表。BMI 计算公式仅考虑总质量与身高平方的比值，无法区分骨骼、肌肉与脂肪组织。经常进行阻力力量训练的人群骨骼肌充盈，可能 BMI 偏高但体脂率处于健康水平，此时应结合腰围、皮褶厚度或体脂仪综合评估。',
    },
    {
      question: '为什么老年人的 BMI 适宜范围可以略微宽松？',
      answer:
        '现代老年医学研究（如“肥胖悖论”）表明，65岁以上老年人适度储备营养、BMI 维持在 20.0 至 26.9 之间，在抵抗感染应激与预防骨质疏松/肌少症方面具有更好的保护效益。',
    },
  ]

  const howToSteps = [
    '准确测量并输入赤足身高（cm）与清晨空腹体重（kg）。',
    '系统根据国家卫健委《中国成人体重判定》行业标准实时计算 BMI 指数。',
    '对照健康区间色卡了解当前所处阶段及对应身高的理想体重范围（kg）。',
    '点击“复制测算结果”可直接保存或发送给家人与健康顾问。',
  ]

  return (
    <ToolLayout
      toolSlug="bmi"
      principlesTitle="BMI 体质指数计算公式与标准依据（中国成人 18+）"
      principles={
        <>
          <p>
            <strong>1. BMI 数学公式：</strong>
            {'BMI = 体重(kg) / [身高(m)]²'}
            。由 19 世纪比利时统计学家凯特勒提出，是国际公认衡量人体胖瘦程度与健康风险最简便普及的筛查指标。
          </p>
          <p>
            <strong>2. 中国现行国家行业标准（WS/T 428-2013）：</strong>
            <br />
            - 体重过低：BMI &lt; 18.5
            <br />
            - 体重正常：18.5 ≤ BMI &lt; 24.0
            <br />
            - 超重：24.0 ≤ BMI &lt; 28.0
            <br />
            - 肥胖：BMI ≥ 28.0
          </p>
          <p>
            <strong>3. 适用人群与局限性：</strong>
            本标准专为 18 周岁及以上中国成年人设计。未成年人骨骼发育迅速、孕产妇体液与胎儿重量增加、力量运动员骨骼肌比例极高，均不可直接套用本常规 BMI 切点判定健康状态。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer="【适用人群与医学限制说明】本工具严格依据中华人民共和国卫生行业标准《成人体重判定》（WS/T 428-2013）设计，仅适用于 18 周岁及以上中国健康成年人。不适用于儿童、生长发育期青少年、孕妇、乳母、水肿患者以及竞技运动员。测算结果为群体常态化健康参考，不构成任何医疗诊断或治疗承诺。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="card p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                身高 (cm)
              </label>
              <input
                type="number"
                min="80"
                max="250"
                value={height}
                onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-2xl font-bold font-mono text-center text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                体重 (kg)
              </label>
              <input
                type="number"
                min="20"
                max="300"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-2xl font-bold font-mono text-center text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Results Banner */}
        {result && (
          <div
            className={`rounded-2xl border p-6 text-center transition-all ${result.bgClass}`}
          >
            <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
              您的体质指数 (BMI)
            </p>
            <p
              className={`text-5xl font-extrabold font-mono tracking-tight my-2 ${result.colorClass}`}
            >
              {result.bmi}
            </p>
            <span
              className={`inline-block px-4 py-1 rounded-full text-xs font-bold my-1 border bg-surface/80 ${result.colorClass} border-current`}
            >
              {result.category}
            </span>
            <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto mt-2 leading-relaxed">
              {result.advice}
            </p>

            {/* Spectrum Bar */}
            <div className="max-w-md mx-auto mt-6">
              <div className="h-2.5 rounded-full overflow-hidden flex bg-surface-elevated border border-border">
                <div className="w-[18.5%] bg-blue-500" title="偏瘦 <18.5" />
                <div className="w-[27.5%] bg-emerald-500" title="正常 18.5-23.9" />
                <div className="w-[20%] bg-amber-500" title="超重 24.0-27.9" />
                <div className="w-[34%] bg-rose-500" title="肥胖 ≥28.0" />
              </div>
              <div className="flex justify-between text-[10px] text-text-muted mt-1.5 font-mono">
                <span>偏瘦 (&lt;18.5)</span>
                <span>正常 (18.5-23.9)</span>
                <span>超重 (24-27.9)</span>
                <span>肥胖 (≥28)</span>
              </div>
            </div>

            {/* Copy Result Button */}
            <div className="mt-6 pt-4 border-t border-border/50 flex justify-center">
              <button
                type="button"
                onClick={copySummary}
                className="btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制测算报告' : '复制测算结果'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Ideal Weight Card */}
        {result && (
          <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-text-muted">基于您 {height}cm 身高的推荐健康体重范围</p>
                <p className="text-lg font-bold text-text-primary font-mono">
                  {result.minIdealWeight} ~ {result.maxIdealWeight} kg
                </p>
              </div>
            </div>
            <div className="text-xs text-text-muted font-mono">
              按国家 WS/T 428-2013 (18.5 ~ 23.9) 换算
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
