'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type Locale = 'zh' | 'en'

type TranslationTree = {
  [key: string]: string | string[] | TranslationTree
}

const translations: Record<Locale, TranslationTree> = {
  zh: {
    common: {
      language: '中文',
      languageToggle: 'English',
      tools: '工具',
      games: '游戏',
      signIn: '登录',
      start: '开始',
      learnMore: '了解更多',
      viewTools: '查看工具',
      viewGames: '进入游戏大厅',
      searchPlaceholder: '搜索工具、类别或功能...',
      clearSearch: '清除搜索',
      noResults: '没有找到匹配的工具',
      categories: '工具分类',
      popularTools: '热门常用工具',
      popularGames: '经典游戏',
      allToolsCount: '浏览全部 35 个真实可用工具',
      allGamesCount: '8 款经典游戏',
      privacyDisclaimer: '本地计算，数据不上传服务器',
    },
    home: {
      eyebrow: 'All Tools, One Nook · 一站搞定，方寸万象',
      title: '比特角落 BitNook',
      subtitle: '高频实用的在线工具集合：房贷与工资精算、法定延迟退休测算、本地二维码与哈希生成、高精度单位与进制转换、世界时钟与日常效率工具。',
      primary: '开始使用工具',
      secondary: '经典游戏大厅',
      metrics: ['35 个免费在线工具', '零安装即开即用', '严谨算法无假数据', '中英双语与移动适配'],
      pillarsTitle: '按生活与工作场景快速开始',
      pillars: [
        '算钱理财：用房贷、工资、延迟退休、复利与真实IRR/NPV工具精算资金方案。',
        '数据格式转换：用大数进制转换、本地离线二维码、哈希散列与多模式颜色转换处理数据。',
        '日常效率提速：用安全密码生成、字数分析、并行计时器与日期间隔推算完成日常任务。',
      ],
      featuredTitle: '高频推荐工具',
      contentTitle: '为什么选择 BitNook',
      contentItems: [
        '拒绝假数据与模拟演示：所有金融、健康、网络工具均有真实算法依据与来源说明。',
        '保护隐私与数据安全：密码、二维码、文本哈希完全在浏览器本地计算，不上传服务器。',
        '纯净无干扰：工具操作区与结果区清晰明确，杜绝伪装广告与弹窗骚扰。',
      ],
      roadmapTitle: '科学参考与免责指引',
      roadmap: [
        '金融与税后收入结果仅供方案决策参考，请以当地最新公积金政策、银行实际签约或税务局综合申报为准。',
        '健康评估工具旨在提供生活习惯与运动靶区参考，不可替代专业执业医师诊断。',
        '如需快速定位工具，可通过顶部搜索框或各分类导航快速直达。',
      ],
    },
    about: {
      title: '关于 BitNook（比特角落）',
      desc: 'BitNook 是一个注重真实、准确与隐私安全的在线工具箱，为职场人、学生、开发者及自由职业者提供快速可靠的实用工具。',
    },
    contact: {
      title: '联系与反馈',
      desc: '如果您在使用过程中发现任何算法偏差、计算错误，或有新的工具需求，欢迎与我们联系。',
      emailLabel: '联系邮箱',
      response: '通常会在 1-3 个工作日内核实并处理反馈。',
      topics: ['算法或计算问题反馈', '新增实用工具建议', '商业合作与广告', '隐私与数据合规'],
    },
    legal: {
      updated: '最后更新：2026年3月25日',
      privacyTitle: '隐私政策',
      termsTitle: '服务条款',
    },
  },
  en: {
    common: {
      language: 'English',
      languageToggle: '中文',
      tools: 'Tools',
      games: 'Games',
      signIn: 'Sign in',
      start: 'Start',
      learnMore: 'Learn more',
      viewTools: 'Explore Tools',
      viewGames: 'Open Games',
      searchPlaceholder: 'Search tools, categories, or keywords...',
      clearSearch: 'Clear search',
      noResults: 'No matching tools found',
      categories: 'Tool Categories',
      popularTools: 'Popular Tools',
      popularGames: 'Classic Games',
      allToolsCount: 'Browse all 35 authentic online tools',
      allGamesCount: '8 Classic Games',
      privacyDisclaimer: 'Calculated locally in browser. No server tracking.',
    },
    home: {
      eyebrow: 'All Tools, One Nook · Every Utility in Reach',
      title: 'BitNook',
      subtitle: 'Fast, authentic online tools: mortgage and salary calculators, progressive retirement estimates, offline QR and hash generators, unit conversions, and productivity utilities.',
      primary: 'Start Using Tools',
      secondary: 'Classic Games Hall',
      metrics: ['35 Free Online Tools', 'Zero Install Required', 'Authentic Calculations', 'Bilingual & Mobile Ready'],
      pillarsTitle: 'Quick Start by Practical Scenarios',
      pillars: [
        'Finance & Planning: Calculate mortgages, salary after tax, 2025 retirement age, compound returns, and real IRR/NPV.',
        'Data & Conversion: Arbitrary-precision base converter, local QR code generation, cryptographic hashes, and color codes.',
        'Daily Productivity: Cryptographic password generator, word counter, parallel timers, and date interval calculators.',
      ],
      featuredTitle: 'Featured Tools',
      contentTitle: 'Why Use BitNook',
      contentItems: [
        'Zero Mock Data: All finance, health, and network utilities are built on verified mathematical models and standard APIs.',
        'Privacy First: Passwords, QR generation, and file hashing run purely in your local browser.',
        'Clean & Unobtrusive: Clear tool workflows with zero deceptive ad buttons or intrusive overlays.',
      ],
      roadmapTitle: 'Reliable Usage Guidelines',
      roadmap: [
        'Financial and tax estimates are references. Verify with official tax declarations or institutional loan contracts.',
        'Health assessments provide educational lifestyle references and do not constitute clinical diagnoses.',
        'Use the instant search bar to find any utility in under 10 seconds.',
      ],
    },
    about: {
      title: 'About BitNook',
      desc: 'BitNook is an instant, privacy-focused online tool platform serving developers, office professionals, students, and everyday internet users.',
    },
    contact: {
      title: 'Contact Us',
      desc: 'Have bug reports, accuracy corrections, or tool recommendations? We welcome your feedback.',
      emailLabel: 'Contact Email',
      response: 'We typically review and respond within 1-3 business days.',
      topics: ['Calculation / accuracy reports', 'New tool suggestions', 'Business partnerships', 'Privacy inquiries'],
    },
    legal: {
      updated: 'Last updated: March 25, 2026',
      privacyTitle: 'Privacy Policy',
      termsTitle: 'Terms of Service',
    },
  },
}

function getValue(tree: TranslationTree, path: string): string | string[] {
  const parts = path.split('.')
  let current: string | string[] | TranslationTree = tree
  for (const part of parts) {
    if (typeof current === 'string' || Array.isArray(current)) return path
    current = current[part]
    if (current === undefined) return path
  }
  return typeof current === 'string' || Array.isArray(current) ? current : path
}

const I18nContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (path: string) => string
  list: (path: string) => string[]
}>({
  locale: 'zh',
  setLocale: () => {},
  toggleLocale: () => {},
  t: (path) => path,
  list: () => [],
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = (window.localStorage.getItem('bitnook-locale') || window.localStorage.getItem('toolverse-locale')) as Locale | null
      if (saved === 'zh' || saved === 'en') return saved
    }
    return 'zh'
  })

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('bitnook-locale', next)
      document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
    }
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'zh' ? 'en' : 'zh')
  }, [locale, setLocale])

  const value = useMemo(() => ({
    locale,
    setLocale,
    toggleLocale,
    t: (path: string) => String(getValue(translations[locale], path)),
    list: (path: string) => {
      const val = getValue(translations[locale], path)
      return Array.isArray(val) ? val : []
    },
  }), [locale, setLocale, toggleLocale])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
