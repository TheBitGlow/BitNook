import { Metadata } from 'next'
import CategoryPageView from '@/components/tools/CategoryPageView'

export const metadata: Metadata = {
  title: '日常工具 - 在线效率与生活实用工具 - BitNook',
  description: '提供多任务计时器、目标倒计时、抽奖转盘、安全密码生成、文字统计、日期计算、世界时钟等高频实用工具。',
}

export default function DailyToolsPage() {
  return <CategoryPageView categorySlug="daily" />
}
