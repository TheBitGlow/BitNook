'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }
    // TODO: Implement registration
    console.log('Register:', { username, email, password })
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="flex-1 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-surface p-8 shadow-subtle">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">注册 BitNook</h1>
              <p className="text-sm text-text-secondary">创建账号，开始使用</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">用户名</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

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
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent"
                    required
                    minLength={6}
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

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex items-center text-xs">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-accent accent-accent" required />
                <span className="ml-2 text-text-secondary">
                  我已阅读并同意{' '}
                  <Link href="/terms" className="text-accent hover:underline">服务条款</Link>
                  {' '}和{' '}
                  <Link href="/privacy" className="text-accent hover:underline">隐私政策</Link>
                </span>
              </div>

              <button type="submit" className="w-full btn-primary py-2.5 rounded-md">
                注册
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-text-secondary">
              已有账号？{' '}
              <Link href="/auth/login" className="text-accent hover:underline font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
