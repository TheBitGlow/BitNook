import { Metadata } from 'next'
import CategoryPageView from '@/components/tools/CategoryPageView'

export const metadata: Metadata = {
  title: '财务工具 - 房贷计算器、个税、汇率与投资收益 - BitNook',
  description: '提供房贷等额本息/本金计算、2025延迟退休测算、个人所得税年终奖估算、央行参考汇率换算与ROI/IRR/NPV投资回报分析。',
}

export default function FinanceToolsPage() {
  return <CategoryPageView categorySlug="finance" />
}
