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
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">登录 BitNook</h1>
              <p className="text-[#94A3B8]">欢迎回来！</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[rgba(99,102,241,0.3)] bg-[#080B14] accent-[#6366F1]" />
                  <span className="text-[#94A3B8]">记住我</span>
                </label>
                <Link href="/auth/forgot-password" className="text-[#6366F1] hover:text-white">
                  忘记密码？
                </Link>
              </div>

              <button type="submit" className="w-full btn-gradient py-3">
                登录
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(99,102,241,0.15)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#111827] text-[#475569]">或</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="py-3 rounded-xl border border-[rgba(99,102,241,0.3)] text-[#94A3B8] hover:text-white hover:border-[rgba(99,102,241,0.6)] transition-all">
                  GitHub
                </button>
                <button className="py-3 rounded-xl border border-[rgba(99,102,241,0.3)] text-[#94A3B8] hover:text-white hover:border-[rgba(99,102,241,0.6)] transition-all">
                  Google
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-[#94A3B8]">
              还没有账号？{' '}
              <Link href="/auth/register" className="text-[#6366F1] hover:text-white">
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
