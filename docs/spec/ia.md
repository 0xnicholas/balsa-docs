# IA 与多项目缝规范

> **状态**:已裁决 v1.0,由 [决策:IA 与多项目缝](https://github.com/0xnicholas/oribos-docs/issues/7) 产出(2026-10-01 grilling 定案,Q1–Q6 全按推荐落定)。
> **上游**:[内容盘点](./content-inventory.md)(MVP 10+5 与候选映射)、[内容边界](./content-boundary.md)(五族定型、canonical 合并判据、竞品红线);[调研:mastra 拆解](https://github.com/0xnicholas/oribos-docs/issues/2)、[调研:候选栈对比](https://github.com/0xnicholas/oribos-docs/issues/3) 提供参照。
> **消费**:[决策:技术栈](https://github.com/0xnicholas/oribos-docs/issues/8)(frontmatter 执行、重定向构建契约)、[决策:API 参考面](https://github.com/0xnicholas/oribos-docs/issues/9)(api 命名空间与升格判据)、[决策:交付与部署](https://github.com/0xnicholas/oribos-docs/issues/10)(重定向 CI、changelog URL)、[决策:agent 面向](https://github.com/0xnicholas/oribos-docs/issues/11)(§6 三则 URL 事实)、[决策:品牌与视觉](https://github.com/0xnicholas/oribos-docs/issues/12)(车道 UI)、[收尾](https://github.com/0xnicholas/oribos-docs/issues/13)(checklist)。
> **不重开**(地图口径):M5 能力只留占位;G9 零独立页不留空栏目;竞品红线(Coming from Mastra 已出局);五族定型归 #6,本文件只定导航与 URL 形态。

## 1. 顶栏与车道

**单车道**:顶栏只有一个 Documentation 入口。五族是 ownership 轴(#6),不是导航轴——全部降为**侧栏分组**。mastra 的 6 Tab(docs / integrations / models / reference / learn / platform)是 ~900 页 + 多产品的函数,首发 12 页(P1 边界 17 页)不照抄。

**项目切换器**:顶栏预留项目切换器槽位,**第二个项目接入前不渲染**(只定机制不搭空架;实施归建站 effort)。

**Reference 升格判据**(给 #9 消费):API 参考生成页超过侧栏可管理规模(建议 ~50 页)时,升格为独立 URL 根 `/reference/**`(mastra 式),`/docs/reference/api/**` 整体 301 过去。在此之前 API 参考长在 Reference 族内。

## 2. URL 形态

- **站根**:`/` 301 → `/docs`(台账落地写 `/` → `/docs/`:canonical 尾斜杠形态与台账归 [delivery](./delivery.md) §4.1 / §4.3;实测见 #18)。
- **Introduction = `/docs`**(#6 已裁它兼 docs landing),是唯一的根页例外;族不设索引页,侧栏分组承担导航。
- **两段封顶**:`/docs/<family>/<slug>`。侧栏与 URL 同构、自描述、防 slug 撞名;更深的内容靠 canonical 合并(§4),不靠加深 URL。
- **例外**:`/docs/reference/api/**` 是生成树命名空间,深度不受两段封顶约束(#9 裁产物形态)。

**族 slug 表**:

| 族(#6 定型) | slug | 首发页数 |
| --- | --- | --- |
| Get started | `/docs/get-started/` | 4(Introduction 在根) |
| Concepts | `/docs/concepts/` | 5 |
| Guides | `/docs/guides/` | 2(索引 + walkthrough) |
| Reference | `/docs/reference/` | 0(P1 起) |
| Project & ecosystem | `/docs/project/` | 1(agent 指引,首发) |

**预留命名空间**(任何内容页不得占用):

| 命名空间 | 用途 | 归属 |
| --- | --- | --- |
| `/docs/reference/api/**` | API 参考生成树 | #9 |
| `/docs/v<n>/**` | 版本化快照(§3) | 未来发布 effort |
| `/<slug>/docs/**` | 子项目缝(§5) | 未来子项目 |
| `/llms.txt`、`/llms-manifest.json`、`<route>.md` | agent 面向(§6) | #11 |

路径设计与域名解耦:以上路径挂任何域(docs.balsa.dev 或 balsa.dev/docs)都不变;域名形态归 #10。

## 3. 版本化立场

- **0.x 无版本段**:latest-only,URL 不带 `v0.x`。#3 调研显示 Starlight 版本化插件 early development,mastra 同期亦无版本化——0.x 阶段快照版无收益。
- **移动/删页必有重定向**:canonical 重定向台账 + CI 关卡(删页/改 slug 未登台账 = CI 红:`pnpm verify` 在 build 前拦下;平台构建只生成 `_redirects`,口径归 [delivery](./delivery.md) §4.2 / §5、实测 #18),学 mastra;台账机制归 #8(构建层)与 #10(托管层)。
- **预留 `/docs/v<n>/**`**:顶层路由禁止占用 `v<数字>` 形态。1.0 临近时再裁「快照版 vs 继续 latest-only」——归未来发布 effort;届时重定向台账已是基本设施,改主意成本低。
- **Migration 子型首发空置**(#6):首个内容 = 「0.x → 1.0 upgrade guide」(P2,1.0 临近时写),落 `/docs/guides/upgrade-0-1`。

## 4. 侧栏、面包屑与交叉链接

- **侧栏 = 五族分组**,组内**人工排序**:Get started 按阅读流、Concepts 按依赖序、Reference 按查阅频度;禁止字母序。
- **Guides 子型用 frontmatter 驱动侧栏子分组**(Walkthrough / Migration),**不进 URL**:仍是 `/docs/guides/<slug>` 扁平。
- **面包屑两层**:族 > 页(子型不进面包屑)。
- **交叉链接三规则**:①概念首次出现链到 canonical 页(Glossary 上线后术语首现链 Glossary);②并页/移页必须登重定向台账(§3);③站内一律相对路径,禁止硬编码域。

**canonical 合并执行**(#6 判据落地):一条概念一条 canonical 路由;首例 = Streaming:`/docs/concepts/streaming` 吸收协议参考内容成为唯一页,Reference 族不开第二页。

**IA 拥有的 frontmatter 字段**:

| 字段 | 归属裁决 | 值域 / 说明 | 缺省 |
| --- | --- | --- | --- |
| `title` / `description` | 本票定必填,#8 定校验机制 | 用户可读;description 进搜索摘要 | —(必填) |
| `project` | 本票 | `oribos` \| `<slug>`(§5) | `oribos`(可省略) |
| `subtype` | 本票 | `walkthrough` \| `migration`,Guides 族专用 | 无 |
| `order` | 本票 | 组内序号(整数,人工排序) | 追加组尾 |
| `packages` | #6 已定 | `@oribos/*` 子路径,与 exports 严格一致 | —(必填) |
| 原料指针 | #6 已定 | 源文件 + framework commit | —(派生页必填；原创页无上游原料则省略，#17 实施核对) |

## 5. 多项目缝

机制组合(ADR:[0001](../adr/0001-default-project-unprefixed.md)):**默认项目无前缀 + 子项目 slug 前缀**。

- **URL 维度**:当前唯一项目(oribos framework)= **默认项目**,独占 `/docs`;未来项目占 `/<slug>/docs/**`,slug 为项目短名(小写)。
- **导航维度**:顶栏项目切换器,第二个项目落地时解除隐藏;每项目侧栏独立。
- **内容目录约定**:`src/content/` 下每项目一个 collection:默认项目 = `src/content/docs/`(与 URL 同名;路径由 Starlight 内核硬固定),未来项目 = `src/content/<slug>/`(自建集合);collection 内五族目录结构同构。**(#8 修正,见 [stack.md](./stack.md) §3.1 / §8)**

**接入一个项目的步骤清单**(写进规范,实施归后续 effort):

1. 定 slug(短、小写、唯一);
2. 建 `src/content/<slug>/` 自建集合 + `src/pages/<slug>/docs/[...slug].astro` 路由页 + 显式侧栏 + `processedDirs` 注册(`<StarlightPage>` 页面不进自动分组;原「建 `content/<slug>/`、复制五族目录」措辞已由 [stack.md](./stack.md) §8 改写);
3. 路由:collection 根挂 `/<slug>/docs`,其 Introduction 页为 landing;
4. 导航:项目切换器解除隐藏并注册;侧栏声明;
5. 盘点:新项目内容先进盘点清单(元数据 `project: <slug>`),走 #6 改写规则。

**Glossary 站级共享**:英文 Glossary 只此一份(默认项目维护,canonical 用词唯一来源),子项目不建第二份、只引用。

盘点清单的 35 条候选页按此补 `project: oribos` 标注(实施项,交 #13 checklist;**#13 核对**:其中 §2.5-31「Coming from Mastra」已按 [内容边界](./content-boundary.md) §3 竞品红线出局,实际标注 34 条 + 新增的 agent 指引页)。

## 6. agent 面向接缝(URL 事实三则)

约定与协商方式归 #11;本票只锁 URL 命名:

1. **每页 `.md` twin 的路径 = 页面路由 + `.md`**(如 `/docs/concepts/agents.md`),做不做归 #11;
2. **`llms.txt` 挂站根** `/llms.txt`,不占 `/docs` 命名空间;
3. **manifest 类文件**(如 `llms-manifest.json`)同站根规则。

## 7. 完整站点树草稿

```
/                                  → 301 /docs
/docs                     Introduction                          [首发 · Get started · 兼 landing]
/docs/get-started/
  installation            Installation                          [首发]
  quickstart              Quickstart                            [首发]
  concepts-overview       Concepts overview                     [首发]
/docs/concepts/
  agents                  Agents                                [首发]
  tools                   Tools                                 [首发]
  models                  Models                                [首发]
  memory                  Memory                                [首发]
  workflows               Workflows                             [首发]
  observability           Observability                         [P1]
  durable-execution       Durable execution & background work   [P1 · 导流 examples]
  suspend-resume          Suspend & resume                      [P1 · 从 Workflows 拆出]
  processors              Processors                            [P1]
  streaming               Streaming & output objects            [P2 · 吸收协议参考,canonical]
  dynamic-configuration   Dynamic configuration                 [P2]
  structured-output       Structured output                     [P2]
  schemas                 Schemas & validation                  [P2]
  approval-gates          Approval gates                        [P2]
  signals                 Signals                               [P2]
  schedules               Schedules                             [P2]
  multi-agent             Multi-agent composition               [P2]
/docs/guides/
  examples                Examples(索引)                       [首发 · Walkthrough]
  minimal-agent           Walkthrough: minimal-agent            [首发 · Walkthrough]
  durable-approval        Walkthrough: durable-approval         [P2 · 已发布(#31) · gating 已解除(#81)]
  signals-desk            Walkthrough: signals-desk             [P2 · 已发布(#31) · gating 同上]
  (其余 example walkthrough              P2 按需 · Walkthrough)
  exporters               Exporters & tracing to your backend   [P2]
  storage-adapter         Writing a storage adapter             [P2]
  faq                     FAQ & troubleshooting                 [P2]
  upgrade-0-1             Upgrade guide 0.x → 1.0               [P2 · Migration · 1.0 临近]
  (配方页 G13 → /docs/guides/* 扁平      P2+)
/docs/reference/
  import-map              Import map / package surface          [P1]
  glossary                Glossary                              [P2 · 站级共享]
  api/**                  API reference                         [预留 · #9 · 深度豁免]
/docs/project/
  docs-for-agents         Docs for AI agents                    [首发 · #11]
  releases                Release status                        [P2]
  changelog               Changelog                             [预留 · #10 裁]
  contributing            Contributing                          [P2]
  deployment              Deployment                            [P2 · 族归属依 #6]
  why-oribos             → 外链 oribos-website                   [P2 · 外链,唯一一支]

预留:/docs/v<n>/** ｜ /<slug>/docs/** ｜ /llms.txt、/llms-manifest.json、<route>.md
不进树:M5 占位、Integration 家族(G9 零独立页)、中文页、竞品迁移页
```

> 落位修正记录:releases / changelog 归 **Project 族**(#6 族表已定),修正本票 Round 1 Q2 中「落 Reference」的口误;Deployment 同理归 Project 族。
>
> **修订记录(#11,2026-10-02)**:Project 族增 agent 指引页 `/docs/project/docs-for-agents`(首发,族表由 0 改 1)——依据 [决策:agent 面向约定](https://github.com/0xnicholas/oribos-docs/issues/11),见 [agent 面向规范](./agent-surface.md) §7 / §13。
>
> **修订记录(#8)**:§5 的内容目录措辞由 `content/**` 修正为 `src/content/**`(Starlight 内核硬固定集合路径),接入清单步骤 2 同步改写——依据 [决策:技术栈](./stack.md) §3.1 / §8 / §12;§2 站根与 §3 的「301」语义由 [stack.md](./stack.md) §12 与 [delivery.md](./delivery.md) §4.3 承接(永久重定向 = 301/308 等价,真 301 归托管层)。
>
> **核对修正(#13)**:§1 的「15 页首发」改为「首发 12 页(P1 边界 17 页)」;§5 末的候选页标注数补出局说明(35 → 34 + agent 指引页)。
>
> **修订记录(#17)**:§4 原料指针的「必填」限定为**派生页**(有内部上游原料的页面);原创页(agent-surface §7 的 agent 指引页「无改写原料」)省略——实现形态与理由见 [stack.md](./stack.md) §13.1。

## 8. 交接注记

- **给 #8**:frontmatter 字段表(§4)是校验对象;重定向台账的构建层实现(生成 301、CI 关卡)在此裁;`.md` twin 的路由Rewrite 机制预留。
- **给 #9**:`/docs/reference/api/**` 命名空间已预留,深度豁免;升格判据见 §1。
- **给 #10**:changelog 若做,落 `/docs/project/changelog`(与 releases 邻页);托管层重定向与 CI 关卡口径衔接 §3。
- **给 #11**:三则 URL 事实(§6)为输入;`packages` 字段消费面不变。
- **给 #12**:车道 UI = 单 Documentation tab + 隐藏的项目切换器槽位;面包屑两层。
- **给 #13**:checklist 增——① 重定向台账是建站实施项(规范已定 §3);② 子项目切换器 UI 与盘点 `project:` 标注为实施项(§5)。

---

> **实施注记(#18)**:§2 站根一行补台账落地形态(`/` → `/docs/`,canonical 尾斜杠)与规范指针——URL 命名资产与 301 语义未变,依据建站切片 [#18](https://github.com/0xnicholas/oribos-docs/issues/18)。

> **实施注记(#31)**:§7 树里 `durable-approval` / `signals-desk` 两行的标注已随发布改写(`已发布(#31)`;剩余 gating = 需要引 example 中文字面(控制台输出 / 源码注释 / README 串)的节拍,见 [内容边界](./content-boundary.md) §4.1),URL 与树逐行一致——页面本身按 §4.1 的明文用英文改述上线。依据建站切片 [#31](https://github.com/0xnicholas/oribos-docs/issues/31)。

> **实施注记(#48,2026-10-03)**:【更名 oribos】默认项目 slug `balsats` → `oribos`（§4 字段表 `project` 默认值，`src/lib/frontmatter.ts` 一处；页面省略 `project` 的行为不变），URL 缝与 `docs` collection 名不动。

_由 [决策:IA 与多项目缝](https://github.com/0xnicholas/oribos-docs/issues/7) 产出;页面集合与 P0/P1/P2 判定上游为 [内容盘点](./content-inventory.md),下游裁决不改其判定口径。_
