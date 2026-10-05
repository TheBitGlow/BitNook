'use client'

import { useState, useEffect, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Play, Pause, Copy, Check, Clock, Calendar, ArrowRightLeft } from 'lucide-react'

function formatDateTime(date: Date, timeZone?: string): string {
  try {
    return date.toLocaleString('zh-CN', {
      timeZone: timeZone || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch {
    return '无效日期'
  }
}

export default function TimestampPage() {
  const [currentSec, setCurrentSec] = useState<number>(() => Math.floor(Date.now() / 1000))
  const [isLiveRunning, setIsLiveRunning] = useState<boolean>(true)

  // Bidirectional Convert A: Timestamp -> Date
  const [inputTs, setInputTs] = useState<string>(() => Math.floor(Date.now() / 1000).toString())
  const [tsUnit, setTsUnit] = useState<'s' | 'ms'>('s')

  // Bidirectional Convert B: Date -> Timestamp
  const [inputDateStr, setInputDateStr] = useState<string>(() => {
    const d = new Date()
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19)
  })

  const [copiedKey, setCopiedKey] = useState<string>('')

  // Live ticking interval
  useEffect(() => {
    if (!isLiveRunning) return
    const interval = setInterval(() => {
      setCurrentSec(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isLiveRunning])

  // Conversion Results for Timestamp -> Date
  const tsConversion = useMemo(() => {
    const raw = inputTs.trim()
    if (!raw) return null
    const num = Number(raw)
    if (isNaN(num)) return null

    const ms = tsUnit === 's' ? num * 1000 : num
    const date = new Date(ms)
    if (isNaN(date.getTime())) return null

    return {
      local: formatDateTime(date),
      utc: date.toUTCString(),
      iso: date.toISOString(),
      timestampSec: Math.floor(ms / 1000),
      timestampMs: ms,
    }
  }, [inputTs, tsUnit])

  // Conversion Results for Date -> Timestamp
  const dateConversion = useMemo(() => {
    if (!inputDateStr) return null
    const date = new Date(inputDateStr)
    if (isNaN(date.getTime())) return null

    const ms = date.getTime()
    return {
      sec: Math.floor(ms / 1000),
      ms,
      utc: date.toUTCString(),
      iso: date.toISOString(),
    }
  }, [inputDateStr])

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      // ignore
    }
  }

  // Common quick offsets from current time
  const quickPresets = useMemo(() => {
    if (!currentSec) return []
    const nowMs = currentSec * 1000
    const todayZero = new Date(new Date(nowMs).setHours(0, 0, 0, 0)).getTime() / 1000
    return [
      { label: '今日 00:00:00', ts: todayZero },
      { label: '明日 00:00:00', ts: todayZero + 86400 },
      { label: '+1 小时', ts: currentSec + 3600 },
      { label: '+1 天 (24h)', ts: currentSec + 86400 },
      { label: '+7 天 (1周)', ts: currentSec + 604800 },
      { label: '+30 天', ts: currentSec + 2592000 },
    ]
  }, [currentSec])

  return (
    <ToolLayout slug="timestamp">
      <div className="space-y-6">
        {/* Real-time Current Timestamp Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-semibold text-slate-300">当前 Unix 时间戳 (秒 · 10位)</span>
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-wider">
              {currentSec || '------'}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              毫秒 (13位): {currentSec ? currentSec * 1000 : '------'}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsLiveRunning(!isLiveRunning)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
            >
              {isLiveRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveRunning ? '暂停实时刷新' : '恢复实时刷新'}</span>
            </button>
            <button
              onClick={() => copyToClipboard(currentSec.toString(), 'live-sec')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-indigo-600/20"
            >
              {copiedKey === 'live-sec' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>复制当前秒级时间戳</span>
            </button>
          </div>
        </div>

        {/* Section 1: Timestamp to Date */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>时间戳 转换为 北京时间 / UTC</span>
            </h3>
            <button
              onClick={() => {
                setInputTs(currentSec.toString())
                setTsUnit('s')
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              填入当前时间
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr,120px] gap-3">
            <input
              type="number"
              value={inputTs}
              onChange={(e) => setInputTs(e.target.value)}
              placeholder="输入 10 位秒或 13 位毫秒时间戳"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
            <select
              value={tsUnit}
              onChange={(e) => setTsUnit(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="s">秒 (s)</option>
              <option value="ms">毫秒 (ms)</option>
            </select>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span>快捷预设:</span>
            {quickPresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputTs(p.ts.toString())
                  setTsUnit('s')
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Result Matrix */}
          {tsConversion ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>本地时间 (Local)</span>
                  <button
                    onClick={() => copyToClipboard(tsConversion.local, 'res-local')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedKey === 'res-local' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'res-local' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="font-mono text-sm text-emerald-400 font-semibold">{tsConversion.local}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>ISO 8601 国际标准时间</span>
                  <button
                    onClick={() => copyToClipboard(tsConversion.iso, 'res-iso')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedKey === 'res-iso' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'res-iso' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-200 truncate">{tsConversion.iso}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-2">请输入有效的时间戳数值查看对应时间格式</div>
          )}
        </div>

        {/* Section 2: Date to Timestamp */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>日期时间 转换为 Unix 时间戳</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">选择日期与时间</label>
              <input
                type="datetime-local"
                step="1"
                value={inputDateStr}
                onChange={(e) => setInputDateStr(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {dateConversion && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>秒 (10位)</span>
                    <button
                      onClick={() => copyToClipboard(dateConversion.sec.toString(), 'd-sec')}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedKey === 'd-sec' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-sm font-bold text-white">{dateConversion.sec}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>毫秒 (13位)</span>
                    <button
                      onClick={() => copyToClipboard(dateConversion.ms.toString(), 'd-ms')}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedKey === 'd-ms' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-sm font-bold text-indigo-300 truncate">{dateConversion.ms}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
