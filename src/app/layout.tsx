import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: {
    default: 'BitNook - 比特角落 | High-Frequency Online Tools',
    template: '%s | BitNook',
  },
  description: 'BitNook（比特角落）- All Tools, One Nook · 一站搞定，方寸万象。为职场职员、学生、开发者与自由职业者提供真实可用、零假数据、隐私安全的在线工具与经典游戏。',
  keywords: [
    '在线工具',
    '工具箱',
    '房贷计算器',
    '延迟退休计算器',
    '个人所得税计算器',
    '汇率换算',
    '格式转换',
    '二维码生成器',
    '网络工具',
    '在线游戏',
    'online tools',
    'calculators',
    'developer tools',
  ],
  authors: [{ name: 'BitNook' }],
  creator: 'BitNook',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://bitnook.com',
    siteName: 'BitNook - 比特角落',
    title: 'BitNook - All Tools, One Nook · 一站搞定，方寸万象',
    description: '真实可用、本地隐私安全的高频在线工具站与经典小游戏平台。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BitNook',
    description: 'Bilingual online tools for work, finance, developers, and daily productivity.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#080B14] text-[#F1F5F9]">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
