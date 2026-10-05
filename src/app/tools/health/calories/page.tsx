'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Activity, Flame, Utensils, Apple } from 'lucide-react'

export default function CaloriesPage() {
  const [weight, setWeight] = useState(65)
  const [height, setHeight] = useState(170)
  const [age, setAge] = useState(30)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [activityLevel, setActivityLevel] = useState(1.2)

  const activityLevels = [
    { value: 1.2, label: '久坐办公（几乎不运动）' },
    { value: 1.375, label: '轻度活动（每周轻度运动 1-3 天）' },
    { value: 1.55, label: '中度活动（每周中等运动 3-5 天）' },
    { value: 1.725, label: '高度活跃（每周高强度运动 6-7 天）' },
    { value: 1.9, label: '专业级 / 重体力劳动（每日大负荷）' },
  ]

  // BMR calculation (Mifflin-St Jeor)
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161

  const tdee = Math.round(bmr * activityLevel)

  const goals = [
    {
      label: '健康减脂 (-500 kcal)',
      desc: '建议每周稳步减重约 0.4~0.5 kg',
      value: Math.max(1200, tdee - 500),
      color: '#EF4444',
    },
    {
      label: '体重维持 (±0 kcal)',
      desc: '摄入与消耗平衡，维持现有体重',
      value: tdee,
      color: '#10B981',
    },
    {
      label: '增肌增重 (+300 kcal)',
      desc: '配合阻力力量训练，促进肌肉合成',
      value: tdee + 300,
      color: '#3B82F6',
    },
  ]

  const macros = {
    protein: Math.round(weight * 1.6),
    fat: Math.round((tdee * 0.25) / 9),
    carbs: Math.round((tdee - weight * 1.6 * 4 - tdee * 0.25) / 4),
  }

  const faq = [
    {
      question: '什么是 BMR（基础代谢）与 TDEE（每日总能量消耗）？',
      answer:
        'BMR 是人体在完全安静、清醒且空腹状态下维持呼吸、心跳、细胞代谢等基础生命活动所消耗的最低热量；TDEE 是在 BMR 基础上加上日常走动、工作、运动及食物热效应后的全天真实能量总消耗。',
    },
    {
      question: '减脂期每天少吃 500 大卡为什么是黄金热量缺口？',
      answer:
        '人体消耗 1 公斤脂肪约需 7,700 大卡热量差。每天创造约 500 大卡缺口，半个月可制造 7,500 大卡缺口，既能保证正常激素代谢与肌肉量不流失，又可达到可持续的平稳减脂节奏。极低热量节食会导致基础代谢损伤与快速反弹。',
    },
    {
      question: '三大营养素（碳水、蛋白质、脂肪）应当如何分配？',
      answer:
        '常规健康比例中，蛋白质建议按体重 1.2~1.8g/kg（保证机体修复）；脂肪占全天总能量约 20%~30%（维持正常内分泌）；其余热量由复合碳水化合物提供。',
    },
  ]

  const howToSteps = [
    '填写当前体重（kg）、身高（cm）、年龄与生理性别。',
    '选择日常整体身体活动水平（如久坐办公或规律健身）。',
    '系统实时测算您的静息基础代谢（BMR）与全天真实能量总消耗（TDEE）。',
    '对照减脂、维持或增肌目标，查阅对应建议热量目标与三大宏量营养素克数。',
  ]

  return (
    <ToolLayout
      toolSlug="calories"
      principlesTitle="卡路里消耗与能量平衡计算原理"
      principles={
        <>
          <p>
            <strong>1. Mifflin-St Jeor 基础代谢模型：</strong>
            大量临床对比研究（如美国饮食协会 ADA）证实，Mifflin-St Jeor 公式在非肥胖与肥胖人群中均具备更高的代谢预测精度：
            <br />
            - 男性：\(BMR = 10 \times 体重(kg) + 6.25 \times 身高(cm) - 5 \times 年龄 + 5\)
            <br />
            - 女性：\(BMR = 10 \times 体重(kg) + 6.25 \times 身高(cm) - 5 \times 年龄 - 161\)
          </p>
          <p>
            <strong>2. 每日总消耗 (TDEE)：</strong>
            \(TDEE = BMR \times 身体活动水平系数 (PAL)\)。活动系数在 1.2（久坐）至 1.9（高强度体力活动）之间分布。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer="本计算器用于一般健康人群营养规划与日常膳食参考。儿童青少年、孕妇乳母或患有甲状腺疾病、糖尿病等代谢病患者，热量摄入须遵从临床营养师指导。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[#0B0F19]/80 p-6 sm:p-8 backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                体重 (kg)
              </label>
              <input
                type="number"
                min="30"
                max="250"
                value={weight}
                onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white font-mono focus:border-[#6366F1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                身高 (cm)
              </label>
              <input
                type="number"
                min="100"
                max="240"
                value={height}
                onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white font-mono focus:border-[#6366F1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                年龄 (岁)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white font-mono focus:border-[#6366F1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                生理性别
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`rounded-xl py-2.5 text-xs font-semibold border transition-all ${
                    gender === 'male'
                      ? 'border-[#3B82F6] bg-[#3B82F6]/20 text-white'
                      : 'border-[rgba(99,102,241,0.15)] bg-[#070A12] text-[#94A3B8]'
                  }`}
                >
                  男性
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`rounded-xl py-2.5 text-xs font-semibold border transition-all ${
                    gender === 'female'
                      ? 'border-[#EC4899] bg-[#EC4899]/20 text-white'
                      : 'border-[rgba(99,102,241,0.15)] bg-[#070A12] text-[#94A3B8]'
                  }`}
                >
                  女性
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              日常身体活动水平
            </label>
            <select
              aria-label="日常活动水平"
              value={activityLevel}
              onChange={(e) => setActivityLevel(Number(e.target.value))}
              className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-2.5 text-white font-medium focus:border-[#6366F1] focus:outline-none"
            >
              {activityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-6 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">基础代谢率 (BMR)</p>
            <p className="text-4xl font-extrabold text-white font-mono tracking-tight my-1">
              {Math.round(bmr)}{' '}
              <span className="text-base font-sans text-[#94A3B8]">kcal/天</span>
            </p>
            <p className="text-xs text-[#64748B]">人体维持基本生命体征所需底线热量</p>
          </div>

          <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0D121F]/80 p-6 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">每日总能量消耗 (TDEE)</p>
            <p className="text-4xl font-extrabold text-[#10B981] font-mono tracking-tight my-1">
              {tdee} <span className="text-base font-sans text-[#94A3B8]">kcal/天</span>
            </p>
            <p className="text-xs text-[#64748B]">包含日常工作生活与运动在内的真实总消耗</p>
          </div>
        </div>

        {/* Goal Intake Breakdown */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0B0F19]/80 p-6">
          <h3 className="font-semibold text-white text-sm sm:text-base mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#EF4444]" />
            不同体态管理目标下的建议每日热量摄入
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {goals.map((g) => (
              <div
                key={g.label}
                className="rounded-xl border border-[rgba(99,102,241,0.1)] bg-[#070A12]/60 p-4 text-center"
              >
                <span className="font-semibold text-xs text-[#CBD5E1]">{g.label}</span>
                <p
                  className="text-3xl font-extrabold font-mono my-2"
                  style={{ color: g.color }}
                >
                  {g.value}{' '}
                  <span className="text-xs font-normal text-[#94A3B8]">kcal</span>
                </p>
                <p className="text-[11px] text-[#64748B]">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0B0F19]/80 p-6">
          <h3 className="font-semibold text-white text-sm sm:text-base mb-4 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-[#38BDF8]" />
            三大宏量营养素参考配比（维持基准）
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[rgba(99,102,241,0.1)] bg-[#070A12]/60 p-4 text-center">
              <span className="text-xs text-[#94A3B8]">蛋白质 (约1.6g/kg)</span>
              <p className="text-2xl font-bold text-[#EF4444] font-mono my-1">
                {macros.protein} <span className="text-xs font-sans">克/天</span>
              </p>
              <p className="text-[11px] text-[#64748B]">
                约 {macros.protein * 4} kcal (占总能量约 {Math.round(((macros.protein * 4) / tdee) * 100)}%)
              </p>
            </div>

            <div className="rounded-xl border border-[rgba(99,102,241,0.1)] bg-[#070A12]/60 p-4 text-center">
              <span className="text-xs text-[#94A3B8]">健康脂肪 (约25%热量)</span>
              <p className="text-2xl font-bold text-[#F59E0B] font-mono my-1">
                {macros.fat} <span className="text-xs font-sans">克/天</span>
              </p>
              <p className="text-[11px] text-[#64748B]">
                约 {macros.fat * 9} kcal (维持健康必需脂肪酸)
              </p>
            </div>

            <div className="rounded-xl border border-[rgba(99,102,241,0.1)] bg-[#070A12]/60 p-4 text-center">
              <span className="text-xs text-[#94A3B8]">优质碳水 (余量补充)</span>
              <p className="text-2xl font-bold text-[#3B82F6] font-mono my-1">
                {macros.carbs} <span className="text-xs font-sans">克/天</span>
              </p>
              <p className="text-[11px] text-[#64748B]">
                约 {macros.carbs * 4} kcal (全谷物与根茎类为主)
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
