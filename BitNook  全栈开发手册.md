# 🌌 BitNook（比特角落）— 全栈开发手册

> **品牌定位**：BitNook | 比特角落  
> **Slogan**："All Tools, One Nook · 一站搞定，方寸万象"  
> **目标用户**：职场人、学生、开发者、自由职业者  
> **商业模式**：免费工具 + VIP会员订阅 + 积分体系 + 广告分成  
> **版本目标**：MVP → v1.0 → v2.0 渐进式上线

---

## 一、技术架构总提示词

```
你是一位拥有15年经验的全栈架构师，请构建 BitNook（比特角落）平台。

## 完整技术栈

### 前端层
- Framework: Next.js 14（App Router + RSC）
- Language: TypeScript 5（严格模式，禁用 any）
- Styling: Tailwind CSS v3 + shadcn/ui + CSS Variables
- 动效: Framer Motion v11
- 状态: Zustand v4（客户端）+ nuqs（URL状态）
- 表单: React Hook Form v7 + Zod v3
- 数据请求: TanStack Query v5 + Axios
- 图表: ECharts v5（后台）+ Recharts（前台）
- 国际化: next-intl（中英文切换）
- 图标: Lucide React + React Icons（游戏/特殊图标）
- 字体: Inter + Noto Sans SC（Google Fonts）

### 后端层
- Runtime: Node.js 20 LTS
- API: Next.js API Routes + tRPC v11（类型安全RPC）
- ORM: Prisma v5 + PostgreSQL 16
- 缓存: Redis（Upstash Serverless）
- 队列: BullMQ（AI任务异步处理）
- 文件: Cloudflare R2（兼容S3 SDK）
- 邮件: Resend（邮件验证/通知）
- 实时: Pusher / Socket.io（游戏联机、在线人数）

### AI层
- LLM: OpenAI GPT-4o-mini（日常）/ GPT-4o（复杂任务）
- 备用: Claude claude-haiku-4-5-20251001（成本控制）
- 翻译: DeepL API v2 + 百度翻译 API（国内备用）
- 图像: DALL-E 3（头像/壁纸）
- 语音: OpenAI Whisper v2（字幕提取）
- SDK: Vercel AI SDK v3（流式输出统一封装）

### 安全层
- 认证: NextAuth.js v5（JWT + OAuth2.0）
- 加密: bcrypt v12 + AES-256-GCM
- 防护: Arcjet（Rate Limit + Bot Protection + Shield）
- 文件安全: 类型白名单 + 病毒扫描（VirusTotal API）
- CORS: 严格白名单域名策略
- CSP: Content-Security-Policy 严格模式
- 审计日志: 所有敏感操作记录

### 支付层
- 国内: 微信支付V3 + 支付宝 SDK
- 国际: Stripe（订阅+一次性）
- 虚拟货币: 积分系统（服务端原子操作，防并发扣减）

### 部署层
- 前端: Vercel（Edge Runtime）
- 后端服务: Railway（Docker容器）
- 数据库: Supabase PostgreSQL / Neon（Serverless）
- CDN: Cloudflare（全球加速 + DDoS防护）
- 监控: Sentry + BetterStack（日志）+ Vercel Analytics
- CI/CD: GitHub Actions（lint → test → build → deploy）
```

---

## 二、设计系统提示词

```
## BitNook 设计语言规范

### 品牌色彩体系
:root {
  /* 主背景 - 深宇宙黑 */
  --bg-primary: #080B14;
  --bg-secondary: #0D1117;
  --bg-card: #111827;
  --bg-card-hover: #1A2235;

  /* 品牌色 - 星云紫蓝渐变 */
  --brand-primary: #6366F1;     /* Indigo */
  --brand-secondary: #8B5CF6;   /* Violet */
  --brand-accent: #06B6D4;      /* Cyan */
  --brand-gradient: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%);

  /* 功能色 */
  --color-gold: #F59E0B;        /* 积分/VIP金色 */
  --color-success: #10B981;     /* 成功绿 */
  --color-warning: #F59E0B;     /* 警告橙 */
  --color-danger: #EF4444;      /* 危险红 */
  --color-info: #3B82F6;        /* 信息蓝 */

  /* 文字层级 */
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #475569;
  --text-link: #818CF8;

  /* 边框 */
  --border-default: rgba(99, 102, 241, 0.15);
  --border-hover: rgba(99, 102, 241, 0.4);
  --border-focus: rgba(99, 102, 241, 0.8);

  /* 分类色标 */
  --cat-daily: #3B82F6;         /* 日常 - 蓝 */
  --cat-finance: #10B981;       /* 财务 - 绿 */
  --cat-health: #EF4444;        /* 健康 - 红 */
  --cat-convert: #F59E0B;       /* 转换 - 金 */
  --cat-network: #8B5CF6;       /* 网络 - 紫 */
  --cat-ai: #06B6D4;            /* AI - 青 */
  --cat-game: #EC4899;          /* 游戏 - 粉 */
}

### 玻璃拟态卡片规范
.glass-card {
  background: rgba(17, 24, 39, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(26, 34, 53, 0.9);
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
}

### 动效规范
- 页面切换: Framer Motion layoutId 共享动画
- 卡片进入: staggerChildren 0.05s 错落入场
- 工具加载: 骨架屏 → 内容淡入（300ms）
- 按钮反馈: scale(0.97) 按压感
- 积分变化: 数字滚动动画（countUp）
- 游戏特效: Canvas/CSS 粒子效果

### 响应式断点
- xs: 375px（手机竖屏）
- sm: 640px（手机横屏）
- md: 768px（平板）
- lg: 1024px（小桌面）
- xl: 1280px（标准桌面）
- 2xl: 1536px（大屏）

### 首页布局节奏
Hero（品牌入口）
→ 工具分类导航（Tab + 图标）
→ 精选工具网格（响应式 2/3/4列）
→ 游戏专区（横向轮播）
→ VIP会员横幅（渐变背景）
→ 今日签到 + 积分榜单（侧边或底部）
→ 广告位（原生风格）
→ Footer
```

---

## 三、完整路由与页面结构

```
## 路由设计

### 公开页面
/                          → 首页（工具大厅 + 游戏入口）
/tools                     → 工具总览（搜索 + 筛选）
/games                     → 游戏大厅

### 工具分类页（6类）
/tools/daily               → 日常工具（8个）
/tools/finance             → 财务工具（8个）
/tools/health              → 健康工具（8个）
/tools/convert             → 格式转换（6个）
/tools/network             → 网络工具（8个）
/tools/ai                  → AI工具（6个，VIP专属）

### 工具详情页（44+个，统一模板）
/tools/[category]/[slug]

### 游戏页面（8个）
/games/tetris              → 俄罗斯方块
/games/minesweeper         → 扫雷
/games/snake               → 贪吃蛇
/games/gomoku              → 五子棋
/games/match3              → 消消乐
/games/chess-international → 国际象棋
/games/chess-chinese       → 中国象棋
/games/freecell            → 空当接龙

### 用户系统
/auth/login                → 登录（含OAuth + 手机号）
/auth/register             → 注册（邮箱/手机）
/auth/forgot-password      → 忘记密码
/dashboard                 → 用户中心总览
/dashboard/points          → 积分流水
/dashboard/achievements    → 成就/战绩
/dashboard/orders          → 订单记录
/dashboard/settings        → 个人设置

### 会员与支付
/pricing                   → 定价页（对比表格）
/checkout/[plan]           → 结账页
/checkout/success          → 支付成功

### 后台管理（鉴权：admin角色）
/admin                     → 总览仪表盘
/admin/users               → 用户管理
/admin/tools               → 工具管理（开关/积分配置）
/admin/games               → 游戏管理
/admin/orders              → 订单/退款管理
/admin/points              → 积分规则配置
/admin/ads                 → 广告位管理
/admin/analytics           → 数据分析
/admin/settings            → 系统配置
/admin/logs                → 审计日志

### API路由
/api/auth/[...nextauth]    → NextAuth
/api/trpc/[trpc]           → tRPC 端点
/api/webhooks/stripe       → Stripe 回调
/api/webhooks/wechat       → 微信支付回调
/api/webhooks/alipay       → 支付宝回调
/api/network/[tool]        → 网络工具（服务端执行）
/api/ai/[tool]             → AI工具（流式输出）
```

---

## 四、工具模块详细提示词

### 4.1 日常工具（8个）

```
## 日常工具开发规范

### ⏱️ 计时器（/tools/daily/timer）
功能：
  - 多任务并行计时（最多8个）
  - 每个任务独立标签/颜色
  - 开始/暂停/重置/删除
  - 累计时间统计 + 导出记录
  - 支持番茄钟模式（25+5分钟）
  - 到时浏览器通知（Web Notifications API）
技术：useReducer管理多计时器状态，requestAnimationFrame精度计时

### ⏳ 倒计时（/tools/daily/countdown）
功能：
  - 设置目标日期时间（日历选择器）
  - 实时显示天/时/分/秒
  - 多个倒计时同时展示（如节假日、生日、活动）
  - 自定义背景图/标签
  - 结束时烟花动画（canvas-confetti）
  - 分享倒计时链接（URL含参数）

### 🎁 抽奖（/tools/daily/lottery）
功能：
  - 名单录入（文本粘贴/Excel导入）
  - 一等奖/二等奖/三等奖分级设置
  - 抽奖动画（转盘 + 滚屏两种模式）
  - 防重复抽取开关
  - 结果导出（PNG截图/CSV）
  - 自定义品牌LOGO和背景
技术：lodash.shuffle + CSS 3D rotateY 转盘动画

### 🔐 密码生成（/tools/daily/password）
功能：
  - 长度: 4-128位（滑块控制）
  - 字符集: 大小写/数字/符号/排除歧义字符
  - 强度可视化（zxcvbn评分 0-4）
  - 批量生成（最多100条）
  - 自定义规则模板（如 公司密码策略）
  - 一键复制 + 历史记录（sessionStorage）
安全：Web Crypto API (crypto.getRandomValues) 生成，绝不发服务器

### 📊 文字统计（/tools/daily/word-count）
功能：
  - 实时统计：字数/字符数/行数/段落数
  - 阅读时间估算（200字/分钟）
  - 关键词频率排行（Top 20）
  - 中英文分别统计
  - 去除多余空格/格式化
  - 与TXT/MD文件互转

### 📅 日期计算（/tools/daily/date-calc）
功能：
  - 两日期间距（精确到天/周/月/年）
  - 指定天数后的日期推算
  - 工作日计算（排除法定节假日API）
  - 年龄计算（含生肖/星座/星期）
  - 日历视图展示区间

### ⏲️ 秒表（/tools/daily/stopwatch）
功能：
  - 毫秒精度显示
  - 多圈计时（lap）记录
  - 最快圈/最慢圈高亮
  - 计时数据导出CSV
  - 键盘快捷键（空格开始/暂停，L记录圈）

### 🌍 世界时钟（/tools/daily/world-clock）
功能：
  - 搜索添加城市（支持100+时区）
  - 模拟时钟 + 数字时钟双模式
  - 拖拽排序城市列表
  - 会议时间规划（多时区对照表）
  - 夏令时自动处理（date-fns-tz）
  - 显示城市天气（OpenWeatherMap API）
```

### 4.2 财务工具（8个）

```
## 财务工具开发规范

### 🏠 房贷计算（/tools/finance/mortgage）
功能：
  - 还款方式：等额本息 vs 等额本金（双模式对比）
  - 输入：贷款金额/年限/年利率（LPR联动）
  - 输出：月供/总利息/总还款额
  - ECharts可视化：
    - 月供本金/利息占比面积图
    - 还款进度环形图
    - 本金/利息比例随时间变化折线
  - 提前还款模拟（部分提前还款节省分析）
  - 公积金/商业贷款组合计算
  - 结果一键分享（生成PNG长图）

### 💱 汇率转换（/tools/finance/exchange）
功能：
  - 实时汇率（ExchangeRate-API / Open Exchange Rates）
  - 支持150+货币 + 常用加密货币（BTC/ETH/USDT）
  - 历史汇率图（30天/90天/1年）
  - 多货币同时换算（基准货币1对多）
  - 汇率提醒（目标价格触达通知）
  - 数据刷新频率：1小时缓存（Redis）

### 🧓 退休计算（/tools/finance/retirement）
功能：
  - 按最新延迟退休政策（2025年起渐进式）
  - 输入：出生年月/性别/参保年限
  - 输出：法定退休时间/预计退休金
  - 养老金替代率分析
  - 自愿延迟退休收益对比
  - 政策更新联动（CMS配置化）

### 📈 复利计算（/tools/finance/compound）
功能：
  - 本金/年化收益率/年数/计息频率
  - 定期追加投资模拟
  - 最终金额 + 总收益 + 收益率
  - 与通胀对比（实际购买力）
  - ECharts指数增长曲线图
  - 与银行存款/国债/股市平均收益对比

### 💼 工资计算（/tools/finance/salary）
功能：
  - 税前 → 税后 双向计算
  - 2024年最新个税算法（7级累进税率）
  - 五险一金自动扣除（各城市费率）
  - 年终奖专项计算（单独计税 vs 合并计税对比）
  - 到手工资条PDF导出

### 💳 存款计算（/tools/finance/deposit）
功能：
  - 活期/定期/大额存单/国债
  - 银行利率实时对比（数据爬取或人工维护）
  - 阶梯存款策略（流动性优化）
  - 到期收益明细表

### 🏦 贷款比价（/tools/finance/loan-compare）
功能：
  - 同时对比最多5个贷款方案
  - 综合对比：总利息/月供/手续费
  - 实际年化利率(IRR)计算
  - 可视化蜘蛛图（多维评分）

### 💹 投资回报（/tools/finance/roi）
功能：
  - ROI / IRR / NPV 计算
  - 投资组合回测（输入历史数据）
  - 不同资产类别收益比较
  - 通胀调整后的真实回报
```

### 4.3 健康工具（8个）

```
## 健康工具开发规范

### ⚖️ BMI计算（/tools/health/bmi）
功能：
  - 输入：身高/体重/年龄/性别
  - 输出：BMI值 + WHO/亚洲标准分级
  - 可视化：人体轮廓图（SVG，按BMI填充色）
  - 理想体重范围 + 需减/增体重计算
  - 体脂率估算（BMI-体脂率公式）
  - 健康建议（基于等级）

### ❤️ 心率计算（/tools/health/heart-rate）
功能：
  - 最大心率计算（多种公式对比）
  - 5个心率训练区间（燃脂/有氧/无氧等）
  - 运动目标心率范围
  - 静息心率健康评估
  - 可视化：心率区间横向条形图
  - 实时心跳动画可视化

### 🔥 卡路里（/tools/health/calories）
功能：
  - 基础代谢（BMR）：Harris-Benedict / Mifflin-St Jeor
  - 每日总消耗（TDEE）：活动系数选择
  - 减脂/增肌目标热量计算
  - 三大营养素分配比例
  - 常见食物热量数据库（搜索查询）
  - 运动消耗热量估算

### 💧 饮水量（/tools/health/water-intake）
功能：
  - 输入：体重/运动强度/气候/季节
  - 输出：每日建议饮水量
  - 饮水提醒时间表（可下载日历事件）
  - 饮水记录追踪（localStorage）
  - 进度环形图动画

### 😴 睡眠计算（/tools/health/sleep）
功能：
  - 基于睡眠周期（90分钟/周期）
  - 输入起床时间 → 输出最佳入睡时间（多个选项）
  - 或输入入睡时间 → 输出最佳起床时间
  - 睡眠债务计算
  - 各年龄段推荐睡眠时长
  - 改善睡眠的Tips

### 👟 步数目标（/tools/health/steps）
功能：
  - 基于年龄/身高/体重的个性化步数目标
  - 步数 → 距离/卡路里/活动时间换算
  - 10000步目标的实际意义分析
  - 每周步数计划生成

### 💓 心脏年龄（/tools/health/heart-age）
功能：
  - 基于Framingham量表的心脏年龄评估
  - 输入：年龄/性别/血压/胆固醇/吸烟/糖尿病
  - 输出：心脏年龄 + 10年心血管风险
  - 改善建议（可降低几岁）
  - 趋势追踪（保存历史记录）

### 🩺 血压评估（/tools/health/blood-pressure）
功能：
  - 输入收缩压/舒张压
  - WHO血压分级（正常/高血压前期/各期高血压）
  - 可视化：血压分布图（用户值标注）
  - 历史血压记录（折线趋势图）
  - 注意事项与就医建议
  - 免责声明（仅供参考，不替代医疗诊断）
```

### 4.4 格式转换（6个）

```
## 格式转换工具规范

### 📐 单位转换（/tools/convert/unit）
类别：长度/面积/体积/重量/温度/速度/压力/能量/功率/数据存储
功能：
  - 一对多换算（输入一个，显示所有单位）
  - 常用单位收藏
  - 历史转换记录
  - 精度位数控制

### 🔢 进制转换（/tools/convert/radix）
支持：2进制/8进制/10进制/16进制 互转
功能：
  - 输入自动识别进制
  - 一键切换，实时转换
  - 负数/浮点数支持
  - 颜色HEX与十进制互转

### #️⃣ Hash生成（/tools/convert/hash）
算法：MD5 / SHA-1 / SHA-256 / SHA-512 / CRC32 / HMAC
功能：
  - 文本Hash + 文件Hash（纯前端Web Crypto API）
  - 大文件分块处理（流式读取）
  - Hash比对验证
  - Base64编解码
安全：纯客户端计算，文件不上传服务器

### 📱 二维码（/tools/convert/qrcode）
功能：
  - 生成：文本/URL/WiFi/名片(vCard)/邮件
  - 自定义：颜色/Logo/圆角/纠错级别
  - 批量生成（CSV导入）
  - 解析二维码（上传图片识别）
  - 导出PNG/SVG/PDF
技术：qrcode.js 生成，jsQR / ZXing 识别

### 🎨 颜色转换（/tools/convert/color）
功能：
  - HEX ↔ RGB ↔ HSL ↔ HSV ↔ CMYK ↔ LAB 互转
  - 颜色选择器（拾色器）
  - 调色板生成（互补/类似/三角配色）
  - CSS渐变代码生成
  - 图片取色（上传图片后点击取色）
  - 品牌色库收藏

### 🕐 时间戳（/tools/convert/timestamp）
功能：
  - Unix时间戳 ↔ 日期时间 互转
  - 毫秒/秒/微秒 选择
  - 时区选择（当前时区/UTC/自定义）
  - 常用时间戳（今天0点/1小时后等）
  - 时间差计算
  - 当前时间戳实时显示
```

### 4.5 网络工具（8个）

```
## 网络工具开发规范
注意：网络工具均需在服务端API Routes执行，前端只负责展示

### 🔍 IP归属查询（/tools/network/ip-lookup）
功能：
  - 自动获取当前IP
  - 查询任意IP：运营商/城市/经纬度/ASN/时区
  - 数据来源：ip-api.com + ipinfo.io（双源互备）
  - 地图标注（Leaflet.js 轻量地图）
  - IPv4/IPv6 双栈支持
  - 批量查询（最多20个IP）

### 🌐 DNS查询（/tools/network/dns）
功能：
  - 查询类型：A/AAAA/MX/CNAME/TXT/NS/SOA/PTR
  - 多DNS服务器对比（Google/Cloudflare/国内114/腾讯）
  - DNS传播检测（全球节点）
  - 解析结果TTL显示
  - 使用 dns.Resolver (Node.js) 实现

### 📶 网速测试（/tools/network/speed-test）
功能：
  - 下载速度 + 上传速度 + 延迟(Ping) + 抖动(Jitter)
  - 进度圆形仪表盘动画
  - 测速节点选择（多CDN节点）
  - 历史测速记录（localStorage）
  - 分享测速结果截图
技术：librespeed.js 开源测速库

### 📡 Ping测试（/tools/network/ping）
功能：
  - 输入域名/IP，服务端执行ping
  - 实时显示每次RTT
  - 统计：最小/最大/平均延迟/丢包率
  - 延迟折线图实时更新（WebSocket推送）
  - 多目标同时ping对比

### 🚪 端口扫描（/tools/network/port-scan）
功能：
  - 扫描常用端口（仅限用户输入的IP/域名）
  - 预设端口组：Web/数据库/邮件/游戏
  - 服务名称识别（22→SSH, 80→HTTP等）
  - 速率限制（防止滥用）
  - 仅允许扫描公网IP（禁止私有地址段）
安全提示：明显展示"仅用于检测自己服务器"声明

### 📶 WiFi信息（/tools/network/wifi-info）
功能：
  - 显示当前网络信息（Network Information API）
  - 连接类型/有效类型/下行速度/往返时间
  - WiFi二维码生成（快速分享密码）
  - 网络质量评分

### ✅ HTTP检测（/tools/network/http-check）
功能：
  - 检测URL的HTTP状态码/响应时间/头信息
  - 重定向链路追踪
  - 响应头安全评分（HSTS/CSP/X-Frame等）
  - 自定义请求头/方法(GET/POST)
  - 返回内容大小/类型

### 🔒 SSL检测（/tools/network/ssl-check）
功能：
  - SSL证书有效期/颁发机构/域名匹配
  - TLS版本和加密套件
  - 安全评级（A+/A/B/C）
  - 证书链完整性验证
  - 到期提醒天数高亮
  - 使用 tls.connect (Node.js) 实现
```

### 4.6 AI工具（6个，VIP专属）

```
## AI工具开发规范
所有AI工具需：
1. 积分验证（请求前服务端扣减，失败退还）
2. 流式输出（Vercel AI SDK streamText）
3. 内容安全过滤（输入/输出双向审核）
4. 处理超时（30s限制，队列异步处理大文件）

### 📋 简历优化（/tools/ai/resume）
功能：
  - 上传简历（PDF/DOCX，服务端mammoth/pdf-parse解析）
  - 职位JD输入（可选，针对性优化）
  - AI输出：逐段修改建议 + 整体评分 + 一键应用
  - 多种风格：正式/科技/创意
  - Word模板导出（docx.js生成）
积分：150积分/次

### 📝 文章摘要（/tools/ai/summarize）
功能：
  - 输入：文章URL / 粘贴文本 / 上传PDF
  - URL抓取：Jina Reader API / Firecrawl（反爬处理）
  - 摘要长度选择：50/100/200字
  - 摘要风格：学术/商务/口语化
  - 关键点提取（结构化Bullet Points）
  - 多语言摘要（自动识别原文语言）
积分：20积分/次

### 🌐 智能翻译（/tools/ai/translate）
功能：
  - 支持100+语言互译
  - 普通翻译（DeepL API）
  - AI专业翻译：法律/医疗/技术/文学 专业语境
  - 文档翻译（保持格式，Word/PDF输入输出）
  - 双语对照显示
  - 术语表管理（VIP用户）
积分：文本免费 / 文档翻译 50积分/页

### 🎬 短视频脚本（/tools/ai/video-script）
功能：
  - 输入：主题/产品/目标受众/视频时长(15s/30s/60s/3min)
  - 输出：完整脚本（开头钩子/正文/CTA结尾）
  - 平台适配：抖音/小红书/YouTube/B站 风格差异
  - 配套文案：标题/话题标签/封面文字建议
  - 一键生成多个版本（A/B对比）
积分：50积分/次

### ✉️ 邮件生成（/tools/ai/email）
功能：
  - 场景模板：商务洽谈/求职/客户投诉/感谢信等
  - 输入：关键信息点（收件人/目的/背景）
  - 输出：完整邮件（主题+正文+签名）
  - 语气调整：正式/友好/强硬
  - 多语言邮件（中/英/日等）
  - 一键复制到Gmail/Outlook（剪贴板API）
积分：30积分/次

### ✨ AI取名（/tools/ai/naming）
功能：
  - 类型：人名/公司名/产品名/品牌名/宠物名
  - 输入：期望寓意/行业/风格/字数限制
  - 输出：10个备选名 + 每个含义解析
  - 中文名：含笔画/五行/音韵分析
  - 英文名：含发音/来源/流行度
  - 收藏对比功能
积分：30积分/次
```

---

## 五、游戏模块提示词（8款）

```
## 游戏开发规范

### 通用要求
- 纯前端实现（Canvas + TypeScript 或纯CSS/DOM）
- 响应式（手机触控 + 键盘/鼠标 双适配）
- 统一积分接入：游戏结束后调用 /api/points/game-reward
- 战绩保存：localStorage（未登录）+ 数据库（已登录）
- 暂停/继续/重新开始（ESC键）
- 全局排行榜（Top 10，实名/匿名可选）

### 积分奖励规则
游戏通关或达到条件：+10积分（每日每游戏上限）
挑战特殊成就：+15积分（如扫雷专家模式通关）
刷新个人最高分：+5积分

---

### 🧱 俄罗斯方块（/games/tetris）
核心机制：
  - 标准7种方块（I/O/T/S/Z/J/L）+ 幽灵方块预览
  - 下一个方块预览（3个）+ Hold功能
  - 旋转系统：Super Rotation System (SRS)
  - T-Spin / 四消（Tetris）特殊得分
  - 速度随等级提升
  - 软降/硬降（↓ / 空格）
积分：消除4行以上 +10积分

### 💣 扫雷（/games/minesweeper）
难度级别：
  - 初级 9×9 10雷
  - 中级 16×16 40雷
  - 高级 30×16 99雷
  - 自定义（最大50×50）
功能：
  - 右键插旗/问号
  - 数字/空白区域自动展开
  - 首次点击保证安全
  - 完成时间计时 + 历史最佳
  - 3BV效率评分
积分：高级模式通关 +15积分

### 🐍 贪吃蛇（/games/snake）
功能：
  - 方向键/WASD控制
  - 食物类型：普通(+1)/加速食物/长度-1的特殊食物
  - 速度随长度增加
  - 障碍物模式（高级）
  - 手机端：虚拟方向键（D-Pad）
积分：长度超过30 +10积分

### ⬤ 五子棋（/games/gomoku）
模式：
  - 双人对弈（同屏）
  - vs AI（Minimax + Alpha-Beta剪枝，3难度）
  - 在线联机（WebSocket，匹配等待室）
功能：
  - 禁手规则（黑棋）可开关
  - 悔棋功能
  - 棋局记录（可下载SGF格式）
  - 胜利连珠高亮动画
积分：AI中级以上获胜 +10积分

### 🎮 消消乐（/games/match3）
机制：
  - 8×8 网格，至少3消
  - 特殊方块：4消→炸弹，5消→彩虹球，L/T消→火箭
  - 连击倍数加成
  - 关卡目标（分数/消除特定颜色/限步数）
  - 30个内置关卡
技术：Canvas 2D渲染，方块下落物理感动画
积分：通关新关卡 +10积分

### ♟️ 国际象棋（/games/chess-international）
功能：
  - 完整规则（易位/吃过路兵/升变）
  - AI对手（chess.js + stockfish.js WASM）
  - 3难度：初级ELO~800 / 中级~1200 / 高级~1600
  - 合法走法高亮提示
  - 棋谱记录（PGN格式）
  - 双人对弈模式
积分：AI中级以上获胜 +10积分

### 車 中国象棋（/games/chess-chinese）
功能：
  - 完整规则（将军/长将判负/困毙）
  - AI对手（中国象棋引擎WASM）
  - 传统/简约两种棋盘皮肤
  - 走法提示 + 棋谱记录（CHN格式）
  - 双人对弈（同屏翻转棋盘）
积分：AI中级以上获胜 +10积分

### 🃏 空当接龙（/games/freecell）
功能：
  - 标准52张牌 + 4个空列 + 4个目标列
  - 自动移牌（可移堆计算）
  - 提示功能（高亮可操作牌）
  - 撤销（无限制）
  - 统计：胜率/最短时间/最少步数
  - 编号局（输入编号重现同一局）
积分：完成一局 +10积分
```

---

## 六、积分与会员系统提示词

```
## 积分系统设计

### Prisma Schema（积分相关）
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  phone         String?  @unique
  passwordHash  String?
  name          String?
  avatar        String?
  role          Role     @default(USER)
  memberTier    MemberTier @default(FREE)
  memberExpiry  DateTime?
  points        Int      @default(0)
  totalEarned   Int      @default(0)  // 历史总获得
  totalSpent    Int      @default(0)  // 历史总消耗
  lastSignIn    DateTime?             // 最近签到
  signInStreak  Int      @default(0)  // 连续签到天数
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  pointsLogs    PointsLog[]
  gameRecords   GameRecord[]
  orders        Order[]
}

model PointsLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(...)
  delta       Int                    // 正数=获得，负数=消耗
  balance     Int                    // 操作后余额快照
  type        PointsType             // 枚举
  description String
  refId       String?                // 关联ID（订单/工具使用记录等）
  createdAt   DateTime @default(now())
}

enum PointsType {
  REGISTER           // 注册奖励 +100
  DAILY_SIGN         // 每日签到 +10
  STREAK_BONUS       // 连续签到奖励（7天+50，30天+200）
  GAME_REWARD        // 游戏奖励 +10/+15
  WATCH_AD           // 观看广告 +5
  INVITE_USER        // 邀请注册 +200
  PURCHASE           // 充值购买
  TOOL_USE           // 使用AI工具消耗
  REFUND             // 退款退还
  ADMIN_ADJUST       // 管理员手动调整
}

### 积分获取规则
| 行为 | 积分 | 限制 |
|------|------|------|
| 注册 | +100 | 仅一次 |
| 每日签到 | +10 | 每天一次 |
| 7天连续签到 | 额外+50 | — |
| 30天连续签到 | 额外+200 | — |
| 游戏达成 | +10~+15 | 每日每游戏上限1次 |
| 观看广告 | +5/次 | 每日最多+50 |
| 邀请好友注册 | +200 | 无上限 |
| 充值（积分包）| 1元=10积分 | — |

### 积分消耗规则（AI工具）
| 工具 | 消耗 |
|------|------|
| 简历优化 | 150积分 |
| 短视频脚本 | 50积分 |
| 文章摘要 | 20积分 |
| AI取名 | 30积分 |
| 邮件生成 | 30积分 |
| 文档翻译（每页）| 50积分 |

### 防刷机制
- 积分操作：服务端原子事务（PostgreSQL transaction）
- 观看广告：服务端Token验证（广告平台回调校验）
- 游戏积分：结算时验证游戏时长（防速通作弊）
- 邀请：检测设备指纹 + IP，防同人多号

### 会员等级
FREE（免费）:
  - 44个普通工具无限使用
  - AI工具每日5积分赠送
  - 含广告展示
  - 游戏积分正常获取

PRO（¥29/月 | ¥199/年）:
  - 全部工具无限使用
  - 每月赠送500积分
  - 去除广告
  - AI任务优先队列
  - 历史记录保存（90天）
  - 文件大小上限提升（50MB）

TEAM（¥99/月，最多5人）:
  - PRO全部权益
  - 每月2000积分（共享池）
  - 团队工作空间
  - API调用权限（100次/天）

### 积分包（一次性充值）
¥6  → 100积分
¥28 → 500积分（+50赠）
¥88 → 2000积分（+200赠）
¥198 → 5000积分（+1000赠）
```

---

## 七、后台管理系统提示词

```
## Admin Dashboard

### 技术选型
- 路由：/admin/** 独立 layout
- 权限：Middleware + RBAC（super_admin/ops_admin/finance_admin）
- 图表：Apache ECharts v5（丰富图表类型）
- 表格：TanStack Table v8（排序/筛选/虚拟滚动）
- 导出：ExcelJS（报表导出）

### 总览仪表盘（实时刷新30s）
核心指标卡片（4个）：
  - 今日新增用户 + 环比↑↓
  - 今日收入（元）+ 环比
  - 活跃用户（DAU）
  - AI工具调用次数

图表模块：
  1. 用户增长折线（日/周/月 切换，新增+累计双轴）
  2. 收入构成饼图（会员/积分充值/广告分成 占比）
  3. 工具使用热力图（周×小时，流量分布）
  4. 游戏活跃度排行（横向条形图）
  5. 用户漏斗：访问→注册→首次使用工具→付费转化
  6. 地域分布（中国省份热力地图）

### 用户管理（/admin/users）
列表：ID/昵称/邮箱/会员等级/积分/注册时间/最后登录/状态
操作：
  - 搜索（关键词/邮箱/手机）+ 筛选（会员/状态/时间）
  - 查看详情（完整操作日志/工具使用/消费历史）
  - 调整会员/积分（附备注，记入审计日志）
  - 封号/解封/重置密码
  - 批量操作（最多500条）
  - 导出CSV（GDPR合规，脱敏处理）

### 工具管理（/admin/tools）
功能：
  - 工具列表（名称/分类/状态/今日调用量/积分消耗配置）
  - Feature Flag：一键上下线（无需发版）
  - 积分定价实时调整
  - 工具异常监控（错误率>5%自动告警）
  - 新工具申请审核流程

### 游戏管理（/admin/games）
功能：
  - 各游戏在线人数/今日游玩次数
  - 游戏排行榜管理（清除/屏蔽作弊用户）
  - 积分奖励规则配置

### 订单管理（/admin/orders）
列表：订单号/用户/商品/金额/支付方式/状态/时间
操作：
  - 退款处理（支付宝/微信/Stripe 退款API）
  - 对账报表（按日/月导出）
  - 异常订单标记与跟进

### 积分管理（/admin/points）
功能：
  - 积分规则配置（签到/广告/游戏等面值实时调整）
  - 积分发放记录
  - 批量发积分（营销活动用）
  - 积分异常检测（刷分行为预警）

### 广告位管理（/admin/ads）
功能：
  - 广告位配置（尺寸/位置/展示优先级）
  - 第三方广告代码管理（AdSense/百度联盟）
  - 观看积分广告配置（视频URL/积分值/每日上限）
  - 广告效果统计（展示次数/点击率/积分消耗量）
  - Pro用户广告屏蔽白名单管理

### 数据分析（/admin/analytics）
维度：
  - 用户留存率（D1/D7/D30 队列分析）
  - 工具/游戏偏好（人均使用工具数）
  - 付费转化分析（免费→Pro路径）
  - 积分生命周期（获取→消耗周期）
  - 异常行为检测（刷积分/异常高频请求）

### 审计日志（/admin/logs）
记录所有：
  - 管理员操作（改什么/改成什么/操作者/时间）
  - 用户敏感操作（登录/支付/重置密码）
  - API错误日志（分级：info/warn/error）
  - 保留90天
```

---

## 八、安全架构提示词

```
## BitNook 安全设计

### 认证体系
NextAuth.js v5 配置：
  providers:
    - Credentials（邮箱密码 / 手机验证码）
    - GitHub OAuth
    - Google OAuth
    - 微信OAuth（国内）

  session策略：JWT（Edge Runtime兼容）
  AccessToken: 15分钟
  RefreshToken: 30天（Redis存储，支持强制失效）

  安全增强：
  - 登录失败5次：锁定账户15分钟（Redis计数）
  - 新设备登录：邮件通知 + 验证码二次确认
  - 异地登录检测（IP地区变化超过500km）
  - 账号同时在线设备数限制（Free:2台，Pro:5台）

### API安全
Rate Limiting（Arcjet）：
  游客:  20次/分钟
  免费:  60次/分钟
  Pro:   300次/分钟
  Admin: 1000次/分钟
  AI工具: 额外限制（Free 10次/小时）

请求验证：
  - 所有API强制JSON Schema验证（Zod）
  - 文件上传：MIME检测 + 扩展名白名单 + 大小限制
    Free: 最大10MB，Pro: 最大50MB
  - 内容审核：AI输入/输出均经阿里云内容安全API

### 数据安全
存储加密：
  - 密码：bcrypt（rounds=12）
  - 手机号：AES-256-GCM加密存储
  - 支付卡信息：不存储（Stripe Token化）

传输安全：
  - HTTPS强制（HSTS max-age=31536000）
  - TLS 1.3
  - API Key 绝不下发客户端（服务端代理）

文件安全：
  - S3/R2 预签名URL（有效期15分钟）
  - 用户文件隔离（按userId前缀分目录）
  - 定期清理未完成上传的临时文件

隐私合规：
  - 隐私政策 + 用户协议（GDPR/个人信息保护法）
  - 账号注销：30天内彻底删除所有数据
  - 数据导出：用户可申请完整数据包

### 网络工具安全
端口扫描限制：
  - 禁止私有地址段（10.x/172.16.x/192.168.x/127.x）
  - 扫描速率严格限制（防被当作攻击工具）
  - 记录所有扫描请求日志

### 前端安全
- CSP：严格策略，禁止inline script（除Next.js必要）
- XSS：所有用户输入经 DOMPurify 清洗
- CSRF：NextAuth内置保护
- Clickjacking：X-Frame-Options: DENY
- 敏感页面：禁止缓存（Cache-Control: no-store）
```

---

## 九、国际化（i18n）提示词

```
## 中英文双语设计

### 技术方案
框架：next-intl
语言文件：/messages/zh.json + /messages/en.json
切换：Header 右上角语言Toggle，持久化到 Cookie
URL策略：不含语言前缀（通过Cookie识别）

### 翻译覆盖范围
- 所有UI文字（按钮/标签/提示/错误信息）
- 工具名称与描述
- 游戏说明
- 邮件模板
- 法律文件（隐私政策/用户协议）

### 特殊处理
- 数字格式：中文用 1,234.56；英文同
- 日期格式：中文 2024年1月1日；英文 Jan 1, 2024
- 货币：根据IP自动切换显示 ¥ / $（但结算统一CNY/USD）
- 工具单位：公制/英制选项（如BMI计算器中的cm/inch）

### 翻译Key命名规范
common.button.submit → 提交/Submit
tools.timer.title → 计时器/Timer
games.tetris.score → 分数/Score
auth.login.title → 登录/Sign In
```

---

## 十、广告系统提示词

```
## 广告位设计与实现

### 广告位规格
工具侧边栏（桌面端）：
  位置：工具主体右侧 sticky
  尺寸：300x600px（半页广告）
  可见：Free用户 / 游客

工具结果区顶部（移动端）：
  位置：结果展示区上方
  尺寸：320x100px（移动横幅）

首页工具列表间隔：
  原生广告卡片（与工具卡片同尺寸，标注"赞助"）

积分广告（全用户）：
  Modal形式，用户主动点击"看广告得积分"
  15~30秒视频广告
  服务端验证完成后发放积分

### 技术实现
<AdSlot 
  slot="sidebar-300x600"
  className="hidden xl:block"
  hideForPro={true}   // Pro用户自动隐藏
/>

广告组件逻辑：
1. 检查用户会员状态（Zustand store）
2. Pro用户：返回null，不渲染广告
3. 游客/Free用户：渲染 AdSense/百度联盟代码

积分广告防刷：
- 每次观看生成一次性Token（服务端）
- 广告SDK回调携带Token
- 服务端验证Token有效性 + 时间戳（不早于15s前）
- 每日每用户上限验证（Redis计数）
```

---

## 十一、数据库 Schema 总览

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 枚举
enum Role { USER ADMIN SUPER_ADMIN }
enum MemberTier { FREE PRO TEAM }
enum PointsType { REGISTER DAILY_SIGN STREAK_BONUS GAME_REWARD WATCH_AD INVITE_USER PURCHASE TOOL_USE REFUND ADMIN_ADJUST }
enum OrderStatus { PENDING PAID CANCELLED REFUNDED }
enum GameType { TETRIS MINESWEEPER SNAKE GOMOKU MATCH3 CHESS_INT CHESS_CN FREECELL }

model User {
  id            String     @id @default(cuid())
  email         String?    @unique
  phone         String?    @unique
  passwordHash  String?
  name          String?
  avatar        String?
  role          Role       @default(USER)
  memberTier    MemberTier @default(FREE)
  memberExpiry  DateTime?
  points        Int        @default(0)
  totalEarned   Int        @default(0)
  totalSpent    Int        @default(0)
  lastSignIn    DateTime?
  signInStreak  Int        @default(0)
  inviteCode    String     @unique @default(cuid())
  invitedBy     String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  pointsLogs    PointsLog[]
  gameRecords   GameRecord[]
  orders        Order[]
  sessions      UserSession[]
}

model PointsLog {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  delta       Int
  balance     Int
  type        PointsType
  description String
  refId       String?
  createdAt   DateTime   @default(now())

  @@index([userId, createdAt])
}

model GameRecord {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  gameType  GameType
  score     Int
  duration  Int      // 秒
  level     Int?
  metadata  Json?    // 游戏特有数据（难度/模式等）
  createdAt DateTime @default(now())

  @@index([gameType, score(sort: Desc)])
}

model Order {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  orderNo       String      @unique @default(cuid())
  productType   String      // MEMBER_PRO/MEMBER_TEAM/POINTS_100 等
  amount        Int         // 分（人民币）
  currency      String      @default("CNY")
  status        OrderStatus @default(PENDING)
  paymentMethod String?     // wechat/alipay/stripe
  paymentId     String?     // 三方支付订单号
  pointsGiven   Int?        // 充值赠送积分数
  refundAt      DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([userId, createdAt])
}

model ToolUsageLog {
  id        String   @id @default(cuid())
  userId    String?
  ip        String
  toolSlug  String
  duration  Int?     // ms
  success   Boolean
  error     String?
  createdAt DateTime @default(now())

  @@index([toolSlug, createdAt])
}

model UserSession {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  deviceInfo   String?
  ip           String?
  location     String?
  createdAt    DateTime @default(now())
  expiresAt    DateTime
}

model SystemConfig {
  key       String @id
  value     String
  updatedAt DateTime @updatedAt
}
```

---

## 十二、项目初始化提示词

```bash
# 项目初始化命令序列
npx create-next-app@latest bitnook \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd bitnook

# 核心依赖
pnpm add @prisma/client prisma \
  next-auth@beta \
  @auth/prisma-adapter \
  zustand \
  @tanstack/react-query \
  axios \
  react-hook-form \
  @hookform/resolvers \
  zod \
  framer-motion \
  next-intl \
  lucide-react \
  clsx \
  tailwind-merge \
  date-fns \
  date-fns-tz

# AI/文件处理
pnpm add ai \
  openai \
  @anthropic-ai/sdk \
  mammoth \
  pdf-parse \
  sharp \
  qrcode \
  jsqr \
  zxcvbn

# 支付
pnpm add stripe

# 工具函数
pnpm add decimal.js \
  big.js \
  dayjs \
  canvas-confetti \
  echarts \
  recharts

# 安全
pnpm add bcryptjs \
  @arcjet/next \
  dompurify \
  isomorphic-dompurify

# 开发依赖
pnpm add -D \
  @types/bcryptjs \
  @types/dompurify \
  vitest \
  @playwright/test \
  prettier \
  eslint-config-prettier

# shadcn/ui 初始化
npx shadcn-ui@latest init

# Prisma 初始化
npx prisma init
```

---

## 十三、目录结构

```
bitnook/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/
│   │   │   ├── layout.tsx          # 主布局（Header + Footer）
│   │   │   ├── page.tsx            # 首页
│   │   │   ├── tools/
│   │   │   │   ├── page.tsx        # 工具总览
│   │   │   │   ├── [category]/
│   │   │   │   │   ├── page.tsx    # 分类页
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx # 工具详情
│   │   │   ├── games/
│   │   │   │   ├── page.tsx        # 游戏大厅
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx    # 游戏页面
│   │   │   ├── pricing/
│   │   │   └── dashboard/
│   │   ├── admin/
│   │   │   ├── layout.tsx          # 后台布局
│   │   │   ├── page.tsx            # 总览
│   │   │   ├── users/
│   │   │   ├── tools/
│   │   │   ├── games/
│   │   │   ├── orders/
│   │   │   ├── points/
│   │   │   ├── ads/
│   │   │   ├── analytics/
│   │   │   └── logs/
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── trpc/[trpc]/
│   │       ├── webhooks/
│   │       │   ├── stripe/
│   │       │   ├── wechat/
│   │       │   └── alipay/
│   │       ├── network/            # 网络工具API
│   │       ├── ai/                 # AI工具API（流式）
│   │       └── points/
│   ├── components/
│   │   ├── ui/                     # shadcn组件
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── AdSlot.tsx
│   │   ├── tools/
│   │   │   ├── ToolCard.tsx
│   │   │   ├── ToolLayout.tsx      # 工具页统一布局
│   │   │   ├── PointsGate.tsx      # 积分不足拦截
│   │   │   └── [tool-components]/
│   │   ├── games/
│   │   │   ├── GameLayout.tsx
│   │   │   ├── GameLeaderboard.tsx
│   │   │   └── [game-components]/
│   │   ├── points/
│   │   │   ├── PointsBadge.tsx
│   │   │   ├── SignInButton.tsx
│   │   │   └── WatchAdButton.tsx
│   │   └── admin/
│   ├── lib/
│   │   ├── db.ts                   # Prisma singleton
│   │   ├── redis.ts                # Upstash Redis
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── ai.ts                   # AI SDK封装
│   │   ├── points.ts               # 积分原子操作
│   │   ├── payment/
│   │   │   ├── stripe.ts
│   │   │   ├── wechat.ts
│   │   │   └── alipay.ts
│   │   └── utils/
│   ├── hooks/
│   │   ├── usePoints.ts
│   │   ├── useGameScore.ts
│   │   └── useSignIn.ts
│   ├── store/
│   │   ├── userStore.ts
│   │   ├── pointsStore.ts
│   │   └── i18nStore.ts
│   ├── types/
│   │   ├── tools.ts
│   │   ├── games.ts
│   │   └── api.ts
│   └── i18n/
│       ├── messages/
│       │   ├── zh.json
│       │   └── en.json
│       └── config.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── icons/
│   └── games/
├── tests/
│   ├── unit/
│   └── e2e/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docker-compose.yml
├── .env.example
└── package.json
```

---

## 十四、开发优先级与里程碑

```
## 开发路线图

### Phase 1 - MVP（4周）目标：上线可用版本
Week 1: 基础框架
  ✅ 项目初始化 + 设计系统
  ✅ 首页 + 分类页布局
  ✅ 认证系统（邮箱注册/登录）
  ✅ 数据库 Schema + 基础API

Week 2: 工具核心（纯前端工具优先）
  ✅ 日常工具全部8个
  ✅ 格式转换全部6个
  ✅ 健康工具全部8个

Week 3: 财务工具 + 游戏
  ✅ 财务工具全部8个
  ✅ 游戏：俄罗斯方块/贪吃蛇/扫雷/五子棋

Week 4: 积分 + 支付 + 发布
  ✅ 积分系统（签到/游戏奖励）
  ✅ 会员订阅（Stripe + 支付宝）
  ✅ 基础后台（用户/订单管理）
  ✅ Vercel 部署上线

### Phase 2 - v1.0（+3周）
  ✅ 网络工具全部8个
  ✅ 游戏：消消乐/国际象棋/中国象棋/空当接龙
  ✅ AI工具全部6个
  ✅ 广告系统接入
  ✅ 完整后台管理
  ✅ 中英文国际化

### Phase 3 - v2.0（+持续迭代）
  ✅ 在线联机游戏（五子棋/象棋）
  ✅ 工具API开放（Team会员）
  ✅ 移动端APP（Capacitor包壳）
  ✅ 数据分析深化
  ✅ 更多工具扩展（用户投票决定）
```

---

*BitNook 完整开发提示词手册 v1.0*  
*包含：7大功能板块 · 44+工具 · 8款游戏 · 完整商业系统*
