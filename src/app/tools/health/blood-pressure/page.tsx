'use client'

import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Activity, Plus, Trash2, HeartPulse, ShieldAlert, CheckCircle2 } from 'lucide-react'

interface BPRecord {
  id: string
  date: string
  systolic: number
  diastolic: number
  pulse?: number
  note?: string
}

export default function BloodPressurePage() {
  const [systolic, setSystolic] = useState<number>(120)
  const [diastolic, setDiastolic] = useState<number>(80)
  const [pulse, setPulse] = useState<number>(75)
  const [note, setNote] = useState<string>('')
  const [records, setRecords] = useState<BPRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bitnook_bp_records')
        if (saved) return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return []
  })

  const saveRecord = () => {
    if (systolic <= 0 || diastolic <= 0) return
    const newRecord: BPRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      systolic,
      diastolic,
      pulse: pulse > 0 ? pulse : undefined,
      note: note.trim() || undefined,
    }
    const updated = [newRecord, ...records].slice(0, 30) // keep last 30
    setRecords(updated)
    try {
      localStorage.setItem('bitnook_bp_records', JSON.stringify(updated))
    } catch {
      // ignore
    }
    setNote('')
  }

  const deleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id)
    setRecords(updated)
    try {
      localStorage.setItem('bitnook_bp_records', JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const getBPClassification = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 110) {
      return {
        level: '3级高血压（重度）',
        color: '#DC2626',
        bg: 'rgba(220,38,38,0.15)',
        advice: '血压显著升高，需高度警惕并及时遵医嘱就医评估。',
      }
    }
    if (sys >= 160 || dia >= 100) {
      return {
        level: '2级高血压（中度）',
        color: '#EF4444',
        bg: 'rgba(239,68,68,0.15)',
        advice: '建议咨询专科医师，配合生活方式干预与规范化评估。',
      }
    }
    if (sys >= 140 || dia >= 90) {
      return {
        level: '1级高血压（轻度）',
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.15)',
        advice: '建议低盐低脂饮食、戒烟限酒、规律监测，并在医生指导下随访。',
      }
    }
    if (sys >= 130 || dia >= 85) {
      return {
        level: '正常高值血压',
        color: '#EAB308',
        bg: 'rgba(234,179,8,0.15)',
        advice: '处于临界高值，建议增加有氧运动、改善作息，定期监测。',
      }
    }
    if (sys >= 90 && dia >= 60) {
      return {
        level: '正常健康血压',
        color: '#10B981',
        bg: 'rgba(16,185,129,0.15)',
        advice: '处于适宜健康血压范围，请继续保持良好生活习惯。',
      }
    }
    return {
      level: '血压偏低',
      color: '#38BDF8',
      bg: 'rgba(56,189,248,0.15)',
      advice: '若伴有头晕、乏力等不适，建议就医排查体位性低血压或贫血等原因。',
    }
  }

  const currentClassification = getBPClassification(systolic, diastolic)

  const faq = [
    {
      question: '测量血压前有哪些注意事项？',
      answer:
        '测量前请在安静环境下静坐休息 5 分钟，半小时内避免剧烈运动、吸烟或饮用浓茶咖啡。测量时双脚平放地面，手臂与心脏保持同一水平高度。',
    },
    {
      question: '为什么单次测量偏高不代表确诊高血压？',
      answer:
        '人体血压存在全天生理波动，紧张、白大褂效应等均可引起暂时升高。临床诊断通常需要在非同日、多次安静测量，或采用24小时动态血压监测（ABPM）综合判断。',
    },
    {
      question: '我的血压记录保存在哪里？',
      answer:
        '本工具严格遵守隐私安全原则，所有血压日志仅存储于您当前浏览器的本地缓存 (LocalStorage) 中，绝不会上传至任何远程服务器。',
    },
  ]

  const howToSteps = [
    '使用合格的上臂式电子血压计测量后，分别输入收缩压（高压）与舒张压（低压）。',
    '可选择性填入测量时的脉搏心率与测量场景（如晨起、服药后、睡前）。',
    '点击【保存至本地记录】，生成个人长期随访曲线日志。',
    '对照《中国高血压防治指南》标准色卡，查看血压所处的分级参考区间。',
  ]

  return (
    <ToolLayout
      toolSlug="blood-pressure"
      principlesTitle="血压分级参考依据与监测规范"
      principles={
        <>
          <p>
            <strong>1. 分级标准依据：</strong>参考《中国高血压防治指南》与世界卫生组织（WHO）成人坐位诊室血压分级标准（高压/低压 mmHg）：
            <br />
            - 正常血压：收缩压 90~129 且 舒张压 60~84；
            <br />
            - 正常高值：收缩压 130~139 或 舒张压 85~89；
            <br />
            - 1级高血压：收缩压 140~159 或 舒张压 90~99；
            <br />
            - 2级高血压：收缩压 160~179 或 舒张压 100~109；
            <br />
            - 3级高血压：收缩压 ≥180 或 舒张压 ≥110。
          </p>
          <p>
            <strong>2. 重要说明：</strong>当收缩压和舒张压分属于不同级别时，以较高的级别为准。本工具仅提供日志记录与标准对照，不具备任何医疗处方或临床诊断职能。
          </p>
        </>
      }
      howToSteps={howToSteps}
      faq={faq}
      disclaimer="本工具用于家庭常态化血压监测日志记录与健康标准对照，不属于医疗器械或临床诊断系统。若测量数值持续偏高或伴有头晕、胸闷、心悸等不适症状，请立即前往正规医疗机构心血管内科就诊。"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[#0B0F19]/80 p-6 sm:p-8 backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                收缩压 (高压, mmHg)
              </label>
              <input
                type="number"
                min="40"
                max="260"
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-2xl font-bold font-mono text-center text-white focus:border-[#6366F1] focus:outline-none"
              />
              <p className="mt-1 text-center text-[11px] text-[#64748B]">参考范围 90 ~ 139</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                舒张压 (低压, mmHg)
              </label>
              <input
                type="number"
                min="30"
                max="180"
                value={diastolic}
                onChange={(e) => setDiastolic(Number(e.target.value))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-2xl font-bold font-mono text-center text-white focus:border-[#6366F1] focus:outline-none"
              />
              <p className="mt-1 text-center text-[11px] text-[#64748B]">参考范围 60 ~ 89</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                脉搏 (次/分, 可选)
              </label>
              <input
                type="number"
                min="30"
                max="220"
                value={pulse}
                onChange={(e) => setPulse(Number(e.target.value))}
                className="w-full rounded-xl border border-[rgba(99,102,241,0.18)] bg-[#070A12] px-4 py-3 text-2xl font-bold font-mono text-center text-[#38BDF8] focus:border-[#6366F1] focus:outline-none"
              />
              <p className="mt-1 text-center text-[11px] text-[#64748B]">静息心率约 60 ~ 100</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="备注标签（如：晨起空腹、服药后、运动后等）"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 rounded-xl border border-[rgba(99,102,241,0.15)] bg-[#070A12] px-4 py-2.5 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#6366F1]"
            />
            <button
              type="button"
              onClick={saveRecord}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#6366F1] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#5558E3] transition-all shadow-md"
            >
              <Plus className="h-4 w-4" />
              保存到本地健康日志
            </button>
          </div>
        </div>

        {/* Current Classification Banner */}
        <div
          className="rounded-2xl border p-6 text-center transition-all"
          style={{
            borderColor: currentClassification.color,
            backgroundColor: currentClassification.bg,
          }}
        >
          <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
            当前数值对照结果（指南分级）
          </p>
          <p
            className="text-3xl font-extrabold tracking-tight my-2"
            style={{ color: currentClassification.color }}
          >
            {currentClassification.level}
          </p>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-lg mx-auto">
            {currentClassification.advice}
          </p>
        </div>

        {/* History Log Section */}
        <div className="rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[#0B0F19]/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-[#EF4444]" />
              <h3 className="font-semibold text-white text-sm sm:text-base">
                本地血压历史记录 ({records.length} 条)
              </h3>
            </div>
            {records.length > 0 && (
              <span className="text-[11px] text-[#64748B]">存储于当前浏览器</span>
            )}
          </div>

          {records.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#64748B]">
              暂无保存的记录，输入血压数值后点击上方按钮即可本地存盘
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[rgba(99,102,241,0.15)] text-[#64748B]">
                    <th className="py-2.5 px-3">记录时间</th>
                    <th className="py-2.5 px-3 text-right">高压 / 低压</th>
                    <th className="py-2.5 px-3 text-right">心率</th>
                    <th className="py-2.5 px-3">指南分级对照</th>
                    <th className="py-2.5 px-3">备注</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(99,102,241,0.06)] font-mono">
                  {records.map((r) => {
                    const cls = getBPClassification(r.systolic, r.diastolic)
                    return (
                      <tr key={r.id} className="hover:bg-[#1E293B]/20 transition-colors">
                        <td className="py-2.5 px-3 text-[#94A3B8]">{r.date}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          {r.systolic} / {r.diastolic} <span className="text-[10px] text-[#64748B]">mmHg</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#38BDF8]">
                          {r.pulse ? `${r.pulse} bpm` : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ color: cls.color, backgroundColor: cls.bg }}
                          >
                            {cls.level}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#94A3B8] font-sans truncate max-w-[120px]">
                          {r.note || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteRecord(r.id)}
                            className="text-[#64748B] hover:text-[#EF4444] transition-colors p-1"
                            title="删除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
