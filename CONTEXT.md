# Balsa Docs

balsa 伞形品牌下全部子项目的公开文档站（英文优先）。本文件是项目术语表——只放定义，不放实现细节与架构决策（决策在 `docs/adr/`，交付规范在 `docs/spec/`）。

## Language

**文档站 (Docs site)**:
balsa 及未来子项目的公开文档站：承载上手、指南、概念与参考的单一站点，面向框架使用者；内容为英文优先的用户向叙事。
_Avoid_: 网站（泛指）、营销站（那是 balsats-website 的领域，见其 CONTEXT.md）

**上手面 (Onboarding surface)**:
子项目对外可用的第一道门：quick start + 指南 + 参考。文档站是其承载；Studio 类交互产品面不在其中（出域档，见 balsa-framework ROADMAP）。
_Avoid_: 把上手面等同于 README（README 只是发布前的临时承载）

**规范 (Spec)**:
本 effort 的交付物形态：把文档站的全部未决点定成唯一答案、交接到可直接建站的文件集，落在 `docs/spec/`。
_Avoid_: 方案、设计稿（暗示还有未决艺术问题）

**内容族**: 站点内容的五个所有权族:Get started / Concepts / Guides / Reference / Project & ecosystem。切分轴是 ownership(谁拥有这条内容),页面结构不决定归属;每页归属唯一族。
_Avoid_: 页面类型、内容分类(暗示按排版切)、栏目/车道(那是导航形态,归 IA 裁决)

**内容基线 (Content baseline)**:
站点内容所覆盖的框架已实现面 = **M1–M4**(agent / tools / memory / workflows / harness 三件套 / observability / 模型契约 / 存储 port);M5 能力包只在站点留占位、不写内容。写作主张不得越过它。
_Avoid_: 版本范围(暗示绑定发布号)、内容快照(那是钉定 ref 的事)

**英文 Glossary (English glossary)**: 站点公开的英文术语页(P2 上线),全站写作的 canonical 用词唯一公开来源;上游是 balsa-framework 的 CONTEXT.md(中文、内部、不直接公开)。
_Avoid_: 与 CONTEXT.md 互指混用(后者是内部中文术语表,前者是其公开英文改写面)

**多项目缝 (Multi-project seam)**:
文档站为未来子项目预留的接入机制（URL 维度 + 导航维度 + 内容目录约定）：只定机制、不搭空架。
_Avoid_: 多租户、站点群（都不指向同一概念）

**默认项目 (Default project)**:
文档站的首个内容项目（balsa framework），独占无前缀的 `/docs` URL 空间与 `docs` 内容 collection；子项目接入不改变它的形态。
_Avoid_: 主项目、旗舰项目（暗示项目间有层级，而这里只有 URL 约定）

**项目 slug (Project slug)**:
子项目接入文档站时的唯一短名,决定其 URL 前缀 `/<slug>/docs/` 与内容 collection 名;默认项目不设 slug。
_Avoid_: 项目 ID、命名空间(都不是这个概念)

**重定向台账 (Redirect registry)**:
站点 URL 变更的唯一真相源:仓库内 `redirects.json` 登记**人改的** URL(移动 / 删页 / 站根 `/` → `/docs`),构建期生成 `dist/_redirects`;平台的自动归一(尾斜杠、`/file.html`)不进台账。未登记即构建失败。
_Avoid_: 重定向列表(暗示可随手增删)、`_redirects`(那是生成物)

**内容真相源 (Content source of truth)**:
每条进入站点的内容的权威出处与改写规则:内部工程文档留在 balsa-framework,仅作改写原料;站点自身内容以 balsats-docs 仓库内的 Markdown/MDX 为唯一真相。
_Avoid_: 同步、镜像(暗示自动复制而非改写)

**钉定 ref (Pinned ref)**:
站点片段与 balsa-framework 源码之间的漂移契约点:一个 commit SHA,记在本仓库单一配置文件中;页面文字归 balsats-docs、源码归 balsa-framework,升钉是显式 PR,升钉时 CI 全量重检。
_Avoid_: 版本号(0.x 期不存在)、锁文件(暗示包管理)

**出处标记 (Provenance marker)**:
站点页里代码块的来源标注:紧跟代码块上一行的 HTML 注释,`verbatim`(与钉定 ref 逐字一致、CI 逐块 diff)或 `adapted`(改写自源文件、只记路径不 diff)二选一。
_Avoid_: 引用、来源注释(都太泛,指不到这个机制)

**API 生成树 (API reference tree)**:
Reference 族内由 TypeDoc 从 `@balsa/core` 发布声明文件（`dist/*.d.ts`）自动生成的符号级参考页集合：落 `/docs/reference/api/**`，随钉定 git ref 再生成并作为仓库资产入库。与手写内容的分工 = 手写管选择（import-map 门面）、生成管精确签名。
_Avoid_: API 文档（泛指）、手写参考页（互斥概念）

**入口 shim (Entry shim)**:
生成树的十个入口：`api-entry/` 下每个导出子路径一个一行 star re-export（根为 `@balsa/core.d.ts`），指向固定 checkout 的 `dist/`。承载模块组名（文件名 = 模块名，故根组不叫裸「index」）与「入口路径永不变」的硬约束（入口一挪全树哈希变）。
_Avoid_: 入口文件（指不到这层）、代理（暗示运行时代理）

**侧栏快照 (Sidebar snapshot)**:
`api-sidebar.json`：生成树侧栏组的入库副本，由生成那一次运行写出。无框架 checkout 的构建（平台）靠它渲染同一组，与有插件时的侧栏逐字一致。
_Avoid_: 缓存（暗示可丢）、兜底数据（它不是降级面，是同一真相的入库形态）

**agent 面 (Agent surface)**:
文档站面向 AI agent 的机器可读面：每页的 Markdown twin + 站根单点索引 + 包→页映射；与给人读的 HTML 页面**同源于同一内容**，不是第二套内容。
_Avoid_: agent 文档（暗示另有一份内容）、导出物（暗示单向且可丢弃）

**Markdown twin (`.md` twin)**:
每个页面路由的纯文本对应物，路径 = 页面路由 + `.md`，由内容源直出；是 agent 取单页正文的唯一形态。
_Avoid_: 副本、缓存（均暗示与源内容存在同步问题）

**包→页映射 (Package-to-page map)**:
由页面 frontmatter 的 `packages` 字段派生的机器契约：框架包（含子路径）→ 承载其文档的站点页面。是分发缝的接口，不是内容真相源。
_Avoid_: 站点地图（那是爬虫面）、包清册（暗示人工登记）

**覆盖清单 (Override registry)**:
Starlight `components:` 覆盖槽位的登记名册：每项覆盖须登记、计数即契约，新增覆盖是一次需要动规范的动作；升 Starlight 时逐项复验。首发覆盖数 = 0，品牌观感全部由 token 层承载。
_Avoid_: 定制组件列表（暗示可随手增删）、swizzle（Docusaurus 的概念）

**品牌接入点 (Brand access point)**:
站点为伞形品牌预留的占位槽清单：logo 槽、字体槽（`--sl-font*`）、favicon、默认 OG、accent hue——本 effort 只发占位与登记表，真品牌资产（伞形品牌 / 营销站 effort）到位后一次替换，不改站点结构。
_Avoid_: 品牌 token（易与 token 层实现混指）、品牌资产（那是要接入的物，不是槽）
