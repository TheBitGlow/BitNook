'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useI18n } from '@/lib/i18n'
import { FileText, Mail, Shield, Sparkles } from 'lucide-react'

function PageShell({
  icon,
  color,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode
  color: string
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              {icon}
            </div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </div>
          {desc && <p className="text-[#94A3B8] mb-8 leading-relaxed">{desc}</p>}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[rgba(99,102,241,0.15)] bg-[#0D1117] p-6">
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
      <div className="text-[#94A3B8] leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export function AboutContent() {
  const { locale, t } = useI18n()
  const sections = locale === 'zh'
    ? [
        ['我们提供什么', 'BitNook（比特角落）提供财务计算器、格式转换、开发者工具、日常效率工具和轻量游戏。大多数工具打开即可使用，不需要安装。'],
        ['体验目标', '我们希望工具页面保持清晰、快速、移动端友好，让用户能在几步之内完成计算、转换、生成或查询。'],
        ['准确性与隐私', '工具会尽量说明计算逻辑、适用边界和隐私处理方式。财务、健康等重要结果请结合实际情况复核。'],
      ]
    : [
        ['What We Provide', 'BitNook provides finance calculators, format converters, developer utilities, daily productivity tools, and lightweight games. Most tools work instantly without installation.'],
        ['Experience Goal', 'We keep tool pages clear, fast, and mobile-friendly so users can calculate, convert, generate, or check information in just a few steps.'],
        ['Accuracy and Privacy', 'Tools aim to explain formulas, boundaries, and privacy handling. Important finance and health results should be verified against real circumstances.'],
      ]

  return (
    <PageShell
      icon={<Sparkles className="w-5 h-5 text-[#06B6D4]" />}
      color="#06B6D4"
      title={t('about.title')}
      desc={t('about.desc')}
    >
      <div className="space-y-4">
        {sections.map(([title, body]) => (
          <Section key={title} title={title}>
            <p>{body}</p>
          </Section>
        ))}
      </div>
    </PageShell>
  )
}

export function ContactContent() {
  const { locale, t, list } = useI18n()
  const isZh = locale === 'zh'

  return (
    <PageShell
      icon={<Mail className="w-5 h-5 text-[#10B981]" />}
      color="#10B981"
      title={t('contact.title')}
      desc={t('contact.desc')}
    >
      <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-4">
        <Section title={t('contact.emailLabel')}>
          <a className="text-[#06B6D4] hover:text-white" href="mailto:contact@bitnook.example.com">
            contact@bitnook.example.com
          </a>
          <p>{t('contact.response')}</p>
        </Section>
        <Section title={isZh ? '反馈类型' : 'Feedback Topics'}>
          <ul className="grid sm:grid-cols-2 gap-2">
            {list('contact.topics').map((topic) => (
              <li key={topic} className="rounded-lg bg-[#080B14] px-3 py-2">{topic}</li>
            ))}
          </ul>
        </Section>
      </div>
    </PageShell>
  )
}

export function PrivacyContent() {
  const { locale, t } = useI18n()
  const sections = locale === 'zh'
    ? [
        ['1. 信息收集', '我们可能收集您主动提供的邮箱等账户信息，以及匿名访问数据、设备类型、浏览器类型和基础使用统计。'],
        ['2. 信息使用', '信息用于提供服务、改进体验、维护安全、分析页面表现和处理必要通知。'],
        ['3. 本地处理', '部分工具会在浏览器本地完成计算。密码生成、文本处理等敏感输入不会主动发送到 BitNook 服务器。'],
        ['4. Cookie 与统计', '我们可能使用 Analytics、Search Console、Clarity 和广告服务，用于统计访问、改进体验和展示相关内容。'],
        ['5. 第三方服务', '二维码生成、广告、统计或托管服务可能由第三方提供。第三方服务适用其自身政策。'],
        ['6. 您的权利', '您可以请求访问、更正或删除个人信息，也可以通过浏览器设置管理 Cookie。'],
        ['7. 联系方式', '隐私相关请求可通过联系页面或 contact@bitnook.example.com 提交。'],
      ]
    : [
        ['1. Information We Collect', 'We may collect account information you provide, anonymous usage data, device type, browser type, and basic analytics events.'],
        ['2. How We Use Information', 'Information is used to provide services, improve experience, maintain security, analyze page performance, and send necessary notices.'],
        ['3. Local Processing', 'Some tools run directly in your browser. Sensitive inputs for password generation and text utilities are not intentionally sent to BitNook servers.'],
        ['4. Cookies and Analytics', 'BitNook may use Analytics, Search Console, Clarity, and ad services to measure visits, improve experience, and display relevant content.'],
        ['5. Third-Party Services', 'QR generation, ads, analytics, or hosting may be provided by third parties and governed by their own policies.'],
        ['6. Your Rights', 'You may request access, correction, or deletion of personal information and manage cookies through your browser settings.'],
        ['7. Contact', 'Privacy requests can be sent through the contact page or contact@bitnook.example.com.'],
      ]

  return (
    <PageShell icon={<Shield className="w-5 h-5 text-[#10B981]" />} color="#10B981" title={t('legal.privacyTitle')}>
      <div className="space-y-4">
        {sections.map(([title, body]) => (
          <Section key={title} title={title}><p>{body}</p></Section>
        ))}
        <p className="text-sm text-[#475569]">{t('legal.updated')}</p>
      </div>
    </PageShell>
  )
}

export function TermsContent() {
  const { locale, t } = useI18n()
  const sections = locale === 'zh'
    ? [
        ['1. 服务说明', 'BitNook（比特角落）提供在线工具、计算器、转换器、开发者工具和游戏模块。工具结果主要用于参考和辅助决策。'],
        ['2. 使用规范', '不得使用本服务进行违法活动、攻击、滥用自动化请求、传播恶意内容或侵犯他人权益。'],
        ['3. 结果免责声明', '我们会尽力保证公式和逻辑准确，但财务、健康、网络检测等结果可能受输入、地区政策或环境影响。重要决策请自行复核或咨询专业人士。'],
        ['4. 广告与第三方链接', '站点可能展示广告或外部链接。广告内容和第三方服务由对应提供方负责。'],
        ['5. 知识产权', 'BitNook 的页面、设计、代码和内容受知识产权保护。未经许可不得复制或批量抓取。'],
        ['6. 服务变更', '我们可能根据用户反馈、合规要求或服务维护需要调整工具、内容和服务条款。'],
      ]
    : [
        ['1. Service Description', 'BitNook provides online tools, calculators, converters, developer utilities, and game modules. Results are for reference and assistance.'],
        ['2. Acceptable Use', 'You may not use the service for illegal activity, attacks, abusive automation, malicious content, or infringement of others rights.'],
        ['3. Result Disclaimer', 'We try to keep formulas and logic accurate, but finance, health, network, and similar results may depend on inputs, local policy, or environment. Verify important decisions or consult professionals.'],
        ['4. Ads and External Links', 'The site may display ads or external links. Ad content and third-party services are provided by their respective providers.'],
        ['5. Intellectual Property', 'BitNook pages, design, code, and content are protected by intellectual property laws. Copying or bulk scraping without permission is not allowed.'],
        ['6. Service Changes', 'We may adjust tools, content, and terms based on user feedback, compliance needs, or service maintenance.'],
      ]

  return (
    <PageShell icon={<FileText className="w-5 h-5 text-[#6366F1]" />} color="#6366F1" title={t('legal.termsTitle')}>
      <div className="space-y-4">
        {sections.map(([title, body]) => (
          <Section key={title} title={title}><p>{body}</p></Section>
        ))}
        <p className="text-sm text-[#475569]">{t('legal.updated')}</p>
      </div>
    </PageShell>
  )
}
