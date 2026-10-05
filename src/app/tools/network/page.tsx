import { Metadata } from 'next'
import CategoryPageView from '@/components/tools/CategoryPageView'

export const metadata: Metadata = {
  title: '网络工具 - 真实DoH DNS查询、IP归属、HTTP状态检测与延迟测试 - BitNook',
  description: '提供真实DNS over HTTPS记录查询、IP归属与ASN查询、SSRF安全防护的HTTP状态检测以及浏览器端网络延迟测速。无虚假模拟数据。',
}

export default function NetworkToolsPage() {
  return <CategoryPageView categorySlug="network" />
}
