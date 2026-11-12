---
name: GitHub Hot
description: 深墨橙工程索引与黄黑导视融合的 GitHub 热榜浏览系统
colors:
  signal: "#f4ce46"
  canvas: "#f5f3ed"
  canvas-dark: "#191d1b"
  surface: "#fbfaf6"
  surface-dark: "#242925"
  line: "#d9dcd3"
  line-dark: "#383f39"
  ink: "#202421"
  ink-dark: "#eeeee5"
  accent: "#c2410c"
  accent-dark: "#fb923c"
  muted: "#61685f"
  muted-dark: "#acb5a9"
  focus: "#a65016"
typography:
  headline:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  body:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "0.875rem"
    lineHeight: "1.5rem"
  label:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "0.75rem"
    lineHeight: "1rem"
  data:
    fontFamily: "ui-monospace, SFMono-Regular, \"SF Mono\", Menlo, Consolas, \"Liberation Mono\", monospace"
    fontSize: "0.75rem"
    lineHeight: "1rem"
    fontFeature: "tnum"
rounded:
  sm: "2px"
  default: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  control: "16px"
  gutter: "20px"
  section: "24px"
  row: "28px"
  wide: "32px"
  column: "48px"
components:
  period-active:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
  period-default:
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
  language-select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 40px 8px 12px"
  state-action:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
  repo-entry:
    rounded: "{rounded.sm}"
    padding: "28px 8px"
---

# Design System: GitHub Hot

## Overview

**Creative North Star: "深墨橙 · 工程索引 × 黄黑导视"**

以「深墨橙 · 工程索引 × 黄黑导视」为北极星：页面像一本清楚、可靠的工程索引，用暖色画布、深墨页头与精确字阶承载仓库信息。黄黑导视提供清晰的当前选择，橙色让增长信息容易找到。

界面以扫读为主，密度舒适、装饰克制；内容的层次来自排版、间距与分隔线。原生控件、可见焦点与亮暗主题共同保持轻快且直接的操作感。

**Key Characteristics:**
- 深墨页头与暖色画布，亮暗主题采用同一结构。
- 黄色指示选择与行动，橙色标记增长与链接反馈。
- 系统字体承载中文，等宽数字支持快速比较。
- 细线、留白和对齐组织内容，不以玻璃或阴影堆叠层次。

## Colors

### Primary
信号黄（`signal`）用于阶梯 H 品牌标记、当前周期、恢复操作和文本选择；深墨色文字确保它作为明确的导视标记。

### Secondary
工程橙（`accent` / `accent-dark`）用于新增 Stars、标题句点和链接 hover，按主题匹配对比度。

### Neutral
暖纸画布（`canvas`）、近白表面（`surface`）、深墨文字（`ink`）和灰绿分隔线（`line`）构成亮色模式。对应 `-dark` 色值形成暗色模式；页头始终采用深墨。`muted` 是次级信息文字，`focus` 是亮色键盘焦点；暗色与页头焦点采用信号黄。

**The 颜色分工 Rule.** 黄色标记当前选择和行动；橙色标记增长与链接反馈，语言色点保持其数据语义。

## Typography

系统 sans 字体栈包含中文回退，不加载外部字体。数据使用系统等宽栈与 `tabular-nums`。

- Headline：页面标题从 28px 到 32px（640px 起），600 字重，紧凑行高与字距。
- Title：仓库名 20px、600 字重；owner 另起一行，以 12px 次级色呈现。
- Body：描述 14px、24px 行高；列表显示两行，保留完整描述文本及断词处理。
- Label / Data：12px，用于元信息、摘要和筛选标签；贡献者标签 11px。排名 14px，次级色。
- 品牌名从 24px 到 28px（640px 起），600 字重。

**The 数字对齐 Rule.** 排名、仓库计数与仓库数据采用等宽字体和 tabular-nums，不放大排名压过仓库名称。

## Layout

内容轨最大宽 1280px；水平内边距依次为 20px、640px 起 32px、1024px 起 48px。列表在 1024px 起采用两列，列间距 48px；其余宽度单列。行内垂直留白 28px，排名列宽 24px，内容间距 16px、640px 起 20px。

页面依次呈现深墨页头、紧凑标题、吸顶筛选、摘要与榜单、页脚。筛选贴顶、层级 20，允许窄屏换行；结果区顶部间距 24px。控件最小高度 44px。摘要集中表达周期与语言，避免每行重复周期标签；页脚集中署名与回到顶部。

## Elevation & Depth

无投影。明暗表面与 1px 分隔线承担层次，工具栏采用不透明画布色；hover 仅带来浅表面反馈。不要恢复液态玻璃。

**The 平面层次 Rule.** 用画布、细线与留白区分层次，不添加玻璃、模糊背景或投影。

## Shapes

内容没有独立卡片外框；控件与行 hover 使用 2px 微圆角。主题切换按钮使用 4px 圆角，品牌标记为 40px 方形。圆形仅保留在语言色点和贡献者头像等数据形态。

## Components

- 周期按钮：原生 button，44px 最小高度；当前项黄色填充、深墨文字，以 `aria-pressed` 标识选中；其他项使用次级色与轻微 hover。
- 语言筛选：带可见标签的原生 select，细描边和表面色，亮暗主题均可用；隐藏系统默认箭头，以 16px SVG 向下箭头替代，右侧距边框 12px、垂直居中，文字区右内边距 40px；图标不拦截点击。没有自制下拉面板或搜索框。
- 仓库条目：整行为安全新窗口外链；依次呈现排名、owner、名称、描述、语言、Stars、Forks、橙色增长和最多五名贡献者。标题与右上箭头 hover 转橙；贡献者保留真实头像和替代文本。
- 状态操作：黄色恢复按钮；空态与错误态使用细线分隔的平面区域。骨架沿用榜单结构和分隔线色，筛选在加载时仍可操作。
- 页头与主题切换：黄色阶梯 H 方标与站名，右侧单一主题按钮；页脚链接承担来源与返回顶部。

颜色过渡统一 150ms，沿用 Tailwind 默认 easing（cubic-bezier(0.4, 0, 0.2, 1)）；减少动态效果偏好下禁用过渡和骨架脉冲。键盘焦点是 2px 外轮廓、4px 偏移。

## Do's and Don'ts

### Do:
- Do 用黄色标出当前筛选与主要行动，用橙色标记增长。
- Do 在亮暗主题中保持同一信息层级与原生控件。
- Do 保留等宽数据、键盘焦点及减少动态效果偏好。

### Don't:
- Don't 恢复液态玻璃、模糊工具栏、胶囊外框或悬浮卡片阴影。
- Don't 用大面积黄色、营销式巨型标题或装饰性指标抢占仓库信息。
- Don't 把语言色点改成统一品牌色。

## Logo

2026-11-12 用户选定 A「阶梯 H」：48单位竖干、24单位上升台阶，单一路径，无描边。网页标志和favicon统一使用信号黄底、深墨H；`public/logo.svg`与`app/icon.svg`保持一致。页头40px方标，H占其中30px；最小完整方标16px。单色与反白母版见`design/logo/final/`。
