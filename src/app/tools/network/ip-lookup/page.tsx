'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Search } from 'lucide-react'

export default function IPLookupPage() {
  const [ip, setIp] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const lookup = async () => {
    if (!ip.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`)
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: '查询失败' })
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
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">IP查询</h1>
            </div>
            <p className="text-[#94A3B8]">查询IP地址归属地信息</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="输入IP地址（如 8.8.8.8）"
                className="flex-1 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
              />
              <button
                onClick={lookup}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {loading ? '查询中...' : '查询'}
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="glass-card p-6">
              {result.error ? (
                <p className="text-[#EF4444]">{result.error}</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-[#080B14] rounded">
                    <span className="text-[#94A3B8]">IP地址</span>
                    <span className="text-white">{result.ip || ip}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#080B14] rounded">
                    <span className="text-[#94A3B8]">国家</span>
                    <span className="text-white">{result.country_name || '-'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#080B14] rounded">
                    <span className="text-[#94A3B8]">城市</span>
                    <span className="text-white">{result.city || '-'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#080B14] rounded">
                    <span className="text-[#94A3B8]">运营商</span>
                    <span className="text-white">{result.org || '-'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#080B14] rounded">
                    <span className="text-[#94A3B8]">时区</span>
                    <span className="text-white">{result.timezone || '-'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
