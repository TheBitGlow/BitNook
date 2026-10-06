'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Copy, Check, AlertCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

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
  const [copiedKey, setCopiedKey] = useState<string>('')

  // Clean raw input
  const rawInput = inputVal.trim()
  const hasNegativeSign = rawInput.startsWith('-')
  const cleanDigits = hasNegativeSign ? rawInput.slice(1).trim() : rawInput

  const spec = BASE_SPECS[sourceBase]

  const validation = useMemo(() => {
    if (!cleanDigits) return { isValid: true, error: null, value: null }

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
      trackEvent('copy', { tool: 'radix' })
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
    <ToolLayout
      toolSlug="radix"
      principlesTitle="进制位权表示法与 BigInt 任意精度原理"
      principles={
        <>
          <p>
            <strong>1. 进位计数制与权值展开：</strong>
            任意进制数都可以表示为位置加权和：N = ∑ (d_i × B^i)，其中 B 为基数 (Base 2, 8, 10, 16)。十进制向其他进制转换采用“除基倒取余法”；其他进制向十进制转换采用“位权累加法”。
          </p>
          <p>
            <strong>2. 原生 BigInt 任意精度保障：</strong>
            JavaScript 标准 Number 类型基于 IEEE 754 双精度 64 位浮点数，最大安全整数为 \(2^{53} - 1\) (9,007,199,254,740,991)。超过此范围时常规运算将产生截断与假数据。本工具底层全量采用原生 ES2020 BigInt 实现，支持高达千位级超大整数的无损精确换算。
          </p>
        </>
      }
      howToSteps={[
        '选择源数据的数制基数（二进制 BIN、八进制 OCT、十进制 DEC 或十六进制 HEX）。',
        '在输入框键入对应的数值字符（或点击快速填入 255、1024、65535、MaxSafe 等常见字长阈值）。',
        '下方矩阵实时同步 2/8/10/16 全进制换算结果，并自动呈现 4 位 Nibble 分组与十六进制单字节对齐。',
        '可一键单独复制任意进制结果，或查看底层二进制位宽与内存字节占用。',
      ]}
      faq={[
        {
          question: '为什么传统在线转换器在输入超长数值时后几位全变成 0？',
          answer:
            '绝大多数旧式转换工具直接使用 parseInt(str, radix)，当数值超过 9007 兆时，浮点尾数精度耗尽，低位数据被直接四舍五入甚至清零。BitNook 采用 BigInt 词法解析，杜绝此类精度坍塌。',
        },
        {
          question: '十六进制与二进制的分组有什么实际意义？',
          answer:
            '计算机中 1 个十六进制字符正好对应 4 位二进制（半字节 Nibble），2 个十六进制字符对应 1 字节（Byte）。分组显示能够帮助开发者极速进行内存对齐、网络封包排查与位掩码分析。',
        },
      ]}
      dataSources={[
        { name: 'ECMAScript 语言规范 (ECMA-262) BigInt 规范', description: '任意精度大整数数学与进制表述标准' },
        { name: 'IEEE 754-2019 浮点算法标准', description: '计算机字长、溢出与精度边界对照' },
      ]}
      disclaimer="本工具支持任意位宽整数的无损转换，供嵌入式开发、底层网络通信及密码学调试参考。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-text-secondary">输入源数值与进制</label>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <span>快捷数值:</span>
              <button
                type="button"
                onClick={() => handlePreset('255', 10)}
                className="px-2 py-0.5 rounded bg-surface-elevated border border-border hover:border-accent-primary/50 text-text-secondary font-mono transition text-xs"
              >
                255
              </button>
              <button
                type="button"
                onClick={() => handlePreset('1024', 10)}
                className="px-2 py-0.5 rounded bg-surface-elevated border border-border hover:border-accent-primary/50 text-text-secondary font-mono transition text-xs"
              >
                1024
              </button>
              <button
                type="button"
                onClick={() => handlePreset('65535', 10)}
                className="px-2 py-0.5 rounded bg-surface-elevated border border-border hover:border-accent-primary/50 text-text-secondary font-mono transition text-xs"
              >
                65535
              </button>
              <button
                type="button"
                onClick={() => handlePreset('9007199254740991', 10)}
                className="px-2 py-0.5 rounded bg-surface-elevated border border-border hover:border-accent-primary/50 text-text-secondary font-mono transition text-xs"
                title="Number.MAX_SAFE_INTEGER"
              >
                MaxSafe
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-3">
            <select
              aria-label="源进制"
              value={sourceBase}
              onChange={(e) => setSourceBase(Number(e.target.value) as SupportedBase)}
              className="px-3 py-3 bg-canvas border border-border rounded-xl text-text-primary text-xs font-semibold focus:outline-none focus:border-accent-primary transition-colors"
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
                className={`w-full px-4 py-3 bg-canvas border rounded-xl text-text-primary font-mono text-base focus:outline-none transition ${
                  validation.isValid
                    ? 'border-border focus:border-accent-primary'
                    : 'border-danger/80 bg-danger/10 focus:border-danger'
                }`}
              />
            </div>
          </div>

          {!validation.isValid && validation.error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{validation.error}</span>
            </div>
          )}
        </div>

        {/* Results Matrix */}
        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Decimal */}
              <div className="card p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-text-muted">十进制 (DEC · 基数 10)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(results.dec, 'dec')}
                    className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
                  >
                    {copiedKey === 'dec' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'dec' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-canvas border border-border font-mono text-base text-text-primary break-all select-all font-semibold">
                  {results.dec}
                </div>
              </div>

              {/* Hexadecimal */}
              <div className="card p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-text-muted">十六进制 (HEX · 基数 16)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(results.hex, 'hex')}
                    className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
                  >
                    {copiedKey === 'hex' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'hex' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-canvas border border-border font-mono text-base text-emerald-600 dark:text-emerald-400 break-all select-all font-semibold">
                  0x{results.hex}
                </div>
                <div className="text-[11px] font-mono text-text-muted">分字节: {results.groupedHex}</div>
              </div>

              {/* Binary */}
              <div className="card p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-text-muted">二进制 (BIN · 基数 2)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(results.bin, 'bin')}
                    className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
                  >
                    {copiedKey === 'bin' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'bin' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-canvas border border-border font-mono text-sm text-blue-600 dark:text-blue-400 break-all select-all font-semibold">
                  0b{results.bin}
                </div>
                <div className="text-[11px] font-mono text-text-muted">4位分组: {results.groupedBin}</div>
              </div>

              {/* Octal */}
              <div className="card p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-text-muted">八进制 (OCT · 基数 8)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(results.oct, 'oct')}
                    className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
                  >
                    {copiedKey === 'oct' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'oct' ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-canvas border border-border font-mono text-base text-amber-600 dark:text-amber-400 break-all select-all font-semibold">
                  0o{results.oct}
                </div>
              </div>
            </div>

            {/* Hardware & Bit Specs */}
            <div className="p-4 rounded-xl border border-border bg-surface-elevated text-xs text-text-muted flex flex-wrap gap-6 items-center">
              <div>
                二进制位数 (Bit Width): <span className="font-mono text-text-primary font-semibold">{results.bitLength} 位</span>
              </div>
              <div>
                所需最小字节数: <span className="font-mono text-text-primary font-semibold">{results.byteLength} 字节</span>
              </div>
              <div>
                高精度保障: <span className="text-emerald-600 dark:text-emerald-400 font-medium">支持任意长度 BigInt（无 64 位浮点精度损失）</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
