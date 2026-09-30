# 技术栈规范：Mintlify 托管平台

> **状态**：已裁决 v1.0，由 [决策:技术栈](https://github.com/0xnicholas/balsa-docs/issues/8) 产出（2026-10-02 grilling 定案，Round 1–2 全按推荐；方向由用户直接指定）。
> **上游**：[调研:Mintlify 平台事实](https://github.com/0xnicholas/balsa-docs/issues/14)（平台事实基线，本文证据来源，产物 `docs/research/mintlify.md` @ `research/mintlify`）、[调研:候选栈对比](https://github.com/0xnicholas/balsa-docs/issues/3)（三家对账基线）、[调研:API 参考生成管线](https://github.com/0xnicholas/balsa-docs/issues/4)（TS7 阻断与三条绕行）、[内容边界](./content-boundary.md)、[IA 与多项目缝](./ia.md)、[内容盘点](./content-inventory.md)、ADR [0001](../adr/0001-default-project-unprefixed.md) / [0002](../adr/0002-mintlify-docs-platform.md)。
> **消费**：[决策:API 参考面](https://github.com/0xnicholas/balsa-docs/issues/9)、[决策:交付与部署](https://github.com/0xnicholas/balsa-docs/issues/10)、[决策:agent 面向约定](https://github.com/0xnicholas/balsa-docs/issues/11)、[决策:品牌与视觉](https://github.com/0xnicholas/balsa-docs/issues/12)、[收尾](https://github.com/0xnicholas/balsa-docs/issues/13)、[任务:OSS Program 申请](https://github.com/0xnicholas/balsa-docs/issues/15)。
> **不重开**（地图口径）：五族内容边界、URL 命名资产、内容真相源留本仓库、英文优先、MVP 15 页。

## 1. 裁决

**文档站 = Mintlify（mintlify.com）托管平台**，内容保持 docs-as-code：Markdown/MDX + `docs.json` 留在本仓库，构建、托管、搜索、agent 端点、编辑器、平台侧校验在平台侧；CLI（`mint`）用于本地预览，并把校验塞进**我们自己的**仓库 CI。

显式记账（取代地图 Notes 的「优先无 SaaS」取向；代价与退出路径见 §12、ADR-0002）：

- 站点**运行时不可自托管**（唯一路径为 Enterprise）；**站内搜索是平台 SaaS**，无自托管/离线路径；
- 与既有 Astro 生态**零复用**（平台为 React/Next 系）。

理由（按权重）：① agent 面向**内核级**（#7 §6 冻结的 `<route>.md` 与 `/llms.txt` 天然成立，另多出 MCP、内容协商、Markdown 404）；② API 参考有 **TypeDoc JSON 原生路**（`sdk` 导航 + `format: typedoc`）；③ 托管与校验省维护（Git 推送即部署，`mint` CLI 可进仓库 CI）；④ **0 成本起步**（Starter $0 含自定义域；OSS Program 若过则 Pro 免费）。

## 2. 要求清单对账

三档口径（🟢=必须且满足 / 🟡=加分 / 🔴=显式放弃）；依据列 = [调研:Mintlify 平台事实](https://github.com/0xnicholas/balsa-docs/issues/14) 章节号。

| 要求轴 | 档 | 平台判定 | 依据 |
| --- | --- | --- | --- |
| agent 面向：每页 `.md` + `llms.txt`（+ MCP） | 🟢 | 满足（内核级） | §6 |
| 内容真相源留在本仓库（docs-as-code） | 🟢 | 满足 | §0 |
| URL 命名资产（`/docs` 根、两段封顶、预留命名空间） | 🟢 | 可表达（base path + 文件路径；细节待实测） | §1、§3 |
| i18n 预留 | 🟢 | 满足（`languages` 导航 + 30 语言 + 语言目录前缀） | §4 |
| 版本化预留 | 🟢 | 满足（`versions` 导航 + 版本目录） | §4 |
| API 参考接入（TypeDoc 系） | 🟢 | 满足（`sdk` + TypeDoc JSON；产物形态换轨） | §7 |
| 校验与 CI 关卡（frontmatter / 漂移 / 重定向） | 🟢 | 受限但拆分后成立（CLI + 自写脚本；平台侧 checks 属 Pro） | §2、§11 |
| MDX 组件与自定义 | 🟡 | 满足（内建组件 + 自定义 React，有硬约束） | §8 |
| 搜索（无 SaaS 口径） | 🔴 | **不满足**（平台托管，无自托管/离线路径） | §5 |
| Astro 生态复用 / 不引新栈 | 🔴 | **不满足**（React/Next 系，零工具链复用） | §9、§11 |

🔴 两条为**显式放弃**，由本票 Round 1 决议覆盖地图 Notes 取向并记入 ADR-0002。放弃逻辑：agent 面向一等 + 省维护的权重高于自托管偏好；Astro 复用在 15 页 MVP 上换不来对等收益。

## 3. 平台使用组合

- **站点结构**：一个 Mintlify project = 一个站点；`docs.json` 在**仓库根**；内容根 = `content/docs/`（本仓库新增目录，与 `docs/`（规范/ADR/调研）及根文件隔离）。「站点 base path = `/docs`」是**平台 dashboard 配置**（#14 §1），不是目录名。
- **导航**：`navigation` 根形态 = `groups`（单车道五族 = 五个 group；Introduction = 根 `index.mdx`，即 `/docs`）。组内人工排序（#7 §4）；`hidden` 隐藏单页；`anchors` 可放 Changelog 等外链槽位。
- **URL 表达**：文件路径 → URL 路径；`/docs/<family>/<slug>` 由 base path + 文件路径表达。**待实测**（§14）：base path 与文件路径的精确拼接、域根 `/` → `/docs` 的行为（后者归 #10）。
- **搜索**：平台托管（dashboard 配 results/snippets；页面级 `searchable`/`boost` 可用；过滤需 Enterprise）——SaaS 依赖，已记账。
- **部署**：仓库 push → 平台云构建（部署分支 dashboard 配置）；本地 `mint dev` 预览；**预览部署属 Pro**（OSS Program 目标，见 #15）。
- **项目切换器槽位**：第二项目接入前不渲染（#7 §5 保持）；机制见 §8。

## 4. 内容与 frontmatter 契约

- 平台 frontmatter **全部可选**且允许任意 YAML 字段（#14 §3）→ **#7 §4 的必填字段表（`title` / `description` / `packages` / 原料指针）由本仓库自写校验脚本执行**（§5），平台不兜底。
- 平台字段（`sidebarTitle` / `icon` / `hidden` / `noindex` / `searchable` / `boost` / `tag` / `deprecated` 等）可用，但不得与 #6/#7 字段表冲突；用 `hidden` 处理出域页等特例需在 #13 交接口径登记。
- **复用**：官方 snippets（`/snippets/`，可带变量）承载跨页重复片段。硬约束：snippet 之间不可互相 import、不可 import `.json`、不可 import 第三方 npm 包、无 default export、无代码分割。
- **静态资源**：仓库内文件按路径直接对外服务 → `.mintignore` 是红线（§9）。

## 5. 校验与 CI 关卡（取代 #6 §4 末「无 SaaS：校验脚本 + CI 关卡即可，不引外部服务」）

仓库 CI（免登录，官方 Actions 例）：

| 关卡 | 命令 / 机制 | 红黄 |
| --- | --- | --- |
| 站点结构与 `docs.json` 合法 | `mint validate` | 红 |
| 站内链接 + 锚点 + 重定向目标 | `mint broken-links --check-anchors --check-redirects` | 红 |
| MDX 规范化 | `mint format`（查 diff） | 红 |
| 可访问性基础 | `mint a11y` | 黄（新页告警） |
| frontmatter 必填/值域（`packages` 与 exports 严格一致） | 自写脚本 | 红 |
| 钉 ref 漂移（#6 §4 verbatim 片段 diff） | 自写脚本 | 红 |
| API 参考 JSON 产物新鲜度（§7） | 自写脚本 / CI job | 红（黄待 #9 定） |

平台侧 CI checks（PR 上 broken-links / Vale 文案 lint / grammar）与预览部署属 **Pro**：走 [任务:Mintlify OSS Program 申请](https://github.com/0xnicholas/balsa-docs/issues/15) 争取；未获批则这些能力降级为「本地 + 仓库 CI」，不阻塞。

## 6. 重定向（改写 #7 §3 的「301」字样）

- 重定向 = `docs.json` 顶层 `redirects[]`：**默认 308（永久）/ `permanent: false` → 307**（官方语义为保留 HTTP 方法，非 301）；支持通配与部分通配；在托管层按请求生效，预览与 `mint dev` 同样生效。
- **台账**（#7 §3「移动/删页必有重定向」）落为：`docs.json` 的 `redirects[]` 是台账数据本体；CI 关卡 = `mint broken-links --check-redirects`（目标必须落到有效路径）+ PR 流程要求（删页/改 slug 必须同 PR 登台账）。
- #7 §3 与 ADR-0001 中「生成 301」的措辞按本条修订（语义等价，状态码改写）。

## 7. API 参考生成（给 #9 的栈级前提；撤销 Round 1 的「降级」决议）

- **产物** = TypeDoc **JSON**（`typedoc --json`）。#4 的 TS7 硬阻断位于**产物生成侧**（TypeDoc peer ≤ TS 6.0.x vs 框架 7.0.2），绕行仍适用（`typescript@npm:@typescript/typescript6` 别名 / `@kayahr/typedoc`）。
- **接入** = `docs.json` 的 `sdk` 声明（`format: typedoc`、`source`（仓库路径或 HTTPS）、`directory`（URL 前缀））。**放在 Reference 族的 group 上**（`sdk` 在 `tab` 上与 pages/versions/languages 互斥；group 上可与手写页/嵌套组共存）→ `directory` 目标 = `/docs/reference/api`（**深层前缀待实测**，§14）。
- 平台按符号生成页面 + 导航 + 交叉链接 + 搜索索引；单个符号可另写 MDX 导览页（`sdk: "class X"`）正文在前、生成参考在后。
- 平台自动给生成页提供每页 `.md`（§8），无需另做。
- 归 #9（不在本票裁）：覆盖范围（子路径全开 vs 首批）、10 条导出缺口的补齐、警告红/黄口径、产物新鲜度 CI 机制、`@internal` 与标注策略。

## 8. 多项目缝改写（改写 #7 §5；ADR-0001 的 URL 结论不变）

- **保留**：URL 命名 `/<slug>/docs/**`（顶层单段 slug 与 `v<数字>` 继续预留）；「第二个项目接入前不渲染切换器」。
- **改写**：平台**没有**单站点多 collection；「`content/` 下每项目一个 collection」的单站点约定作废。新机制 = **每子项目一个 Mintlify project**（各自 `docs.json`、各自内容根、各自 base path：默认项目 `/docs`，子项目 `/<slug>/docs`）+ 顶栏切换器槽位（届时按平台 `products` / 外链能力裁）。
- 域形态：子项目挂子路径时，若域上还有别的内容需自建反代（Cloudflare / Vercel / nginx，官方指南）；**单仓库双 project 指向不同内容目录为待实测项**（§14）——不可行时退到「一项目一仓库」或 `products`（URL 前缀形态随之损失，届时重裁）。
- 接入清单改写（#7 §5）：其步骤 2「建 `content/<slug>/`，结构复制五族目录」保留为**内容目录约定**；URL / 导航 / 盘点步骤按「新建 project + 配置 base path + 注册切换器」改写。

### 8.1 agent 面 URL 在 base path 下的落法（改写 #7 §6 三则）

1. `<route>.md`：**天然成立**（页面 URL + `.md`；生成页同样成立），且多出 `Accept: text/markdown` 协商与 Markdown 404。
2. `/llms.txt`：**base path 形态下落在 `/docs/llms.txt`**（`llms.txt` / `llms-full.txt` 随前缀；另有 `/.well-known/llms.txt`）。若要「域根 `/llms.txt`」的字面形态，需域根层处理（反代/专属路由）→ 归 #10/#11 一并裁。#14 §1 明确警告：base path 与反代前缀不一致时，`llms.txt` 内的 `/_llms/**` 链接会指向别处。
3. manifest 类：`/llms-manifest.json` **平台无此物** → 实际对外物为 `/.well-known/api-catalog`、`/.well-known/mcp/server-card.json`、`/.well-known/agent-skills/index.json`、`/_llms/**`（`llms.txt` 超 100k 字符自动拆分）。

## 9. 泄漏红线：`.mintignore`

本仓库同时存放**内部**文件（`CONTEXT.md`、`AGENTS.md`、`docs/spec/**`、`docs/research/**`、`docs/adr/**`、`docs/agents/**`）——平台按路径对外服务仓库文件，**必须**用 `.mintignore` 排除全部非站点路径；#6 §3 的竞品红线因此多一道仓库侧防线。排除清单是 #13 checklist 的必检项。

## 10. 品牌与定制边界（#12 的硬边界）

- **布局接管不存在**：主题 9 选 1（`mint` / `maple` / `palm` / `willow` / `linden` / `almond` / `aspen` / `sequoia` / `luma`），无 swizzle / eject 语义。
- **可定制面**：`colors`（primary/light/dark）、logo / favicon、`appearance`、字体（Google Fonts 或自托管 woff2）、图标库（fontawesome / lucide / tabler 三选一）、背景、`styling`（eyebrow / LaTeX / Shiki 主题）、缩略图；自定义 CSS/JS（`custom-scripts`）；MDX 层自带 React 组件（约束见 §4）；自定义 404。
- #12 在此边界内裁决品牌深度；越界需求 = 栈级动作（headless 自建前端，§12），不在 #12 自由裁量内。

## 11. 档位、成本与 OSS Program

| 档 | 价 | 与本相关的关键能力 |
| --- | --- | --- |
| Starter | $0 | 自定义域、5 编辑席位、搜索 MCP、API playground |
| Pro | $450/mo | 预览部署、平台侧 CI checks（含 Vale）、分析、agent / assistant、admin API、10k credits |
| Enterprise | 面议 | 多 repo、搜索过滤、离线导出 / 静态导出、自托管、SSO / SLA |

- **口径**（Round 1 Q4 + Round 2 Q3）：**免费档起步**；申请 OSS Program（非商业开源 Pro 免费，细则未验证）→ [任务:Mintlify OSS Program 申请](https://github.com/0xnicholas/balsa-docs/issues/15)。若被拒且需要 Pro 能力（预览 / Vale），回本票或新票再裁，**不静默付费**。
- 平台侧风险事实入账（ADR-0002）：GitHub App 权限（建议 only-select-repositories）、2024-03 token 泄露事故、2025-11 静态资源 XSS、CLI 许可 Elastic-2.0（source-available）。

## 12. 退出路径与复盘触发

- **可携**：内容（MDX + frontmatter + snippets）、嵌在 MDX 的自定义组件（依赖平台内建组件的部分需改写）、重定向台账数据（注意 308/307 语义）。
- **不可携**：导航结构（`docs.json` 语义整体重写）、主题 / 布局 / i18n 结构、站内搜索索引、agent 端点 / MCP、分析。
- **渲染产物导出**：`mint export` 离线包与静态导出 API **仅 Enterprise**（后者为私测 + 企业协议）；官方 headless 路线（自建 Astro 前端 + Mintlify 内容 / 搜索 / 助手）记为**正式备选**，不做实现承诺。
- **换栈备料**：Starlight 可行性事实已存 `research/starlight-feasibility` 分支（含「内容目录被内核硬固定」等约束）。
- **触发复盘条件**（任一）：涨价或条款变动影响本用法；重大安全事故；OSS Program 被拒且 Pro 能力成为刚需；平台停运 / 长期失修。届时回地图（或新 effort）重裁，不在建站中顺手换栈。

## 13. 对本仓库已冻结条目的改写清单（逐条）

| 条目 | 原文 | 改为 | 归属 |
| --- | --- | --- | --- |
| #6 §4 末 | 「无 SaaS：校验脚本 + CI 关卡即可，不引外部服务」 | §5：平台 CLI + 自写脚本 +（Pro）平台侧 checks | 本文 §5 |
| #7 §2 站根 | 「`/` 301 → `/docs`」 | 保持命名意图；`/` 的处理与状态码归 #10（base path 形态下待实测） | #10 |
| #7 §3 | 「生成 301」 | 平台语义 308/307（§6） | 本文 §6 |
| #7 §5 | `content/<slug>/` 多 collection + 接入清单 | §8：每子项目一 project + 内容目录约定保留 | 本文 §8 |
| #7 §6 三则 | `<route>.md` / `/llms.txt` / `/llms-manifest.json` | 第 1 条成立且增强；第 2 条在 base path 下落 `/docs/llms.txt`；第 3 条替换为 `/.well-known/*` + `/_llms/**` | 本文 §8.1、#11 |
| #7 §4 字段表 | 「#8 定校验机制」 | §4：自写脚本执行必填/值域 | 本文 §4 |
| 地图 Notes | 「优先无 SaaS」 | 显式覆盖（§1/§12 + ADR-0002） | 地图修订（#8 决议同步） |

## 14. 待实测 / 未验证（交建站与下游票）

1. base path 与文件路径的精确拼接、域根 `/` → `/docs` 的落法（#10）。
2. `sdk.directory` 深层前缀（`docs/reference/api`）是否支持（#9）。
3. 单仓库双 project 指向不同内容目录 + 各自 base path（§8 缝机制）。
4. `mint validate` 对 frontmatter 的覆盖强度（#14 未证）——按「平台不校验」设计，自写脚本兜底。
5. 站内搜索能否整体关闭（#14 未证）；反代下 `Accept` 协商与 `/_llms/**` 是否保真（#14 未证，#10 若上反代）。
6. OSS Program 资格细则（#15）。
7. 平台配额 / 限流（页面数、构建时长、带宽）——无公开数字，建站期观测。

## 15. 交接注记

- **给 #9**：§7 全节（JSON 产物 + `sdk` on group + `directory` 前缀 + 互斥约束 + TS7 阻断位置 + 10 条导出缺口 + 单符号混写 MDX）。
- **给 #10**：§3 部署 / base path、§6 重定向状态码、§11 档位（预览 / 分析 / CI checks）、§12 退出路径、§13 改写表中 #7 §2 两行。
- **给 #11**：§8.1 三则 URL 事实的新落法、§3 导航耦合（`llms.txt` 顺序 = 导航顺序）、§4 每页 `.md` 自动成立。
- **给 #12**：§10 硬边界、§12 中 headless 属栈级动作。
- **给 #13**：§5 关卡清单、§9 `.mintignore` 红线清单、§11 OSS Program 结果（#15）、§14 待实测清单；内容目录 = `content/docs/`（骨架第一步）。

---

_由 [决策:技术栈](https://github.com/0xnicholas/balsa-docs/issues/8) 产出（2026-10-02）；平台事实证据见 [调研:Mintlify 平台事实](https://github.com/0xnicholas/balsa-docs/issues/14)（`docs/research/mintlify.md` @ `research/mintlify`）。_
