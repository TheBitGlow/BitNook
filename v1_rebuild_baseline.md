# BitNook V1.0 Product Rebuild — 全项目基线审计报告 (Baseline Audit)

> **审计时间**: 2026-10-06  
> **生产访问地址**: [https://bitnook.marmalade-thistle.workers.dev/](https://bitnook.marmalade-thistle.workers.dev/)  
> **项目版本**: `0.2.0` -> `1.0.0` (V1.0 Rebuild)  
> **基线环境**: Node.js v24.19.0, Next.js 16.3.8, React 19.3.0, Wrangler 4.147.0, Vinext

---

## 1. 当前真实资产清单 (Single Source of Truth)

经过对 `src/config/tools.ts`、`src/config/games.ts`、`src/config/categories.ts` 源码的绝对核对，全站资产数据如下：

| 资产类别 | 数量 | 详细明细 |
| :--- | :---: | :--- |
| **Active Tools (活跃可用工具)** | **35** | **日常工具 (8)**: `timer`, `countdown`, `stopwatch`, `date-calc`, `world-clock`, `word-count`, `lottery`, `password`<br>**财务工具 (8)**: `mortgage`, `salary`, `deposit`, `exchange`, `loan-compare`, `compound`, `retirement`, `roi`<br>**健康工具 (7)**: `bmi`, `calories`, `heart-rate`, `blood-pressure`, `sleep`, `steps`, `water-intake`<br>**格式转换 (6)**: `unit`, `timestamp`, `qrcode`, `color`, `radix`, `hash`<br>**网络工具 (5)**: `dns`, `ip-lookup`, `ping`, `http-check`, `wifi-info`<br>**AI 专区 (1)**: `gpu-calculator` |
| **Deprecated Tools (合规重定向工具)** | **4** | **网络 (3)**: `port-scan` (307 -> `/tools/network`), `speed-test` (307 -> `/tools/network`), `ssl-check` (307 -> `/tools/network`)<br>**健康 (1)**: `heart-age` (307 -> `/tools/health/heart-rate`) |
| **Total Tool Metadata (总工具元数据)** | **39** | 35 个活跃 + 4 个废弃（用于 307 保留与 SEO 防断链） |
| **Games (真实独立游戏)** | **8** | `tetris` (方块), `minesweeper` (扫雷), `snake` (贪吃蛇), `gomoku` (五子棋), `match3` (消消乐), `chess-international` (国际象棋), `chess-chinese` (中国象棋), `freecell` (空当接龙) |
| **Categories (标准分类)** | **6** | `daily` (日常), `finance` (财务), `health` (健康), `convert` (格式), `network` (网络), `ai` (人工智能) |

---

## 2. 当前 UI 架构

- **路由系统**: Next.js 16 App Router，分为：
  - 平台门户：`/` (首页), `/tools` (工具Hub), `/games` (游戏大厅)
  - 分类落地页：`/tools/[category]`
  - 具体工具页：`/tools/[category]/[tool]` (包装 `ToolLayout`)
  - 独立游戏页：`/games/[game]`
  - 信息/法律页：`/about`, `/privacy`, `/terms`, `/contact`, `/pricing`
  - 账户占位页：`/auth/login`, `/auth/register`, `/auth/forgot-password`
- **页面组件模式**:
  - 工具页面大量使用 `'use client'`，将所有计算与交互直接塞入单个 `page.tsx`。
  - 游戏页面同样为全客户端组件，每个游戏单文件代码在 450~885 行之间。
- **布局脚手架**:
  - `Header`: 56px 固定高度粘性导航，包含 Logo、分类下拉抽屉、搜索快捷键 `⌘K`、语言切换与主题切换。
  - `Footer`: 极简三列布局。
  - `ToolLayout`: 工具专用布局模板，包含面包屑、头部、工作台容器、可折叠文档资料和关联工具。

---

## 3. 当前 Design Tokens

- **色彩代币**:
  - **Light (默认)**: `--canvas: #F7F8FA`, `--surface: #FFFFFF`, `--surface-secondary: #F1F3F6`, `--border: #E4E7EC`, `--text-primary: #111827`, `--text-secondary: #667085`, `--accent: #2563EB` (Cobalt), `--success: #16A34A`, `--warning: #D97706`, `--danger: #DC2626`。
  - **Dark**: `--canvas: #0B0F14`, `--surface: #11161D`, `--surface-secondary: #171E27`, `--border: #27303B`, `--text-primary: #F5F7FA`, `--text-secondary: #A3ACB9`, `--accent: #60A5FA`。
- **字体与排印**:
  - 西文/数字：`Geist Sans` 可变字体（自托管于 `/fonts/Geist-Variable.woff2`）
  - 等宽/代码：`Geist Mono` 可变字体（自托管于 `/fonts/GeistMono-Variable.woff2`）
  - 中文兜底：`PingFang SC`, `Noto Sans SC`, `Microsoft YaHei`
  - 数值强制：`.tabular-nums`
- **间距与几何**:
  - 间距：严格 8px 网格（8, 12, 16, 20, 24, 32, 40, 48, 64）。
  - 圆角：微圆角 4px (Badge), 6px (Tag), 8px (Input/Button), 12px (Card/Modal)。严禁 24px/32px 大气泡圆角。

---

## 4. 当前 ToolLayout 现状与不足

- **优点**:
  - 统一了 35 个活跃工具的结构形态（面包屑、标题、双语、隐私模式、收藏、原理、步骤、FAQ、免责声明）。
  - 采用行内微状态指示点（`● 本地处理`）替代了此前巨大的遮挡药丸。
- **不足**:
  - 工作台主体缺乏“不同工具类型专用布局（Workbench Variations）”：计算器、转换器、文本编辑器、查询工具全部千篇一律地套在一个单一容器中。
  - 核心计算结果区域的视觉震撼力与可读性仍需强化。

---

## 5. 当前工具逻辑架构缺陷 (重构重点)

- **逻辑与 UI 高度耦合**:
  - 绝大部分工具（如 `mortgage`, `compound`, `deposit`, `exchange`, `bmi`, `calories`, `hash`, `radix` 等）直接把核心数学公式和状态转换写在 `page.tsx` 内的 `useMemo` 或事件函数中。
  - 单元测试无法直接导入纯数学函数进行深度极值/边界用例测试。
- **缺乏统一的 Domain Logic 抽象**:
  - 缺少 `src/core/tools/` 或 `src/lib/tools/` 专门纯逻辑层。
  - 缺少统一的空值、负数、NaN、Infinity、溢出与精确四舍五入防呆处理。

---

## 6. 当前游戏逻辑架构缺陷 (P0 重点)

- **单文件逻辑与渲染混合**:
  - `chess-chinese`: 860 行，棋规生成、估值矩阵、Alpha-Beta 搜索、界面 SVG 棋盘、悔棋全部挤在一个文件中。
  - `chess-international`: 885 行，FEN、走法生成、升变、易位、Canvas/HTML 混排在一起。
  - `freecell`: 609 行，牌堆洗牌、移动规则、Foundation 判定均在组件状态内。
- **游戏规则已知隐患**:
  - **中国象棋**: 曾存在 `cap?.toLowerCase() === 'k'` 允许吃掉老将的代码分支；胜负必须严格由“将军/将死”与“困毙”判断；必须严格防范双将照面。
  - **国际象棋**: 包含王被直接吃掉的降级代码；兵升变缺少完备的弹窗选择（后/车/象/马）；将死与和棋（Stalemate）判断需与 AI 触发解耦。
  - **空当接龙**: 目前洗牌使用普通随机数，缺少经典微软牌局 Deal Number（1~32000 伪随机算法）生成能力；多张牌移动上限容量定理公式需严密校验；缺少自动飞牌（Auto-Foundation）。
  - **消消乐**: 需确保开局无现成消除且必有可行动手，连击/下落动画期间须锁死操作。
  - **扫雷**: 需确保旗帜计数绝不低于 0，移动端需有极佳的单击/长按插旗模式。
  - **贪吃蛇**: 需采用防 180° 自杀的转向队列缓冲机制。

---

## 7. 当前公共组件资产

- `src/components/ui/`: `Button.tsx`, `Input.tsx`, `Card.tsx`, `Badge.tsx`, `Modal.tsx`, `EmptyState.tsx`, `PrivacyBadge.tsx`
- `src/components/layout/`: `Header.tsx`, `Footer.tsx`, `Logo.tsx`
- `src/components/tools/`: `ToolLayout.tsx`, `ToolCard.tsx`, `ToolFeedback.tsx`
- `src/components/theme/`: `ThemeProvider.tsx`, `ThemeToggle.tsx`
- `src/components/search/`: `GlobalSearchModal.tsx`
- `src/components/ads/`: `AdSlot.tsx`
- **不足**: 缺乏高复用性专业组件（如 `IconButton`, `Select`, `Checkbox`, `Switch`, `Tabs`, `Tooltip`, `Popover`, `Accordion`, `Breadcrumb`, `ToolWorkbench`, `ToolResult`, `GameSurface`, `GameControls`, `GameStats`）。

---

## 8. 当前死代码与历史残留

- 部分遗留文件仍然包含早期历史残余类名（如 `.glass-card`, `.btn-gradient` 等）。
- 部分游戏与工具组件中仍有深色硬编码样式（如 `bg-[#050811]`, `bg-[#0B0F19]`, `text-[#94A3B8]`）。

---

## 9. 当前重复实现

- 数字格式化（`formatCurrency`, `formatNumber`, `formatPercent`）在多个页面中各自编写。
- 随机数生成在 Lottery、Password、Games 中各有不同实现，部分未严格区分伪随机与 CSPRNG。
- LocalStorage 读写逻辑分散，键名命名风格不统一。

---

## 10. 当前已知风险清单

1. **游戏逻辑无独立自动化单元测试覆盖**：游戏全部在页面中运行，一旦重构 UI 容易意外破坏游戏规则。
2. **工具极端边界可能出现 NaN**：当用户清空输入框或输入 0 时，部分除法公式若无保护可能产生 NaN 或 Infinity。
3. **汇率工具**：必须严格命名为“参考汇率换算器”，并标注固定基准数据源与免责声明，不得宣传为实时银行外汇牌价。
4. **延迟退休工具**：必须严格基于中国 2025 年最新实施的渐进式延迟法定退休年龄政策及出生年月日，明确数据依据。

---

## 11. 当前测试覆盖

- **Vitest**: 7 个测试套件，54 项测试用例全部通过。
  - `registry.test.ts` (9 tests)
  - `finance.test.ts` (12 tests)
  - `security.test.ts` (6 tests)
  - `redirect-ssrf.test.ts` (4 tests)
  - `retention-growth.test.ts` (6 tests)
  - `convert.test.ts` (6 tests)
  - `user-journeys-and-flagships.test.ts` (11 tests)
- **缺失盲区**: 游戏规则（中国象棋、国际象棋、空当接龙等）缺少独立纯逻辑单元测试；健康工具和网络工具缺少细粒度算法测试。

---

## 12. 当前生产部署方式

- **平台**: Cloudflare Workers (Edge Serverless Runtime)
- **部署工具**: `wrangler 4.147.0`
- **适配层**: `vinext` + `@vinext/cloudflare`
- **构建产物**: 214 个静态与预渲染资产（HTML, JS, CSS, Fonts），32ms 冷启动。
- **生产地址**: `https://bitnook.marmalade-thistle.workers.dev`
- **当前活跃版本 ID**: `fff885e5-4bf3-44ed-8ea7-3172d74fd4ed`

---

## 结论与行动路径

本基线报告确立了 BitNook V1.0 Product Rebuild 的四大核心攻坚战役：
1. **战役一：核心逻辑解耦与纯函数 Domain Logic 层抽取**（为 35 个工具与 8 个游戏提取独立纯函数模块并配齐测试）；
2. **战役二：游戏状态机与规则彻底复盘**（中国象棋、国际象棋、空当接龙等 P0 级别游戏规则推倒重构与验证）；
3. **战役三：全新视觉语言与全套 UI 原语系统升级**（Editorial Utility + Modern Workbench 双方向探索，统一组件体系）；
4. **战役四：全量自动化回归与 Cloudflare Edge 真实生产验证**。
