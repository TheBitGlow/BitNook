'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function Footer() {
  const { locale } = useI18n()
  const copy = locale === 'zh'
    ? {
        desc: 'All Tools, One Universe · 一站搞定，宇宙无界',
        desc2: '为职场、财务和开发者场景提供高频在线工具。',
        quick: '快速链接',
        categories: '工具分类',
        tools: '工具中心',
        games: '游戏大厅',
        pricing: '会员定价',
        daily: '日常工具',
        finance: '财务工具',
        health: '健康工具',
        convert: '格式转换',
        network: '网络工具',
        ai: 'AI工具',
        about: '关于我们',
        contact: '联系我们',
        privacy: '隐私政策',
        terms: '服务条款',
      }
    : {
        desc: 'All Tools, One Universe',
        desc2: 'High-frequency online tools for work, finance, and developer workflows.',
        quick: 'Quick Links',
        categories: 'Tool Categories',
        tools: 'Tools Hub',
        games: 'Games Hall',
        pricing: 'Pricing',
        daily: 'Daily Tools',
        finance: 'Finance Tools',
        health: 'Health Tools',
        convert: 'Format Conversion',
        network: 'Network Tools',
        ai: 'AI Tools',
        about: 'About',
        contact: 'Contact',
        privacy: 'Privacy',
        terms: 'Terms',
      }

  return (
    <footer className="bg-[#0D1117] border-t border-[rgba(99,102,241,0.15)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center">
                <span className="text-white font-bold text-sm">BN</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent">
                BitNook
              </span>
            </div>
            <p className="text-[#94A3B8] text-sm max-w-md">
              {copy.desc}
              <br />
              {copy.desc2}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{copy.quick}</h3>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li><Link href="/tools" className="hover:text-white transition-colors">{copy.tools}</Link></li>
              <li><Link href="/games" className="hover:text-white transition-colors">{copy.games}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">{copy.pricing}</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">{copy.about}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{copy.contact}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{copy.privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">{copy.terms}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">{copy.categories}</h3>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li><Link href="/tools/daily" className="hover:text-white transition-colors">{copy.daily}</Link></li>
              <li><Link href="/tools/finance" className="hover:text-white transition-colors">{copy.finance}</Link></li>
              <li><Link href="/tools/health" className="hover:text-white transition-colors">{copy.health}</Link></li>
              <li><Link href="/tools/convert" className="hover:text-white transition-colors">{copy.convert}</Link></li>
              <li><Link href="/tools/network" className="hover:text-white transition-colors">{copy.network}</Link></li>
              <li><Link href="/tools/ai" className="hover:text-white transition-colors">{copy.ai}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgba(99,102,241,0.15)] mt-8 pt-8 text-center text-sm text-[#475569]">
          © {new Date().getFullYear()} BitNook. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
