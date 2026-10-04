'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Clock, Trash2, Plus, Share2 } from 'lucide-react'

interface Countdown {
  id: number
  label: string
  targetDate: Date
  color: string
}

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899']

export default function CountdownPage() {
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('00:00')
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const addCountdown = () => {
    if (!newLabel || !newDate) return
    const target = new Date(`${newDate}T${newTime}`)
    if (target <= new Date()) return

    const newItem: Countdown = {
      id: Date.now(),
      label: newLabel,
      targetDate: target,
      color: colors[countdowns.length % colors.length]
    }
    setCountdowns([...countdowns, newItem])
    setNewLabel('')
    setNewDate('')
    setNewTime('00:00')
  }

  const deleteCountdown = (id: number) => {
    setCountdowns(countdowns.filter(c => c.id !== id))
  }

  const getTimeLeft = (target: Date) => {
    const now = new Date()
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, isOver: false }
  }

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
              <h1 className="text-2xl font-bold text-white">倒计时</h1>
            </div>
            <p className="text-[#94A3B8]">设置目标日期，实时显示倒计时</p>
          </div>

          {/* Add Countdown */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-white font-medium mb-4">添加倒计时</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="事件名称（如：春节）"
                className="px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                maxLength={20}
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
              />
            </div>
            <button
              onClick={addCountdown}
              disabled={!newLabel || !newDate}
              className="w-full py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加倒计时
            </button>
          </div>

          {/* Countdowns Grid */}
          {countdowns.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-[#475569]">还没有倒计时，点击上方添加</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {countdowns.map((cd) => {
                const timeLeft = getTimeLeft(cd.targetDate)
                return (
                  <div key={cd.id} className="glass-card p-6 relative">
                    <button
                      onClick={() => deleteCountdown(cd.id)}
                      className="absolute top-4 right-4 p-2 text-[#475569] hover:text-[#EF4444] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <h3 className="font-semibold text-white mb-2 pr-8">{cd.label}</h3>
                    <p className="text-xs text-[#475569] mb-4">
                      {cd.targetDate.toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                    {timeLeft.isOver ? (
                      <div className="text-center py-4">
                        <span className="text-2xl font-bold text-[#10B981]">已到达！</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          { value: timeLeft.days, label: '天' },
                          { value: timeLeft.hours, label: '时' },
                          { value: timeLeft.minutes, label: '分' },
                          { value: timeLeft.seconds, label: '秒' },
                        ].map((item) => (
                          <div key={item.label} className="bg-[#080B14] rounded-lg p-2">
                            <div className="text-2xl font-bold text-white">
                              {item.value.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs text-[#475569]">{item.label}</div>
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
      </main>

      <Footer />
    </div>
  )
}
