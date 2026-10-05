'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { ArrowRightLeft, Copy, Check, AlertCircle } from 'lucide-react'

type SupportedBase = 2 | 8 | 10 | 16

interface BaseSpec {
  base: SupportedBase
  name: string
  shortName: string
  pattern: RegExp
  prefix: string
  example: string
  errorMsg: string
}

const BASE_SPECS: Record<SupportedBase, BaseSpec> = {
  2: {
    base: 2,
    name: '二进制 (Binary)',
    shortName: 'BIN',
    pattern: /^[01]+$/,
    prefix: '0b',
    example: '1100100',
    errorMsg: '二进制只允许输入数字 0 和 1',
  },
  8: {
    base: 8,
    name: '八进制 (Octal)',
    shortName: 'OCT',
    pattern: /^[0-7]+$/,
    prefix: '0o',
    example: '144',
    errorMsg: '八进制只允许输入数字 0 至 7',
  },
  10: {
    base: 10,
    name: '十进制 (Decimal)',
    shortName: 'DEC',
    pattern: /^[0-9]+$/,
    prefix: '',
    example: '100',
    errorMsg: '十进制只允许输入数字 0 至 9',
  },
  16: {
    base: 16,
    name: '十六进制 (Hexadecimal)',
    shortName: 'HEX',
    pattern: /^[0-9a-fA-F]+$/,
    prefix: '0x',
    example: '64',
    errorMsg: '十六进制只允许输入 0-9 以及字母 A-F / a-f',
  },
}

function formatGroupedBinary(bin: string): string {
  // Group into 4-bit nibbles from right to left
  const clean = bin.replace(/^0+/, '') || '0'
  const remainder = clean.length % 4
  const padded = remainder > 0 ? '0'.repeat(4 - remainder) + clean : clean
  const groups: string[] = []
  for (let i = 0; i < padded.length; i += 4) {
    groups.push(padded.substring(i, i + 4))
  }
  return groups.join(' ')
}

function formatGroupedHex(hex: string): string {
  // Group into 2-character bytes
  const clean = hex.toUpperCase()
  const remainder = clean.length % 2
  const padded = remainder > 0 ? '0' + clean : clean
  const groups: string[] = []
  for (let i = 0; i < padded.length; i += 2) {
    groups.push(padded.substring(i, i + 2))
  }
  return groups.join(' ')
}

export default function RadixConverterPage() {
  const [inputVal, setInputVal] = useState<string>('255')
  const [sourceBase, setSourceBase] = useState<SupportedBase>(10)
  const [isNegative, setIsNegative] = useState<boolean>(false)
  const [copiedKey, setCopiedKey] = useState<string>('')

  // Clean raw input
  const rawInput = inputVal.trim()
  const hasNegativeSign = rawInput.startsWith('-')
  const cleanDigits = hasNegativeSign ? rawInput.slice(1).trim() : rawInput

  const spec = BASE_SPECS[sourceBase]

  const validation = useMemo(() => {
    if (!cleanDigits) return { isValid: true, error: null, value: null }

    // Strip leading prefix if user explicitly entered 0b, 0o, 0x
    let stripped = cleanDigits
    if (sourceBase === 2 && (stripped.startsWith('0b') || stripped.startsWith('0B'))) {
      stripped = stripped.slice(2)
    } else if (sourceBase === 8 && (stripped.startsWith('0o') || stripped.startsWith('0O'))) {
      stripped = stripped.slice(2)
    } else if (sourceBase === 16 && (stripped.startsWith('0x') || stripped.startsWith('0X'))) {
      stripped = stripped.slice(2)
    }

    if (!stripped) {
      return { isValid: false, error: '请输入有效数字', value: null }
    }

    // Strict regex validation without parseInt partial matching
    if (!spec.pattern.test(stripped)) {
      return { isValid: false, error: spec.errorMsg, value: null }
    }

    try {
      let bigNum: bigint
      if (sourceBase === 2) {
        bigNum = BigInt(`0b${stripped}`)
      } else if (sourceBase === 8) {
        bigNum = BigInt(`0o${stripped}`)
      } else if (sourceBase === 16) {
        bigNum = BigInt(`0x${stripped}`)
      } else {
        bigNum = BigInt(stripped)
      }

      if (hasNegativeSign) {
        bigNum = -bigNum
      }

      return { isValid: true, error: null, value: bigNum }
    } catch {
      return { isValid: false, error: '数字格式解析失败', value: null }
    }
  }, [cleanDigits, sourceBase, spec, hasNegativeSign])

  const results = useMemo(() => {
    if (!validation.isValid || validation.value === null) return null
    const val = validation.value
    const isNeg = val < BigInt(0)
    const absVal = isNeg ? -val : val

    const binStr = (isNeg ? '-' : '') + absVal.toString(2)
    const octStr = (isNeg ? '-' : '') + absVal.toString(8)
    const decStr = val.toString(10)
    const hexStr = (isNeg ? '-' : '') + absVal.toString(16).toUpperCase()

    // Bit length calculation for positive part
    const bitLen = absVal === BigInt(0) ? 1 : absVal.toString(2).length
    const byteLen = Math.ceil(bitLen / 8)

    return {
      bin: binStr,
      oct: octStr,
      dec: decStr,
      hex: hexStr,
      groupedBin: isNeg ? `-${formatGroupedBinary(absVal.toString(2))}` : formatGroupedBinary(absVal.toString(2)),
      groupedHex: isNeg ? `-${formatGroupedHex(absVal.toString(16))}` : formatGroupedHex(absVal.toString(16)),
      bitLength: bitLen,
      byteLength: byteLen,
    }
  }, [validation])

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      // ignore
    }
  }

  const handlePreset = (num: string, base: SupportedBase) => {
    setSourceBase(base)
    setInputVal(num)
  }

  return (
    <ToolLayout slug="radix">
      <div className="space-y-6">
        {/* Input Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-300">输入源数值与进制</label>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>快捷数值:</span>
              <button
                onClick={() => handlePreset('255', 10)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
              >
                255
              </button>
              <button
                onClick={() => handlePreset('1024', 10)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
              >
                1024
              </button>
              <button
                onClick={() => handlePreset('65535', 10)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
              >
                65535
              </button>
              <button
                onClick={() => handlePreset('9007199254740991', 10)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
                title="Number.MAX_SAFE_INTEGER"
              >
                MaxSafe
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-3">
            <select
              value={sourceBase}
              onChange={(e) => setSourceBase(Number(e.target.value) as SupportedBase)}
              className="px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value={2}>BIN (2进制)</option>
              <option value={8}>OCT (8进制)</option>
              <option value={10}>DEC (10进制)</option>
              <option value={16}>HEX (16进制)</option>
            </select>

            <div className="relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={`如: ${spec.example}`}
                className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white font-mono text-base focus:outline-none transition ${
                  validation.isValid
                    ? 'border-slate-700 focus:border-indigo-500'
                    : 'border-rose-500/80 bg-rose-950/20 focus:border-rose-500'
                }`}
              />
            </div>
          </div>

          {!validation.isValid && validation.error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validation.error}</span>
            </div>
          )}
        </div>

        {/* Results Matrix */}
        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Decimal */}
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400">十进制 (DEC · 基数 10)</span>
                  <button
                    onClick={() => copyToClipboard(results.dec, 'dec')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    {copiedKey === 'dec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'dec' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-base text-white break-all select-all font-semibold">
                  {results.dec}
                </div>
              </div>

              {/* Hexadecimal */}
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400">十六进制 (HEX · 基数 16)</span>
                  <button
                    onClick={() => copyToClipboard(results.hex, 'hex')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    {copiedKey === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'hex' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-base text-emerald-400 break-all select-all font-semibold">
                  0x{results.hex}
                </div>
                <div className="text-[11px] font-mono text-slate-400">分字节: {results.groupedHex}</div>
              </div>

              {/* Binary */}
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400">二进制 (BIN · 基数 2)</span>
                  <button
                    onClick={() => copyToClipboard(results.bin, 'bin')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    {copiedKey === 'bin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'bin' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm text-cyan-300 break-all select-all font-semibold">
                  0b{results.bin}
                </div>
                <div className="text-[11px] font-mono text-slate-400">4位分组: {results.groupedBin}</div>
              </div>

              {/* Octal */}
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400">八进制 (OCT · 基数 8)</span>
                  <button
                    onClick={() => copyToClipboard(results.oct, 'oct')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    {copiedKey === 'oct' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'oct' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-base text-amber-300 break-all select-all font-semibold">
                  0o{results.oct}
                </div>
              </div>
            </div>

            {/* Hardware & Bit Specs */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex flex-wrap gap-6 items-center">
              <div>
                二进制位数 (Bit Width): <span className="font-mono text-white font-semibold">{results.bitLength} 位</span>
              </div>
              <div>
                所需最小字节数: <span className="font-mono text-white font-semibold">{results.byteLength} 字节</span>
              </div>
              <div>
                高精度保障: <span className="text-emerald-400 font-medium">支持任意长度 BigInt（无 64 位浮点精度损失）</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
