# Balsa Docs

balsa 伞形品牌下全部子项目的公开文档站（英文优先）。本文件是项目术语表——只放定义，不放实现细节与架构决策（决策在 `docs/adr/`，交付规范在 `docs/spec/`）。

## Language

**文档站 (Docs site)**:
balsa 及未来子项目的公开文档站：承载上手、指南、概念与参考的单一站点，面向框架使用者；内容为英文优先的用户向叙事。
_Avoid_: 网站（泛指）、营销站（那是 balsa-website 的领域，见其 CONTEXT.md）

**上手面 (Onboarding surface)**:
子项目对外可用的第一道门：quick start + 指南 + 参考。文档站是其承载；Studio 类交互产品面不在其中（出域档，见 balsa-framework ROADMAP）。
_Avoid_: 把上手面等同于 README（README 只是发布前的临时承载）

**规范 (Spec)**:
本 effort 的交付物形态：把文档站的全部未决点定成唯一答案、交接到可直接建站的文件集，落在 `docs/spec/`。
_Avoid_: 方案、设计稿（暗示还有未决艺术问题）

**内容族**: 站点内容的五个所有权族:Get started / Concepts / Guides / Reference / Project & ecosystem。切分轴是 ownership(谁拥有这条内容),页面结构不决定归属;每页归属唯一族。
_Avoid_: 页面类型、内容分类(暗示按排版切)、栏目/车道(那是导航形态,归 IA 裁决)

**英文 Glossary (English glossary)**: 站点公开的英文术语页(P2 上线),全站写作的 canonical 用词唯一公开来源;上游是 balsa-framework 的 CONTEXT.md(中文、内部、不直接公开)。
_Avoid_: 与 CONTEXT.md 互指混用(后者是内部中文术语表,前者是其公开英文改写面)

**多项目缝 (Multi-project seam)**:
文档站为未来子项目预留的接入机制（URL 维度 + 导航维度 + 内容目录约定）：只定机制、不搭空架。
_Avoid_: 多租户、站点群（都不指向同一概念）

**默认项目 (Default project)**:
文档站的首个内容项目（balsa framework），独占无前缀的 `/docs` URL 空间与 `docs` 内容 collection；子项目接入不改变它的形态。
_Avoid_: 主项目、旗舰项目（暗示项目间有层级，而这里只有 URL 约定）

**项目 slug (Project slug)**:
子项目接入文档站时的唯一短名，决定其 URL 前缀 `/<slug>/docs/` 与内容 collection 名；默认项目不设 slug。
_Avoid_: 项目 ID、命名空间（都不是这个概念）

**内容真相源 (Content source of truth)**:
每条进入站点的内容的权威出处与改写规则：内部工程文档留在 balsa-framework，仅作改写原料；站点自身内容以 balsa-docs 仓库内的 Markdown/MDX 为唯一真相。
_Avoid_: 同步、镜像（暗示自动复制而非改写）
