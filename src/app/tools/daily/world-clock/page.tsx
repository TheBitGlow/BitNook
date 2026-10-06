'use client'

import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Globe, Plus, Trash2, Clock } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface CityZone {
  name: string
  zone: string
  flag: string
  region: string
}

const CITIES: CityZone[] = [
  { name: '北京 / 中国', zone: 'Asia/Shanghai', flag: '🇨🇳', region: '亚太' },
  { name: '东京 / 日本', zone: 'Asia/Tokyo', flag: '🇯🇵', region: '亚太' },
  { name: '新加坡', zone: 'Asia/Singapore', flag: '🇸🇬', region: '亚太' },
  { name: '首尔 / 韩国', zone: 'Asia/Seoul', flag: '🇰🇷', region: '亚太' },
  { name: '悉尼 / 澳大利亚', zone: 'Australia/Sydney', flag: '🇦🇺', region: '亚太' },
  { name: '迪拜 / 阿联酋', zone: 'Asia/Dubai', flag: '🇦🇪', region: '中东' },
  { name: '伦敦 / 英国', zone: 'Europe/London', flag: '🇬🇧', region: '欧洲' },
  { name: '巴黎 / 法国', zone: 'Europe/Paris', flag: '🇫🇷', region: '欧洲' },
  { name: '柏林 / 德国', zone: 'Europe/Berlin', flag: '🇩🇪', region: '欧洲' },
  { name: '纽约 / 美国东部', zone: 'America/New_York', flag: '🇺🇸', region: '美洲' },
  { name: '旧金山 / 美国西部', zone: 'America/Los_Angeles', flag: '🇺🇸', region: '美洲' },
  { name: '多伦多 / 加拿大', zone: 'America/Toronto', flag: '🇨🇦', region: '美洲' },
]

export default function WorldClockPage() {
  const [selectedZones, setSelectedZones] = useState<string[]>([
    'Asia/Shanghai',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
  ])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoaded, setIsLoaded] = useState(false)

  // LocalStorage persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('bitnook_world_clock_zones')
        if (saved) {
          setSelectedZones(JSON.parse(saved))
        }
      } catch {
        // ignore
      }
      setIsLoaded(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem('bitnook_world_clock_zones', JSON.stringify(selectedZones))
    } catch {
      // ignore
    }
  }, [selectedZones, isLoaded])

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
        hour12: false,
      })
    } catch {
      return '--:--:--'
    }
  }

  const formatDate = (zone: string) => {
    try {
      return currentTime.toLocaleDateString('zh-CN', {
        timeZone: zone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
      })
    } catch {
      return '--'
    }
  }

  const getOffset = (zone: string) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        timeZoneName: 'shortOffset',
      })
      const parts = formatter.formatToParts(currentTime)
      const offsetPart = parts.find((p) => p.type === 'timeZoneName')
      return offsetPart ? offsetPart.value : 'UTC'
    } catch {
      return 'UTC'
    }
  }

  const toggleZone = (zone: string) => {
    if (selectedZones.includes(zone)) {
      if (selectedZones.length <= 1) return
      setSelectedZones((prev) => prev.filter((z) => z !== zone))
    } else {
      setSelectedZones((prev) => [...prev, zone])
      trackEvent('tool_success', { tool: 'world-clock' })
    }
  }

  return (
    <ToolLayout
      toolSlug="world-clock"
      principlesTitle="IANA 国际时区数据库与协调世界时 (UTC) 原理"
      principles={
        <>
          <p>
            <strong>1. IANA 时区与 Olsen 数据库规范：</strong>
            世界时钟采用 IANA (Internet Assigned Numbers Authority) 时区标识符（如 Asia/Shanghai、America/New_York）。相较于简单的固定经度偏移，IANA 数据库收录了全球各国历史上所有夏令时 (DST) 切换时间点与法令变更，杜绝时差偏差。
          </p>
          <p>
            <strong>2. 客户端无损偏好持久化：</strong>
            用户勾选的跨国关注城市列表实时同步至本地 LocalStorage，无任何服务器跟踪，隐私安全。
          </p>
        </>
      }
      howToSteps={[
        '上方看板实时显示已关注城市的当前时钟、日期与 UTC 时区偏移量。',
        '在下方“关注城市库”中点击任意城市胶囊标签，即可随时添加或隐藏对应时区。',
      ]}
      faq={[
        {
          question: '为什么伦敦与纽约的时差在不同月份会改变？',
          answer:
            '因为欧美实行夏令时 (DST)，且欧美各国的夏令时开始与结束周末并不完全一致。本工具底层基于浏览器原生 Intl 国际化引擎，自动处理每年的夏令时过渡。',
        },
      ]}
      disclaimer="本工具用于跨国会议预约、跨区协同办公及日常生活参考。航空列车时刻请以承运官方出票时间为准。"
    >
      <div className="space-y-6">
        {/* Selected Clocks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedZones.map((zone) => {
            const city = CITIES.find((c) => c.zone === zone) || {
              name: zone.split('/')[1] || zone,
              zone,
              flag: '🌐',
              region: '其他',
            }

            return (
              <div
                key={zone}
                className="card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{city.flag}</span>
                    <span className="text-xs font-semibold text-text-primary truncate max-w-[120px]">
                      {city.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-accent-primary font-medium">
                    {getOffset(zone)}
                  </span>
                </div>

                <div className="py-3 text-center bg-canvas rounded-xl border border-border">
                  <p className="text-3xl font-extrabold font-mono text-text-primary tracking-wider">
                    {formatTime(zone)}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span>{formatDate(zone)}</span>
                  {selectedZones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => toggleZone(zone)}
                      className="text-text-muted hover:text-danger transition-colors"
                      title="移除此城市"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* City Selection Pills */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-secondary">添加或移除关注城市</h3>
            <span className="text-xs text-text-muted">已关注 {selectedZones.length} / {CITIES.length} 个主要城市</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => {
              const isSelected = selectedZones.includes(city.zone)
              return (
                <button
                  key={city.zone}
                  type="button"
                  onClick={() => toggleZone(city.zone)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
                    isSelected
                      ? 'bg-accent-primary text-white border-accent-primary shadow-sm'
                      : 'bg-surface-elevated text-text-secondary border-border hover:text-text-primary hover:border-accent-primary/40'
                  }`}
                >
                  <span>{city.flag}</span>
                  <span>{city.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
