'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement login
    console.log('Login:', { email, password })
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="flex-1 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-surface p-8 shadow-subtle">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">登录 BitNook</h1>
              <p className="text-sm text-text-secondary">欢迎回来！</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-accent accent-accent" />
                  <span className="text-text-secondary">记住我</span>
                </label>
                <Link href="/auth/forgot-password" className="text-accent hover:underline">
                  忘记密码？
                </Link>
              </div>

              <button type="submit" className="w-full btn-primary py-2.5 rounded-md">
                登录
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-surface text-text-muted">或</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="py-2 rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover text-xs font-medium transition">
                  GitHub
                </button>
                <button className="py-2 rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover text-xs font-medium transition">
                  Google
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-text-secondary">
              还没有账号？{' '}
              <Link href="/auth/register" className="text-accent hover:underline font-medium">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
