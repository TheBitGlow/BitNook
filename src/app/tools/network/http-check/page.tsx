'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Globe, ArrowRight, ShieldCheck, Clock, Server, AlertCircle, Copy, Check } from 'lucide-react'

interface CheckResult {
  status: number
  statusText: string
  durationMs: number
  resolvedIp?: string
  sizeBytes: number
  headers: { name: string; value: string }[]
  redirectLocation?: string
}

function getStatusBadge(status: number) {
  if (status >= 200 && status < 300) {
    return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', label: '正常' }
  }
  if (status >= 300 && status < 400) {
    return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40', label: '重定向' }
  }
  if (status >= 400 && status < 500) {
    return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', label: '客户端错误' }
  }
  return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', label: '服务器错误' }
}

export default function HTTPCheckPage() {
  const [urlInput, setUrlInput] = useState('https://www.google.com')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  const handleCheck = async () => {
    let clean = urlInput.trim()
    if (!clean) return

    setLoading(true)
    setErrorMsg('')
    setResult(null)

    try {
      const res = await fetch('/api/network/http-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: clean }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setErrorMsg(data.error || `检测失败 (HTTP ${res.status})`)
        setResult(null)
      } else {
        setResult(data)
      }
    } catch {
      setErrorMsg('网络通信失败，无法连接到 BitNook 检测服务')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <ToolLayout slug="http-check">
      <div className="space-y-6">
        {/* Search Input */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <label className="text-xs font-semibold text-slate-300 block">输入待检测的目标网站 URL</label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="例如: https://github.com 或 http://example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
            >
              <Globe className="w-4 h-4" />
              <span>{loading ? '正在发起安全检测...' : '检测 HTTP 状态'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>服务端严密部署 SSRF 防护网：严格阻断内网探测、本地回环、云元数据及 DNS 重绑定风险。</span>
          </div>
        </div>

        {/* Results Card */}
        {result && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-6 shadow-xl">
            {/* Overview Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                {(() => {
                  const badge = getStatusBadge(result.status)
                  return (
                    <div
                      className={`px-4 py-2 rounded-xl font-mono text-xl font-bold flex items-center gap-2 border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      <span>{result.status}</span>
                      <span className="text-xs font-sans font-normal opacity-90">{result.statusText}</span>
                    </div>
                  )
                })()}
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">HTTP 响应确认</span>
                  <span className="text-[11px] text-slate-400">来自真实服务端网络探针回传</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>响应耗时: {result.durationMs} ms</span>
                </div>
                {result.resolvedIp && (
                  <div className="flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>解析 IP: {result.resolvedIp}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Redirect Notice */}
            {result.redirectLocation && (
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-300 text-xs flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  重定向目标 (Location): <strong className="font-mono">{result.redirectLocation}</strong>
                </span>
              </div>
            )}

            {/* Response Headers Table */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-slate-200">目标服务器响应标头 (Response Headers)</h4>
                <span className="text-[11px] text-slate-400 font-mono">{result.headers.length} 项标头</span>
              </div>

              {result.headers.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3 w-1/3">标头名称 (Header)</th>
                        <th className="py-2.5 px-3">响应值 (Value)</th>
                        <th className="py-2.5 px-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {result.headers.map((h, i) => {
                        const isCopied = copiedKey === `hdr-${i}`
                        return (
                          <tr key={i} className="hover:bg-slate-900/40">
                            <td className="py-2 px-3 text-indigo-300 font-semibold">{h.name}</td>
                            <td className="py-2 px-3 text-slate-200 break-all">{h.value}</td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => copyToClipboard(h.value, `hdr-${i}`)}
                                className="text-slate-400 hover:text-white"
                                title="复制标头值"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2">未提取到公开响应标头</div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
