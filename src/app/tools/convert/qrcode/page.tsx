'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { QrCode } from 'lucide-react'

export default function QRCodePage() {
  const [content, setContent] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [size, setSize] = useState(200)

  useEffect(() => {
    if (content) {
      // Simple QR code generation using a public API
      const encoded = encodeURIComponent(content)
      setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`)
    } else {
      setQrDataUrl('')
    }
  }, [content, size])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <h1 className="text-2xl font-bold text-white">二维码生成器</h1>
            </div>
            <p className="text-[#94A3B8]">生成文本、链接、WiFi等二维码</p>
          </div>

          <div className="glass-card p-6">
            {/* Content Input */}
            <div className="mb-6">
              <label className="block text-sm text-[#94A3B8] mb-2">内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入文本、链接或WiFi信息..."
                className="w-full h-32 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)] resize-none"
              />
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <label className="block text-sm text-[#94A3B8] mb-2">尺寸: {size}px</label>
              <input
                type="range"
                min="100"
                max="400"
                step="50"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-[#080B14] rounded-full appearance-none cursor-pointer accent-[#06B6D4]"
              />
              <div className="flex justify-between text-xs text-[#475569] mt-1">
                <span>100px</span>
                <span>400px</span>
              </div>
            </div>

            {/* QR Code Preview */}
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="mx-auto"
                  width={size}
                  height={size}
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-[#94A3B8]">
                  输入内容生成二维码
                </div>
              )}
            </div>

            {/* Download Button */}
            {qrDataUrl && (
              <div className="mt-6 text-center">
                <a
                  href={qrDataUrl}
                  download={`qrcode-${Date.now()}.png`}
                  className="inline-block px-6 py-3 bg-[#06B6D4] text-white rounded-xl font-medium hover:bg-[#0891b2] transition-colors"
                >
                  下载二维码
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
