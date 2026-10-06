'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import DynamicIcon from '@/components/common/DynamicIcon'
import { ToolCard } from '@/components/tool/ToolCard'
import { getCategoryBySlug, getAllCategories, CategorySlug } from '@/config/categories'
import { getToolsByCategory } from '@/config/tools'
import { useI18n } from '@/lib/i18n'
import { ChevronRight, ArrowRight, Search, X } from 'lucide-react'

interface CategoryPageViewProps {
  categorySlug: string
}

export default function CategoryPageView({ categorySlug }: CategoryPageViewProps) {
  const { locale } = useI18n()
  const isZh = locale === 'zh'
  const category = getCategoryBySlug(categorySlug)
  const allCategories = getAllCategories()
  const [filterQuery, setFilterQuery] = useState('')

  if (!category) {
    return (
      <div className="flex flex-col min-h-screen bg-canvas text-text-primary">
        <Header />
        <main className="flex-1 py-16 px-4 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-xl font-bold text-text-primary mb-2">
              {isZh ? '分类未找到' : 'Category Not Found'}
            </h1>
            <p className="text-text-secondary text-xs mb-6 leading-relaxed">
              {isZh
                ? '抱歉，您访问的工具分类不存在或已被调整。'
                : 'The category you are looking for does not exist or has been reorganized.'}
            </p>
            <Link
              href="/tools"
              className="btn-primary"
            >
              <span>{isZh ? '浏览全部工具' : 'Browse All Tools'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const allCategoryTools = getToolsByCategory(category.slug as CategorySlug)
  const tools = filterQuery.trim()
    ? allCategoryTools.filter(
        (t) =>
          t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
          t.nameEn.toLowerCase().includes(filterQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : allCategoryTools

  const otherCategories = allCategories.filter((c) => c.slug !== category.slug)

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-4 font-medium">
            <Link href="/" className="hover:text-text-primary transition-colors">
              {isZh ? '首页' : 'Home'}
            </Link>
            <ChevronRight className="w-3 h-3 text-text-muted opacity-60" />
            <Link href="/tools" className="hover:text-text-primary transition-colors">
              {isZh ? '工具目录' : 'Tools'}
            </Link>
            <ChevronRight className="w-3 h-3 text-text-muted opacity-60" />
            <span className="text-text-primary font-medium">{isZh ? category.name : category.nameEn}</span>
          </nav>

          {/* Category Directory Header */}
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-7 shadow-subtle mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-md bg-surface-secondary border border-border flex items-center justify-center shrink-0 text-accent">
                  <DynamicIcon name={category.iconName} className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
                      {isZh ? category.name : category.nameEn}
                    </h1>
                    <span className="font-mono text-[10px] text-text-muted px-2 py-0.5 rounded bg-surface-secondary border border-border">
                      {allCategoryTools.length} {isZh ? '款工具' : 'tools'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-xl leading-relaxed">
                    {isZh ? category.description : category.descriptionEn}
                  </p>
                </div>
              </div>

              {/* Quick in-category search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={isZh ? '在此分类中查找...' : 'Filter this category...'}
                  className="w-full pl-8 pr-7 py-1.5 bg-surface-secondary border border-border rounded-md text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
                {filterQuery && (
                  <button
                    onClick={() => setFilterQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Compact Tool Tiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-10">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>

          {tools.length === 0 && (
            <div className="text-center py-12 rounded-lg border border-dashed border-border p-6 text-xs text-text-muted">
              {isZh ? '在此分类下未找到匹配的工具' : 'No tools matched your search in this category.'}
            </div>
          )}

          {/* Other Categories Switcher */}
          <div className="pt-8 border-t border-border">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              {isZh ? '浏览其他分类' : 'Other Categories'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {otherCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tools/${cat.slug}`}
                  className="p-2.5 rounded-md border border-border bg-surface hover:bg-surface-hover transition-colors flex items-center justify-between text-xs text-text-secondary hover:text-text-primary group shadow-subtle"
                >
                  <span className="truncate">{isZh ? cat.name : cat.nameEn}</span>
                  <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <AdSlot slotId={`category-${categorySlug}`} format="horizontal" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
