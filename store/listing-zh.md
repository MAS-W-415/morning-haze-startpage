# Edge 商店文案（中文）

以下内容按 Partner Center 的字段整理，发布前把占位地址替换成真实地址。

## Extension name

晨雾起始页

来源：`manifest.json` 的 `name`，上传包后自动带入。

## Short description

晨雾浅色、大时钟与安静搜索，自动显示收藏夹栏的 Edge 新标签页。

来源：`manifest.json` 的 `description`，上传包后自动带入。

## Description

晨雾起始页把 Edge 的新标签页换成一片安静的晨雾：柔和的浅色渐变、24 小时大时钟、中文日期和居中的搜索框。没有多余的卡片，也没有铺满首页的书签磁贴。

主要功能：

- 24 小时时钟，中文日期不带年份
- Bing / Google 搜索，按 F2 快速切换
- 搜索结果在新标签页打开，直接输入完整网址则在当前标签页打开
- 只显示 Edge 收藏夹栏，不显示“其他收藏夹”
- 收藏夹平时几乎不可见，只在右下角保留一个很淡的入口
- 点开后按文件夹逐层浏览，支持面包屑、返回和键盘导航
- 按 : 打开书签查找，空查询显示 Top 12
- 使用次数和最近使用时间只保存在本机
- 自动显示书签站点图标，失败时显示首字母图标
- 收藏夹变化时自动刷新
- 全键盘操作，也支持鼠标

隐私说明：

扩展只申请 bookmarks 和 favicon 两个权限。书签只在浏览器本地读取和显示，不会上传、出售或共享。使用次数、默认搜索引擎保存在本机 localStorage。扩展没有分析统计、广告、账号系统或远程代码。搜索关键词只在你主动提交时发送给所选的搜索引擎。

使用说明：

- 扩展只显示收藏夹栏。如果书签在“其他收藏夹”，需要先移动到收藏夹栏。
- Chromium 可能把新标签页的键盘焦点放在地址栏。此时点一下页面空白处，搜索框就会获得焦点。
- 本项目基于开源模板 minimal-startpage-template（MIT License）修改，源代码和许可证通过 GitHub 仓库公开。
- 本项目与 Microsoft、Bing、Google 无隶属或赞助关系。

## Category

Productivity

## Website

https://mas-w-415.github.io/morning-haze-startpage/

## Support contact detail

https://github.com/MAS-W-415/morning-haze-startpage/issues

## Privacy policy URL

https://mas-w-415.github.io/morning-haze-startpage/privacy.html

## Search terms

- 起始页
- 新标签页
- 收藏夹
- 书签
- 时钟
- 搜索
- 极简

## Assets

### Extension logo

`store/assets/extension-logo-300x300.png`  
300×300 PNG，1:1。

### Screenshots

按以下顺序上传，最多 6 张，均为 1280×800 PNG：

1. `store/screenshots/01-home.png` — 主页、时钟和搜索
2. `store/screenshots/02-folder-root.png` — 收藏夹栏根目录
3. `store/screenshots/03-folder-nested.png` — 文件夹和面包屑
4. `store/screenshots/04-finder.png` — 书签查找 Top 12

### Small promotional tile

`store/assets/small-promo-tile-440x280.png`  
440×280 PNG，可选。

## Visibility

Public

## Markets

All markets（或按需要选择）

## Mature content

No

## Notes

- 不包含追踪、广告或远程代码
- 不需要测试账号
- 截图中的书签均为演示数据
