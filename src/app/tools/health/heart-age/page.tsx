'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Heart } from 'lucide-react'

export default function HeartAgePage() {
  const [age, setAge] = useState(40)
  const [smoker, setSmoker] = useState(false)
  const [cholesterol, setCholesterol] = useState(200)
  const [hdl, setHdl] = useState(50)
  const [systolic, setSystolic] = useState(120)
  const [diabetes, setDiabetes] = useState(false)
  const [treated, setTreated] = useState(false)

  // Simplified Framingham-inspired calculation
  const calculateHeartAge = () => {
    let riskPoints = 0

    // Age points (males, simplified)
    if (age >= 75) riskPoints += 16
    else if (age >= 70) riskPoints += 13
    else if (age >= 65) riskPoints += 10
    else if (age >= 60) riskPoints += 7
    else if (age >= 55) riskPoints += 5
    else if (age >= 50) riskPoints += 3
    else if (age >= 45) riskPoints += 2
    else if (age >= 40) riskPoints += 1

    // Cholesterol
    if (cholesterol >= 280) riskPoints += 3
    else if (cholesterol >= 240) riskPoints += 2
    else if (cholesterol >= 200) riskPoints += 1

    // HDL
    if (hdl >= 60) riskPoints -= 1
    else if (hdl < 40) riskPoints += 2

    // Blood pressure
    if (systolic >= 180) riskPoints += 3
    else if (systolic >= 160) riskPoints += 2
    else if (systolic >= 140) riskPoints += 1

    // Treatment
    if (treated && systolic >= 140) riskPoints -= 1

    // Risk factors
    if (smoker) riskPoints += 2
    if (diabetes) riskPoints += 2

    // Heart age calculation (simplified)
    const heartAge = Math.max(30, Math.min(80, 50 + riskPoints * 3))

    return Math.round(heartAge)
  }

  const heartAge = calculateHeartAge()
  const diff = heartAge - age

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#EF4444]" />
              </div>
              <h1 className="text-2xl font-bold text-white">心脏年龄</h1>
            </div>
            <p className="text-[#94A3B8]">基于Framingham量表的心血管年龄评估</p>
          </div>

          {/* Form */}
          <div className="glass-card p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">实际年龄</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">总胆固醇 (mg/dL)</label>
                <input
                  type="number"
                  value={cholesterol}
                  onChange={(e) => setCholesterol(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">HDL好胆固醇 (mg/dL)</label>
                <input
                  type="number"
                  value={hdl}
                  onChange={(e) => setHdl(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">收缩压 (mmHg)</label>
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-lg text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smoker}
                  onChange={(e) => setSmoker(e.target.checked)}
                  className="w-5 h-5 rounded border-[rgba(99,102,241,0.3)] bg-[#080B14] accent-[#6366F1]"
                />
                <span className="text-[#94A3B8]">正在吸烟</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={diabetes}
                  onChange={(e) => setDiabetes(e.target.checked)}
                  className="w-5 h-5 rounded border-[rgba(99,102,241,0.3)] bg-[#080B14] accent-[#6366F1]"
                />
                <span className="text-[#94A3B8]">患有糖尿病</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={treated}
                  onChange={(e) => setTreated(e.target.checked)}
                  className="w-5 h-5 rounded border-[rgba(99,102,241,0.3)] bg-[#080B14] accent-[#6366F1]"
                />
                <span className="text-[#94A3B8]">正在服用降压药</span>
              </label>
            </div>
          </div>

          {/* Result */}
          <div className="glass-card p-6 text-center mb-6">
            <p className="text-sm text-[#94A3B8] mb-2">您的心脏年龄</p>
            <p className="text-6xl font-bold text-[#EF4444] mb-2">{heartAge}</p>
            <p className="text-lg">
              {diff > 0 ? (
                <span className="text-[#EF4444]">比实际年龄大{diff}岁</span>
              ) : diff < 0 ? (
                <span className="text-[#10B981]">比实际年龄小{Math.abs(diff)}岁</span>
              ) : (
                <span className="text-[#10B981]">与实际年龄相当</span>
              )}
            </p>
          </div>

          {/* Tips */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">改善建议</h3>
            <div className="space-y-3 text-sm text-[#94A3B8]">
              {cholesterol >= 200 && (
                <p className="flex items-start gap-2">
                  <span className="text-[#F59E0B]">●</span>
                  减少饱和脂肪摄入，增加膳食纤维，有助于降低胆固醇
                </p>
              )}
              {hdl < 50 && (
                <p className="flex items-start gap-2">
                  <span className="text-[#F59E0B]">●</span>
                  适度饮酒（每天1杯）、有氧运动可以提高HDL好胆固醇
                </p>
              )}
              {systolic >= 140 && (
                <p className="flex items-start gap-2">
                  <span className="text-[#F59E0B]">●</span>
                  减少盐分摄入，保持适度运动，必要时遵医嘱服药
                </p>
              )}
              {smoker && (
                <p className="flex items-start gap-2">
                  <span className="text-[#EF4444]">●</span>
                  <span className="text-[#EF4444]">戒烟是改善心血管健康最有效的方法之一</span>
                </p>
              )}
              {diabetes && (
                <p className="flex items-start gap-2">
                  <span className="text-[#F59E0B]">●</span>
                  控制血糖水平，定期检查，遵循医嘱
                </p>
              )}
              {diff <= 0 && (
                <p className="flex items-start gap-2">
                  <span className="text-[#10B981]">●</span>
                  继续保持健康的生活方式！
                </p>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-[#111927]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">免责声明：</span>
              此评估仅供参考，基于简化模型。如有健康问题，请咨询专业医生。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
