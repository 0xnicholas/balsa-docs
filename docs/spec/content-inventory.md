# 内容盘点:framework 原料 → 候选公开页面映射与 MVP 内容清单(草稿)

> **状态**:草稿 v0.1,供 [决策:内容边界与真相源](https://github.com/0xnicholas/oribos-docs/issues/6) / [决策:IA 与多项目缝](https://github.com/0xnicholas/oribos-docs/issues/7) / [决策:API 参考面](https://github.com/0xnicholas/oribos-docs/issues/9) 消费。
> **来源**:[任务:内容盘点——framework 原料清点与 MVP 内容清单草稿](https://github.com/0xnicholas/oribos-docs/issues/5)。
> **原料快照**:`oribos-framework` @ `c7ce114`(2026-09-30,工作树干净)。
> **口径**(沿地图 Notes,本文件不重开):英文优先;内容基线 = 当前已实现面 **M1–M4**(agent / tools / memory / workflows / harness 三件套 / observability / 模型契约 / 存储 port);读者 = 框架使用者;M5 能力包(OTLP / MCP server + client / SQLite adapter / AI SDK 互操作 / bunfold 桥)只做「预留位」不写内容;内部工程文档只作改写原料,不搬运结构。
> **本文件不裁决**:进站清单与改写规则的最终裁决归 #6;URL / 顶栏车道 / 版本化归 #7;API 参考生成管线归 #9;托管与域名归 #10;品牌视觉归 #12。此处只给「映射 + 草稿 + 缺口」。

## 0. 判定口径与成本标尺

**三类判定**

- **候选公开页(改写)**:该原料应成为站点页面(一个或多个 URL),以英文用户向叙事改写。
- **仅作背景(内部)**:内容有改写价值,但只作页面背后的论证/事实来源;原文不进站、不作公开链接目标。
- **不进站**:与框架使用者无关,连改写价值也低。

**改写成本标尺**(单页口径)

- **低**:结构可保留,英文化 + 删减即可(如 examples 的 README 已是英文)。
- **中**:需重组叙事、补用户向语境、裁内部词(如 subsystem 规范 → 概念页)。
- **高**:需跨多篇合成、或按用户视角重建体量(如 `workflows.md` 含 #49–#54 实施期裁决),或依赖尚不存在的基础设施(如 API 参考管线)。

**页面单位 = URL,不是仓库文件**:一个文件可拆多页(`agent.md`),多文件可并一页(概念总览)。

### 原料总账

| 原料 | 件数 | 体量 | 语言 | 判定概览 |
| --- | --- | --- | --- | --- |
| `README.md` | 1(10 章 + 首段) | 13.6 KB | 英文 | 候选公开页(章节级映射) |
| `docs/architecture/*` | 8 | 70.3 KB | 中文 | 候选公开页(8/8 都有对应概念面) |
| `docs/adr/*` | 15 | 43.7 KB | 中文 | 仅作背景(13)/ 不进站(2) |
| `docs/ROADMAP.md` | 1 | 12.8 KB | 中文 | 仅作背景 |
| `CONTEXT.md` | 1 | 12.3 KB | 中文 | 仅作背景(兼术语真相源) |
| `examples/*` | 5 | README 26.5 KB + src 1,632 行 | 英文(源码含中文串) | 候选公开页(walkthrough) |
| `docs/research/*` | 7 | 142.7 KB | 中文 | 仅作背景 / 不进站 |
| **合计** | **38** | **~322 KB** | — | — |

补充事实:`@oribos/core` 当前 **10 个子路径导出**(`.` / `model` / `agent` / `tools` / `observability` / `workflows` / `memory` / `signals` / `durable-agent` / `schedules`);version `0.0.0`,npm registry 无包;engines `>=22.12.0`,纯 ESM。

## 1. 逐件清点与判定

### 1.1 `README.md`(章节级,10 章 + 首段)

| 章节 | 判定 | 成本 | 指向候选页 / 理由 |
| --- | --- | --- | --- |
| 首段 + Status(pre-1.0、版本计划 0.1.0→0.5) | 候选公开页 | 低 | Introduction 的 Status 段;发布口径与 #10 交付票耦合 |
| Why Oribos(轻量的两层含义) | 候选公开页 | 低 | Introduction 主体;差异化叙事的主料 |
| Requirements(Node ≥22.12、provider 包) | 候选公开页 | 低 | Installation |
| Install | 候选公开页 | 低 | Installation;**当前未发布 npm**,口径需裁决(见缺口 G1)。**#30 已落地:0.5.0 上 npm,主路径 = `npm install @balsats/core`（0.5.0 旧 scope；#48 更名后页内写 `@oribos/core`）** |
| Quick start(代码块) | 候选公开页 | 低 | Quickstart(去 ADR 引用、补「下一步」) |
| What's in the box(7 个子系统段) | 候选公开页 | 低–中 | 7 个子系统页的种子段;每段需扩成 1–2 页 |
| Package surface(子路径表) | 候选公开页 | 低 | Import map;M5 能力包留占位行 |
| Examples(5 行 + 运行说明) | 候选公开页 | 低 | Examples 索引;运行说明并入 Quickstart 的「跑起来」 |
| Documentation(仓库内索引) | 不进站 | — | 内部导航,站点自有导航取代 |
| Development(`pnpm verify` 等) | 仅作背景 | 低 | 可选「Contributing」页 |
| License | 不进站 | — | 站点页脚 |

### 1.2 `docs/architecture/*`(8 篇)

| 文件 | 判定 | 成本 | 指向候选页 / 理由 |
| --- | --- | --- | --- |
| `README.md`(索引,1.3 KB) | 仅作背景 | — | 内部阅读顺序;其子系统关系图对 #7 有参考价值 |
| `model.md`(5.4 KB) | 候选公开页 | 中 | Models;裁 vendor / spec / ADR 内部词,只讲「AI SDK 实例直传 + fallback 链 + 零适配器」 |
| `agent.md`(13.0 KB) | 候选公开页 | 中–高 | Agents(概念);另供 Streaming & output objects / Dynamic configuration / Processors / Multi-agent 四页原料——单文件拆多页 |
| `tools.md`(8.8 KB) | 候选公开页 | 中 | Tools;MCP 两包 = M5 预留位 |
| `workflows.md`(19.3 KB) | 候选公开页 | 高 | Workflows(+ Control flow / Suspend & resume);体量最大且含 #49–#54 实施期裁决,须按用户视角重建 |
| `memory.md`(7.1 KB) | 候选公开页 | 中 | Memory;port 细节下沉到 Storage 页 |
| `observability.md`(10.0 KB) | 候选公开页 | 中 | Observability;OTLP = M5 预留位 |
| `storage.md`(5.5 KB) | 候选公开页 | 中 | Storage & adapters + Writing a storage adapter;port 表是参考面素材 |
| `harness.md`(8.7 KB) | 候选公开页 | 中 | Durable agents / Signals / Schedules 三页;「Harness」分类名本身不进站 |

### 1.3 `docs/adr/*`(15 份)

| ADR | 主题 | 判定 | 指向 / 理由 |
| --- | --- | --- | --- |
| 0001 | 轻量的定义(按需组合 + 无运行时负担) | 仅作背景 | Introduction 立场来源;「数字不作对外定义」该立场本身由 #6 复核 |
| 0002 | 包结构:核心单包 + 能力包,组合根可选 | 仅作背景 | Package structure / Import map 页 |
| 0003 | Schema 校验契约:Standard Schema 双接口 | 仅作背景 | Schemas & validation 页;用户面向只需「直接用 zod@4」 |
| 0004 | 模型层:双轨契约 + 单一 spec 版本 + 自有 chunk 协议 | 仅作背景 | Models 页「为什么不内置 provider 注册表」的论证 |
| 0005 | Agent 表面:五字段 + Processor 唯一横切点 | 仅作背景 | Agents / Processors 页 |
| 0006 | Workflow 引擎:扁平条目 + 快照 port 化 | 仅作背景 | Workflows / Suspend & resume 页 |
| 0007 | Memory 语义:薄语义层 + thread/resource | 仅作背景 | Memory 页 |
| 0008 | Tools/MCP:四字段 + 两参 execute + 双能力包 | 仅作背景 | Tools 页 + MCP 预留位 |
| 0009 | Observability:自有 span 模型 + 三事件导出 | 仅作背景 | Observability 页 |
| 0010 | 存储:port 集合 + 统一 adapter 家族 | 仅作背景 | Storage & adapters / Writing a storage adapter 页 |
| 0011 | Harness:文档分类 + 三件套最小集 | 仅作背景 | Durable agents / Signals / Schedules 页 |
| 0012 | 多 agent:as-tool 组合,零内建协议 | 仅作背景 | Multi-agent composition 页 |
| 0013 | 命名与品牌:oribos / `@oribos/*` | 仅作背景 | Introduction 与页脚命名;定位一句话可直用 → 品牌票 #12 |
| 0014 | 构建与测试工具链(TS 直出 ESM + Vitest) | 不进站 | 内部工程;仅 Contributing 页可引大意 |
| 0015 | CI 轻量红线(零依赖硬闸 + 字节预算黄灯) | 不进站 | 内部工程;同上 |

> 打包判定:**ADR 整体不进站**(要否有公开 ADR 面,是 #6「内部文档对外边界」的裁决点);上表 13 份的「仅作背景」指作为页面论证原料。

### 1.4 `docs/ROADMAP.md`

- **仅作背景**。支撑三件事:① 内容基线口径(M1–M4);② 版本序列(0.1.0 → 0.2 → 0.3 → 0.5,0.4 跳空;1.0 门槛已搁置);③ 发布形态(GitHub Release notes,仓库不设 `CHANGELOG.md`)。
- 候选页「Release status」后置;**「延后清单 / 重开条件」是对外承诺边界,公开与否归 #6**。

### 1.5 `CONTEXT.md`(framework 术语表)

- **仅作背景**,兼**术语真相源**:全站写作的用词以它为准(thread / resource / 动态参数 / 输出对象 / 快照 / 迭代现场 / 工作记忆 / 能力包 / 组合根 …)。
- 候选页 **Glossary**:需英文化并裁内部术语(如「重开条件」),成本 中。

### 1.6 `examples/*`(5 个)

| example | 判定 | 成本 | 指向 / 备注 |
| --- | --- | --- | --- |
| `minimal-agent`(89 行) | 候选公开页 | 低 | Quickstart 的可跑版 + Walkthrough |
| `memory-chat`(193 行) | 候选公开页 | 低 | Memory 页走读(两 thread + 工作记忆 + recall) |
| `workflow-approval`(476 行) | 候选公开页 | 低 | Workflows / Suspend & resume 走读 |
| `durable-approval`(393 行) | 候选公开页 | 低 | Approval gates 走读;**源码与 README 含中文串**(「用户拒绝」「审批闸」),公开前需英文过一遍 |
| `signals-desk`(481 行) | 候选公开页 | 低–中 | Signals / Schedules 走读;**`act()` 打印的标题是中文**,公开前需英文过一遍 |

> 共性备注:README 均已是英文、且自带「可见 span 清单」与「自断言」叙事,是站点最省力的原料;源码注释里引用内部规范路径(如 `docs/architecture/harness.md`「审批闸」)会在公开后进入读者视野——**examples 的引用方式(手抄 / 抽取 / 链接)归 #6**。

### 1.7 `docs/research/*`(7 篇)

| 文件 | 判定 | 备注 |
| --- | --- | --- |
| `lightweight-benchmarks-mcp.md` | 仅作背景 | 轻量基准 + MCP 依赖成本;数字对外立场 = ADR-0001 → #6 复核 |
| `mastra-agent-model-layer.md` | 仅作背景 | Models / Agents 页「为什么这样砍」的对照事实 |
| `mastra-memory.md` | 仅作背景 | Memory 页对照事实 |
| `mastra-workflows.md` | 仅作背景 | Workflows 页对照事实 |
| `mastra-harness.md` | 仅作背景 | Harness 三页对照事实 |
| `observability-references.md` | 仅作背景 | Observability 页对照事实 |
| `mastra-gap-analysis.md` | 仅作背景 | **§3「形状内语义差异(迁移会踩的点)」= Coming from Mastra 页原料**;§5 现实差距 = 缺口清单来源 |
| 共同 | 不进站 | 调研面向内部,结论已被 ADR / 规范吸收,站点不引用原文 |

## 2. 候选公开页映射(建议英文标题 + 原料指针)

分组是**内容族建议**,最终车道划分归 #7。推荐轴是 ownership(框架拥有的概念 / 生态用法 / 精确签名 / 生成数据,[#2 调研的 IA 结论](https://github.com/0xnicholas/oribos-docs/issues/2))而非「页面类型」。

### 2.1 Get started(上手)

1. **Introduction**(What is Oribos?) — 原料:`README.md` 首段 + Why Oribos + Status;`docs/adr/0001`、`docs/adr/0013` 定位句;成本 低。备注:轻量主张只讲两层含义,不引字节数字。
2. **Installation** — 原料:`README.md` Requirements + Install;`packages/core/package.json`(engines / ESM);成本 低。备注:**未发布 npm 的现状须给「从仓库使用」路径**(G1)。**#30 已落地:未发布口径摘除,主路径 = `npm install @balsats/core`(0.5.0,旧 scope),仓库路径降为开发路径**。
3. **Quickstart** — 原料:`README.md` Quick start + Examples 运行说明;`examples/minimal-agent/README.md`;成本 低。
4. **Concepts overview**(心智模型:子路径导入 / agent / tools / memory / workflows / 一切皆可选) — 原料:`README.md` What's in the box 引言 + `CONTEXT.md` + `docs/architecture/README.md` 子系统关系(**无单一原料,需合成**);成本 中。见 G2。

### 2.2 Concepts(概念)

5. **Agents** — 原料:`docs/architecture/agent.md`(定位 / 定义表面 / 执行语义 / loop)、`README.md` Agents、`examples/minimal-agent/README.md`;成本 中–高。
6. **Models** — 原料:`docs/architecture/model.md`、`docs/adr/0004`;成本 中。
7. **Tools** — 原料:`docs/architecture/tools.md`、`README.md` Agents 段、`examples/minimal-agent/README.md`;成本 中。MCP 为 M5 预留位。
8. **Memory** — 原料:`docs/architecture/memory.md`、`examples/memory-chat/README.md`、`docs/adr/0007`;成本 中。
9. **Workflows** — 原料:`docs/architecture/workflows.md`(定位 / 定义表面 / 算子表)、`examples/workflow-approval/README.md`、`docs/adr/0006`;成本 高。
10. **Observability** — 原料:`docs/architecture/observability.md`(span 模型 / 七边界 / 上下文)、`docs/adr/0009`、各 example README 的「Observability」节;成本 中。
11. **Storage & adapters** — 原料:`docs/architecture/storage.md`、`docs/architecture/{memory,workflows,harness}.md` 的 port 定义节、`docs/adr/0010`;成本 中。
12. **Durable execution & background work**(harness 三件套概览) — 原料:`docs/architecture/harness.md`(定位 + 三节);成本 中。备注:「Harness」是内部文档分类名,页面标题建议用户向措辞。

### 2.3 Guides(任务向)

13. **Streaming & output objects** — 原料:`docs/architecture/agent.md`「执行语义」、`README.md` Quick start 注释;成本 中。
14. **Dynamic configuration**(动态参数 + RequestContext) — 原料:`docs/architecture/agent.md`「定义表面」动态参数段、`CONTEXT.md` RequestContext;成本 中。
15. **Structured output** — 原料:`docs/architecture/agent.md`「structuredOutput」、`docs/adr/0003`;成本 低–中。
16. **Processors**(guardrails / 脱敏 / 限流 / evals 的挂载点) — 原料:`docs/architecture/agent.md`「扩展点:Processor」、`docs/adr/0005`;成本 中。
17. **Multi-agent composition**(agents as tools) — 原料:`docs/architecture/agent.md`「多 agent 组合」、`docs/architecture/tools.md`「组合范式」、`docs/adr/0012`;成本 中。
18. **Schemas & validation**(Standard Schema 双接口) — 原料:`docs/adr/0003`、`docs/architecture/tools.md`「schema 契约」、`docs/architecture/workflows.md`「IO 校验」;成本 中。
19. **Workflows: control flow**(then / parallel / branch / foreach / dowhile / dountil / sleep 参考) — 原料:`docs/architecture/workflows.md`「控制流算子」;成本 中。
20. **Suspend & resume**(含块内挂起与迭代现场) — 原料:`docs/architecture/workflows.md`「suspend/resume 与快照」「块内挂起」、`examples/workflow-approval/README.md`;成本 中–高。
21. **Approval gates**(durable agents) — 原料:`docs/architecture/harness.md`「Durable agents」、`examples/durable-approval/README.md`;成本 中。
22. **Signals** — 原料:`docs/architecture/harness.md`「Signals」、`examples/signals-desk/README.md`;成本 中。
23. **Schedules**(tick 原语 + 平台 cron 一等形态) — 原料:`docs/architecture/harness.md`「Schedules」、`examples/signals-desk/README.md` Act 5;成本 中。
24. **Exporters & tracing to your backend** — 原料:`docs/architecture/observability.md`「事件与导出」「Exporter 清单」;成本 中。OTLP exporter = M5 预留位。
25. **Writing a storage adapter**(port 实现 + 能力标志) — 原料:`docs/architecture/storage.md`「Adapter 作者指南」+ port 清单;成本 中。
26. **Example walkthroughs ×5** — 原料:各 `examples/*/README.md`;成本 低(每个)。

### 2.4 Reference(参考)

27. **Import map / package surface** — 原料:`README.md` Package surface、`packages/core/package.json` exports、`docs/adr/0002`、`docs/adr/0014`;成本 低。
28. **API reference(generated)** — 原料:`packages/core/dist/**/*.d.ts`(10 子路径)+ [#4 调研](https://github.com/0xnicholas/oribos-docs/issues/4) 的管线结论;成本 高;归 #9。备注:**dist 的 JSDoc 含中文与内部规范引用**(如 `docs/architecture/observability.md`「组合根分发」),生成侧会原样带出——需「清源 vs 生成期清洗」裁决。
29. **Glossary** — 原料:`CONTEXT.md`(英文化 + 裁内部术语);成本 中。
30. **(可选)Streaming protocol reference**(chunk 四型 / finishReason 五值) — 原料:`docs/architecture/model.md`「Chunk 协议」、`docs/architecture/agent.md`「finishReason」;成本 低。**可与 #13 合并**,避免同概念双 canonical 页。

### 2.5 Project & ecosystem(项目与生态)

31. **Coming from Mastra**(迁移会踩的语义差异) — 原料:`docs/research/mastra-gap-analysis.md` §2/§3;成本 中。进站与否归 #6。
32. **Release status**(当前版本 / 发布节奏 / 版本序列) — 原料:`docs/ROADMAP.md` 发布节奏节、`README.md` Status;成本 低–中;建议后置到发布临近。
33. **Contributing** — 原料:`README.md` Development、`docs/adr/0014`、`docs/adr/0015`;成本 低–中。
34. **Deployment**(serverless / edge / 平台 cron 打 tick endpoint / 无长驻进程立场) — 原料:`docs/architecture/harness.md`「定位」运行时立场、`docs/research/lightweight-benchmarks-mcp.md` §3;成本 中–高。见 G3。
35. **M5 预留位**(导航 / URL 占位,不写内容) — MCP server / MCP client / OTLP exporter / SQLite adapter / AI SDK interop / bunfold bridge(cron helper 为 harness 规范提到的能力包细节)。

## 3. 缺口清单(站点需要、仓库没有)

| # | 缺口 | 为什么需要 | 现有可用原料 | 归属 / 依赖 |
| --- | --- | --- | --- | --- |
| G1 | **安装的现状口径** | 未发布 npm(version 0.0.0、registry 无包),但站点必须有 Installation 页 | `README.md` Install / Status;framework #45 发布动作 | #6 + #10;发布耦合。**已落地(#30,2026-10-02):0.5.0 单发(七包 `@balsats/*`——0.5.0 线上 scope)上 npm;Installation 主路径 = npm,状态块摘除;pin = tag `v0.5.0`(`f86984d`)** |
| G2 | **概念总览页**(单一心智模型入口) | 上没有总览、下没有导流:新读者需要「一站看懂子系统关系」 | `README.md` What's in the box、`CONTEXT.md`、`docs/architecture/README.md` | #6(内容边界)+ #7(落位) |
| G3 | **部署指南** | 框架以「平台 cron 一等形态 / 无长驻进程」为卖点,却无配方 | `docs/architecture/harness.md` 运行时立场;`docs/research/lightweight-benchmarks-mcp.md` §3(edge 约束) | #10;需实测配方(AFK 任务可后置) |
| G4 | **迁移叙事**(两条) | ①从 mastra 迁移会踩的语义差异;②0.x 版本间迁移(0.x 阶段 minor 可破型) | ①`docs/research/mastra-gap-analysis.md` §3;②`docs/ROADMAP.md` 版本节 + 各 ADR | ①#6;②#7(版本化立场) |
| G5 | **Changelog / release notes 面** | 仓库刻意不设 `CHANGELOG.md`(GitHub Release notes),站点要不要承载 changelog 路由未定 | `docs/ROADMAP.md` 发布节奏节 | #10;#7(URL) |
| G6 | **FAQ / troubleshooting** | 高频症状(缺 API key、`specificationVersion` 不匹配报错、maxSteps 截断、byte-budget 黄灯)全无成文 | 分散在 README Notes / examples Notes / 各规范「错误语义」节 | #6(是否进首发) |
| G7 | **英文 Glossary** | 术语表只有中文版;agent 面向与搜索都需要英文术语入口 | `CONTEXT.md` | #6（边界）+ #11（agent 面向） |
| G8 | **API 参考内容** | 10 个子路径的精确签名面目前不存在于站点形态 | `dist/**/*.d.ts`;#4 调研三条管线 | #9 |
| G9 | **Integration 家族**(生态用法页) | 用户最先问「怎么跟我栈里的 X 一起用」;oribos 的对应物多为 M5 或空缺 | AI SDK 互操作 / MCP / OTLP = **M5 预留位**;Ollama 等 OpenAI-compatible 端点仅 README 一行 | #6 + 地图口径(M5 不写内容) |
| G10 | **首页 / landing 文案** | 文档站需要入口页;与营销站的接缝未定 | `README.md` 首段;ADR-0013 定位一句话 | #6(与 oribos-website 分工)+ #12(视觉) |
| G11 | **代码片段真相源机制** | examples 与页面片段会漂移;责任与 CI 兜底未定 | `examples/*/README.md` 已自带代码块;**examples 源码/文案含中文串**需英文化 | #6(手抄 / 抽取 / 链接) |
| G12 | **公开路线图 / 状态页** | 使用者关心「什么时候能用上」;内部 ROADMAP 不可直接公开 | `docs/ROADMAP.md` | #6;发布临近再谈 |
| G13 | **常用配方页**(how-do-I) | 例:如何取消一次 run(signal)、如何跨进程恢复(自备 adapter)、thread/resource 授权模型怎么落地(访问控制归应用层) | 各规范对应节 + examples 的 Notes | #6/后续扩展 |

> 中文文档不做(地图 Out of scope);Studio / playground 类交互面不做(出域)。

## 4. MVP 内容清单草稿

**首发集合(核心 10 页,建议阅读流即列表序)**

1. **Introduction** — 是什么、轻量的两层含义、现在能不能用(Status)
2. **Installation** — 环境要求 + 安装(含未发布口径,G1;**#30 起为 npm 主路径,口径已切换**)
3. **Quickstart** — 一个 agent + 一个 tool 跑通 stream / generate
4. **Concepts overview** — 子路径导入的按需组合 + 子系统关系(G2)
5. **Agents** — 定义表面 / 输出对象双消费 / 内建 loop
6. **Tools** — 四字段 / execute 上下文 / 三线错误回喂
7. **Models** — AI SDK 实例直传 / fallback 链 / 零适配器
8. **Memory** — thread/resource / 消息历史 / 工作记忆
9. **Workflows** — builder + 算子 + suspend/resume(可内嵌小节,或按 4.x P1 拆出)
10. **Examples** — 索引 + minimal-agent 走读

**紧邻首发(5 页,P1)**

11. **Import map / package surface**
12. **Observability**(span / 七边界 / console + memory exporter)
13. **Durable execution & background work**(三件套概览,导流 5 个 example)
14. **Suspend & resume**(从 Workflows 拆出的深页)
15. **Processors**

**后续扩展清单(P2,按建议序)**

- Streaming & output objects、Dynamic configuration、Structured output、Schemas & validation
- Approval gates、Signals、Schedules(三件套深页)
- Multi-agent composition、Exporters & tracing to your backend、Writing a storage adapter
- Glossary、Coming from Mastra、FAQ / troubleshooting(G6)、配方页(G13)
- API reference(G8 / #9)、Release status、Changelog 面(G5)、Contributing
- Deployment(G3)、Integration 家族(G9)、M5 预留位页(占位)

**明确不进首发**

- 任何 M5 能力包内容(只留占位);中文页;Studio / playground;营销页(归 oribos-website);公开 ADR 面(归 #6 裁决)。

## 5. 交接注记(给下游票的直接输入)

**给 #6 内容边界与真相源**

- architecture 8 篇 = 全部走「改写为概念页」还是允许部分直译?ADR 是否公开?内部术语表(CONTEXT.md)公开到什么程度?
- examples 的引用方式(手抄 / 钉版本抽取 / 链接仓库)与 **examples 中文串的英文化责任**(durable-approval / signals-desk 实测含中文输出与注释)。
- 轻量「数字」是否对外(ADR-0001 立场为否;#2 调研把「公开可检验性」列为发布时专项裁决)。
- 首页与 oribos-website 的接缝;Coming from Mastra 页是否首发。

**给 #7 IA 与多项目缝**

- 候选页 → 侧栏层级;内容族建议(见 §2 分组);「一条概念一条 canonical 路由」的执行(如 Streaming 页与 protocol 参考合并)。
- 多项目缝:将来子项目页面接入时,本清单的「候选页」如何标注归属(建议页面元数据带项目维度)。
- 版本化:0.x → 1.0 的迁移叙事(G4②)与 URL 预留。

**给 #9 API 参考面**

- 被生成对象 = `dist`(10 子路径);
- **dist 的 JSDoc 含中文与内部规范引用**(`docs/architecture/...`「...」),生成物会原样带出 → 需「清源(framework 仓库)vs 生成期清洗」裁决;
- README Package surface 表与 API 参考的重复边界(Import map 手写 vs 生成)。

**给 #10 交付与部署**

- Deployment 页的原料在 `docs/architecture/harness.md` 运行时立场(平台 cron 一等形态、无长驻进程);部署配方本身是缺口(G3)。

---

_草稿由 [任务:内容盘点](https://github.com/0xnicholas/oribos-docs/issues/5) 产出;原料快照 `oribos-framework@c7ce114`;下游裁决不改本文件的判定口径,可直接在其上叠加裁决结果。_

> **实施注记(#30,2026-10-02)**:G1 已落地——Installation 主路径 = `npm install @balsats/core`(0.5.0 单发,七包 `@balsats/*`,tag `v0.5.0` = commit `f86984d0d775799006db43d0a2a48f197f315f1b`),未发布状态块摘除,`pinned-ref.json` 升到该 commit,manifest `version` = `0.5.0`。本文件的 v0.1 快照口径与 §2/§4 的候选映射不动;上列 G1 相关行(§1.1 Install、§2.1-2、§3-G1、§4-2)只作落地标注。
>
> **实施注记(#48,2026-10-03)**:【更名 oribos】页内与站面 scope 写 `@oribos/*`、品牌写 `Oribos`;0.5.0 的旧 scope 记录保留（线上 tarball 不可回改）。本文件为 v0.1 草稿快照,判定口径不动。
