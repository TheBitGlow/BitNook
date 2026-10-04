'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Cpu, Copy, Check } from 'lucide-react'

const GPUS = [
  { name: "RTX 4060 Laptop 8GB", vram: 8 },
  { name: "RTX 4070 Laptop 8GB", vram: 8 },
  { name: "RTX 3060 12GB", vram: 12 },
  { name: "RTX 4070 12GB", vram: 12 },
  { name: "RTX 4060 Ti 16GB", vram: 16 },
  { name: "RTX 4070 Ti 16GB", vram: 16 },
  { name: "RTX 4080 16GB", vram: 16 },
  { name: "RTX 4070 Super", vram: 16 },
  { name: "RTX 4080 Super", vram: 16 },
  { name: "RTX 3090 24GB", vram: 24 },
  { name: "RTX 4090 24GB", vram: 24 },
  { name: "A100 40GB", vram: 40 },
  { name: "A100 80GB", vram: 80 },
  { name: "H100 SXM 80GB", vram: 80 },
]

function calc(modelB: number, ratio: number): number {
  const raw = modelB * ratio * 1.2
  return Math.ceil(raw * 10) / 10
}

function getBadge(ratio: number, vram: number, need: number) {
  if (vram >= need * 1.5) return { text: "流畅", cls: "bg-[#10B981]/15 text-[#10B981]" }
  if (vram >= need) return { text: "刚好", cls: "bg-[#F59E0B]/15 text-[#F59E0B]" }
  return { text: "不足", cls: "bg-[#EF4444]/15 text-[#EF4444]" }
}

export default function GPUCalculatorPage() {
  const [modelB, setModelB] = useState(7)
  const [ratio, setRatio] = useState(1)

  const need = calc(modelB, ratio)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <h1 className="text-2xl font-bold text-white">AI大模型显存计算器</h1>
            </div>
            <p className="text-[#94A3B8]">LLM VRAM Calculator · 估算模型推理所需显存</p>
          </div>

          {/* Input Card */}
          <div className="glass-card p-6 mb-6">
            {/* Model Size Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-medium">模型参数量</label>
                <span className="text-[#06B6D4] font-mono text-lg">{modelB} B</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="405"
                step="0.5"
                value={modelB}
                onChange={(e) => setModelB(Number(e.target.value))}
                className="w-full h-2 bg-[#080B14] rounded-full appearance-none cursor-pointer accent-[#06B6D4]"
              />
              <div className="flex justify-between text-xs text-[#475569] mt-1">
                <span>0.5B</span>
                <span>7B</span>
                <span>13B</span>
                <span>70B</span>
                <span>405B</span>
              </div>
            </div>

            {/* Precision Selection */}
            <div className="mb-6">
              <label className="text-white font-medium mb-3 block">量化精度</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'FP16', sub: '×2', value: 2, ratio: 2 },
                  { label: 'INT8', sub: '×1', value: 1, ratio: 1 },
                  { label: '4-bit', sub: '×0.5', value: 0.5, ratio: 0.5 },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setRatio(opt.ratio)}
                    className={`p-3 rounded-xl border transition-all ${
                      ratio === opt.ratio
                        ? 'bg-[#06B6D4] border-[#06B6D4] text-white'
                        : 'bg-[#080B14] border-[rgba(99,102,241,0.15)] text-[#94A3B8] hover:border-[#06B6D4]'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-xs opacity-70">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Result Display */}
            <div className="text-center py-6 border-t border-[rgba(99,102,241,0.1)]">
              <div className="text-sm text-[#94A3B8] mb-2">所需显存</div>
              <div className="text-5xl font-bold text-[#06B6D4]">
                {need.toFixed(1)}
                <span className="text-2xl font-normal text-[#94A3B8] ml-1">GB</span>
              </div>
            </div>

            {/* Formula Note */}
            <div className="p-4 bg-[#080B14] rounded-xl text-sm text-[#94A3B8]">
              <span className="text-[#06B6D4] font-mono">计算公式：</span>
              显存(GB) = 参数(B) × 量化系数 × 1.2（向上取整）
              <br />
              <span className="text-[#475569]">其中 1.2 为 +20% 安全缓冲系数</span>
            </div>
          </div>

          {/* GPU Reference Table */}
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4">显卡对照表</h3>
            <div className="grid grid-cols-1 gap-3">
              {GPUS.map(gpu => {
                const badge = getBadge(ratio, gpu.vram, need)
                return (
                  <div key={gpu.name} className="flex items-center justify-between p-3 bg-[#080B14] rounded-xl">
                    <span className="text-[#94A3B8] text-sm">{gpu.name}</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}>
                      {badge.text}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Common Models Quick Select */}
          <div className="mt-6 p-4 bg-[#111827]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8] mb-3">
              <span className="text-[#06B6D4]">常见模型速览：</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Llama 3.1 8B', size: 8 },
                { name: 'Llama 3.1 70B', size: 70 },
                { name: 'GPT-4', size: 180 },
                { name: 'GPT-4o', size: 200 },
                { name: 'Claude 3.5', size: 200 },
                { name: 'Qwen 2.5 72B', size: 72 },
              ].map(m => (
                <button
                  key={m.name}
                  onClick={() => setModelB(m.size)}
                  className="px-3 py-1.5 text-xs bg-[#080B14] rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#06B6D4]/20 transition-colors"
                >
                  {m.name} ({m.size}B)
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
