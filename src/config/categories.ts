export type CategorySlug = 'daily' | 'finance' | 'health' | 'convert' | 'network' | 'ai'

export interface CategoryInfo {
  slug: CategorySlug
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  iconName: string
  color: string
  order: number
}

export const CATEGORIES: Record<CategorySlug, CategoryInfo> = {
  daily: {
    slug: 'daily',
    name: '日常工具',
    nameEn: 'Daily Tools',
    description: '日常生活与办公高效实用小工具',
    descriptionEn: 'Everyday productivity utilities and task tools',
    iconName: 'Clock',
    color: '#3B82F6',
    order: 1,
  },
  finance: {
    slug: 'finance',
    name: '财务工具',
    nameEn: 'Finance Tools',
    description: '房贷、工资、汇率、存款与复利投资方案估算',
    descriptionEn: 'Mortgage, salary, currency, deposit, and investment calculators',
    iconName: 'TrendingUp',
    color: '#10B981',
    order: 2,
  },
  health: {
    slug: 'health',
    name: '健康工具',
    nameEn: 'Health Tools',
    description: 'BMI、心率、热量消耗与生活习惯健康参考规划',
    descriptionEn: 'BMI, heart rate, calories, and lifestyle health planners',
    iconName: 'Heart',
    color: '#EF4444',
    order: 3,
  },
  convert: {
    slug: 'convert',
    name: '格式转换',
    nameEn: 'Format Conversion',
    description: '颜色、单位、进制、时间戳、本地二维码与哈希',
    descriptionEn: 'Color, unit, radix, timestamp, local QR code, and hash tools',
    iconName: 'ArrowRightLeft',
    color: '#F59E0B',
    order: 4,
  },
  network: {
    slug: 'network',
    name: '网络工具',
    nameEn: 'Network Tools',
    description: '真实 DNS 查询、IP 归属、网络延迟与连接信息',
    descriptionEn: 'Real DNS queries, IP geolocation, latency, and browser network stats',
    iconName: 'Wifi',
    color: '#8B5CF6',
    order: 5,
  },
  ai: {
    slug: 'ai',
    name: 'AI工具',
    nameEn: 'AI Tools',
    description: '大模型显存估算与实用 AI 辅助工具',
    descriptionEn: 'LLM VRAM estimation and practical AI utilities',
    iconName: 'Sparkles',
    color: '#06B6D4',
    order: 6,
  },
}

export function getAllCategories(): CategoryInfo[] {
  return Object.values(CATEGORIES).sort((a, b) => a.order - b.order)
}

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORIES[slug as CategorySlug]
}
