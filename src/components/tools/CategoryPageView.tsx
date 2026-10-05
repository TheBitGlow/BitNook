'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import DynamicIcon from '@/components/common/DynamicIcon'
import { ToolCard } from '@/components/tool/ToolCard'
import { getCategoryBySlug, getAllCategories, CategorySlug } from '@/config/categories'
import { getToolsByCategory } from '@/config/tools'
import { useI18n } from '@/lib/i18n'
import { ChevronRight, ArrowRight } from 'lucide-react'

interface CategoryPageViewProps {
  categorySlug: string
}

export default function CategoryPageView({ categorySlug }: CategoryPageViewProps) {
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const category = getCategoryBySlug(categorySlug)
  const allCategories = getAllCategories()

  if (!category) {
    return (
      <div className="flex flex-col min-h-screen bg-[#090D16] text-slate-100">
        <Header />
        <main className="flex-1 py-16 px-4 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4 text-2xl font-bold font-mono">
              404
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isZh ? '分类未找到' : 'Category Not Found'}
            </h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              {isZh
                ? '抱歉，您访问的工具分类不存在或已被调整。'
                : 'The category you are looking for does not exist or has been reorganized.'}
            </p>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition"
            >
              <span>{isZh ? '浏览全部工具' : 'Browse All Tools'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const tools = getToolsByCategory(category.slug as CategorySlug)
  const otherCategories = allCategories.filter((c) => c.slug !== category.slug)

  return (
    <div className="flex flex-col min-h-screen bg-[#090D16] text-slate-100">
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
            <Link href="/" className="hover:text-slate-200 transition">
              {isZh ? '首页' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/tools" className="hover:text-slate-200 transition">
              {isZh ? '工具中心' : 'Tools'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-semibold">{isZh ? category.name : category.nameEn}</span>
          </nav>

          {/* Category Banner */}
          <div className="rounded-2xl border border-[#1E293B] bg-[#0F1523] p-6 sm:p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-center shrink-0 text-blue-400">
                  <DynamicIcon
                    name={category.iconName}
                    className="w-7 h-7"
                    style={{ color: category.color }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {isZh ? category.name : category.nameEn}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {isZh ? `${tools.length} 款可用工具` : `${tools.length} Tools`}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                    {isZh ? category.description : category.descriptionEn}
                  </p>
                </div>
              </div>

              {/* Other categories quick switch */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500 mr-1 hidden sm:inline">
                  {isZh ? '切换分类:' : 'Switch:'}
                </span>
                {otherCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/tools/${c.slug}`}
                    className="px-3 py-1.5 rounded-xl border border-[#1E293B] bg-[#141C2E] hover:border-slate-700 hover:bg-[#1A243B] text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5"
                  >
                    <DynamicIcon name={c.iconName} className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isZh ? c.name : c.nameEn}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <AdSlot slotId="category-top-banner" format="horizontal" />

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>

          <div className="mt-12">
            <AdSlot slotId="category-bottom-banner" format="horizontal" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
