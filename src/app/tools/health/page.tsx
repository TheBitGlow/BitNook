import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Heart, Activity, Droplets, Moon, Footprints, Wind, Gauge, Flame } from 'lucide-react'

const tools = [
  { name: 'BMI计算', slug: 'bmi', icon: Activity, color: '#EF4444', desc: '体质指数评估', href: '/tools/health/bmi' },
  { name: '心率计算', slug: 'heart-rate', icon: Heart, color: '#EF4444', desc: '训练心率区间', href: '/tools/health/heart-rate' },
  { name: '卡路里', slug: 'calories', icon: Flame, color: '#EF4444', desc: '基础代谢与消耗', href: '/tools/health/calories' },
  { name: '饮水量', slug: 'water-intake', icon: Droplets, color: '#3B82F6', desc: '每日饮水建议', href: '/tools/health/water-intake' },
  { name: '睡眠计算', slug: 'sleep', icon: Moon, color: '#8B5CF6', desc: '睡眠周期优化', href: '/tools/health/sleep' },
  { name: '步数目标', slug: 'steps', icon: Footprints, color: '#10B981', desc: '个性化步数建议', href: '/tools/health/steps' },
  { name: '心脏年龄', slug: 'heart-age', icon: Heart, color: '#EC4899', desc: '心血管风险评估', href: '/tools/health/heart-age' },
  { name: '血压评估', slug: 'blood-pressure', icon: Gauge, color: '#EF4444', desc: '血压分级评估', href: '/tools/health/blood-pressure' },
]

export default function HealthToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#EF4444]" />
              </div>
              <h1 className="text-3xl font-bold text-white">健康工具</h1>
            </div>
            <p className="text-[#94A3B8]">8个健康工具，管理身体健康</p>
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
