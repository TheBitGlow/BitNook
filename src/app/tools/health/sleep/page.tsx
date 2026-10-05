'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Moon, Clock, BedDouble, Sun } from 'lucide-react'

export default function SleepPage() {
  const [mode, setMode] = useState<'wake' | 'sleep'>('wake')
  const [inputTime, setInputTime] = useState<string>('07:00')
  const [latencyMinutes, setLatencyMinutes] = useState<number>(15)

  const parseTime = (time: string): { hours: number; minutes: number } => {
    const [h, m] = time.split(':').map(Number)
    return { hours: isNaN(h) ? 7 : h, minutes: isNaN(m) ? 0 : m }
  }

  const formatTimeString = (totalMinutes: number): string => {
    let normalized = totalMinutes % (24 * 60)
    if (normalized < 0) normalized += 24 * 60
    const h = Math.floor(normalized / 60)
    const m = normalized % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const calculateSleepSchedule = () => {
    const { hours, minutes } = parseTime(inputTime)
    const baseMinutes = hours * 60 + minutes
    const cycleMinutes = 90 // ~90 min nominal cycle

    // 6, 5, 4, 3 cycles
    const cycles = [6, 5, 4, 3]

    return cycles.map((c) => {
      const sleepDuration = c * cycleMinutes
      let targetTimeMinutes: number

      if (mode === 'wake') {
        // We know wake time, calculate bedtime: bedtime = wakeTime - duration - latency
        targetTimeMinutes = baseMinutes - sleepDuration - latencyMinutes
      } else {
        // We know bedtime, calculate wake time: wakeTime = bedtime + latency + duration
        targetTimeMinutes = baseMinutes + latencyMinutes + sleepDuration
      }

      const totalSleepHours = (sleepDuration / 60).toFixed(1)
      let label = '推荐黄金睡眠'
      let badgeColor = 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30'

      if (c === 6) {
        label = '充足充沛睡眠 (9小时)'
        badgeColor = 'text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/30'
      } else if (c === 5) {
        label = '成人理想时长 (7.5小时)'
        badgeColor = 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30'
      } else if (c === 4) {
        label = '适度短周期 (6小时)'
        badgeColor = 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30'
      } else {
        label = '紧急小憩/短睡眠 (4.5小时)'
        badgeColor = 'text-[#94A3B8] bg-[#1E293B] border-[rgba(99,102,241,0.2)]'
      }

      return {
        cycles: c,
        timeStr: formatTimeString(targetTimeMinutes),
        hours: totalSleepHours,
        label,
        badgeColor,
      }
    })
  }

  const scheduleResults = calculateSleepSchedule()

  const faq = [
    {
      question: '90 分钟睡眠周期是严格不变的生理规律吗？',
      answer:
        '不是。健康成人的睡眠周期通常在 70 至 120 分钟之间波动，并且在入睡初期的周期深睡眠比例较高，黎明前的周期快速眼动（REM）睡眠比例增加。90 分钟仅作为群体中位数的粗略参考，不能作为机械的医学定则。',
    },
    {
      question: '为什么算上 15 分钟入睡潜伏期（Latency）？',
      answer:
        '健康人群在关灯躺下后，通常需要 10 至 20 分钟才能真正进入一期浅睡眠。把这部分时间计算在内，可以避免因实际入睡延迟导致在深睡眠阶段被闹钟惊醒。',
    },
    {
      question: '如果总是觉得睡不醒，应该如何调整？',
      answer:
        '除了规划入睡时间外，保持规律的固定起床时间、睡前 1 小时远离蓝光屏幕、白天接受充足自然光照以及避免傍晚摄入咖啡因，对稳定生物钟与提升睡眠质量更为关键。',
    },
  ]

  const howToSteps = [
    '选择规划目标：【我想几点起床】反推入睡时间，或【我想几点入睡】顺推晨醒时间。',
    '设置目标时间点与个人习惯的平均入睡等待时间（默认 15 分钟）。',
    '查阅推算的推荐时间方案，优先选择 5 个周期（约 7.5 小时）或 6 个周期（约 9 小时）。',
    '结合自身生物钟规律微调闹钟，保持长期相对固定的作息节律。',
  ]

  return (
    <ToolLayout
      toolSlug="sleep"
      principlesTitle="睡眠时间规划原理与科学认知说明"
      principles={
        <>
          <p>
            <strong>1. 周期性结构概述：</strong>人在睡眠中会交替经历非快速眼动睡眠（NREM，分为 N1、N2、N3 期）和快速眼动睡眠（REM）。通常从轻度浅睡逐渐进入深睡修复，再进入脑电活跃的 REM 阶段，完成一个循环平均耗时约 90 分钟。
          </p>
          <p>
            <strong>2. 避开深睡眠唤醒：</strong>如果在 N3 深睡眠（慢波睡眠）阶段被闹钟强制唤醒，容易产生强烈的“睡眠惰性”（脑部昏沉、反应迟钝）。在周期末尾的浅睡阶段自然醒来，体感往往更加清醒轻松。
          </p>
          <p>
            <strong>3. 个体差异与免责：</strong>每个人的真实周期长度和所需睡眠总量存在显著差异（短睡眠者 vs 长睡眠者）。本规划器仅提供日常时间安排辅助，不构成针对失眠症或睡眠呼吸暂停等疾病的临床诊疗建议。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer="本规划器基于健康成人平均 90 分钟睡眠周期统计学模型推算。个体睡眠节律受年龄、光照、昼夜节律类型等因素影响，本工具供健康生活作息规划参考，不作为睡眠障碍诊断依据。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[#0B0F19]/80 p-6 sm:p-8 backdrop-blur-md">
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setMode('wake')}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-semibold border transition-all ${
                mode === 'wake'
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/20 text-white shadow-lg'
                  : 'border-[rgba(99,102,241,0.15)] bg-[#070A12] text-[#94A3B8] hover:text-white'
              }`}
            >
              <Sun className="h-4 w-4 text-[#F59E0B]" />
              设定目标起床时间
            </button>
            <button
              type="button"
              onClick={() => setMode('sleep')}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-semibold border transition-all ${
                mode === 'sleep'
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/20 text-white shadow-lg'
                  : 'border-[rgba(99,102,241,0.15)] bg-[#070A12] text-[#94A3B8] hover:text-white'
              }`}
            >
              <Moon className="h-4 w-4 text-[#8B5CF6]" />
              设定计划入睡时间
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                {mode === 'wake' ? '期望在何时醒来？' : '准备在何时上床躺下？'}
              </label>
              <input
                type="time"
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-3xl font-bold font-mono text-center text-white focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                入睡潜伏期（闭眼到睡着的平均耗时，分钟）
              </label>
              <select
                aria-label="入睡耗时"
                value={latencyMinutes}
                onChange={(e) => setLatencyMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-white font-medium focus:border-[#8B5CF6] focus:outline-none"
              >
                <option value={10}>10 分钟（入睡极快）</option>
                <option value={15}>15 分钟（标准均值）</option>
                <option value={20}>20 分钟（稍慢入睡）</option>
                <option value={30}>30 分钟（较慢入睡）</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0B0F19]/80 p-6">
          <h3 className="font-semibold text-white text-sm sm:text-base mb-4 flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-[#8B5CF6]" />
            {mode === 'wake' ? '建议上床入睡时间点' : '建议闹钟唤醒时间点'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scheduleResults.map((item) => (
              <div
                key={item.cycles}
                className="rounded-2xl border border-[rgba(99,102,241,0.12)] bg-[#070A12]/60 p-5 hover:border-[rgba(99,102,241,0.25)] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${item.badgeColor}`}>
                    {item.label}
                  </span>
                  <span className="text-xs text-[#64748B] font-mono">
                    {item.cycles} 个周期 · 约 {item.hours}h
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-white font-mono my-1 tracking-tight">
                  {item.timeStr}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  {mode === 'wake'
                    ? `于 ${item.timeStr} 上床，加上 ${latencyMinutes} 分钟入睡等待，在第 ${item.cycles} 周期结束醒来。`
                    : `于 ${inputTime} 入睡，预计在第 ${item.cycles} 个周期末尾约 ${item.timeStr} 自然醒来。`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
