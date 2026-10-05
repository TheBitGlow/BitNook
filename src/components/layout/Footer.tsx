'use client'

import React from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { Wrench, ShieldCheck, Heart } from 'lucide-react'

export default function Footer() {
  const { locale } = useI18n()
  const isZh = locale === 'zh'

  return (
    <footer className="bg-[#090D16] border-t border-[#1E293B] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">BitNook</span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
              {isZh
                ? 'All Tools, One Nook · 一站搞定，方寸万象。面向职场、财务、健康与技术开发者，提供高频、真实、纯净隐私的在线实用工具与益智棋牌。'
                : 'All Tools, One Nook. Authentic, privacy-first productivity calculators, converters, network utilities, and classic games.'}
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#141C2E] border border-[#1E293B] text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isZh ? '本地算法优先 · 保护数据隐私' : 'Local-First Privacy Architecture'}</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {isZh ? '工具分类' : 'Categories'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/tools/daily" className="hover:text-white transition-colors">
                  {isZh ? '日常效率' : 'Daily Tools'}
                </Link>
              </li>
              <li>
                <Link href="/tools/finance" className="hover:text-white transition-colors">
                  {isZh ? '财务计算' : 'Finance Tools'}
                </Link>
              </li>
              <li>
                <Link href="/tools/health" className="hover:text-white transition-colors">
                  {isZh ? '健康评估' : 'Health Tools'}
                </Link>
              </li>
              <li>
                <Link href="/tools/convert" className="hover:text-white transition-colors">
                  {isZh ? '格式转换' : 'Format Convert'}
                </Link>
              </li>
              <li>
                <Link href="/tools/network" className="hover:text-white transition-colors">
                  {isZh ? '网络诊断' : 'Network Tools'}
                </Link>
              </li>
              <li>
                <Link href="/tools/ai" className="hover:text-white transition-colors">
                  {isZh ? 'AI 显存估算' : 'AI Tools'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Games & Featured */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {isZh ? '休闲游戏' : 'Mini Games'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/games/tetris" className="hover:text-white transition-colors">
                  {isZh ? '俄罗斯方块' : 'Tetris'}
                </Link>
              </li>
              <li>
                <Link href="/games/minesweeper" className="hover:text-white transition-colors">
                  {isZh ? '经典扫雷' : 'Minesweeper'}
                </Link>
              </li>
              <li>
                <Link href="/games/snake" className="hover:text-white transition-colors">
                  {isZh ? '贪吃蛇' : 'Snake'}
                </Link>
              </li>
              <li>
                <Link href="/games/gomoku" className="hover:text-white transition-colors">
                  {isZh ? '五子棋对弈' : 'Gomoku'}
                </Link>
              </li>
              <li>
                <Link href="/games/chess-chinese" className="hover:text-white transition-colors">
                  {isZh ? '中国象棋' : 'Chinese Chess'}
                </Link>
              </li>
              <li>
                <Link href="/games/chess-international" className="hover:text-white transition-colors">
                  {isZh ? '国际象棋' : 'International Chess'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {isZh ? '关于与合规' : 'About & Legal'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  {isZh ? '会员方案' : 'Pricing Plans'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {isZh ? '关于产品' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {isZh ? '问题反馈' : 'Contact & Feedback'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {isZh ? '隐私政策' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {isZh ? '服务条款' : 'Terms of Service'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1E293B] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BitNook. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built for productivity & privacy</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
