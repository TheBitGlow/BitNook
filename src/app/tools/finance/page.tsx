import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { TrendingUp, Landmark, DollarSign, Percent, PiggyBank, CreditCard, BarChart3, Coins } from 'lucide-react'

const tools = [
  { name: '房贷计算', slug: 'mortgage', icon: Landmark, color: '#10B981', desc: '等额本息/本金对比分析', href: '/tools/finance/mortgage' },
  { name: '汇率转换', slug: 'exchange', icon: DollarSign, color: '#10B981', desc: '150+货币实时汇率', href: '/tools/finance/exchange' },
  { name: '退休计算', slug: 'retirement', icon: TrendingUp, color: '#10B981', desc: '延迟退休政策计算', href: '/tools/finance/retirement' },
  { name: '复利计算', slug: 'compound', icon: Percent, color: '#10B981', desc: '投资复利增长模拟', href: '/tools/finance/compound' },
  { name: '工资计算', slug: 'salary', icon: Coins, color: '#10B981', desc: '税前税后双向计算', href: '/tools/finance/salary' },
  { name: '存款计算', slug: 'deposit', icon: PiggyBank, color: '#10B981', desc: '活期定期收益对比', href: '/tools/finance/deposit' },
  { name: '贷款比价', slug: 'loan-compare', icon: CreditCard, color: '#10B981', desc: '多方案综合对比', href: '/tools/finance/loan-compare' },
  { name: '投资回报', slug: 'roi', icon: BarChart3, color: '#10B981', desc: 'ROI/IRR/NPV计算', href: '/tools/finance/roi' },
]

export default function FinanceToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-3xl font-bold text-white">财务工具</h1>
            </div>
            <p className="text-[#94A3B8]">8个财务工具，理财更轻松</p>
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
