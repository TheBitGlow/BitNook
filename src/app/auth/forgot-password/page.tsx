'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Mail, ArrowLeft, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回登录
          </Link>

          <div className="glass-card p-8">
            {!submitted ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#6366F1]" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">重置密码</h1>
                  <p className="text-[#94A3B8] text-sm">
                    输入您的注册邮箱，我们将发送密码重置链接
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#94A3B8] mb-2">邮箱地址</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder:text-[#475569]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        发送中...
                      </>
                    ) : (
                      '发送重置链接'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-[#10B981]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">发送成功</h1>
                <p className="text-[#94A3B8] mb-6">
                  密码重置链接已发送到您的邮箱<br />
                  <span className="text-white">{email}</span>
                </p>
                <p className="text-sm text-[#475569]">
                  如果没有收到邮件，请检查垃圾邮件文件夹
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block mt-6 px-6 py-3 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#5558E3] transition-colors"
                >
                  返回登录
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
