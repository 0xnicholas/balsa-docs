# 内容边界与真相源规范

> **状态**:已裁决 v1.0,由 [决策:内容边界与真相源](https://github.com/0xnicholas/balsa-docs/issues/6) 产出(2026-10-01 grilling 定案)。
> **上游**:[内容盘点](./content-inventory.md)(原料快照 `balsa-framework@c7ce114`)提供候选映射与缺口清单;本文件在其上叠加裁决,不改其判定口径。
> **消费**:[决策:IA 与多项目缝](https://github.com/0xnicholas/balsa-docs/issues/7)(五族→车道、canonical 合并、frontmatter)、[决策:API 参考面](https://github.com/0xnicholas/balsa-docs/issues/9)(packages 值域、片段契约)、[决策:agent 面向约定](https://github.com/0xnicholas/balsa-docs/issues/11)(packages 字段)、[收尾](https://github.com/0xnicholas/balsa-docs/issues/13)(交接口径含 framework 侧前置)。
> **不重开**(地图口径):英文优先;内容基线 = M1–M4 已实现面;M5 能力包只留占位;内部工程文档只作改写原料、不搬结构。

## 1. 内容类型清单(五族)

切分轴 = **ownership**(谁拥有这条内容:上手路径 / 框架概念 / 任务用法 / 精确签名 / 项目自身),不是页面排版——任务型页面可落在多族,取决于 ownership。**每页归属唯一族。**

| 族 | 定义 | 目标读者 | 首发状态 |
| --- | --- | --- | --- |
| Get started | 从零到第一个跑通的 agent | 新用户 | 首发 4 页(Introduction / Installation / Quickstart / Concepts overview) |
| Concepts | 子系统心智模型,一条概念一条 canonical 页 | 建立理解的用户 | 首发 5 页(Agents / Tools / Models / Memory / Workflows) |
| Guides | 任务向 how-to | 带目标做事的用户 | 首发:Examples 索引 + minimal-agent 走读(Quickstart 在 Get started);深页 P1 起 |
| Reference | 精确表面:import map / API 参考 / Glossary / 协议面 | 回头查确切行为的用户 | P1:Import map;API 参考归 #9 后置;Glossary P2 |
| Project & ecosystem | 项目自身:Release status / Contributing / Deployment / M5 占位 / agent 指引 | 关注项目状态的用户 | 首发 1 页(Docs for AI agents),余全 P2 |

**子型**(均属 Guides,不另立族):

- **Walkthrough(教程)**:走读真实 example;首发仅 minimal-agent。
- **Migration(迁移升级)**:仅版本升级叙事(G4②,首个内容随 #7 版本化立场);**不做竞品迁移叙事**(见 §3)。

**首发集**:确认盘点 §4 的 MVP 核心 10 项 + P1 5 页,不再增删。**修订(#11)**:增 agent 指引页(Docs for AI agents,Project 族)= **首发 12 页**;见 [agent 面向规范](./agent-surface.md) §7。

**页数口径**(#13 核对修正):首发页数按 **URL 计数** = Get started 4(Introduction 在根)+ Concepts 5 + Guides 2 + Project 1 = 12;盘点的 MVP 清单把「Examples 索引 + minimal-agent 走读」并作一条,故**项数 ≠ 页数**。含 P1 5 页 = **17 页**。

## 2. 内部工程文档对外边界

| 原料 | 对外面 | 裁决 |
| --- | --- | --- |
| `docs/architecture/*` 8 篇 | 概念/指南页 | **全部改写,零直译**(规则 §2.1);代码块与表格允许原文提升,仍须出处记录 |
| `docs/adr/*` 15 份 | 无公开 ADR 面(含 P2 也不设) | 立场吸收为概念页「Why」小节(如 Models 页「为什么不内置 provider 注册表」);公开页不出现 ADR 编号与链接 |
| `docs/ROADMAP.md` | Release status 页(P2,发布临近再上) | 只载:当前版本 + 版本序列(0.1.0→0.5)+ 每版一句话;**延后清单/重开条件不公开** |
| `CONTEXT.md`(中文) | 无直接公开面 | 改写为**英文 Glossary**(P2,§2.2);中文原表保持内部 |
| `docs/research/*` 7 篇 | 不进站 | 结论已被规范吸收;站点不引用原文 |

### 2.1 改写规则(四条,约束所有源自内部文档的页面)

1. **叙事转换**:维护者裁决视角(定义/必须/裁决记录)→ 用户视角(能做什么/怎么用/错了会怎样)。
2. **剥离内部物**:issue 号、ADR 路径、内部文档交叉引用、维护者专用节(如 #49–#54 实施期裁决)、内部术语(重开条件、组合根分发等)。
3. **主张限于 M1–M4 已实现面**;M5 能力只以占位形态出现。
4. **出处记录**:每页 frontmatter 记原料指针(源文件 + framework commit),供 §4 漂移检查消费。

**合并判据**:一条概念一条 canonical 路由;改写时多个原料讲同一概念的并入一页,重叠面不做第二页(执行与重定向归 #7)。

**面向 agent 的写作约束**(纯 Markdown 语义完整总规则 + 四条强制:代码块语言标注 / 标题层级 / 图不承载信息 / 不要求切换才见等价项)见 [agent 面向规范](./agent-surface.md) §6——与本节改写规则**叠加生效**。

### 2.2 英文 Glossary 与用词 canonical

- 站点设**英文 Glossary**(P2,Reference 族):以 framework `CONTEXT.md` 为上游改写——英文化 + 裁掉内部术语。
- 它是**全站写作的 canonical 用词来源**:每页用词与它冲突时它赢;术语首次出现链接到它。
- 内部专用术语(重开条件、实施期裁决等)永不进公开面。

### 2.3 轻量数字红线

公开页**不出现字节数/基准数字/基准表**;轻量只讲两层含义(按需组合 + 无运行时负担)。发布期是否开「公开可检验基准」页 = 发布 effort 专项,不在本规范。

## 3. 竞品红线

公开产物(页面正文、代码示例、Glossary、标题与描述、搜索索引、面向 agent 的生成物)**一律不提及 Mastra**,也不做任何竞品对比、「从 X 迁移来」类叙事。

- 盘点候选 31(Coming from Mastra)出局,缺口 G4① 关闭;`mastra-gap-analysis` 维持仅作背景。
- balsa-docs 仓库内部的规范、调研、CONTEXT(含本文件)不受此限。

## 4. examples 与代码片段的真相源(G11)

**模式 = 手抄 + 出处标记 + 钉版本 CI 兜底。**(构建期抽取:把站点构建耦合进另一仓库,预览/CI 复杂化,否决;纯链接:体验差,否决。)

- **行内片段**:手写进站点 MDX;凡源自 balsa-framework 的代码块必须带**出处标记**,两种:
  - `verbatim`:与钉定 ref 的源文件逐字一致(允许显式截断标注)→ CI 逐块 diff,不匹配即红;
  - `adapted`:改写自源文件 → 只记来源路径,不做 diff。
- **标记落地形态(#18)**:标记是紧跟代码块上一行的注释,形态 `<!-- balsa:verbatim file="examples/minimal-agent/src/index.ts" lines="12-34" -->`;`adapted` 同形而词不同。`.mdx` 页用等价的 MDX 表达式注释 `{/* balsa:… */}`(#19:MDX 不接受 HTML 注释,写成 HTML 形式会直接构建失败,不会静默跳过)。`file` 必填(balsa-framework 仓内相对路径),`lines` 可选用 1-based 闭区间声明截断(不写 = 整文件逐字)。**比较基准** = 钉定 ref;页面有意滞后时用 frontmatter `source` 里同文件的 `ref`(stack.md §13.1),但它**只能是钉定 ref 的祖先**——滞后可以、横跳不行,这是「升钉时 CI 全量重检」能成立的前提。标记未配对、属性拼错、`adapted` 源不可读、滞后 ref 不在钉定历史里均算红——**没被校验的块比报错更危险**。校验脚本 `scripts/check-drift.mjs`,逻辑在 `src/lib/drift.ts`,用 `git show <SHA>:<path>` 读目标 ref 的内容(本地 checkout 停在哪条分支不影响)。
- **钉定 ref 数据文件(#18)**:`pinned-ref.json`(`{ "repo": "0xnicholas/balsa-framework", "commit": "<40 位 SHA>" }`),与 [API 参考面](./api-reference.md) §5 的钉定物是**同一份**;升钉 = 改这一个字段的显式 PR。
- **完整 example 源码不整装进页**:一律链接钉定 commit 永链。
- **漂移契约**:balsa-docs 拥有页面文字,balsa-framework 拥有源码;钉定 ref(单一,存本仓库配置文件)是契约点。升 ref = 显式 PR,升钉时 CI 全量重检,漂移现形。
- **无 SaaS**:校验脚本 + CI 关卡即可,不引外部服务。

### 4.1 examples 中文串的 gating

- 站点**永不引用中文串**(实测:`durable-approval` 的「用户拒绝」、`signals-desk` 的 `act()` 标题;**#13 复测补**:`workflow-approval` 残留 4 行);走读需要该节拍时用英文改述。
- durable-approval / signals-desk 两页 walkthrough 的发布 **gating 在 framework 侧英文化完成**(交接 #13;英文化工作落 balsa-framework 仓库 issue——**#13 复测:含中文串的 example 实为三个,英文化清单须含 `workflow-approval`**)。
- 两者的 README 英文叙事现在即可消费,不受 gating 影响。

## 5. 与营销站的接缝(G10)

- 文档站内容 = §1 五族,纯文档;用例页/定价/证言/博客/landing 营销面一律归 balsa-website。
- MVP 入口页 = **Introduction 兼任 docs landing**(轻入口);要不要更重的 docs home 归 #12(视觉),内容边界不变。
- 链接方向:营销站 → docs 深页(docs 拥有 canonical URL);docs → 营销站仅 Introduction「Why Balsa」节一支稳定外链,其余页面不外链营销。

## 6. 机器可读内容边界:frontmatter `packages`

每页 frontmatter **第一天起必填 `packages`**:

- 值 = `@balsa/*` 包名或 `@balsa/core` 子路径,与 `package.json` exports 严格一致(exports 共 **10 项** = 根 `.` 记 `@balsa/core` + **9 条子路径**:`model` / `agent` / `tools` / `observability` / `workflows` / `memory` / `signals` / `durable-agent` / `schedules`)。**(#13 核对修正:原文「10 子路径」列 9 条——第 10 项是根导出。)**
- 跨包页面用数组;M5 能力包上线后扩展值域。
- 消费方:#11(manifest / embedded docs)、#9(API 参考对齐)。
- 完整 frontmatter schema(title / description 等)归 #7 与 #8;本规范只锁此一条。

## 7. 缺口裁决汇总(G1–G13)

| 缺口 | 裁决 |
| --- | --- |
| G1 安装口径 | Installation 首发:**从仓库使用为主路径** + 「npm 未发布,0.1.0 跟踪中」状态块;不写任何假 npm 命令;npm 段 0.1.0 发布时落地(与 #10 耦合) |
| G2 概念总览 | 进首发(Get started 第 4 页);落位归 #7 |
| G3 部署指南 | 页面进站(P2,Project 族);配方实测归 #10,可后置 AFK 任务 |
| G4 迁移叙事 | ①竞品迁移:**不做**(§3);②版本升级:归 #7 |
| G5 changelog 面 | 归 #10 与 #7,本票不裁 |
| G6 FAQ | P2;真实用户问题出现再写,不预造 |
| G7 英文 Glossary | P2;全站 canonical 用词(§2.2) |
| G8 API 参考 | 归 #9 |
| G9 Integration 家族 | MVP 零独立页:OpenAI-compatible 端点在 Models 页一段带过,其余随 M5 占位转正;不留空「Integrations」栏目 |
| G10 首页 | Introduction 兼任(§5) |
| G11 片段真相源 | §4 机制 |
| G12 公开路线图 | = Release status 页(P2);延后清单不公开(§2) |
| G13 配方页 | P2;发布后从真实 how-do-I 长起 |

## 8. 交接注记

- **给 #7**:五族→车道/URL;canonical 合并判据(§2.1)落到具体并页(如 Streaming 页与协议参考合并);Migration 子型首发空置,首个内容等版本化立场;`packages` 进 frontmatter 约定。
- **给 #9**:被生成物(dist JSDoc)的中文清洗、与 Import map 手写面的重复边界仍按票面;§4 片段契约对生成物同样适用(verbatim 源 = dist)。
- **给 #11**:`packages` 字段从第一天有值,manifest / embedded docs 可直接消费。
- **给 #13**:交接 checklist 增两条——① balsa-framework 侧 examples 英文化(durable-approval / signals-desk / workflow-approval,**#13 复测更正**)需落 issue 并跟踪(已落 [balsa-framework#81](https://github.com/0xnicholas/balsa-framework/issues/81));② 钉定 ref 配置与漂移校验脚本是建站实施项,规范已定、实施归后续 effort。

> **修订记录(#11,2026-10-02)**:§1 族表与首发集增 agent 指引页(首发 12 页);§2.1 增 agent 写作约束指针。依据 [决策:agent 面向约定](https://github.com/0xnicholas/balsa-docs/issues/11),见 [agent 面向规范](./agent-surface.md) §7 / §13。
>
> **实施注记(#18)**:§4 增「标记落地形态」与「钉定 ref 数据文件」两条——机制、两种标记与钉定单一 ref 的口径未变,只定下注释语法、`file`/`lines` 值域与脚本位置。依据建站切片 [#18](https://github.com/0xnicholas/balsa-docs/issues/18)。
>
> **实施注记(#19)**:§4 的标记语法补 `.mdx` 形式(MDX 表达式注释 `{/* balsa:… */}`)——`/docs` splash 是首个带标记的 MDX 页,MDX 不接受 HTML 注释,语法的选择面由此补齐;标记位置与语义不变。依据建站切片 [#19](https://github.com/0xnicholas/balsa-docs/issues/19)。
>
> **核对修正(#13)**:① §1 与上行的「首发 11 页」是**项数**误记为页数——页数 = **12**(口径见 §1「页数口径」);② §6 子路径计数改为 exports 十项口径(根 `.` + 9 子路径);③ §4.1 中文串实测面补 `workflow-approval`,英文化清单随之更正为三个 example。
