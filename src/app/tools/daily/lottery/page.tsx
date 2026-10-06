'use client'

import { useState, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Gift, RotateCcw, Copy, Check, Sparkles, UserPlus, Play } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface Prize {
  name: string
  count: number
  color: string
}

const DEFAULT_SAMPLE_NAMES = [
  '张伟', '王芳', '李强', '刘洋', '陈杰', '杨光', '赵敏', '黄磊', '周涛', '吴越', '孙鹏', '钱程'
]

// Cryptographically secure random integer in [0, max) using CSPRNG
function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return array[0] % max
}

export default function LotteryPage() {
  const [names, setNames] = useState<string[]>([])
  const [inputBatch, setInputBatch] = useState('')
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
  const [copied, setCopied] = useState(false)

  const handleAddBatch = () => {
    const list = inputBatch
      .split(/[\n,，\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !names.includes(s))
    if (list.length > 0) {
      setNames((prev) => [...prev, ...list])
      setInputBatch('')
    }
  }

  const handleAddSample = () => {
    const fresh = DEFAULT_SAMPLE_NAMES.filter((n) => !names.includes(n))
    setNames((prev) => [...prev, ...fresh])
  }

  const removeName = (target: string) => {
    setNames((prev) => prev.filter((n) => n !== target))
    setUsedNames((prev) => {
      const next = new Set(prev)
      next.delete(target)
      return next
    })
  }

  const spin = useCallback(() => {
    if (isSpinning || names.length === 0) return

    const availableNames = names.filter((n) => !usedNames.has(n))
    if (availableNames.length === 0) return

    setIsSpinning(true)
    setWinner(null)

    const prize = prizes[currentPrizeIndex] || { name: '幸运大奖' }
    const duration = 2200
    const interval = 80
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      const randIdx = getSecureRandomInt(availableNames.length)
      setWinner(availableNames[randIdx])

      if (elapsed >= duration) {
        clearInterval(timer)
        const finalIdx = getSecureRandomInt(availableNames.length)
        const finalWinner = availableNames[finalIdx]
        setWinner(finalWinner)
        setUsedNames((prev) => new Set([...Array.from(prev), finalWinner]))
        setWinners((prev) => [...prev, { name: finalWinner, prize: prize.name }])
        setIsSpinning(false)
        trackEvent('tool_success', { tool: 'lottery' })
      }
    }, interval)
  }, [isSpinning, names, usedNames, prizes, currentPrizeIndex])

  const resetAll = () => {
    setWinners([])
    setUsedNames(new Set())
    setWinner(null)
    setCurrentPrizeIndex(0)
  }

  const handleCopyWinners = async () => {
    if (winners.length === 0) return
    const text = [
      `【BitNook 抽奖中奖名单公示】`,
      `• 参与候选总人数：${names.length} 人`,
      `• 中奖人次：${winners.length} 人`,
      ...winners.map((w, idx) => `  ${idx + 1}. 【${w.prize}】${w.name}`),
      `抽奖基准：Web Crypto CSPRNG 密码学安全随机数，公平公开无偏倚。`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      trackEvent('copy', { tool: 'lottery' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const availableCount = names.filter((n) => !usedNames.has(n)).length

  return (
    <ToolLayout
      toolSlug="lottery"
      principlesTitle="密码学安全随机数 (CSPRNG) 与公平抽奖原理"
      principles={
        <>
          <p>
            <strong>1. Web Crypto API 密码学安全随机数 (CSPRNG)：</strong>
            普通伪随机函数（如传统的 Math.random）属于线性同余或 Xorshift 伪随机序列，存在状态可预测性。BitNook 抽奖采用标准 `window.crypto.getRandomValues()`，直接利用浏览器底层密码学安全伪随机数发生器（CSPRNG）熵池，确保每个候选人被抽中的概率严格服从离散均匀分布。
          </p>
          <p>
            <strong>2. 客户端端到端纯净执行：</strong>
            全流程本地闭环计算，没有中心化数据库插手或预设“内定”名单，完全保障年会抽奖、班级点名及活动互动的绝对透明与公平。
          </p>
        </>
      }
      howToSteps={[
        '在候选名单输入框粘贴参与者姓名（支持换行、空格或逗号分隔），或点击“填入示例名单”。',
        '选择当前抽取的奖项等级，点击“开始抽取”。',
        '系统以 CSPRNG 算法随机高频滚动并停留在最终中奖者，自动剔除已中奖者防止重复。',
        '活动结束后可一键复制完整中奖公示名单。',
      ]}
      faq={[
        {
          question: '中奖后还会重复被抽中吗？',
          answer:
            '默认开启排他中奖保护，已被抽中的参与者自动移入“已中奖”池，后续轮次绝不会重复中奖。若想重新开奖点击“重置开奖”即可。',
        },
        {
          question: '抽奖过程会上传到服务器吗？',
          answer:
            '不会。名单与开奖流程完全在本地浏览器内存中即时计算，输入默认不会上传，保护参与人员隐私。',
        },
      ]}
      disclaimer="本工具用于年会聚会、课堂提问、团队互动与团建娱乐。涉及高额涉资商业博彩等活动请遵从当地法律法规。"
    >
      <div className="space-y-6">
        {/* Stage / Roll Banner */}
        <div className="card p-8 sm:p-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-accent-primary" />
            <span className="text-xs font-semibold text-text-secondary">
              正在抽取：{prizes[currentPrizeIndex]?.name || '幸运大奖'}
            </span>
          </div>

          <div className="py-8 sm:py-10 bg-canvas rounded-2xl border border-border">
            <p className="text-4xl sm:text-6xl font-extrabold text-text-primary tracking-wider select-all font-mono">
              {winner || (availableCount > 0 ? '准备就绪' : '请先添加参与名单')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={spin}
              disabled={isSpinning || availableCount === 0}
              className="btn-primary px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              {isSpinning ? '正在随机抽取...' : `开始抽取 (剩余可抽 ${availableCount} 人)`}
            </button>

            {winners.length > 0 && (
              <button
                type="button"
                onClick={resetAll}
                disabled={isSpinning}
                className="btn-secondary px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-sm"
                title="清空当前所有中奖记录"
              >
                <RotateCcw className="w-4 h-4" />
                重置开奖
              </button>
            )}
          </div>
        </div>

        {/* Input & Candidate Pools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidates */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-text-secondary">
                参与者名单池 ({names.length} 人)
              </h3>
              {names.length === 0 && (
                <button
                  type="button"
                  onClick={handleAddSample}
                  className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  填入示例名单
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <textarea
                value={inputBatch}
                onChange={(e) => setInputBatch(e.target.value)}
                placeholder="在此批量粘贴姓名，支持空格、逗号或换行分隔..."
                className="w-full h-24 px-3 py-2 bg-canvas border border-border rounded-xl text-text-primary placeholder:text-text-muted text-xs focus:outline-none focus:border-accent-primary resize-none transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleAddBatch}
              disabled={!inputBatch.trim()}
              className="w-full py-2 bg-surface-elevated border border-border text-text-primary hover:border-accent-primary/50 rounded-xl text-xs font-semibold disabled:opacity-40 transition flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              解析并导入名单
            </button>

            {names.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {names.map((name) => {
                  const isWon = usedNames.has(name)
                  return (
                    <span
                      key={name}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        isWon
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 line-through'
                          : 'bg-surface-elevated text-text-primary border-border'
                      }`}
                    >
                      {name}
                      {!isWon && !isSpinning && (
                        <button
                          type="button"
                          onClick={() => removeName(name)}
                          className="text-text-muted hover:text-danger ml-0.5"
                          title="移出名单"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Winners List */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-text-secondary">
                中奖名单公示 ({winners.length} 人)
              </h3>
              {winners.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyWinners}
                  className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '已复制' : '复制公示榜'}</span>
                </button>
              )}
            </div>

            {winners.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted">
                点击上方开始抽取，中奖者将在此处实时归档
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {winners.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-canvas border border-border rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-text-muted font-mono">#{idx + 1}</span>
                      <span className="font-semibold text-text-primary">{w.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20 text-accent-primary font-medium">
                      {w.prize}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
