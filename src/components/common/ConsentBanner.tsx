'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ADS_CONFIG } from '@/config/ads'
import { ShieldCheck, Cookie, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function ConsentBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const { locale } = useI18n()
  const isZh = locale === 'zh'

  useEffect(() => {
    try {
      const consent = localStorage.getItem(ADS_CONFIG.consentStorageKey)
      if (!consent) {
        // Small delay so it does not jump instantly on page load
        const timer = setTimeout(() => setIsOpen(true), 1200)
        return () => clearTimeout(timer)
      }
    } catch {
      // Ignore
    }

    const handleOpen = () => setIsOpen(true)
    window.addEventListener('bitnook-open-consent' as any, handleOpen)
    return () => {
      window.removeEventListener('bitnook-open-consent' as any, handleOpen)
    }
  }, [])

  const handleChoice = (choice: 'granted' | 'denied') => {
    try {
      localStorage.setItem(ADS_CONFIG.consentStorageKey, choice)
      window.dispatchEvent(
        new CustomEvent('bitnook-consent-change', {
          detail: { status: choice },
        })
      )
    } catch {
      // Ignore
    }
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div
      role="region"
      aria-label="Privacy & Cookie Preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
            <div className="p-1 rounded-md bg-accent/10 text-accent">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>{isZh ? '隐私与偏好设置' : 'Privacy & Cookie Consent'}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-text-primary p-1 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          {isZh
            ? 'BitNook 坚持客户端本地运算优先，敏感数据不上传。为保障工具长久免费与更新，我们使用匿名度量并可能展示非侵入式赞助内容。您可以按需选择是否启用广告偏好。'
            : 'BitNook prioritizes client-side local calculation—sensitive inputs stay in your browser. We use anonymous metrics and optional non-intrusive sponsor ads to support free operation.'}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleChoice('granted')}
            className="flex-1 py-2 px-3 rounded-lg bg-text-primary text-canvas font-medium hover:opacity-90 transition-opacity text-center"
          >
            {isZh ? '接受并支持' : 'Accept & Support'}
          </button>
          <button
            type="button"
            onClick={() => handleChoice('denied')}
            className="flex-1 py-2 px-3 rounded-lg border border-border bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface transition-colors text-center"
          >
            {isZh ? '仅必要 Cookie' : 'Essential Only'}
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-1">
            <Cookie className="w-3 h-3 text-text-muted" />
            <span>GDPR & CPRA Compliant</span>
          </div>
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-text-primary transition-colors"
          >
            {isZh ? '查看隐私政策' : 'Privacy Policy'}
          </Link>
        </div>
      </div>
    </div>
  )
}
