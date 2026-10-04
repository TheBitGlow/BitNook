'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ArrowRightLeft } from 'lucide-react'

const categories = {
  length: {
    name: '长度',
    units: [
      { name: '米 (m)', value: 1 },
      { name: '厘米 (cm)', value: 0.01 },
      { name: '毫米 (mm)', value: 0.001 },
      { name: '千米 (km)', value: 1000 },
      { name: '英寸 (in)', value: 0.0254 },
      { name: '英尺 (ft)', value: 0.3048 },
      { name: '英里 (mi)', value: 1609.344 },
      { name: '码 (yd)', value: 0.9144 },
    ]
  },
  weight: {
    name: '重量',
    units: [
      { name: '千克 (kg)', value: 1 },
      { name: '克 (g)', value: 0.001 },
      { name: '毫克 (mg)', value: 0.000001 },
      { name: '吨 (t)', value: 1000 },
      { name: '磅 (lb)', value: 0.453592 },
      { name: '盎司 (oz)', value: 0.0283495 },
    ]
  },
  temperature: {
    name: '温度',
    units: [
      { name: '摄氏度 (°C)', value: 'celsius' },
      { name: '华氏度 (°F)', value: 'fahrenheit' },
      { name: '开尔文 (K)', value: 'kelvin' },
    ]
  },
  area: {
    name: '面积',
    units: [
      { name: '平方米 (m²)', value: 1 },
      { name: '平方厘米 (cm²)', value: 0.0001 },
      { name: '平方千米 (km²)', value: 1000000 },
      { name: '公顷 (ha)', value: 10000 },
      { name: '亩', value: 666.667 },
      { name: '平方英尺 (ft²)', value: 0.092903 },
      { name: '平方英里 (mi²)', value: 2589988 },
    ]
  },
  volume: {
    name: '体积',
    units: [
      { name: '立方米 (m³)', value: 1 },
      { name: '升 (L)', value: 0.001 },
      { name: '毫升 (mL)', value: 0.000001 },
      { name: '加仑 (gal)', value: 0.00378541 },
      { name: '夸脱 (qt)', value: 0.000946353 },
      { name: '品脱 (pt)', value: 0.000473176 },
    ]
  }
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<keyof typeof categories>('length')
  const [inputValue, setInputValue] = useState('')
  const [fromUnit, setFromUnit] = useState(0)
  const [toUnit, setToUnit] = useState(1)

  const convert = useMemo(() => {
    if (!inputValue) return ''

    const val = parseFloat(inputValue)
    if (isNaN(val)) return ''

    const cat = categories[category]

    if (category === 'temperature') {
      const from = cat.units[fromUnit].value as string
      const to = cat.units[toUnit].value as string

      let celsius: number
      if (from === 'celsius') celsius = val
      else if (from === 'fahrenheit') celsius = (val - 32) * 5 / 9
      else celsius = val - 273.15

      let result: number
      if (to === 'celsius') result = celsius
      else if (to === 'fahrenheit') result = celsius * 9 / 5 + 32
      else result = celsius + 273.15

      return result.toFixed(4)
    }

    const fromValue = cat.units[fromUnit].value as number
    const toValue = cat.units[toUnit].value as number
    const result = (val * fromValue) / toValue
    return result.toFixed(6).replace(/\.?0+$/, '')
  }, [inputValue, fromUnit, toUnit, category])

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
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
                <ArrowRightLeft className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h1 className="text-2xl font-bold text-white">单位转换</h1>
            </div>
            <p className="text-[#94A3B8]">长度、重量、温度、面积、体积单位互转</p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => {
                  setCategory(key as keyof typeof categories)
                  setFromUnit(0)
                  setToUnit(1)
                  setInputValue('')
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === key
                    ? 'bg-[#F59E0B] text-white'
                    : 'bg-[#111827] text-[#94A3B8] hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Converter */}
          <div className="glass-card p-6">
            {/* From */}
            <div className="mb-4">
              <label className="block text-sm text-[#94A3B8] mb-2">从</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入数值"
                className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.4)] text-lg"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(Number(e.target.value))}
                className="w-full mt-2 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
              >
                {categories[category].units.map((u, i) => (
                  <option key={i} value={i}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-4">
              <button
                onClick={swapUnits}
                className="p-3 rounded-full bg-[#111827] border border-[rgba(99,102,241,0.3)] text-[#94A3B8] hover:text-white hover:border-[rgba(99,102,241,0.6)] transition-all"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* To */}
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">到</label>
              <div className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white text-lg">
                {convert || '0'}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(Number(e.target.value))}
                className="w-full mt-2 px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
              >
                {categories[category].units.map((u, i) => (
                  <option key={i} value={i}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
