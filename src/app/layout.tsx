import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import AdSenseScript from '@/components/ads/AdSenseScript'
import ConsentBanner from '@/components/common/ConsentBanner'

export const metadata: Metadata = {
  title: {
    default: 'BitNook - 比特角落 | High-Frequency Online Tools',
    template: '%s | BitNook',
  },
  description: 'BitNook（比特角落）- All Tools, One Nook · 一站搞定，方寸万象。为职场人员、学生、开发者与自由职业者提供真实可用、零假数据、隐私安全的现代在线工具与经典小憩。',
  keywords: [
    '在线工具',
    '工具箱',
    '房贷计算器',
    '密码生成器',
    '显存估算器',
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
    description: '真实可用、本地优先的现代高频在线工具与经典游戏平台。',
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
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('bitnook-theme');
                  var theme = saved || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-text-primary antialiased font-sans selection:bg-accent/15 selection:text-accent">
        <ThemeProvider>
          <I18nProvider>
            <AdSenseScript />
            {children}
            <ConsentBanner />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
