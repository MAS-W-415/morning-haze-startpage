# Partner Center 字段答案

以下内容用于 Microsoft Edge 加载项商店的 Privacy、Properties 和认证备注页面。可以按实际表单微调，但不要改变事实。

## Single purpose

### 中文

将 Microsoft Edge 的新标签页替换为一个安静、键盘友好的起始页，并在本机以只读方式展示收藏夹栏书签。

### English

Replace the Microsoft Edge new tab page with a quiet, keyboard-friendly start page that displays the user's bookmarks bar locally in read-only mode.

## Permission justification

### bookmarks

**中文：**

读取 Edge 收藏夹栏的文件夹和书签，用于在自定义新标签页中展示。扩展只调用读取接口和收藏夹变化事件；不会创建、修改、移动、删除或上传书签。扩展不读取“其他收藏夹”。

**English:**

Reads the Edge favorites bar to display its folders and bookmarks on the custom new tab page. The extension only uses read APIs and bookmark change events; it never creates, edits, moves, deletes, or uploads bookmarks. It does not read the "Other favorites" folder.

### favicon

**中文：**

通过 Chromium 提供的本地 favicon 接口显示书签站点的图标。不读取或上传浏览历史。

**English:**

Uses Chromium's local favicon endpoint to display site icons next to bookmarks. It does not read or transmit browsing history.

### New tab override

**中文：**

使用 chrome_url_overrides 将新标签页替换为起始页。这是扩展的核心功能。

**English:**

Uses chrome_url_overrides to replace the new tab page with the start page. This is the core functionality of the extension.

## Are you using remote code?

No.

扩展的所有 HTML、CSS 和 JavaScript 都包含在安装包中，不加载远程脚本。

## Data usage

建议按以下事实填写，并与隐私政策保持一致：

| 数据 | 处理方式 |
|---|---|
| 收藏夹栏的文件夹名称、书签标题和网址 | 仅在用户设备本地读取，用于渲染新标签页；不上传、不出售、不共享 |
| 网站图标 | 通过浏览器本地 favicon 接口读取 |
| 默认搜索引擎 | 仅保存在本机 localStorage |
| 书签打开次数和最近使用时间 | 仅保存在本机 localStorage |
| 搜索关键词 | 仅在用户主动提交搜索时发送给用户选择的搜索引擎 |
| 分析、广告、账号、位置、支付、健康、通信数据 | 不收集 |

如果表单要求选择数据类别，请按表单的实际分类如实选择与“书签/浏览活动仅本地处理”最接近的选项，并在隐私政策中保持一致。不要勾选出售、广告或与功能无关的用途。

## Privacy policy URL

https://MAS-W-415.github.io/morning-haze-startpage/privacy.html

## Notes for certification

### 中文

安装后扩展会接管新标签页。页面入口是 `focus.html`，它会立即跳转到 `index.html`，目的是尝试把键盘焦点交给搜索框。Chromium 仍可能把焦点留在地址栏；点击页面空白处即可聚焦搜索框，这是预期行为。

测试步骤：

1. 安装扩展并允许读取收藏夹
2. 打开新标签页
3. 点击右下角很淡的文件夹图标，查看收藏夹栏根目录
4. 进入文件夹，测试面包屑、返回和方向键
5. 在搜索框为空时按 `:`，打开书签查找
6. 按 `F2` 切换 Bing / Google
7. 提交搜索，确认结果在新标签页打开
8. 输入完整 `https://` 网址，确认在当前标签页打开

扩展只显示收藏夹栏，不读取“其他收藏夹”。不需要测试账号。扩展没有远程请求、分析统计或广告；搜索请求只在用户主动提交时发往所选搜索引擎。

### English

After installation, the extension replaces the new tab page. The entry page is `focus.html`, which immediately redirects to `index.html` to try to move keyboard focus to the search field. Chromium may still keep focus in the address bar; clicking any blank area of the page focuses the search field. This is expected.

Test steps:

1. Install the extension and allow bookmarks access
2. Open a new tab
3. Click the faint folder button in the bottom-right corner to open the bookmarks bar root
4. Open a folder and test the breadcrumb, back button, and arrow keys
5. With the search field empty, press `:` to open bookmark search
6. Press `F2` to cycle between Bing and Google
7. Submit a search and confirm it opens in a new tab
8. Enter a full `https://` URL and confirm it opens in the current tab

The extension only displays the favorites bar, not "Other favorites". No test account is required. There are no remote requests, analytics, or ads. Search requests are sent only to the selected search engine when the user submits a search.

## Publisher and public information

- Publisher display name：建议使用“晨雾”
- Website：GitHub Pages 安装页
- Support：GitHub Issues
- Privacy policy：GitHub Pages 隐私页
- 不要在公开字段填写私人邮箱、电话或住址
- 提交前用 Partner Center 预览确认公开字段
