'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ads/AdSlot'
import { ChevronRight, Gamepad2, Info } from 'lucide-react'

export interface GameLayoutProps {
  title: string
  titleEn: string
  categoryName: string
  description: string
  children: ReactNode
  controlsNode?: ReactNode
  instructions?: { title: string; desc: string }[]
  rulesNode?: ReactNode
}

export default function GameLayout({
  title,
  titleEn,
  categoryName,
  description,
  children,
  controlsNode,
  instructions,
  rulesNode,
}: GameLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-4 font-mono">
            <Link href="/" className="hover:text-text-primary transition-colors">
              BitNook
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <Link href="/games" className="hover:text-text-primary transition-colors">
              经典小憩
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <span className="text-text-primary font-medium">{title}</span>
          </nav>

          {/* Game Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-6 border-b border-border/70">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-accent-subtle text-accent border border-accent/20 uppercase">
                  {categoryName}
                </span>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                  {title}
                </h1>
                <span className="hidden sm:inline text-xs text-text-muted font-mono">
                  {titleEn}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>

            {controlsNode && <div className="flex items-center gap-2">{controlsNode}</div>}
          </div>

          {/* Dedicated Game Stage (Hero Surface) */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-6 rounded-xl border border-border/80 bg-surface shadow-subtle mb-6 overflow-hidden">
            {children}
          </div>

          {/* Reserved Ad Slot (Zero CLS) */}
          <div className="my-6">
            <AdSlot placement="game-bottom" format="horizontal" />
          </div>

          {/* Instructions and Rules Grid */}
          {(instructions || rulesNode) && (
            <div className="mt-8 pt-6 border-t border-border/70 grid grid-cols-1 md:grid-cols-2 gap-6">
              {instructions && instructions.length > 0 && (
                <div className="p-4 rounded-lg border border-border/80 bg-surface-secondary/40">
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-text-primary">
                    <Gamepad2 className="w-4 h-4 text-accent" />
                    <span>操作指南与快捷键</span>
                  </div>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {instructions.map((ins, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-text-muted font-mono">•</span>
                        <div>
                          <span className="font-medium text-text-primary">{ins.title}：</span>
                          <span>{ins.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rulesNode && (
                <div className="p-4 rounded-lg border border-border/80 bg-surface-secondary/40">
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-text-primary">
                    <Info className="w-4 h-4 text-accent" />
                    <span>规则与机制说明</span>
                  </div>
                  <div className="text-xs text-text-secondary leading-relaxed space-y-2">
                    {rulesNode}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
