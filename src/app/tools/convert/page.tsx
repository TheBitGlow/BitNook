import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ArrowRightLeft, Hash, QrCode, Palette, Binary, Clock } from 'lucide-react'

const tools = [
  { name: '单位转换', slug: 'unit', icon: ArrowRightLeft, color: '#F59E0B', desc: '长度/重量/温度等', href: '/tools/convert/unit' },
  { name: '进制转换', slug: 'radix', icon: Binary, color: '#F59E0B', desc: '2/8/10/16进制互转', href: '/tools/convert/radix' },
  { name: 'Hash生成', slug: 'hash', icon: Hash, color: '#F59E0B', desc: 'MD5/SHA系列算法', href: '/tools/convert/hash' },
  { name: '二维码', slug: 'qrcode', icon: QrCode, color: '#06B6D4', desc: '生成和解析二维码', href: '/tools/convert/qrcode' },
  { name: '颜色转换', slug: 'color', icon: Palette, color: '#EC4899', desc: 'HEX/RGB/HSL互转', href: '/tools/convert/color' },
  { name: '时间戳', slug: 'timestamp', icon: Clock, color: '#F59E0B', desc: 'Unix时间戳转换', href: '/tools/convert/timestamp' },
]

export default function ConvertToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h1 className="text-3xl font-bold text-white">格式转换</h1>
            </div>
            <p className="text-[#94A3B8]">6个格式转换工具</p>
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
