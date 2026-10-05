'use client'

import React from 'react'
import { ShieldCheck, Server, Globe } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { PrivacyMode as ToolPrivacyMode } from '@/config/tools'

export type PrivacyMode = ToolPrivacyMode | 'third_party_api'

export interface PrivacyBadgeProps {
  mode: PrivacyMode
  variant?: 'compact' | 'detailed'
  className?: string
}

export function PrivacyBadge({ mode, variant = 'compact', className = '' }: PrivacyBadgeProps) {
  const { locale } = useI18n()
  const isZh = locale === 'zh'

  const configs: Record<
    PrivacyMode,
    {
      icon: React.ReactNode
      labelZh: string
      labelEn: string
      descZh: string
      descEn: string
      badgeClass: string
    }
  > = {
    local: {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      labelZh: '本地处理 · 零上传',
      labelEn: 'Local · No Upload',
      descZh: '数据仅在浏览器本地内存运行，绝不发送至任何服务器',
      descEn: 'Runs strictly in your browser memory; no data sent to any server',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    },
    server: {
      icon: <Server className="w-3.5 h-3.5 text-blue-400" />,
      labelZh: '合规边缘处理',
      labelEn: 'Edge Processed',
      descZh: '经由 Cloudflare 全球边缘合规运行，不保留持久化日志',
      descEn: 'Processed securely via Cloudflare Edge runtime with zero persistent logs',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    },
    network: {
      icon: <Globe className="w-3.5 h-3.5 text-sky-400" />,
      labelZh: '公网接口查询',
      labelEn: 'Network Query',
      descZh: '需发起外部网络查询，仅发送必要参数',
      descEn: 'Requires public network requests with minimal query parameters',
      badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    },
    third_party_api: {
      icon: <Globe className="w-3.5 h-3.5 text-amber-400" />,
      labelZh: '公网接口查询',
      labelEn: 'Public Query',
      descZh: '需发起外部网络查询，仅发送必要参数',
      descEn: 'Requires public network requests with minimal query parameters',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    },
  }

  const conf = configs[mode] || configs.local

  if (variant === 'detailed') {
    return (
      <div
        className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${conf.badgeClass} ${className}`}
      >
        <span className="shrink-0 mt-0.5">{conf.icon}</span>
        <div>
          <span className="font-semibold block">{isZh ? conf.labelZh : conf.labelEn}</span>
          <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">
            {isZh ? conf.descZh : conf.descEn}
          </p>
        </div>
      </div>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border select-none ${conf.badgeClass} ${className}`}
      title={isZh ? conf.descZh : conf.descEn}
    >
      {conf.icon}
      <span>{isZh ? conf.labelZh : conf.labelEn}</span>
    </span>
  )
}
