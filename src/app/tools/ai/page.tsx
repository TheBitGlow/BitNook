import { Metadata } from 'next'
import CategoryPageView from '@/components/tools/CategoryPageView'

export const metadata: Metadata = {
  title: 'AI工具 - 开源大模型GPU显存计算器与实用工具 - BitNook',
  description: '提供大语言模型 (LLM) 在不同精度量化下的显存需求计算与显卡选型建议。严禁假AI演示，仅保留真实可用工具。',
}

export default function AIToolsPage() {
  return <CategoryPageView categorySlug="ai" />
}
