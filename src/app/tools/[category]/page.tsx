import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import CategoryPageView from '@/components/tools/CategoryPageView'
import { getCategoryBySlug } from '@/config/categories'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category: slug } = await params
  if (slug === 'games') {
    return { title: '在线游戏 - BitNook' }
  }
  const cat = getCategoryBySlug(slug)
  if (!cat) {
    return { title: '分类未找到 - BitNook' }
  }
  return {
    title: `${cat.name} - 在线实用工具中心 - BitNook`,
    description: cat.description,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  if (category === 'games') {
    redirect('/games')
  }
  return <CategoryPageView categorySlug={category} />
}
