import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Clock, Timer, Calendar, Lock, Type, Globe, Shuffle } from 'lucide-react'

const tools = [
  { name: '计时器', slug: 'timer', icon: Timer, color: '#3B82F6', desc: '多任务并行计时，支持番茄钟', href: '/tools/daily/timer' },
  { name: '倒计时', slug: 'countdown', icon: Clock, color: '#3B82F6', desc: '目标日期倒计时，实时显示', href: '/tools/daily/countdown' },
  { name: '抽奖', slug: 'lottery', icon: Shuffle, color: '#3B82F6', desc: '转盘抽奖，防重复抽取', href: '/tools/daily/lottery' },
  { name: '密码生成', slug: 'password', icon: Lock, color: '#8B5CF6', desc: '安全密码批量生成', href: '/tools/daily/password' },
  { name: '文字统计', slug: 'word-count', icon: Type, color: '#3B82F6', desc: '字数、字符、关键词分析', href: '/tools/daily/word-count' },
  { name: '日期计算', slug: 'date-calc', icon: Calendar, color: '#3B82F6', desc: '日期间距、工作日计算', href: '/tools/daily/date-calc' },
  { name: '秒表', slug: 'stopwatch', icon: Timer, color: '#3B82F6', desc: '毫秒精度，多圈记录', href: '/tools/daily/stopwatch' },
  { name: '世界时钟', slug: 'world-clock', icon: Globe, color: '#3B82F6', desc: '多时区城市时钟', href: '/tools/daily/world-clock' },
]

export default function DailyToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h1 className="text-3xl font-bold text-white">日常工具</h1>
            </div>
            <p className="text-[#94A3B8]">8个日常工具，让生活更高效</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="glass-card p-5 flex items-start gap-4 group"
              >
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
