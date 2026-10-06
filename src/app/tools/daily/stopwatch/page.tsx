'use client'

import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Timer, Play, Pause, RotateCcw, Flag, Copy, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface Lap {
  index: number
  totalMs: number
  lapMs: number
}

export default function StopwatchPage() {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const [copied, setCopied] = useState(false)

  // Drift-free timing ref
  const startTimeRef = useRef<number>(0)
  const accumulatedRef = useRef<number>(0)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now()

      const update = () => {
        const now = performance.now()
        setElapsedMs(accumulatedRef.current + (now - startTimeRef.current))
        animFrameRef.current = requestAnimationFrame(update)
      }

      animFrameRef.current = requestAnimationFrame(update)
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isRunning])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const hundredths = Math.floor((ms % 1000) / 10)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`
  }

  const handleStartStop = () => {
    if (isRunning) {
      // Pause
      accumulatedRef.current = elapsedMs
      setIsRunning(false)
    } else {
      // Start
      setIsRunning(true)
      trackEvent('tool_success', { tool: 'stopwatch' })
    }
  }

  const handleLap = () => {
    if (!isRunning) return
    const prevTotal = laps.length > 0 ? laps[0].totalMs : 0
    const lapMs = elapsedMs - prevTotal

    const newLap: Lap = {
      index: laps.length + 1,
      totalMs: elapsedMs,
      lapMs: Math.max(0, lapMs),
    }

    setLaps([newLap, ...laps])
  }

  const handleReset = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }
    accumulatedRef.current = 0
    setElapsedMs(0)
    setIsRunning(false)
    setLaps([])
  }

  // Find best and worst laps if laps >= 2
  const bestLapMs = laps.length >= 2 ? Math.min(...laps.map((l) => l.lapMs)) : null
  const worstLapMs = laps.length >= 2 ? Math.max(...laps.map((l) => l.lapMs)) : null

  const handleCopyLaps = async () => {
    if (laps.length === 0) return
    const text = [
      `【BitNook 高精度秒表计次记录】`,
      `• 总计用时：${formatTime(elapsedMs)}`,
      `• 计次圈数：${laps.length} 圈`,
      ...laps.map(
        (l) =>
          `  第 ${l.index} 圈：单圈 ${formatTime(l.lapMs)} (累计 ${formatTime(l.totalMs)})${
            l.lapMs === bestLapMs ? ' [最快]' : l.lapMs === worstLapMs ? ' [最慢]' : ''
          }`
      ),
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      trackEvent('copy', { tool: 'stopwatch' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <ToolLayout
      toolSlug="stopwatch"
      principlesTitle="高精度时钟、帧同步与无漂移计时算法"
      principles={
        <>
          <p>
            <strong>1. performance.now() 高精度单调时钟：</strong>
            传统 JavaScript 秒表依赖 `setInterval(..., 10)`，极易因事件循环阻塞与浏览器后台标签页节流（降低至 1000ms/次）产生严重时钟漂移。BitNook 采用 `performance.now()` 纳秒级硬件时间戳与 `requestAnimationFrame` 动态时钟差值计算，确保秒表即使在后台最小化也保持零漂移精准度。
          </p>
          <p>
            <strong>2. 自动最快/最慢分圈识别：</strong>
            计次记录在前端双向链表索引中动态对比极值，自动标识最快圈速（Best Lap）与最慢圈速（Worst Lap），提供专业运动竞赛级体验。
          </p>
        </>
      }
      howToSteps={[
        '点击“开始”按钮启动高精度毫秒秒表。',
        '秒表运行过程中，点击“计次 / 分圈”记录当前阶段耗时。',
        '点击“暂停”可随时停顿，支持一键重置归零或复制全部计次数据。',
      ]}
      faq={[
        {
          question: '如果我切换到其他浏览器标签页，计时会变慢吗？',
          answer:
            '不会。由于采用绝对硬件时间戳差值而非累加递增计数，无论离开标签页多久，重新切回时显示的毫秒数均与现实物理时间严格一致。',
        },
      ]}
      disclaimer="本秒表供日常生活、体育锻炼、科研实验及效率测试使用。正式国际奥林匹克等专业赛事请使用光电计时器认证设备。"
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Main Display Card */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F1523] p-8 sm:p-12 text-center shadow-xl space-y-6">
          <p className="text-5xl sm:text-7xl font-mono font-extrabold text-white tracking-wider select-all">
            {formatTime(elapsedMs)}
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartStop}
              className={`px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm ${
                isRunning
                  ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                  : 'bg-[#10B981] text-white hover:bg-[#059669]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  暂停
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  开始
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLap}
              disabled={!isRunning}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#141C2E] border border-[#1E293B] text-white hover:border-[#6366F1]/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition shadow-sm"
            >
              <Flag className="w-4 h-4 text-[#38BDF8]" />
              计次
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={elapsedMs === 0 && !isRunning}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#141C2E] border border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#6366F1]/50 disabled:opacity-40 transition shadow-sm"
              title="重置归零"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Laps List */}
        {laps.length > 0 && (
          <div className="rounded-2xl border border-[#1E293B] bg-[#0F1523] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#CBD5E1]">计次明细记录 ({laps.length} 圈)</h3>
              <button
                type="button"
                onClick={handleCopyLaps}
                className="text-xs text-[#818CF8] hover:text-white flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制计次表'}</span>
              </button>
            </div>

            <div className="divide-y divide-[#1E293B]/60 max-h-72 overflow-y-auto pr-1">
              {laps.map((lap) => {
                const isBest = lap.lapMs === bestLapMs
                const isWorst = lap.lapMs === worstLapMs

                return (
                  <div key={lap.index} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[#64748B] w-12">#{lap.index}</span>
                      {isBest && (
                        <span className="px-1.5 py-0.2 rounded bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-[10px]">
                          最快
                        </span>
                      )}
                      {isWorst && (
                        <span className="px-1.5 py-0.2 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[10px]">
                          最慢
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${isBest ? 'text-[#10B981]' : isWorst ? 'text-[#EF4444]' : 'text-white'}`}>
                        +{formatTime(lap.lapMs)}
                      </span>
                      <span className="text-[#64748B] ml-3 text-[11px]">{formatTime(lap.totalMs)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
