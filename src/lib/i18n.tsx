'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type Locale = 'zh' | 'en'

type TranslationTree = {
  [key: string]: string | string[] | TranslationTree
}

const zhToEn: Record<string, string> = {
  '工具': 'Tools',
  '游戏': 'Games',
  '登录': 'Sign in',
  '工具中心': 'Tools Hub',
  '游戏大厅': 'Games Hall',
  '会员定价': 'Pricing',
  '工具分类': 'Tool Categories',
  '快速链接': 'Quick Links',
  '隐私政策': 'Privacy Policy',
  '服务条款': 'Terms of Service',
  '联系我们': 'Contact Us',
  '关于我们': 'About',
  '开始': 'Start',
  '重新开始': 'Restart',
  '再来一局': 'Play Again',
  '清除搜索': 'Clear Search',
  '搜索工具...': 'Search tools...',
  '没有找到匹配的工具': 'No matching tools found',
  '免费在线工具': 'Free Online Tools',
  '查看全部44+工具': 'View all 44+ tools',
  '查看全部8款游戏': 'View all 8 games',
  '日常工具': 'Daily Tools',
  '财务工具': 'Finance Tools',
  '健康工具': 'Health Tools',
  '格式转换': 'Format Conversion',
  '网络工具': 'Network Tools',
  'AI工具': 'AI Tools',
  'AI 工具': 'AI Tools',
  '比特角落': 'BitNook',
  '工具宇宙': 'BitNook',
  '一站搞定，方寸万象': 'All tools, one nook',
  '一站搞定，宇宙无界': 'All tools, one nook',
  '为职场人、学生、开发者提供高效的在线工具集合': 'Efficient online tools for professionals, students, and developers',
  '为职场人、学生、开发者打造的高效工具集合': 'Efficient tools for professionals, students, and developers',
  '职场、财务、开发者高频工具': 'High-frequency tools for work, finance, and developers',
  '日常生活所需的实用工具': 'Useful tools for everyday tasks',
  '财务管理和计算工具': 'Financial planning and calculator tools',
  '健康管理与评估工具': 'Health assessment and tracking tools',
  '各类格式转换工具': 'Format conversion tools',
  '网络诊断与管理工具': 'Network diagnostics and management tools',
  '智能工具（VIP专属）': 'AI tools (VIP)',
  '计时器': 'Timer',
  '倒计时': 'Countdown',
  '抽奖': 'Lottery',
  '密码生成': 'Password Generator',
  '密码生成器': 'Password Generator',
  '文字统计': 'Word Counter',
  '日期计算': 'Date Calculator',
  '秒表': 'Stopwatch',
  '世界时钟': 'World Clock',
  '房贷计算': 'Mortgage Calculator',
  '房贷计算器': 'Mortgage Calculator',
  '汇率转换': 'Currency Converter',
  '退休计算': 'Retirement Calculator',
  '复利计算': 'Compound Interest Calculator',
  '工资计算': 'Salary Calculator',
  '存款计算': 'Deposit Calculator',
  '贷款比价': 'Loan Comparison',
  '投资回报': 'ROI Calculator',
  'BMI计算': 'BMI Calculator',
  '心率计算': 'Heart Rate Calculator',
  '卡路里': 'Calorie Calculator',
  '饮水量': 'Water Intake Calculator',
  '睡眠计算': 'Sleep Calculator',
  '步数目标': 'Step Goal Calculator',
  '心脏年龄': 'Heart Age Calculator',
  '血压评估': 'Blood Pressure Checker',
  '单位转换': 'Unit Converter',
  '进制转换': 'Radix Converter',
  'Hash生成': 'Hash Generator',
  '二维码': 'QR Code',
  '二维码生成器': 'QR Code Generator',
  '颜色转换': 'Color Converter',
  '时间戳': 'Timestamp Converter',
  'IP归属': 'IP Lookup',
  'DNS查询': 'DNS Lookup',
  '网速测试': 'Speed Test',
  'Ping测试': 'Ping Test',
  '端口扫描': 'Port Scanner',
  'WiFi信息': 'WiFi Info',
  'HTTP检测': 'HTTP Check',
  'SSL检测': 'SSL Check',
  '简历优化': 'Resume Optimizer',
  '文章摘要': 'Article Summarizer',
  '智能翻译': 'AI Translator',
  '短视频脚本': 'Short Video Script',
  '邮件生成': 'Email Generator',
  'AI取名': 'AI Naming',
  '大模型显存计算器': 'LLM VRAM Calculator',
  '多任务并行计时，支持番茄钟': 'Multi-task timers with Pomodoro support',
  '多任务并行计时，支持番茄钟模式': 'Multi-task timers with Pomodoro mode',
  '目标日期倒计时，烟花特效': 'Countdown to a target date with celebration effects',
  '目标日期倒计时，实时显示': 'Live countdown to a target date',
  '转盘抽奖，防重复抽取': 'Spin lottery with duplicate prevention',
  '安全密码批量生成': 'Generate secure passwords in batches',
  '安全密码批量生成，绝不发往服务器': 'Generate secure passwords locally without sending them to a server',
  '字数、字符、关键词分析': 'Word, character, and keyword analysis',
  '实时统计字数、字符、关键词频率': 'Track words, characters, and keyword frequency in real time',
  '日期间距、工作日计算': 'Date intervals and workday calculations',
  '毫秒精度，多圈记录': 'Millisecond precision with lap records',
  '多时区城市时钟': 'City clocks across time zones',
  '等额本息/本金对比分析': 'Equal payment and equal principal comparison',
  '支持自定义首付比例，等额本息 vs 等额本金对比分析': 'Compare equal payment vs equal principal with custom down payment',
  '150+货币实时汇率': 'Live exchange rates for 150+ currencies',
  '多货币实时汇率转换': 'Live multi-currency conversion',
  '延迟退休政策计算': 'Retirement age estimate by policy rules',
  '投资复利增长模拟': 'Compound growth simulation',
  '税前税后双向计算': 'Before-tax and after-tax salary conversion',
  '活期定期收益对比': 'Demand and fixed deposit yield comparison',
  '多方案综合对比': 'Compare multiple loan plans',
  'ROI/IRR/NPV计算': 'ROI, IRR, and NPV calculations',
  '体质指数评估': 'Body mass index assessment',
  '体质指数评估，了解您的健康状态': 'Assess BMI and understand your health range',
  '训练心率区间': 'Training heart-rate zones',
  '基础代谢与消耗': 'Basal metabolic rate and daily energy use',
  '每日饮水建议': 'Daily water intake recommendation',
  '睡眠周期优化': 'Sleep cycle optimization',
  '个性化步数建议': 'Personalized step goal suggestions',
  '心血管风险评估': 'Cardiovascular risk estimate',
  '血压分级评估': 'Blood pressure classification',
  '长度/重量/温度等': 'Length, weight, temperature, and more',
  '长度、重量、温度、面积、体积单位互转': 'Convert length, weight, temperature, area, and volume units',
  '2/8/10/16进制互转': 'Convert between binary, octal, decimal, and hex',
  'MD5/SHA系列算法': 'MD5 and SHA algorithms',
  '文本哈希加密计算（使用浏览器原生 API）': 'Text hash calculation using the browser Web Crypto API',
  '生成和解析二维码': 'Generate and parse QR codes',
  '生成文本、链接、WiFi等二维码': 'Generate QR codes for text, links, WiFi, and more',
  'HEX/RGB/HSL互转': 'Convert between HEX, RGB, and HSL',
  'Unix时间戳转换': 'Unix timestamp conversion',
  '时间戳与日期时间互转': 'Convert between timestamps and date-time values',
  'IP地理位置查询': 'IP geolocation lookup',
  'DNS记录类型查询': 'DNS record lookup',
  '下载上传速度': 'Download and upload speed',
  '延迟与丢包率': 'Latency and packet loss',
  '常用端口检测': 'Common port detection',
  '当前网络详情': 'Current network details',
  'HTTP状态与安全': 'HTTP status and security',
  'SSL证书检测': 'SSL certificate check',
  'AI简历优化建议': 'AI resume improvement suggestions',
  'URL/文本智能摘要': 'Summarize URLs and text with AI',
  '100+语言互译': 'Translate across 100+ languages',
  '多平台脚本生成': 'Scripts for multiple short-video platforms',
  '商务邮件智能生成': 'AI business email writing',
  '人名公司品牌取名': 'Names for people, companies, and brands',
  '俄罗斯方块': 'Tetris',
  '扫雷': 'Minesweeper',
  '贪吃蛇': 'Snake',
  '五子棋': 'Gomoku',
  '消消乐': 'Match-3',
  '国际象棋': 'International Chess',
  '中国象棋': 'Chinese Chess',
  '空当接龙': 'FreeCell',
  '经典方块消除游戏': 'Classic block-clearing game',
  '扫雷专家挑战': 'Classic minesweeper challenge',
  '控制蛇吃到更多食物': 'Guide the snake to eat more food',
  '双人对弈或AI对战': 'Play against another player or AI',
  '宝石消除闯关': 'Match gems and clear the board',
  '全球最流行的棋类游戏': 'The world famous strategy board game',
  '中国传统棋类游戏': 'Traditional Chinese strategy board game',
  '纸牌接龙挑战': 'Classic solitaire card challenge',
  '简单': 'Easy',
  '中等': 'Medium',
  '困难': 'Hard',
  '单人': 'Single player',
  '双人对弈': 'Two-player',
  'AI对战': 'Play AI',
  '难度': 'Difficulty',
  '得分': 'Score',
  '步数': 'Moves',
  '游戏结束': 'Game Over',
  '恭喜通关！': 'Cleared!',
  '提示': 'Tip',
  '规则': 'Rules',
  '操作': 'Controls',
  '内容': 'Content',
  '尺寸': 'Size',
  '下载二维码': 'Download QR Code',
  '输入内容生成二维码': 'Enter content to generate a QR code',
  '输入文本、链接或WiFi信息...': 'Enter text, a link, or WiFi information...',
  '点击生成密码': 'Click to generate a password',
  '密码长度': 'Password Length',
  '字符类型': 'Character Types',
  '大写字母 (A-Z)': 'Uppercase letters (A-Z)',
  '小写字母 (a-z)': 'Lowercase letters (a-z)',
  '数字 (0-9)': 'Numbers (0-9)',
  '特殊符号 (!@#$)': 'Symbols (!@#$)',
  '排除易混淆字符': 'Exclude ambiguous characters',
  '弱': 'Weak',
  '良好': 'Good',
  '强': 'Strong',
  '按房屋总价': 'By home price',
  '按贷款金额': 'By loan amount',
  '房屋总价': 'Home price',
  '房屋总价（元）': 'Home price',
  '贷款金额（元）': 'Loan amount',
  '首付比例': 'Down payment ratio',
  '首付': 'Down payment',
  '贷款比例': 'Loan ratio',
  '贷款年限（年）': 'Loan term (years)',
  '年利率': 'Annual rate',
  '年利率（%）': 'Annual rate (%)',
  '年利率 (%)': 'Annual rate (%)',
  '还款方式': 'Payment method',
  '等额本息（每月月供相同）': 'Equal payment (same monthly payment)',
  '等额本金（前期还款多）': 'Equal principal (higher early payments)',
  '等额本息': 'Equal payment',
  '等额本金': 'Equal principal',
  '每月月供': 'Monthly payment',
  '月供': 'Monthly payment',
  '还款总额': 'Total repayment',
  '利息总额': 'Total interest',
  '总还款': 'Total payment',
  '总利息': 'Total interest',
  '还款计划（前12个月）': 'Repayment schedule (first 12 months)',
  '月份': 'Month',
  '本金': 'Principal',
  '利息': 'Interest',
  '剩余': 'Balance',
  '方案A': 'Plan A',
  '方案B': 'Plan B',
  '删除': 'Delete',
  '添加方案': 'Add plan',
  '贷款金额': 'Loan amount',
  '年限': 'Term',
  '年': ' years',
  '最后更新：': 'Last updated: ',
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
    },
    home: {
      eyebrow: '在线计算、转换、开发与效率工具',
      title: 'BitNook 比特角落',
      subtitle: '打开即用的在线工具集合：计算房贷与贷款、生成二维码和安全密码、转换时间戳与单位、统计文本、管理计时任务。',
      primary: '开始使用工具',
      secondary: '查看游戏模块',
      metrics: ['44+ 免费在线工具', '无需安装', '中英双语界面', '移动端可用'],
      pillarsTitle: '按场景快速开始',
      pillars: [
        '算钱：用房贷、贷款对比、复利、工资和收益工具快速估算方案。',
        '处理数据：用时间戳、Hash、二维码、颜色和单位转换处理常见格式。',
        '提升效率：用密码生成、字数统计、计时器、倒计时和日期计算完成日常任务。',
      ],
      featuredTitle: '重点工具',
      contentTitle: '为什么用 BitNook',
      contentItems: [
        '不用安装软件，打开页面即可完成常见计算、转换和文本处理。',
        '多数工具在浏览器内完成计算，适合处理临时任务和轻量数据。',
        '中英文界面随时切换，适合中文使用者和英文工作流。',
      ],
      roadmapTitle: '结果更可靠的用法',
      roadmap: [
        '财务和健康结果用于参考，请结合实际政策、银行报价或专业建议复核。',
        '涉及隐私的文本、密码和计算数据，建议在可信设备和网络环境中使用。',
        '如果不确定该用哪个工具，可以先进入工具中心搜索关键词。',
      ],
    },
    about: {
      title: '关于 BitNook',
      desc: 'BitNook（比特角落）是一个打开即用的在线工具站，服务财务计算、格式转换、开发调试、日常效率和轻量娱乐需求。',
    },
    contact: {
      title: '联系我们',
      desc: '欢迎反馈工具错误、提出新工具建议，或联系合作事项。',
      emailLabel: '联系邮箱',
      response: '通常会在 3-5 个工作日内处理重要反馈。',
      topics: ['工具计算错误', '新增工具建议', '合作与品牌沟通', '隐私与数据请求'],
    },
    legal: {
      updated: '最后更新：2026年5月22日',
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
      viewTools: 'Explore tools',
      viewGames: 'Open games',
    },
    home: {
      eyebrow: 'Online calculators, converters, developer utilities, and productivity tools',
      title: 'BitNook',
      subtitle: 'Use practical online tools instantly: calculate mortgages and loans, generate QR codes and passwords, convert timestamps and units, count words, and manage timers.',
      primary: 'Start using tools',
      secondary: 'View game modules',
      metrics: ['44+ free online tools', 'No installation', 'Chinese/English UI', 'Mobile friendly'],
      pillarsTitle: 'Start by Scenario',
      pillars: [
        'Money planning: estimate mortgage payments, loan options, compound interest, salary, and returns.',
        'Data handling: convert timestamps, hashes, QR codes, colors, units, and common formats.',
        'Daily productivity: generate passwords, count words, run timers, set countdowns, and calculate dates.',
      ],
      featuredTitle: 'Featured Tools',
      contentTitle: 'Why Use BitNook',
      contentItems: [
        'No installation required. Open a page and finish common calculations, conversions, and text tasks.',
        'Most tools calculate in the browser, making them useful for temporary tasks and lightweight data.',
        'Switch between Chinese and English for local use and international work.',
      ],
      roadmapTitle: 'Use Results Carefully',
      roadmap: [
        'Finance and health results are references. Verify them with current policies, quotes, or professional advice.',
        'For private text, passwords, and calculations, use a trusted device and network.',
        'If you are unsure which tool to use, open Tools Hub and search by keyword.',
      ],
    },
    about: {
      title: 'About BitNook',
      desc: 'BitNook is an instant online tools site for finance calculations, format conversion, developer checks, daily productivity, and lightweight games.',
    },
    contact: {
      title: 'Contact Us',
      desc: 'Send bug reports, tool suggestions, partnership requests, or privacy questions.',
      emailLabel: 'Email',
      response: 'Important feedback is usually reviewed within 3-5 business days.',
      topics: ['Calculation issues', 'New tool suggestions', 'Partnerships and brand inquiries', 'Privacy and data requests'],
    },
    legal: {
      updated: 'Last updated: May 22, 2026',
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

function preserveWhitespace(original: string, translated: string) {
  const prefix = original.match(/^\s*/)?.[0] ?? ''
  const suffix = original.match(/\s*$/)?.[0] ?? ''
  return `${prefix}${translated}${suffix}`
}

function translateLoose(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return text
  if (zhToEn[trimmed]) return preserveWhitespace(text, zhToEn[trimmed])

  let translated = trimmed
  const entries = Object.entries(zhToEn).sort((a, b) => b[0].length - a[0].length)
  for (const [zh, en] of entries) {
    translated = translated.split(zh).join(en)
  }

  translated = translated
    .replace(/找到\s*(\d+)\s*个匹配的工具/g, 'Found $1 matching tools')
    .replace(/(\d+)\s*个工具/g, '$1 tools')
    .replace(/(\d+)\s*款经典游戏/g, '$1 classic games')
    .replace(/(\d+)\s*款游戏/g, '$1 games')
    .replace(/(\d+)\s*人/g, '$1 players')
    .replace(/(\d+)\s*位/g, '$1 chars')
    .replace(/(\d+)\s*秒/g, '$1s')
    .replace(/(\d+)\s*分钟/g, '$1 min')
    .replace(/(\d+)years/g, '$1 years')
    .replace(/第\s*(\d+)\s*月/g, 'Month $1')
    .replace(/第\s*(\d+)\s*列/g, 'column $1')

  return translated === trimmed ? text : preserveWhitespace(text, translated)
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

function DomTranslator({ locale }: { locale: Locale }) {
  const textOriginalsRef = useRef(new WeakMap<Text, string>())

  useEffect(() => {
    const textOriginals = textOriginalsRef.current
    const ignoredTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'])

    const translateTextNode = (node: Text) => {
      const parent = node.parentElement
      if (!parent || ignoredTags.has(parent.tagName) || parent.closest('[data-no-translate]')) return
      if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue ?? '')
      const original = textOriginals.get(node) ?? ''
      if (locale === 'en' && node.nodeValue !== original && !/[\u4e00-\u9fff]/.test(node.nodeValue ?? '')) {
        return
      }
      if (locale === 'zh' && /[\u4e00-\u9fff]/.test(node.nodeValue ?? '')) {
        textOriginals.set(node, node.nodeValue ?? '')
        return
      }
      const next = locale === 'zh' ? original : translateLoose(original)
      if (node.nodeValue !== next) node.nodeValue = next
    }

    const translateElementAttrs = (element: Element) => {
      if (ignoredTags.has(element.tagName) || element.closest('[data-no-translate]')) return
      for (const attr of ['placeholder', 'title', 'aria-label', 'alt']) {
        const value = element.getAttribute(attr)
        if (!value) continue
        const dataKey = `data-i18n-original-${attr}`
        const original = element.getAttribute(dataKey) ?? value
        if (!element.hasAttribute(dataKey)) element.setAttribute(dataKey, original)
        if (locale === 'en' && value !== original && !/[\u4e00-\u9fff]/.test(value)) {
          continue
        }
        if (locale === 'zh' && /[\u4e00-\u9fff]/.test(value)) {
          element.setAttribute(dataKey, value)
          continue
        }
        const next = locale === 'zh' ? original : translateLoose(original)
        if (element.getAttribute(attr) !== next) element.setAttribute(attr, next)
      }
    }

    const apply = () => {
      document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        translateTextNode(node as Text)
        node = walker.nextNode()
      }
      document.body.querySelectorAll('*').forEach(translateElementAttrs)
    }

    apply()
    const observer = new MutationObserver(() => window.requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [locale])

  return null
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh')

  useEffect(() => {
    const saved = (window.localStorage.getItem('bitnook-locale') || window.localStorage.getItem('toolverse-locale')) as Locale | null
    if (saved === 'zh' || saved === 'en') setLocaleState(saved)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem('bitnook-locale', next)
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
      const value = getValue(translations[locale], path)
      return Array.isArray(value) ? value : []
    },
  }), [locale, setLocale, toggleLocale])

  return (
    <I18nContext.Provider value={value}>
      <DomTranslator locale={locale} />
      <div key={locale} className="contents">
        {children}
      </div>
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
