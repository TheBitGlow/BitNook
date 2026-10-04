'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Wrench, Gamepad2, User, Menu, X, Languages } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t, toggleLocale } = useI18n()

  return (
    <header className="sticky top-0 z-50 bg-[#080B14]/90 backdrop-blur-md border-b border-[rgba(99,102,241,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent">
              BitNook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/tools" className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              {t('common.tools')}
            </Link>
            <Link href="/games" className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              {t('common.games')}
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleLocale}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(99,102,241,0.3)] text-[#94A3B8] hover:text-white hover:border-[rgba(99,102,241,0.6)] transition-all"
              aria-label="Switch language"
              data-no-translate
            >
              <Languages className="w-4 h-4" />
              <span className="text-sm">{t('common.languageToggle')}</span>
            </button>
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(99,102,241,0.3)] text-[#94A3B8] hover:text-white hover:border-[rgba(99,102,241,0.6)] transition-all"
            >
              <User className="w-4 h-4" />
              {t('common.signIn')}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-[#94A3B8]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[rgba(99,102,241,0.15)]">
            <nav className="flex flex-col gap-4">
              <Link
                href="/tools"
                className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Wrench className="w-4 h-4" />
                {t('common.tools')}
              </Link>
              <Link
                href="/games"
                className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Gamepad2 className="w-4 h-4" />
                {t('common.games')}
              </Link>
              <Link
                href="/auth/login"
                className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                {t('common.signIn')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
