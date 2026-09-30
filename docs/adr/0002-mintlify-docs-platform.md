# 文档站采用 Mintlify 托管平台（内容仍 docs-as-code）

balsa 文档站采用 **Mintlify**（托管 SaaS + docs-as-code：MDX 与 `docs.json` 留在 balsa-docs 仓库，构建、托管、搜索、agent 端点、校验在平台侧），换取内核级 agent 面向（每页 `.md`、`llms.txt`、MCP）、TypeDoc JSON → `sdk` 导航的原生 API 参考路径与免自建的低维护托管。**这显式覆盖了本 effort 此前两则取向**：「优先无 SaaS」与「不引新栈 / Astro 生态复用」——运行时层不可自托管（唯一路径为 Enterprise），站内搜索是平台 SaaS，定制上限为 9 主题 + token/CSS/MDX 层组件（无布局接管）。Starter $0 起步（含自定义域），OSS Program 若获批则免费用 Pro（预览部署与平台侧 CI checks）。退出路径：内容、组件与重定向台账数据可携，站点外壳（导航/主题/搜索/agent 端点）需重搭——Starlight 备料已存 `research/starlight-feasibility` 分支，官方 headless 路线（自建 Astro 前端 + Mintlify 内容/搜索）为正式备选。触发复盘：涨价/条款变动、重大事故、OSS Program 被拒且 Pro 能力成刚需、平台停运。规范本体见 `docs/spec/stack.md`。

## Considered options

- **Mintlify**（选定）：agent 面向与 API 参考现成度最强、托管省维护、0 成本起步；代价是结构性 SaaS 依赖与定制上限。
- **Astro Starlight**：唯一不引新栈 + 默认无 SaaS 搜索（Pagefind）；agent 面向靠自建/社区插件，内容目录被内核硬固定（`src/content/docs`）。
- **Fumadocs**：agent 面向内核级，但 React 优先，i18n/路由自建，无整树 API 参考路径。
- **Docusaurus 3**：版本化/i18n 最成熟、与参照物 mastra 同栈，但搜索走 Algolia（SaaS），与既有站点零生态复用。

## Consequences

- 目录与 URL：内容根 `content/docs/`、站点 base path `/docs`（dashboard 配置，非目录名）；多项目缝由「单站点多 collection」改为「每子项目一个 Mintlify project 挂 `/<slug>/docs` 子路径」。
- 重定向语义为 **308/307**（非 301），台账数据落在 `docs.json` 的 `redirects[]`，CI 关卡为 `mint broken-links --check-redirects`。
- 校验由仓库 CI 的 `mint` CLI + 自写脚本（frontmatter、钉 ref 漂移、API JSON 新鲜度）构成；平台侧 checks 属 Pro。
- 仓库内非站点文件（`CONTEXT.md`、`AGENTS.md`、`docs/spec/**`、`docs/research/**`、`docs/adr/**`、`docs/agents/**`）必须由 `.mintignore` 排除，防内部文档外泄（#6 §3 竞品红线的仓库侧防线）。
- 平台风险已入账：GitHub App 权限（建议 only-select-repositories）、2024-03 token 泄露事故、2025-11 静态资源 XSS、CLI 许可 Elastic-2.0。
- 退出路径与复盘触发条件见 `docs/spec/stack.md` §12。
