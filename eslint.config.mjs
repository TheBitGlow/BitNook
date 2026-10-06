import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'dist/**', '.cloudflare/**', '.chrome-temp*/**', '*.png'],
  },
]

export default eslintConfig
