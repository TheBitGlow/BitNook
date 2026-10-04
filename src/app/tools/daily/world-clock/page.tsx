'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Globe } from 'lucide-react'

const timeZones = [
  { name: '北京', zone: 'Asia/Shanghai', flag: '🇨🇳' },
  { name: '上海', zone: 'Asia/Shanghai', flag: '🇨🇳' },
  { name: '东京', zone: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: '首尔', zone: 'Asia/Seoul', flag: '🇰🇷' },
  { name: '新加坡', zone: 'Asia/Singapore', flag: '🇸🇬' },
  { name: '伦敦', zone: 'Europe/London', flag: '🇬🇧' },
  { name: '巴黎', zone: 'Europe/Paris', flag: '🇫🇷' },
  { name: '柏林', zone: 'Europe/Berlin', flag: '🇩🇪' },
  { name: '莫斯科', zone: 'Europe/Moscow', flag: '🇷🇺' },
  { name: '纽约', zone: 'America/New_York', flag: '🇺🇸' },
  { name: '洛杉矶', zone: 'America/Los_Angeles', flag: '🇺🇸' },
  { name: '旧金山', zone: 'America/Los_Angeles', flag: '🇺🇸' },
  { name: '多伦多', zone: 'America/Toronto', flag: '🇨🇦' },
  { name: '悉尼', zone: 'Australia/Sydney', flag: '🇦🇺' },
  { name: '迪拜', zone: 'Asia/Dubai', flag: '🇦🇪' },
  { name: '孟买', zone: 'Asia/Kolkata', flag: '🇮🇳' },
]

export default function WorldClockPage() {
  const [selectedZones, setSelectedZones] = useState(['Asia/Shanghai', 'America/New_York', 'Europe/London'])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (zone: string) => {
    try {
      return currentTime.toLocaleTimeString('zh-CN', {
        timeZone: zone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    } catch {
      return '--:--:--'
    }
  }

  const formatDate = (zone: string) => {
    try {
      return currentTime.toLocaleDateString('zh-CN', {
        timeZone: zone,
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
      })
    } catch {
      return '--'
    }
  }

  const getOffset = (zone: string) => {
    try {
      const now = new Date()
      const localTime = now.getTime()
      const localOffset = now.getTimezoneOffset() * 60000
      const targetTime = new Date(localTime + localOffset)
      const targetOffset = new Date(now.toLocaleString('en-US', { timeZone: zone }).replace('T', ' ')).getTimezoneOffset() * 60000
      const diff = (targetOffset - localOffset) / 60

      if (diff === 0) return 'UTC+0'
      return diff > 0 ? `UTC+${diff}` : `UTC${diff}`
    } catch {
      return ''
    }
  }

  const toggleZone = (zone: string) => {
    if (selectedZones.includes(zone)) {
      setSelectedZones(selectedZones.filter(z => z !== zone))
    } else {
      setSelectedZones([...selectedZones, zone])
    }
  }

  const uniqueZones = Array.from(new Set(timeZones.map(tz => tz.zone)))
  const currentZones = uniqueZones.filter(z => selectedZones.includes(z))

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">世界时钟</h1>
            </div>
            <p className="text-[#94A3B8]">多时区城市时钟</p>
          </div>

          {/* Current Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {currentZones.map(zone => {
              const tzInfo = timeZones.find(t => t.zone === zone)
              return (
                <div key={zone} className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{tzInfo?.flag}</span>
                    <span className="text-white font-medium">{tzInfo?.name || zone}</span>
                  </div>
                  <p className="text-4xl font-mono font-bold text-white mb-1">
                    {formatTime(zone)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">{formatDate(zone)}</span>
                    <span className="text-xs text-[#6366F1]">{getOffset(zone)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Available Zones */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">添加城市</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueZones.map(zone => {
                const tzInfo = timeZones.find(t => t.zone === zone)
                const isSelected = selectedZones.includes(zone)
                return (
                  <button
                    key={zone}
                    onClick={() => toggleZone(zone)}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      isSelected
                        ? 'bg-[#6366F1] text-white'
                        : 'bg-[#080B14] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <span>{tzInfo?.flag}</span>
                    <span>{tzInfo?.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
