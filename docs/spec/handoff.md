# 建站交接口径（Handoff）

> **状态**：已产出 v1.0，由 [收尾:规范核对与交接口径](https://github.com/0xnicholas/balsa-docs/issues/13) 产出。
> **性质**：**索引 + checklist**，不复述裁决。每条裁决的唯一出处是它所链接的规范文件；本文件只回答三件事——**规范齐了吗**（§1）、**建站怎么开工与怎么验收**（§3）、**什么还没验**（§4 / §5）。
> **上游**：`docs/spec/` 八件（§7 索引）+ [ADR-0001/0002/0003](../adr/)。
> **消费**：建站 effort（脚手架 / 页面撰写 / 部署）；框架侧消费面见 §4。

---

## 1. 到达判据核对（#13 核对表）

| 判据（地图 Destination） | 结果 |
| --- | --- |
| 全部票关闭 | ✅ 14 张中 13 张已关闭；本票（#13）随本文件关闭，地图随之关闭 |
| 规范文件集落地 `docs/spec/` | ✅ 8 件（7 件`已裁决 v1.0` + 1 件盘点草稿，见 §7） |
| 收尾票完成 | ✅ 本文件 + ADR/术语核对（§2）+ 地图收束（§6） |
| 无未议雾点 | ✅ 地图 `Not yet specified` 两条经核对**均出域**（跨 effort / 发布期专项），已移交 §6；目的地内无未议点 |

**覆盖面对账**（Destination 列的五面 → 出处）：

| 面 | 落点 |
| --- | --- |
| 内容面（边界 / 真相源 / 页面映射 / MVP 清单） | [content-boundary](./content-boundary.md) + [content-inventory](./content-inventory.md) |
| 信息架构（车道 / URL / 版本化 / 多项目缝） | [ia](./ia.md) + [ADR-0001](../adr/0001-default-project-unprefixed.md) |
| 技术面（栈 / API 参考 / agent 面向） | [stack](./stack.md) + [api-reference](./api-reference.md) + [agent-surface](./agent-surface.md) + [ADR-0002](../adr/0002-astro-starlight-docs.md) |
| 交付面（托管 / 域名 / 预览 / 重定向 / 品牌） | [delivery](./delivery.md) + [brand-visual](./brand-visual.md) + [ADR-0003](../adr/0003-theme-customization-boundary.md) |
| 收尾（核对 / 交接口径 / CONTEXT·ADR） | 本文件 |

**逐项核到的东西**（不只看文件存在）：

- **8 件规范全部有状态头 + 上游/消费链**，交叉引用双向可解析（无悬空 `#<n>` 指向未关闭票）。
- **5 份调研/原型实物全部可达**：`research/mastra-docs` · `research/docs-stack` · `research/api-reference` · `research/api-e2e` @ `e26ce80` · `research/hosting-facts` @ `db1d78e` · `research/agent-surface` @ `9accde4` · `research/starlight-feasibility` @ `13876f0` · `prototype/brand-visual` @ `9eab245` · `research/mintlify`（备选存档）——commit 逐个验证存在。
- **数字复算**：`brand-visual` 的 `theme-color` 双值（亮 `#fdfdfb` / 暗 `#1d1a16`）与 accent `#9e630a` 按 §2.2 token 集反算**逐位吻合**；`api-reference` §7.2 的框架侧实测（`src` 161 行中文 / 40 文件、`dist` 带出 106 行）**与 balsa-framework 现值逐条吻合**；10 个待补导出类型**逐一验证仍不可从子路径 index 导入**（缺口仍成立）。
- **勘误**：§2 五条，全部已就地修正。

---

## 2. 核对修正记录（勘误表）

| # | 位置 | 原文（错） | 修正为 | 为什么 |
| --- | --- | --- | --- | --- |
| E1 | [content-boundary](./content-boundary.md) §1 / §8、[agent-surface](./agent-surface.md) §13 | 首发 **11** 页 | 首发 **12** 页（URL 计数） | 盘点的 MVP 清单把「Examples 索引 + minimal-agent 走读」**并作一条**，项数被当成了页数；族表与站点树（Guides 2 页）一直是 12 |
| E2 | [ia](./ia.md) §1、[stack](./stack.md) §6、[api-reference](./api-reference.md) §7 | MVP / 「15 页」 | **17 页**（首发 12 + P1 5） | 同 E1 的项数/页数混淆（10 项 + 5 页被读作 15 页） |
| E3 | [ia](./ia.md) §5 | `content/docs/`、`content/<slug>/` | `src/content/docs/`、`src/content/<slug>/`（自建集合 + 路由页） | Starlight 内核硬固定集合路径（[stack](./stack.md) §3.1 / §8 已改写，但 `ia.md` 缺修订记录指针）；同处补 #8 修订记录块 |
| E4 | [content-boundary](./content-boundary.md) §6 | 「当前 **10 子路径**」后列 **9** 条 | exports 共 **10 项** = 根 `.` + **9 子路径** | 第 10 项是根导出；值域是校验脚本的输入，计数错会让脚本写错 |
| E5 | [content-boundary](./content-boundary.md) §4.1 | 含中文串的 example = 2 个 | **3 个**（补 `workflow-approval`，残留 4 行） | 核对时对 balsa-framework 复测：`minimal-agent` / `memory-chat` 干净，另三个有 Han 字符 |

**术语补齐**（[CONTEXT.md](../../CONTEXT.md) 新增三条，规范正文反复引用但此前无定义）：

- **内容基线（Content baseline）**——覆盖到 M1–M4、M5 只留占位；
- **重定向台账（Redirect registry）**——规范四处引用（9 次）的机制名，此前无定义；
- **钉定 ref（Pinned ref）**——片段漂移契约的钉点。

**ADR 落位检查**：charting 时列了三个 ADR 候选，结论是**两个落地、一个不必**——

- ✅ [ADR-0001](../adr/0001-default-project-unprefixed.md) 多项目缝、✅ [ADR-0002](../adr/0002-astro-starlight-docs.md) 栈选型、✅ [ADR-0003](../adr/0003-theme-customization-boundary.md) 主题定制边界；
- ⛔ **语言立场不另立 ADR**：公开面英文已是**上游既有裁决**——balsa-framework `docs/adr/0013-naming-and-branding.md` §Consequences 明载「公共面（README、npm、GitHub description）英文为主…会 emit 进 `.d.ts` 的注释用英文」。站点是框架的公开面，本 effort 是**继承**而非新裁；在 balsa-docs 再立一份会造成两处真相源。

---

## 3. 建站 checklist

> 完成判据列只写**可执行、可复现**的验收动作；每项的规范依据在左列，**规范是唯一真相源**，此处不复述取值。
>
> **平台侧挂起说明（#27）**：S6 / S12 / A5 的**平台执行**部分与 O1 / O2 整体已拆到 [#40](https://github.com/0xnicholas/balsa-docs/issues/40)——它们要 Cloudflare 账号与浏览器，跑不进「一片 = 一个 PR = 一个 session」。仓库侧已落地的部分在对应行的完成判据里标 ✅；命令与预期值的执行手册 = [delivery](./delivery.md) §13。

### 3.1 技术底座（脚手架）

| # | 项 | 依据 | 完成判据 |
| --- | --- | --- | --- |
| S1 | Astro + Starlight + Tailwind 桥 + 插件组合照抄 | [stack](./stack.md) §4 | `pnpm dev` 起站；版本与 §4 表一致 |
| S2 | 内容集合 schema（`title`/`description`/`project`/`subtype`/`order`/`packages`/原料指针） | [stack](./stack.md) §5、[ia](./ia.md) §4 | 缺必填字段构建即失败；`packages` 与 `exports` 不一致即失败 |
| S3 | 嵌套目录 `src/content/docs/docs/**` 表达 `/docs/**` | [stack](./stack.md) §3.2 | 路由与 [ia](./ia.md) §7 树逐行对上；**站点 `base` 保持空**（否则 `/llms.txt` 被搬进 `/docs`） |
| S4 | `redirects.json` 台账 + `scripts/gen-redirects.mjs` + **`/` → `/docs` 作为一条** | [delivery](./delivery.md) §4.1、[ia](./ia.md) §2 | 构建产出 `dist/_redirects`；手改 `public/_redirects` 不存在；生成器幂等 |
| S5 | 台账四条红关卡（目标可解析 / schema 合法 / 未登记即红 / 单一真相源守卫） | [delivery](./delivery.md) §4.2 | 删一页不登台账 → 构建红 |
| S6 | `.nvmrc` + `wrangler.jsonc`（`assets` 段，`html_handling: auto-trailing-slash`） | [delivery](./delivery.md) §2.1 / §2.4 | ✅ **仓库侧（#27）**：两文件入库，取值由 `scripts/check-platform.mjs` 在 `pnpm verify` 里验收（`src/lib/platform.ts` 单测覆盖红路径）；**不依框架 checkout 已本机实测**（移开 `.framework/` 后构建与整条 `pnpm verify` 全绿）。✅ **托管侧（#40，2026-10-01）**：产物已按这份配置落到平台（807 资产 / 258 页（产物 HTML 259）/ Pagefind 索引），产物侧 `/docs/reference/api/**` 238 页完整、抽查全 200。**平台构建成功（Workers Builds 侧）仍待人接 Git 集成** → [#40](https://github.com/0xnicholas/balsa-docs/issues/40)（[delivery](./delivery.md) §13.1 / §13.5） |
| S7 | Actions 工作流（frontmatter 值域 / 台账 / 链接检查 / TypeDoc 红门 / 钉 SHA 黄灯） | [delivery](./delivery.md) §5 | 五类关卡在 PR 上真实跑起来 |
| S8 | 钉定 ref 数据文件 + 漂移校验脚本（`verbatim` 块逐块 diff） | [content-boundary](./content-boundary.md) §4 | 改框架源文件 → 未升钉的页面红 |
| S9 | TypeDoc 再生成脚本 + 清理步（删除根 README）+ 入库 | [api-reference](./api-reference.md) §4 | 连续两次重生成 `git diff` 为空；根 README 不在产物里 |
| S10 | 生成树 CI 三红一黄 | [api-reference](./api-reference.md) §6 | errors>0 / 警告>0 / diff 非空 = 红；钉 SHA 落后 = 黄 |
| S11 | 根模块组显示为 `@balsa/core`（**#20 实测定型**：不用 `displayName`——TypeDoc 0.28.20 不支持逐项对象入口——改由入口 shim 文件名承载） | [api-reference](./api-reference.md) §2 | 侧栏不出现裸「index」 |
| S12 | 搜索：Pagefind 索引随构建产出并发布 | [stack](./stack.md) §4、[delivery](./delivery.md) §10.8 | ✅ **产出侧（#27）**：`pnpm verify` 断言索引覆盖本版页面集合、runtime / wasm / 词索引 / 片段齐全、页面挂载 `<site-search`；✅ **线上已验（#40，2026-10-01）**：`/pagefind/pagefind.js` 与 `pagefind-entry.json` 都 200，真浏览器在生产域上查 `createWorkflow`（10 命中 / 6 条出自生成树）与 `durable execution`（20 / 16）都命中，亮暗一致 |

### 3.2 agent 面（机器可读）

| # | 项 | 依据 | 完成判据 |
| --- | --- | --- | --- |
| A1 | `/llms.txt` 生成器（**规范形状逐页索引**，非入口文件） | [agent-surface](./agent-surface.md) §3 | llmstxt.org v2 形状：H1 → 摘要 → 五族 `##` → 逐页链接；API 树只列 10 个模块组入口 |
| A2 | `/llms-manifest.json` 生成器（包 → 页） | [agent-surface](./agent-surface.md) §4 | `packages` 键 == `exports`；`pin`/`version` 双字段就位 |
| A3 | `.md` twin 产出（含生成树覆盖） | [agent-surface](./agent-surface.md) §2 | 每个 HTML 路由存在对应 `.md` |
| A4 | CI 三条断言（twin 齐全 / llms.txt 链接集合 == 内容集合 / 写作规则 ①②机械检查） | [agent-surface](./agent-surface.md) §9 | 断言脚本零依赖可跑 |
| A5 | `_headers`：`.md` 的 `text/markdown; charset=utf-8` + 站级 `Link` / `X-Llms-Txt` | [agent-surface](./agent-surface.md) §5.1 / §5.3、[delivery](./delivery.md) §11⑦ | ✅ **仓库侧（#27）**：`public/_headers` 五条入库（含 `/llms.txt` 与 `/_astro/*`），`check-platform.mjs` 验五条取值、平台上限与 `dist/_headers` 逐字节；✅ **线上已验（#40，2026-10-01）**：生产域上五条逐条过（含 `/_astro/*` 的 immutable）；**预览部署上同样生效**；同批记下平台默认 MIME（`.md` = `text/markdown` 无 charset；`/llms.txt` 那条覆盖实测冗余而保留） |
| A6 | head 注入 `<link rel="alternate" type="text/markdown" href="<route>.md">` | [agent-surface](./agent-surface.md) §5.2 | 页面源码可见；插件不注入，须自补 |
| A7 | 写作约束四条（代码块语言 / 单一 H1 不跳级 / 图不承载信息 / Tab 类须正文等价） | [agent-surface](./agent-surface.md) §6 | ①②机器化（A4），③④靠评审 |
| A8 | 指引页 `/docs/project/docs-for-agents`（首发，英文原创） | [agent-surface](./agent-surface.md) §7 | 页面存在且命名不撞 `/docs/concepts/agents` |

### 3.3 品牌面

| # | 项 | 依据 | 完成判据 |
| --- | --- | --- | --- |
| B1 | 落地顺序：token 与字体 → §3.1 占位 → `/docs` splash → 覆盖清单现状表 | [brand-visual](./brand-visual.md) §6 | 按序执行 |
| B2 | token 集手写进真站（亮/暗两套） | [brand-visual](./brand-visual.md) §2.2 | 浏览器计算值 == 生成值 |
| B3 | 移植 `prototype/contrast-audit.mjs`（收敛为 16 项）作 CI 门 | [brand-visual](./brand-visual.md) §5① | 退出码非 0 即拦合并 |
| B4 | 品牌占位：favicon 单字形「b」双值 / 默认 OG 1200×630 / `theme-color` meta 双值 | [brand-visual](./brand-visual.md) §3.1 / §3.3 | 三者随构建产出 |
| B5 | `/docs` = `template: splash`，全部内建组件、零覆盖 | [brand-visual](./brand-visual.md) §2.3 | 结构对齐 `prototype/brand-visual` 的 `index.mdx` |
| B6 | 覆盖清单现状表（首发**为空**）+ 升级复验机制 | [brand-visual](./brand-visual.md) §4、[ADR-0003](../adr/0003-theme-customization-boundary.md) | 新增覆盖必须同时动 [brand-visual](./brand-visual.md) |

### 3.4 内容生产

**依据**：[ia](./ia.md) §7 站点树（**页面的权威清单**）+ [content-boundary](./content-boundary.md) §1（族与首发集）+ [content-inventory](./content-inventory.md) §2（原料指针）。

1. **首发 12 页**——按树序即阅读流：Introduction（`/docs`，兼 landing）→ Installation → Quickstart → Concepts overview → Agents → Tools → Models → Memory → Workflows → Examples 索引 → minimal-agent 走读 → Docs for AI agents。
2. **每页 frontmatter 第一天就位**（7 字段，含 `packages` 与原料指针）。
3. **P1 5 页**：Import map → Observability → Durable execution & background work → Suspend & resume → Processors。
4. **P2 19 页**按需（树的 `[P2]` 行）。
5. **两个 gated 走读页**（`durable-approval` / `signals-desk`）——**#31 已发布**：两页落在 `/docs/guides/durable-approval` 与 `/docs/guides/signals-desk`，节拍里的中文串按英文改述，`verbatim` 块只取不含中文串的行区间（[content-boundary](./content-boundary.md) §4.1 已回填）。**剩余 gating**（随 [balsa-framework#81](https://github.com/0xnicholas/balsa-framework/issues/81) 解除）= 需要引 example 中文字面（控制台输出 / 源码注释 / README 串）的节拍；`workflow-approval` 仍不在站内。
6. **盘点候选页补 `project: balsa` 标注**——注意：35 条中 §2.5-31「Coming from Mastra」已按竞品红线出局，实际 **34 条** + agent 指引页。
7. **改写规则四条 + 竞品红线**（公开产物一律不提 Mastra）全程生效：见 [content-boundary](./content-boundary.md) §2.1 / §3。

### 3.5 上线与运维

> **平台侧进度（#40，2026-10-01）**：托管侧已跑完（部署 / 预览 / 回滚 / 线上头 / 搜索发布，逐值在 [delivery](./delivery.md) §10 与 §13.5）；剩 Workers Builds 的 Git 集成（连接仓库与平台构建日志）需浏览器里的人。

| # | 项 | 依据 | 完成判据 |
| --- | --- | --- | --- |
| O1 | 预览 / 生产 / 回滚各验一次 | [delivery](./delivery.md) §6 / §2.4 | ◐ **托管侧已验（#40，2026-10-01）**：① 生产域上线并逐项验收（[delivery](./delivery.md) §13.2 八行全过）；② 预览（`wrangler versions upload` 的版本预览 URL）公开可访、带 `x-robots-tag: noindex`（生产无）、台账与头与生产一致；③ 回滚（`wrangler rollback`）后站根仍 301 → `/docs/`、`.md` 规则随版本回退、manifest 的 `pin` 一致。**仍缺的两条**（要 Git 集成）：PR 评论式预览、push `main` 自动部署 |
| O2 | 临时平台域形态（`site`/canonical/sitemap） | [delivery](./delivery.md) §3.4 | ✅ **已验（#40，2026-10-01）**：站点在 `https://balsa-docs.balsa-docs.workers.dev`；`site` 未设 → canonical **0 处**、`/sitemap-index.xml` **404**（构建期警告 #17 已识别）、`/llms.txt` 与 manifest 站根相对链接；生产响应无 `x-robots-tag`；临时域未进任何对外材料。正式域切换（#29）后同一组命令换域重跑 |
| O3 | 正式域落地 PR（`docs.<apex>`） | [delivery](./delivery.md) §3.1 / §3.3 | **依赖 balsa-website 域名票——票已交（2026-10-01）**：报告 = balsa-website 的 `docs/research/domain-and-handles.md` @ `research/domain-and-handles`（commit `82eb368`）；可注册集与推荐序见其 §2 / §4。**仍未拍 = apex 三选一**（报告推荐序：`balsajs.dev` ＞ `getbalsa.dev` ＞ `balsa.run`；+ 下单 / DNS / `docs.<apex>` 记录，归人）。docs 侧改动面 = `site` / canonical / sitemap / 台账补条目。**#40 补一条实测前提**：产物里没有 `robots.txt` 时平台会托管一份（Content Signals 政策文本、无指令），仓库资产能覆盖它——故切换 PR 要不要顺手自持 robots.txt 是一个真选择（[delivery](./delivery.md) §2.3 / §13.4 第 2 行） |
| O4 | npm 0.1.0 切换 PR（Installation 补 npm 段、摘状态块、升钉 ref） | [delivery](./delivery.md) §8、[content-boundary](./content-boundary.md) §7-G1 | **显式 PR，禁自动同步**；正常态 = 仓库路径安装 |
| O5 | changelog 面（P2 起写，手写摘要 + 钉 ref） | [delivery](./delivery.md) §8-G5 | 不建自动生成管线 |
| O6 | 遥测保持为零 | [delivery](./delivery.md) §7 | ✅ **#28 机器化**：`scripts/check-telemetry.mjs`（进 `pnpm verify`）断无第三方子资源 / 无厂商特征 / 无 cookie 写入；浏览器实测每页零外域请求 |

### 3.6 最终验收（口径汇总 · #28 已跑完）

> **执行于 2026-10-01（#28）**。机器面 = `pnpm verify`（含 `pnpm verify:api` / `pnpm verify:pin` / `pnpm check:pin-freshness`，Actions 三个 job 跑同一组）；浏览器面 = `pnpm shots`（截图 + `acceptance.json` 入库 `.screenshots/`）。**平台侧跟进（#40，2026-10-01）**：S6 / S12 / A5 的托管半边与 O1 / O2 已跑完（见 §3.1 / §3.2 / §3.5 各行），只剩 Workers Builds 的 Git 集成一侧。

| 口径 | 依据 | 结果 |
| --- | --- | --- |
| 品牌六条 | [brand-visual](./brand-visual.md) §5 | ✅ 六条全绿：AA 审计 16 项、覆盖数 0（`components:` 不在配置里）、favicon / OG / `theme-color` 随构建产出、五类页面 × 亮暗抽检、CLS 逐页 **0.00000**（10 个页态，每次 shift 的 value/来源/时刻在 `acceptance.json`，重跑三次一致）、截图 + 覆盖表进本文件 |
| API 三红一黄 | [api-reference](./api-reference.md) §6 | ✅ 绿路径 = `pnpm verify:api`（0 error / 0 warning / 238 页与入库产物一致）；红① ② 由同一条 `--treatWarningsAsErrors` pass 承；红③ **活体**验过（往框架 `dist` 加一行导出 → `the committed API tree is not the regeneration of 2bcb649 — 1 path(s) differ`，还原后干净）；黄 = pin `2bcb649` 落后 `HEAD 9d7c2da`（`::warning title=Pinned ref is behind::`，不拦） |
| 台账四条 | [delivery](./delivery.md) §4.2 | ✅ `pnpm verify` 全绿；四条红路径各由 fixture 验过（`src/lib/gate-scripts.test.ts`） |
| agent 面三条 | [agent-surface](./agent-surface.md) §9 | ✅ 落地的五条断言全绿：257 路由 ↔ twin 两向齐全（含 head 里的 `rel="alternate"`）、`/llms.txt` 与内容集合逐页对上、manifest 重算一致、围栏语言与标题层级零违规 |
| 零遥测复核 | [delivery](./delivery.md) §7 | ✅ 新关卡三规则全绿（1,045 个 `<script src>` 全同源、278 个 HTML/JS/CSS 无厂商特征、272 个脚本与内联块无 cookie 写入）+ 浏览器实测每页**零外域请求** |
| 页面类型抽检 | [brand-visual](./brand-visual.md) §5④ | ✅ 文档页 / splash / 生成 API 页 / 404 / Pagefind 面板 × 亮暗 = **10 张**，见 `.screenshots/` |
| 截图基线 | [brand-visual](./brand-visual.md) §5⑥ | ✅ 复拍 **10 张**，拍摄条件同原型（1440×900 / DPR 2 / `prefers-color-scheme`）；原型 15 张 → 本版 10 张的逐项对应与两处替代（文档页换成 `/docs/get-started/quickstart/`、色板对照页换成生成 API 页 + Pagefind 面板）在同节写明 |
| 全站链接检查 | [delivery](./delivery.md) §5 ③ | ✅ #28 落地为自写关卡（`scripts/check-links.mjs`）:259 页 / **73,048 条锚点零断链**（含 4,928 条同页 fragment、57 条跨页锚点）——本片之前唯一未接的关卡 |

**覆盖清单现状表**（[brand-visual](./brand-visual.md) §4 是唯一出处，此处只是随交接物携带的快照）：

| # | 覆盖槽位 | 用途 | 登记 |
| --- | --- | --- | --- |
| — | （空——首发覆盖数 = 0） | — | — |

机制在位：[ADR-0003](../adr/0003-theme-customization-boundary.md) 的登记制 + [brand-visual](./brand-visual.md) §4 的机制段；机器侧 = `check-brand.mjs` 的「`components:` 缺席」断言。新增覆盖须同时动规范与本表。

---

## 4. 框架侧前置（已立案，不阻塞开工）

四项前置**不阻塞脚手架**（脚手架与 S1–S12 全部可在当前框架状态下完成），只 gate 对应内容面：

| 事项 | issue | gate 什么 |
| --- | --- | --- |
| examples 英文化（3 个 example） | [balsa-framework#81](https://github.com/0xnicholas/balsa-framework/issues/81) | 两个走读页中**需要引 example 中文字面的节拍**（发布已随 [#31](https://github.com/0xnicholas/balsa-docs/issues/31) 落地） |
| 补导出 10 个类型 + CI 导出面测试 | [balsa-framework#82](https://github.com/0xnicholas/balsa-framework/issues/82) | API 参考树的**完整性**（10 个类型无页、交叉链接断）——**不 gate 建树** |
| 公共面 JSDoc 清源（英文化 + 内部引用） | [balsa-framework#83](https://github.com/0xnicholas/balsa-framework/issues/83) | 生成树的**公开质量**（否则中文与内部路径原样上线） |
| skills / embedded docs 分工口径 | [balsa-framework#84](https://github.com/0xnicholas/balsa-framework/issues/84) | 无——记录分工，动手时点 = 框架要发 skills 包时 |

**上游联动（非本 effort）**：正式域名字归 balsa-website 的域名调研票（[delivery](./delivery.md) §3.1）；品牌资产替换归伞形品牌 effort（[brand-visual](./brand-visual.md) §3.1）。

---

## 5. 开放风险与待实测清单

**首日就该验的（阻塞型）**：

1. ~~**CF 静态资产的默认 MIME**（`.md` / `.txt` / 无扩展名）→ 不符则 `_headers` 覆盖（[delivery](./delivery.md) §10.2、[agent-surface](./agent-surface.md) §12.1）。~~ ✅ **已实测（#40，2026-10-01）**：`.md` = `text/markdown`（**无 charset**）、`.txt` = `text/plain; charset=utf-8`、无扩展名端点 = `text/html`——**`.md` 的覆盖必要，`/llms.txt` 的覆盖实测冗余而保留**（`#27` 已把覆盖写成无条件）；线上头逐条验过（[delivery](./delivery.md) §10.2 / §13.5）；
2. ✅ **`docsSchema()` 扩展自定义字段的确切 API**（7 个字段要真能被 schema 校验，[stack](./stack.md) §13.1）——**#17 已实测**；
3. ✅ **嵌套 `src/content/docs/docs/**` + 根重定向实操**，并确认 `/llms.txt` 不被搬移（[stack](./stack.md) §13.2）——**#17 已实测**；
4. ✅ **`starlight-typedoc` 对 10 个子路径的端到端**在真实仓库内成立（[stack](./stack.md) §13.3）——**#20 已实测**（239 产物 → 删根 README 后 238 页入库；入口 shim 承载模块名、无框架构建路径与侧栏快照一并验过）。

**上线前应验的**：完整清单见 [stack](./stack.md) §13（10 条）、[delivery](./delivery.md) §10（8 条）、[api-reference](./api-reference.md) §10、[agent-surface](./agent-surface.md) §12；**#28 把能落地的都结了，下面对账**：

- 平台侧：~~回滚实操~~、~~`_redirects`/`_headers` 在预览上生效~~ —— **两条已验（#40，2026-10-01）**：回滚实操 ✅（含 `_headers` 的版本化）、预览上的台账与头 ✅；**两条仍挂起**：Workers Builds 的 Node/pnpm 钉法生效规则、构建缓存命中（要 Git 集成，[delivery](./delivery.md) §13.1 / §13.5）；自定义域证书签发待 #29；
- 站点侧（**#28 已结清**）：Pagefind 索引完整性 ✅（`check-platform.mjs`）、生成页检索质量 ✅（`pnpm shots` 查 `createWorkflow`）、`starlight-dot-md` 的 dev 模式与 `preserveExtension` ✅（#26）、head link 注入的最小实现 ✅（#26）、**链接检查选型 ✅（自写关卡，进 `pnpm verify`）**；剩余两条是**触发式**而不是挂起项：`@kayahr/typedoc` 备胎（触发 = 被迫上 TS7）与 locales / zh（触发 = 第二语言接入）——见 [api-reference](./api-reference.md) §10、[stack](./stack.md) §13.7。

**已知的、不是风险但会咬人的**：

1. **`.md` twin 直出源文，组件以原始 JSX 泄漏**（`<Tabs>` 原样出现，不渲染不降级）——所以写作约束四条是**一等约束**，不是风格建议（[agent-surface](./agent-surface.md) §2 / §6）；
2. **同一入口路径是硬要求**：`Defined in:` 内嵌相对路径，入口一挪全树哈希变（[api-reference](./api-reference.md) §4 F9）；
3. **静态构建的重定向是 meta-refresh**，真 301/308 只在托管层成立——验收必须在部署产物上做，不能只看 `dist/`（[delivery](./delivery.md) §4.3）；
4. **子项目缝的两个已记缺口**：`starlight-dot-md` 与 llms 生成器都只认默认 `docs` 集合，第二项目接入时需自建（[agent-surface](./agent-surface.md) §10、[stack](./stack.md) §8）——**不预先搭架**是裁决，不是遗漏；
5. **`Reference` 升格判据的口径**：[ia](./ia.md) §1 的「~50 页」按**顶层可见侧栏条目**理解（实测 ≈12），判据原文不改，升格留作逃生门（[api-reference](./api-reference.md) §8）；
6. **`content-inventory` 是冻结快照**（v0.1 草稿，判定口径不重开）：它的 35 条候选与 MVP 清算是**原料**，权威页面集合是 [ia](./ia.md) §7 树与 [content-boundary](./content-boundary.md) §1 族表。

---

## 6. 地图收束

**雾的结清**：地图 `Not yet specified` 的两条经核对**均出域**，不再毕业成票——

1. **与营销站的品牌 token 接缝**：站点侧契约已完全裁定（[brand-visual](./brand-visual.md) §3.1 接入点登记表 + §3.4，替换成本 = 改 token + 换资产，不动结构）；剩余动作在 balsa-website / 伞形品牌 effort → 出域。
2. **公开基准 / 数字面**：[content-boundary](./content-boundary.md) §2.3 已封 MVP 数字红线（公开页零字节数/基准表）；「是否开公开可检验基准页」是**发布 effort 的专项** → 出域。

**Out of scope 维持七条**（站点实施 / 营销站 / 中文与双语 / framework 内部文档体系重构 / Studio 类交互面 / 多版本文档实施 / SEO 增长），见地图。

**地图关闭**：目的地达成——本文件即交接口；后续建站 effort 按 §3 直走，**不需要再回地图裁决**。地图作为决策索引保留（可查、不再更新）。

---

## 7. 规范文件集索引

| 文件 | 内容 | 上游票 |
| --- | --- | --- |
| [content-boundary.md](./content-boundary.md) | 五族定型 / 内部文档对外边界 / 改写规则 / 竞品红线 / 片段真相源 / `packages` 字段 / 缺口 G1–G13 裁决 | [#6](https://github.com/0xnicholas/balsa-docs/issues/6) |
| [content-inventory.md](./content-inventory.md) | **草稿 v0.1**：38 件原料判定 → 35 条候选页映射 → 缺口 13 条 → MVP 清单 | [#5](https://github.com/0xnicholas/balsa-docs/issues/5) |
| [ia.md](./ia.md) | 单车道 / URL 两段封顶 / 版本化立场 / 多项目缝 / frontmatter 字段表 / **完整站点树** | [#7](https://github.com/0xnicholas/balsa-docs/issues/7) |
| [stack.md](./stack.md) | Astro 7 + Starlight / 要求对账 / 三处实测变通 / 组合清单 / 台账与关卡 / 退出路径 | [#8](https://github.com/0xnicholas/balsa-docs/issues/8) |
| [api-reference.md](./api-reference.md) | TypeDoc 生成树（10 子路径 · 入库 + diff 门 · 钉 SHA）/ 导出面契约 / CI 红黄 | [#9](https://github.com/0xnicholas/balsa-docs/issues/9) |
| [delivery.md](./delivery.md) | CF Workers 静态资源 / 域名形态 / 预览 / 重定向台账 / 零遥测 / 否决记录 | [#10](https://github.com/0xnicholas/balsa-docs/issues/10) |
| [agent-surface.md](./agent-surface.md) | 每页 `.md` twin / `/llms.txt` / `llms-manifest.json` / 宣告面 / 写作约束 / 分发面分工 | [#11](https://github.com/0xnicholas/balsa-docs/issues/11) |
| [brand-visual.md](./brand-visual.md) | 琥珀暖木 token 集 / 品牌接入点登记表 / 覆盖清单（= 0）/ 六条验收口径 | [#12](https://github.com/0xnicholas/balsa-docs/issues/12) |
| [handoff.md](./handoff.md) | **本文件**：索引 + checklist + 勘误 | [#13](https://github.com/0xnicholas/balsa-docs/issues/13) |

**ADR**：[0001 默认项目无前缀](../adr/0001-default-project-unprefixed.md) · [0002 Astro + Starlight（Mintlify 否决）](../adr/0002-astro-starlight-docs.md) · [0003 主题定制边界](../adr/0003-theme-customization-boundary.md)
**术语**：[CONTEXT.md](../../CONTEXT.md)（新增：内容基线 / 重定向台账 / 钉定 ref）

---

_由 [收尾:规范核对与交接口径](https://github.com/0xnicholas/balsa-docs/issues/13) 产出；建图见 [Wayfinder 地图:balsa 文档站规范](https://github.com/0xnicholas/balsa-docs/issues/1)。_
