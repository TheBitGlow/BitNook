'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Radio } from 'lucide-react'

interface PingResult {
  seq: number
  time: number
  status: 'success' | 'timeout' | 'error'
}

export default function PingPage() {
  const [host, setHost] = useState('google.com')
  const [results, setResults] = useState<PingResult[]>([])
  const [isPinging, setIsPinging] = useState(false)
  const [stats, setStats] = useState<{ sent: number; received: number; loss: number; avg: number } | null>(null)

  const startPing = async () => {
    setIsPinging(true)
    setResults([])
    setStats(null)

    const seqs = [1, 2, 3, 4, 5]
    const newResults: PingResult[] = []

    for (const seq of seqs) {
      if (!isPinging) break

      await new Promise(r => setTimeout(r, 500))

      // Simulate ping
      const latency = Math.random() * 100 + 20
      newResults.push({
        seq,
        time: Math.round(latency * 100) / 100,
        status: Math.random() > 0.1 ? 'success' : 'timeout'
      })
      setResults([...newResults])

      if (seq === seqs[seqs.length - 1]) {
        const sent = newResults.length
        const received = newResults.filter(r => r.status === 'success').length
        const loss = ((sent - received) / sent * 100).toFixed(0)
        const avgTime = newResults.filter(r => r.status === 'success').reduce((sum, r) => sum + r.time, 0) / received

        setStats({
          sent,
          received,
          loss: parseFloat(loss),
          avg: Math.round(avgTime * 100) / 100
        })
        setIsPinging(false)
      }
    }
  }

  const stopPing = () => {
    setIsPinging(false)
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
                <Radio className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">Ping测试</h1>
            </div>
            <p className="text-[#94A3B8]">测试网络延迟</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="输入主机或IP地址"
                className="flex-1 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
              />
              {!isPinging ? (
                <button
                  onClick={startPing}
                  className="px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-white font-medium hover:opacity-90"
                >
                  开始
                </button>
              ) : (
                <button
                  onClick={stopPing}
                  className="px-6 py-3 bg-[#EF4444] rounded-xl text-white font-medium hover:opacity-90"
                >
                  停止
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="glass-card p-6 mb-6">
              <h3 className="text-white font-medium mb-4">测试结果</h3>
              <div className="space-y-1 font-mono text-sm">
                {results.map((r, i) => (
                  <div key={i} className={`p-2 rounded ${r.status === 'success' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {r.status === 'success'
                      ? `seq=${r.seq} time=${r.time} ms`
                      : `seq=${r.seq} Request timeout`
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">统计信息</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-[#94A3B8]">发送</p>
                  <p className="text-xl font-bold text-white">{stats.sent}</p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">接收</p>
                  <p className="text-xl font-bold text-[#10B981]">{stats.received}</p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">丢包率</p>
                  <p className="text-xl font-bold text-[#EF4444]">{stats.loss}%</p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">平均延迟</p>
                  <p className="text-xl font-bold text-[#3B82F6]">{stats.avg}ms</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
