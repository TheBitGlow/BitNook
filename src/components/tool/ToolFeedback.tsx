'use client'

import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown, Check, MessageSquare } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { useI18n } from '@/lib/i18n'

export interface ToolFeedbackProps {
  toolSlug: string
}

export function ToolFeedback({ toolSlug }: ToolFeedbackProps) {
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const [voted, setVoted] = useState<'helpful' | 'improve' | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const helpfulTagsZh = ['计算结果准确', '界面清爽快速', '功能符合预期', '操作简单直观']
  const helpfulTagsEn = ['Accurate results', 'Clean and fast', 'Meets expectations', 'Simple to use']
  const improveTagsZh = ['希望增加功能', '计算逻辑疑问', '遇到显示错误', '移动端体验需优化']
  const improveTagsEn = ['Feature request', 'Formula question', 'Display issue', 'Mobile UX need improvement']

  const handleVote = (rating: 'helpful' | 'improve') => {
    setVoted(rating)
    trackEvent('tool_feedback', {
      toolSlug,
      rating,
    })
  }

  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag)
    trackEvent('tool_feedback', {
      toolSlug,
      rating: voted || 'helpful',
      feedbackTag: tag,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-surface p-3.5 text-center shadow-subtle">
        <div className="flex items-center justify-center gap-2 text-xs text-success font-medium">
          <Check className="w-4 h-4" />
          <span>{isZh ? '感谢您的宝贵反馈！BitNook 将持续优化。' : 'Thank you for your feedback! BitNook keeps improving.'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          <span className="text-xs sm:text-sm font-medium text-text-primary">
            {isZh ? '这个工具有帮助吗？' : 'Was this tool helpful?'}
          </span>
          <span className="text-[11px] text-text-muted hidden md:inline">
            {isZh ? '（免登录 · 匿名产品体验反馈）' : '(No login · Anonymous)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleVote('helpful')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              voted === 'helpful'
                ? 'border-success/40 bg-success-subtle text-success'
                : 'border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{isZh ? '有帮助' : 'Helpful'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleVote('improve')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              voted === 'improve'
                ? 'border-danger/40 bg-danger-subtle text-danger'
                : 'border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{isZh ? '需要改进' : 'Needs Work'}</span>
          </button>
        </div>
      </div>

      {voted && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[11px] text-text-muted mb-2">
            {isZh ? '可选择具体的反馈标签（匿名提交）：' : 'Select a quick tag to help us improve (anonymous):'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(voted === 'helpful' ? (isZh ? helpfulTagsZh : helpfulTagsEn) : (isZh ? improveTagsZh : improveTagsEn)).map(
              (tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelectTag(tag)}
                  className="px-2.5 py-1 rounded-md text-xs bg-surface-secondary hover:bg-surface-active text-text-secondary hover:text-text-primary border border-border transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ToolFeedback
