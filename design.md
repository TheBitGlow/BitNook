# BitNook Design Blueprint & Visual Design System

> **Brand**: BitNook · 比特角落  
> **Tagline**: All Tools, One Nook · 一站搞定，方寸万象  
> **Philosophy**: Quiet Utility / 安静的工具美学  
> **Audience**: Professionals, students, developers, knowledge workers, everyday web users

---

## 1. Brand & Personality

BitNook is not an AI experiment, not a toy gadget collection, not a cyberpunk hacker playground, and not a corporate enterprise backoffice.
BitNook is **a personal, meticulously crafted digital utility drawer** — a place of calm, order, precision, and trust.

### Core Character Traits
- **Restrained (克制)**: Every pixel has a purpose. We prefer white space, sharp typographic rhythm, and subtle border contrasts over flashy backgrounds and gratuitous icons.
- **Exquisite (精致)**: Clean 1px hairline dividers, tabular numbers aligned to the decimal point, and exact 8px spacing rhythm.
- **Modern & Rational (现代与理性)**: Default light theme with natural contrast, backed by a fully realized dark mode.
- **Fast & Direct (极速与直接)**: Search-first discovery, zero-friction inputs, immediate client-side calculation, and instant keyboard shortcuts.
- **Trustworthy (可信)**: Clear inline privacy indicators, mathematical rigor, transparent data sources, and zero false claims.

---

## 2. Color System & Semantic Tokens

BitNook adopts a **neutral-dominated canvas** with a single refined Cobalt Blue brand accent, supported by semantic state colors.

### 2.1 LIGHT Theme (Default)
| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--canvas` | `#F7F8FA` | Global background canvas |
| `--surface` | `#FFFFFF` | Primary content cards, workbench, modals |
| `--surface-secondary` | `#F1F3F6` | Secondary panels, table headers, code blocks |
| `--surface-hover` | `#F8F9FB` | Interactive row / card hover state |
| `--surface-active` | `#EDEFF2` | Active item / pressed state |
| `--text-primary` | `#111827` | Headings, primary values, active labels |
| `--text-secondary` | `#667085` | Subtitles, descriptions, table secondary data |
| `--text-muted` | `#98A2B3` | Placeholders, shortcuts, timestamps, hints |
| `--border` | `#E4E7EC` | Hairline borders, dividers, subtle structural edges |
| `--border-hover` | `#D0D5DD` | Input hover, interactive border emphasis |
| `--border-focus` | `#2563EB` | Active keyboard focus and input focus |
| `--accent` | `#2563EB` | Primary CTA, active tab, key link |
| `--accent-hover` | `#1D4ED8` | Primary button hover |
| `--accent-subtle` | `#EFF6FF` | Subtle brand badges, active category tint |
| `--success` | `#16A34A` | Verification pass, safe status |
| `--success-subtle` | `#F0FDF4` | Positive feedback background |
| `--warning` | `#D97706` | Caution, disclaimer indicator |
| `--warning-subtle` | `#FFFBEB` | Warning callout background |
| `--danger` | `#DC2626` | Destructive action, error state, high risk |
| `--danger-subtle` | `#FEF2F2` | Error banner background |

### 2.2 DARK Theme
| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--canvas` | `#0B0F14` | Global dark background canvas |
| `--surface` | `#11161D` | Primary dark surface, workbench, modals |
| `--surface-secondary` | `#171E27` | Secondary dark panels, code blocks |
| `--surface-hover` | `#1A222D` | Dark row / card hover |
| `--surface-active` | `#202A38` | Dark active item / pressed state |
| `--text-primary` | `#F5F7FA` | Dark primary headings and text |
| `--text-secondary` | `#A3ACB9` | Dark secondary text and descriptions |
| `--text-muted` | `#707A87` | Dark placeholders and hints |
| `--border` | `#27303B` | Dark hairline borders and dividers |
| `--border-hover` | `#374352` | Dark border hover |
| `--border-focus` | `#60A5FA` | Dark focus ring |
| `--accent` | `#60A5FA` | Dark primary CTA and active accent |
| `--accent-hover` | `#3B82F6` | Dark primary button hover |
| `--accent-subtle` | `rgba(96, 165, 250, 0.12)` | Dark accent tint |
| `--success` | `#22C55E` | Dark success indicator |
| `--warning` | `#F59E0B` | Dark warning indicator |
| `--danger` | `#EF4444` | Dark error indicator |

---

## 3. Typography System

Typography is the primary vehicle for BitNook's aesthetic. We avoid decorative graphical cards and let typography establish the visual hierarchy.

### 3.1 Font Stacks
- **Latin / Numbers**: `Geist Sans`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `sans-serif`
- **Chinese Fallbacks**: `"Noto Sans SC"`, `"PingFang SC"`, `"Microsoft YaHei"`, `sans-serif`
- **Monospace / Code**: `Geist Mono`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace`
- **Tabular Numerics**: `font-variant-numeric: tabular-nums` (mandatory on all amounts, percentages, counts, metrics, tables)

### 3.2 Type Scale
| Level | Font Size | Line Height | Weight | Letter Spacing | Usage |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Display** | 56px / 3.5rem | 1.1 | 600 SemiBold | -0.03em | Homepage Hero headline |
| **H1** | 36px / 2.25rem | 1.2 | 600 SemiBold | -0.025em | Tool Detail & Hub main titles |
| **H2** | 24px / 1.5rem | 1.3 | 600 SemiBold | -0.02em | Section titles, Workbench headers |
| **H3** | 18px / 1.125rem | 1.4 | 500 Medium | -0.01em | Card titles, subsection headers |
| **Result Numbers** | 36px~44px | 1.1 | 600 SemiBold | -0.02em | Primary calculation outputs (`tabular-nums`) |
| **Body** | 14px / 0.875rem | 1.5 | 400 Regular | normal | Explanations, inputs, tables, descriptions |
| **Small** | 13px / 0.8125rem | 1.4 | 400 Regular | normal | Secondary tool rows, metadata, chips |
| **Caption** | 12px / 0.75rem | 1.3 | 400 Regular | normal | Badges, shortcuts, table column headers |
| **Mono** | 13px / 0.8125rem | 1.5 | 400 / 500 | -0.01em | Code, hashes, tokens, parameters |

---

## 4. Spacing, Radius & Elevation

### 4.1 Strict 8px Spacing System
Allowed step increments: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`, `80px`, `96px`.  
Arbitrary paddings (e.g. `p-[17px]`, `gap-[23px]`) are strictly forbidden.

### 4.2 Radius Hierarchy
We have completely rejected 24px / 32px balloon radii in favor of architectural, crisp edges:
- `4px` (`rounded-xs`): Checkboxes, micro badges, table cell tags.
- `6px` (`rounded-sm`): Small buttons, tags, chips.
- `8px` (`rounded-md`): Standard buttons, input controls, selects, search bars.
- `10px` (`rounded-lg`): Sub-panels, tool row cards, callouts.
- `12px` (`rounded-xl`): Tool Workbench primary surface, Modals, Command Palette.
- `9999px` (`rounded-full`): Circular status indicators, avatar buttons.

### 4.3 Elevation & Shadows
Surface depth is defined by 1px border contrast rather than dark, heavy drop-shadows:
- **Base Surface**: `border: 1px solid var(--border)`, `box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04)`.
- **Dropdown / Popover**: `box-shadow: 0 4px 16px -2px rgba(16, 24, 40, 0.08), 0 2px 6px -1px rgba(16, 24, 40, 0.04)`.
- **Modal / Command Center**: `box-shadow: 0 12px 32px -4px rgba(16, 24, 40, 0.12), 0 4px 12px -2px rgba(16, 24, 40, 0.06)`.

---

## 5. Grid & Content Layout

| Surface | Max Width | Rationale |
| :--- | :---: | :--- |
| **Global Container** | 1280px ~ 1360px | Maximum boundary for wide displays; avoids edge stretching. |
| **Core Page Content** | 1200px | Standard width for Header, Tools Hub, Games Hub. |
| **Tool Workbench** | 960px ~ 1080px | Compact focal width ensuring inputs and outputs stay in one gaze line. |
| **Reading / Editorial** | 680px ~ 760px | About, Privacy, Terms, documentation articles for optimal line length. |

---

## 6. Component Architecture & UI Primitives

All UI components MUST consume semantic CSS variables or standardized Tailwind tokens. Direct hardcoded hex values (e.g. `bg-[#0F1523]`) are banned.

### 6.1 Button
- **Variants**:
  - `primary`: `bg-accent text-white hover:bg-accent-hover active:scale-[0.98]`
  - `secondary`: `bg-surface border border-border text-primary hover:bg-surface-secondary active:scale-[0.98]`
  - `ghost`: `bg-transparent text-secondary hover:bg-surface-secondary hover:text-primary active:scale-[0.98]`
  - `destructive`: `bg-danger text-white hover:bg-danger/90 active:scale-[0.98]`
- **Heights**: Small (32px), Medium (38px), Large (44px).

### 6.2 Input & Form Controls
- Height: 38px / 42px.
- Background: `bg-surface`. Border: `1px solid var(--border)`.
- Focus: `border-accent ring-2 ring-accent/20 outline-none`.
- Font: `Geist Sans` for text, `Geist Mono tabular-nums` for numerical entries.

### 6.3 Tool Workbench Surface (`ToolWorkbench`)
- The hero of every tool detail page.
- Clean 12px rounded container with `bg-surface` and `1px solid var(--border)`.
- Clear two-column (60% controls / 40% result) or vertical split.
- Integrated `ResultPanel` featuring large tabular-nums output and copy/share quick-actions.

### 6.4 Privacy Indicator
- Minimal, clean inline indicator:
  - `● 本地处理 (Local)`: Green dot `#16A34A`
  - `● 边缘运算 (Edge)`: Blue dot `#2563EB`
  - `● 外部服务 (Third-Party)`: Muted dot `#667085`
- Clicking opens a concise, non-intrusive popover with exact security rationale.

---

## 7. Motion & Interaction Standards

- **Transitions**: 120ms ~ 200ms `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Hover**: Subtle background lightness change (`bg-surface` -> `bg-surface-hover`) and border tint (`var(--border-hover)`).
- **Press**: Micro-scale `active:scale-[0.98]`.
- **Strictly Banned**:
  - Persistent glowing borders or pulsating shadows.
  - Background particle canvases or animated gradient meshes.
  - Giant card zoom effects (`scale-105` or `translate-y-4`).
  - Distracting scanning lines or cyberpunk retro flashes.

---

## 8. Accessibility & Responsiveness

- **Keyboard Navigation**: All interactive elements must have visible, crisp `:focus-visible` rings (`outline: 2px solid var(--accent); outline-offset: 2px`).
- **Screen Readers**: Full ARIA labels for icon-only buttons, tabs, accordions, and dialog modals.
- **Responsive Viewport Breakdown**:
  - `375px ~ 390px` (Compact Mobile): Single-column workbench, full-screen search view, stacked result panels.
  - `768px` (Tablet): Two-column index, collapsible categories, touch-sized tap targets (min 44px).
  - `1024px ~ 1280px` (Desktop): Left categories sidebar + right tool list; split 60/40 tool workbench.
  - `1440px+` (Large Desktop): Centered 1200px container with balanced negative space.

---

## 9. Do's and Don'ts for Coding Agents

### DO:
- Use semantic CSS variables (`var(--canvas)`, `var(--surface)`, `var(--border)`, `var(--text-primary)`, `var(--accent)`).
- Apply `tabular-nums` to any number, monetary amount, percentage, or date.
- Keep the default theme LIGHT, and test every screen in both LIGHT and DARK modes.
- Preserve all 35 active tools, 4 deprecated redirects, and 8 games.
- Prioritize typography, alignment, and whitespace over colored graphics.

### DON'T:
- DO NOT insert arbitrary hardcoded dark hex codes (`#090D16`, `#0F1523`, `#1E293B`) into React components.
- DO NOT use large 24px or 32px rounded corners.
- DO NOT add neon glows, glassmorphism backdrop blurs, or cyber gradients.
- DO NOT clutter the screen with dozens of marketing badges or colorful icon walls.
- DO NOT break keyboard shortcuts or screen reader accessibility.
