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
    <div className="flex flex-col min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="flex-1 py-8 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回登录
          </Link>

          <div className="rounded-xl border border-border bg-surface p-8 shadow-subtle">
            {!submitted ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-subtle border border-accent/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">重置密码</h1>
                  <p className="text-text-secondary text-xs">
                    输入您的注册邮箱，我们将发送密码重置链接
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">邮箱地址</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 btn-primary rounded-md text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-success-subtle border border-success/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-success" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">发送成功</h1>
                <p className="text-text-secondary text-xs mb-6">
                  密码重置链接已发送到您的邮箱<br />
                  <span className="text-text-primary font-medium">{email}</span>
                </p>
                <p className="text-xs text-text-muted">
                  如果没有收到邮件，请检查垃圾邮件文件夹
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block mt-6 px-5 py-2 btn-primary rounded-md text-xs font-medium"
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
