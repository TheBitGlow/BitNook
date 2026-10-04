'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Timer } from 'lucide-react'

export default function StopwatchPage() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<{ time: number; lapTime: number }[]>([])
  const [bestLap, setBestLap] = useState<number | null>(null)
  const [worstLap, setWorstLap] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(t => t + 10)
      }, 10)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const centiseconds = Math.floor((ms % 1000) / 10)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }

  const handleStartStop = () => {
    setIsRunning(!isRunning)
  }

  const handleLap = () => {
    if (!isRunning) return

    const lastLapTime = laps.length > 0 ? laps[laps.length - 1].time : 0
    const lapTime = time - lastLapTime

    setLaps([...laps, { time, lapTime }])

    if (bestLap === null || lapTime < bestLap) setBestLap(lapTime)
    if (worstLap === null || lapTime > worstLap) setWorstLap(lapTime)
  }

  const handleReset = () => {
    setTime(0)
    setIsRunning(false)
    setLaps([])
    setBestLap(null)
    setWorstLap(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Timer className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">秒表</h1>
            </div>
            <p className="text-[#94A3B8]">毫秒精度，多圈记录</p>
          </div>

          {/* Time Display */}
          <div className="glass-card p-12 text-center mb-6">
            <p className="text-6xl font-mono font-bold text-white tracking-wider">
              {formatTime(time)}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={handleStartStop}
              className={`px-8 py-4 rounded-xl font-medium text-lg ${
                isRunning
                  ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                  : 'bg-[#10B981] text-white hover:bg-[#059669]'
              }`}
            >
              {isRunning ? '暂停' : '开始'}
            </button>
            <button
              onClick={handleLap}
              disabled={!isRunning}
              className="px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-medium text-lg hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              计次
            </button>
            <button
              onClick={handleReset}
              disabled={time === 0 && !isRunning}
              className="px-8 py-4 bg-[#111827] border border-[rgba(99,102,241,0.3)] text-[#94A3B8] rounded-xl font-medium text-lg hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              重置
            </button>
          </div>

          {/* Laps */}
          {laps.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">计次记录</h3>
                {bestLap !== null && (
                  <div className="flex gap-4 text-sm">
                    <span className="text-[#10B981]">最快: {formatTime(bestLap)}</span>
                    <span className="text-[#EF4444]">最慢: {formatTime(worstLap || 0)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-3 text-sm text-[#475569] border-b border-[rgba(99,102,241,0.1)] pb-2">
                  <span>计次</span>
                  <span className="text-right">单圈时间</span>
                  <span className="text-right">累计时间</span>
                </div>
                {[...laps].reverse().map((lap, i, arr) => {
                  const lapIndex = arr.length - i
                  const isBest = lap.lapTime === bestLap
                  const isWorst = lap.lapTime === worstLap
                  return (
                    <div
                      key={lapIndex}
                      className={`grid grid-cols-3 text-sm py-2 border-b border-[rgba(99,102,241,0.05)] ${
                        isBest ? 'text-[#10B981]' : isWorst ? 'text-[#EF4444]' : 'text-[#94A3B8]'
                      }`}
                    >
                      <span>{lapIndex}</span>
                      <span className="text-right font-mono">{formatTime(lap.lapTime)}</span>
                      <span className="text-right font-mono">{formatTime(lap.time)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-[#111827]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">快捷键：</span>
              空格键 开始/暂停，L键 计次，R键 重置
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
