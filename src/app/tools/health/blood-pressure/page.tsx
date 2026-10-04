'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Activity } from 'lucide-react'

export default function BloodPressurePage() {
  const [systolic, setSystolic] = useState(120)
  const [diastolic, setDiastolic] = useState(80)

  const getCategory = (sys: number, dia: number): { name: string; color: string; desc: string } => {
    if (sys >= 180 || dia >= 110) return { name: '高血压3级', color: '#DC2626', desc: '需立即就医' }
    if (sys >= 160 || dia >= 100) return { name: '高血压2级', color: '#EF4444', desc: '需药物治疗' }
    if (sys >= 140 || dia >= 90) return { name: '高血压1级', color: '#F59E0B', desc: '需改善生活方式' }
    if (sys >= 130 || dia >= 85) return { name: '正常高值', color: '#EAB308', desc: '注意饮食运动' }
    if (sys >= 120 && dia < 80) return { name: '正常', color: '#10B981', desc: '继续保持' }
    if (sys < 90 || dia < 60) return { name: '低血压', color: '#3B82F6', desc: '注意营养休息' }
    return { name: '理想', color: '#10B981', desc: '非常健康' }
  }

  const category = getCategory(systolic, diastolic)

  const history = [
    { date: '04-08', sys: 125, dia: 82 },
    { date: '04-07', sys: 122, dia: 78 },
    { date: '04-06', sys: 118, dia: 76 },
    { date: '04-05', sys: 120, dia: 75 },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#EF4444]" />
              </div>
              <h1 className="text-2xl font-bold text-white">血压评估</h1>
            </div>
            <p className="text-[#94A3B8]">血压分级与健康评估</p>
          </div>

          {/* Input */}
          <div className="glass-card p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">收缩压 (mmHg)</label>
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white text-2xl text-center"
                />
                <p className="text-xs text-[#475569] mt-1 text-center">高压，正常范围90-140</p>
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">舒张压 (mmHg)</label>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white text-2xl text-center"
                />
                <p className="text-xs text-[#475569] mt-1 text-center">低压，正常范围60-90</p>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="glass-card p-6 mb-6 text-center">
            <p className="text-sm text-[#94A3B8] mb-2">血压分类</p>
            <p className="text-4xl font-bold mb-2" style={{ color: category.color }}>
              {category.name}
            </p>
            <p className="text-[#94A3B8]">{category.desc}</p>
          </div>

          {/* Scale */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-white font-medium mb-4">血压参考表</h3>
            <div className="space-y-2">
              {[
                { range: '≥180 / ≥110', label: '高血压3级', color: '#DC2626' },
                { range: '160-179 / 100-109', label: '高血压2级', color: '#EF4444' },
                { range: '140-159 / 90-99', label: '高血压1级', color: '#F59E0B' },
                { range: '130-139 / 85-89', label: '正常高值', color: '#EAB308' },
                { range: '120-129 / <80', label: '正常', color: '#10B981' },
                { range: '<90 / <60', label: '低血压', color: '#3B82F6' },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-2 rounded"
                  style={{ backgroundColor: `${item.color}10` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-[#94A3B8] flex-1">{item.range}</span>
                  <span style={{ color: item.color }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">最近记录</h3>
            <div className="space-y-2">
              {history.map((record, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#080B14] rounded-lg">
                  <span className="text-[#475569]">{record.date}</span>
                  <span className="text-white">
                    {record.sys} / {record.dia}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-[#111927]/50 rounded-xl border border-[rgba(99,102,241,0.1)]">
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B]">免责声明：</span>
              本工具仅供参考，不能替代专业医疗诊断。如有健康顾虑，请咨询医生。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
