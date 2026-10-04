'use client'

import { useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Lock, Copy, RefreshCw, Check } from 'lucide-react'

function generatePassword(length: number, options: {
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}): string {
  let chars = ''
  const ambiguous = 'l1IO0'

  if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (options.numbers) chars += '0123456789'
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (options.excludeAmbiguous) {
    chars = chars.split('').filter(c => !ambiguous.includes(c)).join('')
  }

  if (!chars) return ''

  let password = ''
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length]
  }

  return password
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: '弱', color: '#EF4444' }
  if (score <= 2) return { score, label: '中等', color: '#F59E0B' }
  if (score <= 3) return { score, label: '良好', color: '#3B82F6' }
  return { score, label: '强', color: '#10B981' }
}

export default function PasswordPage() {
  const [length, setLength] = useState(16)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false
  })

  const handleGenerate = useCallback(() => {
    const pwd = generatePassword(length, options)
    setPassword(pwd)
    setCopied(false)
  }, [length, options])

  const handleCopy = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const strength = password ? getStrength(password) : null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">密码生成器</h1>
            </div>
            <p className="text-[#94A3B8]">安全密码批量生成，绝不发往服务器</p>
          </div>

          {/* Password Display */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={password}
                readOnly
                placeholder="点击生成密码"
                className="flex-1 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white font-mono text-lg focus:outline-none"
              />
              <button
                onClick={handleCopy}
                disabled={!password}
                className="p-3 rounded-xl bg-[#111827] border border-[rgba(99,102,241,0.15)] text-[#94A3B8] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-[#10B981]" /> : <Copy className="w-5 h-5" />}
              </button>
              <button
                onClick={handleGenerate}
                className="p-3 rounded-xl bg-[#6366F1] text-white hover:bg-[#5558E3] transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {strength && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#080B14] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(strength.score / 5) * 100}%`, backgroundColor: strength.color }}
                  />
                </div>
                <span className="text-sm font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Length Slider */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">密码长度</label>
              <span className="text-[#6366F1] font-mono text-lg">{length} 位</span>
            </div>
            <input
              type="range"
              min="4"
              max="128"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-[#080B14] rounded-full appearance-none cursor-pointer accent-[#6366F1]"
            />
            <div className="flex justify-between text-xs text-[#475569] mt-1">
              <span>4</span>
              <span>64</span>
              <span>128</span>
            </div>
          </div>

          {/* Options */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-white font-medium mb-4">字符类型</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'uppercase', label: '大写字母 (A-Z)' },
                { key: 'lowercase', label: '小写字母 (a-z)' },
                { key: 'numbers', label: '数字 (0-9)' },
                { key: 'symbols', label: '特殊符号 (!@#$)' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options[opt.key as keyof typeof options]}
                    onChange={(e) => setOptions(prev => ({ ...prev, [opt.key]: e.target.checked }))}
                    className="w-5 h-5 rounded border-[rgba(99,102,241,0.3)] bg-[#080B14] accent-[#6366F1]"
                  />
                  <span className="text-[#94A3B8]">{opt.label}</span>
                </label>
              ))}
            </div>

            <label className="flex items-center gap-3 cursor-pointer mt-4 pt-4 border-t border-[rgba(99,102,241,0.1)]">
              <input
                type="checkbox"
                checked={options.excludeAmbiguous}
                onChange={(e) => setOptions(prev => ({ ...prev, excludeAmbiguous: e.target.checked }))}
                className="w-5 h-5 rounded border-[rgba(99,102,241,0.3)] bg-[#080B14] accent-[#6366F1]"
              />
              <span className="text-[#94A3B8]">排除易混淆字符 (l, 1, I, O, 0)</span>
            </label>
          </div>

          {/* Security Note */}
          <div className="p-4 bg-[#111827]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#10B981]">安全说明：</span>
              本工具使用 Web Crypto API 在本地生成密码，绝不会将您的密码发送到任何服务器。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
