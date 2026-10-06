export interface BMIResult {
  bmi: number
  category: string
  color: string
  advice: string
  idealWeightRange: { min: number; max: number }
  whoCategory: string
}

export function calculateBMI(heightCm: number, weightKg: number): BMIResult | null {
  if (heightCm <= 0 || weightKg <= 0 || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
    return null
  }

  const hMeters = heightCm / 100
  const bmiVal = Math.round((weightKg / (hMeters * hMeters)) * 10) / 10

  // Chinese adult standard (WS/T 428-2013)
  let category = '健康正常'
  let color = '#10B981'
  let advice = '处于适宜体质指数范围，患心血管与代谢疾病的相对风险处于最低基线。'

  if (bmiVal < 18.5) {
    category = '偏瘦 (体重过低)'
    color = '#3B82F6'
    advice = '体重低于标准范围，建议适当增加优质蛋白质与能量摄入，排除消化吸收等健康问题。'
  } else if (bmiVal < 24.0) {
    category = '健康正常'
    color = '#10B981'
    advice = '处于适宜体质指数范围，患心血管与代谢疾病的相对风险处于最低基线。'
  } else if (bmiVal < 28.0) {
    category = '超重 (偏胖)'
    color = '#F59E0B'
    advice = '体质指数超出健康范围，建议减少高糖高油饮食，每周保持至少 150 分钟中等强度有氧运动。'
  } else {
    category = '肥胖'
    color = '#EF4444'
    advice = '已达临床肥胖标准，可能增加高血压、2型糖尿病与脂肪肝风险，建议咨询临床医生进行系统减重指导。'
  }

  // WHO Standard comparison
  let whoCategory = 'Normal weight'
  if (bmiVal < 18.5) whoCategory = 'Underweight'
  else if (bmiVal < 25.0) whoCategory = 'Normal weight'
  else if (bmiVal < 30.0) whoCategory = 'Pre-obesity (Overweight)'
  else if (bmiVal < 35.0) whoCategory = 'Obesity Class I'
  else whoCategory = 'Obesity Class II/III'

  const minIdeal = Math.round(18.5 * hMeters * hMeters * 10) / 10
  const maxIdeal = Math.round(23.9 * hMeters * hMeters * 10) / 10

  return {
    bmi: bmiVal,
    category,
    color,
    advice,
    idealWeightRange: { min: minIdeal, max: maxIdeal },
    whoCategory,
  }
}

export interface CalorieResult {
  bmr: number
  tdee: number
  goals: {
    label: string
    desc: string
    calories: number
    color: string
  }[]
  macros: {
    proteinGrams: number
    fatGrams: number
    carbsGrams: number
  }
}

export function calculateCalories(params: {
  weightKg: number
  heightCm: number
  ageYears: number
  gender: 'male' | 'female'
  activityLevel: number
}): CalorieResult {
  const { weightKg, heightCm, ageYears, gender, activityLevel } = params

  const safeWeight = Math.max(1, weightKg)
  const safeHeight = Math.max(1, heightCm)
  const safeAge = Math.max(1, ageYears)

  // Mifflin-St Jeor Equation
  const bmr =
    gender === 'male'
      ? Math.round(10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + 5)
      : Math.round(10 * safeWeight + 6.25 * safeHeight - 5 * safeAge - 161)

  const tdee = Math.round(bmr * activityLevel)

  const goals = [
    {
      label: '健康减脂 (-500 kcal)',
      desc: '建议每周稳步减重约 0.4~0.5 kg',
      calories: Math.max(1200, tdee - 500),
      color: '#EF4444',
    },
    {
      label: '体重维持 (±0 kcal)',
      desc: '摄入与消耗平衡，维持现有体重',
      calories: tdee,
      color: '#10B981',
    },
    {
      label: '增肌增重 (+300 kcal)',
      desc: '配合阻力力量训练，促进肌肉合成',
      calories: tdee + 300,
      color: '#3B82F6',
    },
  ]

  const proteinGrams = Math.round(safeWeight * 1.6)
  const fatGrams = Math.round((tdee * 0.25) / 9)
  const carbsGrams = Math.max(0, Math.round((tdee - proteinGrams * 4 - fatGrams * 9) / 4))

  return {
    bmr,
    tdee,
    goals,
    macros: {
      proteinGrams,
      fatGrams,
      carbsGrams,
    },
  }
}

export interface HeartRateZone {
  key: string
  name: string
  minRate: number
  maxRate: number
  percentageMin: number
  percentageMax: number
  color: string
  desc: string
}

export interface HeartRateResult {
  maxHeartRate: number
  reserveHeartRate?: number
  zones: HeartRateZone[]
}

export function calculateHeartRateZones(params: {
  age: number
  restingHeartRate?: number
  method?: 'reserve' | 'max'
  formula?: 'fox' | 'tanaka'
}): HeartRateResult {
  const { age, restingHeartRate = 60, method = 'reserve', formula = 'tanaka' } = params
  const safeAge = Math.min(120, Math.max(10, age))

  const maxHeartRate =
    formula === 'tanaka'
      ? Math.round(208 - 0.7 * safeAge)
      : Math.round(220 - safeAge)

  const reserve = Math.max(0, maxHeartRate - restingHeartRate)

  const zoneConfigs = [
    {
      key: 'warmup',
      name: '热身放松区',
      pMin: 0.5,
      pMax: 0.6,
      color: '#3B82F6',
      desc: '极低强度活动，适合运动前动态热身与排酸恢复。',
    },
    {
      key: 'fat',
      name: '燃脂有氧区',
      pMin: 0.6,
      pMax: 0.7,
      color: '#10B981',
      desc: '低强度舒适区间，脂肪供能比例最高，可持续长时间慢跑骑行。',
    },
    {
      key: 'aerobic',
      name: '耐力有氧区',
      pMin: 0.7,
      pMax: 0.8,
      color: '#F59E0B',
      desc: '中等强度，有效增强心肌泵血效率与肺活量。',
    },
    {
      key: 'threshold',
      name: '乳酸阈值区',
      pMin: 0.8,
      pMax: 0.9,
      color: '#EF4444',
      desc: '高强度间歇，体内乳酸产生与清除处于平衡临界点。',
    },
    {
      key: 'peak',
      name: '极限无氧区',
      pMin: 0.9,
      pMax: 1.0,
      color: '#DC2626',
      desc: '接近最大摄氧量与极限负荷，单次持续时间数秒至极短冲刺。',
    },
  ]

  const zones: HeartRateZone[] = zoneConfigs.map(z => {
    let minRate: number
    let maxRate: number

    if (method === 'reserve' && restingHeartRate > 0) {
      // Karvonen formula: target = resting + intensity * reserve
      minRate = Math.round(restingHeartRate + z.pMin * reserve)
      maxRate = Math.round(restingHeartRate + z.pMax * reserve)
    } else {
      // Direct max HR percentage
      minRate = Math.round(maxHeartRate * z.pMin)
      maxRate = Math.round(maxHeartRate * z.pMax)
    }

    return {
      key: z.key,
      name: z.name,
      minRate,
      maxRate,
      percentageMin: Math.round(z.pMin * 100),
      percentageMax: Math.round(z.pMax * 100),
      color: z.color,
      desc: z.desc,
    }
  })

  return {
    maxHeartRate,
    reserveHeartRate: method === 'reserve' ? reserve : undefined,
    zones,
  }
}

export interface BloodPressureClassification {
  level: string
  color: string
  advice: string
  stage: 'optimal' | 'normal' | 'high-normal' | 'grade-1' | 'grade-2' | 'grade-3' | 'low' | 'isolated-systolic'
}

export function classifyBloodPressure(systolic: number, diastolic: number): BloodPressureClassification {
  if (systolic < 90 || diastolic < 60) {
    return {
      level: '血压偏低',
      color: '#38BDF8',
      stage: 'low',
      advice: '若伴有头晕、乏力等不适，建议就医排查体位性低血压或贫血等原因。',
    }
  }
  if (systolic >= 180 || diastolic >= 110) {
    return {
      level: '3级高血压（重度）',
      color: '#DC2626',
      stage: 'grade-3',
      advice: '血压显著升高，需高度警惕并及时遵医嘱就医评估。',
    }
  }
  if (systolic >= 160 || diastolic >= 100) {
    return {
      level: '2级高血压（中度）',
      color: '#EF4444',
      stage: 'grade-2',
      advice: '建议咨询专科医师，配合生活方式干预与规范化评估。',
    }
  }
  if (systolic >= 140 || diastolic >= 90) {
    if (systolic >= 140 && diastolic < 90) {
      return {
        level: '单纯收缩期高血压',
        color: '#F59E0B',
        stage: 'isolated-systolic',
        advice: '收缩压升高而舒张压正常，常见于老年动脉硬化，建议专科心血管医师评估。',
      }
    }
    return {
      level: '1级高血压（轻度）',
      color: '#F59E0B',
      stage: 'grade-1',
      advice: '建议低盐低脂饮食、戒烟限酒、规律监测，并在医生指导下随访。',
    }
  }
  if (systolic >= 130 || diastolic >= 85) {
    return {
      level: '正常高值血压',
      color: '#EAB308',
      stage: 'high-normal',
      advice: '处于临界高值，建议增加有氧运动、改善作息，定期监测。',
    }
  }
  if (systolic < 120 && diastolic < 80) {
    return {
      level: '理想健康血压',
      color: '#10B981',
      stage: 'optimal',
      advice: '处于理想健康血压范围，心血管疾病基础风险处于最佳低位。',
    }
  }
  return {
    level: '正常血压',
    color: '#10B981',
    stage: 'normal',
    advice: '处于适宜健康血压范围，请继续保持良好生活习惯。',
  }
}

export interface SleepCycleItem {
  cycles: number
  time: string // HH:mm
  totalHours: string
  label: string
}

export function calculateSleepSchedule(params: {
  mode: 'wake' | 'sleep'
  timeStr: string // HH:mm
  latencyMinutes?: number
}): SleepCycleItem[] {
  const { mode, timeStr, latencyMinutes = 15 } = params
  const [h, m] = timeStr.split(':').map(Number)
  const baseMinutes = (isNaN(h) ? 7 : h) * 60 + (isNaN(m) ? 0 : m)
  const cycleMinutes = 90
  const cyclesList = [6, 5, 4, 3]

  return cyclesList.map(c => {
    const sleepDuration = c * cycleMinutes
    let targetTimeMinutes: number

    if (mode === 'wake') {
      targetTimeMinutes = baseMinutes - sleepDuration - latencyMinutes
    } else {
      targetTimeMinutes = baseMinutes + latencyMinutes + sleepDuration
    }

    let normalized = targetTimeMinutes % (24 * 60)
    if (normalized < 0) normalized += 24 * 60
    const outH = Math.floor(normalized / 60)
    const outM = normalized % 60
    const timeFormatted = `${outH.toString().padStart(2, '0')}:${outM.toString().padStart(2, '0')}`

    let label = '推荐黄金睡眠'
    if (c === 6) label = '充足充沛睡眠 (9小时)'
    else if (c === 5) label = '成人理想时长 (7.5小时)'
    else if (c === 4) label = '适度短周期 (6小时)'
    else label = '应急短睡眠 (4.5小时)'

    return {
      cycles: c,
      time: timeFormatted,
      totalHours: (sleepDuration / 60).toFixed(1),
      label,
    }
  })
}

export interface StepsResult {
  strideCm: number
  distanceKm: number
  distanceMiles: number
  durationMinutes: number
  caloriesKcal: number
}

export function calculateSteps(params: {
  steps: number
  heightCm?: number
  speedCategory?: 'slow' | 'normal' | 'brisk'
  weightKg?: number
}): StepsResult {
  const { steps, heightCm = 170, speedCategory = 'normal', weightKg = 65 } = params
  const safeSteps = Math.max(0, steps)
  const strideRatio = 0.415
  const strideCm = Math.round(heightCm * strideRatio)
  const strideMeters = strideCm / 100

  const distanceKm = Math.round(((safeSteps * strideMeters) / 1000) * 100) / 100
  const distanceMiles = Math.round(distanceKm * 0.621371 * 100) / 100

  const speeds = { slow: 3.5, normal: 4.5, brisk: 5.5 }
  const speedKmH = speeds[speedCategory] || 4.5
  const hours = distanceKm / speedKmH
  const durationMinutes = Math.round(hours * 60)

  // Caloric expenditure: ~0.04 kcal per step adjusted by body weight ratio
  const weightFactor = weightKg / 65
  const caloriesKcal = Math.round(safeSteps * 0.04 * weightFactor)

  return {
    strideCm,
    distanceKm,
    distanceMiles,
    durationMinutes,
    caloriesKcal,
  }
}

export interface WaterIntakeResult {
  dailyMl: number
  glasses250ml: number
  schedule: { time: string; amountMl: number; note: string }[]
}

export function calculateWaterIntake(params: {
  weightKg: number
  activityMinutes?: number
  climateHot?: boolean
}): WaterIntakeResult {
  const { weightKg, activityMinutes = 0, climateHot = false } = params
  const safeWeight = Math.max(30, weightKg)

  // Baseline: 35ml per kg body weight
  let totalMl = safeWeight * 35

  // Exercise hydration: +12ml per active minute
  totalMl += activityMinutes * 12

  // Climate offset: +500ml for hot/dry environment
  if (climateHot) totalMl += 500

  const roundedMl = Math.round(totalMl / 50) * 50
  const glasses = Math.round(roundedMl / 250)

  const schedule = [
    { time: '07:00', amountMl: 300, note: '晨起空腹温水，唤醒肠道代谢' },
    { time: '09:30', amountMl: 250, note: '工作间歇补水，保持头脑清醒' },
    { time: '11:30', amountMl: 250, note: '午餐前30分钟适量饮水' },
    { time: '14:00', amountMl: 300, note: '午后办公提神，补充水分' },
    { time: '16:30', amountMl: 250, note: '下班前代谢补水' },
    { time: '19:00', amountMl: 250, note: '晚餐后适量饮水' },
    { time: '21:30', amountMl: 150, note: '睡前半小时小口慢饮，防止夜间口干' },
  ]

  return {
    dailyMl: roundedMl,
    glasses250ml: glasses,
    schedule,
  }
}
