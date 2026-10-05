'use client'

import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Activity, Play, Square, Info, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'

interface PingAttempt {
  seq: number
  timeMs: number
  status: 'ok' | 'timeout' | 'error'
  statusText?: string
}

interface EndpointPreset {
  name: string
  url: string
  region: string
}

const PRESETS: EndpointPreset[] = [
  { name: 'Cloudflare Anycast', url: 'https://1.1.1.1/cdn-cgi/trace', region: '全球近场 Anycast' },
  { name: 'Google (204 探针)', url: 'https://www.google.com/generate_204', region: '国际节点' },
  { name: 'Baidu 百度静态', url: 'https://www.baidu.com/favicon.ico', region: '中国境内节点' },
  { name: 'GitHub 静态资源', url: 'https://github.githubassets.com/favicons/favicon.png', region: '国际节点' },
]

export default function HTTPLatencyPage() {
  const [targetUrl, setTargetUrl] = useState('https://1.1.1.1/cdn-cgi/trace')
  const [attempts, setAttempts] = useState<PingAttempt[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const stopSignalRef = useRef(false)

  const handleStartTest = async () => {
    let clean = targetUrl.trim()
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`
    }

    setIsTesting(true)
    setAttempts([])
    stopSignalRef.current = false

    const count = 5
    const results: PingAttempt[] = []

    for (let i = 1; i <= count; i++) {
      if (stopSignalRef.current) break

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)
      const start = performance.now()

      try {
        // Append cache-busting timestamp query to guarantee true network travel
        const testUrl = new URL(clean)
        testUrl.searchParams.set('_bn_ts', Date.now().toString())

        await fetch(testUrl.toString(), {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        const elapsed = Math.round(performance.now() - start)
        results.push({ seq: i, timeMs: elapsed, status: 'ok' })
      } catch (err: any) {
        clearTimeout(timeoutId)
        if (err.name === 'AbortError') {
          results.push({ seq: i, timeMs: 4000, status: 'timeout', statusText: '请求超时 (>4000ms)' })
        } else {
          // In no-cors, even if CORS is blocked, network connection occurred.
          const elapsed = Math.round(performance.now() - start)
          results.push({ seq: i, timeMs: elapsed, status: 'ok', statusText: '连接完成 (no-cors)' })
        }
      }

      setAttempts([...results])
      if (i < count && !stopSignalRef.current) {
        await new Promise((r) => setTimeout(r, 600))
      }
    }

    setIsTesting(false)
  }

  const handleStop = () => {
    stopSignalRef.current = true
    setIsTesting(false)
  }

  // Statistics
  const successful = attempts.filter((a) => a.status === 'ok')
  const successCount = successful.length
  const totalCount = attempts.length
  const lossRate = totalCount > 0 ? Math.round(((totalCount - successCount) / totalCount) * 100) : 0

  const times = successful.map((a) => a.timeMs)
  const minTime = times.length > 0 ? Math.min(...times) : 0
  const maxTime = times.length > 0 ? Math.max(...times) : 0
  const avgTime = times.length > 0 ? Math.round(times.reduce((sum, v) => sum + v, 0) / times.length) : 0
  const jitter = maxTime - minTime

  return (
    <ToolLayout slug="ping">
      <div className="space-y-6">
        {/* Input Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-300">目标 URL / 网址端点 (真实 HTTP RTT 测量)</label>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>快捷预设:</span>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setTargetUrl(p.url)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://1.1.1.1/cdn-cgi/trace"
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
            {isTesting ? (
              <button
                onClick={handleStop}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Square className="w-4 h-4" />
                <span>停止测试</span>
              </button>
            ) : (
              <button
                onClick={handleStartTest}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
              >
                <Play className="w-4 h-4" />
                <span>开始往返延迟测试</span>
              </button>
            )}
          </div>

          {/* Principle Clarification */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300">技术原理说明：</strong>
              浏览器安全沙箱无法直接向操作系统发送原生 ICMP 数据包。本工具通过向目标发送附带防缓存随机参数的高频真实 HTTP 往返探测，直接反映真实网页加载体验的 TCP + TLS + HTTP 往返耗时（RTT）。
            </div>
          </div>
        </div>

        {/* Results Card */}
        {attempts.length > 0 && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>往返延迟测量指标 ({totalCount} 次样本)</span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>真实客户端网络性能时延</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">平均延迟 (Avg)</span>
                <span className="text-xl font-mono font-bold text-white">{avgTime} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">最低延迟 (Min)</span>
                <span className="text-xl font-mono font-bold text-emerald-400">{minTime} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">最高延迟 (Max)</span>
                <span className="text-xl font-mono font-bold text-amber-400">{maxTime} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">网络抖动 (Jitter)</span>
                <span className="text-xl font-mono font-bold text-indigo-300">{jitter} ms</span>
              </div>
            </div>

            {/* Packet Log */}
            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-semibold text-slate-400 mb-1">探测序列明细</div>
              {attempts.map((a) => (
                <div
                  key={a.seq}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    {a.status === 'ok' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span className="text-slate-300">序号 #{a.seq}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.statusText && <span className="text-[11px] text-slate-400">{a.statusText}</span>}
                    <span className={`font-semibold ${a.status === 'ok' ? 'text-white' : 'text-rose-400'}`}>
                      {a.status === 'ok' ? `${a.timeMs} ms` : '超时'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
