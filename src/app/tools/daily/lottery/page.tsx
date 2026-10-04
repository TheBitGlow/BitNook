'use client'

import { useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Gift, Trash2, Plus, Play, RotateCcw, Download } from 'lucide-react'

interface Prize {
  name: string
  count: number
  color: string
}

const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']

export default function LotteryPage() {
  const [names, setNames] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [prizes, setPrizes] = useState<Prize[]>([
    { name: '一等奖', count: 1, color: '#F59E0B' },
    { name: '二等奖', count: 2, color: '#94A3B8' },
    { name: '三等奖', count: 3, color: '#CD7F32' },
  ])
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [winners, setWinners] = useState<{ name: string; prize: string }[]>([])
  const [usedNames, setUsedNames] = useState<Set<string>>(new Set())

  const addName = () => {
    const trimmed = newName.trim()
    if (trimmed && !names.includes(trimmed)) {
      setNames([...names, trimmed])
      setNewName('')
    }
  }

  const addFromText = () => {
    const lines = newName.split(/[\n,，]/).map(s => s.trim()).filter(s => s && !names.includes(s))
    if (lines.length) {
      setNames([...names, ...lines])
      setNewName('')
    }
  }

  const removeName = (name: string) => {
    setNames(names.filter(n => n !== name))
    const newUsed = new Set(usedNames)
    newUsed.delete(name)
    setUsedNames(newUsed)
  }

  const spin = useCallback(() => {
    if (isSpinning || names.length === 0) return

    const availableNames = names.filter(n => !usedNames.has(n))
    if (availableNames.length === 0) return

    setIsSpinning(true)
    setWinner(null)

    const prize = prizes[currentPrizeIndex]
    const duration = 3000
    const interval = 100
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      const randomName = availableNames[Math.floor(Math.random() * availableNames.length)]
      setWinner(randomName)

      if (elapsed >= duration) {
        clearInterval(timer)
        const finalName = availableNames[Math.floor(Math.random() * availableNames.length)]
        setWinner(finalName)
        setUsedNames(new Set([...Array.from(usedNames), finalName]))
        setWinners([...winners, { name: finalName, prize: prize.name }])
        setIsSpinning(false)
      }
    }, interval)
  }, [isSpinning, names, usedNames, prizes, currentPrizeIndex, winners])

  const reset = () => {
    setWinners([])
    setUsedNames(new Set())
    setWinner(null)
    setCurrentPrizeIndex(0)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EC4899]/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-[#EC4899]" />
              </div>
              <h1 className="text-2xl font-bold text-white">抽奖</h1>
            </div>
            <p className="text-[#94A3B8]">转盘抽奖，防重复抽取</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Names */}
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">参与人员 ({names.length})</h3>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFromText()}
                  placeholder="输入姓名，回车添加"
                  className="flex-1 px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-lg text-white placeholder-[#475569] focus:outline-none"
                />
                <button onClick={addFromText} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5558E3]">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto mb-4">
                {names.map((name) => (
                  <div
                    key={name}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                      usedNames.has(name)
                        ? 'bg-[#111827]/50 text-[#475569] line-through'
                        : 'bg-[#080B14] text-white'
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <button onClick={() => removeName(name)} className="ml-1 text-[#475569] hover:text-[#EF4444]">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#475569]">支持粘贴多个姓名，用逗号或换行分隔</p>
            </div>

            {/* Right Column - Prizes & Spin */}
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">奖项设置</h3>

              <div className="space-y-2 mb-6">
                {prizes.map((prize, i) => (
                  <div key={prize.name} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: prize.color }}
                    />
                    <span className="text-white flex-1">{prize.name}</span>
                    <span className="text-[#94A3B8]">x{prize.count}</span>
                    <span className="text-xs text-[#475569]">
                      {winners.filter(w => w.prize === prize.name).length}/{prize.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Winner Display */}
              <div className="text-center py-8">
                <div
                  className={`text-4xl font-bold mb-4 transition-all ${
                    isSpinning ? 'animate-pulse' : ''
                  }`}
                  style={{ color: winner ? prizes[currentPrizeIndex].color : '#475569' }}
                >
                  {winner || '等待抽奖'}
                </div>

                <button
                  onClick={spin}
                  disabled={isSpinning || names.filter(n => !usedNames.has(n)).length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  <Play className="w-5 h-5" />
                  {isSpinning ? '抽奖中...' : '开始抽奖'}
                </button>
              </div>
            </div>
          </div>

          {/* Winners List */}
          {winners.length > 0 && (
            <div className="glass-card p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">中奖名单</h3>
                <button onClick={reset} className="text-sm text-[#94A3B8] hover:text-white flex items-center gap-1">
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
              </div>
              <div className="space-y-2">
                {winners.map((w, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-[#080B14] rounded-lg">
                    <span className="text-[#475569] w-8">{i + 1}.</span>
                    <span className="text-white">{w.name}</span>
                    <span className="text-[#F59E0B]">- {w.prize}</span>
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
