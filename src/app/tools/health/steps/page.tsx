'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Footprints, MapPin, Clock, Flame } from 'lucide-react'

export default function StepsPage() {
  const [steps, setSteps] = useState<number>(8000)
  const [height, setHeight] = useState<number>(170)
  const [speedCategory, setSpeedCategory] = useState<'slow' | 'normal' | 'brisk'>('normal')

  // Biomechanics stride length (cm) = height * factor
  const strideRatio = 0.415
  const strideLengthMeters = (height * strideRatio) / 100 // in meters

  // Total distance in km
  const totalKm = (steps * strideLengthMeters) / 1000
  const totalMiles = totalKm * 0.621371

  // Speed in km/h
  const speeds = {
    slow: 3.5, // 漫步
    normal: 4.5, // 正常步行
    brisk: 5.5, // 快步走
  }
  const currentSpeed = speeds[speedCategory]
  const estimatedHours = totalKm / currentSpeed
  const estimatedMinutes = Math.round(estimatedHours * 60)

  // Energy expenditure rough estimate: ~3.5 METs for brisk, 3.0 for normal, 2.5 for slow
  // Rough estimate: ~0.035 to 0.045 kcal per step for average 65kg
  const estimatedKcal = Math.round(steps * 0.04)

  const faq = [
    {
      question: '步幅（步长）是如何科学估算的？',
      answer:
        '在运动生物力学中，人体的自然行走步幅（足跟至另一足跟距离）与身高具有高度正相关性，平均步长系数通常在身高的 0.41 至 0.42 倍之间。通过输入身高可以获得更接近实际的距离换算。',
    },
    {
      question: '“每日一万步”是世界卫生组织制定的医学铁律吗？',
      answer:
        '不是。“每天一万步”最早源于 1965 年日本某计步器的商业营销口号。多项现代流行病学研究（如《柳叶刀·公共卫生》）表明，对于成年人，每日 6,000 至 8,000 步的快步走在降低全因死亡率与心血管风险方面的健康边际收益最高，过量步行需注意膝关节负荷。',
    },
    {
      question: '本工具的卡路里消耗准确度如何？',
      answer:
        '卡路里消耗估算基于平地行走的平均代谢当量（MET）粗估。真实的能量消耗受路面坡度、个人体重、肌肉量、行走速度及风阻等多重生理因素影响，结果仅供日常活动参考。',
    },
  ]

  const howToSteps = [
    '输入您的今日实际步数或计划挑战步数（如 8,000 步）。',
    '输入身高（cm）以校准符合人体工程学的个性化单步步长。',
    '选择日常步行速度（慢速漫步 3.5km/h、中速 4.5km/h、快步走 5.5km/h）。',
    '系统自动换算得出步行总公里数、等效英里数、所需运动时长与活动消耗估算。',
  ]

  return (
    <ToolLayout
      toolSlug="steps"
      principlesTitle="步数与距离换算生物力学依据"
      principles={
        <>
          <p>
            <strong>1. 步长生物力学模型：</strong>单步距离（米）估算公式：步长 = 身高(cm) × 0.415 / 100。步行总距离（公里）：距离(km) = 步数 × 步长 / 1000。
          </p>
          <p>
            <strong>2. 科学活动指引：</strong>依据《柳叶刀》和《中国居民膳食指南》身体活动建议，以科学步长和有效活动时间为指引，避免盲目超负荷步行。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer="本工具步幅、距离与卡路里估算基于运动生物力学统计学中位数。实际步行步幅与能耗受地形、步态、肌肉量等生理因素影响，结果供健康生活参考。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                输入步数 (Steps)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={steps}
                onChange={(e) => setSteps(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-2xl font-bold font-mono text-center text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                身高 (cm，用于校准步长)
              </label>
              <input
                type="number"
                min="100"
                max="230"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-2xl font-bold font-mono text-center text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
              />
              <p className="mt-1 text-center text-[11px] text-text-muted">
                单步估算长约 {(strideLengthMeters * 100).toFixed(1)} cm
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                平均步行节奏
              </label>
              <select
                aria-label="步行节奏"
                value={speedCategory}
                onChange={(e) => setSpeedCategory(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-text-primary font-medium focus:border-accent-primary focus:outline-none transition-colors text-sm"
              >
                <option value="slow">散步 / 漫步 (~3.5 km/h)</option>
                <option value="normal">日常中速 (~4.5 km/h)</option>
                <option value="brisk">健步快走 (~5.5 km/h)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-5 text-center">
            <p className="text-xs text-text-muted mb-1">等效步行距离</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {totalKm.toFixed(2)} <span className="text-sm font-sans text-text-muted font-normal">公里</span>
            </p>
            <p className="text-[11px] text-text-muted mt-1">约 {totalMiles.toFixed(2)} 英里</p>
          </div>

          <div className="card p-5 text-center">
            <p className="text-xs text-text-muted mb-1">累计耗费时长</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {estimatedMinutes} <span className="text-sm font-sans text-text-muted font-normal">分钟</span>
            </p>
            <p className="text-[11px] text-text-muted mt-1">折合约 {(estimatedMinutes / 60).toFixed(1)} 小时</p>
          </div>

          <div className="card p-5 text-center">
            <p className="text-xs text-text-muted mb-1">估算活动消耗</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              ~{estimatedKcal} <span className="text-sm font-sans text-text-muted font-normal">kcal</span>
            </p>
            <p className="text-[11px] text-text-muted mt-1">按平地步行粗估</p>
          </div>

          <div className="card p-5 text-center">
            <p className="text-xs text-text-muted mb-1">相当于标准400米跑道</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-accent-primary font-mono">
              {(totalKm / 0.4).toFixed(1)} <span className="text-sm font-sans text-text-muted font-normal">圈</span>
            </p>
            <p className="text-[11px] text-text-muted mt-1">操场内圈环行</p>
          </div>
        </div>

        {/* Public Health Benchmarks */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-text-primary text-sm sm:text-base">
            成人日常步数与活动水平参考标准
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-border bg-surface-elevated p-4">
              <span className="font-bold text-text-muted">低于 5,000 步</span>
              <div className="text-rose-600 dark:text-rose-400 font-medium my-1">久坐生活模式</div>
              <p className="text-text-muted">建议工作间隙增加起立走动与楼梯活动。</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-elevated p-4">
              <span className="font-bold text-text-muted">5,000 ~ 7,499 步</span>
              <div className="text-amber-600 dark:text-amber-400 font-medium my-1">低活动量日常</div>
              <p className="text-text-muted">日常通勤基本量，建议增加中等强度快步走。</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-elevated p-4">
              <span className="font-bold text-text-muted">7,500 ~ 9,999 步</span>
              <div className="text-emerald-600 dark:text-emerald-400 font-medium my-1">理想健康推荐</div>
              <p className="text-text-muted">大量研究证实心血管健康收益最显著的平衡点。</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-elevated p-4">
              <span className="font-bold text-text-muted">10,000 步以上</span>
              <div className="text-blue-600 dark:text-blue-400 font-medium my-1">高活跃活动量</div>
              <p className="text-text-muted">运动习惯良好，长距离行走请穿避震鞋保护膝盖。</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
