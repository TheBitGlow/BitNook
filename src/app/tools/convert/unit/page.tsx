'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { ArrowRightLeft, Copy, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface UnitDef {
  id: string
  name: string
  symbol: string
  toBase: (v: number) => number
  fromBase: (baseV: number) => number
}

interface UnitCategory {
  id: string
  name: string
  iconText: string
  units: UnitDef[]
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: '长度',
    iconText: '📏',
    units: [
      { id: 'mm', name: '毫米', symbol: 'mm', toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: 'cm', name: '厘米', symbol: 'cm', toBase: (v) => v * 0.01, fromBase: (b) => b / 0.01 },
      { id: 'dm', name: '分米', symbol: 'dm', toBase: (v) => v * 0.1, fromBase: (b) => b / 0.1 },
      { id: 'm', name: '米', symbol: 'm', toBase: (v) => v, fromBase: (b) => b },
      { id: 'km', name: '千米 (公里)', symbol: 'km', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'in', name: '英寸', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
      { id: 'ft', name: '英尺', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      { id: 'yd', name: '码', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
      { id: 'mi', name: '英里', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
      { id: 'nmi', name: '海里', symbol: 'nmi', toBase: (v) => v * 1852, fromBase: (b) => b / 1852 },
      { id: 'chi', name: '市尺', symbol: '尺', toBase: (v) => v / 3, fromBase: (b) => b * 3 },
      { id: 'cun', name: '市寸', symbol: '寸', toBase: (v) => v / 30, fromBase: (b) => b * 30 },
    ],
  },
  {
    id: 'weight',
    name: '重量',
    iconText: '⚖️',
    units: [
      { id: 'mg', name: '毫克', symbol: 'mg', toBase: (v) => v * 1e-6, fromBase: (b) => b / 1e-6 },
      { id: 'g', name: '克', symbol: 'g', toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: 'kg', name: '千克 (公斤)', symbol: 'kg', toBase: (v) => v, fromBase: (b) => b },
      { id: 't', name: '公吨', symbol: 't', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'jin', name: '市斤', symbol: '斤', toBase: (v) => v * 0.5, fromBase: (b) => b / 0.5 },
      { id: 'liang', name: '市两', symbol: '两', toBase: (v) => v * 0.05, fromBase: (b) => b / 0.05 },
      { id: 'lb', name: '磅', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (b) => b / 0.45359237 },
      { id: 'oz', name: '盎司', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (b) => b / 0.028349523125 },
      { id: 'ct', name: '克拉', symbol: 'ct', toBase: (v) => v * 0.0002, fromBase: (b) => b / 0.0002 },
    ],
  },
  {
    id: 'area',
    name: '面积',
    iconText: '📐',
    units: [
      { id: 'sq_mm', name: '平方毫米', symbol: 'mm²', toBase: (v) => v * 1e-6, fromBase: (b) => b / 1e-6 },
      { id: 'sq_cm', name: '平方厘米', symbol: 'cm²', toBase: (v) => v * 1e-4, fromBase: (b) => b / 1e-4 },
      { id: 'sq_m', name: '平方米', symbol: 'm²', toBase: (v) => v, fromBase: (b) => b },
      { id: 'ha', name: '公顷', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (b) => b / 10000 },
      { id: 'sq_km', name: '平方千米', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: 'mu', name: '亩 (中国)', symbol: '亩', toBase: (v) => v * (2000 / 3), fromBase: (b) => b / (2000 / 3) },
      { id: 'sq_ft', name: '平方英尺', symbol: 'ft²', toBase: (v) => v * 0.09290304, fromBase: (b) => b / 0.09290304 },
      { id: 'acre', name: '英亩', symbol: 'acre', toBase: (v) => v * 4046.8564224, fromBase: (b) => b / 4046.8564224 },
      { id: 'sq_mi', name: '平方英里', symbol: 'mi²', toBase: (v) => v * 2589988.11, fromBase: (b) => b / 2589988.11 },
    ],
  },
  {
    id: 'volume',
    name: '体积',
    iconText: '🧊',
    units: [
      { id: 'ml', name: '毫升', symbol: 'mL', toBase: (v) => v * 1e-6, fromBase: (b) => b / 1e-6 },
      { id: 'l', name: '升', symbol: 'L', toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: 'cu_m', name: '立方米', symbol: 'm³', toBase: (v) => v, fromBase: (b) => b },
      { id: 'cu_cm', name: '立方厘米', symbol: 'cm³', toBase: (v) => v * 1e-6, fromBase: (b) => b / 1e-6 },
      { id: 'cu_in', name: '立方英寸', symbol: 'in³', toBase: (v) => v * 1.6387064e-5, fromBase: (b) => b / 1.6387064e-5 },
      { id: 'cu_ft', name: '立方英尺', symbol: 'ft³', toBase: (v) => v * 0.028316846, fromBase: (b) => b / 0.028316846 },
      { id: 'gal_us', name: '美制加仑', symbol: 'gal (US)', toBase: (v) => v * 0.00378541, fromBase: (b) => b / 0.00378541 },
      { id: 'gal_uk', name: '英制加仑', symbol: 'gal (UK)', toBase: (v) => v * 0.00454609, fromBase: (b) => b / 0.00454609 },
      { id: 'floz_us', name: '美制液体盎司', symbol: 'fl oz', toBase: (v) => v * 2.95735e-5, fromBase: (b) => b / 2.95735e-5 },
    ],
  },
  {
    id: 'temperature',
    name: '温度',
    iconText: '🌡️',
    units: [
      { id: 'c', name: '摄氏度', symbol: '°C', toBase: (v) => v, fromBase: (b) => b },
      { id: 'f', name: '华氏度', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (b) => (b * 9) / 5 + 32 },
      { id: 'k', name: '开尔文', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
      { id: 'r', name: '兰氏度', symbol: '°R', toBase: (v) => ((v - 491.67) * 5) / 9, fromBase: (b) => ((b + 273.15) * 9) / 5 },
    ],
  },
  {
    id: 'time',
    name: '时间',
    iconText: '⏱️',
    units: [
      { id: 'ms', name: '毫秒', symbol: 'ms', toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: 's', name: '秒', symbol: 's', toBase: (v) => v, fromBase: (b) => b },
      { id: 'min', name: '分钟', symbol: 'min', toBase: (v) => v * 60, fromBase: (b) => b / 60 },
      { id: 'h', name: '小时', symbol: 'h', toBase: (v) => v * 3600, fromBase: (b) => b / 3600 },
      { id: 'd', name: '天 (日)', symbol: 'd', toBase: (v) => v * 86400, fromBase: (b) => b / 86400 },
      { id: 'wk', name: '周', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (b) => b / 604800 },
      { id: 'mo', name: '月 (30天)', symbol: 'mo', toBase: (v) => v * 2592000, fromBase: (b) => b / 2592000 },
      { id: 'yr', name: '年 (365天)', symbol: 'yr', toBase: (v) => v * 31536000, fromBase: (b) => b / 31536000 },
    ],
  },
  {
    id: 'speed',
    name: '速度',
    iconText: '🚀',
    units: [
      { id: 'mps', name: '米/秒', symbol: 'm/s', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kmh', name: '千米/小时', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (b) => b * 3.6 },
      { id: 'mph', name: '英里/小时', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (b) => b / 0.44704 },
      { id: 'knot', name: '节 (海里/小时)', symbol: 'kn', toBase: (v) => (v * 1852) / 3600, fromBase: (b) => (b * 3600) / 1852 },
      { id: 'fps', name: '英尺/秒', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      { id: 'mach', name: '马赫 (声速)', symbol: 'Mach', toBase: (v) => v * 340.29, fromBase: (b) => b / 340.29 },
    ],
  },
  {
    id: 'storage',
    name: '数据容量',
    iconText: '💾',
    units: [
      { id: 'b', name: '比特 (Bit)', symbol: 'b', toBase: (v) => v * 0.125, fromBase: (b) => b * 8 },
      { id: 'byte', name: '字节 (Byte)', symbol: 'B', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kb', name: '千字节 (KB)', symbol: 'KB', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'mb', name: '兆字节 (MB)', symbol: 'MB', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: 'gb', name: '吉字节 (GB)', symbol: 'GB', toBase: (v) => v * 1e9, fromBase: (b) => b / 1e9 },
      { id: 'tb', name: '太字节 (TB)', symbol: 'TB', toBase: (v) => v * 1e12, fromBase: (b) => b / 1e12 },
      { id: 'pb', name: '拍字节 (PB)', symbol: 'PB', toBase: (v) => v * 1e15, fromBase: (b) => b / 1e15 },
      { id: 'kib', name: 'Kibibyte (1024B)', symbol: 'KiB', toBase: (v) => v * 1024, fromBase: (b) => b / 1024 },
      { id: 'mib', name: 'Mebibyte (1024²B)', symbol: 'MiB', toBase: (v) => v * 1048576, fromBase: (b) => b / 1048576 },
      { id: 'gib', name: 'Gibibyte (1024³B)', symbol: 'GiB', toBase: (v) => v * 1073741824, fromBase: (b) => b / 1073741824 },
      { id: 'tib', name: 'Tebibyte (1024⁴B)', symbol: 'TiB', toBase: (v) => v * 1099511627776, fromBase: (b) => b / 1099511627776 },
    ],
  },
  {
    id: 'pressure',
    name: '压力',
    iconText: '🌪️',
    units: [
      { id: 'pa', name: '帕斯卡', symbol: 'Pa', toBase: (v) => v, fromBase: (b) => b },
      { id: 'hpa', name: '百帕', symbol: 'hPa', toBase: (v) => v * 100, fromBase: (b) => b / 100 },
      { id: 'kpa', name: '千帕', symbol: 'kPa', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'mpa', name: '兆帕', symbol: 'MPa', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: 'atm', name: '标准大气压', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (b) => b / 101325 },
      { id: 'bar', name: '巴', symbol: 'bar', toBase: (v) => v * 100000, fromBase: (b) => b / 100000 },
      { id: 'mmhg', name: '毫米汞柱', symbol: 'mmHg', toBase: (v) => v * 133.322368, fromBase: (b) => b / 133.322368 },
      { id: 'psi', name: '磅力/平方英寸', symbol: 'psi', toBase: (v) => v * 6894.757, fromBase: (b) => b / 6894.757 },
    ],
  },
  {
    id: 'energy',
    name: '能量',
    iconText: '⚡',
    units: [
      { id: 'j', name: '焦耳', symbol: 'J', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kj', name: '千焦', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'cal', name: '卡路里', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (b) => b / 4.184 },
      { id: 'kcal', name: '千卡 (大卡)', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (b) => b / 4184 },
      { id: 'wh', name: '瓦时', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (b) => b / 3600 },
      { id: 'kwh', name: '千瓦时 (度)', symbol: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (b) => b / 3.6e6 },
      { id: 'btu', name: '英热单位', symbol: 'BTU', toBase: (v) => v * 1055.056, fromBase: (b) => b / 1055.056 },
      { id: 'ev', name: '电子伏特', symbol: 'eV', toBase: (v) => v * 1.602176634e-19, fromBase: (b) => b / 1.602176634e-19 },
    ],
  },
]

const CATEGORIES = UNIT_CATEGORIES

function formatNumber(num: number): string {
  if (num === 0) return '0'
  const abs = Math.abs(num)
  if (abs >= 1e9 || abs < 1e-6) {
    return num.toExponential(6).replace(/\.?0+e/, 'e')
  }
  const str = num.toFixed(8)
  return str.replace(/\.?0+$/, '')
}

export default function UnitConverterPage() {
  const [selectedCatId, setSelectedCatId] = useState<string>('length')
  const [inputValue, setInputValue] = useState<string>('1')
  const [fromIndex, setFromIndex] = useState<number>(3) // e.g. 'm'
  const [toIndex, setToIndex] = useState<number>(4) // e.g. 'km'
  const [copiedKey, setCopiedKey] = useState('')

  const activeCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedCatId) || CATEGORIES[0]
  }, [selectedCatId])

  const handleCategoryChange = (catId: string) => {
    setSelectedCatId(catId)
    setFromIndex(0)
    setToIndex(1)
  }

  const handleSwap = () => {
    const temp = fromIndex
    setFromIndex(toIndex)
    setToIndex(temp)
  }

  // Active units
  const fromUnit = activeCategory.units[fromIndex] || activeCategory.units[0]
  const toUnit = activeCategory.units[toIndex] || activeCategory.units[1]

  // Calculated single conversion
  const parsedValue = parseFloat(inputValue)
  const isInputValid = !isNaN(parsedValue)

  const convertedResult = useMemo(() => {
    if (!isInputValid || !fromUnit || !toUnit) return ''
    const baseValue = fromUnit.toBase(parsedValue)
    const targetValue = toUnit.fromBase(baseValue)
    return formatNumber(targetValue)
  }, [parsedValue, isInputValid, fromUnit, toUnit])

  // Full table conversion for all units in current category
  const allConversions = useMemo(() => {
    if (!isInputValid || !fromUnit) return []
    const baseValue = fromUnit.toBase(parsedValue)
    return activeCategory.units.map((unit) => {
      const val = unit.fromBase(baseValue)
      return {
        unit,
        formatted: formatNumber(val),
        raw: val,
      }
    })
  }, [isInputValid, fromUnit, parsedValue, activeCategory])

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      trackEvent('copy', { tool: 'unit' })
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <ToolLayout
      toolSlug="unit"
      principlesTitle="单位换算数学模型与国际度量衡基准"
      principles={
        <>
          <p>
            <strong>1. 国际单位制 (SI) 基准锚定：</strong>
            本工具将每种物理量体系（如长度、重量、面积、体积、温度、压强、能量、功率）映射到单一国际基准标准单位（如米、千克、平方米、立方米、摄氏度、帕斯卡、焦耳、瓦特）。所有换算均通过“输入单位 → 基准单位 (toBase) → 目标单位 (fromBase)”双向线性/仿射变换实现，杜绝级联累积误差。
          </p>
          <p>
            <strong>2. 仿射温度变换与英制高精度常数：</strong>
            摄氏度与华氏度换算遵循仿射变换 \(°F = °C \times 1.8 + 32\)；英制长度与质量采用 1959 年《国际码与磅协议》严格法定义义（1 英寸 = 25.4 毫米，1 磅 = 0.45359237 千克）。
          </p>
        </>
      }
      howToSteps={[
        '选择物理量分类（如长度、重量、面积、体积、温度、压力等）。',
        '在源数值框输入待换算数值，并在下拉框中选取源单位。',
        '在目标单位下拉框中选择要转换的单位，系统实时计算并显示换算结果。',
        '下方同步展示该分类下所有已知度量衡的对照清单，支持一键单独复制任意换算值。',
      ]}
      faq={[
        {
          question: '为什么换算结果保留多位小数？',
          answer:
            '为兼顾微观精密工程与日常生活需要，本工具对于极小数值保留合理有效数字，对于标准整数及常见倍率提供规整格式，杜绝浮点数例如 0.0000000000000002 的溢出显示。',
        },
        {
          question: '中国传统市制单位（市斤、市尺、市亩）的法定换算关系是什么？',
          answer:
            '中国市制单位依据 1959 年国务院《关于统一计量制度的命令》统一法定化：1市尺 = 1/3米；1市斤 = 0.5千克 (500克)；1市亩 = 2000/3平方米 (约666.67平方米)。',
        },
      ]}
      dataSources={[
        { name: '国际计量局 (BIPM) 国际单位制 (SI) 规范手册', description: '米、千克、秒等基本物理单位标准定义' },
        { name: '国家法定计量单位 (GB 3100/3101/3102-1993)', description: '中国法定计量单位与传统市制换算系数' },
      ]}
      disclaimer="本换算结果经双精度算法严格核验，供日常生活、工程估算与科研参考。涉及重大航天器设计或高精医药剂量，请以国家法定计量规程为准。"
    >
      <div className="space-y-6">
        {/* Category Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === selectedCatId
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition border ${
                  isActive
                    ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-md shadow-[#6366F1]/20'
                    : 'bg-[#141C2E] text-[#94A3B8] border-[#1E293B] hover:text-white hover:border-[#334155]'
                }`}
              >
                <span>{cat.iconText}</span>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>

        {/* Interactive Converter Card */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F1523] p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
            {/* From Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#CBD5E1] block">源数值与单位</label>
              <div className="space-y-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="输入数值"
                  className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1E293B] rounded-xl text-white font-mono text-base focus:outline-none focus:border-[#6366F1]"
                />
                <select
                  aria-label="源单位"
                  value={fromIndex}
                  onChange={(e) => setFromIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#090D16] border border-[#1E293B] rounded-xl text-[#CBD5E1] text-xs focus:outline-none focus:border-[#6366F1]"
                >
                  {activeCategory.units.map((u, i) => (
                    <option key={u.id} value={i}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pt-5">
              <button
                type="button"
                onClick={handleSwap}
                className="p-3 rounded-full bg-[#141C2E] border border-[#1E293B] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition shadow-sm"
                title="交换单位"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* To Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#CBD5E1]">目标单位与结果</label>
                {convertedResult && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(convertedResult, 'main')}
                    className="text-xs text-[#818CF8] hover:text-white flex items-center gap-1 transition"
                  >
                    {copiedKey === 'main' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'main' ? '已复制' : '复制结果'}</span>
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <div className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1E293B] rounded-xl text-[#38BDF8] font-mono text-base truncate min-h-[46px] flex items-center font-bold">
                  {convertedResult || '0'}
                </div>
                <select
                  aria-label="目标单位"
                  value={toIndex}
                  onChange={(e) => setToIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#090D16] border border-[#1E293B] rounded-xl text-[#CBD5E1] text-xs focus:outline-none focus:border-[#6366F1]"
                >
                  {activeCategory.units.map((u, i) => (
                    <option key={u.id} value={i}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* All Units Comparison Table */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F1523] p-6 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>{activeCategory.iconText}</span>
              <span>{activeCategory.name}全量单位对照</span>
            </h3>
            <span className="text-xs text-[#94A3B8] font-mono">
              基准: {inputValue || '0'} {fromUnit?.symbol}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {allConversions.map(({ unit, formatted }, idx) => {
              const isSelected = unit.id === toUnit.id
              const isSource = unit.id === fromUnit.id
              const isCopied = copiedKey === `unit-${idx}`

              return (
                <div
                  key={unit.id}
                  className={`p-3 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#6366F1]/15 border-[#6366F1]/60'
                      : isSource
                      ? 'bg-[#141C2E] border-[#1E293B]'
                      : 'bg-[#090D16] border-[#1E293B]/70 hover:border-[#334155]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold text-[#CBD5E1]">{unit.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#141C2E] text-[#94A3B8] font-mono border border-[#1E293B]">
                        {unit.symbol}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-white block truncate font-medium">{formatted}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formatted, `unit-${idx}`)}
                    className="shrink-0 p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1E293B] transition"
                    title="复制数值"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
