'use client'

import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Play, Pause, RotateCcw, Trash2, Plus, Clock, Sparkles } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface TimerItem {
  id: number
  label: string
  accumulatedSeconds: number
  lastStartedAt: number | null
  isRunning: boolean
  color: string
}

const PRESET_TIMERS = [
  { label: '番茄工作', defaultSec: 25 * 60 },
  { label: '深度专注', defaultSec: 45 * 60 },
  { label: '健康短休', defaultSec: 5 * 60 },
  { label: '泡茶/咖啡', defaultSec: 3 * 60 },
]

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#38BDF8', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6']

export default function TimerPage() {
  const [timers, setTimers] = useState<TimerItem[]>([
    {
      id: 1,
      label: '番茄工作 25m',
      accumulatedSeconds: 0,
      lastStartedAt: null,
      isRunning: false,
      color: '#6366F1',
    },
  ])
  const [newLabel, setNewLabel] = useState('')
  const [now, setNow] = useState<number>(() => Date.now())

  const hasRunning = timers.some((t) => t.isRunning)

  // Wall-clock continuous tick that survives browser throttling
  useEffect(() => {
    if (!hasRunning) return

    const interval = setInterval(() => {
      setNow(Date.now())
    }, 500)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setNow(Date.now())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [hasRunning])

  const getTimerSeconds = (t: TimerItem) => {
    if (!t.isRunning || !t.lastStartedAt) {
      return t.accumulatedSeconds
    }
    const elapsed = Math.floor((now - t.lastStartedAt) / 1000)
    return t.accumulatedSeconds + Math.max(0, elapsed)
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const toggleTimer = (id: number) => {
    const currentTimestamp = Date.now()
    setNow(currentTimestamp)
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        if (t.isRunning) {
          // Pause and commit true elapsed seconds
          const elapsed = t.lastStartedAt ? Math.floor((currentTimestamp - t.lastStartedAt) / 1000) : 0
          return {
            ...t,
            accumulatedSeconds: t.accumulatedSeconds + Math.max(0, elapsed),
            lastStartedAt: null,
            isRunning: false,
          }
        } else {
          // Start running
          return {
            ...t,
            lastStartedAt: currentTimestamp,
            isRunning: true,
          }
        }
      })
    )
    trackEvent('tool_success', { tool: 'timer' })
  }

  const resetTimer = (id: number) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, accumulatedSeconds: 0, lastStartedAt: null, isRunning: false } : t))
    )
  }

  const deleteTimer = (id: number) => {
    if (timers.length <= 1) return
    setTimers((prev) => prev.filter((t) => t.id !== id))
  }

  const addTimer = (labelName?: string) => {
    if (timers.length >= 8) return
    const nextColor = COLORS[timers.length % COLORS.length]
    const title = labelName || newLabel.trim() || `任务计时 ${timers.length + 1}`
    const nextId = timers.reduce((max, t) => Math.max(max, t.id), 0) + 1
    const newTimer: TimerItem = {
      id: nextId,
      label: title,
      accumulatedSeconds: 0,
      lastStartedAt: null,
      isRunning: false,
      color: nextColor,
    }
    setTimers((prev) => [...prev, newTimer])
    setNewLabel('')
    trackEvent('tool_success', { tool: 'timer' })
  }

  const totalSeconds = timers.reduce((sum, t) => sum + getTimerSeconds(t), 0)

  return (
    <ToolLayout
      toolSlug="timer"
      principlesTitle="番茄工作法与注意力分块计时原理"
      principles={
        <>
          <p>
            <strong>1. 番茄工作法 (Pomodoro) 心理机制：</strong>
            由弗朗西斯科·西里洛提出，将工作时间划分为 25 分钟单点高强度专注单元，配合 5 分钟短休息，有效消除因目标庞大引起的拖延与认知阻抗。
          </p>
          <p>
            <strong>2. 独立多任务状态隔离：</strong>
            每个计时器独立持有其运行状态与累加秒数，支持多分支并发统计，适合自由职业者同时追踪跨项目工时。
          </p>
        </>
      }
      howToSteps={[
        '选择“快速模板”一键创建番茄钟、深度专注或短休计时器。',
        '或在输入框自定义计时标签，点击“添加”创建多任务卡片。',
        '点击卡片“开始/暂停”控制计时，点击重置或删除归档。',
      ]}
      faq={[
        {
          question: '计时器支持倒计时模式吗？',
          answer:
            '本工具主要用于正向工时统计与番茄专注记录。若需要精确截止倒数，可搭配使用本站的“倒计时”专用工具。',
        },
        {
          question: '多开标签页会有冲突吗？',
          answer:
            '本工具运行于当前浏览器标签页上下文中，即使电脑断开网络也能毫秒级精准稳定计时。',
        },
      ]}
      disclaimer="本工具用于日常专注与个人工时参考，请结合个人节奏适度休息，避免长时间久坐。"
    >
      <div className="space-y-6">
        {/* Total Time & Presets */}
        <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">今日当前会话累计专注时长</p>
              <p className="text-3xl sm:text-4xl font-mono font-extrabold text-text-primary tracking-tight tabular-nums">
                {formatTime(totalSeconds)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-text-muted mr-1">快捷添加:</span>
              {PRESET_TIMERS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => addTimer(preset.label)}
                  disabled={timers.length >= 8}
                  className="px-2.5 py-1 rounded-md bg-surface-secondary border border-border hover:bg-surface-hover hover:border-border-hover text-text-secondary transition text-xs font-medium disabled:opacity-40 cursor-pointer"
                >
                  +{preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTimer()}
            placeholder="自定义计时器名称（如：代码审查、阅读文献）..."
            className="flex-1 px-3.5 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted text-xs sm:text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            maxLength={30}
          />
          <button
            type="button"
            onClick={() => addTimer()}
            disabled={timers.length >= 8}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>添加计时器</span>
          </button>
        </div>

        {/* Timers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {timers.map((timer) => {
            const sec = getTimerSeconds(timer)
            return (
              <div
                key={timer.id}
                className="rounded-xl border border-border bg-surface p-4 sm:p-5 relative space-y-3.5 shadow-subtle hover:border-border-hover transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold truncate max-w-[150px]" style={{ color: timer.color }}>
                    {timer.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => resetTimer(timer.id)}
                      className="p-1.5 text-text-muted hover:text-text-primary rounded-md hover:bg-surface-secondary transition cursor-pointer"
                      title="重置归零"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    {timers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteTimer(timer.id)}
                        className="p-1.5 text-text-muted hover:text-danger rounded-md hover:bg-danger-subtle transition cursor-pointer"
                        title="删除此项"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="py-4 bg-surface-secondary rounded-lg border border-border text-center font-mono font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight tabular-nums">
                  {formatTime(sec)}
                </div>

                <button
                  type="button"
                  onClick={() => toggleTimer(timer.id)}
                  className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-subtle ${
                    timer.isRunning
                      ? 'bg-danger text-white hover:bg-danger/90'
                      : 'bg-surface border border-border text-text-primary hover:bg-surface-secondary'
                  }`}
                >
                  {timer.isRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>暂停计时</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-success" />
                      <span>开始计时</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}
