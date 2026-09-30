# API 参考面规范:TypeDoc 生成树

> **状态**:已裁决 v1.0,由 [决策:API 参考面](https://github.com/0xnicholas/balsa-docs/issues/9) 产出(2026-09-30 grilling 定案,9 项裁决;管线机制经端到端探针实证)。
> **上游**:[调研:API 参考生成管线](https://github.com/0xnicholas/balsa-docs/issues/4)(TS7 阻断与三绕行,`docs/research/api-reference.md` @ `research/api-reference`)、[决策:技术栈](./stack.md)(§7 栈级前提)、[决策:IA 与多项目缝](./ia.md)(§2 深度豁免、§1 升格判据)、[决策:内容边界](./content-boundary.md)(§4 片段契约、Reference 族)、[内容盘点](./content-inventory.md)(G8、dist JSDoc 缺口)。
> **端到端实证**:`research/api-e2e` 分支(commit `e26ce80`)——starlight-typedoc 0.23.1 × `@balsa/core` dist 全链路,239 页,两真实仓库零写入。
> **消费**:[决策:agent 面向约定](https://github.com/0xnicholas/balsa-docs/issues/11)(.md twin 事实)、[收尾](https://github.com/0xnicholas/balsa-docs/issues/13)(框架侧前置与建站实施项)、建站 effort。
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

**依赖组合**(balsa-docs devDependencies,实测版本表见探针报告):

```
astro ^7.3.5 · @astrojs/starlight ^0.42.4 · starlight-typedoc 0.23.1
typedoc 0.28.20 · typedoc-plugin-markdown 4.13.1(由 starlight-typedoc 自动追加加载)
typescript@npm:@typescript/typescript6@6.0.2   ← TS7 硬阻断的绕行(#4 探针 A/B)
```

- **TS6 别名路线一次通过**(探针 F1:290 包装载零冲突、零崩溃);`@kayahr/typedoc@0.28.20-bundle.1` 留作**已验证备胎**(项目可保 TS 7 时免别名)。
- **配置方式二选一**(F2):`astro.config` 插件 options(`entryPoints` / `output` / `sidebar` / `typeDoc` 覆盖)或独立 `typedoc.json`。插件强制默认(实测):`excludeInternal/Private/Protected: true`、`readme: 'none'`、markdown 侧隐藏面包屑/页头/页题。
- **落点**(F3):`output: 'docs/reference/api'` → `src/content/docs/docs/reference/api/**` → URL `/docs/reference/api/**`(F4,目录 slug 全小写)。
- **入口** = 10 个 `dist/*/index.d.ts`(含 `dist/index.d.ts`)。根入口模块名实测显示为 "index"(取自文件名)——落地时用 TypeDoc 对象入口 `displayName` 或侧栏 label 覆盖为 `@balsa/core`(小瑕疵,实施核对)。
- **dev 策略**:`watch: false`(默认)。生成挂 Starlight `config:setup` 钩子,dev/build/sync 都先落盘再加载(F10),启动重生成一次 ~2s(F15);内容基线钉 ref,dev 无需跟框架源码联动。若开 `watch: true` 需配含入口文件列表的 tsconfig(F13)。
- 配置文件形态:按 #4 教训(TypeDoc 首批 TS7 版不读内联 tsconfig 选项),生成配置写独立文件,不依赖 tsconfig 内联段。

## 3. 覆盖与树形状

- 首发树 = **10 个模块组**(agent / durable-agent / memory / model / observability / schedules / signals / tools / workflows / 组合根),目录按 `classes/functions/interfaces/type-aliases/(variables/namespaces)` 分层(探针 F6)。
- 实测规模:**239 个 .md / ~1028 KB**(插件折叠 13 个非根 README 后;裸 TypeDoc 为 252,差值逐文件核对无残余,F5)。build 全程 6–9s(F15)。
- **侧栏混合**(F7):导出的 `typeDocSidebarGroup` 占位符嵌进手写 sidebar 数组,插件替换为生成组——手写五族分组 + 一个「API Reference」生成组并存;嵌套组硬编码 collapsed,顶层可配。
- 值得注意:同入口在本组合下 TypeDoc **0 警告**,而 #4 控制实验见 10 条「未导出类型」警告——警告是否出现依赖解析环境,**不能作为导出面完整性的可靠信号**(→ §6 权威关卡在框架侧;10 个类型确实仍无页面,缺口是框架导出面事实)。

## 4. 再生成与入库(裁决 4、8 的机制)

**生成树是提交进 balsa-docs 的仓库资产**;`git diff` 即 API 变更面,PR 可审。

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

## 5. 真相源钉法(裁决 5)

- **钉定物 = balsa-framework 的 commit SHA**,消费该 checkout 的 `dist/*.d.ts`;SHA 记在仓库内单一数据文件(建站实施项,与重定向台账同风格)。
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
- **给 #13**:交接口径增两条框架侧前置(§7.1 补导出、§7.2 JSDoc 清源——需在 balsa-framework 落 issue 跟踪,同 examples 英文化先例);建站实施项清单:再生成脚本 + 清理插件(§4)、CI 三红一黄(§6)、钉定 SHA 数据文件(§5)、displayName 覆盖(§2)。
- **给建站 effort**:坑清单见探针报告 §「坑与变通」——Starlight ≥0.39 侧栏 schema 须 `items` 包裹、`src/content.config.ts` 必须手建(0.42 不再自动注入集合定义)、`watch:true` 需 tsconfig、基线噪音(i18n loader / Entry docs 404 / sitemap `site`)与 typedoc 无关。

## 10. 未验证项(诚实清单)

`@kayahr/typedoc` 备胎端到端(别名路线已通,未触发);无 sidebar 占位符时的默认侧栏行为;`typeDoc` 覆盖 `modulesFileName`/`fileExtension` 的影响;locales × `/docs` 嵌套组合;pagefind 对生成页的检索质量;真实仓库内集成(rootDir、expressive-code);`starlight-dot-md` dev 模式。全部属实施核对,不构成未决决策。

---

_由 [决策:API 参考面](https://github.com/0xnicholas/balsa-docs/issues/9) 产出(2026-09-30);管线事实见 `research/api-e2e`(端到端,commit `e26ce80`)与 `research/api-reference`(生成侧,#4);栈级前提见 [stack.md](./stack.md) §7。_
