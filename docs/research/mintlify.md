# 调研:Mintlify 平台事实——托管形态 / 路由与 URL / 重定向与校验 / agent 面向 / API 参考 / 定制边界 / 定价与退出路径

> 研究 ticket:[#14](https://github.com/0xnicholas/balsa-docs/issues/14)。日期:2026-10-02。地图:[#1](https://github.com/0xnicholas/balsa-docs/issues/1)。
> 一手来源:Mintlify 官方文档站各页(其自身站点即 Mintlify 实例,本文引用的多数链接带 `.md` 后缀——正是本文 §6 要核实的「每页 `.md` 端点」在真实运行的证据)、官方定价页、官方 blog、npm registry、Mintlify 自维护的 `mintlify/docs` 仓库。每个论断附链接;拿不到一手依据的点集中在 §13「未验证」。
> 定位提醒:本文只呈现 **Mintlify 侧事实** + 按 [#8](https://github.com/0xnicholas/balsa-docs/issues/8) 要求清单的口径映射,不替 #8 裁决。#3 的对账基线(Starlight / Fumadocs / Docusaurus)不含 Mintlify,「四家横向对账」是 #8 的工作。
> 抓取环境:2026-10-02,本机直连 `www.mintlify.com` / `registry.npmjs.org` / `raw.githubusercontent.com`。

## 口径(本票给定)

英文优先 · 内容真相源留在 balsa-docs 仓库 · MVP 15 页 · 需要钉 ref 漂移校验与重定向台账的可执行落点 · balsa 是 Apache-2.0 OSS 框架 · 与 #3 的三候选可比。

## TL;DR

- **性质**:Mintlify 是**托管型 SaaS 文档平台**(官方自述 "a platform for building and hosting documentation websites … making it accessible to AI agents",[llms.txt](https://mintlify.com/docs/llms.txt)),不是可自建的静态站生成器。内容仍是 **docs-as-code**(本仓库 Markdown/MDX + `docs.json`,Git 同步、平台云构建),但**构建、托管、搜索、agent 端点、编辑器、分析、AI 能力全在平台侧**。
- **逐轴结论**:agent 面向 ✅ 内核级(比 #3 里 Fumadocs 的那套更全)、i18n ✅、版本化 ✅(nav 维度)、MDX 组件 ✅(内建组件库 + 自定义 React,有约束)、API 参考 ✅ 存在 **TypeDoc JSON 路径**(`sdk` 导航属性);**无 SaaS ❌ 结构性不满足**、**Astro 生态复用 ❌ 不满足**。
- **URL**:内容文件路径即 URL;`/docs` 子路径托管受支持,但 **base path 是平台侧(dashboard)配置** + 域上若还有别的内容必须自建反代(Cloudflare/Vercel/nginx);重定向在 `docs.json`,**默认 308(永久)/ 307(临时),不是 301**。
- **校验与 CI**:CLI(`mint validate` / `mint broken-links` / `mint format` / `mint a11y`)**可装进我们自己的仓库 CI**,官方给了 GitHub Actions 例([Install in CI](https://www.mintlify.com/docs/cli/install#install-in-ci));平台侧 CI checks(含 Vale 文案 lint)与预览部署是 Pro 起([CI checks](https://www.mintlify.com/docs/deploy/ci))。
- **定价(2026-10-02)**:Starter **$0** 含 5 编辑席位、自定义域、MCP server、API playground;Pro **$450/mo** 含 agent / assistant / automations / 预览部署 / admin API + 10,000 credits;自托管、多 repo、搜索过滤、离线导出、静态导出等只在 Enterprise([pricing](https://mintlify.com/pricing))。另有 **OSS Program:非商业开源项目 Pro 免费**([oss-program](https://www.mintlify.com/oss-program))。
- **退出路径**:内容(MDX)可带走;导航/主题/组件/搜索/agent 端点/重定向台账是平台配置不可直搬;`mint export` 离线包需 **Enterprise**,静态导出 API 尚 **私测 + 企业协议**,自托管需 **Enterprise**(K8s/Helm + MongoDB/PostgreSQL/Redis/S3)。
- **多项目缝**:平台侧三种表达(products 导航分区 / 多 repository 源(Enterprise) / 一子项目一 project + 子路径),**均不对应 #7 §5 冻结的「`content/<slug>/` + `/<slug>/docs/**`」**,需改写。

---

## 0. 平台定位、托管形态与许可

- 官方定位:「Mintlify is an AI-native documentation platform built for developers, with beautiful defaults, interactive API playgrounds, and smart search」([Introduction](https://www.mintlify.com/docs/index));llms.txt 自述「a platform for building and hosting documentation websites」。
- **内容模型 = docs-as-code**:「Every page on your site has a corresponding file stored in your documentation repository」;连仓库后可在本地编辑器或平台 web editor 改,变更同步回 Git([Quickstart](https://www.mintlify.com/docs/quickstart))。默认站点落在 `<subdomain>.mintlify.site`([Quickstart](https://www.mintlify.com/docs/quickstart));另有一处写 `<subdomain>.mintlify.app`([Custom domain](https://www.mintlify.com/docs/customize/custom-domain) 与 [help center](https://www.mintlify.com/docs/help-center/default-subdomain-indexed-alongside-custom-domain))——**两处不一致,记为平台文档瑕疵**。
- **Git 源**:GitHub(含 GHES)、GitLab(含自托管)、Bitbucket Cloud([Deployments 索引](https://mintlify.com/docs/llms.txt))。GitHub App 权限([GitHub](https://www.mintlify.com/docs/deploy/github)):读 `metadata`;读写 `checks`(PR 状态检查)、`code`、`deployments`、`pull requests`(编辑器建分支/开 PR)。**可只授权指定仓库**;有分支保护时无法直推保护分支。GitHub Enterprise 网段白名单需放行 `54.242.90.151`。
- **部署分支与内容目录可在 dashboard 配置**;`docs.json` 可放在仓库子目录(「docs.json is in a subdirectory」+ 路径,如 `/docs`)([Monorepo setup](https://www.mintlify.com/docs/deploy/monorepo))。`.mintignore` 可把文件排除出发布([Exclude files](https://www.mintlify.com/docs/organize/mintignore))。
- **许可**:平台本身闭源;**CLI 是 source-available**:npm 包 [`mint`](https://registry.npmjs.org/mint/latest) 的最新版(4.2.952)声明 `"license": "Elastic-2.0"`,仓库字段指向 `github.com/mintlify/mint`(抓取时 GitHub API 对该仓库返回 404,可能为私有或已迁移);Mintlify 自维护的**文档内容**仓库 `mintlify/docs` 是 MIT([LICENSE](https://github.com/mintlify/docs/blob/main/LICENSE))。
- 平台侧还自带一批 AI 能力(assistant / agent(开 PR)/ automations / AI 翻译 / Mintlify Index),属超纲项,见 §9 档位。

## 1. 路由与 URL 能力

- **文件路径 → URL 路径**:「When you change the path of a file in your docs folder, it also changes the URL path to that page」([Redirects](https://www.mintlify.com/docs/create/redirects));根页是内容根下的 `index.mdx`([Quickstart](https://www.mintlify.com/docs/quickstart) 的「Introduction」页即 `index.mdx`)。
- **域形态三选**:域根、子域(如 `docs.example.com`)、**子路径(如 `example.com/docs`)**。子路径托管:域上若无别的内容,直接把 DNS 指向 Mintlify 并在 dashboard 打开 **Host at** 填 base path;域上还有别的内容,则**自己在该域/ CDN 反代该子路径到 Mintlify**([Custom domain](https://www.mintlify.com/docs/customize/custom-domain)、[Host docs at a subpath](https://www.mintlify.com/docs/deploy/docs-subpath)),官方给了 Cloudflare Workers / Route 53+CloudFront / Vercel rewrites / nginx 四份指南。
- **base path 约束**:以 `/` 开头、≤128 字符、**不得占用平台保留路径**:`/_next`、`/_mintlify`、`/_sites`、`/_live-preview`、`/api`、`/login`、`/logout`、`/mcp`、`/feedback`、`/openapi-specs.download`、`/llms.txt`、`/llms-full.txt`、`/sitemap.xml`、`/robots.txt`、`/skill.md`、`/.well-known`([Custom domain §Base path requirements](https://www.mintlify.com/docs/customize/custom-domain))。**`/docs` 不在保留表内,可用**。
- 其它:开认证的站点不支持子路径托管;TLS 走 Let's Encrypt 自动签发(需 `_acme-challenge`/`_cf-custom-hostname` TXT,apex 域需 CNAME flattening/ALIAS);默认 `<subdomain>.mintlify.app` 在绑自定义域后**仍可被索引**,需自行处理 canonical/robots([Custom domain](https://www.mintlify.com/docs/customize/custom-domain))。
- **一个关键反直觉点**:仓库里存在 `docs/` 目录**不等于**站点 base path;base path 必须在 dashboard 配,且反代要用同一前缀,否则 `llms.txt` 在自己的前缀可达而其中 `/_llms/` 链接指向别处([llms.txt §Warning](https://www.mintlify.com/docs/ai/llmstxt))。

## 2. 重定向与校验(「台账 + CI 关卡」的等价物)

- **重定向在 `docs.json` 的顶层 `redirects[]`**:`{source, destination, permanent?}`;**默认永久 308**,`permanent: false` → 307(官方说明选 308/307 是为保留 HTTP 方法,而不是 301/302);source 不能带 `#anchor`/`?query`,destination 可以带 anchor;**通配支持**(`/beta/:slug*` 与部分通配 `/articles/concepts-*`);**无硬上限**(但成千上万条会拖慢部署);在**托管层按请求生效**,预览部署同样生效,`mint dev` 本地也生效([Redirects](https://www.mintlify.com/docs/create/redirects))。
- **CLI 校验面(可进我们自己的仓库 CI,无需登录)**([CLI command reference](https://www.mintlify.com/docs/cli/commands)):
  - `mint validate`:严格模式,有任何 warning/error 即非零退出(含 `docs.json` 引用的 OpenAPI 校验);
  - `mint broken-links`:站内链接检查,另有 `--check-anchors`、`--check-external`、**`--check-redirects`(校验 docs.json 重定向目标是否落到有效路径)**、`--check-snippets`、`--files <glob>`;
  - `mint format`:MDX 规范化,可在 CI 查 diff;`mint a11y`(对比度/alt);`mint test`(代码样例测试,需登录);`mint score`(对公开站点做 agent-readiness 打分,需登录)。
  - 官方 CI 例:`npm i -g mint` + `mint format` diff 检查 + `mint validate`([Install in CI](https://www.mintlify.com/docs/cli/install#install-in-ci))。
- **平台侧 CI checks**(PR 上跑,可设 Warning/Blocking):broken links(等价于 CLI 链接检查,不查外链)、**Vale 文案 lint**(可用 `.vale.ini` + 自定义词表;默认配置与词表见页面)、grammar;**需 Pro 或 Enterprise**([CI checks](https://www.mintlify.com/docs/deploy/ci))。
- **frontmatter 必填校验无平台机制**(见 §3/§13):#6 定的 `packages`、原料指针这类「必填」只能靠**我们仓库自写脚本** + 上面的 CLI 一起当关卡。

## 3. 内容模型与 frontmatter

- 页面用 `.mdx` 或 `.md`([Pages](https://www.mintlify.com/docs/organize/pages))。
- **所有 frontmatter 字段都是可选的**;字段未给时标题从路径生成。内建字段含 `title` / `description` / `sidebarTitle` / `icon` / `tag` / `hidden` / `noindex` / `searchable` / `boost` / `deprecated` / `mode` / `keywords` / `timestamp` / `lastUpdatedDate` / `api|openapi` / `url`(外链)等。**允许任意自定义 YAML 字段**(文档原文:<custom> "Any valid YAML frontmatter",例 `product: "API"` / `version: "1.0.0"`)→ **balsa 的 `packages`、原料指针可以落在这里,但平台不做必填/值域校验**([Pages](https://www.mintlify.com/docs/organize/pages))。
- **页面布局模式**:`default` / `wide` / `custom`(只剩 navbar)/ `frame`(保留侧栏,部分主题)/ `center` / `assistant`(整页聊天)([Pages](https://www.mintlify.com/docs/organize/pages))。
- 复用片段:snippets(`/snippets/`,可带变量)([Reusable snippets](https://www.mintlify.com/docs/create/reusable-snippets));隐藏页 `hidden: true` 不进侧栏、不索引,`searchable: false` 只退出站内搜索与 assistant 上下文([Hidden pages](https://www.mintlify.com/docs/organize/hidden-pages)、[Search](https://www.mintlify.com/docs/optimize/search))。
- 静态资源:仓库内文件按路径直接对外服务(图片/PDF/JSON),自动优化 + CDN([Files](https://www.mintlify.com/docs/create/files));文件被 `.mintignore` 排除后即 404([help center](https://www.mintlify.com/docs/help-center/static-file-not-served))。

## 4. IA 能力(导航 / 多项目 / 版本 / 语言)

全部由 `docs.json` 的 `navigation` 驱动,官方有 JSON Schema(`https://mintlify.com/docs.json`);**根层只能选一种主组织形态**([Navigation](https://www.mintlify.com/docs/organize/navigation)):

| 形态 | 用途 | 对 balsa 的含义 |
| --- | --- | --- |
| `groups` | 单侧栏 + 分组(可嵌套、`root` 根页、`icon`/`tag`/`expanded`、`directory` 目录样式) | **五族侧栏 = 五个 group**,组内人工排序 ✓;两层面包屑由平台渲染 |
| `tabs` | 顶栏横向分区 | balsa IA 已裁「单车道」,不需要 |
| `anchors`(+`navigation.global.anchors`) | 侧栏顶部常驻条目,可外链 | 可放 Changelog / Marketing 外链 |
| `dropdowns` | 下拉分区 | 不需要 |
| `products` | **多产品切换器**,一个 project 内多份「产品」导航 | **#7 的「项目切换器」最近似物**;但 URL 仍由文件路径决定,不会自动产生 `/<slug>/docs` 前缀 |
| `versions` | 版本分区 + 版本下拉(`default` / `tag`) | 版本化预留 ✓;URL 由版本目录表达(如 `v1/overview`);`llms.txt` 只列默认版本 |
| `languages` | 语言分区 + 语言下拉 | 30 种语言(含 `cn`、`zh-Hant`);**非默认语言走语言目录前缀**(官方自身站点存在 `/docs/fr/…`、`/docs/es/…`、`/docs/zh/…`);可按 `Accept-Language` 自动路由(dashboard 开关);`llms.txt` 只列默认语言 |

- 其它导航事实:侧栏条目可用 `hidden` 单页隐藏;`boost` 可设在 group 上;`sdk`/`openapi`/`asyncapi`/`graphql` 可作为导航属性生成页面(见 §7)。
- **多项目/多源(对 #7 §5 的缝)**:
  - **单仓库内**:一个站点一个内容根 + 一份根 `docs.json`;「一项目一 collection」没有对应概念(monorepo 设置只支持**单一** docs 子目录)([Monorepo setup](https://www.mintlify.com/docs/deploy/monorepo))。
  - **多 repository 源**:一个站点可合并多个仓库,每个源有自己的 Git 连接、分支、内容目录、**URL path**(如 `/api`、`/sdks`,其中一个可为根),各源自带 `docs.json`,根源管站点级配置;**需 Enterprise**;URL path 必须唯一不重叠([Multi-repository projects](https://www.mintlify.com/docs/deploy/multi-repo))。
  - **一子项目一个 project**:各自域名或子路径(受 §1 保留路径与代理约束)。
  - 结论:**#7 冻结的「`content/<slug>/` 多 collection + `/<slug>/docs/**` 前缀 + 顶栏切换器槽位」在 Mintlify 上不是一套机制**,至少要在上列三条里重定(见 §11 与 §14)。

## 5. 搜索

- **平台托管搜索**(站内搜索栏),在 dashboard 配「Results per query」(默认 6,1–100)、Result snippets;**页面级** `searchable: false` / `boost`(也可设在导航 group 上);**搜索过滤(product/version 下拉)需 Enterprise**([Search](https://www.mintlify.com/docs/optimize/search))。
- 无自托管/离线路径的文档化说明;`mint export` 的离线包明确「**does not support search**」,官方建议自行给导出的 HTML 接静态搜索工具([Offline export](https://www.mintlify.com/docs/deploy/export))。自托管部署下搜索**跑在你自己环境里**(Enterprise)([Self-host](https://www.mintlify.com/docs/deploy/self-host))。
- 对「优先无 SaaS」口径:站内搜索 = **SaaS 依赖**;想无 SaaS 只有在 Enterprise 自托管或放弃平台搜索两条路。

## 6. agent 面向(内核级,本票最强项)

- **`llms.txt` / `llms-full.txt` 自动托管在站根**,零维护;页面链接**自带 `.md` 后缀**;另有 `/.well-known/llms.txt`、`/.well-known/llms-full.txt`;可放自定义 `llms.txt` 覆盖自动版;索引超 100,000 字符时自动拆到 `/_llms/**` 下(递归索引,页面不丢);`llms.txt` 顺序 = 导航顺序;描述取 frontmatter `description`(截 300 字符);只列默认语言 + 默认版本,排除 `hidden`/`noindex`,除非 `seo.indexing: "all"`([llms.txt](https://www.mintlify.com/docs/ai/llmstxt))。
- **每个响应带 `Link` 头**广告:`llms.txt`、`llms-full.txt`、`/.well-known/api-catalog`、`/.well-known/mcp/server-card.json`、`/.well-known/agent-card.json`、`/.well-known/agent-skills/index.json`,外加 `X-Llms-Txt`;站点的 base path 前缀会带上([llms.txt](https://www.mintlify.com/docs/ai/llmstxt))。
- **每页 Markdown 导出**:任意页 URL 加 `.md`,或 `Accept: text/markdown` / `text/plain` 内容协商;不存在的页返回 **带恢复线索的 Markdown 404**(指向 llms.txt/llms-full + 最多 3 个相关页);支持 `<Visibility for="humans|agents">` 区分人与 agent 的内容;`markdown.instructions` 会渲染成 `Agent Instructions` 块,进每页 Markdown、`llms.txt`、`llms-full.txt`;API 参考页的 Markdown 默认带完整 OpenAPI 规范(`markdown.schema: false` 可关)([Markdown export](https://www.mintlify.com/docs/ai/markdown-export))。
- **MCP**:站点自带**搜索 MCP server**(定价页 Starter 即含)与**Admin MCP server**(可写:改页/改设置/开 PR)([Search MCP](https://www.mintlify.com/docs/ai/model-context-protocol)、[Admin MCP](https://www.mintlify.com/docs/ai/mintlify-mcp));另有 `skill.md`/agent card/skills index([skill.md](https://www.mintlify.com/docs/ai/skillmd))与公开的 Mintlify Index MCP(`https://index.mintlify.com/mcp`,`mint index` 一键配置多家客户端)([CLI](https://www.mintlify.com/docs/cli/commands))。
- **一手指纹**:本文所有引用链接都以 `.md` 结尾、且抓到了纯 Markdown 正文——这就是该站 agent 端点在运行中的直接证据。

## 7. API 参考(sdk / TypeDoc)

- Mintlify 的 API 参考主路是 **OpenAPI/AsyncAPI/GraphQL 规范驱动的 playground**([API playground overview](https://www.mintlify.com/docs/api-playground/overview)、[OpenAPI setup](https://www.mintlify.com/docs/api-playground/openapi-setup));对手写 MDX 参考页也有 [MDX setup](https://www.mintlify.com/docs/api-playground/mdx-setup)。
- **对 balsa 这种 TypeScript 库(Mintlify 没有 OpenAPI 面),真正的路径是 `sdk` 导航属性**([Generate SDK reference pages from doc-tool output](https://www.mintlify.com/docs/api-playground/sdk-reference-setup)):
  - 支持 `format: typedoc` 等五种;TypeDoc 侧要的是 **JSON 产物**:`npx typedoc --json typedoc.json src/index.ts`;
  - 在 `docs.json` 的 tab 或 group 上声明 `sdk: { format, source, directory }`;`source` 可为仓库相对路径**或 HTTPS URL**(远端限 50 MB 下载 / 200 MB 解压);`directory` 是生成页的 URL 前缀(默认 `sdk-reference`);
  - 平台按 class/interface/module/function 生成页面 + 导航分组 + 交叉链接 + 搜索索引;可给单个符号写 MDX 页(`sdk: "class Client"`),正文在前、生成参考在后;**只对出现在导航里的页生成**;
  - 约束:**带 `sdk` 的 tab 不能同时有 pages/versions/languages**(只能是 groups);带 `sdk` 的 group 可以有 pages + 嵌套 groups(不能有 graphql);产物目录建议进 `.mintignore`;
  - 维护方式:SDK 发布时 CI 产出 JSON 提交到本仓库,或上传到稳定 HTTPS 地址 + 调 Trigger deployment API 触发站点重建。
- **对 #4 结论的接口**:#4 的硬阻断在**产物生成侧**依然存在(TypeDoc 0.28.20 peer 上限 TS 6.0.x vs 框架 TS 7.0.2),绕行路线(TS6 别名 / `@kayahr/typedoc`)也依然适用——但**站点侧不再消费 TypeDoc 的 Markdown 主题**,只消费 **JSON**。`starlight-typedoc` 那一套 peer/主题问题在 Mintlify 路径下不存在;#9 的口径要从「手抄 md 生成树 + 站点渲染」改为「JSON 产物 + 平台渲染 + 警告面(导出缺口)」。

## 8. 定制与品牌边界(喂 #12)

- **主题是固定 9 选 1**(`mint`/`maple`/`palm`/`willow`/`linden`/`almond`/`aspen`/`sequoia`/`luma`),`theme` 在 `docs.json` 是必填([Themes](https://www.mintlify.com/docs/customize/themes))。
- **可配**:`colors.primary/light/dark`(hex,必填 primary)、`logo`(亮/暗 + href)、`favicon`、`appearance.default/strict`、`fonts`(Google Fonts 或自托管 woff2,含 heading/body 覆盖)、`icons.library`(fontawesome/lucide/tabler,单库)、`background`(decoration 渐变/网格/窗口、亮暗底色、背景图)、`styling`(eyebrow 样式、LaTeX、代码块 Shiki 主题与自定义语言)、`thumbnails`(社交缩略图)([Appearance and branding](https://www.mintlify.com/docs/organize/settings-appearance))。
- **自定义 CSS/JS**:`custom-scripts` 可注入 CSS/JS(分析、第三方 widget、playground server variables 等)([Custom scripts](https://www.mintlify.com/docs/customize/custom-scripts));自定义 404 页([Custom 404](https://www.mintlify.com/docs/customize/custom-404-page))。
- **自定义 React 组件**:MDX 里可直接写组件;`/snippets/` 下的组件文件可 import 复用。**约束(硬边界)**:hooks 预注入无需 import;**不能 import 第三方 npm 包**;不支持 default export;**snippet 之间不能互相 import**;**不能 import `.json`**;**无代码分割**(`React.lazy`/动态 `import()` 不可用,组件随页面整体加载)([React components](https://www.mintlify.com/docs/customize/react-components))。
- 含义:**「主题级接管布局」不存在**(没有 swizzle/eject 语义,也不能替换平台布局组件);定制上限 = 9 主题 + token/字体/图标/背景 + 自定义 CSS/JS + MDX 层组件 + 页面模式。这是 #12 的硬边界。

## 9. 定价与档位(2026-10-02 抓取,[pricing](https://mintlify.com/pricing))

| 档 | 价 | 与本站相关的关键能力 |
| --- | --- | --- |
| Starter | **$0/mo**(5 编辑席位) | 全平台基础、**自定义域**、web editor、认证、**MCP server**、API playground;分析/预览部署/CI checks 等不在内 |
| Pro | **$450/mo**(席位不限) | 加 agent(开 PR)、assistant、automations、**预览部署**、**admin API**、10,000 credits/mo(assistant 25 credits/答,automation 250 credits/更新,超出 $0.01/credit) |
| Enterprise | 面议 | 加 SSO/SCIM/RBAC、SLA、**自托管**、EU 托管、自定义门户、**多 repo**、**搜索过滤**、分析数仓流、BYOK 等 |

- 文档里明示档位的点(可直接引用):平台分析需 Pro+([CLI analytics](https://www.mintlify.com/docs/cli/commands));**CI checks 需 Pro/Enterprise**([CI checks](https://www.mintlify.com/docs/deploy/ci));**离线导出需 Enterprise**([Offline export](https://www.mintlify.com/docs/deploy/export));**静态导出 API 私测 + 需企业协议**([Static export](https://www.mintlify.com/docs/api/static-export/overview));**自托管需 Enterprise**([Self-host](https://www.mintlify.com/docs/deploy/self-host));**多 repo 需 Enterprise**([Multi-repository](https://www.mintlify.com/docs/deploy/multi-repo));**搜索过滤需 Enterprise**([Search](https://www.mintlify.com/docs/optimize/search))。
- **OSS Program**:「Non-commercial open source projects get Mintlify Pro free forever … custom domains, advanced analytics, API playgrounds, and AI workflows」([oss-program](https://www.mintlify.com/oss-program));页面上的资格细则未渲染出全文(见 §13)。
- **内容与数据归属**(Mintlify 自维护合同说明页,一手):「Mintlify owns all platform code, features, and methods. **Customers own all of their content and data.** … Your content, your data, and your documentation output are entirely yours. We make no claim on any of it.」;固定立场另含:可用去标识聚合用量数据、责任上限 12 个月费用(高敏可 2x)、**不得转售平台访问**、**不接受 convenience termination**([enterprise-contracting.mdx](https://raw.githubusercontent.com/mintlify/docs/main/enterprise-contracting.mdx);标准条款见 [ToS](https://www.mintlify.com/legal/terms))。

## 10. 退出路径(留站时能带走什么)

| 资产 | 能否带走 | 依据 |
| --- | --- | --- |
| 内容(MDX/Markdown + frontmatter + snippets) | ✅ 纯文件,本来就在我们仓库 | [Quickstart](https://www.mintlify.com/docs/quickstart) |
| 重定向台账 | ✅ 是 `docs.json` 数据,可转成别家的重定向表(注意平台语义是 308/307) | [Redirects](https://www.mintlify.com/docs/create/redirects) |
| 自定义 React 组件(嵌在 MDX 里的) | ✅ 可拷;但依赖平台内建组件/hooks 预注入的部分要改写 | [React components](https://www.mintlify.com/docs/customize/react-components) |
| 导航结构(`docs.json`) | ⚠️ 语义需整体重写(别家是 JS 配置 + 文件系统约定) | [Navigation](https://www.mintlify.com/docs/organize/navigation) |
| 主题/布局/i18n 结构 | ❌ 平台资产 | [Themes](https://www.mintlify.com/docs/customize/themes) |
| 站内搜索索引 / assistant / agent 端点 / MCP / 分析 | ❌ 平台服务,无导出路径(离线包明确不支持搜索) | [Offline export](https://www.mintlify.com/docs/deploy/export) |
| 渲染后的静态站 | ⚠️ **`mint export` 离线 zip 需 Enterprise**(且查看需 Node 起 `serve.js`,仅含导航内页面);**静态导出 API 私测 + 企业协议**(纯 HTML/CSS/JS,可自托管;导出用 `.html` URL,canonical/sitemap 保持无扩展名) | [Offline export](https://www.mintlify.com/docs/deploy/export)、[Static export](https://www.mintlify.com/docs/api/static-export/overview) |
| 自托管平台 | ⚠️ **仅 Enterprise**:Kubernetes/Helm(或 AWS CDK),需自备 MongoDB/PostgreSQL/Redis/S3 兼容桶/私有镜像仓库/OIDC 或 SAML;起步规模约 **45–60 vCPU / 160–220 GB 内存 / ~1 TB SSD**;空气隔离环境走静态导出 | [Self-host](https://www.mintlify.com/docs/deploy/self-host) |
| 折中路线(**值得 #8 知道**) | 「Headless docs with a custom frontend: Build a headless documentation frontend with Astro while using Mintlify for content management, AI-powered search, and assistant features」——官方存在这条「自建 Astro 前端 + Mintlify 内容/搜索/助手」的指南(细节未核) | [docs 索引](https://mintlify.com/docs/llms.txt)(Guides → Use cases);页 `/docs/guides/custom-frontend` |

**一句话**:内容层可逆,**站点运行时层不可逆**;要好退出路径就得在 Enterprise 档买静态导出/自托管,或从一开始就走 headless(自建前端)。

## 11. 对 #8 要求清单的逐项映射

| 要求轴 | 判定 | 事实与证据 |
| --- | --- | --- |
| 搜索(无 SaaS 口径) | **不满足**(平台托管) | 站内搜索由平台提供与配置;过滤需 Enterprise;无自托管/离线搜索路径(离线包不支持搜索) → [Search](https://www.mintlify.com/docs/optimize/search)、[Offline export](https://www.mintlify.com/docs/deploy/export) |
| i18n 预留 | **满足** | `languages` 导航 + 30 语言(含 `cn`/`zh-Hant`)+ `Accept-Language` 自动路由;语言走目录前缀;llms.txt 只列默认语言 → [Navigation](https://www.mintlify.com/docs/organize/navigation) |
| 版本化预留 | **满足** | `versions` 导航(`default`/`tag`),页面按版本目录组织;llms.txt 只列默认版本 → [Navigation](https://www.mintlify.com/docs/organize/navigation) |
| MDX 组件 | **满足(有硬约束)** | 内建组件库 + 自定义 React(无 npm import、无 default export、无代码分割、无 JSON import、snippet 不可互 import)+ 自定义 CSS/JS → [React components](https://www.mintlify.com/docs/customize/react-components) |
| API 参考接入 | **满足(路径换轨)** | `sdk` + `format: typedoc` 吃 **TypeDoc JSON**;`source` 可远端 HTTPS;`directory` 定 URL 前缀;单符号 MDX 页可混写。**#4 的 TS7 阻断转移到 JSON 产物生成侧**;#9 口径需重开 → [SDK reference setup](https://www.mintlify.com/docs/api-playground/sdk-reference-setup) |
| agent 面向(`.md` + llms.txt + MCP) | **满足(内核级,超出 #3 对比项)** | 每页 `.md` + `Accept` 协商、`llms.txt`/`llms-full.txt`(站根 + `.well-known`)、超限自动拆 `/_llms/**`、`Link` 头广告、搜索 MCP(Starter)、Admin MCP、`skill.md`/agent card、Mintlify Index MCP → §6 |
| 无 SaaS 取向 | **不满足(结构性)** | 构建/托管/搜索/agent 端点/编辑器/分析/CI checks 全在平台侧;唯一自托管路径是 Enterprise(K8s + 4 类数据存储) → [Self-host](https://www.mintlify.com/docs/deploy/self-host) |
| Astro 生态倾向 / 不引新栈 | **不满足** | 平台是 React/Next 系;与既有三站(Astro 7 + Tailwind 4)零工具链复用;唯一桥梁是官方 headless 指南(自建 Astro 前端 + 平台内容/搜索) → [docs 索引](https://mintlify.com/docs/llms.txt) |
| 构建与托管形态 | **受限(平台构建 + 平台托管)** | Git push(部署分支)→ 云构建 → 平台托管;预览部署与即时回滚属分档能力(定价页 Publishing 段);本地 `mint dev` 预览;也可调 REST API 触发部署/预览 → [GitHub](https://www.mintlify.com/docs/deploy/github)、[CLI](https://www.mintlify.com/docs/cli/commands)、[pricing](https://mintlify.com/pricing) |
| 内容规模可维护性(校验 / CI / 台账) | **受限但拆分后成立** | 台账 = `docs.json` redirects(308/307 + 通配 + `--check-redirects`);仓库 CI 可跑 `mint validate`/`format`/`broken-links`/`a11y`(官方 Actions 例);平台侧 CI checks(含 Vale)= Pro+;**frontmatter 必填校验无平台机制 → 自写脚本** → §2、§3 |

**与 #3 的关系**:#3 的排序(Starlight 基线)建立在「不引新栈 + 优先无 SaaS + i18n 预留」三权重上,Mintlify 在**第 2、3 权重上直接反向**(SaaS + React 栈),在 agent 面向、API 参考现成度、多语言/版本机制现成度、组件库、托管省心度上明显占优。四家对账与权重裁决是 #8 的活;本文不代裁。

## 12. 二级来源与已知争议(明确标注:非一手文档站)

- **2024-03 安全事件**:官方事故报告称约 **91 个 GitHub token 被泄露**、确认至少一个客户仓库被访问([Incident report on March 13, 2024](https://www.mintlify.com/blog/incident-march-13) 官方一手;媒体转述见 [TechCrunch](https://techcrunch.com/2024/03/18/mintlify-customer-github-tokens-data-breach/));后续改进说明见 [security-update](https://www.mintlify.com/blog/security-update)(AES256-GCM、弃用 GitHub OAuth token 存储、会话式访问控制等)。
- **2025-11 静态资源托管 XSS**:官方说明 `/_mintlify/static/` 端点未按客户隔离资源,研究者报告后修复([Mintlify Security Event — November 2025](https://www.mintlify.com/blog/working-with-security-researchers-november-2025))。
- **社区对 GitHub App 权限的抱怨**(二级/社区):[Hacker News 讨论](https://news.ycombinator.com/item?id=39730255)提到安装时请求「所有仓库」访问、需自行收窄;官方文档现明确建议 **Only select repositories**([GitHub](https://www.mintlify.com/docs/deploy/github))。
- **定价模型变动**(官方一手 + 二级转述):2026 年取消按席位计费、转向 outcome-based AI credits,[官方 blog](https://www.mintlify.com/blog/outcome-based-ai-pricing);第三方拆解(二级)见 [documentation.ai 定价分析](https://documentation.ai/blog/mintlify-pricing)。
- 记录这些不是裁决意见,而是 #8 若要写「引入 SaaS:理由 + 退出路径 + 代价」时需要一并入账的外部事实。

## 13. 未验证(拿不到一手依据或本次未核)

- **frontmatter 平台级校验强度**:文档只说「任意合法 YAML 字段」,未见「必填/值域校验」机制;`mint validate` 是否覆盖 frontmatter 未核实(absence-based)。
- **多项目缝在单仓库内的等价物**:能否用「一个内容根 + 目录前缀」模拟 `/<slug>/docs/**`(例如内容根放 `docs/…` 与 `<slug>/docs/…`、base path 留空)——文档没有这种用法的正面例子;平台原生多产品是 `products`,跨仓库是 Enterprise multi-repo。
- **`sdk.directory` 是否支持深层前缀**(如 `docs/reference/api`,以对上 #7 预留的 `/docs/reference/api/**`)——文档只出现单层例(`sdk/typescript`)。
- **站根 `/` → `/docs` 的 301/308**:Mintlify 在 base path 形态下如何处理域根未核实;推测由域主/反代处理(#10 面)。
- **OSS Program 资格细则**:页面组件未渲染出完整 criteria(仅得「non-commercial open source」;balsa 若未来商业化能否续用未证)。
- **平台配额/限流**:页面数、构建时长、带宽、支持响应等无公开数字;仅见静态导出 job 限流(10 次/小时/组织)与远端 artifact 50 MB/200 MB。
- **站内搜索能否整体关闭**:未见文档化开关;只有页面级 `searchable: false`。
- **反代场景下 agent 协商是否保持**:`Accept: text/markdown` 与 `/_llms/**` 走 Cloudflare Workers / Vercel / nginx 代理时是否被改写(官方只提醒 `<base-path>/*` 要放行 `/_llms/*`)。
- **Mintlify 自身 docs 的 `.md` 与 `Accept` 协商在 base path 下的实测**:本文只在其域根实例上验证。
- **headless(自建 Astro 前端)的完整代价**:官方指南页未逐条核(是否依赖 Pro/Enterprise API、是否含搜索/助手嵌入)。

## 14. 给 #8 的输入清单

1. **与已冻结规范的冲突清单(#6/#7 需修订的条目)**——若走 Mintlify,逐条最好在 #8 决议里点名,而不是让它悄悄漂移:
   - #6 §4「无 SaaS:校验脚本 + CI 关卡即可,不引外部服务」→ 现在校验由平台 CLI + 仓库脚本 + 平台侧 CI checks(Pro)三处构成;
   - #7 §3「生成 301」→ 平台语义是 **308/307**;
   - #7 §6 三则 URL 事实 → 第 1、2 条(`<route>.md`、`/llms.txt` 站根)**天然成立**,第 3 条「`/llms-manifest.json`」平台无此物,实际是 `/.well-known/api-catalog`、`/.well-known/mcp/server-card.json`、`/.well-known/agent-skills/index.json` 与 `/_llms/**`;
   - #7 §5 多项目缝(内容目录 + URL 前缀 + 切换器)→ 需在 products / multi-repo(Enterprise)/ 一项目一 site 三条里重定,并同步改「接入步骤清单」;
   - #7 §2 站树(`/` → 301 `/docs`、`/docs` = Introduction、两段封顶)→ 在 base path 形态下可映射(根 `index.mdx` + `concepts/agents.mdx` 等),但 base path 属平台配置、`/` 的处理待定;
   - #6 §6 `packages` 必填 → 平台不校验,需自写校验脚本(与钉 ref 漂移脚本同处跑)。
2. **六个轴的「必须/加分/无所谓」裁决输入**:§11 表可直接当对账底稿;真正会翻盘的只有两条——(a) **无 SaaS 是否硬约束**(是 ⇒ Mintlify 出局或必须走 Enterprise 自托管),(b) **agent 面向是否一等**(是 ⇒ Mintlify 在三家里最强的项上又压过 #3 的 Fumadocs)。
3. **API 参考面(#9)的口径重开**:产物 = TypeDoc **JSON**;`sdk` 只在 tab/group 上声明且互斥规则要写进规范;`directory` 决定 URL 前缀;警告面(10 条导出缺口)与「补导出」决策依旧待裁。
4. **agent 面向(#11)的盘子变化**:从「自建与否」变成「开哪些、裁剪什么、要不要 Admin MCP/WebMCP、`markdown.instructions` 与 `<Visibility>` 的写作规范」;`#11` 需新增一条「`llms.txt` 顺序 = 导航顺序」的耦合事实。
5. **成本与承诺入账**:$0 Starter(自定义域 + MCP + playground)/ $450 Pro(预览 + CI checks + agent/assistant + 10k credits)/ Enterprise(多 repo + 自托管 + 静态导出 + 搜索过滤);OSS Program(非商业 OSS 可用 Pro)。
6. **退出路径写成规范一节**(若 Mintlify 被裁):内容与组件可逆、导航/主题/搜索/agent 端点不可逆、静态导出与自托管只在 Enterprise;并把「是否值得为日志/静态导出上一档」留给 #10(交付与部署)一并裁。

---

_由 [调研:Mintlify 平台事实](https://github.com/0xnicholas/balsa-docs/issues/14) 产出(2026-10-02);仅平台事实与口径映射,不代 [决策:技术栈](https://github.com/0xnicholas/balsa-docs/issues/8) 裁决。_
