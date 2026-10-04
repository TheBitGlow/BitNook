'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useI18n } from '@/lib/i18n'
import {
  Clock, TrendingUp, Heart, ArrowRightLeft, Wifi, Sparkles,
  Search, ArrowRight
} from 'lucide-react'

const categories = [
  { id: 'daily', name: '日常工具', icon: Clock, color: '#3B82F6', count: 8, href: '/tools/daily' },
  { id: 'finance', name: '财务工具', icon: TrendingUp, color: '#10B981', count: 8, href: '/tools/finance' },
  { id: 'health', name: '健康工具', icon: Heart, color: '#EF4444', count: 8, href: '/tools/health' },
  { id: 'convert', name: '格式转换', icon: ArrowRightLeft, color: '#F59E0B', count: 6, href: '/tools/convert' },
  { id: 'network', name: '网络工具', icon: Wifi, color: '#8B5CF6', count: 8, href: '/tools/network' },
  { id: 'ai', name: 'AI工具', icon: Sparkles, color: '#06B6D4', count: 6, href: '/tools/ai', vip: true },
]

const allTools = [
  // Daily
  { name: '计时器', slug: 'timer', category: 'daily', icon: Clock, color: '#3B82F6', desc: '多任务并行计时，支持番茄钟', href: '/tools/daily/timer' },
  { name: '倒计时', slug: 'countdown', category: 'daily', icon: Clock, color: '#3B82F6', desc: '目标日期倒计时，烟花特效', href: '/tools/daily/countdown' },
  { name: '抽奖', slug: 'lottery', category: 'daily', icon: Clock, color: '#3B82F6', desc: '转盘抽奖，防重复抽取', href: '/tools/daily/lottery' },
  { name: '密码生成', slug: 'password', category: 'daily', icon: Clock, color: '#3B82F6', desc: '安全密码批量生成', href: '/tools/daily/password' },
  { name: '文字统计', slug: 'word-count', category: 'daily', icon: Clock, color: '#3B82F6', desc: '字数、字符、关键词分析', href: '/tools/daily/word-count' },
  { name: '日期计算', slug: 'date-calc', category: 'daily', icon: Clock, color: '#3B82F6', desc: '日期间距、工作日计算', href: '/tools/daily/date-calc' },
  { name: '秒表', slug: 'stopwatch', category: 'daily', icon: Clock, color: '#3B82F6', desc: '毫秒精度，多圈记录', href: '/tools/daily/stopwatch' },
  { name: '世界时钟', slug: 'world-clock', category: 'daily', icon: Clock, color: '#3B82F6', desc: '多时区城市时钟', href: '/tools/daily/world-clock' },
  // Finance
  { name: '房贷计算', slug: 'mortgage', category: 'finance', icon: TrendingUp, color: '#10B981', desc: '等额本息/本金对比分析', href: '/tools/finance/mortgage' },
  { name: '汇率转换', slug: 'exchange', category: 'finance', icon: TrendingUp, color: '#10B981', desc: '150+货币实时汇率', href: '/tools/finance/exchange' },
  { name: '退休计算', slug: 'retirement', category: 'finance', icon: TrendingUp, color: '#10B981', desc: '延迟退休政策计算', href: '/tools/finance/retirement' },
  { name: '复利计算', slug: 'compound', category: 'finance', icon: TrendingUp, color: '#10B981', desc: '投资复利增长模拟', href: '/tools/finance/compound' },
  { name: '工资计算', slug: 'salary', category: 'finance', icon: TrendingUp, color: '#10B981', desc: '税前税后双向计算', href: '/tools/finance/salary' },
  { name: '存款计算', slug: 'deposit', category: 'finance', icon: TrendingUp, color: '#10B981', desc: '活期定期收益对比', href: '/tools/finance/deposit' },
  { name: '贷款比价', slug: 'loan-compare', category: 'finance', icon: TrendingUp, color: '#10B981', desc: '多方案综合对比', href: '/tools/finance/loan-compare' },
  { name: '投资回报', slug: 'roi', category: 'finance', icon: TrendingUp, color: '#10B981', desc: 'ROI/IRR/NPV计算', href: '/tools/finance/roi' },
  // Health
  { name: 'BMI计算', slug: 'bmi', category: 'health', icon: Heart, color: '#EF4444', desc: '体质指数评估', href: '/tools/health/bmi' },
  { name: '心率计算', slug: 'heart-rate', category: 'health', icon: Heart, color: '#EF4444', desc: '训练心率区间', href: '/tools/health/heart-rate' },
  { name: '卡路里', slug: 'calories', category: 'health', icon: Heart, color: '#EF4444', desc: '基础代谢与消耗', href: '/tools/health/calories' },
  { name: '饮水量', slug: 'water-intake', category: 'health', icon: Heart, color: '#EF4444', desc: '每日饮水建议', href: '/tools/health/water-intake' },
  { name: '睡眠计算', slug: 'sleep', category: 'health', icon: Heart, color: '#EF4444', desc: '睡眠周期优化', href: '/tools/health/sleep' },
  { name: '步数目标', slug: 'steps', category: 'health', icon: Heart, color: '#EF4444', desc: '个性化步数建议', href: '/tools/health/steps' },
  { name: '心脏年龄', slug: 'heart-age', category: 'health', icon: Heart, color: '#EF4444', desc: '心血管风险评估', href: '/tools/health/heart-age' },
  { name: '血压评估', slug: 'blood-pressure', category: 'health', icon: Heart, color: '#EF4444', desc: '血压分级评估', href: '/tools/health/blood-pressure' },
  // Convert
  { name: '单位转换', slug: 'unit', category: 'convert', icon: ArrowRightLeft, color: '#F59E0B', desc: '长度/重量/温度等', href: '/tools/convert/unit' },
  { name: '进制转换', slug: 'radix', category: 'convert', icon: ArrowRightLeft, color: '#F59E0B', desc: '2/8/10/16进制互转', href: '/tools/convert/radix' },
  { name: 'Hash生成', slug: 'hash', category: 'convert', icon: ArrowRightLeft, color: '#F59E0B', desc: 'MD5/SHA系列算法', href: '/tools/convert/hash' },
  { name: '二维码', slug: 'qrcode', category: 'convert', icon: ArrowRightLeft, color: '#F59E0B', desc: '生成和解析二维码', href: '/tools/convert/qrcode' },
  { name: '颜色转换', slug: 'color', category: 'convert', icon: ArrowRightLeft, color: '#F59E0B', desc: 'HEX/RGB/HSL互转', href: '/tools/convert/color' },
  { name: '时间戳', slug: 'timestamp', category: 'convert', icon: ArrowRightLeft, color: '#F59E0B', desc: 'Unix时间戳转换', href: '/tools/convert/timestamp' },
  // Network
  { name: 'IP归属', slug: 'ip-lookup', category: 'network', icon: Wifi, color: '#8B5CF6', desc: 'IP地理位置查询', href: '/tools/network/ip-lookup' },
  { name: 'DNS查询', slug: 'dns', category: 'network', icon: Wifi, color: '#8B5CF6', desc: 'DNS记录类型查询', href: '/tools/network/dns' },
  { name: '网速测试', slug: 'speed-test', category: 'network', icon: Wifi, color: '#8B5CF6', desc: '下载上传速度', href: '/tools/network/speed-test' },
  { name: 'Ping测试', slug: 'ping', category: 'network', icon: Wifi, color: '#8B5CF6', desc: '延迟与丢包率', href: '/tools/network/ping' },
  { name: '端口扫描', slug: 'port-scan', category: 'network', icon: Wifi, color: '#8B5CF6', desc: '常用端口检测', href: '/tools/network/port-scan' },
  { name: 'WiFi信息', slug: 'wifi-info', category: 'network', icon: Wifi, color: '#8B5CF6', desc: '当前网络详情', href: '/tools/network/wifi-info' },
  { name: 'HTTP检测', slug: 'http-check', category: 'network', icon: Wifi, color: '#8B5CF6', desc: 'HTTP状态与安全', href: '/tools/network/http-check' },
  { name: 'SSL检测', slug: 'ssl-check', category: 'network', icon: Wifi, color: '#8B5CF6', desc: 'SSL证书检测', href: '/tools/network/ssl-check' },
  // AI
  { name: '简历优化', slug: 'resume', category: 'ai', icon: Sparkles, color: '#06B6D4', desc: 'AI简历优化建议', href: '/tools/ai/resume', vip: true },
  { name: '文章摘要', slug: 'summarize', category: 'ai', icon: Sparkles, color: '#06B6D4', desc: 'URL/文本智能摘要', href: '/tools/ai/summarize', vip: true },
  { name: '智能翻译', slug: 'translate', category: 'ai', icon: Sparkles, color: '#06B6D4', desc: '100+语言互译', href: '/tools/ai/translate', vip: true },
  { name: '短视频脚本', slug: 'video-script', category: 'ai', icon: Sparkles, color: '#06B6D4', desc: '多平台脚本生成', href: '/tools/ai/video-script', vip: true },
  { name: '邮件生成', slug: 'email', category: 'ai', icon: Sparkles, color: '#06B6D4', desc: '商务邮件智能生成', href: '/tools/ai/email', vip: true },
  { name: 'AI取名', slug: 'naming', category: 'ai', icon: Sparkles, color: '#06B6D4', desc: '人名公司品牌取名', href: '/tools/ai/naming', vip: true },
]

const categoryEn: Record<string, { name: string; desc: string }> = {
  daily: { name: 'Daily Tools', desc: 'Everyday productivity utilities' },
  finance: { name: 'Finance Tools', desc: 'Financial calculators and planning tools' },
  health: { name: 'Health Tools', desc: 'Health assessment and tracking tools' },
  convert: { name: 'Format Conversion', desc: 'Format, unit, color, and data conversion' },
  network: { name: 'Network Tools', desc: 'Network diagnostics and management tools' },
  ai: { name: 'AI Tools', desc: 'AI assistants and smart workflow tools' },
}

const toolEn: Record<string, { name: string; desc: string }> = {
  timer: { name: 'Timer', desc: 'Multi-task timers with Pomodoro support' },
  countdown: { name: 'Countdown', desc: 'Live countdowns for target dates' },
  lottery: { name: 'Lottery', desc: 'Spin lottery with duplicate prevention' },
  password: { name: 'Password Generator', desc: 'Generate secure passwords locally' },
  'word-count': { name: 'Word Counter', desc: 'Analyze words, characters, and keywords' },
  'date-calc': { name: 'Date Calculator', desc: 'Date intervals and workday calculations' },
  stopwatch: { name: 'Stopwatch', desc: 'Millisecond precision with lap records' },
  'world-clock': { name: 'World Clock', desc: 'City clocks across time zones' },
  mortgage: { name: 'Mortgage Calculator', desc: 'Compare equal payment and equal principal plans' },
  exchange: { name: 'Currency Converter', desc: 'Live exchange rates for 150+ currencies' },
  retirement: { name: 'Retirement Calculator', desc: 'Estimate retirement timing by policy rules' },
  compound: { name: 'Compound Interest Calculator', desc: 'Simulate long-term investment growth' },
  salary: { name: 'Salary Calculator', desc: 'Before-tax and after-tax salary conversion' },
  deposit: { name: 'Deposit Calculator', desc: 'Compare deposit yield scenarios' },
  'loan-compare': { name: 'Loan Comparison', desc: 'Compare multiple loan plans' },
  roi: { name: 'ROI Calculator', desc: 'Calculate ROI, IRR, and NPV' },
  bmi: { name: 'BMI Calculator', desc: 'Assess body mass index' },
  'heart-rate': { name: 'Heart Rate Calculator', desc: 'Training heart-rate zones' },
  calories: { name: 'Calorie Calculator', desc: 'Basal metabolic rate and daily energy use' },
  'water-intake': { name: 'Water Intake Calculator', desc: 'Daily water intake suggestions' },
  sleep: { name: 'Sleep Calculator', desc: 'Optimize sleep cycles' },
  steps: { name: 'Step Goal Calculator', desc: 'Personalized step goals' },
  'heart-age': { name: 'Heart Age Calculator', desc: 'Cardiovascular risk estimate' },
  'blood-pressure': { name: 'Blood Pressure Checker', desc: 'Blood pressure classification' },
  unit: { name: 'Unit Converter', desc: 'Length, weight, temperature, and more' },
  radix: { name: 'Radix Converter', desc: 'Binary, octal, decimal, and hex conversion' },
  hash: { name: 'Hash Generator', desc: 'MD5 and SHA algorithms' },
  qrcode: { name: 'QR Code Generator', desc: 'Generate and parse QR codes' },
  color: { name: 'Color Converter', desc: 'Convert HEX, RGB, and HSL values' },
  timestamp: { name: 'Timestamp Converter', desc: 'Unix timestamp conversion' },
  'ip-lookup': { name: 'IP Lookup', desc: 'IP geolocation lookup' },
  dns: { name: 'DNS Lookup', desc: 'DNS record lookup' },
  'speed-test': { name: 'Speed Test', desc: 'Download and upload speed' },
  ping: { name: 'Ping Test', desc: 'Latency and packet loss' },
  'port-scan': { name: 'Port Scanner', desc: 'Common port detection' },
  'wifi-info': { name: 'WiFi Info', desc: 'Current network details' },
  'http-check': { name: 'HTTP Check', desc: 'HTTP status and security' },
  'ssl-check': { name: 'SSL Check', desc: 'SSL certificate check' },
  resume: { name: 'Resume Optimizer', desc: 'AI resume improvement suggestions' },
  summarize: { name: 'Article Summarizer', desc: 'Summarize URLs and text with AI' },
  translate: { name: 'AI Translator', desc: 'Translate across 100+ languages' },
  'video-script': { name: 'Short Video Script', desc: 'Scripts for short-video platforms' },
  email: { name: 'Email Generator', desc: 'AI business email writing' },
  naming: { name: 'AI Naming', desc: 'Names for people, companies, and brands' },
}

const recommendedTools = ['mortgage', 'loan-compare', 'compound', 'salary', 'timestamp', 'qrcode', 'password']

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { locale } = useI18n()
  const isZh = locale === 'zh'

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return allTools
    const query = searchQuery.toLowerCase()
    return allTools.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.desc.toLowerCase().includes(query) ||
      toolEn[tool.slug]?.name.toLowerCase().includes(query) ||
      toolEn[tool.slug]?.desc.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const query = searchQuery.toLowerCase()
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(query) ||
      categoryEn[cat.id]?.name.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-4">{isZh ? '工具中心' : 'Tools Hub'}</h1>
            <p className="text-[#94A3B8]">
              {isZh ? `浏览全部 ${allTools.length} 个免费在线工具` : `Browse all ${allTools.length} free online tools`}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-10">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isZh ? '搜索工具...' : 'Search tools...'}
                className="w-full pl-12 pr-4 py-3 bg-[#111827] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-[#94A3B8]">
                {isZh ? `找到 ${filteredTools.length} 个匹配的工具` : `Found ${filteredTools.length} matching tools`}
              </p>
            )}
          </div>

          {/* Categories */}
          {filteredCategories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {filteredCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="glass-card p-4 flex flex-col items-center text-center group relative"
                >
                  {cat.vip && (
                    <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B]">
                      VIP
                    </span>
                  )}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{isZh ? cat.name : categoryEn[cat.id]?.name}</h3>
                  <p className="text-sm text-[#475569]">{isZh ? `${cat.count}个工具` : `${cat.count} tools`}</p>
                </Link>
              ))}
            </div>
          )}

          {/* All Tools Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTools.map((tool) => (
                <Link
                  key={`${tool.category}-${tool.slug}`}
                  href={tool.href}
                  className="glass-card p-5 flex items-start gap-4 group relative"
                >
                  {tool.vip && (
                    <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B]">
                      VIP
                    </span>
                  )}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${tool.color}20` }}
                  >
                    <tool.icon className="w-5 h-5" style={{ color: tool.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{isZh ? tool.name : toolEn[tool.slug]?.name}</h3>
                    <p className="text-sm text-[#475569]">{isZh ? tool.desc : toolEn[tool.slug]?.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#94A3B8] mb-4">{isZh ? '没有找到匹配的工具' : 'No matching tools found'}</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#6366F1] hover:text-white"
              >
                {isZh ? '清除搜索' : 'Clear search'}
              </button>
            </div>
          )}

          <section className="mt-14 grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <div className="rounded-xl border border-[rgba(99,102,241,0.15)] bg-[#0D1117] p-6">
              <h2 className="text-xl font-bold text-white mb-3">
                {isZh ? '常用推荐工具' : 'Recommended Tools'}
              </h2>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                {isZh
                  ? '不知道从哪里开始？这些工具覆盖常见的财务计算、格式转换和安全密码生成场景。'
                  : 'Not sure where to start? These tools cover common finance, conversion, and secure password tasks.'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {recommendedTools.map((slug) => {
                const tool = allTools.find((item) => item.slug === slug)
                if (!tool) return null
                return (
                  <Link key={slug} href={tool.href} className="rounded-lg border border-[rgba(99,102,241,0.15)] bg-[#111827] p-4 hover:border-[rgba(99,102,241,0.45)] transition-colors">
                    <h3 className="font-semibold text-white mb-1">{isZh ? tool.name : toolEn[slug].name}</h3>
                    <p className="text-sm text-[#94A3B8]">{isZh ? tool.desc : toolEn[slug].desc}</p>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
