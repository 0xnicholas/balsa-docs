# 调研:API 参考生成管线（`@balsa/core`）

> 票:[决策:API 参考面](https://github.com/0xnicholas/balsa-docs/issues/4) 的调研票 · 地图:[Wayfinder 地图:balsa 文档站规范](https://github.com/0xnicholas/balsa-docs/issues/1)
> 分支 `research/api-reference` · 2026-09-30 · 环境:macOS / Node v26.2.0 / npm 11.13.0 · 探针目录 `/tmp/typedoc-probe*`、`/tmp/api-probe`（一次性，未改动 balsa-framework 仓库）

## 结论速览

1. **可行,但有一个硬前提**:TypeDoc 0.28.20（当前 latest）的 peer 范围是 TypeScript `5.0.x … 6.0.x`;而 balsa-framework 已用 **TypeScript 7.0.2**——TS 7 是 Go 原生重写,其 JS 模块**不再提供编译器 API**。结果是:在框架仓库里直接装 TypeDoc 会 **npm ERESOLVE 装不上**;强行装上则**启动即崩**。
2. **三条已验证的可行路线**,都能对 `@balsa/core` 的 10 个子路径导出跑出完整参考:
   - **A. TypeScript 6 别名**——`typescript@npm:@typescript/typescript6`,TypeDoc 生态原样可用（推荐）。
   - **B. `@kayahr/typedoc`**——单包内置 TS 6.0.3,项目可继续用 TS 7,免别名（推荐,改动面最小）。
   - **C. `@microsoft/api-extractor` + `api-documenter`**——自带 TS 5.9.3,与项目 TS 7 无关;但产物更粗（rollup 模型 + HTML 表格）。
3. **消费 `dist/*.d.ts` 与消费 `src` 等价**:同样 252 个 `.md`、同一组 10 条警告。→ docs 仓库可以只依赖**已发布的声明文件**,与框架源码/tsconfig/TS 版本解耦。
4. **balsa 特有形态覆盖良好**:`DynamicArgument<T>`、`StandardSchemaV1.InferOutput<TSchema>` 作为泛型参数、以及 `Signals.stream`/`generate` 的**真重载**都正确展开（重载渲染为多个 `Call Signature` 段）。
5. **10 条警告不是工具缺陷**:全部是「内部辅助类型被引用但未从子路径 index 导出」（如 `SchemaInput`、`ResumeDataOf`、`ThenInputAccepts`）——参考树里这些类型没有页面,交叉链接退化为文本。可在导出面补,或接受。

## 1. 事实与版本（全部一手来源）

| 事实 | 值 | 来源 |
| --- | --- | --- |
| 框架 TypeScript | root devDeps `^7.0.2`,本地安装实测 `7.0.2` | `balsa-framework/package.json`、`node_modules/typescript/package.json` |
| TS 7 性质 | Go 原生重写;官方原文:"**it does not ship with an API**。We expect TypeScript 7.1 to ship with a new (and different) API";提供兼容包 `@typescript/typescript6`（导出 `tsc6` + 重新导出 TS 6.0 API,建议用 npm alias 安装） | [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) |
| TypeDoc latest | `0.28.20`,发布 `2026-07-05`;peer `typescript: 5.0.x \|\| … \|\| 6.0.x` | [npm/typedoc](https://www.npmjs.com/package/typedoc)（`npm view typedoc version peerDependencies`） |
| TypeDoc 的 TS7 支持状态 | tracking issue **#3098（OPEN,2026-04-24）**:"not an easy change";计划 TS 7.0 发布后 feature freeze。2026-08-04 作者:"**it works! Mostly**"（约 70–80% 测试通过）;2026-09-18:"目标 7.1 RC";首批预计依赖 nightly TS,且缺 watch 模式 / tsconfig 内联选项 / JSONC 配置文件 / 定义全局变量的入口 | [TypeStrong/typedoc#3098](https://github.com/TypeStrong/typedoc/issues/3098) |
| TypeDoc 版本线 | dist-tags:`latest=0.28.20`、`beta=0.28.0-beta.2`;`1.0.0-dev.1..4` 是**2021 年的旧发布**（`npm view typedoc time` 中早于 0.28.x）,不是 TS7 版本,勿采 | npm registry `typedoc time` |
| TypeDoc 支持 TS 6 | 0.28.x 系列（changelog:"Support TypeScript 6.0, #3084"） | [typedoc Changelog](https://typedoc.org/documents/Changelog.html) |
| `typedoc-plugin-markdown` | `4.13.1`,peer `typedoc: 0.28.x` | npm registry |
| `starlight-typedoc` | `0.23.1`,peer:`@astrojs/starlight >=0.39.0`、`astro >=6.0.0`、`typedoc >=0.28.0`、`typedoc-plugin-markdown >=4.6.0` | npm registry |
| `@kayahr/typedoc` | `0.28.20-bundle.1`（2026-08-08),官方描述 "A drop-in replacement for typedoc, bundling typedoc and its dependencies into a single module";无 dependencies | npm registry |
| `@microsoft/api-extractor` | `7.59.3`,**直接依赖** `typescript: 5.9.3`（自带,非 peer）;`api-documenter` `7.30.17` | npm registry |
| `@balsa/core` 规模 | `0.0.0`,**10 个子路径导出**,57 个 TS 源文件 / 9586 行,`dist/` 58 个 `.d.ts`（10 个子路径 index 齐全） | `packages/core/package.json`、本地实测 |

## 2. 实测矩阵（命令 + 结果）

所有探针在 `/tmp` 下的空白项目里跑,入口指向框架仓库;`$CORE=/Users/nicholasl/Documents/build-whatever/balsa-framework/packages/core`,`$ENTRIES` = 10 个子路径的 `src/*/index.ts`(含 `src/index.ts`),`$DIST_ENTRIES` = 对应的 `dist/*/index.d.ts`。

| # | 探针 | 命令要点 | 结果 |
| --- | --- | --- | --- |
| **A** | 项目内同装 TypeDoc + TS 7 | `npm i -D typedoc@0.28.20 typescript@7.0.2` | ❌ `ERESOLVE`:`Found: typescript@7.0.2` vs `peer typescript@"5.0.x \|\| … \|\| 6.0.x" from typedoc@0.28.20`。**默认装不上** |
| **B** | 强行同装后运行 | `npm i -D --legacy-peer-deps …` → `npx typedoc --entryPoints $ENTRIES --tsconfig $CORE/tsconfig.json` | ❌ 启动即崩:`TypeError: Cannot read properties of undefined (reading 'PropertyDeclaration')`（`typedoc/dist/index.js:537`）——与社区报告一致 |
| **C** | TS 6 别名 | `npm i -D typedoc@0.28.20 "typescript@npm:@typescript/typescript6@6.0.2"` → 同命令 | ✅ `Found 0 errors and 10 warnings`,**262 个 HTML 文件** |
| **C2** | 别名 + markdown 插件（src 入口） | `+ typedoc-plugin-markdown@4.13.1`,`--plugin typedoc-plugin-markdown` | ✅ **252 个 `.md`,1148 KB** |
| **D** | `@kayahr/typedoc`(项目保持 TS 7) | `npm i -D @kayahr/typedoc@0.28.20-bundle.1 typescript@7.0.2` → `npx typedoc …` | ✅ 安装 rc=0;运行时自报 `Using TypeScript 6.0.3 from ./node_modules/@kayahr/typedoc`;`0 errors and 10 warnings`,262 个 HTML 文件 |
| **E** | 别名 + markdown 插件（**dist 入口**） | `--entryPoints $DIST_ENTRIES` | ✅ `0 errors and 10 warnings`,**252 个 `.md`,1084 KB**——与 src 入口同量级、同警告集 |
| **F** | api-extractor（项目保持 TS 7) | `npm i -D @microsoft/api-extractor@7.59.3 typescript@7.0.2` → `npx api-extractor run --local`（需项目内有 `tsconfig.json`,否则 `<lookup>` 报错） | ✅ `API Extractor completed successfully`;`model/*.api.json` 产出;`api-documenter markdown` 单入口产出 **17 个 `.md`** |

探针附注:

- 别名安装的 `@typescript/typescript6@6.0.2` 内部经 `node_modules/@typescript/old`(6.0.3) 暴露 API,因此 TypeDoc 自报 "Using TypeScript **6.0.3**",而 `package.json` 显示 `6.0.2`——版本号以工具自报为准。
- 探针 A 的 `npx typedoc`(无本地依赖时) 会自动装一份**满足 peer 的 TS 6**,所以「npx 能跑」不能证明「项目 TS 7 能跑」;必须看 TypeDoc 自报的 `Using TypeScript …` 路径(加 `--logLevel Verbose`)。
- 探针 F 的 `ae-forgotten-export` 警告(如 `AgentConfig`、`StandardSchema`、`WorkflowBuilder` 需由入口导出)说明 api-extractor 的 rollup 模型要求**每个入口符号自洽**;10 个子路径需 10 个入口或一个 rollup。

## 3. balsa 特有形态的覆盖

样板产出(探针 E,`markdown-dist/`):根 `README.md` + 10 个子路径目录,共 252 个 `.md`,一符号一文件,如 `agent/classes/Agent.md`、`agent/type-aliases/DynamicArgument.md`、`tools/namespaces/StandardSchemaV1/type-aliases/InferOutput.md`。

| 形态 | 渲染结果 | 判定 |
| --- | --- | --- |
| `DynamicArgument<T>` | `> **DynamicArgument**\<T\> = T \| ((ctx) => T \| Promise\<T\>)`,页面保留 JSDoc 原文,属性处渲染为 `[DynamicArgument](../type-aliases/DynamicArgument.md)<string>` | ✅ |
| `StandardSchemaV1.InferOutput<TSchema>` | 作为泛型参数出现在方法签名里,并生成 `tools/namespaces/StandardSchemaV1/type-aliases/InferOutput.md`;`Standard Schema` 非 zod,**无需 `typedoc-plugin-zod`** | ✅ |
| **真重载**(`Signals.stream` / `generate`:泛型 structuredOutput 版 + 普通版） | 渲染为 `### stream()` → `#### Call Signature` ×2,各自带类型参数与说明 | ✅ |
| `namespace`(StandardSchemaV1 / StandardJSONSchemaV1) | 生成 `namespaces/<ns>/type-aliases/*.md` 与 `<ns>/README.md` | ✅ |
| 源码定位链接 | src 入口:文本是本地绝对路径 `../../../Users/…`,链接指向 `https://github.com/0xnicholas/balsa-framework/blob/<sha>/packages/core/src/…`;dist 入口:只有本地路径,**无链接** | ⚠️ 需在 docs 管线里显式配 `--gitRevision` / sourceLinkTemplate 才能得到站点可用的干净链接 |
| 10 条警告 | `BranchStepOf`、`DataSchema`、`KeyedOutputsOf`、`ResumeDataOf`、`SchemaInput`、`SchemaOutput`、`SpanFields`、`SuspendPayloadOf`、`ThenInputAccepts`、`WorkflowDefinition` —— 被公共签名引用但未纳入文档 | ⚠️ 覆盖缺口:这些类型无页面,交叉链接退化为纯文本;src 与 dist 入口结果一致 |

## 4. 「别指望开箱支持」的点

1. **TS 7 项目里 TypeDoc 装不上**:peer 冲突是硬阻断,不是警告。任何路线都必须先解决这一层(别名 / 自带 TS 的 bundle 包 / 自带 TS 的其他工具)。
2. **TypeDoc 正式支持 TS 7 无时间表**:作者业余时间推进,当前承诺是「尽量赶 7.1 RC」,首批可能依赖 nightly TS 并缺功能([#3098](https://github.com/TypeStrong/typedoc/issues/3098))。依赖插件链(`typedoc-plugin-markdown` 锁 0.28.x、`starlight-typedoc` 锁 `typedoc >=0.28`)在 TypeDoc 升到 TS7 版后需要跟着升。
3. **TypeDoc 首批 TS7 版不会读 tsconfig 内联选项、也会对 JSON/JSONC 配置报错**(作者原话列出的缺失项)→ 参考配置应写进 `typedoc.config.js` 这类文件。
4. **api-extractor 是另一套模型**:TSDoc + rollup,`.api.json` 是稳定中间产物,但 markdown 产物是 HTML 表格 + "Do not edit" 头,样式与交叉链接要自己接管;每入口需符号自洽。
5. **未导出的内部类型不会有参考页**:balsa 的 10 个子路径 index 只导出公共面,签名里引用的深层辅助类型(见上表 10 条)需要单独决策。

## 5. 推荐路线

**首选 —— docs 仓库自带工具链,消费 `dist/*.d.ts`,TypeScript 用 6.x 别名(或 `@kayahr/typedoc`)**

- 依赖(`balsa-docs` 的 devDependencies):`typedoc@0.28.20` + `typescript@npm:@typescript/typescript6` + `typedoc-plugin-markdown@4.13.1`(+ 若走 Starlight 再加 `starlight-typedoc@0.23.1`),以及**钉版本的** `@balsa/core`。
- 入口:`@balsa/core` 的 10 个 `dist/*/index.d.ts`(不是 src)——入口即「发布契约」,与框架 TS 7 解耦,框架可继续升 TS。
- 免别名的等价变体:`@kayahr/typedoc@0.28.20-bundle.1` 一个包搞定(项目保留 TS 7,实测通过)。
- 理由:`typedoc-plugin-markdown` 的产物是**纯 Markdown + 类型签名**(252 个文件,~1.1 MB),天然满足「agent 面向」与静态站接入;`starlight-typedoc` 的 peer 组合已核实兼容这条路线的版本。
- 配套:CI 漂移检查 = 对钉版本的 `@balsa/core` 重新生成 + `git diff --exit-code`(红/黄口径留「API 参考面」票定)。

**备选 —— api-extractor**(需要 `.api.json` 作为稳定中间产物、或想走 TSDoc 校验时)。自带 TS 5.9.3,不受 TS 7 影响;代价是产物更粗、markdown 需二次加工、每入口要自洽。

**已否决**:

- 在框架仓库里用项目 TS 7 直接跑 TypeDoc(启动崩);
- 等 TypeDoc 正式支持 TS 7 再动(无时间表,且不解决今天的问题);
- `typedoc@1.0.0-dev.*`(2021 年旧发布,与 TS7 无关)。

## 6. 未验证 / 待决

- **starlight-typedoc 端到端未验证**(需要 Astro/Starlight 项目;本次只核对了 peer 组合与 TypeDoc 产物形态)。
- **TypeDoc 的 TS7 支持落地时间**无承诺,截至 2026-09-18 状态为「目标 7.1 RC」([#3098](https://github.com/TypeStrong/typedoc/issues/3098));届时插件链版本需重新对账。
- **252 个页面如何折进 IA**(一符号一页 vs 按子路径聚合、是否只公开主入口)属[决策:API 参考面](https://github.com/0xnicholas/balsa-docs/issues/4)。
- **api-extractor 的 10 入口版未实测**(只测了单入口 `dist/index.d.ts`)。
- **10 条未导出类型警告是否要补导出**未决(涉及 `@balsa/core` 的公共导出面,可能需要框架侧配合)。

## 附:复现命令

```bash
CORE=/Users/nicholasl/Documents/build-whatever/balsa-framework/packages/core
ENTRIES="$CORE/src/index.ts $CORE/src/model/index.ts $CORE/src/agent/index.ts $CORE/src/tools/index.ts $CORE/src/observability/index.ts $CORE/src/workflows/index.ts $CORE/src/memory/index.ts $CORE/src/signals/index.ts $CORE/src/durable-agent/index.ts $CORE/src/schedules/index.ts"
DIST_ENTRIES="${ENTRIES//\/src\//\/dist\/}"; DIST_ENTRIES="${DIST_ENTRIES//.ts/.d.ts}"

# A/B —— 失败复现
npm i -D typedoc@0.28.20 typescript@7.0.2            # ERESOLVE
npm i -D --legacy-peer-deps typedoc@0.28.20 typescript@7.0.2 @types/node@22
npx typedoc --entryPoints $ENTRIES --out out-b --tsconfig $CORE/tsconfig.json   # PropertyDeclaration 崩溃

# C —— TS6 别名(成功)
npm i -D typedoc@0.28.20 "typescript@npm:@typescript/typescript6@6.0.2" @types/node@22
npx typedoc --entryPoints $ENTRIES --out out-c --tsconfig $CORE/tsconfig.json
npm i -D typedoc-plugin-markdown@4.13.1 --legacy-peer-deps
npx typedoc --entryPoints $ENTRIES --plugin typedoc-plugin-markdown --out markdown-c --tsconfig $CORE/tsconfig.json

# D —— bundle 包(项目保持 TS7)
npm i -D @kayahr/typedoc@0.28.20-bundle.1 typescript@7.0.2 @types/node@22
npx typedoc --version            # "Using TypeScript 6.0.3 from ./node_modules/@kayahr/typedoc"
npx typedoc --entryPoints $ENTRIES --out out-d --tsconfig $CORE/tsconfig.json

# E —— dist 入口
npx typedoc --entryPoints $DIST_ENTRIES --plugin typedoc-plugin-markdown --out markdown-dist

# F —— api-extractor(自带 TS 5.9.3;项目内需有 tsconfig.json)
npm i -D @microsoft/api-extractor@7.59.3 @microsoft/api-documenter@7.30.17 typescript@7.0.2
cp -R "$CORE/dist/." . && npx api-extractor run --local
npx api-documenter markdown -i model -o md
```
