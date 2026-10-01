# agent 面向规范：机器可读文档面

> **状态**：已裁决 v1.0，由 [决策:agent 面向约定](https://github.com/0xnicholas/balsa-docs/issues/11) 产出（2026-10-02 grilling 定案，两轮 12 问全按推荐落定）。
> **上游**：[决策:技术栈](./stack.md)（Starlight + 插件事实）、[决策:IA 与多项目缝](./ia.md)（§6 URL 事实三则）、[决策:内容边界与真相源](./content-boundary.md)（§6 `packages` 字段）、[决策:API 参考面](./api-reference.md)（§9 生成树 twin 覆盖与 llms-full 体量）、[决策:交付与部署](./delivery.md)（§11 `_headers` 能力与脚本计费面）、[调研:agent 面向的生态约定](https://github.com/0xnicholas/balsa-docs/issues/11#issuecomment-5907223754)（`docs/research/agent-surface-standards.md` @ `research/agent-surface`，commit `9accde4`）。
> **消费**：[收尾](https://github.com/0xnicholas/balsa-docs/issues/13)（建站 checklist）、建站 effort、balsa-framework（分发面分工）。
> **不重开**（地图口径）：URL 命名资产（`<route>.md`、站根 `/llms.txt`、manifest 同站根）、栈选型（Astro 7 + Starlight）、内容真相源留本仓库、英文优先、零遥测。

## 1. 裁决

**agent 面 = 三件，全部构建期从仓库内容派生：**

1. **每页 `<route>.md` twin**（源文直出，含 frontmatter）——`starlight-dot-md` 0.2.1；
2. **站根 `/llms.txt`**——**规范形状的逐页索引**（llmstxt.org v2），自写生成器；
3. **站根 `/llms-manifest.json`**——包 → 页机器契约，自写生成器。

**不做**（否决记录见 §8）：每页 `/<route>/llms.txt`、`llms-full.txt`、`llms-small.txt`、站点侧 MCP、`Accept` 内容协商、`.well-known` 发现、twin 前言与任何后处理管线。

**写作面**：一条总规则 + 四条强制（§6）——`.md` twin 直出源文，没有渲染管线兜底，所以「内容在纯 Markdown 下语义完整」是写作的一等约束。

**宣告面**：`.md` 的 MIME 修正 + 每页 `rel="alternate"` 发现链 + 站级 llms 响应头；sitemap 只收 HTML canonical（§5）。

**分发面**：本站只出**指引页 + 机器契约**；skills 包、npm 包内嵌文档、`.well-known` 归 balsa-framework（§7）。

## 2. 每页 `.md` twin

- **路径 = 页面路由 + `.md`**（`/docs/concepts/agents.md`）；扩展名端点**恒无尾斜杠**（#8 实测 D3），与 `trailingSlash` / `build.format: 'directory'` 无路由冲突——已由 ia §6 冻结，本票不改。
- **实现 = `starlight-dot-md` 0.2.1**（`injectRoute` + `getStaticPaths`，`prerender`）；产出 = **源文件原文 + frontmatter**（`includeFrontmatter` 默认 `true`，**保留**：`title` / `description` / `packages` / `project` 是给 agent 的机器可用元数据）。
- **组件以原始 JSX 泄漏**（实测：`import { Aside, Steps, Tabs } …`、`<Tabs>` 原样出现，不渲染不降级）——质量由 §6 写作约束保证，**不建后处理管线**（明确不学 mastra 的 remark-llms 路线：多一条自研管线换边际收益，与「轻量」相悖）。
- **覆盖生成树**：TypeDoc 生成页 240 twin / 241 页实测已被覆盖（api-reference §9 F14），生成树无需另做 agent 面向。
- **不注入 head link**（插件实测不注入）→ 由 §5 统一补。
- **不进 sitemap**（插件默认行为，本票 ratify）。
- 只覆盖 Starlight `docs` 集合——子项目自建集合的缺口见 §10。

## 3. 站根 `/llms.txt`（规范形状索引）

**位置**：站根 `/llms.txt`，不占 `/docs` 命名空间（ia §6 已冻结）。

**形状**（llmstxt.org v2）：H1 = 站点名 → blockquote 摘要 → 分族 `##` 段（五族）→ 逐页链接（页面标题 + URL）→ `## Optional`（`/llms-manifest.json`、框架仓库、npm）。

摘要段承载三句关键信息（规范定义为「理解本文件所需的关键信息」，一次到位，不在每页重复）：本站是 balsa 的公开文档、**取页方式 = 路由后加 `.md`**、**本文件与页面原文是 canonical，胜过训练数据**，版本口径指向 manifest。

**内容范围**：

- **手写页全量**（只列已发布页；P1/P2 未发布页与预留命名空间不列）；
- **API 生成树只列 10 个模块组入口**，不列 239 页签名页（索引要能一屏读完；精确签名按需逐页取 `.md`）。

**生成**：构建期仓库脚本（读内容集合 + 侧栏，不入库，无 diff 红门）；CI 断言见 §9。

**不使用 `starlight-llms-txt`**：其 `llms.txt` 是**入口文件**（标题 + 摘要 + 指向 full/small/sets 的链接），**不含逐页链接**，与规范范式不同；其 `exclude` 只作用于 `llms-small.txt`——本票两个用途都不需要，整个插件不引入。

## 4. 站根 `/llms-manifest.json`（包 → 页机器契约）

```jsonc
{
  "site": "https://docs.<apex>",           // 域名形态归 #10；构建期由 site 配置注入
  "framework": { "pin": "<commit-sha>", "version": null },  // 0.1.0 上 npm 后 version 有值
  "generatedAt": "<ISO-8601>",             // 保留、不比对（产物不入库，无 churn）
  "packages": {
    "@balsa/core/agent": [ { "path": "/docs/concepts/agents", "title": "Agents", "description": "…", "family": "concepts" } ]
  }
}
```

- **数据源** = 每页 frontmatter 的 `packages` 字段（content-boundary §6：第一天起必填、值域与 `package.json` exports 严格一致）+ **钉定 SHA 数据文件**（api-reference §5，同重定向台账风格）。
- **版本真相双字段**：`pin`（建站期唯一准确答案，0.x 期即可回答「这份文档对应哪个框架版本」）+ `version`（npm 发布后切换，条件与切换语义继承 api-reference §5，切换是实施层动作）。
- **用途** = 分发缝的机器契约：balsa-framework 若做 npm 包内嵌文档 / skills 包，按此映射消费，**不需要爬站、也不依赖本仓库的目录结构**。
- 生成时机与入库口径同 §3。
- **域名未定期间（#26 起）**：`site` 写 `null`，`/llms.txt` 的站内链接写根相对（`/docs/…`）；`src/lib/site.ts` 是唯一出处——`astro.config.mjs` 的 `site` 与生成器同源，所以 #27（临时平台域）/ #29（正式域）只改这一处，canonical、sitemap、manifest 与索引链接一起跟上。

## 5. 宣告面（HTTP 头 / head link / sitemap）

1. **`.md` 的 `Content-Type` = `text/markdown; charset=utf-8`**——RFC 7763 要求带 `charset`；插件不管 MIME，由宿主层 `_headers` 覆盖（#10 已确认可覆盖；CF 默认值待首次上线实测，#10 §10.2）。
2. **每页 HTML head 注入 `<link rel="alternate" type="text/markdown" href="<route>.md">`**——这是 llmstxt.org 规范自己的发现机制，而 `starlight-dot-md` 不注入，**必须补**（Starlight `head` 配置或小集成，实施口径见 §12）。
3. **站级响应头**：`Link: </llms.txt>; rel="llms-txt"` + `X-Llms-Txt: /llms.txt`——`rel="llms-txt"` 在 IANA 注册表**未注册**，但已是事实标准（Mintlify 平台全站 + mastra）；`_headers` 两行成本，采纳。
4. **sitemap 只收 HTML canonical**：`.md` twin 与两个 llms 文件都不进 sitemap（插件默认已如此；自写生成器产出的文件须显式排除）。
5. 缓存策略不新增：沿 #10 §11 的 `_headers` 三条（`.md` / `llms.txt` / `/_astro/*`），不引入额外缓存规则。

## 6. 写作约束（面向 agent 的内容规则）

**总规则**：**每一页在纯 Markdown 下语义完整**——MDX/Astro 组件只允许用在「其 Markdown 等价物可接受」之处。理由：twin 直出源文、组件以原始 JSX 泄漏（§2 实测），没有渲染管线兜底。

**四条强制**：

1. **代码块语言标注必填**（围栏必须带语言）；
2. **单一 H1、标题不跳级**（层级即结构，agent 靠它切段）；
3. **信息不靠图承载**：截图仅作辅助，`alt` 必填，API/行为语义必须落在文本里；
4. **不用「必须切换 / 展开才看得到替代项」的表达**：Tabs 类组件必须在正文给出等价信息（多语言 / 多包管理器示例尤其）。

**组件口径**：`Aside` / `Steps` 等有可接受 Markdown 等价物的可自由使用；Tabs 类须附正文等价信息；纯视觉组件（Cards 网格导航）不得承载唯一信息。

**落点**：规则本体在本文件；content-boundary.md 加一行指针（#13 核对项）。**不建后处理管线**（不把 JSX 洗成 Markdown——那需要第二条自研渲染管线，收益不抵维护面）。

## 7. 分发面与 balsa-framework 的分工

| 面 | 归属 | 形态 |
| --- | --- | --- |
| agent 取文档指引（人类可读） | **本站** | 页面 `/docs/project/docs-for-agents`（Project & ecosystem 族，**首发**；H1「Docs for AI agents」）：llms.txt 优先 → `.md` 追加 → `packages` 字段语义 → 分工一段。英文、原创（无改写原料）。**命名避开 `/docs/concepts/agents`**（框架的 agent 抽象，同名会撞概念）。 |
| 机器契约 | **本站** | `/llms.txt`（§3）+ `/llms-manifest.json`（§4）——稳定、版本化的消费面 |
| skills 包（`npx skills add` 类） | **balsa-framework** | 与代码同仓、随版本发布；本站不建 skills 包 |
| npm 包内嵌文档（`dist/docs/`） | **balsa-framework** | 按 §4 manifest 消费 |
| `.well-known` agent 技能发现 | **balsa-framework**（若做） | 草案（Cloudflare v0.2.0 Draft）尚未进 agentskills 主规范；本站暂无可指技能，不发布 |

**交接口径（给框架侧）**：① manifest 是唯一约定的机器接口，框架侧不解析本仓库结构；② 若做 embedded docs，其内容直接从本站 `https://<domain>/<route>.md` 或从 manifest 指向的路径取，两处同源；③ 分工变动（如 skills 包要收进本站）须回头改本规范，不静默扩张本站范围。

## 8. 不做的与升级路径（否决记录，含一手依据）

| 不做的 | 依据（一手） | 升级路径与触发判据 |
| --- | --- | --- |
| **每页 `/<route>/llms.txt`** | 与 `.md` twin 同源同义（mastra 两份都给，是重复面） | 无（不做即不做，收益为负） |
| **`llms-full.txt` / `llms-small.txt`** | llmstxt.org v2 全文**未定义**这两个文件；**参照物 mastra 实测不发布**（404）；真发布的站点是 Cloudflare 62 MB / Anthropic 38.9 MB / Mintlify 1.6 MB 级；`starlight-llms-txt` 无法把 API 子树排除出 full | 内容规模变大且出现「整包喂给 agent」的真实需求时，用 `customSets` 式分族聚合或在同一生成器加一个分片输出（本规范允许扩展，不预设） |
| **站点侧 MCP server** | mintlify/Cloudflare 为平台托管、Fumadocs 为自建路由，**参照物 mastra 站点侧不发**；balsa 对应的 M5 能力包尚未落地 | 触发 = 真实用户需求出现，或 framework M5 的 MCP 能力包落地后重量；**首选形态 = 本地 stdio npm 包**（agent 本地跑、抓 `/llms.txt` 与 `.md`，不占站点托管面），次选 = 同部署加 Worker 路由（须重新评估计费面） |
| **`Accept: text/markdown` 内容协商** | 生态已主流（Mintlify / Cloudflare / Stripe / mastra 实测支持；Anthropic 不支持），但实现需 `run_worker_first` Worker 脚本 | 触发同 MCP 一行；代价不是钱而是**可用性面**——#10 已查明静态资产请求不限量，而脚本超额是 **429 而非回落静态资源**；`.md` 路由恒在，开启是可逆的一行配置 |
| **`.well-known` 发现** | 草案未入主规范（agentskills PR #254 仍 open），且本站暂无可指技能 | 框架侧若发 skills 包，届时按草案在本站 origin 加 index.json（一行静态文件，随时可加） |

## 9. 生成器与 CI 关卡（归 #13 checklist）

- **生成器**（仓库脚本，构建期跑）：`/llms.txt` 索引 + `/llms-manifest.json`。**产物不入库**——两者都是仓库内内容的纯派生，构建即最新，**结构上没有漂移可能**，因此不需要 TypeDoc 式 diff 红门。
- **CI 三条断言**（读构建产物，零依赖脚本）：
  1. 产物中**每个 HTML 路由存在对应 `.md`**（含生成树）；
  2. **llms.txt 的链接集合 == 内容集合**（无死链、无漏页、无未发布页）；
  3. **写作规则 ①② 机械检查**：代码围栏语言标注、标题层级（单一 H1、不跳级）。
- **评审项**（不进关卡）：规则 ③（图承载信息）、④（Tabs 等价信息）靠内容评审。
- head link 注入已随 #26 落地（见下）；`_headers` 两条（`.md` 的 MIME 目标值、站级 llms 头）归 #27。

**实现形态（#26）**：规则与渲染在 `src/lib/agent-surface.ts`（纯函数 + 单测），`scripts/gen-agent-surface.mjs` 在构建尾写两产物（`pnpm build`，与 `gen-redirects.mjs` 同位置，产物不入库），`scripts/check-agent-surface.mjs` 在 `pnpm verify` 的 build 之后跑（落 Actions 的 repo-gates job）。三条断言的落地口径：

1. ① **两向都查**——内容树每个路由有 HTML 与 `.md`、产物每个 HTML 有 twin（站点根重定向跳板 `dist/index.html` 不是页面，显式排除）；外加每页 head 的 `rel="alternate"` **指向自己的 twin**——§5.2 的注入是自研面，这条是它的守卫。
2. ② `/llms.txt`：每条站内链接解析到发布页或站根机器文件、每个手写页恰好列一次、10 个模块组入口各一条、生成树**只**以这 10 条出现；并把生成树**按模块组分区**（每个生成页恰属一个模块组、每组有页）——新子路径不进 `apiModulePages` 即红。另加 ②b：`/llms-manifest.json` 由内容树重算后逐项比对（`packages` 键 == 导出面、每页列表 == 树、`site`/`pin`/`version` 一致；`generatedAt` 不比）。
3. ③ 围栏语言 + 标题层级，扫的是 `.md` twin（agent 实际读到的字节）；层级按「页面标题是唯一 H1」判：正文 H1 与 setext H1 红、首个标题须 h2、不跳级（生成树不豁免——238 个生成页零违规）。

## 10. 多项目缝的 agent 面注记

- **站级单一 `/llms.txt`**：未来含各项目族（默认项目无前缀、子项目 `/<slug>/docs/**`）；**不做 per-project llms.txt**——站点是「一个站、多项目 URL」，agent 入口应单点，`project` frontmatter 与 manifest 足以区分归属。
- **成本记账（已知缺口）**：`starlight-dot-md` 与 llms 生成器**都只读 Starlight `docs` 集合**，子项目自建集合（`src/content/<slug>/`，stack §8）**不在覆盖内** → 第二项目接入时需自建 twin 路由并扩展生成器。不阻塞、不预先搭架（地图口径「定缝不搭空架」）；第二项目接入清单须带上本条。

## 11. 交接注记

- **给 #12（品牌与视觉）**：组件选择必须满足 §6 总规则（不引入「Markdown 等价物不可接受」的组件）；「Copy as Markdown」类按钮列为**可选升级项**，不在本票硬性范围。
- **给 #13（收尾）**：checklist 增项——① 指引页 `/docs/project/docs-for-agents`（首发，英文原创）；② **两处记账更新**（ia §1 族表 + §7 站点树；content-boundary §1 族表 + 首发集「不再增删」条款）已随本票落地，核对即可；③ content-boundary 写作约束指针；④ llms 生成器 + §9 三条 CI 断言；⑤ `_headers` 两条 + head link 注入；⑥ **框架侧前置**：skills 包 / embedded docs 的分工口径记入 balsa-framework issue（同 examples 英文化先例）。
- **给建站 effort**：§12 的实施核对项。

## 12. 未验证项（实施核对，不构成未决决策）

1. CF 静态资产对 `.md` / `.txt` 的**默认 MIME** 与 `_headers` 覆盖实测（#10 §10.2 同批）——归 #27。
2. ~~**head link 注入的最小实现**：Starlight `head` 配置（全站一次性）vs 小集成的取舍。~~ → **#26 已实测**：取 Starlight 的 **`routeMiddleware`**（`src/lib/agent-surface-head-link.ts`）。它在 route data 建好之后、页面渲染之前把 `{ tag: 'link', attrs: { rel: 'alternate', type: 'text/markdown', href: '<route>.md' } }` 推进 `locals.starlightRoute.head`——比 `head` 配置小（后者站点级，写不出逐页 href），也比组件覆盖小（不进覆盖清单，ADR-0003 不动）。257 个产物 HTML 除站点根跳板外全部带该标签（含 404 页与 splash landing），dev 同样生效。
3. ~~**llms.txt 生成脚本对生成树的登记粒度**：10 个模块组入口的具体取值（模块组名与 `displayName` 覆盖口径同 api-reference §2）。~~ → **#26 已定**：模块组名 = 入口 shim 文件名（`@balsa/core`、`agent` …，同 api-reference §2 的覆盖口径）；**代表页**手写在 `src/lib/agent-surface.ts` 的 `apiModulePages`，取值 = Import map 的 `Signatures` 列（生成树无模块 landing 页，api-reference §8 已定族不设索引页）。条目形状：`- [<模块组名>](<代表页路由>): API reference module for \`<包/子路径>\` — its pages start at <符号名>`；死链由断言 ② 拦截。
4. ~~`starlight-dot-md` 的 dev 模式行为（官方只说明「dev 需带尾斜杠」）与构建态差异；`preserveExtension` 是否开启。~~ → **#26 已实测**：官方那句指 `/<route>/.md` 形态（实测 500），规范形状 `<route>.md`（§2 的唯一形态）dev 与 build 一致 200，落地页 `/docs.md` 亦然；`.mdx` 源页照样得到 `.md` twin。**`preserveExtension` 保持默认关闭**——开启会把扩展名端点变成 `.mdx`，与 §2 冻结的「路径 = 页面路由 + `.md`」冲突。
5. ~~`generatedAt` 是否随构建写死（现口径：书写、不比对）。~~ → **#26 已定**：构建期取 `new Date().toISOString()` 写入（`--generated-at` 供测试固定），断言 ②b 只重算 `site` / `framework` / `packages`。

## 13. 对已冻结条目的改写清单（逐条）

| 已冻结条目 | 原口径 | 本票改写 | 记录位置 |
| --- | --- | --- | --- |
| ia §1 族表：Project & ecosystem 首发页数 | 0（全 P2） | **1**（agent 指引，首发） | ia 站点树后修订记录（#11） |
| ia §7 站点树 | 无 `/docs/project/docs-for-agents` | 增一行（首发） | 同上 |
| content-boundary §1 族表 + 「首发集…不再增删」 | 首发 10 项 + P1 5 页 | **首发 12 页 + P1 5 页**（#13 核对修正页数口径：项数 ≠ 页数） | content-boundary §8 末修订记录（#11 / #13） |
| content-boundary §2 写作口径 | 未涉 agent 降级面 | 加一行指针 → 本文件 §6 | 同上 |
| 地图 Not yet specified：MCP 雾点 | 「MCP 为自建项——#11 若显大，毕业成票」 | **关闭**：已裁决「首发不做 + 升级路径 + 触发判据」（§8），不毕业新票 | 地图同步 |
| #10 §11 给 #11 的平台交接口径 | 「MCP / Accept 协商需单独评估」 | 沿用；评估结论与触发判据落 §8 | 本文件 |

---

_由 [决策:agent 面向约定](https://github.com/0xnicholas/balsa-docs/issues/11) 产出（2026-10-02）；生态事实见 `docs/research/agent-surface-standards.md`（`research/agent-surface` @ `9accde4`），插件行为见 stack §4 与 api-reference §9 的实测口径。_
