import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: {
    default: 'BitNook - 比特角落 | High-Frequency Online Tools',
    template: '%s | BitNook',
  },
  description: 'BitNook（比特角落）提供财务计算、开发者工具、格式转换、日常效率工具和经典游戏，支持中文与英文切换。',
  keywords: [
    '在线工具',
    '工具箱',
    '财务计算器',
    '开发者工具',
    '格式转换',
    '二维码生成器',
    '房贷计算器',
    'online tools',
    'calculators',
    'developer tools',
  ],
  authors: [{ name: 'BitNook' }],
  creator: 'BitNook',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://bitnook.example.com',
    siteName: 'BitNook',
    title: 'BitNook - High-Frequency Online Tools',
    description: 'Bilingual calculators, converters, developer utilities, productivity tools, and classic games.',
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
