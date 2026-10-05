'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wrench,
  Gamepad2,
  Search,
  User,
  Menu,
  X,
  Languages,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { getAllCategories } from '@/config/categories'
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal'
import DynamicIcon from '@/components/common/DynamicIcon'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { t, locale, toggleLocale } = useI18n()
  const isZh = locale === 'zh'
  const categories = getAllCategories()

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdowns on route change without cascading effect
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileMenuOpen(false)
    setCategoryDropdownOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-white tracking-tight leading-none">
                  BitNook
                </span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight">
                  {isZh ? '比特角落' : 'Tools Hub'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <Link
                href="/tools"
                className={`transition-colors flex items-center gap-1.5 ${
                  pathname === '/tools' ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>{t('common.tools')}</span>
              </Link>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                  onBlur={() => setTimeout(() => setCategoryDropdownOpen(false), 200)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    pathname.startsWith('/tools/') && pathname !== '/tools'
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  aria-expanded={categoryDropdownOpen}
                >
                  <Layers className="w-4 h-4" />
                  <span>{isZh ? '分类' : 'Categories'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      categoryDropdownOpen ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-[#1E293B] bg-[#0F1523] p-2 shadow-2xl z-50">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase px-3 py-1 tracking-wider">
                      {isZh ? '工具分类' : 'Categories'}
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/tools/${cat.slug}`}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#141C2E] transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#141C2E] border border-[#1E293B] flex items-center justify-center text-blue-400 group-hover:text-white shrink-0">
                          <DynamicIcon name={cat.iconName} className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors block">
                            {isZh ? cat.name : cat.nameEn}
                          </span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">
                            {isZh ? cat.description : cat.descriptionEn}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/games"
                className={`transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/games') ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-4 h-4 text-pink-400" />
                <span>{t('common.games')}</span>
              </Link>

              <Link
                href="/pricing"
                className={`transition-colors flex items-center gap-1.5 ${
                  pathname === '/pricing' ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isZh ? '会员' : 'Pro'}</span>
              </Link>
            </nav>

            {/* Search Trigger (Center/Right on Desktop) */}
            <div className="flex-1 max-w-sm hidden md:block">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-[#1E293B] bg-[#0F1523] hover:border-slate-700 hover:bg-[#141C2E] text-slate-400 text-xs transition-colors group shadow-inner"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  <span>{isZh ? '搜索工具、计算器、游戏...' : 'Search tools, games...'}</span>
                </div>
                <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#141C2E] text-slate-400 border border-[#1E293B]">
                  <span className="text-[10px]">⌘</span>K
                </kbd>
              </button>
            </div>

            {/* Right Action Icons & Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#141C2E] transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Language Switch */}
              <button
                type="button"
                onClick={toggleLocale}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#1E293B] bg-[#0F1523] text-slate-300 hover:text-white hover:border-slate-700 hover:bg-[#141C2E] transition-colors text-xs font-medium"
                aria-label="Switch language"
                data-no-translate
              >
                <Languages className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('common.languageToggle')}</span>
              </button>

              {/* Sign In */}
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1E293B] bg-[#0F1523] text-slate-300 hover:text-white hover:border-slate-700 hover:bg-[#141C2E] transition-colors text-xs font-medium"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('common.signIn')}</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#141C2E] transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-[#1E293B] animate-in fade-in duration-150">
              <nav className="flex flex-col gap-2">
                <Link
                  href="/tools"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#141C2E] text-slate-200 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <span>{t('common.tools')}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">45</span>
                </Link>

                {/* Mobile Categories list */}
                <div className="pl-6 space-y-1 border-l-2 border-[#1E293B] my-1 ml-3">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/tools/${cat.slug}`}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#141C2E]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <DynamicIcon name={cat.iconName} className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isZh ? cat.name : cat.nameEn}</span>
                    </Link>
                  ))}
                </div>

                <Link
                  href="/games"
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#141C2E] text-slate-200 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Gamepad2 className="w-4 h-4 text-pink-400" />
                  <span>{t('common.games')}</span>
                </Link>

                <Link
                  href="/pricing"
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#141C2E] text-slate-200 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isZh ? '会员订阅' : 'Pricing'}</span>
                </Link>

                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#141C2E] text-slate-200 text-sm font-medium border-t border-[#1E293B] mt-2 pt-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{t('common.signIn')}</span>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
