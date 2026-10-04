'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Database } from 'lucide-react'

export default function DNSPage() {
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState<{ type: string; value: string }[]>([])
  const [loading, setLoading] = useState(false)

  const queryDNS = async () => {
    if (!domain.trim()) return
    setLoading(true)
    setResult([])

    const types = ['A', 'AAAA', 'CNAME', 'MX', 'TXT']
    const results: { type: string; value: string }[] = []

    try {
      for (const type of types) {
        try {
          const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`)
          const data = await res.json()
          if (data.Answer) {
            data.Answer.forEach((ans: any) => {
              results.push({ type, value: ans.data })
            })
          }
        } catch {
          // Skip failed queries
        }
      }
      setResult(results)
    } catch {
      setResult([{ type: 'error', value: '查询失败' }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">DNS查询</h1>
            </div>
            <p className="text-[#94A3B8]">查询域名的DNS记录</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="输入域名（如 example.com）"
                className="flex-1 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
              />
              <button
                onClick={queryDNS}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {loading ? '查询中...' : '查询'}
              </button>
            </div>
          </div>

          {/* Result */}
          {result.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">DNS记录</h3>
              <div className="space-y-2">
                {result.map((r, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-[#080B14] rounded">
                    <span className="px-2 py-1 bg-[#6366F1]/20 text-[#6366F1] text-xs rounded">
                      {r.type}
                    </span>
                    <span className="text-white font-mono text-sm break-all">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
