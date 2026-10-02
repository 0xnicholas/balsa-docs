# 主题定制边界：token 层 + 登记制覆盖，禁止 fork 上游

balsa 文档站的品牌视觉只经 **CSS 自定义属性（`--sl-*`）** 落地：首发覆盖数 = 0，暖木色板（accent + 中性色阶）与 splash landing 全部由 token 与内建组件承载。允许的例外是 Starlight `components:` 覆盖槽位，但每项**登记在册**、新增覆盖是一次需要动 `docs/spec/brand-visual.md` 的显式动作；**禁止** fork / 接管非覆盖槽位的上游内部实现。实质是拿表达力换升级安全：token 层随 Starlight 升级零成本跟随，覆盖逐项复验，fork 则锁进上游实现。原型三级对照（[#16](https://github.com/0xnicholas/balsats-docs/issues/16)，`prototype/brand-visual` @ `9eab245`）证明 token 层足够——暖木感主要来自中性色阶，一处 Footer 覆盖的增量可见但不值首个覆盖名额，已存档为后续增量路径。规范本体见 [docs/spec/brand-visual.md](../spec/brand-visual.md)。

## Considered options

- **token 层 + 登记制覆盖**（选定）：原型三级对照中 `+ warm neutrals` 与 `+ 1 override` 的观感差小，而前者升级成本为零；覆盖机制保留，只是计数从 0 起。
- **`+ 1` Footer 品牌带**（推迟未取）：含 logo 占位槽的可见增量，实物 `src/components/BrandFooter.astro` 存档在 `prototype/brand-visual`；作为第一个覆盖名额的候选，触发条件 = 品牌资产到位或确认该处观感增量。
- **深定制 / fork 上游组件**：表达力最强，但升级即迁移，与「零运行时锁定」取向相悖，否决。

## Consequences

- **覆盖数成为可检查契约**：建站验收口径②「覆盖清单为空且机制存在」；升 Starlight 时逐项复验覆盖清单（`docs/spec/brand-visual.md` §4）。
- **品牌接入点**（logo 槽 / `--sl-font*` / favicon / 默认 OG / accent hue）是替换点：品牌资产到位时只改 token 与资产，不动结构。
- 观感数值（色板与贴线理由）回流 [品牌与视觉规范](../spec/brand-visual.md)；数值变更须动规范，不得在实施中顺手调整。
