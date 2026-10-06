'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wrench,
  Gamepad2,
  Search,
  Menu,
  X,
  Languages,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Logo } from '@/components/layout/Logo'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const { t, locale, toggleLocale } = useI18n()
  const isZh = locale === 'zh'

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileMenuOpen(false)
  }

  const isToolsActive = pathname.startsWith('/tools')
  const isGamesActive = pathname.startsWith('/games')

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* 1. Brand Logo */}
            <Link
              href="/"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1"
            >
              <Logo subText={isZh ? '方寸万象' : 'All Tools, One Nook'} />
            </Link>

            {/* 2 & 3. Primary Navigation (Clean & Direct, Max 6 Items) */}
            <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-text-secondary">
              <Link
                href="/tools"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isToolsActive
                    ? 'text-text-primary bg-surface-secondary font-semibold'
                    : 'hover:text-text-primary hover:bg-surface-secondary/70'
                }`}
              >
                <span>{t('common.tools')}</span>
              </Link>

              <Link
                href="/games"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isGamesActive
                    ? 'text-text-primary bg-surface-secondary font-semibold'
                    : 'hover:text-text-primary hover:bg-surface-secondary/70'
                }`}
              >
                <span>{isZh ? '经典小憩' : 'Games'}</span>
              </Link>
            </nav>

            {/* 4, 5, 6. Action Controls: Search, Theme, Language */}
            <div className="flex items-center gap-2">
              {/* Quick Search Button (Desktop) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-surface-secondary/80 hover:bg-surface-secondary border border-border text-text-muted hover:text-text-secondary text-xs transition-colors w-44 md:w-52 cursor-pointer"
                aria-label="全局搜索"
              >
                <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <span className="truncate flex-1 text-left">
                  {isZh ? '搜索工具与计算器...' : 'Search tools...'}
                </span>
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface border border-border text-text-muted">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Search Icon Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="sm:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                aria-label="搜索"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Theme Toggle (Light / Dark) */}
              <ThemeToggle />

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLocale}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary text-xs font-medium transition-colors cursor-pointer"
                title={isZh ? 'Switch to English' : '切换为中文'}
                aria-label="切换语言"
              >
                <Languages className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px] uppercase">{locale}</span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <Link
              href="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 p-2.5 rounded-md text-sm font-medium transition-colors ${
                isToolsActive
                  ? 'bg-accent-subtle text-accent font-semibold'
                  : 'bg-surface-secondary text-text-primary'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{t('common.tools')} (35)</span>
            </Link>

            <Link
              href="/games"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 p-2.5 rounded-md text-sm font-medium transition-colors ${
                isGamesActive
                  ? 'bg-accent-subtle text-accent font-semibold'
                  : 'bg-surface-secondary text-text-primary'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{isZh ? '经典小憩 (8)' : 'Games (8)'}</span>
            </Link>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
