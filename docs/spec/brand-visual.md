# 品牌与视觉规范

> **状态**：已裁决 v1.0，由 [决策:品牌与视觉](https://github.com/0xnicholas/balsa-docs/issues/12) 产出（2026-09-30，grilling 两轮 + [原型:品牌视觉对照](https://github.com/0xnicholas/balsa-docs/issues/16) 实物反应定案）。
> **上游**：[决策:技术栈](./stack.md)（§4 组合清单、§9 硬边界）、[决策:IA 与多项目缝](./ia.md)（§2 Introduction 兼 landing、§7 站点树）、[决策:agent 面向约定](./agent-surface.md)（§6 组件总则）、[原型:品牌视觉对照](https://github.com/0xnicholas/balsa-docs/issues/16)（实物 `prototype/brand-visual` @ `9eab245`）、ADR [0003](../adr/0003-theme-customization-boundary.md)。
> **消费**：[收尾:规范核对与交接口径](https://github.com/0xnicholas/balsa-docs/issues/13)（建站 checklist 与验收）、建站 effort、balsa-website / 伞形品牌 effort（品牌接入点）。
> **不重开**（地图口径）：覆盖机制登记制；首发覆盖数 = 0；系统字体栈、禁外部 CDN；占位策略（不发明可被推翻的锁定图形）。

## 1. 立场与范围

- **交付边界**：本规范 = 品牌与视觉的全部可执行约定；实物资产（favicon / OG 图 / 真 logo）、组件代码与截图复拍归**建站 effort**（地图 Out of scope ①）。
- **三条立场**：
  1. **默认主题 + token 层承载品牌观感**——品牌表达力让位于升级安全（ADR-0003）；
  2. **实物先于裁决**——所有取值由原型对照定案（#16），本规范只钉结论与理由；
  3. **接缝用登记表表达**——与营销站 / 伞形品牌的衔接 = 品牌接入点（§3），跨 effort 不阻塞。
- 硬边界（内建面 / 自研面 / 受控覆盖 / 禁 fork 上游内部实现）见 [stack.md §9](./stack.md)，此处不复述。

## 2. 视觉基准（#16 实物反应定案）

### 2.1 色板 = A 琥珀（Amber，hue 36°）

| 主题 | 链接 / 文字 accent | 实测对比度 |
| --- | --- | --- |
| 亮 | `accent` = `#9e630a`（hsl 36, 88%, 33%） | 4.86:1（暖纸底）/ 4.95:1（纯白底） |
| 暗 | `accent-high` = `#efd29f`（hsl 38, 72%, 78%） | 11.88:1 |

**贴线理由（连同理由钉住）**：亮色 accent 刻意贴 WCAG AA 线（4.6–5.0:1），不是待优化项——暖色 accent 一旦「安全」到明显超线，就离不再是琥珀只差一步。**数值变更须动本规范**，不得在实施或维护中「顺手」调深 / 调浅。

### 2.2 深度 = accent + warm neutrals（覆盖数 = 0）

三级原型对照（`token-only` / `+ warm neutrals` / `+ 1 override`）结论：暖木感主要来自**中性色阶**；accent 单点只到「默认主题 + 一个暖 accent」；`+ 1 override`（Footer 品牌带）增量可见但推迟（§4）。

**权威 token 集**（真站手写，值即此表）：

```css
/* dark */
--sl-color-white: hsl(35, 15%, 97%);
--sl-color-gray-1: hsl(35, 12%, 92%);
--sl-color-gray-2: hsl(35, 8%, 77%);
--sl-color-gray-3: hsl(35, 7%, 58%);
--sl-color-gray-4: hsl(35, 7%, 38%);
--sl-color-gray-5: hsl(35, 8%, 24%);
--sl-color-gray-6: hsl(35, 10%, 16%);
--sl-color-black: hsl(30, 12%, 10%);
--sl-color-accent-low: hsl(36, 45%, 20%);
--sl-color-accent: hsl(36, 82%, 55%);
--sl-color-accent-high: hsl(38, 72%, 78%);

/* light */
--sl-color-white: hsl(30, 14%, 12%);
--sl-color-gray-1: hsl(35, 15%, 16%);
--sl-color-gray-2: hsl(35, 12%, 24%);
--sl-color-gray-3: hsl(35, 10%, 38%);
--sl-color-gray-4: hsl(35, 10%, 55%);
--sl-color-gray-5: hsl(35, 15%, 80%);
--sl-color-gray-6: hsl(35, 20%, 93%);
--sl-color-gray-7: hsl(35, 30%, 98%);
--sl-color-black: hsl(36, 40%, 99%);
--sl-color-accent-low: hsl(38, 85%, 90%);
--sl-color-accent: hsl(36, 88%, 33%);
--sl-color-accent-high: hsl(36, 84%, 23%);
```

- **派生量不手写**：`--sl-color-text-accent`（暗 = accent-high、亮 = accent）、`--sl-color-text-invert`、`--sl-color-bg-accent` 沿 Starlight 原映射。
- `--sl-color-gray-7` 仅有亮色语义（暗色无此槽）——原型生成器对暗色顺带输出同值无害，真站手写时省略。
- **实现事实（#16 已核）**：token 层实测触达 `h1` / 正文 / 链接 / 行内 code / 代码块外框 / 侧栏当前项——浏览器计算值 = 生成值，无上游硬编码逃逸；侧栏当前项是全页最响的 accent 面（亮 = accent 底 + 白字 4.86:1；暗 = accent-high 底 + 深字），行为与上游一致（上游即以 `--sl-color-text-accent` 作底），非本地发明。

### 2.3 `/docs` landing = `template: splash`（照原型落地）

- 形态：hero（站名 + tagline + 两个动作按钮）+ 卡片格 + 代码块；**全部内建组件、零覆盖**。
- 结构基线：`prototype/brand-visual` 的 `src/content/docs/docs/index.mdx`（亮暗两主题均成立）。
- hero 与卡片**文案（英文）**归建站 effort 撰写（内容清单见 [content-inventory.md](./content-inventory.md) / [content-boundary.md](./content-boundary.md)）；动作按钮目标取首发页（ia §2 / §7）。

## 3. 品牌资产与接入点（占位策略）

### 3.1 接入点登记表（首发 = 全占位）

| 接入点 | 首发占位 | 替换来源 | 覆盖计数影响 |
| --- | --- | --- | --- |
| logo 槽 | 文字站名「Balsa」（Starlight `title`）；图片槽留空 | 伞形品牌 effort | Starlight `logo` 配置属内建面，**不算覆盖**；若品牌需自定义构成（如覆盖 `SiteTitle`）才走覆盖清单登记 |
| favicon | 单字形「b」SVG、透明底、亮暗双值（`#9e630a` / `#efd29f`，`prefers-color-scheme` 切换）、无发明图形 | 同上 | 无 |
| 字体 | 系统字体栈（§3.2），`--sl-font*` 槽保留 | 同上（一次替换） | 无（token 层） |
| 默认 OG | 一张静态 1200×630 图：文字站名 + 一句 tagline、暖中性底；全站通用 | 同上 / 营销站 OG 体系（并轨） | 无 |
| accent hue | A 琥珀（hue 36°，§2.1） | 伞形品牌色若与琥珀冲突，换色 = 重跑 §5① 审计并动本规范 | 无（token 层） |

实物产出（favicon / OG 图 / 真 logo）**不在本 effort**；本规范只钉形态约束，使验收口径③有可检验对象。

### 3.2 字体栈

- 正文与代码均沿 **Starlight 默认系统字体栈**：不覆盖 `--sl-font` / `--sl-font-mono`。
- `--sl-font*` 槽位保留，供品牌字体一次替换。
- **禁外部 CDN 字体**（与「优先无 SaaS / 无外部运行时依赖」相悖）；品牌字体接入时同样自托管或系统栈。

### 3.3 基础视觉面

- **暗色模式**：`ThemeSelect` 默认 `auto` + 保留切换按钮；亮 / 暗均为验收面（§5④）。
- **代码高亮**：保留 Expressive Code 默认主题对——语法色与 diff 高亮**不随色板走**，仅代码块外框吃 token。
- **`theme-color` meta**：亮 / 暗双值 = 各自主题 `--sl-color-black` 的解析值（亮 `#fdfdfb` / 暗 `#1d1a16`），构建期随 token 注入。
- 404 / Pagefind 面板 / 生成 API 页：全部吃 token，不单独定制（随 §5④ 抽检）。

### 3.4 与营销站的接缝（跨 effort）

- 地图「未议雾点」：品牌 token 接缝待 balsa-website effort 推进后定；本站只保证 §3.1 的接入点存在，且**替换成本 = 改 token + 换资产，不改结构**。
- 域名形态与协调清单见 [delivery.md §3](./delivery.md)（本规范不重复）。

## 4. 覆盖清单（现状 = 0）

- **机制**（[stack §9](./stack.md) + [ADR-0003](../adr/0003-theme-customization-boundary.md)）：`components:` 覆盖每项**登记在册**；**新增覆盖须动本规范**；升 Starlight 时逐项复验；**禁止** fork / 接管非覆盖槽位的上游内部实现。
- **现状表**（交接物⑥需携带）：

| # | 覆盖槽位 | 用途 | 登记 |
| --- | --- | --- | --- |
| — | （空——首发覆盖数 = 0） | — | — |

- **未取路径（第一候选，增量）**：`Footer` 品牌带（含 logo 占位槽）；实物存档 `prototype/brand-visual` 的 `src/components/BrandFooter.astro`。触发条件 = 品牌资产到位或确认需要该处观感增量；纳入时走「登记 + 本规范变更」。
- 自研 Astro 组件（非覆盖槽位）不受此表约束，但不得 fork 上游内部实现（stack §9）。

## 5. 验收口径（建站 effort，六条）

1. **token 层**按 §2.2 落地；亮 / 暗色板过 WCAG AA（正文 / 链接 / accent）。**机器化**：移植 `prototype/contrast-audit.mjs`（配置收敛为「A 琥珀 × warm × 2 主题 × 8 对」= 16 项：正文、标题、链接 × 页面底，正文与链接 × nav/侧栏面，accent-low chip，按钮反字，muted meta——#19 落定时按此八对逐项对上，措辞的歧义在此消去），退出码作构建期 CI 门——非人工声明。
2. **覆盖清单为空且机制存在**（§4；新增覆盖须动本规范）。
3. **favicon + 默认 OG + `theme-color` meta 随构建产出**（形态见 §3.1 / §3.3）。
4. **页面类型抽检**（亮 / 暗各一次）：文档页 / splash landing / 生成 API 页（239 页生成树抽 1）/ 404 / Pagefind 面板。
5. **无 CLS、无与「轻量」冲突的运行时资产**。
6. **交接物含亮暗截图 + 覆盖清单现状表**（截图基线 = 原型 15 张，`.screenshots/`；复拍按同一页面集）。

**实测回填（#28）**：六条全部跑完。执行者 = `pnpm verify`（①②③ 的机器面）+ `pnpm shots`（④⑤⑥ 的浏览器面，`scripts/shoot-acceptance.mjs`），证据入库 `.screenshots/`：

1. `scripts/check-contrast.mjs` 的 16 项在 `pnpm verify` 里全绿（亮暗 × 八对）。
2. 覆盖数 = 0 且机制在位：`check-brand.mjs` 断 `astro.config.mjs` 无 `components:` 键（现状表见 §4，唯一一份；新增覆盖仍须动本规范）。
3. 三个占位资产随构建产出：favicon 双值随 `prefers-color-scheme` 切换、`og.png` 1200×630、两个 `theme-color` 值 = §2.2 反算值——同一关卡逐项断言。
4. 五类页面 × 亮暗 = **10 张截图**（`docs-page` / `splash` / `api-page` / `notfound` / `search-panel` × `light` / `dark`），生成 API 页抽的是 `/docs/reference/api/workflows/functions/createworkflow/`（238 页里抽 1）；拍摄条件 = 原型脚本的 1440×900、DPR 2、`prefers-color-scheme`。
5. **CLS 逐页实测 = 0.00000**（10 个页态，重跑三次一致；阈值 0.01，超出即该脚本红）。脚本把每次 shift 的 value / 来源元素 / 时刻都写进 `.screenshots/acceptance.json`（本次全部为 `shifts: []`）——所以阈值一旦被越过，证据本身就能指出是谁在动。（本片早期一次运行曾报生成 API 页暗色态 0.43，当时脚本还没记来源，重跑未能复现；记录来源就是为了下次能定位。）运行时资产 = 每页 6–11 个**同源**请求（含 Pagefind 的 runtime / wasm），**零外域请求**——§5⑤ 的两半出自同一次扫描。
6. 截图 + 覆盖清单现状表进交接物：见 [handoff](./handoff.md) §3.6。

**关于「原型 15 张 → 本版 10 张」**（复拍口径的诚实说明）：原型 15 张 = 文档页骨架 **9 张**（`docs-a-warm-*` 2 + `docs-a-tokenonly-*` 2 + `docs-a-override-light` 1 + `docs-b-warm-*` 2 + `docs-c-warm-*` 2——同一页面的色板 / 深度变量对照）+ splash 2 + 404 2 + **原型专属**的色板对照页 2。真站只有一套已定色板，故文档页只留入选的那一组（亮暗各一）；色板对照页在真站不存在，换为 §5④ 另要求的两类（生成 API 页、Pagefind 面板）亮暗各一张——共 10 张。两处替代写明：文档页抽的是 `/docs/get-started/quickstart/`（原型抽的是 `prototype` 的文档骨架页 `/docs/concepts/streaming/`，真站无此页），生成 API 页从 238 页里抽 `/docs/reference/api/workflows/functions/createworkflow/`；其余拍摄条件与原型脚本逐项一致（1440×900、DPR 2、`prefers-color-scheme`）。

## 6. 建站交接

- **资产指针**：`prototype/brand-visual` @ `9eab245`——
  - `src/lib/brand-tokens.mjs`：token 源与对比度函数（原型便利品；真站按 §2.2 手写即可）；
  - `prototype/contrast-audit.mjs`：AA 审计门（移植对象，§5①）；
  - `.screenshots/`：15 张亮暗基线（含色板对照页、404）；
  - `src/components/BrandFooter.astro`：未取的 +1 覆盖候选（§4）；
  - `astro.config.mjs` / `src/styles/global.css`：组合照 [stack §4](./stack.md)；**浮动切换条不进真站**（原型 dev only）。
- **落地顺序**：token 与字体 → §3.1 占位（favicon / OG / `theme-color`）→ `/docs` splash → 覆盖清单现状表进交接物。
- **关联约定**：建站 checklist 归 [#13](https://github.com/0xnicholas/balsa-docs/issues/13)；组件选择须满足 [agent-surface §6](./agent-surface.md)（不出「Markdown 等价物不可接受」的组件；「Copy as Markdown」为可选升级项）。
- **已知缺口（归建站实测 / 产出）**：Pagefind 面板亮暗观感未截（dev 无索引，`astro build` 才产出，归 #27）——**#28 已截**（`search-panel-{light,dark}.png`，索引取 `pnpm build` 产物：`pnpm shots` 起真实浏览器打开面板并检索）；favicon / OG 实物已由 #19 产出占位版（形态见 §3.1）。

## 7. 未决与后续

- **逐页 OG**：P2（静态托管下只能构建期生成；营销站 OG 体系时并轨）。
- **品牌 token 接缝**：跨 effort（balsa-website），不阻塞本站（§3.4）。
- **`+ 1 override`（Footer 品牌带）**：后续增量路径（§4）。
- **zh 站内语言面**：英文优先已定；中文翻译出域。

---

_由 [决策:品牌与视觉](https://github.com/0xnicholas/balsa-docs/issues/12) 产出（2026-09-30）；实物与实测见 [原型:品牌视觉对照](https://github.com/0xnicholas/balsa-docs/issues/16)（`prototype/brand-visual` @ `9eab245`）；定制边界记于 [ADR-0003](../adr/0003-theme-customization-boundary.md)。_

> **实施注记(#19)**：§2.2 的 token 集手写进 `src/styles/global.css`（无层规则，压过 Starlight 的 `@layer starlight.base`；派生槽仍由 Starlight 映射）；§2.3 的 splash 按结构基线落 `/docs`（`title: Introduction` + `hero.title: Balsa`，hero + CardGrid + 代码块，全内建组件），覆盖数保持 0；§3.1 三个占位实物产出——`public/favicon.svg`、`public/og.png`（1200×630，源 `src/assets/og.svg`）、`theme-color` 双值（构建期从同一份 CSS 解析）；§5① 的 16 项审计落 `scripts/check-contrast.mjs` 并进 `pnpm verify`/CI，亮/暗实测回填在 [stack.md](./stack.md) §13.9。hero 与卡片文案（英文）由本片按框架事实先落位（结构同原型，代码块取框架 README quick start 的 `verbatim` 切片），终稿归内容切片 #21。
>
> **实施注记(#28)**：【最终验收已跑完】§5 增「实测回填（#28）」块：六条的实测值、截图集与复拍口径（原型 15 张 → 本版 10 张的对应关系）都在那一块；§6 的 Pagefind 面板截图缺口关闭。本片产物是 `scripts/shoot-acceptance.mjs`（`pnpm shots`；零依赖的静态服务 + 全局 Playwright，不进 CI——CI 无浏览器）与入库的 `.screenshots/`（10 张 PNG + `acceptance.json`）。**规范性内容零改动**：§2/§3/§4 的取值与机制未动，覆盖数仍为 0。
