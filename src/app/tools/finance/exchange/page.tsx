'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { DollarSign } from 'lucide-react'

const currencies = [
  { code: 'CNY', name: '人民币', symbol: '¥', rate: 1 },
  { code: 'USD', name: '美元', symbol: '$', rate: 7.24 },
  { code: 'EUR', name: '欧元', symbol: '€', rate: 7.85 },
  { code: 'GBP', name: '英镑', symbol: '£', rate: 9.12 },
  { code: 'JPY', name: '日元', symbol: '¥', rate: 0.048 },
  { code: 'KRW', name: '韩元', symbol: '₩', rate: 0.0054 },
  { code: 'HKD', name: '港币', symbol: 'HK$', rate: 0.93 },
  { code: 'TWD', name: '新台币', symbol: 'NT$', rate: 0.23 },
  { code: 'SGD', name: '新加坡元', symbol: 'S$', rate: 5.38 },
  { code: 'AUD', name: '澳大利亚元', symbol: 'A$', rate: 4.75 },
  { code: 'CAD', name: '加拿大元', symbol: 'C$', rate: 5.36 },
  { code: 'CHF', name: '瑞士法郎', symbol: 'CHF', rate: 8.14 },
]

export default function ExchangePage() {
  const [amount, setAmount] = useState(100)
  const [fromCurrency, setFromCurrency] = useState('CNY')
  const [toCurrency, setToCurrency] = useState('USD')

  const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1
  const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1

  const convert = () => {
    const inBase = amount / fromRate
    return (inBase * toRate).toFixed(2)
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
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
                <DollarSign className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">汇率转换</h1>
            </div>
            <p className="text-[#94A3B8]">多货币实时汇率转换</p>
          </div>

          {/* Converter */}
          <div className="glass-card p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm text-[#94A3B8] mb-2">金额</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white text-2xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">从</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">到</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <button
                onClick={swapCurrencies}
                className="p-3 rounded-full bg-[#111827] border border-[rgba(99,102,241,0.3)] text-[#94A3B8] hover:text-white"
              >
                ⇄
              </button>
            </div>

            <div className="text-center p-6 bg-[#080B14] rounded-xl">
              <p className="text-sm text-[#94A3B8] mb-2">
                {currencies.find(c => c.code === fromCurrency)?.symbol} {amount} =
              </p>
              <p className="text-4xl font-bold text-[#10B981]">
                {currencies.find(c => c.code === toCurrency)?.symbol} {convert()}
              </p>
            </div>
          </div>

          {/* Rates Table */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">参考汇率（以CNY为基准）</h3>
            <div className="space-y-2">
              {currencies.filter(c => c.code !== 'CNY').map(c => (
                <div key={c.code} className="flex items-center justify-between p-2 bg-[#080B14] rounded">
                  <span className="text-[#94A3B8]">{c.symbol} {c.code}</span>
                  <span className="text-white">1 CNY = {c.rate.toFixed(4)} {c.code}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#475569] mt-4 text-center">
              汇率仅供参考，实际交易以银行或交易所为准
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
