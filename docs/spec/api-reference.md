# API 参考面规范:TypeDoc 生成树

> **状态**:已裁决 v1.0,由 [决策:API 参考面](https://github.com/0xnicholas/balsats-docs/issues/9) 产出(2026-09-30 grilling 定案,9 项裁决;管线机制经端到端探针实证)。
> **上游**:[调研:API 参考生成管线](https://github.com/0xnicholas/balsats-docs/issues/4)(TS7 阻断与三绕行,`docs/research/api-reference.md` @ `research/api-reference`)、[决策:技术栈](./stack.md)(§7 栈级前提)、[决策:IA 与多项目缝](./ia.md)(§2 深度豁免、§1 升格判据)、[决策:内容边界](./content-boundary.md)(§4 片段契约、Reference 族)、[内容盘点](./content-inventory.md)(G8、dist JSDoc 缺口)。
> **端到端实证**:`research/api-e2e` 分支(commit `e26ce80`)——starlight-typedoc 0.23.1 × `@balsa/core` dist 全链路,239 页,两真实仓库零写入。
> **消费**:[决策:agent 面向约定](https://github.com/0xnicholas/balsats-docs/issues/11)(.md twin 事实)、[收尾](https://github.com/0xnicholas/balsats-docs/issues/13)(框架侧前置与建站实施项)、建站 effort。
> **不重开**(地图口径):五族内容边界、URL 两段封顶与 `/docs/reference/api/**` 深度豁免、英文优先、MVP 17 页(首发 12 + P1 5,#13 核对修正)、栈组合([stack.md](./stack.md) §4)。

## 1. 裁决总表

| # | 决策面 | 裁决 |
| --- | --- | --- |
| 1 | 覆盖范围 | 首发生成 `@balsa/core` **全部 10 个子路径**(含组合根 `.`);与内容基线 M1–M4 同构;M5 能力包建成后再扩树 |
| 2 | 生成 vs 手写 | **整树生成**(TypeDoc 系,栈级已定);手写只留 Reference 族门面 = `/docs/reference/import-map` |
| 3 | 导出缺口 | **框架补导出** 10 个被公共签名引用的辅助类型;「导出面 = 文档面」契约;`excludeInternal` 护栏 |
| 4 | 产物形态 | 生成树**入库** + CI 重生成 **diff 门** |
| 5 | 真相源 | **钉 git commit SHA 消费 dist**;npm 发布后切版本号钉(条件见 §5) |
| 6 | JSDoc 中文 | **清源**:框架侧公共面 JSDoc 英文化 + 内部引用改自含表述,建站前置;生成期零清洗 |
| 7 | IA 升格 | **不升格**:树长在 `/docs/reference/api/**`;50 页建议线按「顶层可见侧栏条目」理解(实测 ≈12),升格留作逃生门 |
| 8 | 孤儿页缺陷 | 再生成管线挂**清理步删除根 README**;`/docs/reference/api/` 不设索引页,侧栏组即入口 |
| 9 | CI 红黄 | 红 ×3:errors>0 / 警告>0 / 重生成 diff 非空;黄 ×1:钉 SHA 落后框架默认分支;导出面缺口的**权威关卡在框架侧** |

## 2. 生成管线与版本

**依赖组合**(balsats-docs devDependencies,实测版本表见探针报告):

```
astro ^7.3.5 · @astrojs/starlight ^0.42.4 · starlight-typedoc 0.23.1
typedoc 0.28.20 · typedoc-plugin-markdown 4.13.1(由 starlight-typedoc 自动追加加载)
typescript@npm:@typescript/typescript6@6.0.2   ← TS7 硬阻断的绕行(#4 探针 A/B)
```

- **TS6 别名路线一次通过**(探针 F1:290 包装载零冲突、零崩溃);`@kayahr/typedoc@0.28.20-bundle.1` 留作**已验证备胎**(项目可保 TS 7 时免别名)。
- **配置方式二选一**(F2):`astro.config` 插件 options(`entryPoints` / `output` / `sidebar` / `typeDoc` 覆盖)或独立 `typedoc.json`。插件强制默认(实测):`excludeInternal/Private/Protected: true`、`readme: 'none'`、markdown 侧隐藏面包屑/页头/页题。
- **落点**(F3):`output: 'docs/reference/api'` → `src/content/docs/docs/reference/api/**` → URL `/docs/reference/api/**`(F4,目录 slug 全小写)。
- **入口** = 10 个 `dist/*/index.d.ts`(含 `dist/index.d.ts`)。根入口模块名实测显示为 "index"(取自文件名)——落地时用 TypeDoc 对象入口 `displayName` 或侧栏 label 覆盖为 `@balsa/core`(小瑕疵,实施核对)。
- **入口形态(落地 #20,实施核对)**:TypeDoc 0.28.20 的 `entryPoints` **只收字符串**(逐项 `displayName` 对象未支持,官方 config schema 的 `items` 也只声明 string),两个覆盖手段都不成立——改由**入口 shim 的文件名**决定模块名:10 个 shim 落 `api-entry/`(`@balsa/core.d.ts` + 9 个子路径同名文件),每个一行 `export * from '<相对层数>/<固定 checkout>/packages/core/dist/<子路径|index>.js'`(子路径 shim 一层 `../`、根 shim 两层)。TypeDoc 跟随 re-export,符号保留真实 `Defined in:` 源路径;模块组名 = shim 文件名(根组 = `@balsa/core`,全树不出现裸「index」)。
- **TS6 别名实测未动用(#20)**:本仓库 `typescript@^6.0.3` 已在 TypeDoc 0.28.20 的 peer 窗 `6.0.x` 内,别名路线只在被迫装 TS7 的环境需要。生成配置走独立文件(`typedoc.json` + `typedoc.tsconfig.json`,后者只 `include` 入口 shim 与 dist),不污染站点自身 tsconfig。
- **dev 策略**:`watch: false`(默认)。生成挂 Starlight `config:setup` 钩子,dev/build/sync 都先落盘再加载(F10),启动重生成一次 ~2s(F15);内容基线钉 ref,dev 无需跟框架源码联动。若开 `watch: true` 需配含入口文件列表的 tsconfig(F13)。
- 配置文件形态:按 #4 教训(TypeDoc 首批 TS7 版不读内联 tsconfig 选项),生成配置写独立文件,不依赖 tsconfig 内联段。

## 3. 覆盖与树形状

- 首发树 = **10 个模块组**(agent / durable-agent / memory / model / observability / schedules / signals / tools / workflows / 组合根),目录按 `classes/functions/interfaces/type-aliases/(variables/namespaces)` 分层(探针 F6)。
- 实测规模:**239 个 .md / ~1028 KB**(插件折叠 13 个非根 README 后;裸 TypeDoc 为 252,差值逐文件核对无残余,F5)。build 全程 6–9s(F15)。
- **侧栏混合**(F7):导出的 `typeDocSidebarGroup` 占位符嵌进手写 sidebar 数组,插件替换为生成组——手写五族分组 + 一个「API Reference」生成组并存;嵌套组硬编码 collapsed,顶层可配。
- 值得注意:同入口在本组合下 TypeDoc **0 警告**,而 #4 控制实验见 10 条「未导出类型」警告——警告是否出现依赖解析环境,**不能作为导出面完整性的可靠信号**(→ §6 权威关卡在框架侧;10 个类型确实仍无页面,缺口是框架导出面事实)。

## 4. 再生成与入库(裁决 4、8 的机制)

**生成树是提交进 balsats-docs 的仓库资产**;`git diff` 即 API 变更面,PR 可审。

```
再生成脚本(建站实施项) =
  ① balsa-framework @ 钉定 SHA checkout 到稳定路径(见下)
  ② astro sync           ← starlight-typedoc 在 config:setup 内生成并落盘
  ③ 清理步(自研 astro 插件链尾部) ← 删除根 README.md(裁决 8)
  ④ git diff --exit-code ← CI 红线
```

- **稳定路径硬要求**(F9):生成页正文内嵌 `Defined in:` 相对路径,**入口路径变 → 全树哈希变**。入口必须固定在同一路径(如仓库根相对 `../balsa-framework`,或 CI 固定 checkout 目录);同一入口连续重生成实测逐字节确定(F11:全树 shasum 两连相同)。
- **清理步挂 astro 插件链**而非仅 CI 脚本:dev/build/CI 三处同一行为,孤儿 README 不会在 dev 启动时复活;`astro preview` 不重生成(F10),preview 消费的就是入库产物。
- **不入库模式(模式 B)已验证成立**(F12)但**不采用**——PR 不可审 API 变更面、每次构建挂 TS6 工具链,与台账/关卡风格相悖。
- 框架内部改动但入口导出面未变 → 产物不变(F13:显式命名 re-export 的正确行为),diff 门天然免疫框架内部噪声。

**实现形态(#20 实测)**:

- **四步落地** = `scripts/regen-api-tree.mjs`:`①` 钉定 SHA 落固定路径 `.framework/balsa-framework`(本地从 sibling checkout 用 `git worktree add --detach` 建,CI 由 actions/checkout 落同位;接着构建 `packages/core` 的 dist) → `②` `astro sync`(starlight-typedoc 在 Starlight `config:setup` 内生成) → `③` 清理/规范化步(见下) → `④` `git status --porcelain -- <树> <侧栏快照> api-entry` 为空;`--check` 把 ④ 变成红门(`pnpm verify:api`)。**② 之前另跑一条 §6 的红线 pass**(`typedoc --emit none --treatWarningsAsErrors`)——它不属于四步,挂在同一脚本里以便 errors/warnings 在生成前就拦下。
- **清理步 = 规范化步**:挂 `astro.config.mjs` 的 `balsa-api-tree` 集成(在 Starlight 的 `config:setup` 之后) —— 删根 README **并**给每页打 `generated: true` 标记。生成页不适用 §5 的字段表,该标记是 collection schema union 的判别键(见 [stack](./stack.md) §5)。dev / build / sync / CI 同一行为;`preview` 不重生成,消费入库产物。
- **入库范围**:239 个 TypeDoc 产物文件 − 删除的根 README = **238 页**;插件 `cleanOutputDir` 默认清空输出目录,删符号会连带删页(陈旧页不残留,实测用 stray 文件验证)。
- **确定性实测**:同一入口连续两次重生成逐字节相同(全树 shasum 一致);Node 22.12.0 与 26.2.0 下生成结果亦逐字节相同。全树 776 条站内 API 链接逐条对上构建路由。
- **`preview` 行为(实测)**:starlight-typedoc 对 `command === 'preview'` 直接返回,占位符**不被替换**;快照插件与规范化集成因此在 preview 下整个跳过(否则 preview 会因「占位符未替换」硬错)。preview 消费的是入库产物,侧栏/正文都来自构建结果。
- **台账不管生成树**:`/docs/reference/api/**` 是预留命名空间(ia.md §2)、页由再生成产生,故删符号**不需要**台账条目——`unregisteredRemovals`(delivery §4.2.3)显式豁免该前缀;命名空间整体升格(ia.md §1 逃生门)时按一次性 301 登记那一个根。
- **10 类型缺口的实测表现**:缺页类型的引用是**未链接 code span**(如 `DataSchema`、`WorkflowDefinition`),不是死链;全树 776 条站内链接无一断(balsa-framework#82 补导出后自然长成页与链接)。
- **侧栏**:`typeDocSidebarGroup` 占位符嵌在手写 sidebar 数组里,插件替换为 10 个模块组(子项是 `autogenerate` 目录,不逐页登记 ≈242 条链接);同一次生成把该组快照进 `api-sidebar.json` 入库--平台构建(#27)无框架 checkout 时以快照渲染侧栏,侧栏仍完整(无插件构建实测 238 条 API 链接)。模块组顺序 = TypeDoc 默认 `sort`（字母序，未覆盖）；入口 shim 与 `typedoc.json` 的 `entryPoints` 由 `scripts/check-api-tree.mjs` 对账（文件集合 + 声明顺序）。

## 5. 真相源钉法(裁决 5)

- **钉定物 = balsa-framework 的 commit SHA**,消费该 checkout 的 `dist/*.d.ts`;SHA 记在仓库内单一数据文件(建站实施项,与重定向台账同风格)。
  - **落地(#18)**:文件 = `pinned-ref.json`(`{ "repo": "0xnicholas/balsa-framework", "commit": "<40 位 SHA>" }`);与内容边界 §4 的片段漂移契约**共用同一个钉点**(升钉 = 改这一个字段的显式 PR,CI 全量重检)。**#20 落地**:再生成脚本从同一文件读 SHA。
- **切换条件**:框架 0.1.0 上 npm 后,可切换为「版本号钉 + npm 安装消费 dist」;切换是实施层动作,不改本规范任何其他条目。发布前不阻塞建站(裁决 5)。
- 等价性依据(#4):消费 `dist/*.d.ts` 与消费 `src` 产物同量级同警告集;docs 侧与框架 TS 版本解耦。

## 6. CI 红/黄口径(裁决 9)

| 线 | 条件 | 动作 |
| --- | --- | --- |
| 🔴 红 | TypeDoc 生成 errors > 0 | 拦 |
| 🔴 红 | TypeDoc 警告 > 0(零警告红线,裁决 3) | 拦 |
| 🔴 红 | CI 重生成(含清理步)后 `git diff` 非空 | 拦——入库产物 ≠ 钉定 SHA 的真实产物 |
| 🟡 黄 | 钉 SHA ≠ 框架默认分支 HEAD(新鲜度) | 提示,不拦合并 |

**权威缺口关卡在框架侧**:docs 的零警告线不充分(§3:警告出现与否依赖解析环境)。框架 CI 增测试——**被公共签名引用的类型必须从所属子路径导出**(§7),这是「导出面 = 文档面」契约的执法点;docs 侧红线只保证「入库产物 = 钉定源的真实产物」。

**实现形态(#20 实测)**:红 ×3 与黄 ×1 同挂 `api-tree` job(`.github/workflows/verify.yml`)——

- **① errors / ② 警告**由同一条 pass 兜住:`typedoc --emit none --treatWarningsAsErrors`,读与插件**同一份** `typedoc.json`,并复刻插件强制的默认(`excludeInternal` / `excludePrivate` / `excludeProtected` / `readme none`)。之所以不用插件自身的退出码:插件只把 TypeDoc 的 error/warning 转成 Astro 日志,不改 Astro 退出码;`--emit none` 只关输出、不关转换与校验,故零警告线是真实信号而非第二棵树。
- **③ diff 非空** = 重生成后 `git status --porcelain` 对 `<树>` / `api-sidebar.json` / `api-entry` 为空(未跟踪文件也算,删页残留无处躲)。
- **🟡 新鲜度** = `scripts/check-pin-freshness.mjs`:`git ls-remote <repo> HEAD` 比对 pin,不等即以 `continue-on-error: true` 落地为黄(不拦合并);远端不可达只出 notice,不伪造黄。

## 7. 导出面契约(框架侧前置,交 #13 跟踪)

1. **补导出 10 个类型**(#4 实测清单):`BranchStepOf`、`DataSchema`、`KeyedOutputsOf`、`ResumeDataOf`、`SchemaInput`、`SchemaOutput`、`SpanFields`、`SuspendPayloadOf`、`ThenInputAccepts`、`WorkflowDefinition`——从所属子路径 index re-export;补齐后参考树获得页面、交叉链接恢复。
2. **JSDoc 清源**:公共面 JSDoc 英文化 + `docs/architecture/*` 内部引用改自含表述。实测规模(2026-09-30):src 161 行中文 / 40 文件、154 处内部引用(dist 带出 106 行中文)。与 examples 英文化同列建站前置 issue。
3. **框架 CI 导出面测试**(§6 权威关卡)。
4. **`@internal` 护栏**:插件默认已 `excludeInternal` (§2);框架未来以 `@internal` 标注排除面(现零使用),标注即从生成树消失——这是唯一的排除通道,不另设白名单。

## 8. IA 落位与升格裁定(裁决 7、8)

- 树长在 **`/docs/reference/api/**`**(ia.md §2 深度豁免),Reference 族内,单车道侧栏一个生成组。
- **不升格裁定**:ia.md §1 的 ~50 页建议线在本票按「顶层可见侧栏条目」理解(实测 ≈12:10 模块组 + 组标签);239 页全在折叠嵌套内,可管理。升格 `/reference/**` 留作逃生门,判据原文不改,触发时整体 301。
- **族不设索引页**(沿 ia.md §2):`/docs/reference/api/` 无 landing;Reference 族门面 = 手写 `/docs/reference/import-map`(裁决 6 分工:**手写管选择,生成管精确签名**;import-map 链接进生成树各模块组)。
- 孤儿 README 删除后无死链;侧栏组即 API 树入口。

## 9. 交接注记

- **给 #11**:`.md` twin 实测覆盖生成页(240 twin / 241 页,preview 200,F14),生成树无需另做 agent 面向;llms-full 若全量聚合将 +~1 MB(239 页原文),llms-small 的取舍与生成页聚合粒度归 #11 裁。
- **给 #13**:交接口径增两条框架侧前置(§7.1 补导出、§7.2 JSDoc 清源——需在 balsa-framework 落 issue 跟踪,同 examples 英文化先例);建站实施项清单:再生成脚本 + 清理插件(§4)、CI 三红一黄(§6)、钉定 SHA 数据文件(§5)、根模块组命名(§2,#20 落地为入口 shim 文件名,非 `displayName`)。
- **给建站 effort**:坑清单见探针报告 §「坑与变通」——Starlight ≥0.39 侧栏 schema 须 `items` 包裹、`src/content.config.ts` 必须手建(0.42 不再自动注入集合定义)、`watch:true` 需 tsconfig、基线噪音(i18n loader / Entry docs 404 / sitemap `site`)与 typedoc 无关。

## 10. 未验证项(诚实清单)

**#28 结清后的现状 = 无「未验证」项;只剩两条触发式条目**（都不是待办,触发条件写明;两者都属实施核对,不构成未决决策）：

| 条目 | 现状与依据 |
| --- | --- |
| `@kayahr/typedoc` 备胎端到端 | **未触发（休眠备胎）**:TS6 别名路线未被迫动用——本仓库 `typescript@6.0.3` 已落在 TypeDoc 0.28.20 的 peer 窗内（§2、§13.3）。触发条件 = 环境被迫上 TS7;触发时按探针 F2 重跑 |
| locales × `/docs` 嵌套组合 | **未触发（触发即重开）**:本站无多语言路由（`src/content/i18n/en.json` 只是 UI 串预留,zh 后置）;第二语言接入时重开本条（同 [stack](./stack.md) §13.7 的口径） |
| ~~无 sidebar 占位符时的默认侧栏行为~~ | ✅ **#28 已实测**:插件只**替换**占位符所在位置、从不追加（`getSidebarFromReflections` 的 `replaceSidebarGroupPlaceholder`）;无 reflections 的那条路会**移除**占位符（`getSidebarWithoutReflections`）,不留空组。本仓库另有一道自己的守卫:框架 checkout 在、而占位符被从侧栏拿掉时,`apiSidebarSnapshot()`（`astro.config.mjs`）在 `config:setup` 硬错——实测原话:`the `API Reference` sidebar placeholder was not replaced by starlight-typedoc — check the plugin order in astro.config.mjs` |
| ~~`typeDoc` 覆盖 `modulesFileName`/`fileExtension` 的影响~~ | ✅ **#28 已实测**（两条都是在真配置上跑 `pnpm regen:api --no-build --check`）:`modulesFileName: "overview"` = **惰性**——树里没有任何 `modules` basename（模块不再有 landing 页,§8）,产物逐字节不变、diff 门仍绿;`fileExtension: ".mdx"` = **立刻红**——规范化步删的是 `README.md`,覆盖后根 README 变成 `README.mdx` 留在树里,content schema 当场以 `InvalidContentEntryDataError` 拦下。结论:两条都不是支持面,保持插件默认 |
| ~~pagefind 对生成页的检索质量~~ | ✅ **#28 已实测**:`pnpm shots` 在真浏览器里打开搜索面板查 `createWorkflow` —— 10 条命中、6 条落在 `/docs/reference/api/**`（首条是 `workflows/functions/createworkflow/`）,符号名与签名都进了索引;数值在 `.screenshots/acceptance.json` |
| ~~`starlight-dot-md` dev 模式~~ | ✅ **#26 已实测**（[agent-surface](./agent-surface.md) §12.4）——本表该条属重复登记,删 |
| ~~真实仓库内集成(rootDir、expressive-code)~~ | ✅ **#20 已实测**:`rootDir` 无关(入口 shim 配独立 `typedoc.tsconfig.json`,站点 tsconfig 不被污染)、既有 expressive-code 与生成页共存无冲突;「无框架 checkout 的构建路径」也一并实测(侧栏快照,§4 实现形态)——平台构建(#27)可零 TypeDoc 渲染全树 |

---

> **实施注记(#20)**:§2 增「入口形态」与「TS6 别名未动用」——TypeDoc 0.28.20 不支持逐项 `displayName`,模块名改由入口 shim 文件名承载;§4 增实现形态(四步落地、清理步即规范化步、入库 238 页、两次重生成与跨 Node 逐字节确定、侧栏快照);§6 增三红一黄的落地形态;§10 划掉「真实仓库内集成」。

---

> **实施注记(#18)**:§5 增「落地」一条——钉定物文件为 `pinned-ref.json`,与 content-boundary §4 的漂移契约共用;生成树侧消费(再生成脚本 / CI 三红一黄)仍归 #20。裁决与钉法未变。

---

> **实施注记(#28)**:【最终验收】§10 的诚实清单结清:六条里四条在本片实测（无 sidebar 占位符、`typeDoc` 两条选项覆盖、pagefind 检索质量）,两条改为**触发式**（`@kayahr/typedoc` 备胎、locales）。同批实测的还有三红一黄的**活体**证据:绿路径 = `pnpm verify:api`（0 error / 0 warning / 238 页与入库产物完全一致）;红③ = 往框架 `dist/workflows/index.d.ts` 加一行导出后重跑,`git status` 出 `?? …/functions/acceptanceProbe.md` → `the committed API tree is not the regeneration of 2bcb649 — 1 path(s) differ`（还原后 238 页、干净）;黄 = `pnpm check:pin-freshness` 报 `::warning title=Pinned ref is behind:: … 2bcb649, but HEAD is 9d7c2da`。生成树的页面集 / 侧栏 / 入口 shim 未变。

_由 [决策:API 参考面](https://github.com/0xnicholas/balsats-docs/issues/9) 产出(2026-09-30);管线事实见 `research/api-e2e`(端到端,commit `e26ce80`)与 `research/api-reference`(生成侧,#4);栈级前提见 [stack.md](./stack.md) §7。_
