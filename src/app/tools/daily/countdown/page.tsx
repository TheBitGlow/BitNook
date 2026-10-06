'use client'

import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Clock, Trash2, Plus, Sparkles, AlertCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface CountdownItem {
  id: number
  label: string
  targetDateISO: string
  color: string
}

const PRESETS = [
  { label: '元旦 2027', getTarget: () => '2027-01-01T00:00' },
  { label: '下个周末 (周六00:00)', getTarget: () => {
    const d = new Date()
    const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7
    d.setDate(d.getDate() + daysUntilSat)
    return `${d.toISOString().slice(0, 10)}T00:00`
  }},
  { label: '程序员节 (10.24)', getTarget: () => {
    const year = new Date().getMonth() > 9 || (new Date().getMonth() === 9 && new Date().getDate() >= 24)
      ? new Date().getFullYear() + 1
      : new Date().getFullYear()
    return `${year}-10-24T00:00`
  }},
]

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899']

export default function CountdownPage() {
  const [countdowns, setCountdowns] = useState<CountdownItem[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('00:00')
  const [isLoaded, setIsLoaded] = useState(false)
  const [, forceUpdate] = useState(0)

  // Load from LocalStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('bitnook_countdowns')
        if (saved) {
          setCountdowns(JSON.parse(saved))
        } else {
          // default item
          const nextYear = new Date().getFullYear() + 1
          setCountdowns([
            {
              id: 1,
              label: `${nextYear} 新年倒计时`,
              targetDateISO: `${nextYear}-01-01T00:00:00`,
              color: '#6366F1',
            },
          ])
        }
      } catch {
        // ignore
      }
      setIsLoaded(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem('bitnook_countdowns', JSON.stringify(countdowns))
    } catch {
      // ignore
    }
  }, [countdowns, isLoaded])

  // Ticking interval
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const addCountdown = () => {
    if (!newLabel.trim() || !newDate) return
    const targetISO = `${newDate}T${newTime}:00`
    const target = new Date(targetISO)
    if (isNaN(target.getTime())) return

    const newItem: CountdownItem = {
      id: Date.now(),
      label: newLabel.trim(),
      targetDateISO: targetISO,
      color: COLORS[countdowns.length % COLORS.length],
    }

    setCountdowns((prev) => [newItem, ...prev])
    setNewLabel('')
    setNewDate('')
    setNewTime('00:00')
    trackEvent('tool_success', { tool: 'countdown' })
  }

  const deleteCountdown = (id: number) => {
    setCountdowns((prev) => prev.filter((c) => c.id !== id))
  }

  const getTimeLeft = (targetISO: string) => {
    const target = new Date(targetISO)
    const now = new Date()
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) {
      const pastMs = Math.abs(diff)
      const pastDays = Math.floor(pastMs / (1000 * 60 * 60 * 24))
      const pastHours = Math.floor((pastMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true, pastDays, pastHours }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, isOver: false, pastDays: 0, pastHours: 0 }
  }

  return (
    <ToolLayout
      toolSlug="countdown"
      principlesTitle="倒计时时间计算与跨时区本地化原理"
      principles={
        <>
          <p>
            <strong>1. UTC 毫秒差绝对计算：</strong>
            倒计时依赖物理时间戳毫秒差 Diff = T_target - T_now，不受本地系统跨越夏令时或历法规则调整的影响，确保倒计时刻度均匀单调递减。
          </p>
          <p>
            <strong>2. 客户端无损持久化：</strong>
            用户设定的所有倒计时事件均存储在浏览器本地 LocalStorage 中，不会回传至服务器，完全保障用户生活计划与日程隐私。
          </p>
        </>
      }
      howToSteps={[
        '输入事件名称（例如：项目上线、生日纪念日、考试倒计时）。',
        '选取目标日期与具体时间点，或点击快捷预设填入节假日。',
        '点击“添加倒计时”，看板即刻每秒动态刷新天、时、分、秒倒计时刻度。',
      ]}
      faq={[
        {
          question: '如果我关闭网页，倒计时会中断吗？',
          answer:
            '不会。倒计时基于目标日期的绝对时间差计算，而非基于计时器累加。无论关闭页面多久，重新打开后依然会显示最新的准确剩余时间。',
        },
        {
          question: '倒计时到达时会发生什么？',
          answer:
            '当目标时间到达后，卡片将自动切换为高亮“已到达”提醒状态，并实时换算已过去的天数。',
        },
      ]}
      disclaimer="本工具仅供个人时间规划参考，重要考试、列车航班等关键节点请以官方时刻表为准并预留充分缓冲时间。"
    >
      <div className="space-y-6">
        {/* Add Countdown Card */}
        <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xs font-semibold text-text-primary">添加新的倒计时目标</h2>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
              <span>快速预设:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setNewLabel(p.label.split(' ')[0])
                    const targetStr = p.getTarget()
                    const [d, t] = targetStr.split('T')
                    setNewDate(d)
                    setNewTime(t || '00:00')
                  }}
                  className="px-2 py-0.5 rounded bg-surface-secondary border border-border hover:bg-surface-hover text-text-secondary font-mono transition text-xs cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">事件名称</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="如：立项交付、考试、新年"
                className="w-full px-3 py-1.5 bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted text-xs sm:text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                maxLength={30}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">目标日期</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-border rounded-md text-text-primary text-xs sm:text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">目标具体时刻</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-border rounded-md text-text-primary text-xs sm:text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addCountdown}
            disabled={!newLabel.trim() || !newDate}
            className="w-full btn-primary disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            <span>添加倒计时</span>
          </button>
        </div>

        {/* Countdowns Grid */}
        {countdowns.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-10 text-center text-text-muted text-xs">
            暂无已添加的倒计时，可在上方快速设定目标
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {countdowns.map((cd) => {
              const timeLeft = getTimeLeft(cd.targetDateISO)
              const targetDate = new Date(cd.targetDateISO)

              return (
                <div key={cd.id} className="rounded-xl border border-border bg-surface p-4 sm:p-5 relative space-y-3 shadow-subtle hover:border-border-hover transition-colors">
                  <div className="flex items-center justify-between pr-1">
                    <h3 className="font-semibold text-text-primary text-sm truncate">{cd.label}</h3>
                    <button
                      type="button"
                      onClick={() => deleteCountdown(cd.id)}
                      className="p-1 text-text-muted hover:text-danger transition-colors rounded hover:bg-danger-subtle cursor-pointer"
                      title="删除倒计时"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-text-muted font-mono">
                    目标时间：{isNaN(targetDate.getTime()) ? cd.targetDateISO : targetDate.toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  {timeLeft.isOver ? (
                    <div className="text-center py-3 bg-surface-secondary rounded-lg border border-border">
                      <span className="text-sm font-semibold text-success block">已到达目标时刻！</span>
                      <span className="text-[11px] text-text-muted font-mono mt-0.5 block">
                        已过去 {timeLeft.pastDays} 天 {timeLeft.pastHours} 小时
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      {[
                        { value: timeLeft.days, label: '天' },
                        { value: timeLeft.hours, label: '时' },
                        { value: timeLeft.minutes, label: '分' },
                        { value: timeLeft.seconds, label: '秒' },
                      ].map((item) => (
                        <div key={item.label} className="bg-surface-secondary border border-border rounded-lg p-2">
                          <div className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight tabular-nums">
                            {item.value.toString().padStart(2, '0')}
                          </div>
                          <div className="text-[10px] text-text-muted font-sans mt-0.5">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
