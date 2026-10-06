'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Type, Copy, Check, Trash2, Clock, BarChart3, Mic, Hash, Smile, Globe } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { analyzeText } from '@/core/tools/daily'

export default function WordCountPage() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedReport, setCopiedReport] = useState(false)

  const stats = useMemo(() => {
    const base = analyzeText(text)

    // Top keyword frequency (for Latin words and CJK terms > 1 char)
    const words_arr = text.toLowerCase().match(/[a-z0-9\u4e00-\u9fa5]+/g) || []
    const freq: Record<string, number> = {}
    words_arr.forEach((w) => {
      if (w.length > 1) freq[w] = (freq[w] || 0) + 1
    })
    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }))

    return {
      ...base,
      topKeywords,
    }
  }, [text])

  const handleCopyText = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    trackEvent('copy', { tool: 'word-count' })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyReport = async () => {
    const report = [
      `【BitNook 文本字数与阅读时长分析】`,
      `• 总字符数：${stats.totalChars.toLocaleString()} (去空白符: ${stats.charsNoSpaces.toLocaleString()})`,
      `• 中文字符：${stats.chineseChars.toLocaleString()} 字`,
      `• 英文单词：${stats.englishWords.toLocaleString()} 词`,
      `• 数字总计：${stats.numbers.toLocaleString()} 个`,
      `• 表情符号：${stats.emojis.toLocaleString()} 个`,
      `• 标点符号：${stats.punctuation.toLocaleString()} 个`,
      `• 行数 / 段落数：${stats.lines.toLocaleString()} 行 / ${stats.paragraphs.toLocaleString()} 段`,
      `• 预估默读耗时：约 ${stats.estimatedReadingMinutes} 分钟 (中文 ~350字/分，英文 ~200词/分)`,
      `• 预估朗读耗时：约 ${stats.estimatedSpeechMinutes} 分钟 (中文 ~250字/分，英文 ~150词/分)`,
      stats.topKeywords.length > 0
        ? `• 高频词 Top 5：${stats.topKeywords.slice(0, 5).map((k) => `${k.word}(${k.count})`).join('、')}`
        : '',
      `分析特点：纯浏览器本地分词计算，无敏感信息外泄。`,
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(report)
      setCopiedReport(true)
      trackEvent('copy', { tool: 'word-count' })
      setTimeout(() => setCopiedReport(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleClear = () => {
    setText('')
  }

  return (
    <ToolLayout
      toolSlug="word-count"
      principlesTitle="文本统计与中英文混合分词算法原理"
      principles={
        <>
          <p>
            <strong>1. 中英文混合字符与单词精确切分：</strong>
            中文（CJK Unified Ideographs）以独立象形单字计数；英文则使用单词边界边界切分（拉丁词素）。全字符统计包含 Unicode 换行与空白，净字符剔除空白符号。
          </p>
          <p>
            <strong>2. 语速与阅读时长经验模型：</strong>
            成年人中文静息默读常模约为 300~500 字/分钟（基准取 350 字/分），演讲朗读约为 250 字/分钟；英文阅读常模约 200 词/分钟，朗读约 150 词/分钟。
          </p>
          <p>
            <strong>3. 本地词频词袋统计与隐私保障：</strong>
            文本全部在浏览器本地内存进行正则分词与词频直方图聚类，绝不向任何云端上传用户私密文本内容。
          </p>
        </>
      }
      howToSteps={[
        '复制或在多行文本框中输入任意长文本、论文草稿、文案或代码注释。',
        '系统实时计算中文字符、英文单词、数字、表情符、标点及行段分布。',
        '下方即时呈现预估默读/朗读耗时与高频词频 Top 10 直方图。',
        '支持一键复制统计分析摘要或一键清空重置。',
      ]}
      faq={[
        {
          question: '中英文混排时单词数是如何统计的？',
          answer:
            '中文统计汉字字符数（CJK 统一汉字区间），英文使用单词正则边界提取完整词素，数字与表情符号均独立区分展示。',
        },
        {
          question: '我的敏感文本会被存储或上传吗？',
          answer:
            '绝对不会。BitNook 所有文本统计均在本地 JavaScript 引擎执行，无后端日志记录，无任何云端 AI 收集，完全离线安全。',
        },
      ]}
      dataSources={[
        { name: 'Unicode 15.0 标准字符属性规范', description: '跨语种字符分类与标点空白界定' },
        { name: '心理语言学成年人阅读速率元分析 (Rayner et al.)', description: '中英文静息默读速率与信息吸收时长常数' },
      ]}
      disclaimer="阅读时长为基于统计常模的估算值，实际耗时因读者背景知识、文本复杂度和阅读深度而异。"
    >
      <div className="space-y-6">
        {/* Text Input Card */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary">输入或粘贴文本</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyReport}
                disabled={!text}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-elevated text-xs font-medium text-text-secondary hover:text-text-primary hover:border-accent-primary/50 disabled:opacity-40 transition-colors"
                title="复制字数统计分析结果"
              >
                {copiedReport ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success" />
                    <span className="text-success">已复制分析</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>复制分析报告</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCopyText}
                disabled={!text}
                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg border border-border bg-surface-elevated hover:border-accent-primary/50 disabled:opacity-40 transition"
                title="复制纯文本"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={!text}
                className="p-1.5 text-text-muted hover:text-danger rounded-lg border border-border bg-surface-elevated hover:border-danger/40 disabled:opacity-40 transition"
                title="清空内容"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入或粘贴需要统计的文本、中英混合稿件、论文或代码段落..."
            className="w-full h-60 px-4 py-3 bg-canvas border border-border rounded-xl text-text-primary placeholder:text-text-muted font-mono text-sm focus:outline-none focus:border-accent-primary resize-none transition-colors"
          />
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card text-center p-4">
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-text-primary mb-1">
              {stats.totalChars.toLocaleString()}
            </p>
            <p className="text-xs text-text-muted">总字符数 (含空格)</p>
          </div>
          <div className="card text-center p-4">
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-accent-primary mb-1">
              {stats.charsNoSpaces.toLocaleString()}
            </p>
            <p className="text-xs text-text-muted">净字符数 (去空格)</p>
          </div>
          <div className="card text-center p-4">
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mb-1">
              {stats.chineseChars.toLocaleString()}
            </p>
            <p className="text-xs text-text-muted">中文字符 (CJK)</p>
          </div>
          <div className="card text-center p-4">
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mb-1">
              {stats.englishWords.toLocaleString()}
            </p>
            <p className="text-xs text-text-muted">英文单词</p>
          </div>
        </div>

        {/* Secondary Details Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg border border-border bg-surface text-center">
            <div className="flex items-center justify-center gap-1 text-text-muted mb-1">
              <Hash className="w-3.5 h-3.5" />
              <span className="text-xs">数字</span>
            </div>
            <p className="font-mono font-bold text-sm text-text-primary">{stats.numbers.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-surface text-center">
            <div className="flex items-center justify-center gap-1 text-text-muted mb-1">
              <Smile className="w-3.5 h-3.5" />
              <span className="text-xs">表情符号</span>
            </div>
            <p className="font-mono font-bold text-sm text-text-primary">{stats.emojis.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-surface text-center">
            <div className="flex items-center justify-center gap-1 text-text-muted mb-1">
              <Type className="w-3.5 h-3.5" />
              <span className="text-xs">标点符号</span>
            </div>
            <p className="font-mono font-bold text-sm text-text-primary">{stats.punctuation.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-surface text-center">
            <div className="flex items-center justify-center gap-1 text-text-muted mb-1">
              <span className="text-xs">总行数</span>
            </div>
            <p className="font-mono font-bold text-sm text-text-primary">{stats.lines.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-surface text-center col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center gap-1 text-text-muted mb-1">
              <span className="text-xs">段落数</span>
            </div>
            <p className="font-mono font-bold text-sm text-text-primary">{stats.paragraphs.toLocaleString()}</p>
          </div>
        </div>

        {/* Reading Time & Keywords Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reading Time */}
          <div className="card space-y-4">
            <h3 className="text-text-primary font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-primary" />
              阅读与演讲耗时预估
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center py-5 bg-canvas rounded-xl border border-border">
                <p className="text-3xl font-extrabold text-accent-primary font-mono">{stats.estimatedReadingMinutes}</p>
                <p className="text-xs text-text-muted mt-1">默读耗时 (分钟)</p>
                <p className="text-[11px] text-text-muted/70 mt-0.5">中文 350字/分 · 英文 200词/分</p>
              </div>
              <div className="text-center py-5 bg-canvas rounded-xl border border-border">
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  {stats.estimatedSpeechMinutes}
                </p>
                <p className="text-xs text-text-muted mt-1">演讲/朗读耗时 (分钟)</p>
                <p className="text-[11px] text-text-muted/70 mt-0.5">中文 250字/分 · 英文 150词/分</p>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="card space-y-4">
            <h3 className="text-text-primary font-semibold text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent-primary" />
              高频词频 Top 10
            </h3>
            {stats.topKeywords.length === 0 ? (
              <p className="text-text-muted text-center py-8 text-xs bg-canvas rounded-xl border border-border">
                输入更多文本后将自动呈现关键词分布
              </p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {stats.topKeywords.map(({ word, count }, i) => (
                  <div key={word} className="flex items-center gap-3 text-xs">
                    <span className="text-text-muted w-4 font-mono">{i + 1}</span>
                    <span className="text-text-secondary flex-1 truncate font-medium">{word}</span>
                    <span className="text-accent-primary font-mono font-semibold">{count}次</span>
                    <div className="w-20 h-1.5 bg-canvas rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-accent-primary rounded-full"
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
    </ToolLayout>
  )
}
