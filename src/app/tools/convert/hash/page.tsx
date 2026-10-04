'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Shield } from 'lucide-react'

type HashAlgorithm = 'sha256' | 'sha512' | 'sha3-256' | 'sha3-512'

const algorithms: { name: string; value: HashAlgorithm; webapiName: string }[] = [
  { name: 'SHA-256', value: 'sha256', webapiName: 'SHA-256' },
  { name: 'SHA-512', value: 'sha512', webapiName: 'SHA-512' },
  { name: 'SHA3-256', value: 'sha3-256', webapiName: 'SHA3-256' },
  { name: 'SHA3-512', value: 'sha3-512', webapiName: 'SHA3-512' },
]

async function hashWithWebAPI(text: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  return hashWithWebAPI(text, algorithm.toUpperCase())
}

export default function HashPage() {
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('sha256')
  const [hashResult, setHashResult] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState('')

  const calculateHash = async () => {
    if (!input.trim()) {
      setHashResult('')
      setError('')
      return
    }
    setIsCalculating(true)
    setError('')
    try {
      const result = await hashText(input, algorithm)
      setHashResult(result)
    } catch (e) {
      setError('计算失败，请稍后重试')
      setHashResult('')
    }
    setIsCalculating(false)
  }

  const copyHash = () => {
    if (hashResult) {
      navigator.clipboard.writeText(hashResult)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">哈希计算器</h1>
            </div>
            <p className="text-[#94A3B8]">文本哈希加密计算（使用浏览器原生 API）</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm text-[#94A3B8] mb-2">输入文本</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入需要哈希的文本..."
                className="w-full h-32 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white resize-none placeholder:text-[#475569]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-[#94A3B8] mb-2">哈希算法</label>
              <div className="grid grid-cols-2 gap-2">
                {algorithms.map(algo => (
                  <button
                    key={algo.value}
                    onClick={() => setAlgorithm(algo.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      algorithm === algo.value
                        ? 'bg-[#6366F1] text-white'
                        : 'bg-[#080B14] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {algo.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={calculateHash}
              disabled={isCalculating}
              className="w-full py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isCalculating ? '计算中...' : '计算哈希'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="glass-card p-6 border border-[#EF4444]/30 mb-6">
              <p className="text-[#EF4444] text-center">{error}</p>
            </div>
          )}

          {/* Result */}
          {hashResult && !error && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[#94A3B8]">哈希结果 ({algorithm.toUpperCase()})</p>
                <button
                  onClick={copyHash}
                  className="text-xs text-[#6366F1] hover:text-[#818CF8]"
                >
                  复制
                </button>
              </div>
              <p className="text-white font-mono text-sm break-all bg-[#080B14] p-4 rounded-lg">
                {hashResult}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
