import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Sparkles, FileText, Languages, Video, Mail, Hash, Cpu } from 'lucide-react'

const tools = [
  { name: 'AI大模型显存计算器', slug: 'gpu-calculator', icon: Cpu, color: '#06B6D4', desc: 'LLM VRAM Calculator · 估算模型显存', href: '/tools/ai/gpu-calculator', vip: false },
  { name: '简历优化', slug: 'resume', icon: FileText, color: '#06B6D4', desc: 'AI简历优化建议', href: '/tools/ai/resume', vip: true },
  { name: '文章摘要', slug: 'summarize', icon: Hash, color: '#06B6D4', desc: 'URL/文本智能摘要', href: '/tools/ai/summarize', vip: true },
  { name: '智能翻译', slug: 'translate', icon: Languages, color: '#06B6D4', desc: '100+语言互译', href: '/tools/ai/translate', vip: true },
  { name: '短视频脚本', slug: 'video-script', icon: Video, color: '#06B6D4', desc: '多平台脚本生成', href: '/tools/ai/video-script', vip: true },
  { name: '邮件生成', slug: 'email', icon: Mail, color: '#06B6D4', desc: '商务邮件智能生成', href: '/tools/ai/email', vip: true },
  { name: 'AI取名', slug: 'naming', icon: Sparkles, color: '#06B6D4', desc: '人名公司品牌取名', href: '/tools/ai/naming', vip: true },
]

export default function AIToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <h1 className="text-3xl font-bold text-white">AI工具</h1>
              <span className="px-2 py-1 text-xs rounded-full bg-[#F59E0B]/20 text-[#F59E0B]">VIP</span>
            </div>
            <p className="text-[#94A3B8]">7个AI工具，智能提升效率</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
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
                  <h3 className="font-semibold text-white mb-1">{tool.name}</h3>
                  <p className="text-sm text-[#475569]">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
