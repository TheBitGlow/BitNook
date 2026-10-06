'use client'

import React from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { Logo } from '@/components/layout/Logo'

export default function Footer() {
  const { locale, toggleLocale } = useI18n()
  const isZh = locale === 'zh'

  return (
    <footer className="border-t border-border bg-surface mt-auto py-10 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border">
          {/* Left: Brand & Tagline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <Link href="/" className="focus-visible:outline-none">
              <Logo showText={true} subText={isZh ? '数字工具抽屉' : 'Digital Utility Drawer'} />
            </Link>
            <div className="text-xs text-text-secondary">
              {isZh ? '一站搞定，方寸万象 · All Tools, One Nook' : 'Everyday tools, in one quiet place.'}
            </div>
          </div>

          {/* Center: Core Direct Links */}
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-secondary">
            <Link href="/tools" className="hover:text-text-primary transition-colors">
              {isZh ? '全部工具' : 'Tools'}
            </Link>
            <Link href="/games" className="hover:text-text-primary transition-colors">
              {isZh ? '经典小憩' : 'Games'}
            </Link>
            <Link href="/about" className="hover:text-text-primary transition-colors">
              {isZh ? '关于' : 'About'}
            </Link>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">
              {isZh ? '隐私政策' : 'Privacy'}
            </Link>
            <Link href="/terms" className="hover:text-text-primary transition-colors">
              {isZh ? '服务条款' : 'Terms'}
            </Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('bitnook-open-consent'))
                }
              }}
              className="hover:text-text-primary transition-colors text-xs text-text-secondary cursor-pointer"
            >
              {isZh ? 'Cookie 设置' : 'Cookie Preferences'}
            </button>
          </nav>

          {/* Right: Language switch */}
          <div>
            <button
              type="button"
              onClick={toggleLocale}
              className="text-xs text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1.5"
            >
              <span>{isZh ? '语言 / Language:' : 'Language / 语言:'}</span>
              <span className="font-mono text-text-secondary underline underline-offset-2">
                {isZh ? '中文' : 'English'}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom micro bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-text-muted">
          <p>© {new Date().getFullYear()} BitNook. 本地运算优先 · 绝无多余广告干扰</p>
          <p className="font-mono">v0.2.0 · Quiet Utility Design System</p>
        </div>
      </div>
    </footer>
  )
}
