# 交付与部署规范

> **状态**：已裁决 v1.0，由 [决策:交付与部署](https://github.com/0xnicholas/balsa-docs/issues/10) 产出（2026-09-30 grilling 定案，两轮共 10 问全按推荐落定）。本票认领了 #7 §8 与 #8 §12 交接过来的三行改写（`/` 重定向、台账落地、changelog URL）。
> **上游**：[技术栈](./stack.md)（§3.2 `base` 保持空 / §6 台账与关卡 / §10 静态托管要求 / §12 改写清单）、[IA 与多项目缝](./ia.md)（§2 URL 形态 / §3 版本化与重定向立场）、[内容边界](./content-boundary.md)（§4 无 SaaS / §5 营销站接缝 / G1、G3、G5）、[API 参考面](./api-reference.md)（§4 入库 + 再生成 / §6 红黄口径 / §13 待实测）、平台事实表 `docs/research/hosting-facts.md` @ `research/hosting-facts`（commit `db1d78e`，2026-09-30 抓取各平台官方文档；含域归属更正）。
> **消费**：[决策:agent 面向约定](https://github.com/0xnicholas/balsa-docs/issues/11)（`.md` 的 Content-Type、Accept 协商与 MCP 端点）、[决策:品牌与视觉](https://github.com/0xnicholas/balsa-docs/issues/12)（无耦合）、[收尾](https://github.com/0xnicholas/balsa-docs/issues/13)（建站 checklist 与域/发布切换项）、建站 effort。
> **不重开**（地图口径）：栈选型（Astro 7 + Starlight）、URL 命名资产与 `/llms.txt` 站根约定、台账机制的存在（本票只兑现落地形态）、英文优先、内容真相源留本仓库。

## 1. 裁决总表

| # | 面 | 裁决 |
| --- | --- | --- |
| 1 | 托管平台 | **Cloudflare Workers 静态资源**（`assets.directory`，无 Worker 脚本）；CF Pages 为等价备胎（`_redirects`/`_headers` 语法与上限完全一致） |
| 2 | 域名形态 | **`docs.<apex>` 子域**为主形态；`<apex>/docs` 记为备选（§3.2）；域名**名字**归 balsa-website 的域名调研票，本票只要求 DNS 控制权 |
| 3 | 构建形态 | **平台原生 Git 构建**（PR 预览 + `main` 生产）；Node 钉 `.nvmrc`，pnpm 由 `packageManager` 钉（CF 构建镜像不读 `engines`） |
| 4 | 再生成耦合 | **平台构建不得依赖 balsa-framework**：TypeDoc 再生成 + `git diff` 门只在 CI 跑（插件 env 开关 `BALSA_TYPEDOC_REGEN`） |
| 5 | 重定向落地 | `redirects.json` 台账 = 唯一真相源 → 构建期生成 `dist/_redirects`；**`/` → `/docs` 也是台账的一条** |
| 6 | 永久语义 | **301 与 308 等价**（CF 可显式写 301）；红线 = 不得退化为 meta-refresh / 客户端跳转 |
| 7 | canonical 形态 | **带尾斜杠**（`/docs/<family>/<slug>/`），平台以 `html_handling: auto-trailing-slash` 做 307 归一；`.md` twin 无尾斜杠（沿 #8 §3.4） |
| 8 | 预览 | 每 PR 公开预览；平台自动 `X-Robots-Tag: noindex`；预览不进 sitemap/canonical |
| 9 | CI 归属 | 全部关卡 = **仓库内脚本 + GitHub Actions**；平台构建不承担校验职责 |
| 10 | 遥测 | **首发零遥测**；日后准入条件 = 无 cookie / 无个人标识 / 兼容免 SaaS 取向，另立票 |
| 11 | changelog（G5） | P2 预留 + **手写摘要 + 钉 ref**；不建自动生成管线 |
| 12 | npm 发布切换（G1） | **显式 PR**（0.1.0 发布时触发），进 #13 checklist；禁自动同步上游文案 |
| 13 | 域未定期的 canonical | 允许临时平台域；一次性切换 PR（`site`/canonical/sitemap 同步）；**临时域不承诺 URL 稳定** |
| 14 | 部署策略 | push `main` 自动生产；回滚 = 平台版本回滚；**部署原子**（失败不留半新半旧） |
| 15 | 决策记录 | 不另立 ADR；平台否决理由在本文 §9（退出成本低、理由可由事实表复核） |

## 2. 托管平台

### 2.1 配置形态

`dist/` 即静态资产目录；部署配置（`wrangler.jsonc`，键名与取值已一手核对）：

```jsonc
{
  "name": "balsa-docs",
  "compatibility_date": "2026-09-30",
  "assets": {
    "directory": "./dist/",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

- **无 Worker 脚本**（`assets` 即够）——「零运行时依赖」与「无 SaaS 运行时」取向不动；只有 Worker 脚本被调用才计费，纯静态资产请求免费且不限量。
- `_headers` 放 `public/`（随构建进 `dist/` 根）；**`_redirects` 不是仓库里的手写文件**——它由台账在构建尾生成进 `dist/`（§4.1 / §4.2.4），`public/_redirects` 一存在就是红的。两文件本身不作为资产服务。
- 自定义 404 = 产物根的 `404.html` + `not_found_handling: "404-page"`（Workers 不做自动探测，必须显式配）。
- `html_handling` 默认即 `auto-trailing-slash`（写成显式值，防默认变化）。

**落地形态（#27）**：`.nvmrc`（`22.12.0`）、`wrangler.jsonc`（上面的块，逐键逐值一致：含 `name` 与 `compatibility_date`）、`public/_headers`（五条，见下）三件已入库，并以 `scripts/check-platform.mjs` 进 `pnpm verify`——对构建产物验收 `wrangler.jsonc` 的取值、`_headers` 的五条与平台上限（≤100 条 / 单行 ≤2,000 字符）、`dist/_headers` 与源逐字节一致、Pagefind 索引覆盖本版页面集合、且每个渲染页都挂载搜索 UI（纯规则在 `src/lib/platform.ts`，每条红路径有单测）。`_headers` 五条 = `.md` 的 `text/markdown; charset=utf-8`、`/llms.txt` 的 `text/plain; charset=utf-8`、`/_astro/*` 的 immutable、站级 `Link` + `X-Llms-Txt`（取值出处见 [agent-surface](./agent-surface.md) §5.1 / §5.3）。**平台侧动作（首次部署、预览、回滚、线上 `curl -I`）不在 #27**——执行手册与台账见 §13 与 [#40](https://github.com/0xnicholas/balsa-docs/issues/40)；该票已跑一轮（2026-10-01，实测值见 §10 的逐条与 §13 末尾的执行记录），**只剩「平台构建」一侧**（Workers Builds 的 Git 集成）待人操作，另一条（自定义域证书）**apex 已由 #29 定为 `balsats.com` 且仓库侧已切**，欠 DNS 与证书（§10.6）。

**「平台构建路径不依赖 balsa-framework checkout」已在本机实测（#27）**：把 `.framework/` 整目录移开后 `pnpm build` 仍成功、`pnpm verify` 整条链全绿（54 项 ✓）——侧栏与生成树走入库的 `api-sidebar.json` 快照与 238 页树（api-reference §4）。CI 的 repo-gates job 从不 checkout 框架，因此它每次跑的就是这条路径；「平台（Workers Builds）里的构建成功」仍属 §10 / #40。

### 2.2 选它的理由（权重序）

1. **免费档请求不限量**：静态资源不按请求计费——把「文档站会被 LLM 爬虫高频抓取」这条风险整个消掉（对比：Vercel Hobby 100 GB + 100 万 CDN 请求；Netlify Free 300 credits ≈ 15 GB 且用尽整站停）。
2. **`_redirects` 可显式 301**，且语义是「重定向恒优先于同名文件、取第一条匹配」——台账行为可预测（Netlify 相反：同名文件优先，要 `force` 才盖得住，台账生成器得多一层平台耦合）。
3. **规范 URL 可控**：五家候选里唯一把尾斜杠/HTML 归一写成有响应码矩阵的配置项（`html_handling`）。
4. **`_headers` 通道**（≤100 条规则，单行 ≤2,000 字符，`!` 前缀可删默认头）：`.md` 的 Content-Type（#11 消费）与指纹资产的 immutable 缓存都有落点。
5. **预览与回滚**：PR 预览自动 noindex、URL 随 PR 评论给出；Worker Versions 一键回滚。
6. **无商用条款雷**（Vercel Hobby 明文禁商用；GH Pages 有「以商业交易/SaaS 为主」的灰区）。
7. **与官方路线一致**：Astro 官方 Cloudflare 部署指南已只写 Workers；Pages ⇄ Workers 迁移是同语法 + 配置小改，迁移半径最小。
8. **给未来动态缝留门**：#11 若需要 Accept 内容协商或 MCP 端点，可在同一部署上加 Worker 脚本（`run_worker_first`），不换托管。

### 2.3 平台侧关键事实（一手核对）

- `_redirects`：`[source] [destination] [code?]`，默认 302，301/302/303/307/308 全支持；**上限 2,000 静态 + 100 动态 = 2,100 条**，单条 ≤1,000 字符；**顺序敏感、取第一条匹配**；支持 splat 与 `:placeholder`；不支持 query 匹配、域名级重定向、正则。
- `_headers`：规则 ≤100 条；splat/占位符同 `_redirects`；**redirects 先于 headers 执行**；一条请求命中多条规则时**叠加**其所有头，**同名头被设两次时值以逗号拼接**（不是后者覆盖前者）——所以「同一头名不得落在两个能命中同一请求的模式上」是仓库侧纪律（`src/lib/platform.ts` 的 `patternsMayOverlap` 把关；#27 实测复现：`/docs/*` 与 `/docs/get*` 会命中同一请求）。
- `html_handling: auto-trailing-slash`：`/folder` → **307** `/folder/`；`/file.html` → 307 `/file`；目录索引以带尾斜杠形态服务；该配置**只作用于 HTML 内容**（`.md` 等扩展名端点不受影响）。
- 平台默认头：`Content-Type`（wrangler 按扩展名判定）、`Cache-Control: public, max-age=0, must-revalidate`、`ETag`——均可被 `_headers` 覆盖 / 删除 / 追加。
- 自定义域为**精确主机名**匹配（apex 不自动覆盖子域）；证书自动签发；域级互跳不属 `_redirects` 能力（需 CF zone 级转发规则）。

**实测（#40，2026-10-01，跑在部署产物上）**——上面各条的线上确认，外加三条此前没有的事实：

- **默认 `Content-Type`（文档只写「按扩展名判定」，未给值）**：`.md` → `text/markdown`（**无 charset**）；`.txt` → `text/plain; charset=utf-8`；无扩展名的干净 URL（`/docs/`）→ `text/html`；对照 `.json` → `application/json`。测法 = 把两条 `Content-Type` 规则从产物撤下一次再测（§13.2 第 9 行的可选诊断）。逐值见 §10.2。
- **HTML 默认缓存已确认**：`cache-control: public, max-age=0, must-revalidate`；指纹资产按 `_headers` 返回 immutable（§2.4 的取向即这两条实测）。
- **`/robots.txt` 是平台特殊路径**：产物里没有该文件时，平台托管一份 **Content Signals 政策文本**（纯注释、**无** `User-agent` / `Disallow` 指令，1,248 字节；`content-type: text/plain` 无 charset，`cf-cache-status: HIT`）。**仓库资产能覆盖它**（临时放一个 `public/robots.txt` 即以产物内容为准，实测过；删掉又回到托管文本）。**#29 起站点自持这份文件**：`dist/robots.txt` 由构建尾从 `src/lib/site.ts` 渲染（allow-all + `Sitemap:` 行，`scripts/gen-robots.mjs`），所以线上回的将是产物内容；**代价要说清**：平台的 Content Signals 政策文本从此不再随响应发出（若需要 AI 抓取政策，得自己写进这份文件）。响应仍走平台托管管道，不是普通静态资产管道（主机名级行为未重测）。
- **预览的 noindex 是平台加的**：生产响应**不带** `x-robots-tag`，预览 URL 带 `noindex`——§6 的裁决在线上成立（§10.3）。
- **主机名证书**：账号 workers.dev 域下的主机名在首次部署后自动拿到 Let's Encrypt 证书（`CN=balsa-docs.workers.dev`，SAN `*.balsa-docs.workers.dev` + `balsa-docs.workers.dev`）——生产主机名与版本预览主机名（`<版本前缀>-balsa-docs.balsa-docs.workers.dev`）同在覆盖内。
- **首发的 TLS 短时窗口（观察，未定论）**：新主机名部署上去后的几分钟内，该主机名的 TLS 握手会被拒（`SSL alert 40`），**同一 IP 换 SNI 却可正常握手**；约 4 分钟后自愈。最可能是平台侧按主机名注册 / 签发的短时延迟，但本轮无法与本地网络对 SNI 的过滤行为完全区分——记在这里是为了下次首部署时**先等一会儿再判定「站点挂了」**。

### 2.4 构建与运维约束

- **Node 钉法**：仓库根 `.nvmrc`（`22.12.0`）+ 平台环境变量 `NODE_VERSION` 兜底；**不依赖** `package.json` 的 `engines`（CF 构建镜像不读它）。pnpm 版本由 `packageManager` 字段钉。Workers Builds 侧的生效规则列入 §10 待实测。**落地形态（#27）**：`.nvmrc` 已入库，Actions 三个 job 改读 `node-version-file: .nvmrc`——CI 与平台构建镜像的 Node 从此是同一处；`scripts/check-platform.mjs` 把关「pin 就是本节固定的 `22.12.0`」（不拿 `package.json` 的 `engines` 当第二真相源：本节已说明平台不读它，那条约束只会把「Node 升级」变成两个地方改）。平台侧是否真按 `.nvmrc` 生效仍待实测（§10.1 / #40）。
- **缓存**：`_headers` 对指纹资产（`/_astro/*`）设 `Cache-Control: public, max-age=31556952, immutable`；HTML 保持平台默认（`must-revalidate` + ETag），保证改内容即刻生效。**#40 线上确认**：两条都按此返回（§2.3 / §10.2）。
- **部署**：push `main` → 生产部署；PR / 分支 → 预览；回滚 = Worker Versions；部署原子（整份产物快照切换）。
- **免费档边界**（对本站非约束，记账）：Workers Builds 3,000 分钟/月、1 并发、20 分钟超时；静态资产请求不限量。

## 3. 域名形态与营销站协调

### 3.1 形态裁决

- **主形态 = `docs.<apex>` 子域**：docs 独立部署、独立 TLS、独立预览与重定向；与营销站的托管栈互不绑定。
- 路径层已解耦（ia.md §2）：无论域名如何，`/docs/<family>/<slug>` 与站根 `/llms.txt`、`<route>.md` 形态不变。
- **域名名字不由本票裁**：由 Owner 拍板（#44 的改判见下）；本规范只要求交付两样东西：一个 `<apex>` + 一条 `<apex>` 内 `docs` 子域记录的控制权。
- **环境事实（防误设）**：`balsa.dev` 不属于本 effort——apex 现为第三方个人站，`docs.balsa.dev` 落在其 Cloudflare zone 内（520）。域名选型不得以 `balsa.dev` 为默认前提。
- **apex 已定：`balsats.com`（#44 改判，2026-10-02；落地形态沿用 #29）**——站点 origin = **`https://docs.balsats.com`**，仍写在 `src/lib/site.ts` 一处（canonical / sitemap / 两个 agent 面文件 / `robots.txt` 都从它派生）。**这次改判换的只是常量值与跟着它的表述，#29 的机制一字未动**（`docs.<apex>` 形态、一处派生五面、`og:image` 取绝对、三条产物关卡）。**依据 = Owner 裁决**：单一 apex——营销站 `https://balsats.com`、文档站 `https://docs.balsats.com`；账与证据记在 [域名票](https://github.com/0xnicholas/balsa-website/issues/9) 报告追加的 **§9**（balsa-website 的 `docs/research/domain-and-handles.md` @ 分支 `research/domain-and-handles`——本仓库不存这份报告）与营销站地图的决策条目。该裁决**覆盖报告原推荐序**（`balsajs.dev` ＞ `getbalsa.dev` ＞ `balsa.run`，即 #29 当时取的那个；理由归 Owner，附记不替其补），所以 **#29 的 apex 选型作废、落地形态照旧**。本机复核（2026-10-02）：`balsats.com` 在 Verisign RDAP **404**、两个独立递归（`dns.google` / `cloudflare-dns.com`）**NXDOMAIN** → 可注册；同名根 `balsats` 在 GitHub 与 npm org 均空闲、**X 已被无关真人账号占用**（§9.3：社交面的同名根不完整，处置未拍）。
- **仍未做的两件（都归人，§13.4 第 3–4 行；人工台账 = [balsa-website #16](https://github.com/0xnicholas/balsa-website/issues/16)）**：① 注册 `balsats.com`（注册商不限；CAA 记录不得阻断证书签发），zone 放进站点所在的 Cloudflare 账号；② 给 `docs.balsats.com` 一条记录（zone 内自定义域由平台自动建）+ 证书签发。**仓库侧已切到该域**（§3.4 的「落地形态」）：DNS 未通之前，任何手动部署的 canonical 都指向一个还不解析的主机——不要把它当正式上线（§13.5 的警告同样适用）。

### 3.2 备选：`<apex>/docs` 子路径

- 代价：需要 apex 所在那一层做反代 / rewrite（归营销站的托管层），docs 的部署从属其栈。
- 切换动作：营销站加 rewrite + docs 侧一次性 PR（`site` / canonical / sitemap）+ 台账一条（若旧域已公开）。
- 触发条件：营销站决定自持 apex 且要求同域（品牌 / SEO 取向）。**docs 侧不代裁、不阻塞。**

### 3.3 协调清单（交 balsa-website / 营销 effort）

1. **DNS**：提供 `docs.<apex>` 的 CNAME / 或把 `<apex>` 放进 Cloudflare zone 后由平台自动建记录；CAA 记录不得阻断证书签发。
2. **canonical 归属**：`/docs/**` 的 canonical 归 docs；营销站对 docs 只做深链（content-boundary §5 的链接方向不变）。
3. **互链**：营销站 → docs 深页；docs → 营销站仅 Introduction「Why Balsa」一支稳定外链。
4. **若选子路径**：反代在营销站托管层，docs 不改路径资产（§3.2）。
5. **域落地由 docs 侧发起 PR**（`site` / canonical / sitemap），营销站只需配合 DNS。
6. **遥测口径各自裁**（docs = 零遥测，§7）；若将来要跨站统一数据，另立 effort 合并评估。

**落地形态（#29，2026-10-01）**：docs 侧的 PR 已发，第 5 条兑现——`src/lib/site.ts` 的 `site` = `https://docs.balsats.com`，canonical / sitemap / `/llms.txt` 绝对链接 / `/llms-manifest.json` 的 `site` / `robots.txt` 的 `Sitemap:` 行随之落地（验收见 §3.4「落地形态」与 §13.4）。第 2 条的 canonical 归属因此已是既成事实；营销站侧**只剩第 1 条的 DNS 与证书**（第 3 条的互链在 [#10](https://github.com/0xnicholas/balsa-docs/issues/10) 已定，本片未动）。

### 3.4 临时域阶段与正式域切换

- 允许站点跑在平台默认域（`balsa-docs.<account>.workers.dev`）上；**临时域不承诺 URL 稳定**：只有正式域的 URL 进重定向台账。
- 切换 PR 的改动面（一次性）：`site` 值 / canonical / `sitemap` 生成 / robots 与 sitemap 内域 / 台账补条目（若临时域已对外公开过）。
- 禁：把临时域写进对外材料（README 之外的传播面不出现）。
- **实测形态（#40）**：站点跑在 `https://balsa-docs.balsa-docs.workers.dev`（账号的 workers.dev 子域恰好也叫 `balsa-docs`，故主机名里两个 `balsa-docs`）。`site` 未设的三处后果线上确认：页面 canonical **0 处**、`/sitemap-index.xml` **404**、`/llms.txt` 与 `/llms-manifest.json` 的链接是站根相对形态；生产响应**无** `x-robots-tag`。切换 PR 的改动面照本节第 2 条不变；robots.txt 那半边多一条实测前提（§2.3：平台会注入托管 robots.txt，资产可覆盖）。
**落地形态（#29，2026-10-01）**——切换 PR 已发，第 2 条的改动面逐条结清（apex 选型与依据见 §3.1）：

| 改动面 | 落地 |
| --- | --- |
| `site` 值 | `https://docs.balsats.com`，`src/lib/site.ts` 一处（临时域阶段结束） |
| canonical | 每页 `<link rel="canonical">` = origin + 自身路由；`og:url` 同批、`og:image` 从根相对变绝对（`check-brand.mjs` 逐值断言） |
| sitemap 生成 | `dist/sitemap-index.xml` + `sitemap-0.xml`：**257 条 = 本版页面全集、一条不多**，全部落在正式域（`.md` twin / 两个 llms 文件 / `404` / 站根跳板都不进） |
| robots | **自持**：`dist/robots.txt` 由构建尾从 `src/lib/site.ts` 渲染（allow-all + `Sitemap:` 行）——平台托管的那份 Content Signals 文本因此不再生效（§2.3） |
| 台账补条目 | **零条**：临时域从未进对外材料（本节禁令），且台账登记的是**路径**变更，域切换不产生路径变更（§4.1） |
| 临时域收尾 | `workers_dev` 保持开启：临时域继续服务同一份产物（页面 canonical 已归正式域，它不再是被索引的版本），且 `wrangler versions upload` 的版本预览 URL 仍可用（§6 / §13.3） |

**关卡与欠账**：上面前四条由 `scripts/check-origin.mjs` + `src/lib/origin.ts` 在 `pnpm verify` 的 `build` 之后机器验收（逐页 canonical、sitemap 的域与页面集合、robots 逐字节；第 1 条「`site` 值」正是这三条共同的输入，故不单设断言）；第 5 条（台账零条）由 §4.2 的台账关卡陪跑（删页未登记即红），本轮无需为它新加规则。红路径在 `src/lib/gate-scripts.test.ts` 的 `origin surfaces gate`。**仍未验**：DNS 记录、证书签发、正式域上的线上验收（§10.6 / §13.4 第 3–4 行）——仓库侧切完了，域还没通。

## 4. 重定向与 URL 稳定性

### 4.1 台账即真相源

- 仓库内单一数据文件 `redirects.json`（形如 `[{ "from": "/old-page/", "to": "/new-page/", "code": 301, "note": "…" }]`）；**`/` → `/docs` 是其中一条**（ia.md §2 的站根 301 由此兑现）。
  - **落地形态（#18）**：`from` / `to` 一律写 canonical 尾斜杠形态（站根一条落地为 `/` → `/docs/`，省掉平台尾斜杠归一的一跳）；`code` 必填且在值域内；`note` 自由文本、可选；出站的 `to` 要写绝对 URL 并加 `"external": true`（这就是 §4.2.1 的「显式登记」）；未知键即红，防拼写漂移。
- `dist/_redirects` 是**生成物**：构建尾脚本（`scripts/gen-redirects.mjs`）从台账生成；不手改、不设第二处维护。顺序 = 台账顺序（平台取第一条匹配）。`pnpm build` 尾部自动生成；`--check` 模式只重渲染 + 逐字节比对，供 `pnpm verify` 证明幂等（§4.2.4）。`astro.config` 的 `redirects` 由同一台账映射，dev / 无平台预览下行为一致。
- 当 `/docs/reference/api/**` 升格为 `/reference/**`（ia.md §1 逃生门触发），或版本化 `/docs/v<n>/` 落地（未来发布 effort），都走同一台账——机制不变。

### 4.2 CI 关卡（红）

1. **目标可解析**：每条 `to` 落在本版页面集合内，或为台账中显式登记的外链；
2. **Schema 合法**：`code ∈ {301,302,307,308}`、`from` 唯一、条数 < 2,100、单条 < 1,000 字符；
3. **未登记即红**：`上一版页面集合 − 当前页面集合 ⊆ 台账 from 集合`（删页 / 改 slug 未登台账 = CI 红——`pnpm verify` 在 build 之前的台账关卡拦下；平台构建只做生成，§5；沿 ia.md §3、stack.md §6）。**#20 例外**：预留命名空间 `/docs/reference/api/**` 的页由 TypeDoc 再生成产生，删符号不产生「人改的 URL」，故该前缀在 `unregisteredRemovals` 里豁免；命名空间整体升格（ia.md §1 逃生门）时登记那一个根即可；
4. **单一真相源守卫**：仓库内不存在手写 `public/_redirects`；生成器幂等（重跑 diff 为空）。

页面集合的取法（git 上一版内容树 / `astro:build:done` 的路由列表）由实现自选，规范只锁对账关系。

**实现形态（#18 实测）**：

- 四条关卡 = `scripts/check-ledger.mjs`（①②③ + 守卫）与 `scripts/gen-redirects.mjs --check`（④ 的幂等半边），逻辑在 `src/lib/ledger.ts`（纯函数，单测覆盖值域/重复/上限/行长的每条红路径）。
- **页面集合**从内容树机械推出（文件路径 **slug 化**后 = URL 路径，`src/lib/pages.ts`：Starlight 逐目录段 slug，故 `Agent.md` → `/agent/`、`@balsa/core/**` → `/balsa/core/**`；生成树的符号大小写文件名与保留命名空间都由这一条覆盖，#20 校正）；**上一版**用 `git ls-tree <ref> -- src/content/docs` 取。baseline 取 `--baseline` → `$BASELINE_REF` → `HEAD`；CI 传 PR base sha / 推送前的 `before`，本地默认 `HEAD`（工作树里删了页未登台账即红）。baseline ref 读不到 = 红，不当成「无删除」。
- **单一真相源守卫**：`public/_redirects` 存在即红；仓库内任何被 git 跟踪的 `_redirects` 同罪（生成物只允许在 `dist/`）。
- 平台构建路径（`pnpm build`）只跑台账 → `_redirects` 的**生成**（台账非法时生成器拒绝生成；这是构建自包含所必需），不跑需要 git 历史的关卡——§5 的「平台构建不承担校验职责」据此落地。
- 实测结论（#18）：四条关卡各自能红（fixture 逐一验证：`code: 303` / `from` 重复 / 目标无页 / 删页未登记 / 手写 `_redirects`）；生成器幂等（连续重跑逐字节相同）；删一页不登台账时 `pnpm verify` 在关卡处拦下（含 build 的整条关卡链红）。

### 4.3 永久语义与形态

- 验收口径：**HTTP 3xx 永久重定向（301 / 308），不得为 meta-refresh 或客户端跳转**；CF 上写 `301`。（本条改写 ia.md §2 / stack.md §6、§12 里的「真 301」字样：语义等价即可，平台强制 308 时不再视为缺陷。）
- **平台归一不进台账**：`/docs/foo` → `307 /docs/foo/` 由 `html_handling` 负责，属平台行为；台账只登记「人改的 URL」。
- **手写不搁 `public/`**：`_redirects` 由构建尾生成进 `dist/`（§4.1），`_headers` 才放 `public/`（§2.1）；这一条与 §4.2.4 的守卫是同一句话。
- canonical 形态 = **带尾斜杠**（`/docs/get-started/installation/`）；站内链接统一写全形态；`.md` twin 保持无尾斜杠。
- `_headers` / `_redirects` 随产物进入每个部署（含预览）——**线上已确认（#40）**：预览 URL 上站根仍 301 → `/docs/`、`.md` 仍带覆盖后的 MIME（§10.3）；回滚到旧版本时两条规则**随之回退**（§10.7 顺带把「`_headers` 是版本化资产」也验到了）。

## 5. 校验与 CI 归属

- **关卡全在仓库内脚本 + GitHub Actions**，与 balsa-framework 的 `pnpm verify` 先例同构；平台构建不承担校验职责（避免校验逻辑两处漂移）。
- **Actions 职责**：① frontmatter schema 值域、`packages` 与 `exports` 一致、原料指针可解析（stack.md §5）；② §4.2 的台账四条；③ 链接检查（含锚点存活，选型属实施）；④ TypeDoc 再生成 + `git diff --exit-code` 红门（api-reference.md §6）；⑤ 钉 SHA 新鲜度黄灯。
- **平台职责**：构建、预览、托管、回滚。**硬要求**：平台构建路径不得需要 balsa-framework checkout——TypeDoc 插件只在固定路径（`.framework/balsa-framework`）的 dist 存在时启用，否则只消费入库树（api-reference.md §4 的入库模式），产物因此自包含。（#18 时点的 `BALSA_TYPEDOC_REGEN=1` 措辞已作废：#20 落地为「钉定 checkout 在即生成」，平台侧无该目录即自然跳过；侧栏也从同一机制取得快照。）
- 预览构建天然是第一道「构建即校验」门（内容集合 schema 在 `astro build` 期生效），但红线判定只在 Actions。
- **落地形态（#18）**：`.github/workflows/verify.yml` 两个 job——**Repo gates**（`pnpm verify`：typecheck → 单测 → frontmatter 值域 → 构建期 frontmatter 反例 → 台账四条 → build → 路由断言 → 生成器幂等）+ **Pinned-ref gates**（`pnpm verify:pin`：checkout balsa-framework @ 钉定 SHA → 漂移 diff + `packages`/`exports` 一致 + 原料指针可解析）。前者不需要框架 checkout，后者必带；红线与黄灯尚未接的关卡（③ 链接检查、④ TypeDoc 再生成、⑤ 钉 SHA 新鲜度）按各自切片落地。
- **落地形态（#20 补全）**：增第三个 job **API tree gates**（`pnpm verify:api` + `pnpm check:pin-freshness`）——checkout balsa-framework @ 钉定 SHA 到固定路径 → 构建 `@balsa/core` dist → TypeDoc 零错零警告 pass → 重生成 → `git status` diff 门；新鲜度黄灯（⑤）以 `continue-on-error: true` 挂同一 job。
- **落地形态（#26 补全）**：agent 面三条断言（[agent-surface](./agent-surface.md) §9）接进 **Repo gates** 的 `pnpm verify`——`build` 之后跑 `scripts/check-agent-surface.mjs`，读 `dist/` 断言 twin 覆盖、`/llms.txt` 与 `/llms-manifest.json` 对内容集合、写作规则 ①②；生成器另挂在 `pnpm build` 的构建尾（产物不入库）。至此 ④/⑤ 已接，**只剩 ③ 站内链接检查（含锚点）**：本片只覆盖了 `/llms.txt` 的内部链接（断言 ②），全站链接检查的选型与落地仍归 #28。
- **落地形态（#27）**：平台契约的**仓库侧**进 Repo gates——`build` 之后跑 `scripts/check-platform.mjs`（§2 的三份文件 + Pagefind 索引，见 §2.1 的「落地形态」）；平台侧不跑校验的裁决不变（平台只构建与托管）。本片进 Actions 的其他改动只有一处：三个 job 的 Node 改读 `.nvmrc`（§2.4）。
- **落地形态（#28 补全）**：③ 站内链接检查落地为**自写脚本**（不引 `starlight-links-validator`：本站要的是一条离线的产物级规则，而插件的选型假设属于 `astro` 插件链与网络可达性——两者的行为都得跟着上游变）——`scripts/check-links.mjs` + 纯规则 `src/lib/links.ts`（单测 + `gate-scripts.test.ts` 的 fixture 各自验过红），在 `pnpm verify` 的 `build` 之后跑。规则 = 产物里每个 `<a href>` 要么是外链（**跳过，关卡不触网**）、要么是站根相对路径且解析到资产目录里的一个文件（页面 / `.md` twin / `_astro/*` / `favicon.svg` / `og.png` / `/llms.txt` / `/llms-manifest.json` / Pagefind runtime），带 fragment 的还要在目标页面上找到对应 `id`；相对链接视为缺陷（构建产物从站根定位，§4.3）。`.md` twin 不重复解析（它是源文直出，链接与渲染页同源；`/llms.txt` 的链接集合仍由 [agent-surface](./agent-surface.md) §9 断言 ② 守）。实测：259 页 / 73,048 条锚点（68,111 站内、4,928 同页 fragment、9 外链）**零断链**，0.5s——其中 57 条是跨页锚点链接、770 条是同页 `#_top` 一类，全部命中。

## 6. 预览部署

- 每个 PR 自动出预览（URL 由平台以 PR 评论给出）；**公开可访问**，不做认证；后续若出现未发布内容风险，再启用 Cloudflare Access 锁预览（免费档可用、不影响生产域）。
- 平台自动为预览加 `X-Robots-Tag: noindex`；预览 URL 不进 sitemap、不参与 canonical、不对外传播。
- 仅同仓库 PR 有预览（fork PR 无预览）；本仓库公开，红线关卡不依赖预览，故不影响外部贡献的正确性。

**实测（#40）**：三个机制各验一道——① 生产响应**无** `x-robots-tag`（可索引）、② 预览 URL **带** `noindex`（平台加，非仓库配置）；③ `_redirects` / `_headers` 在预览上同样生效（§10.3）。**PR 触发式预览本身仍未验**：那要 Workers Builds 的 Git 集成（#40 剩余项），本轮用 `wrangler versions upload` 的版本预览 URL 代跑——两者是同一类预览部署，差别只在谁构建、URL 由平台以 PR 评论给出（§13.3 第 1 行）。

## 7. 遥测与隐私口径

- **首发零遥测**：不装任何分析脚本、不引入同意横幅、不设第三方 cookie，也不引入任何营销像素（GA 类一律不引）。
- 日后若启用（另立票裁决），准入条件：无 cookie、无个人标识（不做跨站追踪 / 指纹）、兼容「优先免 SaaS」取向（自托管 GoatCounter / Umami > 平台自带 CF Web Analytics）。
- 因零遥测，站点不设独立隐私声明页；启用遥测的 PR 需同 PR 补声明。
- 地图上「分析 / 遥测」雾点由本裁决关闭（不再是未议点）。

**落地形态（#28）**：零遥测从「裁决 + 人工复核」变成三个机器规则——`scripts/check-telemetry.mjs` + 纯规则 `src/lib/telemetry.ts`（进 `pnpm verify` 的 `build` 之后）：

1. **无第三方子资源**，两种形态都算红：**绝对 URL**（第三方运行时，或写死 host——域名未定期间出现固定 host 就是把临时域写进产物，§3.4；正式域落地后子资源仍应从站根引用）与**相对路径**（它的指向由页面自身 URL 决定，而产物的其余引用一律从站根出发，§4.3）；`data:` / `blob:` 是自含值，不算外链。`rel="canonical"` / `alternate` 这类**指针**不算子资源（正式域落地后 canonical 本就该是绝对形态，#29）。
2. **无厂商特征**：HTML / JS / CSS 里不得出现分析、营销、同意横幅厂商的特征串（HTML 先剥掉文本节点——页面**谈论**某厂商不算命中，只有落到代码里才算）。
3. **无 cookie 写入**：产物 JS **与页面内联 `<script>`**（HTML 先经同一道代码上下文处理）里不得出现 `document.cookie = …` / `cookieStore.set()`（读不算）。

浏览器侧另有一条实测：验收扫描里每页请求**零外域**（`pnpm shots`，数值在 `.screenshots/acceptance.json`）。关卡的实测输出：259 页 / 1,045 个 `<script src>` 全部同源，278 个 HTML/JS/CSS 无厂商特征，272 个脚本（含页内内联块）无 cookie 写入。

## 8. 本票认领的内容面耦合条目

- **G1 npm 发布切换**：Installation 页首发 = 「从仓库使用为主路径」+ 未发布状态块；0.1.0 上 npm 后由**显式 PR** 切换（补 `npm i @balsa/core` 段 + 摘状态块 + 升钉 ref），进 #13 checklist。禁自动同步上游文案（content-boundary §4 真相源口径）。
- **G3 部署指南页**：`/docs/project/deployment`（P2）以本规范为配方真相源（Workers 静态资产 + 台账 + 预览 + 域切换），页面本身 P2 起写。
- **G5 changelog**：`/docs/project/changelog` P2 预留；机制 = **手写摘要 + 出处标记 + 钉 ref**（content-boundary §4 片段契约），不建自动生成管线（无公开机器真相源）；何时开始写由发布节奏触发。

## 9. 否决记录

| 落选 | 理由（一手事实） |
| --- | --- |
| GitHub Pages | **无路径级重定向能力**（只有 `jekyll-redirect-from` 的 meta-refresh）；无预览部署；**完全不能设响应头**（`.md` 的 Content-Type 失控，直接撞 #11）；项目站要求 `base`（与 stack.md §3.2 冲突）；商用条款灰区 |
| Vercel（Hobby） | 配置重定向只能 308（301 属 Pro 批量重定向）；**明文禁止商用**（"Hobby teams are restricted to non-commercial personal use only"——未来若出现付费面即逼迁移）；100 GB + 100 万 CDN 请求/月；密码保护属 Pro |
| Netlify（Free） | 301 为默认（优点），但 300 credits ≈ **15 GB 带宽且用尽即整站 `Site not available`**；重定向与同名文件优先级语义相反（需 `force`），台账生成器要多一层平台耦合 |
| Netlify（OSS 计划） | **次选保留**：10,000 credits/月、credits 用尽站点仍在线，代价 = 回链 + Code of Conduct + 限非商用；若 CF 出现不可接受变化（条款 / 额度 / 弃用），从这里续 |
| Cloudflare Pages | 能力与 Workers 等价（`_redirects` / `_headers` 语法与上限一致）；差异只在：尾斜杠行为未文档化、500 builds/月、404 靠约定自动探测、官方路线已转向 Workers → **作等价备胎**，迁移 = 配置小改 |

## 10. 待实测（执行手册 = §13，台账 = [#40](https://github.com/0xnicholas/balsa-docs/issues/40)）

> **状态：八条里五条已跑（#40，2026-10-01）——两条要 Workers Builds 的 Git 集成（§10.1 / §10.5），一条欠 DNS 与证书（§10.6：apex 已由 #29 定为 `balsats.com`，仓库侧已切）。** 「平台构建」与「平台托管」是两件事：本轮用 `wrangler deploy` / `versions upload` / `rollback` 把产物落到平台并验了托管侧（**部署、预览、回滚都是平台自身的版本机制**，与 Git 集成后的产物走同一条托管路径），但**构建侧**（Node / pnpm 钉法、缓存命中、PR 触发式预览、push `main` 自动部署）不经过平台构建镜像，测不到，故三条仍挂着。未跑的不得当作已验证。
>
> 本轮另把产物侧验了一道：部署产物里 `/docs/reference/api/**` 完整（238 页全量上传，抽查 12 条叶页全 200、生成树的 `.md` twin 200）——「平台构建也要能产出这份产物」仍归构建侧（§13.1 第 4 行）。
>
> **#28（最终验收）的口径**：#28 在本仓库能验的部分已全绿——§10.2 的**覆盖侧**（无条件两条 `Content-Type`）与 §10.8 的**索引侧**（覆盖页面集合、runtime / wasm / 词索引 / 片段、每页挂载搜索 UI）由 `scripts/check-platform.mjs` 机器化，§10.8 的检索质量由 `pnpm shots` 的真实查询实测（见 [api-reference](./api-reference.md) §10 的结清）——「线上真的回这些头 / 真的发布出来」是 #40 的完成判据，不是 #28 的。

1. ⏸ **仍待实测（要 Git 集成）** Workers Builds 的 Node / pnpm 钉法生效规则（`.nvmrc` / `NODE_VERSION` / `packageManager`）——本轮从本机直传产物，不经过平台构建镜像（§13.1 第 3 行）。
2. ✅ **已实测（#40）** 各扩展名默认 `Content-Type` 实测（`.md`、`.txt`、无扩展名）。测法 = 把两条 `Content-Type` 规则从产物撤下、部署、重测，再装回（平台默认头**都能被** `_headers` 覆盖，所以 `!` 去重复头那条对策**本轮未触发**）：
   - `.md` → `text/markdown`（**无 charset**）；`.txt` → `text/plain; charset=utf-8`；无扩展名端点（`/docs/`）→ `text/html`；对照 `.json` → `application/json`、`/robots.txt` → `text/plain`（无 charset，平台托管管道，§2.3）。
   - **对策结论**：`.md` 那条覆盖**是必要的**（平台默认缺 charset）；`/llms.txt` 那条覆盖在实测上**冗余**（平台默认与目标值逐字相同）——按 §2.1 / §2.3 的取向**照旧保留**（覆盖无条件，不把「平台默认值」变成第二真相源），本条从此只承担「记录平台默认值」的职责。
   - 覆盖在线上确实生效：生产 `.md` 回 `text/markdown; charset=utf-8`、`/llms.txt` 回 `text/plain; charset=utf-8`（§13.2 第 3 / 4 行）。
3. ✅ **已实测（#40）** `_redirects` / `_headers` 在**预览部署**上生效。在 `wrangler versions upload` 造出的版本预览 URL 上：站根 **301 → `/docs/`**、`.md` **`text/markdown; charset=utf-8`**、站级 `Link` 与 `X-Llms-Txt` 都在、`/no-such-page` 404、`/pagefind/pagefind.js` 200。**口径**：版本预览 URL 与 Git 集成后 PR 评论里给的预览是同一类预览部署（`_headers` / `_redirects` 随产物进每个部署，§4.3）；**PR 触发式预览本身仍待 Git 集成**。
4. ✅ **已实测（#40）→ 已切换（#29，2026-10-01）** 临时平台域上 `site` / canonical 的过渡形态：生产域 = `https://balsa-docs.balsa-docs.workers.dev`；`site` 未设 → 页面 canonical **0 处**、`/sitemap-index.xml` **404**（构建期警告同 §13.4）、`/llms.txt` 与 `/llms-manifest.json` 的链接为站根相对形态；生产响应**无** `x-robots-tag`。**正式域切换已落仓库侧**：[delivery §3.4](./delivery.md) 的「落地形态」逐条给出了产物侧结果（257 条 sitemap / 逐页 canonical / 自持 robots），由 `scripts/check-origin.mjs` 在 `pnpm verify` 里守——**线上那一半仍未验**（DNS 未通，见第 6 条）。
5. ⏸ **仍待实测（要 Git 集成）** 平台侧构建缓存命中情况（含 `node_modules/.astro`）——同第 1 条。
6. ⏸ **仍待实测（apex 已定 `balsats.com`，欠 DNS 与证书；台账 = [balsa-website #16](https://github.com/0xnicholas/balsa-website/issues/16)）** 自定义域接入（CNAME / zone 内自动记录）与证书签发的实测。**#29 已把待验对象从「某个 apex」缩到 `docs.balsats.com`**（#44 改判后的取值，选型见 §3.1），仓库侧已切到该域；缺的是人在 Cloudflare 侧的两步：注册 `balsats.com` → zone 进站点所在账号 → 加自定义域（平台自动建记录 + 签发证书）。事后验收 = §13.4 第 4 行的四条 `curl`，连同本节重跑。可先记账的事实：workers.dev 域下主机名首次部署后自动取得 Let's Encrypt 证书（`CN=balsa-docs.workers.dev`，SAN 含 `*.balsa-docs.workers.dev`），生产主机名与版本预览主机名同在其覆盖内（§2.3）。
7. ✅ **已实测（#40）** 回滚实操：`wrangler rollback <version-id>`（Worker Versions 机制，与 dashboard 的 Rollback 同一个东西）把流量从「带覆盖」那版切到「撤下覆盖」那版——站根**仍 301 → `/docs/`**（`_redirects` 与产物是同一份快照）、`.md` 的 `Content-Type` 退回平台默认 `text/markdown`（无 charset）、`/llms-manifest.json` 的 `pin` 前后一致。**这一条顺带把 §4.3 的「`_headers` / `_redirects` 随产物走」验实了**：回滚回的是规则文件本身，不只是 HTML。前滚回最新版后逐项复验还原。
8. ✅ **已实测（#40）** Pagefind 在平台产物里的索引完整性与可用性：`/pagefind/pagefind.js` 与 `/pagefind/pagefind-entry.json` 都 **200**；真浏览器（Playwright，`scripts/shoot-acceptance.mjs` 的同一手法）在生产域上开搜索面板查两条——`createWorkflow` **10 条命中（6 条来自生成树）**、`durable execution` **20 条（16 条来自生成树）**，亮暗两主题一致；同一次扫描（页面 = `/docs/concepts/agents/`，亮暗各一次）**零外域请求**——全站级的「每页零外域」仍是 #28 的本机扫描（§7）。**仓库侧**（索引覆盖本版页面集合、runtime / wasm / 词索引 / 片段齐全、每页挂载 `<site-search`）仍由 `pnpm verify` 的 `check-platform.mjs` 守。

## 11. 交接注记

- **给 #11**：平台事实（一手）——静态资产请求不限量，**只有 Worker 脚本被调用才计费**；免费档下脚本超额会 429 而非回落静态资源，故「加脚本」是一次需要单独评估的动作（`run_worker_first` 只在明确需要 Accept 协商 / MCP 时启用）。`_headers` 可覆盖 `.md` 的 Content-Type（目标值由你裁，实测项见 §10.2）；`.md` 与 HTML 路由不冲突（`html_handling` 只作用于 HTML）；预览默认 noindex 可直接依赖。
- **给 #12**：托管与视觉无耦合；`_headers` 的 immutable 缓存条目在建站时随资产指纹落地；不需要为品牌引入任何平台依赖。
- **给 #13**：checklist 增七项——① `.nvmrc` + `wrangler.jsonc`（assets 段）落地；② `redirects.json` + 生成器 + §4.2 四条关卡；③ Actions 工作流（关卡 + TypeDoc 红门 + 黄灯）；④ 预览 / 生产 / 回滚各验一次；⑤ 正式域落地 PR（§3.4）——**#29 已落仓库侧**（apex = `balsats.com`，`site` / canonical / sitemap / robots / 验收关卡全部到位），**欠 DNS + 证书**（§10.6）；⑥ npm 0.1.0 切换 PR（§8）；⑦ `_headers` 五条（`.md` 与 `/llms.txt` 的 MIME、`/_astro/*` immutable、站级 `Link` + `X-Llms-Txt`）——#27 已入库，线上 `curl -I` 验收见 §13 / [#40](https://github.com/0xnicholas/balsa-docs/issues/40)。
- **给建站 effort**：本规范即施工图；§10 的八条实测在首次上线时逐条落笔（与 #9 的实施清单同批）。

## 12. 退出路径

- 内容、URL、台账、头文件全是仓库资产；换平台 = 换一个配置文件（`_redirects` ↔ `vercel.json` ↔ `netlify.toml`）+ 生成器的一个后端分支，不触发内容改动。
- CF 内 Pages ⇄ Workers 迁移 = 配置小改（`assets.directory` ↔ `pages_build_output_dir`）+ `scripts/check-platform.mjs` 里的 `wrangler.jsonc` 取值断言。
- 平台默认域不承担对外承诺，故换平台不产生 URL 迁移债。

## 13. 平台落地清单（执行手册）

> **状态**：**已跑一轮（#40，2026-10-01）——托管侧全部验完，构建侧待人**。**仓库侧**（`.nvmrc` / `wrangler.jsonc` / `public/_headers` / Pagefind 索引）已随 #27 入库并由 `pnpm verify` 验收（§2.1 / §5）；本轮用 `wrangler deploy` / `versions upload` / `rollback` 把产物落到平台并跑完了 §13.2 / §13.3 的托管侧验收（逐条值见本节末尾的「执行记录（#40）」与 §10）；**剩下的只有「谁构建」——Workers Builds 的 Git 集成需要浏览器里的人**（GitHub App 授权，API 做不了）：§13.1 的连接与构建日志、§13.3 的 PR 触发式预览与 push `main` 自动部署。
>
> **#29（2026-10-01）另改了本节的适用范围**：正式域已定为 `https://docs.balsats.com` 且**仓库侧已切**（构建尾多三份产物，见 §13.1b 后的注），所以自定义域接入后，本节命令换域重跑一遍；DNS / 证书仍是人的两步（§13.4）。
>
> 下面的命令统一用 `SITE=https://balsa-docs.<account>.workers.dev`（临时平台域，§3.4）；**#29 起正式域已定（`https://docs.balsats.com`）且仓库侧已切换**，DNS 一旦通就换成它重跑一遍（§13.4 第 4 行）——在那之前，临时域上跑出来的 canonical / sitemap 都会指向正式域，属预期。

### 13.1 连接与首次构建

> **本轮状态**：本节的四行**都要 Workers Builds 的 Git 集成**，尚未执行；首次部署改走了 `wrangler deploy`（本机构建 → 平台托管），得到的事实记在下面第 3 行与本节末尾的执行记录里。

| # | 动作 | 位置 | 预期 |
| --- | --- | --- | --- |
| 1 | 连接仓库 | CF dashboard → Workers & Pages → Create → Connect Git → `0xnicholas/balsa-docs` | 项目名 = `wrangler.jsonc` 的 `name`（`balsa-docs`） |
| 2 | 构建命令 | dashboard 构建配置 | `pnpm build`。**不要**把 `pnpm verify` 放上来：校验红线在 Actions（§5），平台只构建与托管 |
| 3 | 首次生产部署 | push `main` | 构建成功；日志里 Node = `.nvmrc` 的 `22.12.0`、pnpm = `packageManager` 的 `10.33.2`（钉法是否生效 = §10.1）。**本轮代跑**：`wrangler deploy`（本机 Node 26.2.0）——平台托管就位、TLS 与证书自动就绪，但**平台构建镜像的钉法完全未验**（§10.1）。 |
| 4 | 平台构建路径 | 同一次构建 | 无需 `balsa-framework` checkout：产物里 `/docs/reference/api/**` 完整（入库树 + `api-sidebar.json` 快照，api-reference §4） |
| 5 | 构建缓存 | dashboard 开关 | 记一次冷 / 热的构建时长（含 `node_modules/.astro`，§10.5） |

### 13.1b 本轮代跑路径（`wrangler`，不经过平台构建）

> 不是 §13.1 的替代品，只是它跑不动时的落地方式；两个命令之后平台侧就与 Git 集成后**同形**。

| 序 | 命令 | 台账 |
| --- | --- | --- |
| 1 | `pnpm build` | 本机产出 `dist/`（`astro build` **258 页** + 站根跳板 = 259 个 HTML；Pagefind 索引；构建尾的 `_redirects` / `llms.txt` / `llms-manifest.json`） |
| 2 | `npx wrangler deploy` | 上传 807 个资产（= `dist/` 809 个文件 − 两个规则文件）→ 生产域 `https://balsa-docs.balsa-docs.workers.dev` |
| 3 | `npx wrangler versions upload` | 造版本预览 URL（本轮 = §10.3 的预览验收对象） |
| 4 | `npx wrangler rollback <version-id>` | 版本回滚（§10.7）；前滚用同一个命令指回最新版 |

> **#29 起的增量**：构建尾多写三份产物——`robots.txt`（`src/lib/site.ts` 渲染）、`sitemap-index.xml` 与 `sitemap-0.xml`（`site` 落地后 sitemap 集成才产出）。HTML 页数不变（仍是 258 页 + 站根跳板 = 259）；`dist/` 文件数 **812**（本机实测）→ 下次 `wrangler deploy` 的资产数应为 **810**（减 `_headers` / `_redirects`）——**这个 810 是推得的，不是本轮的部署实测**（#29 只跑仓库侧，未部署），下次部署时改成本轮实测值。

> ⚠️ **#29 之后，手动部署的语义变了**：`site` 已指向 `https://docs.balsats.com`，而该主机**还没解析**。现在跑 `pnpm build && npx wrangler deploy`，上线的页面 canonical 与 sitemap 都指向一个不存在的主机，临时域因此从「可索引的过渡站」变成「自我去索引的站点」。开工前先看 §13.4 第 3 行：注册 + 加自定义域是人的两步，做完再部署（**若确实要先发一版，就接受临时域不再可索引——它本就不在对外承诺里，§3.4**）。域一通就按 §13.4 第 4 行换域验收并回填。

### 13.2 线上验收（在部署产物上跑，不是 `dist/`）

| # | 验收 | 命令 | 预期 |
| --- | --- | --- | --- |
| 1 | 站根永久重定向 | `curl -sS -o /dev/null -w '%{http_code} → %{redirect_url}\n' $SITE/` | `301 → $SITE/docs/`（308 等价，§4.3）；**不得是 `200` + meta-refresh** |
| 2 | 尾斜杠平台归一 | 同上，URL 换成 `$SITE/docs/get-started/quickstart` | `307 → …/quickstart/`（平台行为，不进台账） |
| 3 | `.md` twin MIME | `curl -sSI $SITE/docs/get-started/quickstart.md \| grep -i '^content-type'` | `text/markdown; charset=utf-8` |
| 4 | `/llms.txt` MIME | `curl -sSI $SITE/llms.txt \| grep -i '^content-type'` | `text/plain; charset=utf-8` |
| 5 | 指纹资产缓存 | `curl -sSI $SITE/_astro/<任一产物 css> \| grep -i '^cache-control'` | `public, max-age=31556952, immutable` |
| 6 | 站级 llms 头 | `curl -sSI $SITE/docs/ \| grep -iE '^(link\|x-llms-txt)'` | `link: </llms.txt>; rel="llms-txt"` 与 `x-llms-txt: /llms.txt` |
| 7 | 自定义 404 | `curl -sS -o /dev/null -w '%{http_code}\n' $SITE/no-such-page` | `404`，正文是产物里的 `404.html`（`not_found_handling: 404-page`） |
| 8 | 搜索运行时已发布 | `curl -sS -o /dev/null -w '%{http_code}\n' $SITE/pagefind/pagefind.js` | `200`；页面上搜索面板可查（§10.8） |
| 9 | 默认 MIME 记录（可选诊断） | 临时删掉 `public/_headers` 的两条 `Content-Type` 规则 → 部署一次 → 重跑第 3 / 4 行，外加 `curl -sSI $SITE/docs/ \| grep -i '^content-type'`（未归一的 `$SITE/docs` 是 307，得带尾斜杠） | 记下平台对 `.md` / `.txt` / **无扩展名端点**（归一后的干净 URL，预期 `text/html`）的默认值，回填 §10.2。不记录也不阻塞上线（覆盖是无条件的）；若某条默认头**删不掉**（平台保留同名头），把该规则改成 `! Content-Type` 删除 + 一行重设，`check-platform.mjs` 的解析器认这种写法。**本轮已跑（#40）**：默认值 `.md` = `text/markdown`（无 charset）、`.txt` = `text/plain; charset=utf-8`、无扩展名 = `text/html`；头都能被覆盖，**不需要** `!` 写法（§10.2）。 |

### 13.3 预览 / 生产 / 回滚

| # | 动作 | 命令 / 位置 | 预期 |
| --- | --- | --- | --- |
| 1 | 预览 | 开一个 PR（改一页） | PR 上出现预览 URL 评论；公开可访问（§6）。**本轮代跑（#40）**：`npx wrangler versions upload` → 版本预览 URL（`https://<版本前缀>-balsa-docs.balsa-docs.workers.dev`），公开可访问 ✅；**PR 评论那条仍待 Git 集成** |
| 2 | 预览 noindex | `curl -sSI <预览 URL>/docs/ \| grep -i '^x-robots-tag'` | `noindex`（平台自动加）。**本轮已验（#40）** ✅（生产上则**无**该头） |
| 3 | 预览上的台账与头 | `curl -sS -o /dev/null -w '%{http_code} → %{redirect_url}\n' <预览 URL>/` 与 `curl -sSI <预览 URL>/docs.md \| grep -i '^content-type'` | 与生产同：301/308 → `/docs/`；`text/markdown; charset=utf-8`（`_redirects` / `_headers` 随产物进每个部署，§4.3 / §10.3）。**本轮已验（#40）** ✅ 两条都与生产一致 |
| 4 | 生产 | 合并 PR | push `main` 自动部署；部署原子（失败不停在半新半旧，§2.4）。**仍待 Git 集成**（本轮用 `wrangler deploy` 落版，不是这条） |
| 5 | 回滚 | dashboard → Deployments → 选上一版 → Rollback | 回滚后重跑 13.2 的第 1 / 3 行：站根仍 301/308，`.md` 仍带覆盖后的 MIME。**本轮已验（#40）** ✅ 用的是同一个机制（CLI 侧 `wrangler rollback <version-id>`，Worker Versions）；**多验到一条**：回滚到「撤下覆盖」的那版时 `.md` 的 MIME 确实退回平台默认（`_headers` 是版本化资产，不只是 HTML） |
| 6 | 回滚一致性 | 回滚后 `curl -sS $SITE/llms-manifest.json \| grep -m1 pin` 与 13.2 第 1 行 | 站根仍是 301/308；产物与 `_redirects` 是同一份快照（站点内容与该版部署逐字对应，§10.7）——manifest 的 `pin` 与那一版仓库一致。**本轮已验（#40）** ✅（回滚前后 `pin` 一致、站根仍 301） |

### 13.4 临时域 → 正式域（#29 的一次性 PR）

> **状态（2026-10-01，#29）**：第 2 行**已跑**（仓库侧切换，逐条在末尾的执行记录）；**第 3–4 行仍欠人**——`balsats.com` 尚未注册（本机复核 2026-10-02：registry RDAP **404**、两个独立递归 **NXDOMAIN**；CF 账号里无 zone），所以本节的完成判据（DNS / 证书 / 线上验收）一条未结。下面第 3 行已扩成可照抄的操作路径（含 CAA 检查与 TLS 窗口提醒），第 4 行是切完当天要跑的验收与回填清单。**这两行的人工执行台账 = [balsa-website #16](https://github.com/0xnicholas/balsa-website/issues/16)**（label `ready-for-human`；营销站侧同一件事的台账，本仓 #43 是它的文档站半边，已并入并关票）。

| # | 动作 | 预期 |
| --- | --- | --- |
| 1 | 临时域阶段（本节止步点） | 站点跑在 `balsa-docs.<account>.workers.dev`；`site` 未设 → canonical 缺席、sitemap 跳过（构建期警告，#17 已识别）；**临时域不进对外材料**（§3.4）。**已线上确认（#40）**：本轮的实际域 = `https://balsa-docs.balsa-docs.workers.dev`，canonical 0 处、`/sitemap-index.xml` 404、llms 两份站根相对形态（§10.4） |
| 2 | 切换 PR（#29） | 改 `src/lib/site.ts` 的 `site` 一处：canonical、sitemap、`/llms.txt` 绝对链接、`/llms-manifest.json` 的 `site` 同批更新（同一常量，agent-surface §4）。`robots.txt` 目前不存在（本规范未定其内容；§3.4 把它列入域切换的改动面）——若 #29 决定加，其 `Sitemap:` 行与域同批。**#40 补充的实测前提**：产物里没有 `robots.txt` 时**平台会托管一份**（Content Signals 政策文本，无指令），仓库资产能覆盖它（§2.3）——所以「加不加 robots.txt」是一个真选择，而不是「空白」。**本轮已跑（#29，2026-10-01）：决定了加，且不是手写而是构建尾从 `src/lib/site.ts` 渲染**（`scripts/gen-robots.mjs`，allow-all + `Sitemap:` 行）——「与域同批」因此是机制性的，不是纪律。同批还多了：`og:image` 从根相对变绝对（`astro.config.mjs` 从同一常量算）、验收脚本 `scripts/check-origin.mjs` + `src/lib/origin.ts` 进 `pnpm verify` |
| 3 | 域落地 | 自定义域为精确主机名匹配（apex 不自动覆盖子域）；CNAME / zone 内自动记录 + 证书签发（§10.6）。**目标主机名 = `docs.balsats.com`**（#29 当时的目标，后经 #44 改判到同一形态的 `balsats.com` 上；选型与改判见 §3.1）。**操作路径（可照抄，按序）**：① **注册** `balsats.com`——Cloudflare Registrar 最省事（支持 `.com` 注册；买下即 zone 进账号），别的注册商也行（买完在 CF 里 Add site，把 zone 托管进来）；② **CAA 不得阻断签发（判据①）**：`dig +short CAA balsats.com` 应为空，或含平台用的 CA（`letsencrypt.org` / `pki.goog` / `digicert.com`）——有别家 CAA 记录先删改；③ **加记录 + 签证书（判据③的前半）**：dashboard → Workers & Pages → `balsa-docs` → Settings → Domains & Routes → Add → Custom domain → `docs.balsats.com`（平台自动建 DNS 记录并签证书）；等价的配置路径 = `wrangler.jsonc` 加 `"routes": [{ "pattern": "docs.balsats.com", "custom_domain": true }]` 再 `wrangler deploy`——**这条要等 zone 已在账号里**，否则部署直接失败（另：`check-platform.mjs` 只钉 §2.1 的四个键、不拒未知键，所以加 `routes` 时规范得同批写一笔）；④ **证书就绪（判据③的后半）**：`curl -sSI https://docs.balsats.com/docs/ \| head -n1` 得 `HTTP/2 200`，`echo \| openssl s_client -connect docs.balsats.com:443 -servername docs.balsats.com 2>/dev/null \| openssl x509 -noout -subject -ext subjectAltName` 的 CN / SAN 含该主机名——**首几分钟的 TLS 窗口**见 §2.3（`SSL alert 40`，约 4 分钟自愈），别一失败就判「站点挂了」 |
| 4 | 切换后验收 | 域一通就换 `SITE=https://docs.balsats.com` 重跑 §13.2 的八行，外加本条专属的四条：① `curl -sS $SITE/sitemap-index.xml \| grep -o '<loc>[^<]*' \| head -n1` → `https://docs.balsats.com/sitemap-0.xml`；② `curl -sS $SITE/docs/ \| grep -o 'rel="canonical" href="[^"]*"'` → `https://docs.balsats.com/docs/`；③ `curl -sS $SITE/robots.txt` → **产物那份**（`User-Agent: *` / `Allow: /` / `Sitemap: https://docs.balsats.com/sitemap-index.xml`），不是平台的 Content Signals 文本；④ `curl -sS $SITE/llms-manifest.json \| jq -r .site` → 正式域。台账仍**零条**（§3.4：临时域未对外公开过，且域切换不产生路径变更）。**切完回填清单**：§10.6 从 ⏸ 改 ✅（记证书 CN / SAN 与 CAA 取值）、§10.4 的线上半边补进这四条取值、本节末尾的执行记录补一轮「第 3–4 行」、[handoff](./handoff.md) 的 O2 / O3 从 ◐ 升 ✅、§3.1 的「仍未做的两件」删掉或改写成已做——三条完成判据逐条对着本节写，不另立出处 |

> **执行记录（#29，2026-10-01）**：本轮是**仓库侧**的那一半，DNS 与证书仍欠人（上表第 3–4 行）。改动面 = `src/lib/site.ts`（`site`；值后经 #44 改判为 `docs.balsats.com`，机制未动）+ `astro.config.mjs`（`og:image` 取绝对）+ 新增 `src/lib/origin.ts` / `scripts/check-origin.mjs` / `scripts/gen-robots.mjs`（进 `pnpm build` 与 `pnpm verify`）+ `scripts/check-brand.mjs` 与两处 fixture 跟上；`redirects.json` 与 `wrangler.jsonc` **未动**（前者零条，后者 `workers_dev` 保持开启）。本机实测：`dist/robots.txt` = 渲染结果、`dist/sitemap-index.xml` → `sitemap-0.xml` **257 条 = 页面全集**、259 个 HTML 里逐页 canonical 命中（`404.html` 与站根跳板不计，它们是错误页与跳板，本来就不在 sitemap 里），`pnpm verify` 全绿。**未做**：注册 / 下单、zone 进账号、自定义域、证书、线上四条 `curl`（§10.6 仍挂着，§10.4 的线上半边同样）。

---

### 13.5 执行记录（#40，2026-10-01）

> 一次性动作的台账：**跑了什么、返回什么、剩下什么**。逐条结论已回填 §10（第 1–8 条）与 [handoff](./handoff.md) §3.5；这里只记「这一轮干了什么」，不重复取值（§10 / §2.3 是取值的唯一出处）。

| 序 | 动作 | 结果 |
| --- | --- | --- |
| 1 | Cloudflare 账号接入执行人机器（`wrangler login`，OAuth） | 账号 `Nicholasli9@qq.com's Account`；workers.dev 子域 = `balsa-docs` → 生产域 `https://balsa-docs.balsa-docs.workers.dev` |
| 2 | `pnpm build` + `wrangler deploy`（首次） | 807 资产上传（= `dist/` 809 文件 − 两个规则文件）；258 页 + 站根跳板、Pagefind 索引、构建尾三份产物全部到位；证书与 TLS 自动就绪（首几分钟的 TLS 握手窗口见 §2.3） |
| 3 | §13.2 第 1–8 行的 `curl` 验收 | **8 行全过**（永久重定向 / 尾斜杠归一 / `.md` MIME / `/llms.txt` MIME / 指纹缓存 / 站级 llms 头 / 404 / Pagefind）。404 正文与 `dist/404.html` **逐字节相同** |
| 4 | §13.2 第 9 行（默认 MIME 诊断） | 两次临时部署（撤下 / 装回两条 `Content-Type`）；默认值入 §10.2。生产最终版已装回覆盖 |
| 5 | `wrangler versions upload` → 预览 URL | §13.3 第 1–3 行全过（可访问 / `noindex` / 台账与头与生产一致） |
| 6 | `wrangler rollback <version-id>` → 前滚 | §13.3 第 5–6 行全过（§10.7 把 `_headers` 的版本化一并验到） |
| 7 | 真浏览器（Playwright）在生产域上查搜索 + 零外域 | §10.8 全过：两条查询都有命中、都含生成树结果、亮暗一致；**每页零外域请求** |
| 8 | 产物完整性抽查 | `/docs/reference/api/**` 238 页全量上传；抽查 12 条叶页全 200，生成树 `.md` twin 200 |
| 9 | 额外探针（测试完已回退） | ① 临时 `public/robots.txt` → 覆盖了平台托管文本（§2.3）；② `x-robots-tag` 生产无 / 预览有（§6） |
| — | **未做**（要 Workers Builds 的 Git 集成，需浏览器里的人） | §13.1 全部四行；§13.3 第 1 行的 PR 评论式预览、第 4 行的 push `main` 自动部署；§10.1 / §10.5（构建侧两条）；另 §10.6（自定义域）的 DNS 与证书（apex 已定，仓库侧见 §13.4） |

**执行人（用户）仍需做的三件事**：① dashboard → Workers & Pages → Connect Git 接 `0xnicholas/balsa-docs`（构建命令 `pnpm build`，项目名跟着 `wrangler.jsonc` 的 `name`）；② 首次构建后把日志里的 Node / pnpm 版本与冷 / 热构建时长回填 §10.1 / §10.5（判据在 §10 里）；③ 开一个 PR 看预览评论与 `noindex`，合并后看 `main` 自动部署——这三件事做完，#40 即全部结清。

> ⚠️ **在①做过之前，`main` 不等于生产**：本轮上线的是**手工** `wrangler deploy` 的产物（本机构建），所以之后任何推到 `main` 的提交（内容、样式、`_headers`）**都不会自动上生产**，也不会出预览——托管层已经是平台的了，缺的只是那个触发器。临时办法：`pnpm build && npx wrangler deploy`；正式办法就是①。读到本节的人先看这一条，再假定“推上去就上线了”。

---

> **实施注记（#40）**：本切片是**执行与回填**，不改仓库契约——除了本节与 §10 的实测回填，`delivery.md` 另动了**五处**局部注记（§2.1 的平台侧状态、§2.3 的实测事实、§2.4 的缓存确认、§3.4 的临时域形态、§4.3 / §6 的预览与回滚确认）。**仓库侧文件一个未动**：没有新增脚本、没有改 `wrangler.jsonc` / `_headers` / `.nvmrc`。落地状态：生产域已跑在占位符上、构建侧待 Git 集成（§13.5 的三件事）。
>
> **实施注记（#18）**：§4.1 / §4.2 / §5 的「落地形态 / 实现形态」为建站切片 #18 的实测回填——台账值域与生成器模式、四条关卡的脚本与 baseline 语义、Actions 两个 job。机制与关卡数未变，只把「怎么做」写成唯一一份；平台侧仍待实测的八项（§10）不动。
>
> **实施注记（#27）**：本切片只交付平台的**仓库侧**，因为平台侧动作（连接 git 集成、部署、预览、回滚、`curl -I`）需要账号与浏览器，跑不进「一片 = 一个 PR = 一个 session」。入库物：`.nvmrc`（`22.12.0`）、`wrangler.jsonc`（§2.1 的块）、`public/_headers`（五条）、`scripts/check-platform.mjs` + `src/lib/platform.ts`（进 `pnpm verify`，§2.1 / §5 的「落地形态」）、Actions 三个 job 改读 `.nvmrc`。**平台侧整体挂起**：§10 八条未执行、执行手册 §13（在本文件内，不另立规范），执行与回填台账 = [#40](https://github.com/0xnicholas/balsa-docs/issues/40)（#28 的最终验收被它阻塞）。**→ #40 已跑一轮：托管侧八条中的五条结清（§10），构建侧三条等 Git 集成（§13.5）。**
>
> **实施注记（#29）**：【仓库存侧的域切换已落，DNS 与证书欠人】`src/lib/site.ts` 的 `site` = `https://docs.balsats.com`（值经 #44 改判；机制与三条关卡不变；选型与依据见 §3.1）——一处常量带动 canonical、sitemap、`/llms.txt` 绝对链接、manifest 的 `site` 与新建的 `robots.txt`。新增：`src/lib/origin.ts`（三条规则 + robots 渲染，单测 17 条）、`scripts/check-origin.mjs`（进 `pnpm verify` 的 `build` 之后）、`scripts/gen-robots.mjs`（进 `pnpm build` 尾）；`astro.config.mjs` 的 `og:image` 从根相对改绝对，`check-brand.mjs` 与两个 fixture 随之更新。**台账零条、`wrangler.jsonc` 未动**（临时域保持服务，版本预览 URL 仍可用）。回填点：§2.3（自持 robots 与失去 Content Signals 文本的代价）、§3.1 / §3.3 / §3.4（选型 + 落地形态）、§10.4 / §10.6（那两条的线上半边仍挂着）、§13.1b / §13.4（产物增量与执行记录）。
>
> **实施注记（#28）**：【最终验收已跑完，平台侧除外】§5 的最后一个未接关卡（③ 站内链接检查）落地——自写 `scripts/check-links.mjs` + `src/lib/links.ts`，进 Repo gates；§7 增「落地形态（#28）」，零遥测变成三个机器规则（`scripts/check-telemetry.mjs` + `src/lib/telemetry.ts`）；§10 头部补一段口径说明（八条属 #40，本节现状不变）。浏览器面的验收扫描（五类页面 × 亮暗截图 + CLS + Pagefind 查询 + 零外域请求）在 [brand-visual](./brand-visual.md) §5 的「实测回填（#28）」与 `.screenshots/`。**平台侧一条未动**：连接、部署、预览、回滚、线上 `curl -I` 仍是 #40。**→ #40 已跑一轮（2026-10-01）：托管侧的部署 / 预览 / 回滚 / 线上头全部结清（§10 / §13.5），只剩构建侧（Git 集成）与人操作。**

_由 [决策:交付与部署](https://github.com/0xnicholas/balsa-docs/issues/10) 产出（2026-09-30）；平台事实见 `docs/research/hosting-facts.md` @ `research/hosting-facts`（commit `db1d78e`）；栈级前提见 [stack.md](./stack.md) §3.2 / §6 / §10。_
