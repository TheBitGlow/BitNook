/**
 * Lightweight search index with phonetic/pinyin keyword mappings
 * for BitNook utilities and games. Zero heavy runtime dependencies.
 */

export const PINYIN_INDEX: Record<string, string[]> = {
  // Finance
  mortgage: ['fangdai', 'yuegong', 'daikuan', 'lpr', 'denghua', 'dengben'],
  salary: ['gongzi', 'shuishou', 'geshui', 'wuxianyijin', 'daoshou'],
  exchange: ['huilv', 'duihuan', 'meiyuan', 'renminbi', 'huobi'],
  retirement: ['yanglaojin', 'tuixiu', 'yanglao'],
  compound: ['fuli', 'dingtou', 'licai', 'lixi', 'shouyi'],
  deposit: ['cunkuan', 'dingqi', 'huoqi', 'lixi', 'yinhang'],
  'loan-compare': ['daikuan', 'duibi', 'chedai', 'fangdai'],
  roi: ['touzishouyilv', 'touzi', 'shouyi', 'huibao'],

  // Health
  bmi: ['bmi', 'tizhi', 'tizhong', 'shengao', 'jiankang'],
  calories: ['kaluli', 'relang', 'jichudaixie', 'bmr', 'tdee'],
  'heart-rate': ['xinlv', 'maibo', 'jiankang'],
  'blood-pressure': ['xueya', 'gaoxueya', 'shousuoya', 'shuzhangya'],
  sleep: ['shuimian', 'zhouqi', 'qichuang'],
  steps: ['bufu', 'jibu', 'paobu', 'juli'],
  'water-intake': ['yinshui', 'heshui', 'jiankang'],

  // Convert
  timestamp: ['shijianchuo', 'unix', 'timestamp', 'shijian'],
  qrcode: ['erweima', 'shengcheng', 'saoma'],
  hash: ['haxi', 'sha256', 'md5', 'sha1', 'base64'],
  radix: ['jinzhi', 'erjinzhi', 'shijinzhi', 'shiliujinzhi', 'hex', 'bin'],
  unit: ['danwei', 'danweihuansuan', 'changdu', 'zhongliang', 'mianji'],
  color: ['yanse', 'tiaoseban', 'rgb', 'hex', 'hsl'],

  // Daily
  timer: ['jishiqi', 'fanqiezhong', 'daojishi'],
  countdown: ['daojishi', 'mubiaori', 'jinianri'],
  lottery: ['choujiang', 'suijishu', 'yaohao'],
  password: ['mima', 'qiangmima', 'suijimima', 'shengchengqi'],
  'word-count': ['zisutongji', 'hanzi', 'danci', 'zifu'],
  'date-calc': ['riqijisuan', 'tianshu', 'jianju'],
  stopwatch: ['miaobiao', 'jishi'],
  'world-clock': ['shijiezhongbiao', 'shiqu', 'shijian'],

  // Network
  dns: ['yuming', 'jiexi', 'dns'],
  'ip-lookup': ['ip', 'ipdizhi', 'chaxun', 'guishudi'],
  'http-check': ['http', 'zhuangtaima', 'jiancha', 'qingqiu'],
  ping: ['wangluo', 'yanchi', 'ping', 'liantongxing'],
  'wifi-info': ['wifi', 'wuxian', 'wangluo', 'sudu'],

  // AI
  'gpu-calculator': ['xiancun', 'daxingmoxing', 'llm', 'vram', 'gpu', 'lianghua'],

  // Games
  tetris: ['eluosifangkuai', 'fangkuai'],
  minesweeper: ['saolei', 'leiqu'],
  snake: ['tanchishe', 'she'],
  gomoku: ['wuziqi', 'lianzi'],
  match3: ['xiaoxiaole', 'sanxiao'],
  'chess-international': ['guojixiangqi', 'xiangqi'],
  'chess-chinese': ['zhongguoxiangqi', 'xiangqi'],
  freecell: ['kongjieshidai', 'pukepai', 'zhipai'],
}

/**
 * Checks whether a given slug matches a query string via pinyin keywords.
 */
export function matchPinyin(slug: string, query: string): boolean {
  const keywords = PINYIN_INDEX[slug]
  if (!keywords) return false
  const q = query.toLowerCase().trim()
  return keywords.some((kw) => kw.includes(q) || q.includes(kw))
}
