# 技术栈规范：Astro + Starlight

> **状态**：已裁决 v1.0，由 [决策:技术栈](https://github.com/0xnicholas/balsa-docs/issues/8) 产出（2026-10-02 grilling 定案）。本票经历一次路线反转：先定向 Mintlify → 平台事实调研（[#14](https://github.com/0xnicholas/balsa-docs/issues/14)）→ 评估后否决 → **回归 Astro + Starlight**。否决理由与备选关系见 [ADR-0002](../adr/0002-astro-starlight-docs.md)。
> **上游**：[调研:候选栈对比](https://github.com/0xnicholas/balsa-docs/issues/3)（三家基线排序：①Starlight ②Fumadocs ③Docusaurus）、[调研:API 参考生成管线](https://github.com/0xnicholas/balsa-docs/issues/4)（TS7 阻断与绕行）、[调研:Mintlify 平台事实](https://github.com/0xnicholas/balsa-docs/issues/14)（否决依据，`docs/research/mintlify.md` @ `research/mintlify`）、`research/starlight-feasibility` 分支（可行性实测，commit `13876f0`）、[内容边界](./content-boundary.md)、[IA 与多项目缝](./ia.md)、[内容盘点](./content-inventory.md)、ADR [0001](../adr/0001-default-project-unprefixed.md) / [0002](../adr/0002-astro-starlight-docs.md)。
> **消费**：[决策:API 参考面](https://github.com/0xnicholas/balsa-docs/issues/9)、[决策:交付与部署](https://github.com/0xnicholas/balsa-docs/issues/10)、[决策:agent 面向约定](https://github.com/0xnicholas/balsa-docs/issues/11)、[决策:品牌与视觉](https://github.com/0xnicholas/balsa-docs/issues/12)、[收尾](https://github.com/0xnicholas/balsa-docs/issues/13)。
> **不重开**（地图口径）：五族内容边界、URL 命名资产、内容真相源留本仓库、英文优先、MVP 15 页。

## 1. 裁决

**文档站 = Astro 7 + Astro Starlight**（`astro` ^7.3.5 + `@astrojs/starlight` ^0.42.4 + Tailwind 4 官方桥）。

理由（按权重）：

1. **不引新栈**：既有三站（tokencamp-www / ultralisk-website / heirloom-www）全是 Astro 7 + Tailwind 4；Astro 的 Node 下限 `>=22.12.0` 与 balsa-framework `engines` 完全一致。
2. **优先无 SaaS**：搜索 = 内置 Pagefind（零配置、纯静态索引）；校验 = 仓库内脚本与内容集合 schema，无外部服务。
3. **i18n 预留**：一等公民（含简体中文 UI 内置翻译 + 缺译回退），与「英文优先、zh 后置」直接对齐。
4. **agent 面向机制可行**：每页 `<route>.md` 有现成插件（`starlight-dot-md` 0.2.1）；`llms.txt` 有 `starlight-llms-txt`（三个聚合文件）；**MCP 与内容协商为自建项**，深度归 #11——#3 的「agent 面向一等 ⇒ Fumadocs 翻转」条件因 `.md` 有现成路而不成立（且 #3 当时「Starlight 无每页 `.md`」的 absence 结论已被实测推翻）。
5. **API 参考同生态**：`starlight-typedoc`（0.23.1）直接吃 TypeDoc 产物，#4 已验证的两条绕行路线（TS6 别名 / `@kayahr/typedoc`）peer 兼容。
6. **无运行时锁定**：纯静态构建，退出即换托管，内容不绑平台。

**Mintlify 的位次**（Round 3 Q2）：记为**未来备选**，内容保持平台中立（标准 MDX + frontmatter，不为迁移预加抽象）；评估记录完整保留，重提时从 `docs/research/mintlify.md` 起步，不重复调研。

## 2. 要求清单对账

三档口径（🟢=必须且满足 / 🟡=满足但有已知代价 / 🔴=显式放弃）；依据 = #3 / #4 / `research/starlight-feasibility`（下称「实测」）。

| 要求轴 | 档 | 判定 | 依据 |
| --- | --- | --- | --- |
| Astro 生态复用 / 不引新栈 | 🟢 | 满足（与既有三站同工具链） | #3 §9 |
| 搜索（无 SaaS） | 🟢 | 满足（Pagefind 内置，纯静态） | #3 §1 |
| i18n 预留 | 🟢 | 满足（一等公民，简中 UI + 缺译回退） | #3 §2 |
| 校验与 CI 关卡（frontmatter / 漂移 / 重定向） | 🟢 | 满足（内容集合 schema + 自写脚本，纯仓库 CI，无 SaaS） | 实测、#3 §4 |
| agent 面向：每页 `.md` + `llms.txt` | 🟡 | 满足（`.md` 与 llms.txt 有现成插件；**MCP 自建**，归 #11） | 实测 B/C |
| API 参考接入（TypeDoc 系） | 🟢 | 满足（`starlight-typedoc`；TS7 阻断在产物侧，绕行已验证） | #4 |
| URL 命名资产（`/docs` 根、两段封顶、预留命名空间） | 🟡 | 可表达（嵌套目录变通，§3；`base: '/docs'` 因 `/llms.txt` 冲突不采用） | 实测 A3 |
| MDX 组件与定制 | 🟢 | 满足（内建组件 + CSS 自定义属性 + Tailwind 桥 + Astro 组件 + 受控覆盖） | #3 §5 |
| 版本化预留 | 🟡 | URL 预留满足（§3）；**同站多版本实施风险高**（社区插件早期）——#7 已出域，仅记账 | #3 §3 |
| 内容规模可维护性 | 🟢 | 满足（内容集合 schema + 自写校验脚本；无外部服务） | #3 §4 |

无 🔴 项：原取向（不引新栈 / 优先无 SaaS / i18n 预留）全部成立，地图 Notes 无需修订。

## 3. 三处实测约束与变通（`research/starlight-feasibility`）

1. **内容集合路径被内核硬固定**：Starlight 的 `docs` 集合必须位于 `src/content/docs`（官方源码注释：集合目录结构目前固定）——IA §5 的 `content/docs/` 措辞按 §8 修正。
2. **`/docs` 前缀 + Introduction = `/docs` 走嵌套目录**：`src/content/docs/docs/**` → URL `/docs/**`（官方称该用法为变通）；域根 `/` → `/docs` 用 Astro 重定向表达（状态码与托管层归 #10）。**不采用** `base: '/docs'`（会把 `/llms.txt` 挪进 `/docs`，与 #7 §6 站根约定冲突）。
3. **静态构建的重定向产物是 meta-refresh，非真 301**：真 301 由托管层提供（adapter / `_redirects` / 平台规则），选型与语义归 #10。
4. 附带事实：扩展名端点（`.md`）恒无尾部斜杠，与 `trailingSlash` / `build.format: 'directory'` 无路由冲突（实测 D3）。

## 4. 组合清单

| 组件 | 选型 | 备注 |
| --- | --- | --- |
| 框架 | `astro` ^7.3.5 | Node `>=22.12.0` |
| 文档层 | `@astrojs/starlight` ^0.42.4 | 五族 = 侧栏分组；单车道 |
| 样式 | Tailwind 4 + `@astrojs/starlight-tailwind` | 与既有三站同族 |
| 搜索 | Pagefind（Starlight 内置） | 零 SaaS |
| 每页 `.md` | `starlight-dot-md` 0.2.1 | `injectRoute` + `getStaticPaths`（只认 `docs` 集合；子项目需自建，§8） |
| `llms.txt` | `starlight-llms-txt` 0.12.0 | `llms.txt` / `llms-full.txt` / `llms-small.txt`（只认 `docs` 集合） |
| API 参考 | `starlight-typedoc` 0.23.1 + `typedoc` 0.28.x | 产物形态与覆盖归 #9；TS7 绕行见 §7 |
| frontmatter 校验 | Astro 内容集合 schema（Zod，`docsLoader()`/`docsSchema()` 可扩展） | 承载 #7 §4 字段表；扩展 API 细节待实施核对（§13） |
| 重定向 | Astro `redirects` 配置 + 仓库台账数据文件 | 静态产物 meta-refresh；真 301 = #10 |
| 校验脚本 | 仓库 CI 自写脚本（钉 ref 漂移、台账关卡、frontmatter 值域） | #6 §4「无 SaaS」口径**维持原样** |

## 5. 内容与 frontmatter 契约

- 内容根 = `src/content/docs/`；`/docs` 前缀由嵌套子目录 `docs/` 表达（§3.2）。页面文件路径 = URL 路径（Starlight 语义），与 #7 §2 的「URL 与侧栏同构」一致。
- **#7 §4 的字段表（`title` / `description` / `project` / `subtype` / `order` / `packages` / 原料指针）落为内容集合 Zod schema**：必填、值域、`packages` 与 `package.json` exports 一致性由构建期校验；schema 覆盖不到的跨文件规则（如 `order` 组内唯一、原料指针可解析）由自写脚本兜底。
- `order` / `subtype` / `project` 等自定义字段与 Starlight 内建字段（sidebar / 主题类）不冲突；侧栏采用**显式声明**（人工排序，禁用字母序，#7 §4）。
- MDX：内建组件（卡片、标签页等）+ 自研 Astro 组件；不使用 React island（有需要时另裁，属 #12 面）。
- 复用片段：Astro 组件与 Markdown import；无平台锁定物。

## 6. 重定向与 CI 关卡（改写 #7 §3 的「301」字样）

- **台账**：仓库内单一数据文件登记「移动/删页」映射（#7 §3 的执行面）；`astro.config` 的 `redirects` 由台账生成（或与其逐条对齐）。
- **CI 关卡**：自写脚本比对「上一版页面集合 vs 台账」，删页/改 slug 未登记 = 红；纯仓库内，无 SaaS（#6 §4 原口径）。
- **状态码**：静态产物为 meta-refresh；真 301 归托管层（#10 选定后补齐语义。SEO 上这是 `#10` 的验收项，不是 #8 的）。
- 其余（重定向目标可解析、锚点存活）进链接检查脚本（`starlight-links-validator` 或自写，实施时选型——不引入 SaaS）。

## 7. API 参考生成（给 #9 的栈级前提）

- 产物 = TypeDoc 0.28.x（`typedoc` + `typedoc-plugin-markdown` / `starlight-typedoc` 路线）；**TS7 硬阻断在产物生成侧**（TypeDoc peer ≤ TS 6.0.x vs 框架 7.0.2），两条已验证绕行：`typescript@npm:@typescript/typescript6` 别名 / `@kayahr/typedoc`；消费 `dist/*.d.ts` 与 `src` 等价（#4）。
- 产物落 `src/content/docs/docs/reference/api/**` → URL `/docs/reference/api/**`（#7 §2 的深度豁免在此成立，无平台级 `directory` 概念）。
- 每页 `.md` twin 由 `starlight-dot-md` 覆盖生成页（#11 消费，无需另做）。
- 归 #9：覆盖范围（子路径全开 vs 首批）、10 条导出缺口的补齐、`starlight-typedoc` 端到端验证、警告红/黄口径、产物新鲜度 CI 机制。

## 8. 多项目缝（修正 #7 §5 措辞，ADR-0001 的 URL 结论不变）

- **保留**：URL 命名 `/<slug>/docs/**`；「第二个项目接入前不渲染切换器」；项目切换器槽位。
- **机制**（实测 A2，可行但非纯配置）：子项目 = **自建内容集合**（`src/content/<slug>/` + `glob({base})`）+ `src/pages/<slug>/docs/[...slug].astro` 路由页 + `<StarlightPage>` + `starlight.markdown.processedDirs`；侧栏需显式声明（`<StarlightPage>` 页面不进自动分组）。
- **已知缺口**（届时裁）：`starlight-llms-txt` 只认 `docs` 集合 → 子项目的 llms.txt 需自建/扩展；每页 `.md` 插件同样只认 `docs` 集合 → 子项目 `.md` twin 需自建。
- 接入清单（#7 §5 步骤 2 改写）：由「建 `content/<slug>/`，结构复制五族目录」改为「建 `src/content/<slug>/` 集合 + 路由页 + 显式侧栏 + `processedDirs` 注册」。

## 9. 品牌与定制边界（#12 的硬边界）

- **内建面**：Starlight 组件库、CSS 自定义属性（`--sl-*`）、cascade layers、Tailwind 4 官方桥。
- **自研面**：自研 Astro 组件自由（必要时可加 React island，届时单裁）。
- **受控覆盖清单**：允许使用 Starlight 的 `components:` 覆盖槽位，但每项**登记在册**、升 Starlight 时逐项复验；**禁止** fork/接管非覆盖槽位的上游内部实现。
- 版本化插件（`starlight-versions`）如未来启用，属发布 effort 的栈级动作（早期插件、upgrade 风险自担）。

## 10. 构建与托管（交接 #10）

- 纯静态输出（`astro build`）；可托管于任意静态平台，无 SaaS 运行时依赖。
- #10 需满足的栈级要求：**真 301 能力**（§6 的语义补齐）、PR 预览、构建缓存；选型不改本站内容与 URL 形态。
- 站点 `base` 保持默认（不用 `base: '/docs'`，§3.2）。

## 11. 退出路径

- **零运行时锁定**：内容（标准 MDX + frontmatter 字段+ 台账数据文件）与 URL 形态全是仓库资产；换栈 = 换渲染层（Starlight 语义的侧栏配置与覆盖组件需重写）。
- **Mintlify 备选重提**：从 `docs/research/mintlify.md` @ `research/mintlify` 起步；其否决理由（运行时不可逆 / 定制上限 / Pro 能力付费）若发生变化（如自托管/导出门槛下降），回地图或新 effort 重裁，不在建站中顺手换栈。

## 12. 对本仓库已冻结条目的改写清单（逐条）

| 条目 | 原文 | 改为 | 归属 |
| --- | --- | --- | --- |
| #7 §2 站根 | 「`/` 301 → `/docs`」 | 命名意图保留；机制 = 嵌套 `src/content/docs/docs/**` + 根重定向；真 301 归托管层 | #10 |
| #7 §3 | 「生成 301」 | 台账 + 静态重定向；真 301 = 托管层级验收项 | #10 |
| #7 §5 | `content/<slug>/` 多 collection + 接入清单 | §8：`src/content/<slug>/` 自建集合 + 路由页 + 显式侧栏 + 已知缺口 | 本文 §8 |
| #7 §6 三则 | `<route>.md` / `/llms.txt` / `/llms-manifest.json` | 前两条**成立**（starlight-dot-md / starlight-llms-txt，注意需保持站点 `base` 为空）；第三条由 #11 裁（平台无关） | #11 |
| #7 §4 字段表 | 「`title`/`description` 必填，#8 定校验机制」 | §5：内容集合 Zod schema + 自写值域脚本 | 本文 §5 |
| #6 §4 末 | 「无 SaaS：校验脚本 + CI 关卡即可，不引外部服务」 | **维持不变**（Starlight 路线满足） | — |
| 地图 Notes | 「优先无 SaaS」 | **不覆盖**（原取向有效）；补记 Mintlify 评估与否决（ADR-0002） | 地图修订（#8 决议同步） |

## 13. 待实测（交建站与下游票）

1. `docsSchema()` 扩展自定义 frontmatter 字段的确切 API 与 `packages` 值域校验写法（实施核对）。
2. 嵌套 `src/content/docs/docs/**` + 根重定向的实操（#10 一并验）；确认 `llms.txt` 不被搬移（`base` 保持空）。
3. `starlight-typedoc` 对 `@balsa/core` 10 个子路径导出的端到端（#4 只核对 peer 组合）→ #9。
4. `starlight-dot-md` 的覆盖面（含 API 生成页、i18n 路由）与 `Accept` 协商缺失的影响 → #11。
5. 真 301 的托管层选型与验收（#10）。
6. 链接检查选型（`starlight-links-validator` vs 自写脚本）。
7. Pagefind 的 zh 分词表现（zh 后置时才需要，#3 未验证）。

## 14. 交接注记

- **给 #9**：§7 全节（产物落 `docs/reference/api/**`、TS7 绕行、`starlight-typedoc` 端到端属本票）。
- **给 #10**：§3.2（`base` 保持空）、§6（真 301 验收）、§10（静态托管要求）、§12 表里 #7 §2/§3 两行。
- **给 #11**：§4（`.md` 与 llms.txt 插件）、§7（生成页 `.md` 自动成立）、§8（子项目缺口：llms.txt 与 `.md` 均只认默认集合）、#7 §6 第三条的裁量。
- **给 #12**：§9 硬边界（覆盖清单登记制）。
- **给 #13**：§4 组合清单（脚手架直接照做）、§5 frontmatter schema、§6 台账与关卡、§13 待实测清单。

---

_由 [决策:技术栈](https://github.com/0xnicholas/balsa-docs/issues/8) 产出（2026-10-02）；可行性证据见 `research/starlight-feasibility`（commit `13876f0`），候选对比见 [#3](https://github.com/0xnicholas/balsa-docs/issues/3)，Mintlify 否决记录见 [ADR-0002](../adr/0002-astro-starlight-docs.md) 与 [#14](https://github.com/0xnicholas/balsa-docs/issues/14)。_
