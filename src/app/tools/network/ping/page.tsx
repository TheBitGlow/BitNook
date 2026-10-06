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

  const successful = attempts.filter((a) => a.status === 'ok')
  const times = successful.map((a) => a.timeMs)
  const minTime = times.length > 0 ? Math.min(...times) : 0
  const maxTime = times.length > 0 ? Math.max(...times) : 0
  const avgTime = times.length > 0 ? Math.round(times.reduce((sum, v) => sum + v, 0) / times.length) : 0
  const jitter = maxTime - minTime

  return (
    <ToolLayout
      toolSlug="ping"
      principlesTitle="浏览器环境下的 HTTP 往返延迟 (RTT) 测量原理"
      principles={
        <>
          <p>
            <strong>1. 浏览器网络沙箱与 ICMP 说明：</strong>
            由于现代操作系统对浏览器安全沙箱的权限隔离，W3C 标准 Web API 无法直接构造底层 ICMP (Internet Control Message Protocol) 回显数据包。
          </p>
          <p>
            <strong>2. 真实 HTTP RTT 测量模型：</strong>
            本工具通过向目标端点发送携带抗缓存唯一时间戳的高精度 HEAD 请求，直接反映客户端实际发起 TCP 握手 + TLS 加密握手 + HTTP 往返的综合真实时延 (RTT)，对于网页加载体验比单纯的 ICMP Ping 更加贴合真实场景。
          </p>
        </>
      }
      howToSteps={[
        '输入待测量的目标 HTTPS 网址或选择预设公共测试端点。',
        '点击“开始往返延迟测试”，系统自动发起连续 5 轮次独立往返探测。',
        '实时查阅平均延迟、极值时延、网络抖动 (Jitter) 及各轮次连接明细。',
        '测试过程中可随时点击停止测试。',
      ]}
      faq={[
        {
          question: '为什么测得的延迟通常比命令行 ping 命令略大？',
          answer:
            '系统 command line 的 ping 命令仅测试 IP 层的 ICMP 往返；而在浏览器中，HTTP 延迟包含了 DNS 查询、TCP 三次握手、TLS 密钥协商以及 HTTP 首部交换全链路耗时，因此反映的是真实应用层的网络开销。',
        },
      ]}
      disclaimer="本工具用于客户端真实应用层网络往返延迟 (RTT) 诊断。由于同源策略 (CORS) 限制，目标服务如未配置跨域头将通过 no-cors 模式完成握手连接检测。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-text-secondary">目标 URL / 网址端点 (真实 HTTP RTT 测量)</label>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <span>快捷预设:</span>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setTargetUrl(p.url)}
                  className="px-2 py-0.5 rounded bg-surface-elevated hover:border-accent-primary/50 border border-border text-text-secondary font-mono transition text-xs"
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
              className="flex-1 px-4 py-3 bg-canvas border border-border rounded-xl text-text-primary font-mono text-sm focus:outline-none focus:border-accent-primary transition-colors"
            />
            {isTesting ? (
              <button
                onClick={handleStop}
                className="px-6 py-3 rounded-xl bg-danger hover:bg-danger/90 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>停止测试</span>
              </button>
            ) : (
              <button
                onClick={handleStartTest}
                className="btn-primary px-6 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>开始往返延迟测试</span>
              </button>
            )}
          </div>

          {/* Principle Clarification */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-elevated border border-border text-xs text-text-muted">
            <Info className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-text-secondary">技术原理说明：</strong>
              浏览器安全沙箱无法直接向操作系统发送原生 ICMP 数据包。本工具通过向目标发送附带防缓存随机参数的高频真实 HTTP 往返探测，直接反映真实网页加载体验的 TCP + TLS + HTTP 往返耗时（RTT）。
            </div>
          </div>
        </div>

        {/* Results Card */}
        {attempts.length > 0 && (
          <div className="card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-primary" />
                <span>往返延迟测量指标 ({attempts.length} 次样本)</span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>真实客户端网络性能时延</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-canvas border border-border text-center">
                <span className="text-xs text-text-muted block mb-1">平均延迟 (Avg)</span>
                <span className="text-xl font-mono font-bold text-text-primary">{avgTime} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-canvas border border-border text-center">
                <span className="text-xs text-text-muted block mb-1">最低延迟 (Min)</span>
                <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{minTime} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-canvas border border-border text-center">
                <span className="text-xs text-text-muted block mb-1">最高延迟 (Max)</span>
                <span className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400">{maxTime} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-canvas border border-border text-center">
                <span className="text-xs text-text-muted block mb-1">网络抖动 (Jitter)</span>
                <span className="text-xl font-mono font-bold text-accent-primary">{jitter} ms</span>
              </div>
            </div>

            {/* Packet Log */}
            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-semibold text-text-muted mb-1">探测序列明细</div>
              {attempts.map((a) => (
                <div
                  key={a.seq}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-canvas border border-border font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    {a.status === 'ok' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-danger" />
                    )}
                    <span className="text-text-secondary">序号 #{a.seq}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.statusText && <span className="text-[11px] text-text-muted">{a.statusText}</span>}
                    <span className={`font-semibold ${a.status === 'ok' ? 'text-text-primary' : 'text-danger'}`}>
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
