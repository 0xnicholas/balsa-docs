# 默认项目无前缀,子项目以 slug 前缀接入

文档站的首个内容项目(oribos framework)是**默认项目**,独占无前缀的 `/docs` URL 空间与 `docs` 内容 collection;未来子项目接入时才获得 `/<slug>/docs/**` 前缀与独立 collection。备选「现在就给 oribos 挂 `/oribos/docs` 前缀」被否决:为一个不存在的项目让当前所有 URL 变长,而 oribos 品牌即站点本身。代价:若未来想给默认项目补前缀需全站重定向——可接受,因为重定向台账已是站点基本设施(见 `docs/spec/ia.md` §3)。

## Considered options

- **默认项目无前缀 + slug 缝**(选定):URL 短,机制完整,切换器隐藏即可。
- **全员前缀**(`/oribos/docs`):投机性结构,当前唯一项目无收益。
- **只定内容目录、URL/导航留白**:缝不完整,接入时仍要裁 URL 与导航。

## Consequences

- slug 命名空间从第一天受保护:顶层路径 `v<数字>` 与单段 slug 形态都是预留(版本化与子项目)。
- 英文 Glossary 站级共享一份(默认项目维护),子项目只引用不另建。

## 修订记录

- **修订(更名 oribos,2026-10-03)**:默认项目的名字随伞形品牌更名 balsats → oribos(`balsats framework` → `oribos framework`、默认 `project` slug `balsats` → `oribos`)。本 ADR 的决策——默认项目无前缀、子项目走 `/<slug>/docs/**`——一字未动;更名映射与落地面见 `docs/spec/delivery.md` 的实施注记(#48)。
