'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Palette, Copy, Check } from 'lucide-react'

export default function ColorConverterPage() {
  const [hex, setHex] = useState('#6366F1')
  const [copied, setCopied] = useState('')

  const colors = useMemo(() => {
    const h = hex.replace('#', '')
    if (h.length !== 6) return null

    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)

    // RGB to HSL
    const r1 = r / 255, g1 = g / 255, b1 = b / 255
    const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1)
    let h_deg = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r1: h_deg = ((g1 - b1) / d + (g1 < b1 ? 6 : 0)) * 60; break
        case g1: h_deg = ((b1 - r1) / d + 2) * 60; break
        case b1: h_deg = ((r1 - g1) / d + 4) * 60; break
      }
    }

    // RGB to HSV
    const v = max
    const delta = max - min
    const s_hsv = max === 0 ? 0 : delta / max
    let h_hsv = 0
    if (delta !== 0) {
      switch (max) {
        case r1: h_hsv = ((g1 - b1) / delta + (g1 < b1 ? 6 : 0)) * 60; break
        case g1: h_hsv = ((b1 - r1) / delta + 2) * 60; break
        case b1: h_hsv = ((r1 - g1) / delta + 4) * 60; break
      }
    }

    // RGB to CMYK
    const k = 1 - max
    const c = max === 0 ? 0 : (1 - r1 - k) / (1 - k)
    const m = max === 0 ? 0 : (1 - g1 - k) / (1 - k)
    const y = max === 0 ? 0 : (1 - b1 - k) / (1 - k)

    return {
      rgb: { r, g, b },
      hsl: { h: Math.round(h_deg), s: Math.round(s * 100), l: Math.round(l * 100) },
      hsv: { h: Math.round(h_hsv), s: Math.round(s_hsv * 100), v: Math.round(v * 100) },
      cmyk: {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
      }
    }
  }, [hex])

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const formatRgb = (c: { r: number; g: number; b: number }) =>
    `rgb(${c.r}, ${c.g}, ${c.b})`

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h1 className="text-2xl font-bold text-white">颜色转换</h1>
            </div>
            <p className="text-[#94A3B8]">HEX / RGB / HSL / HSV / CMYK 互转</p>
          </div>

          <div className="glass-card p-6">
            {/* Color Preview */}
            <div
              className="h-40 rounded-xl mb-6 flex items-center justify-center border-2 border-dashed border-[rgba(99,102,241,0.3)]"
              style={{ backgroundColor: hex }}
            >
              <span className="text-white text-xl font-mono drop-shadow-lg">{hex.toUpperCase()}</span>
            </div>

            {/* HEX Input */}
            <div className="mb-6">
              <label className="block text-sm text-[#94A3B8] mb-2">HEX</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => {
                    const v = e.target.value
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setHex(v)
                  }}
                  className="flex-1 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white font-mono focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  maxLength={7}
                />
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-14 h-12 rounded-xl cursor-pointer border border-[rgba(99,102,241,0.15)]"
                />
              </div>
            </div>

            {/* Color Formats */}
            {colors && (
              <div className="space-y-4">
                {/* RGB */}
                <div className="flex items-center gap-3">
                  <div className="w-20 text-sm text-[#94A3B8]">RGB</div>
                  <div className="flex-1 px-4 py-2 bg-[#080B14] rounded-lg text-white font-mono">
                    {formatRgb(colors.rgb)}
                  </div>
                  <button
                    onClick={() => copyToClipboard(formatRgb(colors.rgb), 'rgb')}
                    className="p-2 text-[#94A3B8] hover:text-white"
                  >
                    {copied === 'rgb' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* HSL */}
                <div className="flex items-center gap-3">
                  <div className="w-20 text-sm text-[#94A3B8]">HSL</div>
                  <div className="flex-1 px-4 py-2 bg-[#080B14] rounded-lg text-white font-mono">
                    hsl({colors.hsl.h}, {colors.hsl.s}%, {colors.hsl.l}%)
                  </div>
                  <button
                    onClick={() => copyToClipboard(`hsl(${colors.hsl.h}, ${colors.hsl.s}%, ${colors.hsl.l}%)`, 'hsl')}
                    className="p-2 text-[#94A3B8] hover:text-white"
                  >
                    {copied === 'hsl' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* HSV */}
                <div className="flex items-center gap-3">
                  <div className="w-20 text-sm text-[#94A3B8]">HSV</div>
                  <div className="flex-1 px-4 py-2 bg-[#080B14] rounded-lg text-white font-mono">
                    hsv({colors.hsv.h}, {colors.hsv.s}%, {colors.hsv.v}%)
                  </div>
                  <button
                    onClick={() => copyToClipboard(`hsv(${colors.hsv.h}, ${colors.hsv.s}%, ${colors.hsv.v}%)`, 'hsv')}
                    className="p-2 text-[#94A3B8] hover:text-white"
                  >
                    {copied === 'hsv' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* CMYK */}
                <div className="flex items-center gap-3">
                  <div className="w-20 text-sm text-[#94A3B8]">CMYK</div>
                  <div className="flex-1 px-4 py-2 bg-[#080B14] rounded-lg text-white font-mono">
                    cmyk({colors.cmyk.c}%, {colors.cmyk.m}%, {colors.cmyk.y}%, {colors.cmyk.k}%)
                  </div>
                  <button
                    onClick={() => copyToClipboard(`cmyk(${colors.cmyk.c}%, ${colors.cmyk.m}%, ${colors.cmyk.y}%, ${colors.cmyk.k}%)`, 'cmyk')}
                    className="p-2 text-[#94A3B8] hover:text-white"
                  >
                    {copied === 'cmyk' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
