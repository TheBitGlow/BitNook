'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { ArrowRightLeft, Copy, Check } from 'lucide-react'

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
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <ToolLayout slug="unit">
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
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{cat.iconText}</span>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>

        {/* Interactive Converter Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
            {/* From Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">源数值与单位</label>
              <div className="space-y-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="输入数值"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-base focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={fromIndex}
                  onChange={(e) => setFromIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
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
                onClick={handleSwap}
                className="p-3 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition shadow-sm"
                title="交换单位"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* To Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">目标单位与结果</label>
                {convertedResult && (
                  <button
                    onClick={() => copyToClipboard(convertedResult, 'main')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    {copiedKey === 'main' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'main' ? '已复制' : '复制结果'}</span>
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <div className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-indigo-300 font-mono text-base truncate min-h-[46px] flex items-center font-bold">
                  {convertedResult || '0'}
                </div>
                <select
                  value={toIndex}
                  onChange={(e) => setToIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
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
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span>{activeCategory.iconText}</span>
              <span>{activeCategory.name}全量单位对照</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
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
                      ? 'bg-indigo-950/40 border-indigo-600/80'
                      : isSource
                      ? 'bg-slate-950/90 border-slate-700'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold text-slate-300">{unit.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {unit.symbol}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-200 block truncate font-medium">{formatted}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(formatted, `unit-${idx}`)}
                    className="shrink-0 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="复制数值"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
