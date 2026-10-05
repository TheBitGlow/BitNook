'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Copy, Check, AlertCircle, RefreshCw } from 'lucide-react'

interface RgbColor {
  r: number
  g: number
  b: number
  a: number
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

function parseHex(input: string): RgbColor | null {
  const clean = input.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]+$/.test(clean)) return null

  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16)
    const g = parseInt(clean[1] + clean[1], 16)
    const b = parseInt(clean[2] + clean[2], 16)
    return { r, g, b, a: 1 }
  } else if (clean.length === 4) {
    const r = parseInt(clean[0] + clean[0], 16)
    const g = parseInt(clean[1] + clean[1], 16)
    const b = parseInt(clean[2] + clean[2], 16)
    const a = Math.round((parseInt(clean[3] + clean[3], 16) / 255) * 100) / 100
    return { r, g, b, a }
  } else if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16)
    const g = parseInt(clean.substring(2, 4), 16)
    const b = parseInt(clean.substring(4, 6), 16)
    return { r, g, b, a: 1 }
  } else if (clean.length === 8) {
    const r = parseInt(clean.substring(0, 2), 16)
    const g = parseInt(clean.substring(2, 4), 16)
    const b = parseInt(clean.substring(4, 6), 16)
    const a = Math.round((parseInt(clean.substring(6, 8), 16) / 255) * 100) / 100
    return { r, g, b, a }
  }
  return null
}

function rgbToHsl(r: number, g: number, b: number) {
  const r1 = r / 255
  const g1 = g / 255
  const b1 = b / 255
  const max = Math.max(r1, g1, b1)
  const min = Math.min(r1, g1, b1)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r1:
        h = ((g1 - b1) / d + (g1 < b1 ? 6 : 0)) * 60
        break
      case g1:
        h = ((b1 - r1) / d + 2) * 60
        break
      case b1:
        h = ((r1 - g1) / d + 4) * 60
        break
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function rgbToHsv(r: number, g: number, b: number) {
  const r1 = r / 255
  const g1 = g / 255
  const b1 = b / 255
  const max = Math.max(r1, g1, b1)
  const min = Math.min(r1, g1, b1)
  const d = max - min
  const v = max
  const s = max === 0 ? 0 : d / max
  let h = 0

  if (d !== 0) {
    switch (max) {
      case r1:
        h = ((g1 - b1) / d + (g1 < b1 ? 6 : 0)) * 60
        break
      case g1:
        h = ((b1 - r1) / d + 2) * 60
        break
      case b1:
        h = ((r1 - g1) / d + 4) * 60
        break
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) }
}

function rgbToCmyk(r: number, g: number, b: number) {
  const r1 = r / 255
  const g1 = g / 255
  const b1 = b / 255
  const k = 1 - Math.max(r1, g1, b1)
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 }
  }
  const c = (1 - r1 - k) / (1 - k)
  const m = (1 - g1 - k) / (1 - k)
  const y = (1 - b1 - k) / (1 - k)
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  }
}

export default function ColorConverterPage() {
  const [hexInput, setHexInput] = useState('#6366F1')
  const [alpha, setAlpha] = useState(1)
  const [copiedKey, setCopiedKey] = useState('')
  const [copyError, setCopyError] = useState(false)

  // Derived current color
  const parsed = useMemo(() => {
    return parseHex(hexInput)
  }, [hexInput])

  const isValid = parsed !== null

  // Active RGBA with alpha slider applied
  const currentColor: RgbColor = useMemo(() => {
    if (parsed) {
      return { ...parsed, a: alpha }
    }
    return { r: 99, g: 102, b: 241, a: alpha }
  }, [parsed, alpha])

  const hsl = useMemo(() => rgbToHsl(currentColor.r, currentColor.g, currentColor.b), [currentColor])
  const hsv = useMemo(() => rgbToHsv(currentColor.r, currentColor.g, currentColor.b), [currentColor])
  const cmyk = useMemo(() => rgbToCmyk(currentColor.r, currentColor.g, currentColor.b), [currentColor])

  const hex6 = useMemo(() => {
    const rHex = currentColor.r.toString(16).padStart(2, '0')
    const gHex = currentColor.g.toString(16).padStart(2, '0')
    const bHex = currentColor.b.toString(16).padStart(2, '0')
    return `#${rHex}${gHex}${bHex}`.toUpperCase()
  }, [currentColor])

  const hex8 = useMemo(() => {
    const aHex = Math.round(currentColor.a * 255)
      .toString(16)
      .padStart(2, '0')
    return `${hex6}${aHex}`.toUpperCase()
  }, [currentColor, hex6])

  const formats = useMemo(() => {
    return [
      { key: 'hex', label: 'HEX', value: hex6 },
      { key: 'hex8', label: 'HEX8 (Alpha)', value: hex8 },
      { key: 'rgb', label: 'RGB', value: `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})` },
      {
        key: 'rgba',
        label: 'RGBA',
        value: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`,
      },
      { key: 'hsl', label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      {
        key: 'hsla',
        label: 'HSLA',
        value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${currentColor.a})`,
      },
      { key: 'hsv', label: 'HSV', value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
      { key: 'cmyk', label: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
      {
        key: 'css',
        label: 'CSS Var',
        value: `--color: rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a});`,
      },
    ]
  }, [hex6, hex8, currentColor, hsl, hsv, cmyk])

  const copyToClipboard = async (text: string, key: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setCopyError(false)
        setTimeout(() => setCopiedKey(''), 2000)
      } else {
        throw new Error('Clipboard API unavailable')
      }
    } catch {
      // Fallback
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopiedKey(key)
        setCopyError(false)
        setTimeout(() => setCopiedKey(''), 2000)
      } catch {
        setCopyError(true)
        setTimeout(() => setCopyError(false), 2500)
      }
    }
  }

  const handleNativeColorChange = (val: string) => {
    setHexInput(val)
  }

  const handleRandomColor = () => {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase()
    setHexInput(hex)
  }

  return (
    <ToolLayout slug="color">
      <div className="space-y-6">
        {/* Preview Card */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-900/60 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Swatch */}
            <div className="relative h-44 rounded-xl overflow-hidden border border-slate-700/80 shadow-inner flex flex-col justify-end p-4">
              {/* Checkerboard for opacity */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  backgroundColor: '#0f172a',
                }}
              />
              {/* Color Layer */}
              <div
                className="absolute inset-0 z-10 transition-colors duration-150"
                style={{
                  backgroundColor: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`,
                }}
              />
              <div className="relative z-20 flex justify-between items-center text-xs font-mono px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white">
                <span>{hex8}</span>
                <span>{Math.round(currentColor.a * 100)}% 不透明度</span>
              </div>
            </div>

            {/* Inputs & Controls */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">十六进制颜色 (HEX)</label>
                  <button
                    onClick={handleRandomColor}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    随机生成
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={hexInput}
                      onChange={(e) => setHexInput(e.target.value)}
                      placeholder="#6366F1 或 #FFF"
                      className={`w-full px-3.5 py-2.5 bg-slate-950 border font-mono text-sm rounded-xl text-white focus:outline-none transition ${
                        isValid
                          ? 'border-slate-700 focus:border-indigo-500'
                          : 'border-rose-500/80 focus:border-rose-500 bg-rose-950/20'
                      }`}
                      maxLength={9}
                    />
                  </div>
                  <input
                    type="color"
                    value={hex6}
                    onChange={(e) => handleNativeColorChange(e.target.value)}
                    className="w-12 h-11 rounded-xl cursor-pointer bg-slate-950 border border-slate-700 p-1"
                    title="选择颜色"
                  />
                </div>
                {!isValid && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    请输入有效的 3 位、4 位、6 位或 8 位 HEX 颜色值（如 #6366F1）
                  </p>
                )}
              </div>

              {/* Alpha Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>透明度 (Alpha)</span>
                  <span className="font-mono text-white">{Math.round(alpha * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={alpha}
                  onChange={(e) => setAlpha(clamp(parseFloat(e.target.value) || 0, 0, 1))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* RGB Sliders */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-center font-mono">
                  <span className="text-rose-400 block">R: {currentColor.r}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-center font-mono">
                  <span className="text-emerald-400 block">G: {currentColor.g}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-center font-mono">
                  <span className="text-blue-400 block">B: {currentColor.b}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formats Grid */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-200">各色彩模式转换结果</h3>
            {copyError && <span className="text-xs text-rose-400">复制失败，请手动选取复制</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formats.map((item) => {
              const isCopied = copiedKey === item.key
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[11px] font-medium text-slate-400 block mb-0.5">{item.label}</span>
                    <span className="text-xs font-mono text-slate-200 truncate block">{item.value}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.value, item.key)}
                    className={`shrink-0 p-2 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                      isCopied
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    title="复制到剪贴板"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
