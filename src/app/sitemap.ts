import type { MetadataRoute } from 'next'
import { getAllCategories } from '@/config/categories'
import { getActiveTools } from '@/config/tools'
import { getAllGames } from '@/config/games'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bitnook.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: '2026-03-25',
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: '2026-03-25',
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: '2026-03-20',
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: '2026-03-15',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: '2026-03-15',
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: '2026-03-15',
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: '2026-03-15',
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: '2026-03-15',
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  // Category pages from registry
  const categoryRoutes: MetadataRoute.Sitemap = getAllCategories().map(cat => ({
    url: `${baseUrl}/tools/${cat.slug}`,
    lastModified: '2026-03-25',
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Leaf tool pages from registry
  const toolRoutes: MetadataRoute.Sitemap = getActiveTools().map(tool => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: tool.updatedAt,
    changeFrequency: tool.category === 'finance' ? 'weekly' : 'monthly',
    priority: tool.category === 'finance' ? 0.9 : 0.75,
  }))

  // Game pages from registry
  const gameRoutes: MetadataRoute.Sitemap = getAllGames().map(game => ({
    url: `${baseUrl}${game.href}`,
    lastModified: game.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes, ...gameRoutes]
}
