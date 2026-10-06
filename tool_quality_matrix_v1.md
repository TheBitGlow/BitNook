# BitNook V1.0 · 全量 35 个活跃工具质量矩阵 (Tool Quality Matrix)

> **评估基准版本**: BitNook V1.0 Product Rebuild  
> **生产部署环境**: Cloudflare Workers Edge (`https://bitnook.marmalade-thistle.workers.dev`)  
> **Worker Version ID**: `545f79a1-d476-4342-b3fc-b2f1cddd2010`  
> **唯一真实资产口径**: 35 Active Tools | 4 Deprecated Tools (307 Redirects) | 8 Classic Games | 6 Categories

---

## 一、质量评估标准体系

| 维度代码 | 评估维度 | 核心标准 |
| :--- | :--- | :--- |
| **D (Domain Purity)** | 纯函数与领域抽离 | 核心计算与业务规则 100% 抽取至 `src/core/tools/*`，无 UI 耦合，支持 Vitest 独立回归 |
| **M (Mathematical / Clinical)** | 法规与算法权威度 | 遵循国家法定标准与医学临床共识（如 2024 年法定退休改革、新版个税累计预扣、WS/T 428-2013、WHO 等） |
| **G (Edge Guards)** | 边界与异常防护 | 具备 NaN 防御、0% 利率除零保护、极值与非法字符熔断，拒绝假计算与白屏 |
| **P (Privacy & Storage)** | 隐私与数据安全 | 纯前端本地安全执行，0 PII 泄漏，多标签页 LocalStorage 状态广播同步 |
| **T (Theme & UX)** | 质感与双主题适配 | 默认亮色浅灰/象牙白底色，深色高对比度，消除硬编码 `#050811`，工作台布局清晰 |
| **S (SEO & Metadata)** | 检索与元数据完整性 | 独立精准的 SEO 标题、描述与关键词，标准化面包屑与快捷关联工具推荐 |

---

## 二、35 个活跃工具逐项评审矩阵

### 1. 财务工具 (Finance - 8 款)

| # | 工具名称 | 路由路径 | 领域模块 | 算法 / 临床基准 | 边界防范 (NaN/Zero) | 双主题适配 | 综合评级 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **房贷计算器** | `/tools/finance/mortgage` | `mortgage.ts` | 等额本息、等额本金、组合贷拆分、还款计划表 | 0% 利率守卫（退化为本金均摊），年限 NaN 兜底 | Design Tokens 适配 | **S (Flagship)** |
| 2 | **薪资个税计算器** | `/tools/finance/salary` | `salary.ts` | 居民个人综合所得 7 级超额累进税率、累计预扣法、五险一金上下限 | 负数收入拦截、社保基数超限截断、专项附加扣除溢出截断 | Design Tokens 适配 | **S (Flagship)** |
| 3 | **复利终值计算器** | `/tools/finance/compound` | `compound.ts` | 连续复利、定期定额追加、72 法则翻倍年限估算 | 0 利率防御、定投周期超范围归正、收益与本金图表拆解 | Design Tokens 适配 | **A** |
| 4 | **存款利息计算器** | `/tools/finance/deposit` | `deposit.ts` | 人民币 9 档基准与大额存单利率、到期一次还本付息 | 存款期限跨度校验、到期收益精确四舍五入 | Design Tokens 适配 | **A** |
| 5 | **参考汇率换算器** | `/tools/finance/exchange` | `exchange.ts` | 央行与外汇交易中心 CFETS 基准参考牌价 | 杜绝“实时”虚假宣传，标明基准汇率与免责声明 | Design Tokens 适配 | **A** |
| 6 | **多方案贷款比价** | `/tools/finance/loan-compare` | `loan-compare.ts` | 商业贷 vs 公积金 vs 组合贷横向多方案对比 | 利息差值、月供差值自动极值高亮，差额自动排序 | Design Tokens 适配 | **A** |
| 7 | **法定退休年龄测算** | `/tools/finance/retirement` | `retirement.ts` | 2024 年全国人大常委会渐进式延迟法定退休年龄改革决议 | 原退休年龄、延迟月数、改革后退休年月精确换算 | Design Tokens 适配 | **S (Flagship)** |
| 8 | **投资回报率 (ROI/IRR)** | `/tools/finance/roi` | `roi.ts` | 基础 ROI、年化 CAGR、折现净现值 NPV、Newton-Raphson / 二分 IRR 求解器 | 奇异现金流不收敛兜底、0 成本防除零错误 | Design Tokens 适配 | **A** |

---

### 2. 健康生理工具 (Health - 7 款)

| # | 工具名称 | 路由路径 | 领域模块 | 算法 / 临床基准 | 边界防范 (NaN/Zero) | 双主题适配 | 综合评级 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 9 | **BMI 体重指数** | `/tools/health/bmi` | `health.ts` | 中华人民共和国卫生行业标准 WS/T 428-2013 + WHO 国际标准双轨 | 身高体重 0 与负数拦截、极端身材提示 | Design Tokens 适配 | **S (Flagship)** |
| 10 | **卡路里与基础代谢** | `/tools/health/calories` | `health.ts` | 现代临床首选 Mifflin-St Jeor 基础代谢率 (BMR) + 5 级活动系数 TDEE | 年龄/身高/体重合法区间拦截，营养宏量三大元素配比 | Design Tokens 适配 | **A** |
| 11 | **血压评估与监测** | `/tools/health/blood-pressure` | `health.ts` | 《中国高血压防治指南（2024年修订版）》分级（理想、正常、正常高值、1/2/3级、单纯收缩期） | 收缩压 < 舒张压逻辑校验拦截、差值异常告警 | Design Tokens 适配 | **S (Flagship)** |
| 12 | **心率区间与储备** | `/tools/health/heart-rate` | `health.ts` | Tanaka 公式极限心率 + Karvonen 储备心率 5 档训练区间（热身/燃脂/有氧/无氧/红线） | 静息心率高于最大心率阻断、极端年龄容错 | Design Tokens 适配 | **A** |
| 13 | **睡眠周期智能规划** | `/tools/health/sleep` | `health.ts` | 90 分钟超慢波 REM 睡眠生物钟周期模型、14 分钟平均入睡缓冲 | 跨夜 24 小时翻转逻辑、就寝/起床双向倒推规划 | Design Tokens 适配 | **A** |
| 14 | **步数里程热量换算** | `/tools/health/steps` | `health.ts` | 性别身高步长估算模型、平地健走 MET 代谢当量热量消耗 | 步长比例限制、消耗热量四舍五入 | Design Tokens 适配 | **B** |
| 15 | **每日科学饮水量** | `/tools/health/water-intake` | `health.ts` | 体重阶梯系数、高强度运动额外水分补充模型 | 极端饮水量安全上限预警（防低钠血症） | Design Tokens 适配 | **B** |

---

### 3. 数据转换工具 (Convert - 6 款)

| # | 工具名称 | 路由路径 | 领域模块 | 算法 / 临床基准 | 边界防范 (NaN/Zero) | 双主题适配 | 综合评级 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 16 | **颜色格式转换器** | `/tools/convert/color` | `convert.ts` | HEX / RGB / HSL / CMYK 色彩空间相互投影与实时色板 | 3/6/8 位 HEX 容错、RGB 0~255 夹紧、HSL 角度环形映射 | Design Tokens 适配 | **S (Flagship)** |
| 17 | **进制转换器** | `/tools/convert/radix` | `convert.ts` | BigInt 高精度二进制、八进制、十进制、十六进制相互转换 | 任意长度大整数防溢出、非法基数字符过滤 | Design Tokens 适配 | **A** |
| 18 | **Hash 生成校验器** | `/tools/convert/hash` | `convert.ts` | 纯前端 Web Crypto API（SHA-1、SHA-256、SHA-384、SHA-512）原生密码学实现 | 空字符串哈希支持、大文本分块处理、0 网络上传 | Design Tokens 适配 | **A** |
| 19 | **时间戳互转工具** | `/tools/convert/timestamp` | `convert.ts` | 秒级 (10位) / 毫秒级 (13位) 时间戳与 ISO/本地日期双向解析 | 1970 前负时间戳与 2038+ 远期时间戳容错、当前秒实时刷新 | Design Tokens 适配 | **A** |
| 20 | **全能度量衡换算** | `/tools/convert/unit` | `convert.ts` | 10 大类别（长度/面积/体积/质量/温度/压力/能量/功率/速度/数据） | 绝对零度截断、浮点数精度截断（防 0.0000000000000001） | Design Tokens 适配 | **A** |
| 21 | **动态二维码生成器** | `/tools/convert/qrcode` | UI + 纯前端 SVG | 纯客户端 Canvas/SVG 矩阵渲染，纠错等级可调 (L/M/Q/H) | 超长字符容量截断与溢出提示、一键 PNG/SVG 下载 | Design Tokens 适配 | **A** |

---

### 4. 日常办公工具 (Daily - 7 款)

| # | 工具名称 | 路由路径 | 领域模块 | 算法 / 临床基准 | 边界防范 (NaN/Zero) | 双主题适配 | 综合评级 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 22 | **字数字符统计器** | `/tools/daily/word-count` | `daily.ts` | 中文字符、西文单词（正则词边界）、标点、无空格字符精确统计 | 巨型文本卡顿防范、纯换行符与空白字符统计 | Design Tokens 适配 | **S (Flagship)** |
| 23 | **密码学随机密码** | `/tools/daily/password` | `daily.ts` | 纯客户端 `crypto.getRandomValues` 密码学安全随机数 (CSPRNG) | 全选排除字符冲突拦截、密码强度熵值计算 | Design Tokens 适配 | **S (Flagship)** |
| 24 | **公历日期相差推算** | `/tools/daily/date-calc` | `daily.ts` | 格里高利历法、闰年闰月、工作日过滤、正负偏移推算 | 跨世纪闰年判定、非法日期格式安全拦截 | Design Tokens 适配 | **A** |
| 25 | **随机抽签与摇号** | `/tools/daily/lottery` | `daily.ts` | 密码学伪随机洗牌算法 (Fisher-Yates CSPRNG)，支持允许/禁止重复 | 样本不足抽取阻断、超大候选集渲染截断 | Design Tokens 适配 | **A** |
| 26 | **多任务计时器** | `/tools/daily/timer` | Web Audio + 本地循环 | 高精度 `performance.now` 漂移修正、番茄工作法间隔逻辑 | 倒计时归零音效警报、后台标签页时钟对齐 | Design Tokens 适配 | **A** |
| 27 | **重要日子倒计时** | `/tools/daily/countdown` | 本地存储 + 日期引擎 | 天/时/分/秒实时递减，卡片进度百分比与过期归档 | 历史日期负向倒计转换为“已过去多少天” | Design Tokens 适配 | **A** |
| 28 | **毫秒级高精度秒表** | `/tools/daily/stopwatch` | `requestAnimationFrame` | 毫秒级分圈计次 (Lap Time)、最快圈与最慢圈高亮对比 | 暂停与重置状态锁、多圈数据本地复制 | Design Tokens 适配 | **B** |

---

### 5. 网络排障工具 (Network - 6 款)

| # | 工具名称 | 路由路径 | 领域模块 | 算法 / 临床基准 | 边界防范 (NaN/Zero) | 双主题适配 | 综合评级 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 29 | **HTTP 状态与穿透检测** | `/tools/network/http-check` | Edge API Endpoint | 生产级 SSRF 防御（阻断回环/内网/元数据/多跳重定向/非标端口），30次/分限流 | 8s 硬超时、64KB 响应体截断、2048 字符 URL 上限 | Design Tokens 适配 | **S (Flagship)** |
| 30 | **DNS 记录解析查询** | `/tools/network/dns` | Cloudflare DoH | Google/Cloudflare 官方 DNS-over-HTTPS (DoH) A/AAAA/CNAME/MX/TXT | 域名非法字符与中文转 Punycode 校验 | Design Tokens 适配 | **A** |
| 31 | **IP 地址归属地查询** | `/tools/network/ip-lookup` | 客户端探测 | 本机出网公网 IP 识别与 ASN/地理位置定位 | 私有 IP 告警（如 192.168.x.x 提示为内网保留） | Design Tokens 适配 | **A** |
| 32 | **网络延迟 (Ping) 探测** | `/tools/network/ping` | 浏览器 Fetch 握手 | 纯前端基于真实主流 CDN 节点的端到端 HTTP RTT 往返时延测算 | 单次测速异常波动剔除、离线状态提示 | Design Tokens 适配 | **A** |
| 33 | **Wi-Fi 与网络信息** | `/tools/network/wifi-info` | `navigator.connection` | 浏览器官方 Network Information API (有效网络类型/下行带宽/RTT) | 不支持该 API 的浏览器优雅降级提示 | Design Tokens 适配 | **B** |
| 34 | **世界时区时钟** | `/tools/daily/world-clock` | `Intl.DateTimeFormat` | IANA 权威时区数据库、夏令时自动切换、全球主要金融中心时间 | 本地时区自动对齐、时差对比指示器 | Design Tokens 适配 | **A** |

---

### 6. 人工智能工具 (AI - 1 款)

| # | 工具名称 | 路由路径 | 领域模块 | 算法 / 临床基准 | 边界防范 (NaN/Zero) | 双主题适配 | 综合评级 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 35 | **LLM 大模型显存估算** | `/tools/ai/gpu-calculator` | `gpu.ts` | 权重显存 (FP16/INT8/INT4) + GQA KV Cache (上下文深度) + 运行时开销 (1.2x) | 常见主流消费级与企业级 GPU (RTX 4090/A100/H100) 适配度评估 | Design Tokens 适配 | **S (Flagship)** |

---

## 三、4 个已下线重定向工具 (Deprecated Redirects) 质量评审

| # | 历史路由 | 规范化重定向目标 | HTTP 状态码 | 下线合规性与防护理由 |
| :--- | :--- | :--- | :---: | :--- |
| 36 | `/tools/health/heart-age` | `/tools/health/heart-rate` | **307 Temporary Redirect** | 非科学估算下线，重定向至权威医学心率区间工具 |
| 37 | `/tools/network/port-scan` | `/tools/network` | **307 Temporary Redirect** | 浏览器沙箱限制无法发送原始 TCP SYN 包，杜绝虚假结果 |
| 38 | `/tools/network/speed-test` | `/tools/network` | **307 Temporary Redirect** | 杜绝虚假模拟测速与误导性数据，已安全下线 |
| 39 | `/tools/network/ssl-check` | `/tools/network` | **307 Temporary Redirect** | 历史规划工具合并至网络大厅 |

---

## 四、质量矩阵结论

1. **零虚假宣称**: 全量 35 个活跃工具均已去除“实时汇率”、“硬件随机数”、“100% Compiler”等夸大宣称，完全符合真实能力。
2. **零白屏与异常防御**: 所有数值工具与转换工具均通过 `isNaN`、`isFinite`、`BigInt` 以及正负极值校验，杜绝任何除零与崩溃风险。
3. **双主题统一交付**: 全量 35 个工具完全采用语义化设计变量（`bg-canvas`, `bg-surface`, `text-text-primary`, `border-border`），在浅色默认模式下雅致沉稳，深色模式下清晰护眼。
