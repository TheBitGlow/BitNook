import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Check, Sparkles } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '¥0',
    period: '永久免费',
    desc: '适合轻度使用',
    features: [
      '44个普通工具无限使用',
      'AI工具每日5积分赠送',
      '游戏积分正常获取',
      '含广告展示',
    ],
    cta: '当前方案',
    current: true,
  },
  {
    name: 'Pro',
    price: '¥29',
    period: '/月',
    desc: '适合专业人士',
    features: [
      '全部工具无限使用',
      '每月赠送500积分',
      '去除广告',
      'AI任务优先队列',
      '历史记录保存（90天）',
      '文件大小上限提升（50MB）',
    ],
    cta: '升级到 Pro',
    current: false,
    popular: true,
  },
  {
    name: 'Team',
    price: '¥99',
    period: '/月',
    desc: '适合团队使用',
    features: [
      'Pro全部权益',
      '每月2000积分（共享池）',
      '团队工作空间',
      'API调用权限（100次/天）',
      '最多5人同时使用',
    ],
    cta: '升级到 Team',
    current: false,
  },
]

const pointsPackages = [
  { amount: 100, price: '¥6', bonus: 0 },
  { amount: 500, price: '¥28', bonus: 50 },
  { amount: 2000, price: '¥88', bonus: 200 },
  { amount: 5000, price: '¥198', bonus: 1000 },
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">会员定价</h1>
            <p className="text-[#94A3B8]">选择适合您的方案，解锁更多功能</p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card p-6 relative ${plan.popular ? 'border-[#6366F1]' : ''}`}
                style={{
                  borderColor: plan.popular ? '#6366F1' : 'rgba(99,102,241,0.15)',
                  background: plan.popular ? 'rgba(99,102,241,0.05)' : undefined
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#6366F1] rounded-full text-xs text-white font-medium">
                    最受欢迎
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-[#94A3B8]">{plan.period}</span>
                  </div>
                  <p className="text-sm text-[#475569] mt-2">{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                      <span className="text-[#94A3B8]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plan.current
                      ? 'bg-[#111827] border border-[rgba(99,102,241,0.3)] text-[#94A3B8] cursor-default'
                      : plan.popular
                      ? 'btn-gradient'
                      : 'bg-[#111827] border border-[rgba(99,102,241,0.3)] text-white hover:border-[rgba(99,102,241,0.6)]'
                  }`}
                  disabled={plan.current}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Points Packages */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-[#F59E0B]" />
              <h2 className="text-2xl font-bold text-white">积分充值</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pointsPackages.map((pkg) => (
                <div key={pkg.amount} className="glass-card p-5 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{pkg.amount}</div>
                  <div className="text-sm text-[#94A3B8] mb-3">积分</div>
                  <div className="text-lg font-bold text-[#F59E0B]">{pkg.price}</div>
                  {pkg.bonus > 0 && (
                    <div className="text-xs text-[#10B981] mt-1">+{pkg.bonus}赠</div>
                  )}
                  <button className="w-full mt-4 py-2 rounded-lg bg-[#111827] border border-[rgba(99,102,241,0.3)] text-[#94A3B8] hover:text-white hover:border-[rgba(99,102,241,0.6)] text-sm transition-all">
                    购买
                  </button>
                </div>
              ))}
            </div>

            <p className="text-sm text-[#475569] mt-4 text-center">
              1元 = 10积分，积分可用于AI工具
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
