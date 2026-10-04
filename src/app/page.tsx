'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useI18n } from '@/lib/i18n'
import {
  ArrowRight,
  ArrowRightLeft,
  BarChart3,
  Clock,
  Code2,
  FileText,
  Gamepad2,
  Landmark,
  Lock,
  QrCode,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

const featuredTools = [
  { name: '房贷计算', enName: 'Mortgage Calculator', icon: Landmark, color: '#10B981', href: '/tools/finance/mortgage', desc: '等额本息/本金对比分析', enDesc: 'Compare equal payment and equal principal plans' },
  { name: '贷款比价', enName: 'Loan Comparison', icon: BarChart3, color: '#10B981', href: '/tools/finance/loan-compare', desc: '多方案综合对比', enDesc: 'Compare multiple loan options side by side' },
  { name: '复利计算', enName: 'Compound Interest', icon: TrendingUp, color: '#10B981', href: '/tools/finance/compound', desc: '投资复利增长模拟', enDesc: 'Simulate long-term investment growth' },
  { name: '时间戳', enName: 'Timestamp Converter', icon: Clock, color: '#F59E0B', href: '/tools/convert/timestamp', desc: 'Unix时间戳转换', enDesc: 'Convert Unix timestamps and date-time values' },
  { name: '二维码', enName: 'QR Code Generator', icon: QrCode, color: '#06B6D4', href: '/tools/convert/qrcode', desc: '生成和解析二维码', enDesc: 'Generate QR codes for text, links, and WiFi' },
  { name: '密码生成', enName: 'Password Generator', icon: Lock, color: '#8B5CF6', href: '/tools/daily/password', desc: '安全密码批量生成', enDesc: 'Generate secure passwords locally' },
]

const categories = [
  { name: '财务计算', enName: 'Finance Calculators', icon: TrendingUp, color: '#10B981', href: '/tools/finance', desc: '房贷、贷款、复利、工资等常用计算器', enDesc: 'Mortgage, loans, compound interest, salary, and common finance calculators' },
  { name: '开发者与转换', enName: 'Developer & Conversion', icon: Code2, color: '#F59E0B', href: '/tools/convert', desc: '时间戳、Hash、二维码、单位转换', enDesc: 'Timestamp, hash, QR code, unit conversion, and more' },
  { name: '日常效率', enName: 'Daily Productivity', icon: ShieldCheck, color: '#3B82F6', href: '/tools/daily', desc: '密码、计时、字数统计、日期计算', enDesc: 'Passwords, timers, word counts, and date calculations' },
  { name: '经典游戏', enName: 'Classic Games', icon: Gamepad2, color: '#EC4899', href: '/games', desc: '俄罗斯方块、扫雷、象棋、五子棋等小游戏', enDesc: 'Tetris, Minesweeper, Chinese Chess, Gomoku, and more' },
]

export default function HomePage() {
  const { locale, t, list } = useI18n()
  const isZh = locale === 'zh'

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section className="px-4 py-16 md:py-20 border-b border-[rgba(99,102,241,0.15)] bg-[#0A0F1C]">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#111827] border border-[rgba(99,102,241,0.25)] mb-6">
                <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                <span className="text-sm text-[#94A3B8]">{t('home.eyebrow')}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-normal">
                {t('home.title')}
              </h1>

              <p className="text-lg md:text-xl text-[#94A3B8] max-w-3xl mb-8 leading-relaxed">
                {t('home.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/tools" className="btn-gradient px-6 py-3 inline-flex items-center justify-center gap-2">
                  {t('home.primary')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/games" className="px-6 py-3 rounded-xl border border-[rgba(99,102,241,0.3)] text-[#94A3B8] hover:text-white hover:border-[rgba(99,102,241,0.6)] transition-all inline-flex items-center justify-center gap-2">
                  {t('home.secondary')}
                  <Gamepad2 className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {list('home.metrics').map((metric) => (
                  <div key={metric} className="rounded-lg border border-[rgba(99,102,241,0.15)] bg-[#080B14] px-4 py-3 text-sm text-[#CBD5E1]">
                    {metric}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(99,102,241,0.2)] bg-[#080B14] p-5">
              <div className="flex items-center gap-3 mb-5">
                <MousePointerClick className="w-5 h-5 text-[#06B6D4]" />
                <h2 className="text-lg font-semibold text-white">{t('home.pillarsTitle')}</h2>
              </div>
              <div className="space-y-3">
                {list('home.pillars').map((item, index) => (
                  <div key={item} className="flex gap-3 rounded-lg bg-[#111827] p-4">
                    <span className="h-7 w-7 rounded-full bg-[#6366F1]/20 text-[#A5B4FC] flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-[#CBD5E1]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">{t('home.featuredTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTools.map((tool) => (
                <Link key={tool.href} href={tool.href} className="glass-card p-5 flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: `${tool.color}20` }}>
                    <tool.icon className="w-5 h-5" style={{ color: tool.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{isZh ? tool.name : tool.enName}</h3>
                    <p className="text-sm text-[#94A3B8]">{isZh ? tool.desc : tool.enDesc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 px-4 bg-[#0D1117]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-bold text-white mb-5">{t('home.contentTitle')}</h2>
                <div className="space-y-3">
                  {list('home.contentItems').map((item) => (
                    <div key={item} className="rounded-lg border border-[rgba(99,102,241,0.15)] bg-[#080B14] p-4 text-[#CBD5E1]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-5">{t('home.roadmapTitle')}</h2>
                <div className="space-y-3">
                  {list('home.roadmap').map((item) => (
                    <div key={item} className="rounded-lg border border-[rgba(99,102,241,0.15)] bg-[#080B14] p-4 text-[#CBD5E1]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">{isZh ? '站点模块' : 'Site Modules'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link key={cat.href} href={cat.href} className="glass-card p-5 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform" style={{ backgroundColor: `${cat.color}20` }}>
                    <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{isZh ? cat.name : cat.enName}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{isZh ? cat.desc : cat.enDesc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-[#0A0F1C] border-t border-[rgba(99,102,241,0.15)]">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="w-10 h-10 text-[#06B6D4] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {isZh ? '找工具不绕路，直接完成手头任务' : 'Find the right tool and finish the task faster'}
            </h2>
            <p className="text-[#94A3B8] mb-8 leading-relaxed">
              {isZh
                ? '从工具中心搜索关键词，或按财务、转换、日常、健康、网络和 AI 分类进入对应工具。'
                : 'Search by keyword in Tools Hub, or browse by finance, conversion, daily, health, network, and AI categories.'}
            </p>
            <Link href="/tools" className="inline-flex items-center gap-2 text-[#06B6D4] hover:text-white transition-colors">
              {t('common.viewTools')}
              <ArrowRightLeft className="w-4 h-4 rotate-90" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
