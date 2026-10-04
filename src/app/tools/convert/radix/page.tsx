'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Binary, ArrowRightLeft } from 'lucide-react'

export default function RadixPage() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState(10)
  const [toBase, setToBase] = useState(2)

  const conversions = useMemo(() => {
    if (!input) return null

    try {
      // Parse input based on source base
      let decimal: number

      // Handle hex with 0x prefix
      if (input.startsWith('0x') || input.startsWith('0X')) {
        decimal = parseInt(input, 16)
      } else if (input.startsWith('0b') || input.startsWith('0B')) {
        decimal = parseInt(input.slice(2), 2)
      } else if (input.startsWith('0o') || input.startsWith('0O')) {
        decimal = parseInt(input.slice(2), 8)
      } else {
        decimal = parseInt(input, fromBase)
      }

      if (isNaN(decimal)) return null

      return {
        decimal,
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        hex: decimal.toString(16).toUpperCase(),
      }
    } catch {
      return null
    }
  }, [input, fromBase])

  const handleSwap = () => {
    setFromBase(toBase)
    setToBase(fromBase)
    setInput('')
  }

  const getBasePrefix = (base: number) => {
    switch (base) {
      case 2: return '0b'
      case 8: return '0o'
      case 16: return '0x'
      default: return ''
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
                <Binary className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">进制转换</h1>
            </div>
            <p className="text-[#94A3B8]">2/8/10/16进制互相转换</p>
          </div>

          {/* Converter */}
          <div className="glass-card p-6">
            {/* From */}
            <div className="mb-4">
              <label className="block text-sm text-[#94A3B8] mb-2">从</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.toUpperCase())}
                  placeholder="输入数字"
                  className="flex-1 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white font-mono focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                />
                <select
                  value={fromBase}
                  onChange={(e) => { setFromBase(Number(e.target.value)); setInput('') }}
                  className="px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none"
                >
                  <option value={2}>BIN (2)</option>
                  <option value={8}>OCT (8)</option>
                  <option value={10}>DEC (10)</option>
                  <option value={16}>HEX (16)</option>
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-4">
              <button
                onClick={handleSwap}
                className="p-3 rounded-full bg-[#111827] border border-[rgba(99,102,241,0.3)] text-[#94A3B8] hover:text-white hover:border-[rgba(99,102,241,0.6)] transition-all"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            {conversions && (
              <div className="space-y-3">
                <div className="bg-[#080B14] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#475569] text-sm">十进制 (DEC)</span>
                    <span className="text-white font-mono">{conversions.decimal}</span>
                  </div>
                </div>

                <div className="bg-[#080B14] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#475569] text-sm">二进制 (BIN)</span>
                    <span className="text-[#10B981] font-mono">{getBasePrefix(2)}{conversions.binary}</span>
                  </div>
                </div>

                <div className="bg-[#080B14] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#475569] text-sm">八进制 (OCT)</span>
                    <span className="text-[#3B82F6] font-mono">{getBasePrefix(8)}{conversions.octal}</span>
                  </div>
                </div>

                <div className="bg-[#080B14] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#475569] text-sm">十六进制 (HEX)</span>
                    <span className="text-[#8B5CF6] font-mono">{getBasePrefix(16)}{conversions.hex}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-[#111827]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">支持前缀：</span>
              0x/0X (十六进制)、0b/0B (二进制)、0o/0O (八进制)，如 0xFF = 255
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
