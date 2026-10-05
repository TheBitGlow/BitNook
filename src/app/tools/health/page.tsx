import { Metadata } from 'next'
import CategoryPageView from '@/components/tools/CategoryPageView'

export const metadata: Metadata = {
  title: '健康工具 - BMI、心率区间、卡路里与作息规划 - BitNook',
  description: '科学估算体质指数 BMI、运动燃脂心率区间、基础代谢 BMR 与日常消耗，提供睡眠作息规划与血压记录指南。非医疗诊断工具。',
}

export default function HealthToolsPage() {
  return <CategoryPageView categorySlug="health" />
}
