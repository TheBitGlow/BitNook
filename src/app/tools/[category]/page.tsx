import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Clock, TrendingUp, Heart, ArrowRightLeft, Wifi, Sparkles } from 'lucide-react'

const categoryMeta: Record<string, {
  name: string
  icon: any
  color: string
  desc: string
  tools: { name: string; slug: string; desc: string; icon: any }[]
}> = {
  daily: {
    name: '日常工具',
    icon: Clock,
    color: '#3B82F6',
    desc: '日常生活所需的实用工具',
    tools: [
      { name: '计时器', slug: 'timer', desc: '多任务并行计时，支持番茄钟', icon: Clock },
      { name: '倒计时', slug: 'countdown', desc: '目标日期倒计时，烟花特效', icon: Clock },
      { name: '抽奖', slug: 'lottery', desc: '转盘抽奖，防重复抽取', icon: Clock },
      { name: '密码生成', slug: 'password', desc: '安全密码批量生成', icon: Clock },
      { name: '文字统计', slug: 'word-count', desc: '字数、字符、关键词分析', icon: Clock },
      { name: '日期计算', slug: 'date-calc', desc: '日期间距、工作日计算', icon: Clock },
      { name: '秒表', slug: 'stopwatch', desc: '毫秒精度，多圈记录', icon: Clock },
      { name: '世界时钟', slug: 'world-clock', desc: '多时区城市时钟', icon: Clock },
    ]
  },
  finance: {
    name: '财务工具',
    icon: TrendingUp,
    color: '#10B981',
    desc: '财务管理和计算工具',
    tools: [
      { name: '房贷计算', slug: 'mortgage', desc: '等额本息/本金对比分析', icon: TrendingUp },
      { name: '汇率转换', slug: 'exchange', desc: '150+货币实时汇率', icon: TrendingUp },
      { name: '退休计算', slug: 'retirement', desc: '延迟退休政策计算', icon: TrendingUp },
      { name: '复利计算', slug: 'compound', desc: '投资复利增长模拟', icon: TrendingUp },
      { name: '工资计算', slug: 'salary', desc: '税前税后双向计算', icon: TrendingUp },
      { name: '存款计算', slug: 'deposit', desc: '活期定期收益对比', icon: TrendingUp },
      { name: '贷款比价', slug: 'loan-compare', desc: '多方案综合对比', icon: TrendingUp },
      { name: '投资回报', slug: 'roi', desc: 'ROI/IRR/NPV计算', icon: TrendingUp },
    ]
  },
  health: {
    name: '健康工具',
    icon: Heart,
    color: '#EF4444',
    desc: '健康管理与评估工具',
    tools: [
      { name: 'BMI计算', slug: 'bmi', desc: '体质指数评估', icon: Heart },
      { name: '心率计算', slug: 'heart-rate', desc: '训练心率区间', icon: Heart },
      { name: '卡路里', slug: 'calories', desc: '基础代谢与消耗', icon: Heart },
      { name: '饮水量', slug: 'water-intake', desc: '每日饮水建议', icon: Heart },
      { name: '睡眠计算', slug: 'sleep', desc: '睡眠周期优化', icon: Heart },
      { name: '步数目标', slug: 'steps', desc: '个性化步数建议', icon: Heart },
      { name: '心脏年龄', slug: 'heart-age', desc: '心血管风险评估', icon: Heart },
      { name: '血压评估', slug: 'blood-pressure', desc: '血压分级评估', icon: Heart },
    ]
  },
  convert: {
    name: '格式转换',
    icon: ArrowRightLeft,
    color: '#F59E0B',
    desc: '各类格式转换工具',
    tools: [
      { name: '单位转换', slug: 'unit', desc: '长度/重量/温度等', icon: ArrowRightLeft },
      { name: '进制转换', slug: 'radix', desc: '2/8/10/16进制互转', icon: ArrowRightLeft },
      { name: 'Hash生成', slug: 'hash', desc: 'MD5/SHA系列算法', icon: ArrowRightLeft },
      { name: '二维码', slug: 'qrcode', desc: '生成和解析二维码', icon: ArrowRightLeft },
      { name: '颜色转换', slug: 'color', desc: 'HEX/RGB/HSL互转', icon: ArrowRightLeft },
      { name: '时间戳', slug: 'timestamp', desc: 'Unix时间戳转换', icon: ArrowRightLeft },
    ]
  },
  network: {
    name: '网络工具',
    icon: Wifi,
    color: '#8B5CF6',
    desc: '网络诊断与管理工具',
    tools: [
      { name: 'IP归属', slug: 'ip-lookup', desc: 'IP地理位置查询', icon: Wifi },
      { name: 'DNS查询', slug: 'dns', desc: 'DNS记录类型查询', icon: Wifi },
      { name: '网速测试', slug: 'speed-test', desc: '下载上传速度', icon: Wifi },
      { name: 'Ping测试', slug: 'ping', desc: '延迟与丢包率', icon: Wifi },
      { name: '端口扫描', slug: 'port-scan', desc: '常用端口检测', icon: Wifi },
      { name: 'WiFi信息', slug: 'wifi-info', desc: '当前网络详情', icon: Wifi },
      { name: 'HTTP检测', slug: 'http-check', desc: 'HTTP状态与安全', icon: Wifi },
      { name: 'SSL检测', slug: 'ssl-check', desc: 'SSL证书检测', icon: Wifi },
    ]
  },
  ai: {
    name: 'AI工具',
    icon: Sparkles,
    color: '#06B6D4',
    desc: 'AI 智能工具（VIP专属）',
    tools: [
      { name: 'AI大模型显存计算器', slug: 'gpu-calculator', desc: 'LLM VRAM Calculator · 估算模型显存', icon: Sparkles },
      { name: '简历优化', slug: 'resume', desc: 'AI简历优化建议', icon: Sparkles },
      { name: '文章摘要', slug: 'summarize', desc: 'URL/文本智能摘要', icon: Sparkles },
      { name: '智能翻译', slug: 'translate', desc: '100+语言互译', icon: Sparkles },
      { name: '短视频脚本', slug: 'video-script', desc: '多平台脚本生成', icon: Sparkles },
      { name: '邮件生成', slug: 'email', desc: '商务邮件智能生成', icon: Sparkles },
      { name: 'AI取名', slug: 'naming', desc: '人名公司品牌取名', icon: Sparkles },
    ]
  }
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = categoryMeta[params.category]

  if (!category) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">分类不存在</h1>
            <Link href="/tools" className="text-[#6366F1] hover:text-white">
              返回工具中心
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <category.icon className="w-6 h-6" style={{ color: category.color }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{category.name}</h1>
                <p className="text-[#94A3B8]">{category.desc}</p>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {category.tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${params.category}/${tool.slug}`}
                className="glass-card p-5 flex items-start gap-4 group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <tool.icon className="w-5 h-5" style={{ color: category.color }} />
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
