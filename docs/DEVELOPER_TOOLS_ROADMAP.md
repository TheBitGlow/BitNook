# BitNook 开发者工具演进规划路线图 (Developer Tools Roadmap)

> **原则**：严禁为了盲目扩充数量而堆砌低质、虚假或带有安全隐患的外部依赖工具。所有开发者工具必须遵循：
> 1. 100% 浏览器客户端本地处理（Local Processing）；
> 2. 0 数据网络上传，零泄露风险（No Remote Execution）；
> 3. 支持超大文本或流式快速处理；
> 4. 支持快捷键与一键格式化/复制。

---

## 1. 现阶段已交付的高价值转换与开发工具 (Active in v0.2.0)

| 工具名称 | 路由路径 | 核心能力 | 隐私模式 |
| :--- | :--- | :--- | :--- |
| **Unix 时间戳互转** | `/tools/convert/timestamp` | 秒/毫秒双向转换、ISO8601、本地/UTC 时区对照 | 本地处理 (local) |
| **高精度进制转换** | `/tools/convert/radix` | JavaScript 原生 BigInt 大数无溢出 2/8/10/16 进制互转 | 本地处理 (local) |
| **哈希散列计算器** | `/tools/convert/hash` | Web Crypto 原生 SHA-256 / SHA-512 / SHA-384 / SHA-1 计算 | 本地处理 (local) |
| **离线二维码生成器** | `/tools/convert/qrcode` | 纯前端渲染文本/WiFi/名片二维码，高清 PNG 下载 | 本地处理 (local) |
| **多模式颜色转换器** | `/tools/convert/color` | HEX / RGB / HSL / HSV / CMYK 色值互转与取色板 | 本地处理 (local) |
| **密码学安全随机密码** | `/tools/daily/password` | CSPRNG 系统熵池驱动，密码熵估算，批量生成 | 本地处理 (local) |
| **字数与字符统计** | `/tools/daily/word-count` | 汉字、字母、标点、段落、阅读时间本地统计 | 本地处理 (local) |
| **AI GPU 显存精算器** | `/tools/ai/gpu-calculator` | Transformer 权重、GQA KV Cache、CUDA 激活显存推算 | 本地处理 (local) |

---

## 2. 后续规划路线图 (Planned Developer Utilities Roadmap)

在完成真实用户数据回流与增长留存验证后，按价值优先级分批引入：

### Phase 1: 文本与数据编解码（高频长尾流量）
1. **Base64 编解码器 (`/tools/convert/base64`)**
   - 支持 UTF-8 多字节中文、二进制文件（图片/音频转 Base64 Data URL）
   - 纯前端 FileReader 与 TextEncoder/Decoder，零服务端传输
2. **URL 编码 / 解码器 (`/tools/convert/url-codec`)**
   - 支持 `encodeURIComponent` 与 `encodeURI` 模式切换
   - Query String 参数自动解析与表格化展示
3. **UUID / CUID 生成器 (`/tools/daily/uuid`)**
   - 基于 `crypto.randomUUID()` 原生生成 UUID v4
   - 支持批量生成（1~100个）、大写/小写切换、有无横杠格式

### Phase 2: 结构化数据解析与格式化
4. **JSON 格式化与校验器 (`/tools/convert/json-formatter`)**
   - 树状折叠视图与着色高亮
   - 详细的语法错误定位（行号、列号、预期字符）
   - JSON 压缩与一键美化
5. **JWT 解码器 (`/tools/network/jwt-debugger`)**
   - 纯本地解析 Header、Payload 与 Signature 说明
   - 过期时间（`exp`、`iat`）自动格式化为可读本地时间
   - 显式安全警示：不包含私钥验证，严禁上传敏感生产密钥

### Phase 3: 语法与规则测试
6. **正则表达式在线测试器 (`/tools/utility/regex-tester`)**
   - 实时匹配高亮、捕获组提取（Capture Groups）
   - 常用正则模板库（邮箱、手机号、IPv4/v6、身份证、URL）
   - 防 ReDoS 灾难性回溯保护（Web Worker 隔离执行超限保护）
