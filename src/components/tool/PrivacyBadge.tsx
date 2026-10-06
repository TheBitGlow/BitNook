'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Info, X } from 'lucide-react'
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
  const [popoverOpen, setPopoverOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopoverOpen(false)
      }
    }
    if (popoverOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [popoverOpen])

  const configs: Record<
    PrivacyMode,
    {
      dotColor: string
      labelZh: string
      labelEn: string
      leavesBrowserZh: string
      leavesBrowserEn: string
      environmentZh: string
      environmentEn: string
      descZh: string
      descEn: string
    }
  > = {
    local: {
      dotColor: 'bg-emerald-500',
      labelZh: '本地处理',
      labelEn: 'Local Only',
      leavesBrowserZh: '数据完全不离开浏览器',
      leavesBrowserEn: 'Data never leaves your browser',
      environmentZh: '客户端 JS / WASM 原生执行',
      environmentEn: 'Client JS / WASM native runtime',
      descZh: '所有运算均在当前设备的本地内存中完成，输入数据默认不会上传，绝不将您的内容用于产品分析。',
      descEn: 'All processing occurs purely in local device memory. Inputs are never uploaded or analyzed.',
    },
    server: {
      dotColor: 'bg-blue-500',
      labelZh: 'Edge 边缘处理',
      labelEn: 'Edge Processed',
      leavesBrowserZh: '经由 Cloudflare 边缘节点',
      leavesBrowserEn: 'Processed on Cloudflare Edge',
      environmentZh: 'Cloudflare Workers 隔离沙箱',
      environmentEn: 'Cloudflare Workers isolated sandbox',
      descZh: '使用全球边缘节点就近执行合规运算，无持久化日志，运算结束内存即时销毁。',
      descEn: 'Executed on global edge nodes with zero persistent logs and immediate ephemeral memory cleanup.',
    },
    network: {
      dotColor: 'bg-amber-500',
      labelZh: '外部网络查询',
      labelEn: 'Network Query',
      leavesBrowserZh: '发送必要查询参数至公网端点',
      leavesBrowserEn: 'Sends minimal query to public endpoint',
      environmentZh: '合规出站代理与严格 SSRF 防御',
      environmentEn: 'Compliant outbound proxy with SSRF defense',
      descZh: '工具需请求公网公开接口获取实时结果，已内置严格内网防御过滤，绝不上传无关个人隐私。',
      descEn: 'Connects to public endpoints with strict internal network blocking. No private telemetry collected.',
    },
    third_party_api: {
      dotColor: 'bg-amber-500',
      labelZh: '外部接口查询',
      labelEn: 'Public Query',
      leavesBrowserZh: '发送必要查询参数至第三方',
      leavesBrowserEn: 'Sends minimal parameters to external API',
      environmentZh: '只读接口调用',
      environmentEn: 'Read-only API call',
      descZh: '工具需向公共服务查询数据，仅发送必要参数，不会记录或共享任何个人数据。',
      descEn: 'Queries public service with minimal parameters. Zero personal tracking.',
    },
  }

  const conf = configs[mode] || configs.local

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setPopoverOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border bg-surface-secondary/70 hover:bg-surface-secondary text-text-secondary hover:text-text-primary text-[11px] font-medium transition-colors cursor-pointer select-none"
        aria-label="查看隐私与处理机制"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${conf.dotColor} shrink-0`} />
        <span>{isZh ? conf.labelZh : conf.labelEn}</span>
        <Info className="w-3 h-3 text-text-muted opacity-70" />
      </button>

      {/* Popover Card */}
      {popoverOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-72 p-3.5 rounded-lg border border-border bg-surface shadow-dropdown text-xs z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <div className="flex items-center gap-1.5 font-semibold text-text-primary">
              <span className={`w-2 h-2 rounded-full ${conf.dotColor}`} />
              <span>{isZh ? conf.labelZh : conf.labelEn}</span>
            </div>
            <button
              type="button"
              onClick={() => setPopoverOpen(false)}
              className="text-text-muted hover:text-text-primary p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-[11px] text-text-secondary leading-relaxed">
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-semibold">
                {isZh ? '数据流向' : 'Data Flow'}
              </span>
              <p className="text-text-primary font-medium">
                {isZh ? conf.leavesBrowserZh : conf.leavesBrowserEn}
              </p>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-semibold">
                {isZh ? '运行环境' : 'Runtime'}
              </span>
              <p>{isZh ? conf.environmentZh : conf.environmentEn}</p>
            </div>
            <p className="pt-1 text-text-muted border-t border-border">
              {isZh ? conf.descZh : conf.descEn}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrivacyBadge
