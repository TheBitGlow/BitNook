'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Play, Pause, RotateCcw, Trash2, Plus, Clock } from 'lucide-react'

interface Timer {
  id: number
  label: string
  seconds: number
  isRunning: boolean
  color: string
}

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316']

export default function TimerPage() {
  const [timers, setTimers] = useState<Timer[]>([
    { id: 1, label: '计时器 1', seconds: 0, isRunning: false, color: colors[0] }
  ])
  const [newLabel, setNewLabel] = useState('')
  const intervalRefs = useRef<{ [key: number]: NodeJS.Timeout }>({})

  useEffect(() => {
    timers.forEach(timer => {
      if (timer.isRunning) {
        intervalRefs.current[timer.id] = setInterval(() => {
          setTimers(prev => prev.map(t =>
            t.id === timer.id ? { ...t, seconds: t.seconds + 1 } : t
          ))
        }, 1000)
      } else {
        if (intervalRefs.current[timer.id]) {
          clearInterval(intervalRefs.current[timer.id])
          delete intervalRefs.current[timer.id]
        }
      }
    })

    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval)
    }
  }, [timers.map(t => t.isRunning).join(',')])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const toggleTimer = (id: number) => {
    setTimers(prev => prev.map(t =>
      t.id === id ? { ...t, isRunning: !t.isRunning } : t
    ))
  }

  const resetTimer = (id: number) => {
    setTimers(prev => prev.map(t =>
      t.id === id ? { ...t, seconds: 0, isRunning: false } : t
    ))
  }

  const deleteTimer = (id: number) => {
    if (intervalRefs.current[id]) {
      clearInterval(intervalRefs.current[id])
      delete intervalRefs.current[id]
    }
    setTimers(prev => prev.filter(t => t.id !== id))
  }

  const addTimer = () => {
    if (timers.length >= 8) return
    const nextColor = colors[timers.length % colors.length]
    const newTimer: Timer = {
      id: Date.now(),
      label: newLabel || `计时器 ${timers.length + 1}`,
      seconds: 0,
      isRunning: false,
      color: nextColor
    }
    setTimers(prev => [...prev, newTimer])
    setNewLabel('')
  }

  const totalSeconds = timers.reduce((sum, t) => sum + t.seconds, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">计时器</h1>
            </div>
            <p className="text-[#94A3B8]">多任务并行计时，支持番茄钟模式</p>
          </div>

          {/* Total Time */}
          <div className="glass-card p-6 mb-6 text-center">
            <p className="text-sm text-[#94A3B8] mb-2">累计时间</p>
            <p className="text-4xl font-mono font-bold text-white">{formatTime(totalSeconds)}</p>
          </div>

          {/* Add Timer */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="输入计时器名称..."
              className="flex-1 px-4 py-3 bg-[#111827] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
              maxLength={20}
            />
            <button
              onClick={addTimer}
              disabled={timers.length >= 8}
              className="px-4 py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加
            </button>
          </div>

          {/* Timers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {timers.map((timer) => (
              <div key={timer.id} className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="font-medium"
                    style={{ color: timer.color }}
                  >
                    {timer.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resetTimer(timer.id)}
                      className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#1A2235] rounded-lg transition-colors"
                      title="重置"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTimer(timer.id)}
                      className="p-2 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#1A2235] rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-4xl font-mono font-bold text-white mb-4 text-center">
                  {formatTime(timer.seconds)}
                </p>

                <button
                  onClick={() => toggleTimer(timer.id)}
                  className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                  style={{
                    backgroundColor: timer.isRunning ? '#EF4444' : timer.color,
                    color: 'white'
                  }}
                >
                  {timer.isRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      暂停
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      开始
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-[#111827]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">提示：</span>
              番茄钟模式建议设置为 25 分钟工作 + 5 分钟休息。最多支持 8 个计时器同时运行。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
