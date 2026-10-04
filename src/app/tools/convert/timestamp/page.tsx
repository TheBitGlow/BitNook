'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Clock3, Copy, Check } from 'lucide-react'

export default function TimestampPage() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000))
  const [dateInput, setDateInput] = useState('')
  const [copied, setCopied] = useState('')
  const [currentTimestamp, setCurrentTimestamp] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const convertToDate = (ts: number) => {
    try {
      const date = new Date(ts * 1000)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    } catch {
      return '无效时间戳'
    }
  }

  const convertToTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return Math.floor(date.getTime() / 1000)
    } catch {
      return 0
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const commonTimestamps = [
    { label: '今天 0点', ts: Math.floor(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000) },
    { label: '明天 0点', ts: Math.floor(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000) + 86400 },
    { label: '1小时后', ts: currentTimestamp + 3600 },
    { label: '1天后', ts: currentTimestamp + 86400 },
    { label: '1周后', ts: currentTimestamp + 604800 },
    { label: '1月后', ts: currentTimestamp + 2592000 },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Clock3 className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h1 className="text-2xl font-bold text-white">时间戳转换</h1>
            </div>
            <p className="text-[#94A3B8]">Unix 时间戳与日期时间互转</p>
          </div>

          {/* Current Timestamp */}
          <div className="glass-card p-6 mb-6 text-center">
            <p className="text-sm text-[#94A3B8] mb-2">当前时间戳（秒）</p>
            <p className="text-4xl font-mono font-bold text-[#6366F1]">{currentTimestamp}</p>
          </div>

          {/* Converter */}
          <div className="glass-card p-6 mb-6">
            {/* Timestamp to Date */}
            <div className="mb-6">
              <label className="block text-sm text-[#94A3B8] mb-2">时间戳（秒）</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={timestamp}
                  onChange={(e) => setTimestamp(Number(e.target.value))}
                  className="flex-1 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white font-mono focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                />
                <button
                  onClick={() => copyToClipboard(timestamp.toString(), 'ts')}
                  className="p-3 bg-[#111827] border border-[rgba(99,102,241,0.15)] rounded-xl text-[#94A3B8] hover:text-white"
                >
                  {copied === 'ts' ? <Check className="w-5 h-5 text-[#10B981]" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-[#475569]">
                = {convertToDate(timestamp)}
              </p>
            </div>

            {/* Date to Timestamp */}
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">日期时间</label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                />
                <button
                  onClick={() => copyToClipboard(convertToTimestamp(dateInput).toString(), 'date')}
                  className="p-3 bg-[#111827] border border-[rgba(99,102,241,0.15)] rounded-xl text-[#94A3B8] hover:text-white"
                >
                  {copied === 'date' ? <Check className="w-5 h-5 text-[#10B981]" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {dateInput && (
                <p className="mt-2 text-sm text-[#475569]">
                  = {convertToTimestamp(dateInput)} 秒
                </p>
              )}
            </div>
          </div>

          {/* Common Timestamps */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">常用时间戳</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonTimestamps.map(item => (
                <button
                  key={item.label}
                  onClick={() => setTimestamp(item.ts)}
                  className="p-3 bg-[#080B14] rounded-lg text-left hover:bg-[#1A2235] transition-colors"
                >
                  <div className="text-sm text-[#94A3B8]">{item.label}</div>
                  <div className="text-white font-mono">{item.ts}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
