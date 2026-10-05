import { Metadata } from 'next'
import CategoryPageView from '@/components/tools/CategoryPageView'

export const metadata: Metadata = {
  title: '格式转换 - 颜色HEX/RGB、进制BigInt、本地二维码与哈希 - BitNook',
  description: '提供精准单位转换、大数进制转换、本地纯前端二维码生成下载、颜色模式换算与Web Crypto本地哈希计算。',
}

export default function ConvertToolsPage() {
  return <CategoryPageView categorySlug="convert" />
}
