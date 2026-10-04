'use client'

import { useState, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Gauge } from 'lucide-react'

export default function SpeedTestPage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'done'>('idle')
  const [downloadSpeed, setDownloadSpeed] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [progress, setProgress] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const testSpeed = async () => {
    setStatus('testing')
    setProgress(0)
    setDownloadSpeed(0)
    setUploadSpeed(0)

    // Simulate speed test
    for (let i = 0; i <= 100; i += 5) {
      if (status !== 'testing') break
      await new Promise(r => setTimeout(r, 200))
      setProgress(i)
      setDownloadSpeed(Math.round(50 + Math.random() * 50))
    }

    setDownloadSpeed(Math.round(80 + Math.random() * 40))
    await new Promise(r => setTimeout(r, 500))
    setUploadSpeed(Math.round(30 + Math.random() * 30))
    setStatus('done')
  }

  const stopTest = () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setStatus('idle')
    setProgress(0)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h1 className="text-2xl font-bold text-white">网速测试</h1>
            </div>
            <p className="text-[#94A3B8]">测试网络下载和上传速度</p>
          </div>

          {/* Speed Gauge */}
          <div className="glass-card p-8 mb-6 text-center">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-8 border-[#1E293B]"></div>
              <div
                className="absolute inset-0 rounded-full border-8 border-[#6366F1] transition-all duration-300"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${progress > 0 ? '100% 0%' : '50% 50%'}, ${progress > 12.5 ? '100% 50%' : '100% 0%'}, ${progress > 37.5 ? '100% 100%' : '100% 50%'}, ${progress > 62.5 ? '50% 100%' : '100% 100%'}, ${progress > 87.5 ? '0% 100%' : '50% 100%'}, ${progress > 75 ? '0% 50%' : '0% 100%'}, ${progress > 50 ? '0% 0%' : '0% 50%'}, ${progress > 25 ? '50% 0%' : '0% 0%'})`,
                  transform: 'rotate(-90deg)'
                }}
              ></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{downloadSpeed}</span>
                <span className="text-[#94A3B8]">Mbps</span>
              </div>
            </div>

            <div className="flex justify-center gap-8 mb-6">
              <div>
                <p className="text-sm text-[#94A3B8]">下载</p>
                <p className="text-2xl font-bold text-[#10B981]">{downloadSpeed} Mbps</p>
              </div>
              <div>
                <p className="text-sm text-[#94A3B8]">上传</p>
                <p className="text-2xl font-bold text-[#3B82F6]">{uploadSpeed} Mbps</p>
              </div>
            </div>

            {status === 'idle' && (
              <button
                onClick={testSpeed}
                className="px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-white font-medium hover:opacity-90"
              >
                开始测试
              </button>
            )}

            {status === 'testing' && (
              <button
                onClick={stopTest}
                className="px-8 py-3 bg-[#EF4444] rounded-xl text-white font-medium hover:opacity-90"
              >
                停止
              </button>
            )}

            {status === 'done' && (
              <button
                onClick={testSpeed}
                className="px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-white font-medium hover:opacity-90"
              >
                重新测试
              </button>
            )}
          </div>

          {/* Progress */}
          {status === 'testing' && (
            <div className="glass-card p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#94A3B8]">测试进度</span>
                <span className="text-white">{progress}%</span>
              </div>
              <div className="h-2 bg-[#080B14] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
