'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import DynamicIcon from '@/components/common/DynamicIcon'
import { PrivacyBadge } from '@/components/tool/PrivacyBadge'
import { ToolCard } from '@/components/tool/ToolCard'
import { ToolFeedback } from '@/components/tool/ToolFeedback'
import { getToolBySlug, getRelatedTools } from '@/config/tools'
import { getCategoryBySlug } from '@/config/categories'
import { useI18n } from '@/lib/i18n'
import { useFavorites, useRecentTools } from '@/lib/storage'
import { trackEvent } from '@/lib/analytics'
import {
  ChevronRight,
  Star,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Info,
  Calendar,
  Layers,
  Share2,
  Check,
  FileText,
} from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string
}

export interface DataSourceItem {
  name: string
  url?: string
  description?: string
}

export interface ToolLayoutProps {
  toolSlug?: string
  slug?: string
  children: React.ReactNode
  principlesTitle?: string
  principles?: React.ReactNode
  howToSteps?: string[]
  faq?: FAQItem[]
  disclaimer?: string
  dataSources?: DataSourceItem[]
  example?: React.ReactNode
}

export default function ToolLayout({
  toolSlug,
  slug,
  children,
  principlesTitle = '计算与技术原理',
  principles,
  howToSteps,
  faq,
  disclaimer,
  dataSources,
  example,
}: ToolLayoutProps) {
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const activeSlug = toolSlug || slug || ''
  const tool = getToolBySlug(activeSlug)

  const { isFavorite, toggleFavorite } = useFavorites()
  const { recordRecentTool } = useRecentTools()
  const [shareToast, setShareToast] = useState(false)

  // Track recent tool in storage & anonymous telemetry
  useEffect(() => {
    if (tool?.slug) {
      recordRecentTool(tool.slug)
      trackEvent('tool_open', { toolSlug: tool.slug, category: tool.category })
    }
  }, [tool?.slug, tool?.category, recordRecentTool])

  if (!tool) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas text-text-primary">
        <Header />
        <main className="flex-1 px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold text-text-primary mb-2">
              {isZh ? '工具未找到' : 'Tool Not Found'}
            </h1>
            <p className="text-xs text-text-secondary mb-6">
              {isZh ? '所请求的工具不存在或已被调整' : 'The requested utility does not exist.'}
            </p>
            <Link
              href="/tools"
              className="btn-primary"
            >
              {isZh ? '返回工具中心' : 'Browse Tools'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const category = getCategoryBySlug(tool.category)
  const related = getRelatedTools(tool).slice(0, 3)
  const favorite = isFavorite(tool.slug)

  const toolName = isZh ? tool.name : tool.nameEn
  const toolDesc = isZh ? tool.description : tool.descriptionEn
  const categoryName = category ? (isZh ? category.name : category.nameEn) : ''

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${tool.href}` : tool.href
    const title = isZh ? `${tool.name} · BitNook 工具箱` : `${tool.nameEn} · BitNook`
    const text = isZh ? `${tool.name}: ${tool.description}` : `${tool.nameEn}: ${tool.descriptionEn}`

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text, url })
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2000)
      }
      trackEvent('copy', { toolSlug: tool.slug })
    } catch {
      // user cancel or unsupported
    }
  }

  const handleFavoriteToggle = () => {
    toggleFavorite(tool.slug)
    trackEvent('favorite', { toolSlug: tool.slug })
  }

  const hasSupportingContent = Boolean(
    (howToSteps && howToSteps.length > 0) ||
      principles ||
      example ||
      (faq && faq.length > 0) ||
      (dataSources && dataSources.length > 0) ||
      disclaimer
  )

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-text-primary">
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <div className="mx-auto max-w-[1040px]">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-text-muted font-mono">
            <Link href="/" className="hover:text-text-primary transition-colors">
              {isZh ? '首页' : 'Home'}
            </Link>
            <ChevronRight className="h-3 w-3 text-text-muted opacity-50" />
            <Link href="/tools" className="hover:text-text-primary transition-colors">
              {isZh ? '全部工具' : 'Tools'}
            </Link>
            {category && (
              <>
                <ChevronRight className="h-3 w-3 text-text-muted opacity-50" />
                <Link href={`/tools/${category.slug}`} className="hover:text-text-primary transition-colors">
                  {categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3 text-text-muted opacity-50" />
            <span className="text-text-primary font-medium">{toolName}</span>
          </nav>

          {/* Workbench Header */}
          <header className="mb-6 pb-5 border-b border-border/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface border border-border/80 shadow-subtle flex items-center justify-center shrink-0 text-accent">
                  <DynamicIcon name={tool.icon} className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
                      {toolName}
                    </h1>
                    <span className="font-mono text-[10px] uppercase text-text-muted px-1.5 py-0.5 rounded bg-surface-secondary border border-border/60">
                      {tool.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {toolDesc}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-center shrink-0">
                <PrivacyBadge mode={tool.privacyMode} variant="compact" />

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border/80 bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary text-xs font-medium transition cursor-pointer shadow-subtle"
                  title={isZh ? '安全分享工具' : 'Safe Share'}
                >
                  {shareToast ? <Check className="w-3.5 h-3.5 text-success" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{shareToast ? (isZh ? '已复制' : 'Copied') : (isZh ? '分享' : 'Share')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFavoriteToggle}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition cursor-pointer shadow-subtle ${
                    favorite
                      ? 'border-amber-400/40 bg-amber-400/10 text-amber-500'
                      : 'border-border/80 bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                  }`}
                  title={favorite ? (isZh ? '已收藏' : 'Saved') : (isZh ? '收藏此工具' : 'Save')}
                >
                  <Star className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
                  <span>{favorite ? (isZh ? '已收藏' : 'Saved') : (isZh ? '收藏' : 'Save')}</span>
                </button>

                <div className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border/80 bg-surface text-[11px] text-text-muted font-mono">
                  <Calendar className="w-3 h-3 text-text-muted" />
                  <span>{tool.updatedAt}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Primary Tool Workbench (Dedicated Surface: "先操作，再阅读") */}
          <section aria-label="Tool Workspace" className="mb-8">
            <div className="rounded-xl border border-border/80 bg-surface p-5 sm:p-7 shadow-subtle">
              {children}
            </div>
          </section>

          {/* Ad Slot placed right after tool result */}
          <div className="mb-8">
            <AdSlot slotId={`tool-result-${activeSlug}`} format="horizontal" />
          </div>

          {/* Supporting Content (Structured Documentation & Reference) */}
          {hasSupportingContent && (
            <div className="border-t border-border/70 pt-8 mb-8 space-y-7">
              {/* How-to Steps */}
              {howToSteps && howToSteps.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-accent" />
                    <h2 className="text-sm sm:text-base font-semibold text-text-primary">
                      {isZh ? '使用方法与操作步骤' : 'Step-by-Step Instructions'}
                    </h2>
                  </div>
                  <ol className="grid gap-2 sm:grid-cols-2">
                    {howToSteps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-md bg-surface border border-border/70 text-xs text-text-secondary leading-relaxed shadow-subtle"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent-subtle text-[11px] font-bold text-accent font-mono">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Principles / Technical Background */}
              {principles && (
                <section>
                  <div className="flex items-center gap-2 mb-2.5">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <h2 className="text-sm sm:text-base font-semibold text-text-primary">{principlesTitle}</h2>
                  </div>
                  <div className="p-4 sm:p-5 rounded-md bg-surface border border-border/70 text-xs sm:text-sm text-text-secondary leading-relaxed space-y-2 shadow-subtle">
                    {principles}
                  </div>
                </section>
              )}

              {/* Practical Example Section */}
              {example && (
                <section>
                  <div className="flex items-center gap-2 mb-2.5">
                    <FileText className="w-4 h-4 text-accent" />
                    <h2 className="text-sm sm:text-base font-semibold text-text-primary">
                      {isZh ? '真实测算与实操示例' : 'Practical Example Case'}
                    </h2>
                  </div>
                  <div className="p-4 sm:p-5 rounded-md bg-surface border border-border/70 text-xs sm:text-sm text-text-secondary leading-relaxed space-y-2 shadow-subtle">
                    {example}
                  </div>
                </section>
              )}

              {/* FAQ Section */}
              {faq && faq.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-accent" />
                    <h2 className="text-sm sm:text-base font-semibold text-text-primary">
                      {isZh ? '常见问题 (FAQ)' : 'Frequently Asked Questions'}
                    </h2>
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {faq.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-md bg-surface border border-border/70 shadow-subtle"
                      >
                        <h3 className="font-medium text-text-primary text-xs sm:text-sm mb-1 flex items-start gap-1.5">
                          <span className="text-accent font-mono text-xs mt-0.5">Q:</span>
                          <span>{item.question}</span>
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed pl-4">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Data Provenance & Disclaimer Unified Panel */}
              <section className="space-y-3">
                {dataSources && dataSources.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-text-secondary">
                      <Info className="w-3.5 h-3.5 text-accent" />
                      <span>{isZh ? '数据溯源与基准参考' : 'Data Provenance & Benchmarks'}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {dataSources.map((ds, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-md bg-surface border border-border/70 text-xs shadow-subtle"
                        >
                          <span className="font-medium text-text-primary">{ds.name}: </span>
                          <span className="text-text-secondary text-[11px]">{ds.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-md border border-warning/25 bg-warning-subtle text-xs text-text-secondary flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-text-primary">
                      {isZh ? '合规与免责声明：' : 'Disclaimer: '}
                    </span>
                    <span>
                      {disclaimer ||
                        (isZh
                          ? '本工具计算结果及参考数据仅供方案评估与技术自查使用，不构成任何法律合规保证、投资财务决策依据或医疗临床诊断建议。关键业务请以国家官方政策、税务申报、银行实际合同或执业医师诊断为准。'
                          : 'Calculations and reference data provided by this tool are for evaluation and self-checking purposes only and do not constitute legal, medical, or financial advice.')}
                    </span>
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* Tool Helpful Feedback */}
          <div className="my-7">
            <ToolFeedback toolSlug={tool.slug} />
          </div>

          {/* Related Tools: You May Also Need */}
          {related.length > 0 && (
            <section className="border-t border-border/70 pt-7">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-text-primary">
                    {isZh ? '你可能还需要' : 'You May Also Need'}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {isZh ? '同流程高频协同实用工具，点击即可无缝体验' : 'Handpicked companion utilities in the same workflow'}
                  </p>
                </div>
                <Link
                  href="/tools"
                  className="text-xs text-text-muted hover:text-accent transition-colors"
                >
                  {isZh ? '浏览全部 →' : 'View all →'}
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {related.map((rel) => (
                  <div
                    key={rel.slug}
                    onClick={() => trackEvent('related_tool_click', { toolSlug: rel.slug })}
                  >
                    <ToolCard tool={rel} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Page Bottom AdSlot */}
          <div className="mt-8">
            <AdSlot slotId={`tool-bottom-${activeSlug}`} format="horizontal" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
