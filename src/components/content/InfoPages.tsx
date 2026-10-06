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
    <div className="flex flex-col min-h-screen bg-canvas text-text-primary">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-border bg-surface shadow-subtle" style={{ color }}>
              {icon}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">{title}</h1>
          </div>
          {desc && <p className="text-text-secondary mb-8 leading-relaxed text-sm sm:text-base">{desc}</p>}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-subtle">
      <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-3">{title}</h2>
      <div className="text-text-secondary leading-relaxed space-y-3 text-sm">{children}</div>
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
          <a className="text-accent hover:underline font-medium" href="mailto:support@bitnook.com">
            support@bitnook.com
          </a>
          <p>{t('contact.response')}</p>
        </Section>
        <Section title={isZh ? '反馈类型' : 'Feedback Topics'}>
          <ul className="grid sm:grid-cols-2 gap-2">
            {list('contact.topics').map((topic) => (
              <li key={topic} className="rounded-md bg-surface-secondary border border-border px-3 py-2 text-text-secondary text-xs">{topic}</li>
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
        ['1. 信息收集与最小化原则', 'BitNook（比特角落）坚持数据最小化原则。我们可能收集匿名访问数据、粗略地理区域（国家/城市级别）、设备类型、浏览器类型及基础页面性能指标。除用户主动发送邮件反馈外，站点不强制要求注册，不收集用户个人真实身份、电话或身份证件。'],
        ['2. 本地优先运算与零服务端留存', 'BitNook 的绝大部分工具（包括但不限于密码生成、文本对比、Base64 编码、JSON 格式化、房贷与个税计算等）均在您的浏览器本地内存中完成运算。您的输入内容不会被上传或存储到 BitNook 的任何服务器日志中。'],
        ['3. Cookie 与广告服务 (Google AdSense)', '第三方供应商（包括 Google）使用 Cookie 根据用户此前访问本网站或其他网站的历史来投放广告。Google 对广告 Cookie 的使用使其及其合作伙伴能够根据用户对本网站和/或互联网上其他网站的访问记录向用户投放广告。用户可以访问 Google 广告设置 (https://www.google.com/settings/ads) 停用个性化广告，或通过 www.aboutads.info 停用第三方供应商的定向广告 Cookie。'],
        ['4. 用户偏好与 GDPR / CPRA 合规', '对于来自欧洲经济区 (EEA)、英国、瑞士以及美国加州等司法管辖区的访客，站点提供隐私偏好授权横幅。用户可选择接受或仅保留必要 Cookie，亦可随时通过页面底部的「Cookie 设置」重新调整授权状态。'],
        ['5. 第三方分析与安全托管', '站点部署于 Cloudflare 全球边缘网络，静态资产由边缘节点提供安全防护与 CDN 加速。外部链接、二维码图片生成或第三方 API 适用对应服务商的隐私条款。'],
        ['6. 您的权利与联系渠道', '您可以随时清理浏览器本地存储 (localStorage) 及 Cookie。对隐私保护有任何疑问或合规建议，欢迎联系 support@bitnook.com。'],
      ]
    : [
        ['1. Information Collection & Minimization', 'BitNook adheres to strict data minimization. We only collect anonymous telemetry, country/city-level geolocation, browser type, and core web vitals. We do not require registration and never collect real personal identities, phone numbers, or government IDs.'],
        ['2. Local-First Processing & Client Isolation', 'Most BitNook tools—including password generation, text diff, Base64 converter, JSON formatter, mortgage, and tax calculators—execute entirely within your browser memory. User inputs and calculation payloads are never transmitted or persisted to BitNook server logs.'],
        ['3. Cookies & Advertising (Google AdSense)', 'Third-party vendors, including Google, use cookies to serve ads based on a user\'s prior visits to your website or other websites. Google\'s use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Google Ads Settings (https://www.google.com/settings/ads) or through www.aboutads.info.'],
        ['4. Consent & GDPR / CPRA Compliance', 'For visitors in the EEA, UK, Switzerland, and US states such as California, BitNook provides a consent preference mechanism. You can accept or limit to essential cookies, and modify your consent at any time via the "Cookie Preferences" link in the footer.'],
        ['5. Infrastructure & Third-Party Services', 'BitNook is delivered across Cloudflare global edge infrastructure for DDOS protection and high-speed asset distribution. External links and optional APIs operate under their respective privacy policies.'],
        ['6. Your Rights & Contact', 'You may inspect or clear your browser local storage and cookies at any time. For questions regarding privacy practices, please contact support@bitnook.com.'],
      ]

  return (
    <PageShell icon={<Shield className="w-5 h-5 text-success" />} color="#16A34A" title={t('legal.privacyTitle')}>
      <div className="space-y-4">
        {sections.map(([title, body]) => (
          <Section key={title} title={title}><p>{body}</p></Section>
        ))}
        <p className="text-xs text-text-muted pt-2">{t('legal.updated')}</p>
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
    <PageShell icon={<FileText className="w-5 h-5 text-accent" />} color="#2563EB" title={t('legal.termsTitle')}>
      <div className="space-y-4">
        {sections.map(([title, body]) => (
          <Section key={title} title={title}><p>{body}</p></Section>
        ))}
        <p className="text-xs text-text-muted pt-2">{t('legal.updated')}</p>
      </div>
    </PageShell>
  )
}
