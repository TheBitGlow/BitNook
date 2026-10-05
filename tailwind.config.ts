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
        // Base canvas & surfaces
        'bg-base': '#090D16',
        'bg-surface': '#0F1523',
        'bg-surface-subtle': '#141C2E',
        'bg-surface-hover': '#1A243B',
        'bg-surface-active': '#222F4C',

        // Legacy background aliases for compatibility
        'bg-primary': '#090D16',
        'bg-secondary': '#0F1523',
        'bg-card': '#0F1523',
        'bg-card-hover': '#1A243B',

        // Brand & Accents
        'brand-primary': '#3B82F6',
        'brand-secondary': '#6366F1',
        'brand-accent': '#06B6D4',
        'brand-muted': 'rgba(59, 130, 246, 0.12)',

        // Status & Functional
        'gold': '#F59E0B',
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'info': '#3B82F6',

        // Typography
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',

        // Categories (refined, less neon)
        'cat-daily': '#3B82F6',
        'cat-finance': '#10B981',
        'cat-health': '#EF4444',
        'cat-convert': '#F59E0B',
        'cat-network': '#8B5CF6',
        'cat-ai': '#06B6D4',
        'cat-game': '#EC4899',
      },
      borderColor: {
        'base': '#1E293B',
        'subtle': '#162032',
        'hover': '#334155',
        'focus': '#3B82F6',
        'brand': 'rgba(59, 130, 246, 0.25)',
        'brand-hover': 'rgba(59, 130, 246, 0.5)',
        'brand-focus': '#3B82F6',
      },
    },
  },
  plugins: [],
}
export default config
