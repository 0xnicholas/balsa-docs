# 调研:托管平台事实表——Cloudflare Pages / Cloudflare Workers 静态资源 / Vercel / Netlify / GitHub Pages

> 研究方:决策票 [#10 决策:交付与部署](https://github.com/0xnicholas/balsa-docs/issues/10) 的**事实腿**;地图 [#1](https://github.com/0xnicholas/balsa-docs/issues/1)。抓取日期:**2026-09-30**(本机直连各官方文档站)。本文只呈现**平台侧事实**,不替 #10 裁决。
> 一手来源:各平台官方文档站 / 官方仓库 / 官方定价页;拿不到一手依据的点集中在 §8「未验证」。

## 0. 口径(本票给定)

- 站点 = **Astro 7 + Starlight 纯静态构建**(`astro build` → `dist/`),**无 adapter、无 SaaS 运行时依赖**;Node 基线 `>=22.12.0`;pnpm(版本由 `package.json` `packageManager` 钉)。
- URL 形态:`/` 必须**真永久重定向**到 `/docs`;页级重定向台账需在托管层兑现真永久重定向(静态产物自带的是 meta-refresh,见 [#8 规范](../spec/stack.md));URL 两段封顶 + 预留 `/docs/v<n>/**`、`/<slug>/docs/**`;`/llms.txt` 必须留在**站根**(故 `base` 保持为空)。
- 取向:**优先无 SaaS**、轻量、零运行时锁定。
- 环境事实:`balsa.dev` 的 **NS 记录 = Cloudflare**(`etta.ns.cloudflare.com` / `ryan.ns.cloudflare.com`,本机 `dig` @1.1.1.1 / @8.8.8.8 一致返回);但本机 DNS 的 A 记录被沙箱改写(返回 `198.18.0.0/15` 保留段,`ultralisk.io` 等对照域同样如此),**站点当前是否已上线无法从本机判定**。
- 平台现状提示:Cloudflare 自 2024-09 起把静态托管能力并入 **Workers 静态资源**,官方**迁移指南**与 **Astro 官方部署指南**均已指向 Workers;Pages 仍受支持、文档现行(见 §1/§2)。

## 1. TL;DR 裁决表

✓ = 免费档满足 / △ = 满足但有代价或需实测 / ✗ = 不满足。

| 要件(本票相关) | CF Pages | CF Workers 静态资源 | Vercel(Hobby) | Netlify(Free) | GitHub Pages |
| --- | --- | --- | --- | --- | --- |
| `/` → `/docs` 等**路径级真永久重定向** | ✓ 301 可显式 | ✓ 301 可显式 | △ 308(非 301) | ✓ 301 为默认 | ✗ 仅 meta-refresh |
| 台账文件落点 | `public/_redirects` | 同左(语法一致) | `vercel.json` `redirects` | `_redirects` / `netlify.toml` | — |
| 免费档规则上限 | 2,100 条/项目 | 2,100 条/项目 | 2,048 条(批量重定向 Pro 起) | 官方建议 < 10,000 | — |
| 通配 / 占位符 | ✓ splat + placeholder | ✓ 同左 | ✓ 通配 + 正则(legacy routes) | ✓ splat(仅段尾)+ placeholder | — |
| PR 预览(免费档) | ✓(仅同仓库 PR) | ✓(Preview URL + PR 评论) | ✓ | ✓(且预览扣 0 credits) | ✗ 无预览 |
| 预览默认 noindex | ✓ `X-Robots-Tag: noindex` | ✓ 同左 | ✓ 预览 + 旧生产部署 noindex | ✓ 预览 + 旧分支部署 noindex | n/a |
| 预览加保护 | ✓ Cloudflare Access | ✓ Cloudflare Access | △ 仅 Vercel Authentication(密码保护属 Pro) | ✓ 密码 / 团队登录 | n/a |
| 平台原生构建配额 | 500 次/月,1 并发,20 min 超时 | 3,000 分钟/月,1 并发,20 min | 100 部署/日,1 并发(分钟不限) | 1 并发;生产部署 15 credits/次 | 10 次/小时(自定义 Actions 工作流不受限) |
| 构建缓存 | ✓ 需手动开启(Astro 缓存 `node_modules/.astro`) | △ 文档未列缓存条目 | ✓ 依赖缓存默认开 | ✓ 平台侧构建缓存 | ✓ `actions/cache` 自理 |
| 免费档流量/请求 | 无限量(静态资源) | 无限量(静态资源) | 100 GB + 100 万 CDN 请求/月 | 300 credits/月 ≈ **15 GB 带宽**或 150 万请求,用尽即**整站停** | 100 GB/月(soft),站点 ≤1 GB |
| 商用条款 | 无限制 | 无限制 | ✗ **仅非商用个人用途** | ✓ Free 可商用 | △ 禁止「以商业交易/SaaS 为主的站点」 |
| 自定义域(apex + 子域) | ✓(apex 须为该 CF zone) | ✓(精确主机名,apex↔子域需另配重定向) | ✓ | ✓ | ✓(apex↔www/子域自动互跳) |
| 尾斜杠/规范 URL 控制 | △ 未文档化 | ✓ 文档化 `html_handling`(307) | ✓ `trailingSlash`(308) | △ Pretty URLs(转发,非重定向) | △ 未文档化 |
| 自定义响应头(`.md` Content-Type / immutable 缓存) | ✓ `_headers`(100 条) | ✓ `_headers`(100 条) | ✓ `headers` | ✓ `_headers` | ✗ 完全不可设 |
| 自定义 404 | ✓ `404.html`(自动探测) | ✓ 须显式配 `not_found_handling` | △ 未逐条核 | ✓ `404.html` 自动 | ✓ `404.html` |
| 一键回滚 | ✓ Rollbacks | ✓ Versions | ✓ 即时回滚 | ✓ Deploy 不可变 + rollback | ✗ 靠 revert 重部署 |
| GitHub Actions 直传产物 | ✓ `wrangler pages deploy` + 两个 secret | ✓ `wrangler deploy` + 同 secret | ✓ `vercel deploy --prebuilt` + token | ✓ `netlify deploy --prod` + token | ✓ `actions/deploy-pages`(免 token) |
| 自带隐私分析 | ✓ CF Web Analytics(免费,无个人数据) | ✓ 同左 | △ Web Analytics 5 万事件/月额度 | ✓ Web Analytics(留存仅当日) | ✗ |

## 2. Cloudflare Pages

### 2.1 重定向

- `_redirects` 放在静态资产目录(框架项目 = `public/`,会随构建进 `dist/`);格式 `[source] [destination] [code?]`,**默认 302**,`301`/`302`/`303`/`307`/`308` 全支持([Pages Redirects](https://developers.cloudflare.com/pages/configuration/redirects/))。
- 上限:**2,000 条静态 + 100 条动态 = 2,100 条**;超过走账号级 Bulk Redirects([Pages Limits §Redirects](https://developers.cloudflare.com/pages/platform/limits/))。
- 匹配能力:单 splat(`/blog/*` → `/posts/:splat`)、命名占位符(`:code`/`:name`)、可选 `200` 代理;**不支持** query 参数匹配、**不支持**域名级重定向、**不支持**正则。
- 关键语义:**「Redirects are always followed, regardless of whether or not an asset matches the incoming request.」**——重定向优先于同名静态文件;且**只有第一条匹配生效**(链式不传导)。`_headers` 里写明了「redirects 先于 headers 执行」。
- 与台账口径的关系:`/` → `/docs` 与旧页搬迁都是「一行一条 301」即可表达,不需要 Bulk Redirects。

### 2.2 自定义头与缓存

- `_headers`(同目录、同匹配语法):最多 100 条规则、单行 2,000 字符;可用 `!` 前缀**删除**平台默认头;可对 `/*.md` 强制 `Content-Type`、对 fingerprinted 资产设 `Cache-Control: public, max-age=31556952, immutable`([Pages Headers](https://developers.cloudflare.com/pages/configuration/headers/))。
- 平台默认头包含 `X-Content-Type-Options: nosniff`、`Referrer-Policy`、`Etag`;可缓存资产默认 `Cache-Control: public, max-age=0, must-revalidate`;预览 URL 上**自动**附加 `X-Robots-Tag: noindex`([Pages Serving](https://developers.cloudflare.com/pages/configuration/serving-pages/))。
- 分发:`Access-Control-Allow-Origin: *`、Brotli/Gzip、`304` 协商、Tiered Cache、每周 TTL([同上](https://developers.cloudflare.com/pages/configuration/serving-pages/))。

### 2.3 预览部署

- 每次**开 PR** 生成 `<hash>.<project>.pages.dev`,分支别名 `<branch>.<project>.pages.dev`;预览数量不限;**「This is only true when pull requests originate from the repository itself」**——fork PR 不给预览([Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/))。
- 默认公开、可一键启用 Cloudflare Access 把预览锁到账号内(**不影响生产域**);预览部署默认带 `X-Robots-Tag: noindex`(该页亦给出 `curl -I` 自验法)。

### 2.4 构建与 CI

- 免费档:**500 builds/月、1 并发、20 分钟超时**;单站点 ≤20,000 文件、单文件 ≤25 MiB、100 个自定义域([Pages Limits](https://developers.cloudflare.com/pages/platform/limits/))。
- 构建镜像 **v3** 默认 **Node 22.16.0**、pnpm 10.11.1;钉版本用环境变量 `NODE_VERSION` / `PNPM_VERSION` 或 `.nvmrc` / `.node-version` 文件;**v3 明确不支持**从 `package.json` 的 `engines` 或 lockfile 推断 Node/pnpm 版本([Build image](https://developers.cloudflare.com/pages/configuration/build-image/))——`packageManager` 字段在此不生效,须写 `.nvmrc`。
- 构建缓存**需在 dashboard 手动开启**;Astro 的缓存目录 `node_modules/.astro` 在自动缓存清单内;缓存 7 天未读即清、项目配额 10 GB([Build caching](https://developers.cloudflare.com/pages/configuration/build-caching/))。
- 系统注入 `CI=true`、`CF_PAGES*` 等变量;monorepo 用「root directory」表达([Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/))。
- GitHub Actions 直传:`cloudflare/wrangler-action` + `CLOUDFLARE_API_TOKEN`(权限 `Account → Cloudflare Pages → Edit`)+ `CLOUDFLARE_ACCOUNT_ID`,先 `wrangler pages project create`,再 `wrangler pages deploy <dir> --project-name=<name>`([Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)、[CI 指南](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/))。
- 回滚:Rollbacks(「instantly revert your project to a previous production deployment」,[Pages overview](https://developers.cloudflare.com/pages/))。

### 2.5 自定义域

- **apex 域要求该域是 Cloudflare zone**(balsa.dev 已是);子域可外挂 DNS,加一条 `CNAME → <project>.pages.dev` 即可;CF zone 内的记录由平台自动创建;CAA 记录可能阻断证书签发([Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/))。
- **apex ↔ 子域互跳不在 `_redirects` 能力内**(文件不支持域名级重定向),需 zone 级规则:Single Redirects 免费档 **10 条**(通配支持、正则不支持),Bulk Redirects 免费档 **15 条规则 / 5 张表 / 10,000 条 URL**([URL forwarding](https://developers.cloudflare.com/rules/url-forwarding/))。

## 3. Cloudflare Workers 静态资源

与 Pages 同源能力,差异如下(其余同 §2):

- **`_redirects` / `_headers` 语法、状态码集合、2,100 条上限完全一致**([Workers Redirects](https://developers.cloudflare.com/workers/static-assets/redirects/)、[Workers Headers](https://developers.cloudflare.com/workers/static-assets/headers/))。
- **尾斜杠/规范 URL 有文档化矩阵**:`assets.html_handling` 取值 `auto-trailing-slash`(默认,`/folder` → **307** `/folder/`, `/file.html` → 307 `/file`)、`force-trailing-slash`、`drop-trailing-slash`、`none`([HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/))。**这是五家里唯一把 canonical 形态写成可配置项并有响应码矩阵的**(注意状态码是 307,不是 301)。
- **自定义 404 必须显式配**:`assets.not_found_handling: "404-page"`(取最近 `404.html` 返回 404);Pages 会靠 `404.html`/`index.html` 自动探测,Workers 明确不做猜测([SSG & 404](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)、[Migrate from Pages](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/))。
- 计费:**请求静态资源免费且不限量**;只有 Worker 脚本被调用才计费;`run_worker_first` 命中的请求在免费档超额后会直接 **429 而不是回落静态资源**([Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/))——本站不需要 Worker 脚本,该风险不触发。
- 构建:**Workers Builds 免费档 3,000 构建分钟/月**、1 并发、20 分钟超时、2 vCPU/8 GB/20 GB 盘;Git 集成会为分支生成 **Preview**,URL 作为 PR 评论发出([Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)、[Limits & pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/))。
- 自定义域:**精确主机名匹配**:`example.com` 不会接 `www.example.com`,互跳需**自己配重定向规则**(并需一条 proxied 占位 A 记录);证书自动签发([Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/))。
- 官方路线信号:**Astro 官方 Cloudflare 部署指南现在只写 Workers**(`npx wrangler deploy`,静态站只需 `assets.directory`,[Astro → Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/));Pages → Workers 有一等迁移指南且**配置文件小改**(`pages_build_output_dir` → `assets.directory`);Pages 文档仍现行、无弃用声明(被弃用的是另一个产品 Workers Sites)。

## 4. Vercel

### 4.1 重定向

- 配置重定向写在 `vercel.json` 的 `redirects[]`(或框架配置),**部署期求值、在 CDN 边缘生效**;`permanent: true` → **308**(官方文档里的验收示例就写「expect 308」),`permanent` 关掉 → 307([Configuration Redirects](https://vercel.com/docs/routing/redirects/configuration-redirects)、[Redirects](https://vercel.com/docs/redirects))。**文档未给出配置重定向取 301 的写法**(301 只出现在批量重定向的 `statusCode` 字段里,[Bulk redirects](https://vercel.com/docs/routing/redirects/bulk-redirects))→ 见 §8。
- **配置重定向上限 2,048 条**(`source`/`destination` 各 ≤4,096 字符,[Configuration Redirects](https://vercel.com/docs/routing/redirects/configuration-redirects));**批量重定向上限 100 万条,但仅 Pro/Enterprise,Hobby 不可用**(Pro 含 1,000 条,[Bulk redirects](https://vercel.com/docs/routing/redirects/bulk-redirects))。
- 结构能力:通配、正则(legacy `routes`,PCRE)、`has`/`missing` 条件匹配、hostname 级重定向(域级 `www` ↔ apex 可在 dashboard 配);CDN 会先把连续斜杠 `//` 用 **308** 归一;路径**大小写敏感**([Redirects](https://vercel.com/docs/redirects))。

### 4.2 预览 / 构建 / 限额

- 非生产分支与 PR 自动生成预览部署;预览与**过期生产部署**都自动带 `x-robots-tag: noindex`([Environments](https://vercel.com/docs/deployments/environments)、[Response headers](https://vercel.com/docs/headers/response-headers))。
- 部署保护:Hobby **不含**密码保护(Pro $20/月/项目);Vercel Authentication 可用于预览与生产([Deployment Protection](https://vercel.com/docs/deployment-protection))。
- 构建:**Hobby 1 并发部署**(排队串行),固定 Basic 机器 2 vCPU / 8 GB / 32 GB;依赖构建缓存**默认开启**([Managing Builds](https://vercel.com/docs/builds/managing-builds));**100 部署/日**、200 项目([Hobby plan](https://vercel.com/docs/plans/hobby))。
- Node:**默认 24.x**,可选 22.x / 20.x;`package.json` 的 `engines.node` 可覆盖项目设置(`22.x` / `^22.0.0` / `>=20.0.0` 均可表达,但**只能指定 major**,minor/patch 由平台滚动)([Supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions))。pnpm 版本由 `packageManager` 生效(平台按框架自动识别,未逐条核)。
- 免费档用量:**Fast Data Transfer 100 GB/月**、Fast Origin Transfer 10 GB、**CDN 请求 100 万/月**、Web Analytics 5 万事件/月;超额「等 30 天」([Hobby plan](https://vercel.com/docs/plans/hobby)、[Limits](https://vercel.com/docs/limits))。
- **商用条款(Hobby)**:「Hobby teams are restricted to non-commercial personal use only. All commercial usage of the platform requires either a Pro or Enterprise plan.」定义含「Receiving payment to create, update, or host the site」「Advertising the sale of a product or service」;接受捐赠不算商用([Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines))。
- 尾斜杠:`trailingSlash: true/false` → **308** 规整;`undefined` → `/about` 与 `/about/` **都返回 200**(官方明说不推荐,会双页索引)([vercel.json](https://vercel.com/docs/project-configuration/vercel-json))。
- 自定义头:`headers[]` 可按 source/`has`/`missing` 设响应头(含 `Cache-Control`);`cleanUrls` 去 `.html`([vercel.json](https://vercel.com/docs/project-configuration/vercel-json))。
- 自定义域:apex + 子域都支持,平台签证书;Hobby 50 域/项目([Hobby plan](https://vercel.com/docs/plans/hobby))。Astro 侧:静态站无需 adapter([Astro → Vercel](https://docs.astro.build/en/guides/deploy/vercel/))。

## 5. Netlify

### 5.1 重定向

- `_redirects`(放 publish 目录)或 `netlify.toml` 的 `[[redirects]]`;**状态码默认 301**;302 可用,**307 明确不支持**(官方要你改用 302);`force`/`!` 用于覆盖同名文件([Redirect options](https://docs.netlify.com/manage/routing/redirects/redirect-options/))。
- 匹配:splat(`/news/*` → `/blog/:splat`,**只能出现在路径段末尾**,不支持 `/jobs/*.html`)、占位符、query 参数匹配、国家/语言/cookie 条件;**不支持**「从 splat 中排除某路径」(靠规则排序解决)([同上](https://docs.netlify.com/manage/routing/redirects/redirect-options/))。
- **阴影(shadowing)语义与 CF 相反**:默认同名文件**优先于**重定向规则,要覆盖必须 `force`;规则按 `_redirects` → `netlify.toml` 顺序取**第一条匹配**([Redirects overview](https://docs.netlify.com/manage/routing/redirects/overview/))。
- 条数:无硬数字,官方口径是「≥10,000 条建议尽量用通配/占位符」,且序列化产物过大**会让部署失败**([同上](https://docs.netlify.com/manage/routing/redirects/overview/))。
- 尾斜杠:**规则不能增删尾斜杠**(会撞归一化并可能成环);平台侧 **Pretty URLs**(默认开)把 `/about` **转发**到 `/about/`、`/about.html` 重写为 `/about`([Redirect options](https://docs.netlify.com/manage/routing/redirects/redirect-options/)、[Post-processing](https://docs.netlify.com/build/post-processing/overview/))。
- 404:`404.html` 自动生效,也可用 `404` 状态码规则做路径级自定义([Redirect options](https://docs.netlify.com/manage/routing/redirects/redirect-options/))。

### 5.2 预览 / 构建 / 计费(2026 现状:已改为 credits 制)

- PR 自动生成 **Deploy Preview**,URL 形如 `deploy-preview-42--<site>.netlify.app`;默认公开,可加密码/团队登录保护;**平台自动给预览、未发布的生产部署、旧分支部署加 `X-Robots-Tag: noindex`**([Deploy overview](https://docs.netlify.com/deploy/deploy-overview/))。
- 免费档计费:**300 credits/月,硬上限、无自动续购**;**生产部署 15 credits/次**;**带宽 20 credits/GB**;**Web 请求 2 credits/10k**;计算 10 credits/GB-hour;**Deploy Preview 与分支部署 0 credits**;1 并发构建;500 项目;自定义域 + SSL 含在免费档([Pricing](https://www.netlify.com/pricing/)、[How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)、[Credit-based plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/))。
- **超额行为:credit 用尽 → 该项目(乃至账号下所有 web 项目)被暂停,访问者看到 `Site not available`**([How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/))。换算:300 credits 全给带宽 ≈ 15 GB/月。
- 商用:**Free 档允许商用**——官方公告原文「On the Free plan, you can deploy commercial projects, personal sites, or other creative explorations」([Netlify blog](https://www.netlify.com/blog/introducing-netlify-free-plan/))。
- **Open Source 计划**(与本站高度相关):**10,000 credits/月**、生产部署免费、每 PR 一份 Deploy Preview、无限成员、**credits 用尽站点仍在线**;要求 OSI 许可(本站 Apache-2.0 ✓)、仓库需 Code of Conduct、站点需回链 Netlify,且**限非商用**;官方点名 docs 站是合适类型([Netlify Open Source](https://www.netlify.com/open-source/))。
- 构建环境:Node 版本用 `.nvmrc` 或 `NODE_VERSION`(Astro 指南点名 ≥22.12.0),pnpm 走 `packageManager`([Astro → Netlify](https://docs.astro.build/en/guides/deploy/netlify/));私有仓库的部署受 Deploy Request Policy 限制(仅识别作者触发),公开仓库无此门槛([Deploy overview](https://docs.netlify.com/deploy/deploy-overview/))。
- 自定义头:`_headers` 支持,通配/占位符语法与 `_redirects` **不同**([Custom headers](https://docs.netlify.com/manage/routing/headers/))。

## 6. GitHub Pages

- **没有路径级重定向能力**:平台只提供 `jekyll-redirect-from`(GH Pages 依赖清单里版本 0.16.0,[pages.github.com/versions.json](https://pages.github.com/versions.json)),而该插件的机制是「Redirects are performed by serving an HTML file with an HTTP-REFRESH meta tag」——**生成 meta-refresh 静态页**([jekyll-redirect-from README](https://github.com/jekyll/jekyll-redirect-from))。唯一自动重定向是**域级**:同时配好 apex 与 `www`(或其他子域)DNS 记录后,GitHub Pages 会自动在两者之间重定向([About custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages))。
- 限额:站点 ≤1 GB、部署 **10 分钟超时**、**100 GB/月 soft 带宽**、**10 次构建/小时 soft 限制(用自定义 Actions 工作流构建时该限制不适用)**;可能触发 429 限流([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits))。
- 条款:「GitHub Pages is not intended for or allowed to be used as a free web-hosting service to run your online business, e-commerce site, or any other website that is primarily directed at either facilitating commercial transactions or providing commercial software as a service (SaaS).」([同上](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits))。另:**访问者 IP 会被记录留存**用于安全([What is GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages))。
- 无预览部署;无自定义响应头能力(`_headers` 不存在);项目站默认发布在 `/<repo>/` 前缀下,官方 Astro 指南要求配 `base: '/my-repo'`(换自定义域后要**去掉 base**)([Astro → GitHub Pages](https://docs.astro.build/en/guides/deploy/github/))——这与本站「`base` 保持空 + `/docs` 由嵌套目录表达」的既有裁决**摩擦点明确**(见 [#8 §3](../spec/stack.md))。
- 部署路径:`withastro/action@v6`(默认 node-version **24**,package-manager 自动识别)+ `actions/deploy-pages@v5`([同上](https://docs.astro.build/en/guides/deploy/github/))。
- 回滚:平台无回滚;靠 revert + 重部署。

## 7. 平台差异点(横切)

1. **永久重定向的状态码不统一**:CF = 301 可显式;Netlify = 301 默认;Vercel = 308(官方推荐 307/308);GH Pages = meta-refresh。对 `GET` 文档站,301/308 的搜索引擎语义等价,但「真 301」这一措辞在 Vercel 上落不了地。
2. **重定向与静态文件的优先级相反**:CF 「redirects always followed」(重定向赢),Netlify 默认同名文件赢(需 `force`)——台账生成器必须按平台语义产文件。
3. **尾斜杠是五家里唯一「可控性差异巨大」的轴**:Workers(文档化 307 矩阵)> Vercel(`trailingSlash`,308,不设会双 200)≈ Netlify(Pretty URLs 转发,规则不能碰)> CF Pages(仅 `.html` → 无扩展名的归一被文档记录)> GH Pages(未文档化)。
4. **免费档的流量量级差 1~2 个数量级**:CF 静态资源请求**免费不限量**;Vercel 100 GB + 100 万请求;Netlify 300 credits ≈ 15 GB 带宽(**用尽即停站**);GH Pages 100 GB soft(超限可能被建议迁走)。
5. **商用条款**:Vercel Hobby 明文禁商用;Netlify Free 明文可商用;GH Pages 禁止「以商业交易/SaaS 为主」的站点;CF 无此类限制。
6. **`.md` twin(#11 消费)**:三家平台可用 `_headers`/`headers` 强制 `Content-Type: text/markdown`(CF 与 Netlify 明确支持头部覆盖,Vercel 有 `headers` 能力);**GH Pages 完全不能设头**,`.md` 的 MIME 只能听天由命。
7. **`/llms.txt` 留站根**:五家都只是「根目录一个静态文件」,没有平台障碍;唯一的破坏源是 Astro `base`(已裁不用),以及 GH Pages 项目站的路径前缀形态。

## 8. 未验证(一手依据不足或需部署实测)

1. **Cloudflare Pages 对 `/docs/foo`(无尾斜杠、命中 `foo/index.html`)的响应码**:Pages 文档只写了 `.html` → 无扩展名的归一,目录索引的尾斜杠行为**未文档化**;Workers 侧有矩阵,Pages 侧需上线实测。
2. **Cloudflare Workers Builds 的 Node/pnpm 钉法**:页面只给配额,未写 `NODE_VERSION`/`.nvmrc`/`packageManager` 在 Workers Builds 里的生效规则。
3. **Vercel 配置重定向能否显式 301**:`vercel.json` 文档只给 `permanent`(→308);301 仅见于批量重定向的 `statusCode` 字段(而批量重定向 Hobby 不可用)。
4. **Vercel 静态 404 页行为**与 **Vercel Web Analytics 的 cookie/隐私口径**(本文只核到额度,未核隐私声明)。
5. **各平台 `.md` 与无扩展名端点的默认 `Content-Type`**:均无文档明文,只能靠 `_headers`/`headers` 覆盖(见 §7.6),默认值需部署实测。
6. **`_redirects` 在预览部署上是否生效**:机制上随产物部署(每个部署带自己的 `_redirects`),但 CF/Vercel/Netlify 文档均未点名预览环境,未实测。
7. **Netlify Free 商用条款的一手正文**:可商用来自官方 blog 与定价页口径,ToS/自助订阅协议原文未逐条核。
8. **Cloudflare Pages 免费档 500 builds/月用尽后的行为**(暂停?排队到下月?)未查。
9. **GitHub Pages 的尾斜杠与 404 行为**(静态目录索引如何响应无尾斜杠请求)未文档化。
10. **Netlify CLI / Vercel CLI 从 Actions 直传的完整凭据与预建项目要求**(CF 侧已核到 `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` + 预建项目;另两家只核到 CLI 存在)。
11. **balsa.dev 当前是否已有站点/记录**:本机 DNS 被沙箱改写,只能确认 **NS = Cloudflare**,A/CNAME 真值未知。

## 9. 给 #10 的输入清单(事实,不含裁决)

**硬约束(选型必须满足)**

1. `/` → `/docs` + 页级台账要求**真永久重定向**:CF Pages / CF Workers / Vercel / Netlify 可满足(**Vercel 为 308 语义**);**GitHub Pages 结构性不满足**(只有 meta-refresh),且它同时缺预览、缺自定义头、禁用商用灰区、`base` 要求与本站 URL 裁决摩擦。
2. 台账 → 平台重定向文件的**生成器是唯一需要自写的小工具**:三家语法/语义各异(CF 「重定向优先 + 2100 条上限」、Netlify 「文件优先、需 `force`」、Vercel 「2048 条 + 308」),这一条与 [#8 §6](../spec/stack.md) 的台账口径直接接续。

**平台差异点(供权衡)**

3. **balsa.dev 已在 Cloudflare NS 下** → CF 路线的域接入是零 DNS 迁移成本(apex 直接挂 CF zone);其他平台要么新增账号并托管 DNS,要么保持 CF DNS 外层指过去。
4. CF 内部还有 **Pages vs Workers 静态资源**之分:`_redirects`/`_headers` 能力等价;差异在 **构建配额(500 次/月 vs 3,000 分钟/月)**、**尾斜杠控制(Workers 有文档化矩阵)**、**404 探测(Workers 要显式配)**、**官方路线(Astro 指南与迁移指南都指向 Workers)**。
5. **免费档流量口径**:CF 静态资源不限量;若选 Vercel/Netlify,要把「文档站可能被 LLM 爬虫高频抓取」纳入容量评估(Netlify Free 300 credits 用尽即整站停,Netlify OSS 计划 10,000 credits 且用尽不停站,但限非商用)。
6. **商用条款**:Vercel Hobby 非商用限定 vs Netlify Free 可商用 vs GH Pages 的 SaaS 灰区 vs CF 无限制——若 balsa 未来有商业面(付费支持/托管版),这是**会反过来逼迁移**的条款。
7. **预览**:三家预览均默认 noindex;CF Pages 只对同仓库 PR 给预览(fork PR 无预览);保护能力 CF(Access)与 Netlify(密码)免费档可用,Vercel 密码保护属 Pro。
8. **Node ≥22.12 钉法**:CF Pages 默认 22.16.0 但**不读 `package.json` `engines`**(须 `.nvmrc`/`NODE_VERSION`);Vercel 支持 `engines.node` 但只能钉 major;Netlify 用 `.nvmrc`/`NODE_VERSION`;GH Pages 走 `withastro/action`(默认 24,可覆盖)。
9. **无 SaaS 取向**:搜索已由 Pagefind 归零 SaaS;分析若要,CF Web Analytics 免费、无个人数据、与 CF 路线同账号;Vercel/Netlify 自带分析有免费额度但属平台 SaaS(免费档留存仅当日,横向矩阵)。
10. **退出成本**:三家平台的重定向/头部配置文件互不兼容(`_redirects` ↔ `vercel.json` ↔ `netlify.toml`),内容与 URL 形态仍是仓库资产;CF Pages ⇄ Workers 之间迁移是**同一语法 + 配置小改**,这是当前事实下最小的迁移半径。
