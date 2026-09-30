# 调研:文档站候选栈对比——Starlight / Docusaurus / Fumadocs

> 研究 ticket:[#3](https://github.com/0xnicholas/balsa-docs/issues/3)。日期:2026-09-30。地图:[#1](https://github.com/0xnicholas/balsa-docs/issues/1)。
> 一手来源:三家官方文档站与其 GitHub 仓库、npm registry 版本快照(2026-09-30 实测)。每个论断附来源链接;拿不到一手依据的点集中在「未验证」一节。
> 定位提醒:本文只做事实呈现 + 按给定口径的推荐排序,不替 `决策:技术栈` 票裁决;API 参考的深水区归 [调研:API 参考生成管线](https://github.com/0xnicholas/balsa-docs/issues/4)。

## 口径(本票给定)

英文优先 · 优先无 SaaS · agent 面向(每页 `.md` / `llms.txt`)· API 参考接入 · i18n 预留 · 版本化预留 · 作者既有生态为 Astro。

## TL;DR

- 三家都是 MIT、都在活跃维护,且**都能满足英文优先**。真正的分水岭是四个口径项:**无 SaaS 搜索、agent 面向的现成度、i18n/版本化的成熟度、与既有 Astro 生态的复用面**。
- **agent 面向**:Fumadocs 是唯一把 `/llms.txt`、`/llms-full.txt`、**每页 `.md`**、Accept 协商、MCP server 做进内核的([官方 AI & LLMs 页](https://fumadocs.dev/docs/integrations/llms));Starlight 与 Docusaurus 都靠社区插件,且 Starlight 侧只有 llms.txt/full/small 三个聚合文件,**未见文档化的每页 `.md` 路由**。
- **无 SaaS 搜索**:Starlight 开箱即用 Pagefind(零配置、纯静态索引),是本口径下最省事的一家([Site Search](https://starlight.astro.build/guides/site-search/));Docusaurus 的官方搜索是 Algolia DocSearch(SaaS),本地搜索是社区插件([Search](https://docusaurus.io/docs/search));Fumadocs 默认搜索可自托管(也可静态),但静态索引会让客户端下载整包索引,官方自己对大站建议上云([Built-in Search](https://fumadocs.dev/docs/headless/search/orama))。
- **i18n / 版本化**:Docusaurus 两件都是内核能力且最成熟(版本化有 CLI 与 `versions.json` 全流程);Starlight 的 i18n 是一等公民(含简体中文 UI 内置翻译、缺译回退),但版本化只有早期社区插件;Fumadocs 明确声明「不是完整 i18n 库」,路由要自己接,且 i18n 指南不覆盖 Astro。
- **生态复用**:作者三个既有站点全是 Astro(7.1–7.2 + Tailwind 4),Starlight 与它们共用同一套 `astro.config.mjs`/Vite/Tailwind 心智;Fumadocs 挂在 Astro 上有官方手册,但要引入 `@astrojs/react` + Tailwind 4 + 手写路由;Docusaurus 与既有站点零复用。
- **按口径的推荐排序**:① **Astro Starlight** ② **Fumadocs** ③ **Docusaurus 3**。反方最强论据见 §11:Fumadocs 在 agent 面向与组件库上完胜;Docusaurus 在版本化/参考物保真度上完胜。

## 0. 版本快照(npm registry,2026-09-30 实测)

| 包 | 版本 | 上游最后发布 | 许可 | 备注 |
| --- | --- | --- | --- | --- |
| `astro` | 7.3.5 | 2026-09-24 | MIT | `engines.node >=22.12.0` |
| `@astrojs/starlight` | 0.42.4 | 2026-09-24 | MIT | |
| `@docusaurus/core` | 3.10.2 | 2026-09-25 | MIT | `engines.node >=20` |
| `fumadocs-core` / `fumadocs-ui` | 16.15.17 | 2026-09-29 | MIT | `fumadocs-mdx` 15.4.5 |
| `starlight-typedoc` | 0.23.1 | 2026-08-12 | MIT | HiDeoo |
| `starlight-versions` | 0.10.1 | 2026-08-26 | MIT | 早期开发 |
| `starlight-llms-txt` | 0.12.0 | 2026-09-15 | MIT | delucis |
| `docusaurus-plugin-typedoc` | 1.4.3 | 2026-09-07 | MIT | |
| `docusaurus-plugin-llms` | 0.6.0 | 2026-09-01 | MIT | rachfop |
| `@easyops-cn/docusaurus-search-local` | 0.55.3 | 2026-07-29 | MIT | 离线搜索 |
| `typedoc` | 0.28.20 | 2026-07-05 | Apache-2.0 | |
| `typedoc-plugin-markdown` | 4.13.1 | 2026-09-18 | MIT | 含 Docusaurus 主题 |

> Astro 7 的 Node 下限(`>=22.12.0`)与 balsa-framework 的 `engines` 完全一致;Docusaurus 要 Node ≥20。

## 1. 搜索(无 SaaS 口径)

| 栈 | 默认 | 离线/自托管路径 | 一手来源 |
| --- | --- | --- | --- |
| Starlight | **Pagefind**,零配置、静态索引 | 默认即离线;另有 Algolia DocSearch 官方插件可选 | [Site Search](https://starlight.astro.build/guides/site-search/) |
| Docusaurus | **Algolia DocSearch**(官方一等支持,免费但需申请、每周爬取) | 社区插件:Typesense(可自托管)、Local Search、自写 `SearchBar` | [Search](https://docusaurus.io/docs/search) |
| Fumadocs | **ZBSearch**(自托管搜索服务或静态索引「可自托管且完全免费」) | 静态模式 `staticGET` + `staticClient`;亦可换 Algolia / Orama Cloud / Typesense / Mixedbread / FlexSearch | [Built-in Search](https://fumadocs.dev/docs/headless/search/orama)、[ZBSearch (default)](https://fumadocs.dev/docs/search/orama) |

- Fumadocs 官方对静态搜索的告诫原文:「Static Search requires clients to download the exported search indexes. For large docs sites, it can be expensive.」——这正好是「优先无 SaaS」与「站点规模」的张力点([Built-in Search §Static Mode](https://fumadocs.dev/docs/headless/search/orama))。
- Fumadocs 的多语言搜索默认可用:「Search works with every language out of the box - the default `multilingual` mode uses Unicode word segmentation, so all locales (including Chinese and Japanese) share a single search database with zero config.」([同页](https://fumadocs.dev/docs/headless/search/orama))。
- Docusaurus 的 Algolia 路线有一个别家少见的现成能力:**contextual search** 按当前语言与版本文档自动加 facet 过滤([Contextual search](https://docusaurus.io/docs/search))——但它绑定 Algolia。
- Docusaurus 的离线选择以社区为主,其中 `@easyops-cn/docusaurus-search-local` 自述「An offline/local search plugin/theme for Docusaurus v2/v3, which supports multiple languages, especially optimized for language of zh」,且 README 提到 Ask AI 需另装 `open-ask-ai` 外部服务([仓库](https://github.com/easyops-cn/docusaurus-search-local))。

## 2. i18n 预留

- **Starlight**:内核能力。`locales` + `defaultLocale` 配置、按语言分目录、`root` 语言(无前缀)、缺译自动回退并在页面上提示「This content is not available in your language yet.」、RTL 支持;**UI 字符串内置约 35 种语言翻译(含简体中文)**,可用 `i18n` 集合覆盖([Internationalization](https://starlight.astro.build/guides/i18n/))。
- **Docusaurus**:内核能力,机制最重也最完整——`i18n/[locale]/[pluginName]/...` 目录、`write-translations` CLI 生成 Chrome i18n JSON、RTL、`hreflang`;明确不做自动语言探测与 slug 翻译([i18n 介绍](https://docusaurus.io/docs/i18n/introduction))。
- **Fumadocs**:非 i18n 库。官方原话:「Fumadocs is not a full-powered i18n library, it's up to you when internationalizing the rest of your app.」i18n 路由指南只覆盖 Next.js / React Router / TanStack Start / Waku,**没有 Astro**([Internationalization](https://fumadocs.dev/docs/internationalization))。
- 口径含义:英文优先 + 中文后置时,Starlight 的「缺译回退 + 内置中文 UI」是最低成本路径;Fumadocs 若选 Astro 路线,i18n 要自己搭。

## 3. 版本化预留

- **Docusaurus**:内核能力。`docusaurus docs:version <x>` 复制 `docs/` → `versioned_docs/version-x/`、生成版本化侧栏、写 `versions.json`;可配 `lastVersion` / `includeCurrentVersion` / `onlyIncludeVersions` / `banner`(`unreleased`/`unmaintained`)/ `badge`([Versioning](https://docusaurus.io/docs/versioning))。官方同时给出**劝退**:「Most of the time, you don't need versioning as it will just increase your build time, and introduce complexity」。
- **Fumadocs**:两种文档化模式——「Root Type」同站内多版本(每个版本一个文件夹 + `meta.json` 标 `root` 类型,布局渲染版本下拉,切换时保位置)与「Full Versioning」(整站多版本,用 git 分支分别部署到子域)([Navigation](https://fumadocs.dev/docs/navigation))。
- **Starlight**:内核无版本化;社区插件 `starlight-versions`(0.10.1)走文件夹式版本化(归档页面与资产到 `1.0/` 目录),其 README 明确警告「an opinionated plugin that is still in early development. Expect frequent updates and changes」([仓库](https://github.com/HiDeoo/starlight-versions)、[About Versioning](https://starlight-versions.vercel.app/guides/about-versioning/))。
- 口径含义:地图已裁「多版本文档实施出域,规范只定版本化立场与 URL 预留」。在此前提下,Docusaurus 的成熟度优势打折(不强需求),而 Starlight 的早期插件也不构成当下的阻塞;但若将来真要「同站多版本 + 版本化侧栏」,Starlight 是三者中风险最高的一条。

## 4. 侧栏与内容规模

| 栈 | 默认侧栏 | 依据 |
| --- | --- | --- |
| Starlight | **默认按文件系统自动生成**(用文件 `title` 作条目);也可手写 `sidebar` 数组(`slug` / 字符串简写 / `link` / 分组 `items`),组内可用 `autogenerate: { directory }` | [Sidebar Navigation](https://starlight.astro.build/guides/sidebar/) |
| Fumadocs | 文件系统 + `meta.json`(`title` / `root` / `pages` / `icon`)构成 page tree,布局按 tree 渲染 | [Navigation](https://fumadocs.dev/docs/navigation) |
| Docusaurus | `sidebarPath` 未指定时**自动按 `docs/` 文件系统生成**;也支持显式 category/doc/link 项、多侧栏、`hideable` / `autoCollapseCategories` / `className` / `customProps` / `key` | [Sidebar](https://docusaurus.io/docs/sidebar) |

- 三家的 frontmatter 校验都不以「独立校验脚本」形式提供:mastra 那四类脚本(`validate:frontmatter` / `validate:reference-sidebar` / `validate:sidebar-docs` / `validate:sidebar-new-tags`)是它自己写的(见地图 [调研:mastra 文档站拆解](https://github.com/0xnicholas/balsa-docs/issues/2)),不是任一候选栈的开箱功能。
- Starlight 与 Fumadocs 的 frontmatter 有**内容集合 schema 兜底**:Starlight 用 `docsLoader()` + `docsSchema()`(Astro content collections,Zod)([i18n 页的 `content.config.ts` 示例](https://starlight.astro.build/guides/i18n/));Fumadocs 在 Astro 手册里同样用 `defineCollection({ loader: glob(...), schema: z.object({ title: ..., ... }) })`([Astro 手册](https://fumadocs.dev/docs/manual-installation/astro))。Docusaurus 的内核 frontmatter 校验强度**本次未核实**(见 §12)。

## 5. MDX 组件与主题定制边界

- **Starlight**:内置组件(卡片、标签页等)+ CSS 自定义属性(`--sl-*` 一整套)+ **cascade layers** 有序覆盖 + Tailwind 4 兼容包(`@astrojs/starlight-tailwind`,把 Tailwind 主题色/字体接到 Starlight UI 上)+ 社区主题目录([CSS & Styling](https://starlight.astro.build/guides/css-and-tailwind/)、[Getting Started 的 Components/Extend 指引](https://starlight.astro.build/getting-started/))。定制语言是 Astro 组件,不是 React。
- **Docusaurus**:**swizzling**——`eject`(复制原组件、完全接管)或 `wrap`(包装增强),组件分 safe/unsafe 等级,官方警告 eject unsafe 组件会把内部实现复制进站点、**升级时要迁移**,并建议优先 wrap([Swizzling](https://docusaurus.io/docs/swizzling));样式走 Infima CSS 变量。
- **Fumadocs**:组件与布局最丰富——Tabs(持久化/共享值)、Steps、Accordion、TypeTable、AutoTypeTable、Banner、Files、Graph View、图片缩放、Inline TOC、动态代码块、Twoslash、Mermaid、Math;四种布局(Docs / Flux / Glass / Notebook)+ 主题与 CSS 预设(见 [文档索引](https://fumadocs.dev/llms.txt) 的 Fumadocs UI 段)。
- 「做到 mastra 级的组件」:mastra 侧是 Docusaurus + 自研 MDX 组件与 Algolia/Kapa 插件(见 [调研:mastra 文档站拆解](https://github.com/0xnicholas/balsa-docs/issues/2));Fumadocs 与 Docusaurus 都是 React 栈,组件复制/改造路径短;Starlight 需要写 Astro 组件(必要时加 React island),自由度足够但**没有现成的 mastra 组件可搬**。

## 6. API 参考接入(与 ticket #4 的交界)

- **Starlight**:`starlight-typedoc`(0.23.1)是**为 Starlight 定制的 TypeDoc 插件**,基于 TypeDoc + `typedoc-plugin-markdown`,配置 `entryPoints` + `tsconfig`,并把 `typeDocSidebarGroup` 直接插进侧栏;仓库内有 multiple entry points / packages 两套 fixture 与 sidebar/content/pagination/slug 的 e2e 测试([仓库](https://github.com/HiDeoo/starlight-typedoc)、[Getting Started](https://github.com/HiDeoo/starlight-typedoc/blob/main/docs/src/content/docs/getting-started.mdx))。
- **Docusaurus**:`typedoc-plugin-markdown`(4.13.1)自述提供「Companion themes for Docusaurus, VitePress, GitHub Wiki, and GitLab Wiki workflows」,配合 `docusaurus-plugin-typedoc`(1.4.3)([npm](https://www.npmjs.com/package/typedoc-plugin-markdown))。
- **Fumadocs**:官方 TS 集成是 `fumadocs-typescript`(5.4.1)的 `AutoTypeTable` / `remarkAutoTypeTable`——**从 TS 源文件路径生成类型表**,支持 `@internal` 隐藏、`@remarks` 简化类型名、`@fumadocsType` 全名、`@fumadocsHref` 链接([Typescript](https://fumadocs.dev/docs/integrations/typescript))。`typedoc-plugin-markdown` 的伴生主题清单里**没有 Fumadocs**,即「整棵 API 参考树生成」在 Fumadocs 上不是铺好的路。
- 口径含义:若按「TypeDoc 生成整页参考」走,Starlight 与 Docusaurus 都有现成插件,Starlight 那条与本站点同生态、配置面最小;Fumadocs 更擅长「手写指南里嵌类型表」。深水区交 ticket #4。

## 7. agent 面向(每页 `.md` / llms.txt)

| 能力 | Starlight | Docusaurus | Fumadocs |
| --- | --- | --- | --- |
| `llms.txt` | 社区插件 `starlight-llms-txt`(0.12.0):llms.txt / llms-full.txt / llms-small.txt | 社区插件 `docusaurus-plugin-llms`(0.6.0):llms.txt + llms-full.txt | **内核** `llms()`:`index()` / `page()` / `full()` |
| 每页 `.md` | 未见文档化支持 | 社区插件可选生成「individual `.md` files per page」 | **内核**:`*.md` 路由(`docsLlms.page`) |
| 内容协商 | 未见 | 未见 | **内核**:`Accept` 头 `isMarkdownPreferred` + `rewritePath`(附 `Vary: Accept` 注意事项) |
| MCP server | 未见 | 未见 | **内核配套**:`npx @fumadocs/cli feature mcp` 生成 `/api/mcp`(streamable HTTP,`registerSourceTools` / `registerSearchTool`);另有实验性 WebMCP |
| 页面 AI 动作 | — | — | `MarkdownCopyButton` / `ViewOptionsPopover` 等 |

- Fumadocs 一手来源:[AI & LLMs](https://fumadocs.dev/docs/integrations/llms)(含 `remark-llms` 把 MDX 组件渲染成有意义的 Markdown:[Remark LLMs](https://fumadocs.dev/docs/headless/mdx/remark-llms))。
- Starlight 一手来源:[starlight-llms-txt Getting Started](https://delucis.github.io/starlight-llms-txt/getting-started/):「auto-generates `llms.txt`, `llms-full.txt`, and `llms-small.txt` context files」——未提每页 `.md`。
- Docusaurus 一手来源:[docusaurus-plugin-llms](https://www.npmjs.com/package/docusaurus-plugin-llms) README:「Optionally writes individual `.md` files per page for closer llmstxt.org compliance」「Supports custom LLM files, multi-instance docs, and multi-version output」。
- 口径含义:agent 面向是 Fumadocs 的**唯一压倒性优势项**;Starlight 侧要达到「每页 `.md` + MCP」需要自研(Astro 端点/自定义路由),这属于本票的**实施成本**,不是能力不可能。

## 8. 构建与托管

- **Starlight**:Astro 静态构建(`astro build`),部署面即 Astro 的部署面([Getting Started §Deploy](https://starlight.astro.build/getting-started/) 指向 [Astro deploy 指南](https://docs.astro.build/en/guides/deploy/))。
- **Docusaurus**:`npm run build` 产出 `build/` 静态文件,「A Docusaurus site is statically rendered, and it can generally work without JavaScript!」,可托管到 Vercel / GitHub Pages / Netlify / Render / Surge([Deployment](https://docusaurus.io/docs/deployment))。
- **Fumadocs**:默认**server-first**——「By default, Fumadocs use a server-first approach which always requires a running server to serve」;静态化需按框架配置(Next `output: 'export'`、React Router SPA、TanStack SPA、Waku),且静态搜索要客户端下载索引([Static Build](https://fumadocs.dev/docs/deploying/static))。**但走 Astro 路线时天然是预渲染的**(`getStaticPaths` + React island),搜索用 `staticClient`([Astro 手册](https://fumadocs.dev/docs/manual-installation/astro))。
- 口径含义:纯静态托管上 Starlight 最直接;Fumadocs 若走 Next.js 则把「需不需要跑 Node」变成需要显式决策的事,走 Astro 路线可绕开。

## 9. 与作者既有 Astro 生态的复用面

- 本地事实(三个既有站点,均为 Astro 7,均无 Starlight/React):
  - `tokencamp-www`:`astro ^7.1.3` + `@tailwindcss/vite ^4` + Tailwind 4,`astro.config.mjs` 仅配 Vite 插件。
  - `ultralisk-website`:`astro ^7.1.0` + `@astrojs/preact` + `@astrojs/sitemap`,`output: 'static'`、`site`、`trailingSlash: 'never'`、`prefetch`。
  - `heirloom-www`:`astro ^7.2.6`,`output: 'static'`,`site` + `base`(GitHub Pages 项目站点)。
- **Starlight**:共用同一 `astro.config.mjs` / Vite / Tailwind 4 心智与工具链;写作面是 Markdown/MDX + Astro 组件,与既有站点同族。是三者中唯一「不引入新栈」的选项。
- **Fumadocs on Astro**:有官方手册,但要求 `@astrojs/react` + `@astrojs/mdx` + Tailwind 4 + `takumi-js` + `sharp`,内容集合要自己写 loader 适配层,文档路由要手写 `.astro` 页面;且 i18n 指南不含 Astro([Astro 手册](https://fumadocs.dev/docs/manual-installation/astro))。等于在 Astro 壳里再养一套 React 文档框架。
- **Docusaurus**:独立 React/Infima 技术栈,与既有站点零复用(但参考物 mastra 就是 Docusaurus,「照抄」路径最短)。

## 10. 按口径的推荐排序

1. **Astro + Starlight**(推荐基线)——唯一不引入新栈(既有三站全是 Astro 7 + Tailwind 4,版本下限与 balsa-framework 的 Node `>=22.12.0` 一致);搜索默认离线 Pagefind,最贴合「优先无 SaaS」;i18n 一等公民且**内置简体中文 UI 翻译 + 缺译回退**,与「英文优先、中文后置」直接对齐;API 参考有同生态的 `starlight-typedoc` 现成插件;纯静态托管。代价:agent 面向要自研每页 `.md`/MCP(社区插件只给三个聚合文件),版本化短期只有早期插件,深度定制要写 Astro 组件。
2. **Fumadocs**——agent 面向与组件库最强(内核 llms.txt / 每页 `.md` / Accept 协商 / MCP server,Twoslash、AutoTypeTable、四种布局),静态搜索可自托管;但它是 React-first,挂 Astro 需自建适配层,i18n 自认「不是 i18n 库」且指南无 Astro,整页 API 参考无现成路,静态索引体积有官方告诫。若「agent 面向 + 组件丰富度」的权重大于「不引入新栈」,它值得反超。
3. **Docusaurus 3**——版本化与 i18n 机制最成熟,且与 mastra 参照物同栈(组件/IA 可高保真对标);但官方搜索是 Algolia(SaaS),本地搜索靠社区,主题定制要 swizzle 上游组件并承担升级耦合,与既有 Astro 生态零复用,构建/心智全新一套。在「版本化实施已出域」的本图里,它的最大优势被折掉了一块。

## 11. 反向证据与不确定点(必须交给裁决票一起看)

- **对 Starlight 不利**:① `starlight-versions` 官方自述早期开发、会频繁变动,若将来真要多版本同站,风险高于另两家;② 每页 `.md` 与 MCP 无现成支持,agent 面向要写代码;③ 深度组件定制(如 mastra 的 Kapa/Algolia 级交互)没有现成件可搬。
- **对 Fumadocs 有利的反方**:agent 面向是**内核级**且带 MCP,这一项在「文档站同时服务人与 agent」的新共识下价值可能被低估;`remark-llms` 能把 MDX 组件渲染成 Markdown,比「直接吐原始 Markdown」更完整。
- **对 Docusaurus 有利的反方**:若作者能接受 Algolia DocSearch(对公开技术文档免费),它的搜索体验与 contextual search(按版本+语言过滤)是成熟商品,且版本化/i18n 的机械程度远高于另两家;与 mastra 同栈能让「参照系抄近路」。
- **对排序本身的提醒**:本排序把「不引入新栈」「无 SaaS」权重放高,源于地图 Notes 的既定口径;**若「agent 面向」被定成一等目标(比如要求每页 `.md` + MCP 首发就有),排序应改为 Fumadocs 第一。**

## 12. 未验证(拿不到一手依据或本次未核实的点)

- **Starlight 的 Pagefind 在 zh 内容上的分词/召回表现**:本次仅确认「零配置内置」,未找到官方多语言分词说明;Fumadocs 那侧有明确说明(Unicode 分词,含中日),Starlight 侧无对应一手陈述。
- **Starlight 是否存在文档化的每页 `.md` 路由**:未见(absence-based),不等于不可能(Astro 端点可自建),但未找到官方或插件提供。
- **Docusaurus 内核 frontmatter 校验强度**:本次未核实其 docs 插件对 frontmatter 的校验规则。
- **`@zbsearch/search` 包**:`npm view @zbsearch/search` 返回空(可能包名不同),ZBSearch 仅从 Fumadocs 文档指向 [zbsearch.dev](https://www.zbsearch.dev) 确认;其独立仓库/许可未核。
- **Fumadocs 静态搜索索引体积量级**:官方只给「大站可能昂贵」的定性告诫,无数字;balsa 文档站规模未知,无法换算。
- **`starlight-typedoc` 对 balsa 特有形态的覆盖**:零依赖 workspace 包、10 个子路径导出、Standard Schema 双接口、动态参数泛型——本次未实测,归 [ticket #4](https://github.com/0xnicholas/balsa-docs/issues/4)。
- **迁移/学习成本的一手量化**:无(不存在可比基准),§9 的判断基于仓库内工具链事实。

## 13. 对「决策:技术栈」票的输入清单

1. 三家都满足「英文优先」;真正分叉的是**无 SaaS 搜索**(Starlight 默认最省事)、**agent 面向**(Fumadocs 内核级,其余靠社区/自研)、**i18n/版本化成熟度**(Docusaurus 最高,Starlight i18n 强但版本化弱,Fumadocs 都属自建)与**生态复用**(Starlight 唯一不引入新栈)。
2. 若把地图 Notes 的「优先无 SaaS」当硬约束:Docusaurus 的官方搜索路线被排除(社区本地搜索可替代);Fumadocs 静态搜索可行但有体积告诫;Starlight 无痛。
3. 若把「与既有 Astro 站点同栈」当硬约束:只剩 Starlight 与「Fumadocs on Astro」;后者要额外承担 React 桥、手写路由、i18n 自建。
4. 若把「agent 面向首发完整」当硬约束:**Fumadocs 内核直接给,Starlight/Docusaurus 都要写**——这是最可能翻转排序的一项。
5. 「版本化预留」在本图已出域,评估时只需看 **URL 形态能否预留**;三方都能做到,不必为版本化成熟度付溢价。
6. 建议票内把这些做成「必须 / 加分 / 无所谓」三档再裁决;本文只提供事实与默认权重下的排序,不代裁。
