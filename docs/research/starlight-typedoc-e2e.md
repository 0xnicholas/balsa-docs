# 探针:starlight-typedoc × @balsa/core 端到端

> 票:[决策:API 参考面](https://github.com/0xnicholas/balsa-docs/issues/9) · 地图:[Wayfinder 地图:balsa 文档站规范](https://github.com/0xnicholas/balsa-docs/issues/1)
> 分支 `research/api-e2e` · 2026-09-30 · 环境:macOS 13.7.8 / Node v26.2.0 / npm 11.13.0
> 工作目录 `/tmp/balsa-typedoc-probe`(入口副本 `/tmp/probe-entry/core-dist` = 框架 dist 逐字节拷贝)。**两个真实仓库全程零写入**(结束时双方 `git status --porcelain` 均为 0 行)。
> 上游调研:[调研:API 参考生成管线](https://github.com/0xnicholas/balsa-docs/issues/4)(`docs/research/api-reference.md` @ `research/api-reference`)——本探针补 starlight-typedoc 端到端一段。

## 实测版本表(工具自报)

| 包 | 要求 | 实测自报 |
|---|---|---|
| astro | ^7.3.5 | **7.3.5** |
| @astrojs/starlight | ^0.42.4 | **0.42.4**(页面 meta: `Starlight v0.42.4`) |
| starlight-typedoc | 0.23.1 | **0.23.1** |
| typedoc | 0.28.20 | **0.28.20**(`typedoc --version`) |
| typedoc-plugin-markdown | 4.13.1 | **4.13.1** |
| typescript(别名) | `npm:@typescript/typescript6@6.0.2` | 包名/版本 `@typescript/typescript6 6.0.2`;**tsc 自报 `Version 6.0.3`**,typedoc 自报 `Using TypeScript 6.0.3`——npm 包 6.0.2 内嵌编译器串为 6.0.3,仍在 peer 范围 `6.0.x` 内 |
| node / npm / macOS | — | v26.2.0 / 11.13.0 / 13.7.8 (22H730) |

## 事实清单(每条附证据)

**F1 · 安装:TS6 别名路线一次通过,无 ERESOLVE、无运行崩。**
`npm install astro@^7.3.5 @astrojs/starlight@^0.42.4 starlight-typedoc@0.23.1 typedoc@0.28.20 typedoc-plugin-markdown@4.13.1 "typescript@npm:@typescript/typescript6@6.0.2"` → `added 290 packages … found 0 vulnerabilities`。**@kayahr/typedoc 备胎未动用**(未测,因不需要)。

**F2 · 配置方式:两种都成立。** ① `astro.config.mjs` 里 `starlight({ plugins: [starlightTypeDocPlugin({ entryPoints, output, sidebar, tsconfig?, typeDoc?, watch?, pagination?, errorOnEmptyDocumentation? })] })`(源码 `index.ts` 的 `StarlightTypeDocOptions`);② 独立 `typedoc.json`(插件在 `Application.bootstrapWithPlugins` 注册了 `TypeDocReader`/`PackageJsonReader`)。**实测**:把 `entryPoints` 从插件 options 移到 `typedoc.json` 后 `astro sync` 仍生成 239 个文件。插件强制默认(可用 `typeDoc` 覆盖):`excludeInternal/Private/Protected: true`、`readme: 'none'`、markdown 侧 `hideBreadcrumbs/hidePageHeader/hidePageTitle: true`;typedoc-plugin-markdown 被自动追加加载,无需手装进 plugin 列表。

**F3 · 产物落点可配到目标位置。** `output` 选项相对 `src/content/docs/`,支持嵌套路径:`output: 'docs/reference/api'` → 文件落在 **`src/content/docs/docs/reference/api/`**,即目标落点实测可达。日志:`[starlight-typedoc-plugin] markdown generated at ./src/content/docs/docs/reference/api`。

**F4 · URL 前缀 `/docs` 成立。** Starlight 0.42.4 的内容集合固定在 `src/content/docs`(源码注释明确「用户自定义 content 目录暂不支持」),但任意嵌套子目录天然支持:手写页 `src/content/docs/docs/guides/get-started.md` → `/docs/guides/get-started/`;生成页 `/docs/reference/api/agent/classes/agent/`(dev curl 200)。目录全 slug 小写。

**F5 · 生成文件数与警告。** 生成 **239 个 .md**;**TypeDoc 警告 0 条**(预期 10 条未出现)。对照:同 10 个入口跑裸 `typedoc` CLI + typedoc-plugin-markdown = **252 个 .md**(与上游调研吻合),仅 2 条无关警告(git remote、未指定 name)。差值 13 = 插件删除的 13 个非根 `README.md`(10 模块 + 1 `index/` 模块 + 3 个 `tools/namespaces/Standard*V1/`),`comm -23` 逐文件核对,零残余差异。上游那 10 条「未导出类型」警告在本组合/本入口形态下不出现(更优)。

**F6 · 目录树形状(3 层示例)。**

```
docs/reference/api/
├── README.md                      ← 孤儿页(见 F8)
├── agent/{classes,functions,interfaces,type-aliases}/*.md
├── durable-agent/{functions,interfaces}/*.md
├── index/{functions,interfaces}/*.md     ← "." 入口,模块名显示为 "index"
├── memory/{classes,functions,interfaces,type-aliases}/*.md
├── model/{classes,functions,interfaces,type-aliases,variables}/*.md
├── observability/…  schedules/…  signals/…  tools/…(含 namespaces/…)  workflows/…
```

**F7 · 侧栏:自动生成 + 手写混合成立。** 导出的 `typeDocSidebarGroup` 占位符放进手写 sidebar 数组,插件替换为生成组。实测侧栏标签序列:`Guides(手写 autogenerate)→ API Reference(插件 label 可配)→ agent → Classes/Interfaces/Type Aliases/Functions → durable-agent → …` 共 10 个模块组、242 条 API 链接。嵌套组硬编码 collapsed,顶层组可配 `sidebar.collapsed`。

**F8 · 已知缺陷:孤儿 README 页 + 10 条死链。** 插件删除非根 README(删除正则 `^.+[/]README\.md$` 恰好放过根级),但根 `README.md` 保留成孤儿页 `/docs/reference/api/readme/`(不在侧栏),其内 10 个 `[agent](/docs/reference/api/agent/readme/)` 式链接全部指向被删除的页面——dist 中逐个核验 `MISSING`。**这是本组合真实缺陷**,决策票需计一笔(可考虑配 readme 选项改道,未实测)。

**F9 · 生成页 frontmatter 由插件注入**:`editUrl: false`、`next/prev: false`(pagination 开则 true)、`title: "Agent"`(带引号防特殊字符)。正文含 `Defined in: <输出文件→源 .d.ts 的相对路径>`——**产物内容依赖入口路径**,CI 重生成需在稳定路径下跑(真实仓库内天然满足)。

**F10 · 机制:生成发生在 Starlight `config:setup` 钩子内、被 await**,`dev`/`build`/`sync` 都先落盘再进内容加载;`preview` 明确跳过(实测:删掉产物后 `astro preview` 0 次生成、目录未复活)。

**F11 · 模式 A「产物入库 + CI 重生成 diff 门」:✅ 成立。** 239 个产物 commit 后重跑 `astro build` → `git status --porcelain` 输出 **0 行**(diff 门通过)。确定性:同一入口路径连续两次全量重生成,全树 `shasum` 哈希逐字节相同(`06ae28bc…`)。变更入口路径后哈希变(F9 的 Defined in 路径),属预期。

**F12 · 模式 B「构建时生成不入库」:✅ 成立。** `.gitignore` 加 `src/content/docs/docs/reference/api/`,`rm -rf` 产物与 dist 后冷 `astro build` → **241 页全部建成**,`git status` 中该目录 0 条。

**F13 · dev/watch 行为。** 默认(`watch:false`):dev 启动时生成 1 次(实测日志 1 条 + 页面 200),不监听文件。`watch:true`:**前置条件是必须有产出文件列表的 `tsconfig.json`**,否则硬错误 `The provided tsconfig file looks like a solution style tsconfig, which is not supported in watch mode`(TypeDoc 在 `getFileNames()` 为空时的报错——探针起初无 tsconfig 触发)。补上含入口 `include` 的 tsconfig 后:入口改动自动重生成(日志 1→2 次),向拷贝的 `agent/index.d.ts` 追加真实导出后新页面 `agent/variables/probeWatchMarker3.md` 如期出现。另注意:入口是**显式命名 re-export**(`export { Agent } from './agent.js'`),改内部文件但不改入口面 → 不会出现在产物中(正确行为,非 bug)。

**F14 · starlight-dot-md 0.2.1:✅ 成立。** twin 落点为**页面目录旁的 `<slug>.md`**(不是 `<route>/index.md`):`dist/docs/reference/api/agent/classes/agent.md`,preview curl **200**;手写页与孤儿 README 的 twin 也 200。240 个 twin / 241 页(404 无 twin)。twin 是加工后的 markdown(frontmatter 已解析填充)。

**F15 · 规模与耗时。** 生成树 **239 文件 / 1028 KB**;build 产物 241 HTML + 240 twin + pagefind,**dist 27,888 KB**;`astro build` 全程 ~6–9s(其中 typedoc 生成 ~2s;`astro sync` 单独 ~5s)。

**F16 · 基线噪音(与 typedoc 无关,裸 Starlight 配置同现)**:`[starlight-i18n-loader] base directory src/content/i18n does not exist`、`collection "i18n" … empty`、`Entry docs → 404 was not found`、sitemap 需 `site` 选项。均已用无插件裸配置复现排除关联。

## 坑与变通(按踩坑顺序)

1. **Starlight ≥0.39 侧栏 schema 变更**:`{label, autogenerate}` 报错,须写 `{label, items:[{autogenerate:{directory}}]}`(错误信息自带修复指引)。
2. **必须手建 `src/content.config.ts`**(`docsLoader()`/`i18nLoader()` + `docsSchema()`/`i18nSchema()`),否则 docs 集合为空、build 只有 404——Starlight 0.42 不再自动注入集合定义。
3. **`watch:true` 需 tsconfig 文件列表**,无 tsconfig 时报 "solution style" 硬错误(误导性文案);变通:最小 tsconfig.json `include` 入口 .d.ts。
4. 孤儿 README + 10 死链(F8)。
5. 根入口模块名显示为 **"index"**(来自 `dist/index.d.ts` 文件名),观感欠佳,决策票可计为命名小瑕疵。
6. 探针初版还遇到:Starlight 无 `./package.json` exports 不能 require 版本号(读文件绕过)——记录性,不影响目标。

## 两种产物模式判定

| | 产物入库 + CI diff 门 | 构建时生成不入库 |
|---|---|---|
| 判定 | **✅ 成立** | **✅ 成立** |
| 证据 | 239 产物入库→重建→`git status` 0 行;全树哈希两连相同 | gitignore+删光→冷 build 241 页;git 0 条 |
| 注意点 | 产物内嵌入口相对路径(F9),CI 须在仓库内稳定路径跑;页面 diff 噪声 = 239 文件级 | preview 不重生成(F10)——CI 若只跑 preview 校验会踩坑;`watch:true` 需 tsconfig |

两模式机制同源:生成都在 astro 命令(除 preview)的 config 钩子里同步完成、先于内容加载落盘。差异只在 git 策略。

## 未验证项

- `@kayahr/typedoc` 备胎路线(别名路线全通,未触发)。
- 完全不配 sidebar(无占位符)时 API 是否进默认自动侧栏。
- `typeDoc` 覆盖 markdown 插件项(如 `modulesFileName`、自定义 `fileExtension`)对落点/文件数的影响。
- locales/i18n 与 `/docs` 嵌套的组合。
- `watch:true` 下 Astro dev 对新落盘内容的热加载(重生成已证实;dev 内热更新未验)。
- pagefind 检索质量(仅确认索引 241 页成功)。
- 真实 balsa-docs 仓库内集成(rootDir、既有 expressive-code 等)。
- starlight-dot-md 在 dev 模式(仅 build+preview 验证)。

## 探针资产

`/tmp/balsa-typedoc-probe/`(含 scratch git 历史)、`/tmp/probe-entry/core-dist/`(框架 dist 副本,含探针标记改动)、日志 `/tmp/sync-log.txt`、`/tmp/build-log.txt`、`/tmp/dev-watch-log{,2,3}.txt`、`/tmp/preview-skip.txt`。
