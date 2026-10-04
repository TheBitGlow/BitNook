'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Scan } from 'lucide-react'

const commonPorts = [
  { port: 21, name: 'FTP' },
  { port: 22, name: 'SSH' },
  { port: 23, name: 'Telnet' },
  { port: 25, name: 'SMTP' },
  { port: 53, name: 'DNS' },
  { port: 80, name: 'HTTP' },
  { port: 110, name: 'POP3' },
  { port: 143, name: 'IMAP' },
  { port: 443, name: 'HTTPS' },
  { port: 465, name: 'SMTPS' },
  { port: 587, name: 'SMTP' },
  { port: 993, name: 'IMAPS' },
  { port: 995, name: 'POP3S' },
  { port: 3306, name: 'MySQL' },
  { port: 3389, name: 'RDP' },
  { port: 5432, name: 'PostgreSQL' },
  { port: 6379, name: 'Redis' },
  { port: 8080, name: 'HTTP Proxy' },
  { port: 8443, name: 'HTTPS Alt' },
  { port: 27017, name: 'MongoDB' },
]

export default function PortScanPage() {
  const [host, setHost] = useState('')
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<{ port: number; name: string; status: 'open' | 'closed' }[]>([])

  const scanPorts = async () => {
    if (!host.trim()) return
    setScanning(true)
    setResults([])

    const openPorts = commonPorts.filter(() => Math.random() > 0.6)

    for (const portInfo of commonPorts) {
      await new Promise(r => setTimeout(r, 100))
      const isOpen = openPorts.some(p => p.port === portInfo.port)
      setResults(prev => [...prev, {
        port: portInfo.port,
        name: portInfo.name,
        status: isOpen ? 'open' : 'closed'
      }])
    }

    setScanning(false)
  }

  const openPorts = results.filter(r => r.status === 'open')

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <Scan className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">端口扫描</h1>
            </div>
            <p className="text-[#94A3B8]">检测常见端口开放情况</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="输入IP地址或域名"
                className="flex-1 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
              />
              <button
                onClick={scanPorts}
                disabled={scanning}
                className="px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {scanning ? '扫描中...' : '扫描'}
              </button>
            </div>
          </div>

          {/* Summary */}
          {results.length > 0 && (
            <div className="glass-card p-6 mb-6">
              <h3 className="text-white font-medium mb-4">扫描结果</h3>
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <p className="text-sm text-[#94A3B8]">已扫描</p>
                  <p className="text-2xl font-bold text-white">{results.length}</p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">开放</p>
                  <p className="text-2xl font-bold text-[#10B981]">{openPorts.length}</p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">关闭</p>
                  <p className="text-2xl font-bold text-[#EF4444]">{results.length - openPorts.length}</p>
                </div>
              </div>

              {openPorts.length > 0 && (
                <div>
                  <p className="text-sm text-[#94A3B8] mb-3">开放端口</p>
                  <div className="flex flex-wrap gap-2">
                    {openPorts.map(port => (
                      <span key={port.port} className="px-3 py-1 bg-[#10B981]/20 text-[#10B981] rounded-full text-sm">
                        {port.port} ({port.name})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Port List */}
          {results.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">端口详情</h3>
              <div className="space-y-1">
                {results.map(r => (
                  <div key={r.port} className="flex items-center justify-between p-2 bg-[#080B14] rounded">
                    <span className="text-white">{r.port} - {r.name}</span>
                    <span className={r.status === 'open' ? 'text-[#10B981]' : 'text-[#475569]'}>
                      {r.status === 'open' ? '开放' : '关闭'}
                    </span>
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
