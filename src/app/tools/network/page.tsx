import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Wifi, Search, Gauge, Globe2, Shield, Server, Scan, ShieldCheck } from 'lucide-react'

const tools = [
  { name: 'IP归属', slug: 'ip-lookup', icon: Search, color: '#8B5CF6', desc: 'IP地理位置查询', href: '/tools/network/ip-lookup' },
  { name: 'DNS查询', slug: 'dns', icon: Globe2, color: '#8B5CF6', desc: 'DNS记录类型查询', href: '/tools/network/dns' },
  { name: '网速测试', slug: 'speed-test', icon: Gauge, color: '#F59E0B', desc: '下载上传速度', href: '/tools/network/speed-test' },
  { name: 'Ping测试', slug: 'ping', icon: Wifi, color: '#10B981', desc: '延迟与丢包率', href: '/tools/network/ping' },
  { name: '端口扫描', slug: 'port-scan', icon: Scan, color: '#8B5CF6', desc: '常用端口检测', href: '/tools/network/port-scan' },
  { name: 'WiFi信息', slug: 'wifi-info', icon: Wifi, color: '#3B82F6', desc: '当前网络详情', href: '/tools/network/wifi-info' },
  { name: 'HTTP检测', slug: 'http-check', icon: Server, color: '#8B5CF6', desc: 'HTTP状态与安全', href: '/tools/network/http-check' },
  { name: 'SSL检测', slug: 'ssl-check', icon: ShieldCheck, color: '#10B981', desc: 'SSL证书检测', href: '/tools/network/ssl-check' },
]

export default function NetworkToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h1 className="text-3xl font-bold text-white">网络工具</h1>
            </div>
            <p className="text-[#94A3B8]">8个网络工具，调试网络更方便</p>
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
