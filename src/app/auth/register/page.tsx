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
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">注册 BitNook</h1>
              <p className="text-[#94A3B8]">创建账号，开始使用</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">用户名</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full pl-12 pr-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                    required
                  />
                </div>
              </div>

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
                    placeholder="请输入密码"
                    className="w-full pl-12 pr-12 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                    required
                    minLength={6}
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

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    className="w-full pl-12 pr-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex items-center text-sm">
                <input type="checkbox" className="w-4 h-4 rounded border-[rgba(99,102,241,0.3)] bg-[#080B14] accent-[#6366F1]" required />
                <span className="ml-2 text-[#94A3B8]">
                  我已阅读并同意{' '}
                  <Link href="/terms" className="text-[#6366F1] hover:text-white">服务条款</Link>
                  {' '}和{' '}
                  <Link href="/privacy" className="text-[#6366F1] hover:text-white">隐私政策</Link>
                </span>
              </div>

              <button type="submit" className="w-full btn-gradient py-3">
                注册
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#94A3B8]">
              已有账号？{' '}
              <Link href="/auth/login" className="text-[#6366F1] hover:text-white">
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
