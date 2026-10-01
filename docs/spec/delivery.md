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
- `_headers`：规则 ≤100 条；splat/占位符同 `_redirects`；**redirects 先于 headers 执行**。
- `html_handling: auto-trailing-slash`：`/folder` → **307** `/folder/`；`/file.html` → 307 `/file`；目录索引以带尾斜杠形态服务；该配置**只作用于 HTML 内容**（`.md` 等扩展名端点不受影响）。
- 平台默认头：`Content-Type`（wrangler 按扩展名判定）、`Cache-Control: public, max-age=0, must-revalidate`、`ETag`——均可被 `_headers` 覆盖 / 删除 / 追加。
- 自定义域为**精确主机名**匹配（apex 不自动覆盖子域）；证书自动签发；域级互跳不属 `_redirects` 能力（需 CF zone 级转发规则）。

### 2.4 构建与运维约束

- **Node 钉法**：仓库根 `.nvmrc`（`22.12.0`）+ 平台环境变量 `NODE_VERSION` 兜底；**不依赖** `package.json` 的 `engines`（CF 构建镜像不读它）。pnpm 版本由 `packageManager` 字段钉。Workers Builds 侧的生效规则列入 §10 待实测。
- **缓存**：`_headers` 对指纹资产（`/_astro/*`）设 `Cache-Control: public, max-age=31556952, immutable`；HTML 保持平台默认（`must-revalidate` + ETag），保证改内容即刻生效。
- **部署**：push `main` → 生产部署；PR / 分支 → 预览；回滚 = Worker Versions；部署原子（整份产物快照切换）。
- **免费档边界**（对本站非约束，记账）：Workers Builds 3,000 分钟/月、1 并发、20 分钟超时；静态资产请求不限量。

## 3. 域名形态与营销站协调

### 3.1 形态裁决

- **主形态 = `docs.<apex>` 子域**：docs 独立部署、独立 TLS、独立预览与重定向；与营销站的托管栈互不绑定。
- 路径层已解耦（ia.md §2）：无论域名如何，`/docs/<family>/<slug>` 与站根 `/llms.txt`、`<route>.md` 形态不变。
- **域名名字不归本票**（归 balsa-website 的 [域名与 handle 可用性调研](https://github.com/0xnicholas/balsa-website/issues/9)）；本规范只要求交付两样东西：一个 `<apex>` + 一条 `<apex>` 内 `docs` 子域记录的控制权。
- **环境事实（防误设）**：`balsa.dev` 不属于本 effort——apex 现为第三方个人站，`docs.balsa.dev` 落在其 Cloudflare zone 内（520）。域名选型不得以 `balsa.dev` 为默认前提。

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

### 3.4 临时域阶段（正式域未定）

- 允许站点跑在平台默认域（`balsa-docs.<account>.workers.dev`）上；**临时域不承诺 URL 稳定**：只有正式域的 URL 进重定向台账。
- 切换 PR 的改动面（一次性）：`site` 值 / canonical / `sitemap` 生成 / robots 与 sitemap 内域 / 台账补条目（若临时域已对外公开过）。
- 禁：把临时域写进对外材料（README 之外的传播面不出现）。

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
- `_headers` / `_redirects` 随产物进入每个部署（含预览）——预览上可验收台账行为（§10 待实测确认）。

## 5. 校验与 CI 归属

- **关卡全在仓库内脚本 + GitHub Actions**，与 balsa-framework 的 `pnpm verify` 先例同构；平台构建不承担校验职责（避免校验逻辑两处漂移）。
- **Actions 职责**：① frontmatter schema 值域、`packages` 与 `exports` 一致、原料指针可解析（stack.md §5）；② §4.2 的台账四条；③ 链接检查（含锚点存活，选型属实施）；④ TypeDoc 再生成 + `git diff --exit-code` 红门（api-reference.md §6）；⑤ 钉 SHA 新鲜度黄灯。
- **平台职责**：构建、预览、托管、回滚。**硬要求**：平台构建路径不得需要 balsa-framework checkout——TypeDoc 插件只在固定路径（`.framework/balsa-framework`）的 dist 存在时启用，否则只消费入库树（api-reference.md §4 的入库模式），产物因此自包含。（#18 时点的 `BALSA_TYPEDOC_REGEN=1` 措辞已作废：#20 落地为「钉定 checkout 在即生成」，平台侧无该目录即自然跳过；侧栏也从同一机制取得快照。）
- 预览构建天然是第一道「构建即校验」门（内容集合 schema 在 `astro build` 期生效），但红线判定只在 Actions。
- **落地形态（#18）**：`.github/workflows/verify.yml` 两个 job——**Repo gates**（`pnpm verify`：typecheck → 单测 → frontmatter 值域 → 构建期 frontmatter 反例 → 台账四条 → build → 路由断言 → 生成器幂等）+ **Pinned-ref gates**（`pnpm verify:pin`：checkout balsa-framework @ 钉定 SHA → 漂移 diff + `packages`/`exports` 一致 + 原料指针可解析）。前者不需要框架 checkout，后者必带；红线与黄灯尚未接的关卡（③ 链接检查、④ TypeDoc 再生成、⑤ 钉 SHA 新鲜度）按各自切片落地。
- **落地形态（#20 补全）**：增第三个 job **API tree gates**（`pnpm verify:api` + `pnpm check:pin-freshness`）——checkout balsa-framework @ 钉定 SHA 到固定路径 → 构建 `@balsa/core` dist → TypeDoc 零错零警告 pass → 重生成 → `git status` diff 门；新鲜度黄灯（⑤）以 `continue-on-error: true` 挂同一 job。
- **落地形态（#26 补全）**：agent 面三条断言（[agent-surface](./agent-surface.md) §9）接进 **Repo gates** 的 `pnpm verify`——`build` 之后跑 `scripts/check-agent-surface.mjs`，读 `dist/` 断言 twin 覆盖、`/llms.txt` 与 `/llms-manifest.json` 对内容集合、写作规则 ①②；生成器另挂在 `pnpm build` 的构建尾（产物不入库）。至此 ④/⑤ 已接，**只剩 ③ 站内链接检查（含锚点）**：本片只覆盖了 `/llms.txt` 的内部链接（断言 ②），全站链接检查的选型与落地仍归 #28。

## 6. 预览部署

- 每个 PR 自动出预览（URL 由平台以 PR 评论给出）；**公开可访问**，不做认证；后续若出现未发布内容风险，再启用 Cloudflare Access 锁预览（免费档可用、不影响生产域）。
- 平台自动为预览加 `X-Robots-Tag: noindex`；预览 URL 不进 sitemap、不参与 canonical、不对外传播。
- 仅同仓库 PR 有预览（fork PR 无预览）；本仓库公开，红线关卡不依赖预览，故不影响外部贡献的正确性。

## 7. 遥测与隐私口径

- **首发零遥测**：不装任何分析脚本、不引入同意横幅、不设第三方 cookie，也不引入任何营销像素（GA 类一律不引）。
- 日后若启用（另立票裁决），准入条件：无 cookie、无个人标识（不做跨站追踪 / 指纹）、兼容「优先免 SaaS」取向（自托管 GoatCounter / Umami > 平台自带 CF Web Analytics）。
- 因零遥测，站点不设独立隐私声明页；启用遥测的 PR 需同 PR 补声明。
- 地图上「分析 / 遥测」雾点由本裁决关闭（不再是未议点）。

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

## 10. 待实测（交建站，与 #9 的实施清单同批）

1. Workers Builds 的 Node / pnpm 钉法生效规则（`.nvmrc` / `NODE_VERSION` / `packageManager`）。
2. 各扩展名默认 `Content-Type` 实测（`.md`、`.txt`、无扩展名）；不符合 #11 目标时用 `_headers` 覆盖（含 `!` 去重复头）。
3. `_redirects` / `_headers` 在**预览部署**上生效的实测。
4. 临时平台域上 `site` / canonical 的过渡形态，与正式域切换 PR 的真实改动面。
5. 平台侧构建缓存命中情况（含 `node_modules/.astro`）。
6. 自定义域接入（CNAME / zone 内自动记录）与证书签发在选定 apex 上的实测。
7. 回滚实操：Worker Versions 回滚后产物与 `_redirects` 一致。
8. Pagefind 在平台构建下的索引产物完整性（搜索为零 SaaS 依赖，必须随构建产物发布）。

## 11. 交接注记

- **给 #11**：平台事实（一手）——静态资产请求不限量，**只有 Worker 脚本被调用才计费**；免费档下脚本超额会 429 而非回落静态资源，故「加脚本」是一次需要单独评估的动作（`run_worker_first` 只在明确需要 Accept 协商 / MCP 时启用）。`_headers` 可覆盖 `.md` 的 Content-Type（目标值由你裁，实测项见 §10.2）；`.md` 与 HTML 路由不冲突（`html_handling` 只作用于 HTML）；预览默认 noindex 可直接依赖。
- **给 #12**：托管与视觉无耦合；`_headers` 的 immutable 缓存条目在建站时随资产指纹落地；不需要为品牌引入任何平台依赖。
- **给 #13**：checklist 增七项——① `.nvmrc` + `wrangler.jsonc`（assets 段）落地；② `redirects.json` + 生成器 + §4.2 四条关卡；③ Actions 工作流（关卡 + TypeDoc 红门 + 黄灯）；④ 预览 / 生产 / 回滚各验一次；⑤ 正式域落地 PR（§3.4，依赖 balsa-website 域名票）；⑥ npm 0.1.0 切换 PR（§8）；⑦ 平台侧 `_headers` 三条（`.md` / `llms.txt` / `/_astro/*`）。
- **给建站 effort**：本规范即施工图；§10 的八条实测在首次上线时逐条落笔（与 #9 的实施清单同批）。

## 12. 退出路径

- 内容、URL、台账、头文件全是仓库资产；换平台 = 换一个配置文件（`_redirects` ↔ `vercel.json` ↔ `netlify.toml`）+ 生成器的一个后端分支，不触发内容改动。
- CF 内 Pages ⇄ Workers 迁移 = 配置小改（`assets.directory` ↔ `pages_build_output_dir`）。
- 平台默认域不承担对外承诺，故换平台不产生 URL 迁移债。

---

> **实施注记（#18）**：§4.1 / §4.2 / §5 的「落地形态 / 实现形态」为建站切片 #18 的实测回填——台账值域与生成器模式、四条关卡的脚本与 baseline 语义、Actions 两个 job。机制与关卡数未变，只把「怎么做」写成唯一一份；平台侧仍待实测的八项（§10）不动。

_由 [决策:交付与部署](https://github.com/0xnicholas/balsa-docs/issues/10) 产出（2026-09-30）；平台事实见 `docs/research/hosting-facts.md` @ `research/hosting-facts`（commit `db1d78e`）；栈级前提见 [stack.md](./stack.md) §3.2 / §6 / §10。_
