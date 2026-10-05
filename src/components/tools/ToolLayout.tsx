'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import DynamicIcon from '@/components/common/DynamicIcon'
import { PrivacyBadge } from '@/components/tool/PrivacyBadge'
import { ToolCard } from '@/components/tool/ToolCard'
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
}: ToolLayoutProps) {
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const activeSlug = toolSlug || slug || ''
  const tool = getToolBySlug(activeSlug)

  const { isFavorite, toggleFavorite } = useFavorites()
  const { recordRecentTool } = useRecentTools()

  // Track recent tool in storage & anonymous telemetry
  useEffect(() => {
    if (tool?.slug) {
      recordRecentTool(tool.slug)
      trackEvent('tool_open', { toolSlug: tool.slug, category: tool.category })
    }
  }, [tool?.slug, tool?.category, recordRecentTool])

  if (!tool) {
    return (
      <div className="flex min-h-screen flex-col bg-[#090D16] text-slate-100">
        <Header />
        <main className="flex-1 px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-white mb-2">
              {isZh ? '工具未找到' : 'Tool Not Found'}
            </h1>
            <p className="text-sm text-slate-400 mb-6">
              {isZh ? '所请求的工具不存在或已被调整' : 'The requested utility does not exist.'}
            </p>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs transition hover:bg-blue-500"
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

  const handleFavoriteToggle = () => {
    toggleFavorite(tool.slug)
    trackEvent('favorite', { toolSlug: tool.slug })
  }

  const hasSupportingContent = Boolean(
    (howToSteps && howToSteps.length > 0) ||
      principles ||
      (faq && faq.length > 0) ||
      (dataSources && dataSources.length > 0) ||
      disclaimer
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#090D16] text-slate-100">
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              {isZh ? '首页' : 'Home'}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <Link href="/tools" className="hover:text-white transition-colors">
              {isZh ? '工具中心' : 'Tools'}
            </Link>
            {category && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                <Link href={`/tools/${category.slug}`} className="hover:text-white transition-colors">
                  {categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-white font-semibold">{toolName}</span>
          </nav>

          {/* Streamlined Clean Tool Header */}
          <header className="mb-6 rounded-2xl border border-[#1E293B] bg-[#0F1523] p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-center shrink-0 text-blue-400">
                  <DynamicIcon name={tool.icon} className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {toolName}
                    </h1>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#141C2E] text-slate-400 border border-[#1E293B]">
                      {tool.toolType}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Tier-{tool.tier}
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                    {toolDesc}
                  </p>
                </div>
              </div>

              {/* Action and status chips */}
              <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center shrink-0">
                <PrivacyBadge mode={tool.privacyMode} variant="compact" />

                <button
                  type="button"
                  onClick={handleFavoriteToggle}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                    favorite
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : 'border-[#1E293B] bg-[#141C2E] text-slate-400 hover:text-white hover:bg-[#1A243B]'
                  }`}
                  title={favorite ? (isZh ? '已收藏（跨标签页实时同步）' : 'Saved (Cross-tab synced)') : (isZh ? '收藏此工具' : 'Save')}
                >
                  <Star className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
                  <span>{favorite ? (isZh ? '已收藏' : 'Saved') : (isZh ? '收藏' : 'Save')}</span>
                </button>

                <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#1E293B] bg-[#141C2E] text-[11px] text-slate-400 font-mono">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{tool.updatedAt}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Primary Tool Workspace (Undisputed Core Surface) */}
          <section aria-label="Tool Workspace" className="mb-8">
            {children}
          </section>

          {/* Ad Slot placed right after tool result */}
          <div className="mb-8">
            <AdSlot slotId={`tool-result-${activeSlug}`} format="horizontal" />
          </div>

          {/* Supporting Content (Unified Surface without Card Soup) */}
          {hasSupportingContent && (
            <div className="border-t border-[#1E293B] pt-8 mb-10 space-y-8">
              {/* How-to Steps */}
              {howToSteps && howToSteps.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <h2 className="text-sm sm:text-base font-bold text-white">
                      {isZh ? '使用方法与操作步骤' : 'Step-by-Step Instructions'}
                    </h2>
                  </div>
                  <ol className="grid gap-2.5 sm:grid-cols-2">
                    {howToSteps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0F1523] border border-[#1E293B] text-xs text-slate-300 leading-relaxed"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-[11px] font-bold text-blue-400 font-mono">
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
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <h2 className="text-sm sm:text-base font-bold text-white">{principlesTitle}</h2>
                  </div>
                  <div className="p-4 sm:p-5 rounded-xl bg-[#0F1523] border border-[#1E293B] text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
                    {principles}
                  </div>
                </section>
              )}

              {/* FAQ Section */}
              {faq && faq.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <h2 className="text-sm sm:text-base font-bold text-white">
                      {isZh ? '常见问题 (FAQ)' : 'Frequently Asked Questions'}
                    </h2>
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {faq.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#0F1523] border border-[#1E293B]"
                      >
                        <h3 className="font-semibold text-white text-xs sm:text-sm mb-1 flex items-start gap-1.5">
                          <span className="text-blue-400 font-mono text-xs mt-0.5">Q:</span>
                          <span>{item.question}</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed pl-4">
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
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isZh ? '数据溯源与基准参考' : 'Data Provenance & Benchmarks'}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {dataSources.map((ds, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#0F1523] border border-[#1E293B] text-xs"
                        >
                          <span className="font-medium text-white">{ds.name}: </span>
                          <span className="text-slate-400 text-[11px]">{ds.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300/90 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-amber-200">
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

          {/* Related Tools */}
          {related.length > 0 && (
            <section className="border-t border-[#1E293B] pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">
                  {isZh ? '相关工具推荐' : 'Related Utilities'}
                </h2>
                <Link
                  href="/tools"
                  className="text-xs text-slate-400 hover:text-blue-400 transition"
                >
                  {isZh ? '浏览全部 →' : 'View all →'}
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((rel) => (
                  <ToolCard key={rel.slug} tool={rel} />
                ))}
              </div>
            </section>
          )}

          {/* Page Bottom AdSlot */}
          <div className="mt-10">
            <AdSlot slotId={`tool-bottom-${activeSlug}`} format="horizontal" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
