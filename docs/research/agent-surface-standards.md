# 调研:agent 面向的生态约定与现成实现(一手事实)

> 服务 ticket:[决策:agent 面向约定](https://github.com/0xnicholas/balsa-docs/issues/11);地图:[#1](https://github.com/0xnicholas/balsa-docs/issues/1)。日期:2026-09-30。
> 方法:官方规范页、上游仓库源码、IANA/官方注册表 + **live 探测**(HTTP 响应头、sitemap、`.well-known` 端点、页面产出)。每条论断附一手链接;live 探测标注实测时间(2026-09-30)。
> 定位:只呈事实,不裁决——「做不做 / 做多深」归 #11 的 grilling。拿不到一手依据的点集中第 8 节。

## TL;DR(最可能改变裁决的十条)

1. **llmstxt.org 规范(v2)全文没有 `llms-full.txt` / `llms-small.txt`**(实测 grep 0 命中);规范只定义 `llms.txt` 与「每页 `.md` 变体」,并用 **`rel="alternate"; type="text/markdown"` + `rel="describedby"`** 做发现([llmstxt.org](https://llmstxt.org/))。
2. 事实标准里更常见的是**未注册**的 `rel="llms-txt"` + `X-Llms-Txt` 头:Mintlify 平台与 mastra 都在用;IANA link-relations 与 message-headers 注册表**均无 llms 条目**(实测)。
3. **`Accept: text/markdown` 内容协商已是主流做法**:Mintlify、Cloudflare Developer Docs、Stripe、mastra 实测可用(Fumadocs 提供内核原语);Anthropic docs 实测**不**支持。规范文本里没有提协商。
4. 聚合全量文件(`llms-full.txt`)在真站点上**极大**:Cloudflare 62 MB、Anthropic 38.9 MB、Mintlify 1.6 MB;而**参照物 mastra 根本不发**(`/llms-full.txt`、`/llms-small.txt` 实测 404)。
5. `starlight-llms-txt` 的 `exclude` **只作用于 `llms-small.txt`**——没有「把某子树排除出 `llms-full.txt`」的配置项;要分片只能用 `customSets`(产出 `/_llms-txt/<slug>.txt`)或自写路由([源码 generator.ts](https://github.com/delucis/starlight-llms-txt/blob/main/packages/starlight-llms-txt/generator.ts))。
6. `starlight-llms-txt` 生成的 `llms.txt` 是**入口文件**(标题 + 摘要 + 指向 full/small/customSets 的链接),**不含逐页链接**——与 llmstxt.org 的「H2 file-list」范式不同。
7. `starlight-dot-md` 吐的是**源文件原文**:MDX 组件以原始 JSX 出现(`import { Aside, Steps, Tabs } …`、`<Tabs>`),不渲染、不降级(官方 demo live 实测);且**只覆盖 Starlight 的 `docs` 集合**(源码 `getCollection("docs")`),子项目自建集合不在内。
8. `starlight-dot-md` **不注入** `<link rel="alternate" type="text/markdown">`,**也不进 sitemap**(两项均以官方 demo 的产物 live 实测)。
9. **Agent Skills 的 `.well-known` 发现机制尚未进主规范**:agentskills/agentskills PR #254 与 issue #255 仍 open;但 Cloudflare 提案(v0.2.0 Draft)已被 **vercel-labs 的 `skills` CLI 实现**,且 Cloudflare / Mintlify / mastra / Stripe 四家**已在线上发布** `/.well-known/agent-skills/index.json`(或旧格式)且实测 200。
10. **docs MCP 有两种落地形状**:平台托管 HTTP 端点(Mintlify 每站自带 `/mcp`;Cloudflare `https://docs.mcp.cloudflare.com/mcp`)与自建路由(Fumadocs `npx @fumadocs/cli feature mcp` → `/api/mcp`);此外还有不占站点托管面的**本地 stdio npm 包**形态。

## 0. 抓取范围与方法

| 事实面 | 一手来源 | 探测方式 |
| --- | --- | --- |
| llms.txt 规范 | [llmstxt.org](https://llmstxt.org/)(v2,2026-08-10 更新) | 全文抓取 + grep |
| 采纳面 | OpenAI / Anthropic / Google / Cloudflare / Stripe / Mintlify / mastra | `curl -w` 状态码 + `content-type` + 体积 |
| Starlight 插件 | npm registry + 上游仓库源码 + 官方文档站 | registry API + raw 源码 + 文档页 |
| HTTP 层 | IANA media types、IANA link-relations、RFC 7763 | 注册表抓取 + live `curl -I` |
| Agent Skills | [agentskills.io/specification](https://agentskills.io/specification)、[cloudflare/agent-skills-discovery-rfc](https://github.com/cloudflare/agent-skills-discovery-rfc)、[vercel-labs/skills](https://github.com/vercel-labs/skills) | 规范页 + CLI 源码 + GitHub API + `.well-known` 实测 |
| Docs MCP | Mintlify / Cloudflare / Fumadocs 官方文档 + npm registry | 文档页 + 端点实测 |

## 1. llms.txt 规范(llmstxt.org v2)

**作者与版本**:Jeremy Howard;v1 发布于 2024-09-03,**v2 更新于 2026-08-10**([llmstxt.org](https://llmstxt.org/))。

**格式**(规范原文顺序):

1. 可选 BOM;
2. **H1 = 项目/站点名——唯一必需段**;
3. blockquote 摘要(「key information necessary for understanding the rest of the file」);
4. 零或多个**非标题** Markdown 段(补充信息);
5. 零或多个 **H2 段**,每段是「file list」:`- [name](url)` + 可选 `: notes`。

另有 `## Optional` 段约定:次要信息,「links an agent can skip when a shorter context is needed」。

**位置与作用域**:文件名固定 `llms.txt`,可放**站根**或**任意子路径**(`/docs/llms.txt`);「A file covers the URLs under its path, and where more than one file applies, agents should use the most specific one」。

**每页 markdown 变体**(规范明确提议):同 URL 追加 `.md`(`page.html.md`)或替换扩展名(`page.md`);无文件名的 URL 用 `index.html.md` / `index.md`。

**发现机制**(规范明确提议):

- `rel="alternate"; type="text/markdown"` 指向页面的 markdown 版本;
- `rel="describedby"` 指向覆盖它的 `llms.txt`;
- 两者都可用 HTML `<link>` **或** HTTP `Link:` 头;规范给的例子:
  `Link: </docs/page.html.md>; rel="alternate"; type="text/markdown", </docs/llms.txt>; rel="describedby"`。

**规范明确拒绝 `/.well-known/`**(RFC 8615)路线,理由:well-known URI 只存在于 origin 根,而很多发布者只控制共享主机上的一个路径,GitHub Pages 项目站永远无法在宿主根的 `/.well-known/` 放文件;`llms.txt` 描述它所在的路径,这是单一根位置表达不了的。

**与 sitemap 的关系**:不是替代——sitemap 常缺 LLM 可读版本、不含站外链接、体量通常超出上下文窗口。

**规范提到的采纳面(原文)**:「thousands of sites publish an llms.txt file, documentation platforms generate one automatically, and Chrome's Lighthouse audits sites for one as part of its agentic browsing checks. The AI labs themselves publish llms.txt files for their own developer docs: OpenAI, Anthropic, and Gemini.」

**规范列出的集成**:Mintlify / GitBook / Yoast SEO / AIOSEO / Wix 自动生成;库与插件:`vitepress-plugin-llms`、`docusaurus-plugin-llms`、Drupal recipe、`llms-txt-php`、`server-llm-txt`(MCP server,让 agent 抓取与检索 llms.txt)。目录站:[llmstxt.site](https://llmstxt.site)、[directory.llmstxt.cloud](https://directory.llmstxt.cloud)、[llmstxthub.com](https://llmstxthub.com)。

**关键 absence**:规范全文 **0 次**提到 `llms-full.txt` 或 `llms-small.txt`(实测 grep)→ 这两个文件名是社区/平台约定,无规范定义。

**live 采纳探测(2026-09-30,`curl -L -o /dev/null -w '%{http_code} %{content_type} %{size_download}'`)**

| 站点 | `llms.txt` | `llms-full.txt` |
| --- | --- | --- |
| Anthropic | `docs.anthropic.com/llms.txt` → 200 `text/plain; charset=utf-8` 70 KB | 200 `text/plain` **38.9 MB** |
| OpenAI | 站根 `/llms.txt` → 403/404;`platform.openai.com/docs/llms.txt` → 200 `text/plain` 43 KB | `/llms-full.txt` 404 |
| Google | `ai.google.dev/llms.txt` 404;`ai.google.dev/gemini-api/docs/llms.txt` → 200 **`text/markdown; charset=utf-8`** 35 KB | 未测 |
| Cloudflare | `developers.cloudflare.com/llms.txt` → 200 `text/plain` 16 KB(**另有 per-product 层级**:`/workers/llms.txt`、`/dns/llms.txt` …) | 200 **`text/markdown; charset=utf-8`** 62 MB |
| Stripe | `docs.stripe.com/llms.txt` → 200 **`text/markdown; charset=utf-8`** 92 KB | 404 |
| Mintlify | `www.mintlify.com/docs/llms.txt` → 200 `text/plain` 23 KB | 200 `text/plain` 1.6 MB |
| mastra(参照物) | `mastra.ai/llms.txt` → 200 `text/plain; charset=utf-8`(`server: Vercel`) | **404 / 404(`llms-small.txt` 亦 404)** |

> Cloudflare 的层级式 `llms.txt`(每产品一份,站根那份是索引)是规范「任意子路径」形态的现成范例。

## 2. `starlight-llms-txt` 0.12.0(delucis)

**包事实**(npm registry 实测):latest `0.12.0` @ 2026-09-15;MIT;peer `astro ^7.0.0`、`@astrojs/starlight >=0.41.0`;依赖含 `rehype-parse`/`rehype-remark`(HTML→Markdown)、`micromatch`(glob)([npm](https://registry.npmjs.org/starlight-llms-txt)、[仓库](https://github.com/delucis/starlight-llms-txt))。

**默认产出三件**([Getting Started](https://delucis.github.io/starlight-llms-txt/getting-started/)):

| 文件 | 内容(源码依据) |
| --- | --- |
| `/llms.txt` | **入口**:`# {title}` + `> {description}` + `details` + `## Documentation Sets`(链接 `llms-small.txt`、`llms-full.txt`、每个 customSet 的 `/_llms-txt/<slug>.txt`)+ 固定 `## Notes` 两条 + 可选 `## Optional`。[`llms.txt.ts`](https://github.com/delucis/starlight-llms-txt/blob/main/packages/starlight-llms-txt/llms.txt.ts) |
| `/llms-full.txt` | 全部页面正文(`minify: false`),前缀 `<SYSTEM>…</SYSTEM>`。[`llms-full.txt.ts`](https://github.com/delucis/starlight-llms-txt/blob/main/packages/starlight-llms-txt/llms-full.txt.ts) |
| `/llms-small.txt` | 同 full,但 `minify: true` + 应用 `exclude`。[`llms-small.txt.ts`](https://github.com/delucis/starlight-llms-txt/blob/main/packages/starlight-llms-txt/llms-small.txt.ts) |

**`llms.txt` 不含逐页链接**——逐页发现只能通过 full/small 正文,或站内 `.md`/(若自行提供)。与 llmstxt.org 的「H2 file-list 列 URL」范式不同。

**配置项全表**([Configuration](https://delucis.github.io/starlight-llms-txt/configuration/)):

| 选项 | 默认 | 作用与边界 |
| --- | --- | --- |
| `projectName` | Starlight `title` | `llms.txt` 的 H1 |
| `description` | Starlight `description` | `llms.txt` 的 blockquote(可含 Markdown) |
| `details` | — | description 之后的补充段 |
| `optionalLinks` | `[]` | `## Optional` 段的外部链接 |
| `customSets` | `[]` | `{label, paths[], description?}`,`paths` 是页面 slug 的 glob → 产出 `/_llms-txt/<slug>.txt` 并链进 `llms.txt`(**分片/分类聚合的唯一现成通道**) |
| `promote` / `demote` | `['index*']` / `[]` | 只影响 full/small 的页序 |
| `exclude` | `[]` | **仅作用于 `llms-small.txt`** |
| `rawContent` | `false` | 直出原始 Markdown 不处理;「You must enable the `rawContent` option if your content includes components built with UI frameworks like React, Vue, Svelte」 |
| `customSelectors` | `[]` | CSS 选择器,按输出删 HTML 元素:`small` / `full`(+customSets)/ `all` |
| `minify` | 见下 | 只作用于 small:`note`/`tip`/`details` 默认 true,`caution`/`danger` 默认 false,`whitespace` 默认 true,`collapseCodeBlocks` 默认 false |
| `pageSeparator` | `"\n\n"` | 页面拼接分隔符 |

**生成器事实**([`generator.ts`](https://github.com/delucis/starlight-llms-txt/blob/main/packages/starlight-llms-txt/generator.ts)):

- `getCollection('docs', doc => isDefaultLocale(doc) && !doc.data.draft)` → **只读 Starlight 的 `docs` 集合**,只含默认语言、非 draft 页;
- `include`(customSets)/ `exclude` 都是对 **page id** 做 micromatch;
- 标题取 `hero.title || title`,描述取 `hero.tagline || description`;
- 正文经 `entryToSimpleMarkdown`(**渲染后 HTML → Markdown** 转换,故 React/Vue/Svelte 组件需要 `rawContent`);
- 三个路由均 `prerender = true`;`site` 必须配置。

**live 事实**:delucis 的 GH Pages 上 `llms.txt` 响应 `content-type: text/plain; charset=utf-8`(平台 MIME,非 markdown);**不在 sitemap**(实测 `sitemap-0.xml` 只有 3 条 HTML URL)。

## 3. `starlight-dot-md` 0.2.1(morinokami)

**包事实**:latest `0.2.1` @ 2026-04-18;MIT;peer `astro >=5.0.0`([npm](https://registry.npmjs.org/starlight-dot-md)、[仓库](https://github.com/morinokami/starlight-dot-md))。

**机制**([`index.ts`](https://raw.githubusercontent.com/morinokami/starlight-dot-md/main/packages/starlight-dot-md/src/index.ts)):`injectRoute({ pattern: "/[...slug].md", prerender: true })`;`preserveExtension` 开启时另注入 `.mdx` / `.mdoc` 两条路由。

**覆盖面**([`slug.md.ts`](https://raw.githubusercontent.com/morinokami/starlight-dot-md/main/packages/starlight-dot-md/src/slug.md.ts)):`getCollection("docs")` → **只认 Starlight 的 `docs` 集合**。子项目自建集合(如 `src/content/<slug>/`)与任何非 `docs` 集合**不在覆盖内**。

**输出形态**([`utils.ts`](https://raw.githubusercontent.com/morinokami/starlight-dot-md/main/packages/starlight-dot-md/src/utils.ts)):`entry.body` **源文件原文**;`includeFrontmatter` 默认 `true`,即 `---` + `yaml.stringify(entry.data)` + 正文。**MDX/Astro 组件原样以 JSX 出现,不渲染、不降级**——官方 demo 实测 `getting-started.md` 开头即:

```md
import { Aside, Steps, Tabs, TabItem } from "@astrojs/starlight/components";

## Installation

<Steps>

1. Install the `starlight-dot-md` package …
   <Tabs syncKey="package-manager">
     <TabItem label="npm">
```

**路由响应头**:源码显式返回 `"Content-Type": "text/markdown; charset=utf-8"`;但静态产物阶段该头是否保留需实测(§4)。

**选项**([Configuration](https://starlight-dot-md.shf0811.workers.dev/configuration/)):`includeFrontmatter`(默认 true)、`excludePatterns`、`includePatterns`(对 page id 的 picomatch glob)、`preserveExtension`(默认 false,`.mdx`/`.mdoc` 归一到 `.md`)。

**路由形态细节**:`trailingSlash: "always"` 时产出 `/path/index.md`(否则 `/path.md`);**dev 模式需访问带尾斜杠的 URL**(`/path/index.md/`)。

**两项 live 实测(官方 demo 站 `starlight-dot-md.shf0811.workers.dev`,`server: cloudflare`;是否纯静态资产无法从外部判定)**:

- HTML head **无** `<link rel="alternate" type="text/markdown">`(逐行 grep 无命中);
- `sitemap-0.xml` 只有 3 条 HTML URL,**无 `.md`**(`.md` 路由不进 sitemap);
- `GET /getting-started.md` → 200 `content-type: text/markdown`(**无 charset**;与源码里的 `; charset=utf-8` 不一致,见 §4)。

## 4. HTTP 层:Content-Type、Link 关系、Accept 协商

### 4.1 `text/markdown` 的规范要求

- IANA 注册(2014-11-11,2016-03-28 更新,见 [RFC 7763](https://www.rfc-editor.org/rfc/rfc7763.txt)、[IANA 登记页](https://www.iana.org/assignments/media-types/text/markdown));
- **`charset` 是必需参数且无默认值**(RFC 6838 §4.2.1);可选参数 `variant`;
- 故规范上正确的形态是 `text/markdown; charset=utf-8`。

live 实测(2026-09-30):

| 资源 | 实测 Content-Type |
| --- | --- |
| Stripe `/llms.txt`、Stripe `/api.md` | `text/markdown; charset=utf-8` |
| Google `ai.google.dev/gemini-api/docs/llms.txt` | `text/markdown; charset=utf-8` |
| Cloudflare `/llms-full.txt` | `text/markdown; charset=utf-8` |
| mastra `…/overview.md` | `text/markdown; charset=utf-8` |
| Mintlify 页面 `.md` | `text/markdown; charset=utf-8` |
| **starlight-dot-md demo 的 `.md`(`*.workers.dev`,`server: cloudflare`)** | **`text/markdown`(无 charset)** |
| mastra `/llms.txt` | `text/plain; charset=utf-8`(Vercel) |
| GH Pages 上的 `llms.txt`(delucis) | `text/plain; charset=utf-8` |

> CF 侧那条与插件源码不一致,说明静态产物阶段该头很可能来自平台 MIME 表而非路由代码;外部无法判定该站是否用了 `_headers` 覆盖。balsa 的 `_headers` 决策仍需要在首次上线实测(#10 §10.2 已列)。

### 4.2 Link 关系与发现头

| 头 | 谁在用 | 注册状态 |
| --- | --- | --- |
| `Link: </llms.txt>; rel="llms-txt"` + `X-Llms-Txt: /llms.txt` | mastra(live 实测:HTML 页与 `.md` 都带)、**Mintlify 平台为每个站点插入** | **未注册**——IANA [link-relations](https://www.iana.org/assignments/link-relations/link-relations.xhtml) 注册表实测 0 次命中 `llms`;[message-headers](https://www.iana.org/assignments/message-headers/message-headers.xhtml) 亦 0 次 |
| `Link: </llms-full.txt>; rel="llms-full-txt"`、`rel="api-catalog"` / `"mcp-server-card"` / `"agent-card"` / `"agent-skills"` | Mintlify 平台([文档原文](https://www.mintlify.com/docs/ai/llmstxt.md)) | 平台自定义 |
| `Link: </.well-known/skills/index.json>; rel="service-meta"` | Stripe(live 实测) | — |
| `rel="alternate"; type="text/markdown"`(HTML head) | mastra(live 实测 `<link rel="alternate" type="text/markdown" href="…/overview.md">`) | `alternate` 已注册 |
| `rel="describedby"`(规范推荐) | 本次抽样**未在任何站点实测到** | `describedby` 已注册(IANA 表 4 次命中) |
| 无 llms 相关头 | Cloudflare Developer Docs、Anthropic docs(live 实测均无 Link / X-Llms-Txt) | — |

Mintlify 的完整头(官方文档原文):

```http
Link: </llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt", </.well-known/api-catalog>; rel="api-catalog", </.well-known/mcp/server-card.json>; rel="mcp-server-card", </.well-known/agent-card.json>; rel="agent-card", </.well-known/agent-skills/index.json>; rel="agent-skills"
X-Llms-Txt: /llms.txt
```

Mintlify 另在 `/.well-known/llms.txt` 与 `/.well-known/llms-full.txt` 各放一份,**专为「遵循 `.well-known` 约定的工具」**——恰好与 llmstxt.org 拒绝该路径的立场相反。

### 4.3 `Accept: text/markdown` 内容协商

实测方法:`curl -I -H 'Accept: text/markdown' <HTML 页面 URL>`,看响应 `content-type` 与 `vary`。

| 站点 | 协商 | 证据 |
| --- | --- | --- |
| Mintlify 平台 | ✅ | `content-type: text/markdown; charset=utf-8`,`vary: accept-encoding, Accept, User-Agent`;[官方文档](https://www.mintlify.com/docs/ai/markdown-export.md)明确写 `Accept: text/markdown` 或 `text/plain` |
| Cloudflare Developer Docs | ✅ | `text/markdown; charset=utf-8`,`vary: accept-encoding, accept`;`GET /workers/index.md` 与 `/workers/.md`(后者 404) |
| Stripe docs | ✅ | `text/markdown; charset=utf-8`,`vary: Accept, Accept-Language` |
| mastra | ✅ | HTML URL + `Accept: text/markdown` → `text/markdown`;`.md` URL 恒为 markdown(带 `Accept: text/html` 也是) |
| Anthropic docs | ❌ | `Accept: text/markdown` 仍返回 `text/html; charset=UTF-8` |
| Fumadocs(框架) | 提供原语 | `isMarkdownPreferred(request)` + `rewritePath`;官方提醒:同 URL 两种表示需要 `Vary: Accept`,而 Next.js App Router **页面**响应会丢弃 `Vary`,故 HTML 侧需在 CDN 设置([AI & LLMs](https://fumadocs.dev/docs/integrations/llms)) |

规范层面:llmstxt.org v2 **没有**提出 Accept 协商,只提「同 URL 的 `.md` 变体 + link relation」。协商是 Mintlify/Fumadocs 一系的实际做法。

## 5. Agent Skills:规范、CLI 与 `.well-known` 发现

### 5.1 格式规范([agentskills.io/specification](https://agentskills.io/specification))

- skill = 一个目录,至少含 `SKILL.md`;可选 `scripts/`、`references/`、`assets/`。
- frontmatter:**必需** `name`(1–64 字符、仅小写字母数字与连字符、不得首尾连字符、不得连续连字符、**必须等于父目录名**)、`description`(1–1024 字符,须说明「做什么 + 何时用」);**可选** `license`、`compatibility`、`metadata`、`allowed-tools`(experimental)。
- progressive disclosure 三级:metadata ~100 tokens → SKILL.md 全文(建议 <5000 tokens / <500 行)→ 按需引用文件。
- 校验工具:`skills-ref`(同仓库)。
- 规范只定义「skill 目录里有什么」,**不定义目录装在哪里**——`.agents/skills/` 是客户端侧演化出的共享约定([adding-skills-support.mdx](https://github.com/agentskills/agentskills/blob/main/docs/client-implementation/adding-skills-support.mdx))。

### 5.2 分发 CLI([vercel-labs/skills](https://github.com/vercel-labs/skills),npm `skills`)

- npm `skills` latest **1.7.0** @ 2026-09-17;MIT;bin `skills` 与 `add-skill`;依赖仅 `tar` + `yaml`(实测 registry)。
- 自述「The CLI for the open agent skills ecosystem」;「Supports **OpenCode**, **Claude Code**, **Codex**, **Cursor**, and 75 more」。
- 用法:`npx skills add <owner/repo | GitHub/GitLab/Azure/git URL | 本地路径 | 直接下载 URL>`;`npx skills use … --agent <agent>` 可不安装、只生成 prompt;安装到 `./<agent>/skills/`(项目)或 `~/<agent>/skills/`(全局),可选 symlink(默认)或 copy。
- 目录站:[skills.sh](https://skills.sh/)(自述「The Agent Skills Directory」,榜单按 installs 排序;本次未核其统计口径)。
- README 原文:「**Direct download URLs are tried after well-known discovery.**」→ well-known 是首选发现路径。
- 源码依据:`src/providers/wellknown.ts` 定义 `DISCOVERY_SCHEMA_V2 = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json'`,同时兼容 v0.1.0(`files[]`)与 v0.2.0(`type`/`url`/`digest`),并有针对 path-scoped URL 的 `WellKnownScopeNotFoundError`(避免误装宿主全部 skills)。

### 5.3 `.well-known` 发现机制([cloudflare/agent-skills-discovery-rfc](https://github.com/cloudflare/agent-skills-discovery-rfc))

- **状态:Draft v0.2.0**,Published 2026-01-17 / Updated 2026-03-12。
- 索引固定位置:`/.well-known/agent-skills/index.json`(v0.2.0 由 v0.1.0 的 `/.well-known/skills/` **改名**而来)。
- 索引结构:必填 `$schema`(当前 `https://schemas.agentskills.io/discovery/0.2.0/schema.json`)+ `skills[]`;每条 `name` / `type`(`"skill-md"` 或 `"archive"`)/ `description` / `url` / `digest`(`sha256:{64 hex}`)。v0.2.0 与 v0.1.0 **不向后兼容**(v0.1.0 是 `files[]`,无 digest)。
- 客户端未识别 `$schema` 时 SHOULD 警告且不解析;`type: "skill-md"` 约定 `url` 为 `/.well-known/agent-skills/{name}/SKILL.md`。
- **仍在上游流程中**:agentskills/agentskills [PR #254](https://github.com/agentskills/agentskills/pull/254)(「Add spec for `.well-known` URI」)**state: open**,2026-03-16 建、2026-09-17 最后更新,未合并;[issue #255](https://github.com/agentskills/agentskills/issues/255) 亦 open(20 条评论)(GitHub API 实测 2026-09-30)。另有 publisher 侧元数据 `skill.json` 的对齐讨论(issue #9)。

### 5.4 线上采纳(2026-09-30 实测 `GET`)

| 站点 | `/.well-known/agent-skills/index.json` | 旧格式 `/.well-known/skills/index.json` | 备注 |
| --- | --- | --- | --- |
| Cloudflare Developer Docs | 200 `application/json` 5.9 KB | — | 多条 `type: "archive"`(agents-sdk / cloudflare / cloudflare-email-service …),`url` 用相对路径 `/....tar.gz` |
| Mintlify docs | 200 1.1 KB | 200(旧格式) | 另 `/.well-known/agent-card.json`(A2A 0.3 agent card)、`/.well-known/api-catalog` |
| mastra.ai | 200 1.4 KB | 200 1.4 KB | 两条 archive:`mastra`、`mastra-factory`;`url` 带 `?ref=<sha>` 版本参数 |
| Stripe docs | — | 200 8 KB(`files[]` 旧格式) | 由 `Link: …; rel="service-meta"` 头声明 |

### 5.5 站点侧形态(Mintlify 的现成做法)

- 站点根自动生成 `/skill.md`(agentic loop 生成,可能需 24h;可手写覆盖);多 skill 时 `/skill.md` **重定向**到 `/.well-known/skills/index.json`。
- 自定义 skill 放 `.mintlify/skills/<name>/SKILL.md`,支持目录 symlink(避免重复文件)。
- skill 可作为 **MCP resources** 暴露给连上其 MCP server 的 agent([skill.md](https://www.mintlify.com/docs/ai/skillmd.md))。

## 6. Docs MCP server 现状

### 形状 A:平台托管的 HTTP 端点

- **Mintlify**:每个站点自带搜索 MCP server,`https://<site>/mcp`(认证站另有 `/authed/mcp`)。工具三类:**Search**、**Query docs filesystem**、反馈提交;发现文档 `GET /.well-known/mcp`(live 实测返回 `{version, transport, url, servers[]}`),server card 在 `/.well-known/mcp/server-card.json` / `server-cards.json`(含 `tools[]` 与 JSON Schema、工具注解 `readOnlyHint` 等)。文档明说:**工具名各站不同**,「use the value returned by the discovery endpoint rather than hardcoding it」。另有 **WebMCP**(浏览器内 5 个工具:`search_docs` / `read_page` / `get_site_overview` / `read_skill` / `navigate_page`,需 Pro/Enterprise)([MCP server](https://www.mintlify.com/docs/ai/model-context-protocol.md))。
- **Cloudflare**:**Documentation server** 挂在 `https://docs.mcp.cloudflare.com/mcp`(live 实测:GET 返回 405,`access-control-allow-methods: POST, OPTIONS`,CORS 放行 `MCP-Protocol-Version`/`Mcp-Method` 等头 → streamable HTTP、POST-only);工具 `search_cloudflare_documentation`([apps/docs-vectorize](https://github.com/cloudflare/mcp-server-cloudflare/tree/main/apps/docs-vectorize))。Cloudflare 另有一整套域名 MCP server(Workers Bindings / Observability / Browser rendering / Container 等),官方页:[Cloudflare's own MCP servers](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/)。
- **mastra**:站点侧**没有** docs MCP server(本次实测未见;其 agent 分发走 skills 包 + npm 内嵌文档,见 #2 调研)。

### 形状 B:自建路由(框架给积木)

- **Fumadocs**:`npx @fumadocs/cli feature mcp` 生成 `/api/mcp`(**streamable HTTP**),基于 `@modelcontextprotocol/server` 的 `createMcpHandler` + `fumadocs-core/mcp` 的 `registerSourceTools`(list/search/read)与 `registerSearchTool`;需要站点自己的服务端路由(Next.js 等),即**不是纯静态部署能给的**([AI & LLMs §MCP](https://fumadocs.dev/docs/integrations/llms))。

### 形状 C:本地 stdio npm 包(不占站点托管面)

- 例:[`@arabold/docs-mcp-server`](https://registry.npmjs.org/@arabold/docs-mcp-server) 3.2.1 @ 2026-09-27,bin `docs-mcp-server`,自述「MCP server for fetching and searching documentation」;
- 社区同类:`frappe_docs_mcp`(明示 stdio + `@modelcontextprotocol/sdk`)、`@mcp-x/mcp-docs-server`(可改造的模板)、`web-tools-mcp-server` 等。
- 这一形状下,**站点只需提供可抓取的 markdown(llms.txt / `.md`),不需要任何运行时**。

### 标准/登记

- 官方 MCP registry 在跑:`https://registry.modelcontextprotocol.io/v0/servers?search=…`(live 实测返回 JSON),server 记录含 `remotes[].type: "streamable-http"`,docs 类 server 已有登记(例:`ac.tandem/docs-mcp`,remote `https://tandem.ac/mcp`)。
- MCP 规范本身对「文档 server 该暴露什么工具」**没有**约定(见 §8)。

## 7. 横向对照(只列实测/文档确认的格子)

| 面 | mastra | Mintlify 平台 | Cloudflare Docs | Stripe Docs | Starlight 现成件 |
| --- | --- | --- | --- | --- | --- |
| 每页 `.md` | ✅ `/overview.md`(`text/markdown; charset=utf-8`) | ✅ `.md` 后缀 | ✅ `…/workers/index.md`(无扩展名 URL 用 `index.md`) | ✅ `/api.md` | `starlight-dot-md`(**源文件原文**) |
| 每页 `/llms.txt` | ✅(与 `.md` 同内容、`text/plain`) | ✖️ | ✖️ | ✖️ | ✖️ |
| 站根 `llms.txt` | ✅ 入口 + 使用指引 | ✅ 自动生成 | ✅ 层级式(每产品一份) | ✅ | `starlight-llms-txt`(入口式,无逐页链接) |
| `llms-full` | ✖️ 404 | ✅ 1.6 MB | ✅ 62 MB | ✖️ 404 | `starlight-llms-txt` |
| `llms-small` | ✖️ 404 | ✖️ | ✖️ | ✖️ | `starlight-llms-txt`(唯一提供者) |
| 站级发现头 | `rel="llms-txt"` + `X-Llms-Txt` | `rel="llms-txt"`/`llms-full-txt`/`mcp-server-card`/`agent-card`/`agent-skills` + `X-Llms-Txt` | 无 | `rel="service-meta"`(skills index) | ✖️(插件不注入) |
| HTML head `rel="alternate" type="text/markdown"` | ✅ | 未测 | 未测 | 未测 | ✖️(dot-md 实测无) |
| Accept 协商 | ✅ | ✅ | ✅ | ✅ | ✖️ 无现成件 |
| Agent Skills 分发 | ✅ skills 包 + `.well-known` | ✅ 自动 `/skill.md` + `.well-known` | ✅ `.well-known` | ✅ 旧格式 `.well-known` | ✖️ |
| Docs MCP | ✖️(站点侧) | ✅ 托管 `/mcp` | ✅ 托管 `docs.mcp.cloudflare.com/mcp` | 未测 | ✖️(Fumadocs 才给) |

## 8. 未验证 / absence-based(诚实清单)

1. **CF Workers 静态资产对 `.md` 的默认 Content-Type 表**:未找到官方文档页;唯一实测是一个恰好在 CF 静态资产上的 Starlight 站返回 `text/markdown`(无 charset),但**无法从外部判定该站是否用了 `_headers`**。balsa #10 §10.2 的首次上线实测仍然必要。
2. **`starlight-dot-md` 是否注入 head link**:以官方 demo 产物判断为「无」(absence-based);未逐版本审阅其 CHANGELOG 是否曾有计划。
3. **Starlight 生态是否存在 Accept 协商插件**:本次未见任何一手实现(absence-based,不等于不存在)。
4. **`starlight-dot-md` 的 dev 模式行为**:官方文档只说明「dev 需带尾斜杠」;其与 `trailingSlash`/`build.format` 的组合、以及 `rawContent` 类选项**均不存在**于该插件(它没有渲染管线),差异属实施核对。
5. **`llms-full.txt` / `llms-small.txt` 无任何规范定义**:仅「不在 llmstxt.org 内」是实测结论;各实现格式互不相同(Starlight 插件的 `<SYSTEM>` 前缀、Mintlify 的逐页标题+URL),**没有可比对的权威格式**。
6. **MCP docs server 的工具集无约定**:未见官方 MCP 文档对该场景的规定(absence-based);相反,Mintlify 明确说工具名是站点特定的。
7. **OpenAI 的 llms.txt 位置**:`platform.openai.com/docs/llms.txt` 200,但站根 `/llms.txt` 404/403 —— llmstxt.org 的「lab 都发」指其开发者文档路径,不是站根。
8. **`.well-known/agent-skills` 采纳清单不完整**:本次只抽验 Cloudflare / Mintlify / mastra / Stripe 四家;无全量目录。另有 publisher 侧 `skill.json` 与 discovery 的对齐讨论未展开。
9. **skills.sh 的 installs 统计口径**未核(页面自称 1,502,663 等数字,来源与去重规则未验证)。
10. **Cloudflare 62 MB / Anthropic 38.9 MB 的 `llms-full.txt` 是否被真实 agent 消费**无证据;此二值只作为「体积事实」记录。
11. **RFC 7763 的 `variant` 参数**在真实 docs 站点上的使用:本次未发现任何站点使用 `text/markdown; variant=…`(absence-based)。
