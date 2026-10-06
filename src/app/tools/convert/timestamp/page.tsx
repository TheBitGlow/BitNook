'use client'

import { useState, useEffect, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Play, Pause, Copy, Check, Clock, Calendar } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

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
      trackEvent('copy', { toolSlug: 'timestamp' })
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
      { label: '今日 00:00', ts: todayZero },
      { label: '明日 00:00', ts: todayZero + 86400 },
      { label: '+1 小时', ts: currentSec + 3600 },
      { label: '+1 天 (24h)', ts: currentSec + 86400 },
      { label: '+7 天 (1周)', ts: currentSec + 604800 },
      { label: '+30 天', ts: currentSec + 2592000 },
    ]
  }, [currentSec])

  const faq = [
    {
      question: '什么是 Unix 时间戳（Timestamp）？',
      answer:
        'Unix 时间戳是指自 UTC（协调世界时）1970 年 1 月 1 日 00:00:00 起经过的累计总秒数（或毫秒数），它与时区无关，是计算机与分布式数据库记录事件顺序的黄金标准。',
    },
    {
      question: '10 位时间戳和 13 位时间戳有什么差别？',
      answer:
        '10 位时间戳通常以秒 (s) 为计量单位；13 位时间戳则以毫秒 (ms) 为计量单位（JavaScript 的 Date.now() 即返回 13 位毫秒数值）。秒与毫秒之间相差 1000 倍。',
    },
    {
      question: '2038 年问题（Year 2038 problem）是什么？',
      answer:
        '在传统的 32 位有符号整数系统中，时间戳最大值为 2,147,483,647，将在北京时间 2038 年 1 月 19 日 11:14:07 发生溢出变为负数。现代 64 位系统已将上限延展至数十亿年之后。',
    },
  ]

  const howToSteps = [
    '查看顶部实时跳动的 Unix 秒级与毫秒级时间戳，可随时暂停或一键复制。',
    '在“时间戳转日期”输入框中粘贴 10 位或 13 位时间戳，系统自动识别并转换为北京时间与 ISO 8601 标准字符串。',
    '在“日期时间转时间戳”选择器中选定年月日与时分秒，即刻获取对应的秒级与毫秒级整型数值。',
    '利用快捷预设按钮可一键填充今日零点、明日或未来相对时间偏移量。',
  ]

  return (
    <ToolLayout
      toolSlug="timestamp"
      principlesTitle="Unix 时间戳定义与跨时区转换机制"
      principles={
        <>
          <p>
            <strong>1. 时间原点（Epoch）：</strong>
            所有 Unix 时间戳均以格林威治标准时间 1970-01-01 00:00:00 UTC 为零点基准开始递增计算。
          </p>
          <p>
            <strong>2. 本地时区偏移（Timezone Offset）：</strong>
            中国标准时间（CST）为 UTC+8，因此对应时间戳转换为北京时间时在 UTC 基础上自动加上 8 小时（28,800 秒）。
          </p>
          <p>
            <strong>3. 本地纯净运行：</strong>
            全站转换算法完全基于浏览器本地 V8 / JavaScript 引擎内置的 Date 对象高精度完成，绝不产生多余的网络往返开销。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
    >
      <div className="space-y-6">
        {/* Real-time Current Timestamp Card */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F1523] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-400">当前 Unix 时间戳 (秒 · 10位)</span>
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-wider tabular-nums">
              {currentSec || '------'}
            </div>
            <div className="text-xs text-slate-500 font-mono tabular-nums">
              毫秒 (13位): {currentSec ? currentSec * 1000 : '------'}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsLiveRunning(!isLiveRunning)}
              className="px-3.5 py-2 rounded-xl bg-[#141C2E] hover:bg-[#1A243B] border border-[#1E293B] text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
            >
              {isLiveRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isLiveRunning ? '暂停实时刷新' : '恢复实时刷新'}</span>
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(currentSec.toString(), 'live-sec')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm"
            >
              {copiedKey === 'live-sec' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>复制当前秒级时间戳</span>
            </button>
          </div>
        </div>

        {/* Section 1: Timestamp to Date */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F1523] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>时间戳 转换为 北京时间 / UTC</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setInputTs(currentSec.toString())
                setTsUnit('s')
              }}
              className="text-xs text-blue-400 hover:text-blue-300 transition font-medium"
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
              className="w-full px-4 py-2.5 bg-[#090D16] border border-[#1E293B] rounded-xl text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
            <select
              value={tsUnit}
              onChange={(e) => setTsUnit(e.target.value as 's' | 'ms')}
              className="px-3 py-2.5 bg-[#090D16] border border-[#1E293B] rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="s">秒 (s)</option>
              <option value="ms">毫秒 (ms)</option>
            </select>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-400">
            <span className="text-[11px] text-slate-500 mr-1">快捷偏移:</span>
            {quickPresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputTs(p.ts.toString())
                  setTsUnit('s')
                }}
                className="px-2.5 py-1 rounded-lg bg-[#141C2E] border border-[#1E293B] hover:border-slate-700 text-slate-300 text-xs font-mono transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Result Matrix */}
          {tsConversion ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-1">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>本地时间 (Local)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(tsConversion.local, 'res-local')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {copiedKey === 'res-local' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'res-local' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="font-mono text-sm text-emerald-400 font-bold tabular-nums">{tsConversion.local}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-1">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>ISO 8601 标准时间</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(tsConversion.iso, 'res-iso')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {copiedKey === 'res-iso' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'res-iso' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-200 truncate tabular-nums">{tsConversion.iso}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-1 font-mono">请输入有效的时间戳数值查看对应时间格式</div>
          )}
        </div>

        {/* Section 2: Date to Timestamp */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F1523] p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>日期时间 转换为 Unix 时间戳</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">选择日期与时间</label>
              <input
                type="datetime-local"
                step="1"
                value={inputDateStr}
                onChange={(e) => setInputDateStr(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#090D16] border border-[#1E293B] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {dateConversion && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>秒 (10位)</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(dateConversion.sec.toString(), 'd-sec')}
                      className="text-blue-400 hover:text-blue-300"
                      aria-label="Copy seconds"
                    >
                      {copiedKey === 'd-sec' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-sm font-bold text-white tabular-nums">{dateConversion.sec}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>毫秒 (13位)</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(dateConversion.ms.toString(), 'd-ms')}
                      className="text-blue-400 hover:text-blue-300"
                      aria-label="Copy milliseconds"
                    >
                      {copiedKey === 'd-ms' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-sm font-bold text-blue-300 truncate tabular-nums">{dateConversion.ms}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
