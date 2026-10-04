'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Type, Copy, Check, Trash2 } from 'lucide-react'

export default function WordCountPage() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const stats = useMemo(() => {
    if (!text.trim()) {
      return {
        chars: 0,
        charsNoSpaces: 0,
        words: 0,
        lines: 0,
        paragraphs: 0,
        readingTime: 0,
        topKeywords: []
      }
    }

    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
    const lines = text.split('\n').length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    const readingTime = Math.ceil(words / 200)

    // Keyword frequency
    const words_arr = text.toLowerCase().match(/[a-z\u4e00-\u9fa5]+/g) || []
    const freq: Record<string, number> = {}
    words_arr.forEach(w => {
      if (w.length > 1) freq[w] = (freq[w] || 0) + 1
    })
    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }))

    return { chars, charsNoSpaces, words, lines, paragraphs, readingTime, topKeywords }
  }, [text])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setText('')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Type className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">文字统计</h1>
            </div>
            <p className="text-[#94A3B8]">实时统计字数、字符、关键词频率</p>
          </div>

          {/* Text Input */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-white font-medium">输入文本</label>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!text}
                  className="p-2 text-[#94A3B8] hover:text-white disabled:opacity-50"
                  title="复制"
                >
                  {copied ? <Check className="w-5 h-5 text-[#10B981]" /> : <Copy className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleClear}
                  disabled={!text}
                  className="p-2 text-[#94A3B8] hover:text-[#EF4444] disabled:opacity-50"
                  title="清空"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="在此输入或粘贴文本..."
              className="w-full h-64 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)] resize-none"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: '字符数', value: stats.chars },
              { label: '字符（去空格）', value: stats.charsNoSpaces },
              { label: '单词数', value: stats.words },
              { label: '行数', value: stats.lines },
            ].map(stat => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <p className="text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-[#475569]">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reading Time */}
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">阅读时间估算</h3>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-[#6366F1]">{stats.readingTime}</p>
                <p className="text-sm text-[#475569] mt-1">分钟（按200字/分钟）</p>
              </div>
            </div>

            {/* Keywords */}
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">高频词 Top 10</h3>
              {stats.topKeywords.length === 0 ? (
                <p className="text-[#475569] text-center py-4">输入更多文本查看关键词</p>
              ) : (
                <div className="space-y-2">
                  {stats.topKeywords.map(({ word, count }, i) => (
                    <div key={word} className="flex items-center gap-3">
                      <span className="text-xs text-[#475569] w-4">{i + 1}</span>
                      <span className="text-white flex-1">{word}</span>
                      <span className="text-[#6366F1] text-sm">{count}次</span>
                      <div className="w-20 h-2 bg-[#080B14] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6366F1] rounded-full"
                          style={{ width: `${(count / stats.topKeywords[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
