# 文档站采用 Astro + Starlight（先采用 Astro；Mintlify 评估后否决）

balsa 文档站采用 **Astro 7 + Astro Starlight**：内容 docs-as-code 留本仓库、纯静态构建、搜索用内置 Pagefind（零 SaaS）、i18n 一等公民、agent 面向（每页 `.md` 与 `llms.txt`）有现成插件路。与既有三站（Astro 7 + Tailwind 4）同工具链，「不引新栈」与「优先无 SaaS」两条取向同时成立。本票曾在 Round 1 定向 **Mintlify**（托管 SaaS，换取内核级 agent 面向与 TypeDoc JSON → `sdk` 导航的现成路），Round 2 后用户决议反转：**放弃 Mintlify，先采用 Astro**——否决理由是运行时不可逆（自托管与静态导出仅在 Enterprise，起步规模约 45–60 vCPU）、定制上限（9 主题锁死、无布局接管）、关键能力（预览部署与平台侧 CI checks）位于 $450/mo 的 Pro 档且依赖 OSS Program 资格；对 Apache-2.0 开源项目的公开面，这三条代价不被其收益抵平。Mintlify 记为**未来备选**，内容保持平台中立（标准 MDX + frontmatter，不为迁移预加抽象），完整平台事实存 `docs/research/mintlify.md` @ `research/mintlify`。规范本体与三处实测变通见 `docs/spec/stack.md`。

## Considered options

- **Astro + Starlight**（选定）：唯一不引新栈 + 无 SaaS 搜索 + i18n 一等公民；agent 面向的 `.md`/llms.txt 有现成插件（实测推翻了「无每页 `.md`」的早期结论），MCP 与内容协商为自建项；API 参考有同生态 `starlight-typedoc`。代价：内容集合路径被内核固定、`/docs` 前缀需嵌套目录变通、静态重定向非真 301（归托管层）。
- **Mintlify**（评估后否决）：agent 面向与 API 参考现成度最强、托管最省心；否决理由见上（运行时不可逆 / 定制上限 / Pro 付费能力）。
- **Fumadocs on Astro**：agent 面向内核级（llms.txt / 每页 `.md` / MCP 全内置），但需 `@astrojs/react` 桥、手写路由、i18n 自建，且无整树 API 参考现成路。
- **Docusaurus 3**：版本化/i18n 机制最成熟、与参照物 mastra 同栈，但官方搜索走 Algolia（SaaS）、swizzle 定制耦合上游、与既有生态零复用。

## Consequences

- 三处实测变通写进规范（内容集合固定 `src/content/docs`、`/docs` 嵌套目录 + 根重定向、真 301 归托管层）；IA §5 的 `content/docs/` 措辞随之修正。
- frontmatter 必填与值域由 Astro 内容集合 schema（Zod）承载，跨文件规则由自写脚本兜底；#6 §4 的「无 SaaS：校验脚本 + CI 关卡」维持原样。
- agent 面：每页 `.md` 走 `starlight-dot-md`、`llms.txt` 走 `starlight-llms-txt`（二者均只认默认 `docs` 集合，子项目需自建）；MCP 与内容协商归 #11 裁量。
- 多项目缝由「单站点多 collection」改为「自建集合 + 路由页 + `<StarlightPage>`」（侧栏需显式声明）。
- 退出路径零运行时锁定；Mintlify 若重提，从 `research/mintlify` 报告起步。
