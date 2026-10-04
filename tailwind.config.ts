import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#080B14',
        'bg-secondary': '#0D1117',
        'bg-card': '#111827',
        'bg-card-hover': '#1A2235',
        'brand-primary': '#6366F1',
        'brand-secondary': '#8B5CF6',
        'brand-accent': '#06B6D4',
        'gold': '#F59E0B',
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'info': '#3B82F6',
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
        'text-muted': '#475569',
        'cat-daily': '#3B82F6',
        'cat-finance': '#10B981',
        'cat-health': '#EF4444',
        'cat-convert': '#F59E0B',
        'cat-network': '#8B5CF6',
        'cat-ai': '#06B6D4',
        'cat-game': '#EC4899',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
      },
      borderColor: {
        'brand': 'rgba(99, 102, 241, 0.15)',
        'brand-hover': 'rgba(99, 102, 241, 0.4)',
        'brand-focus': 'rgba(99, 102, 241, 0.8)',
      },
    },
  },
  plugins: [],
}
export default config
