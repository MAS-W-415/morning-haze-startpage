# 晨雾起始页隐私政策

生效日期：2026 年 10 月 27 日

晨雾起始页是一个运行在 Microsoft Edge 中的新标签页扩展。本政策说明扩展会访问哪些数据、如何使用这些数据，以及数据保存在哪里。

## 1. 扩展访问的数据

### 收藏夹栏

扩展会通过浏览器的 `bookmarks` 权限读取收藏夹栏中的文件夹名称、书签标题和网址，用于在新标签页的收藏夹浮层和书签查找中显示。

扩展只读取数据，不会创建、修改、移动、删除或上传收藏夹。扩展不会显示、使用或上传“其他收藏夹”中的内容。
浏览器的书签接口会返回完整书签树；代码只筛选收藏夹栏，其他收藏夹中的内容不会显示、使用或上传。

### 网站图标

扩展会通过 Chromium 提供的本地 favicon 接口获取书签站点的图标。该过程使用浏览器自己的图标缓存，不经过本项目的服务器。

### 搜索内容

当你在搜索框中提交搜索时，搜索关键词会按照你选择的搜索引擎，拼接到对应网站的正常搜索地址中，例如 Bing 或 Google。

搜索请求由你主动发起，并直接发送给你选择的搜索引擎。扩展不会额外收集、记录或上传搜索内容。搜索引擎如何处理搜索内容，由其各自的隐私政策决定。

### 本地设置和使用记录

扩展会在本机的 `localStorage` 中保存：

- `searchEngine`：你选择的默认搜索引擎
- `bookmarkUsage.v1`：从起始页打开书签的次数和最近使用时间

这些数据只保存在当前浏览器配置文件中，不会由扩展上传或同步到其他设备。

## 2. 扩展不会做的事

- 不收集账号、姓名、地址、电话号码或支付信息
- 不收集位置、健康、财务或个人通信数据
- 不记录完整浏览历史
- 不使用分析统计、埋点、广告或行为追踪
- 不出售、出租或向第三方转让用户数据
- 不把收藏夹或使用记录发送给开发者
- 不加载或执行远程代码

## 3. 数据保存和删除

设置和使用记录保存在浏览器的扩展存储中。你可以通过以下方式删除：

- 在扩展页面中清除该扩展的站点数据
- 卸载扩展
- 删除浏览器配置文件中对应的扩展数据

收藏夹数据由浏览器和你的 Microsoft 账户管理，不属于本扩展。删除扩展不会修改你的收藏夹。

## 4. 权限说明

- `bookmarks`：读取收藏夹栏并展示书签。浏览器会显示“读取和更改你的收藏夹”的通用提示，但本扩展的实际代码只读。
- `favicon`：显示书签站点的图标。
- 新标签页覆盖：用晨雾起始页替换 Edge 新标签页。

## 5. 第三方服务

- Microsoft Edge 加载项商店负责扩展的发布和更新，可能按照 Microsoft 的政策记录标准访问日志。
- GitHub 用于源代码、版本发布和本说明页面的托管，可能按照 GitHub 的政策记录标准访问日志。
- Bing、Google 等搜索引擎只在用户主动提交搜索时接收搜索内容。

## 6. 儿童

本扩展不是面向儿童设计的产品，也不会主动收集任何人的个人数据。

## 7. 政策更新

如果扩展的数据处理方式发生变化，本政策会更新，并修改顶部的生效日期。公开版本的最新政策以本页面为准。

## 8. 联系方式

如有隐私问题，请通过 GitHub Issues 联系：

https://github.com/MAS-W-415/morning-haze-startpage/issues

---

## English summary

Morning Haze Start Page is a new-tab extension for Microsoft Edge. It reads the bookmarks bar locally to render bookmarks and folders, uses Chromium's local favicon service for site icons, and stores the selected search engine plus bookmark usage counts in local storage on the user's device.

The extension does not collect, transmit, sell, or share bookmarks, usage data, or other personal information with the developer or third parties. Search queries are sent directly to the search engine selected by the user only when the user submits a search. No analytics, advertising, telemetry, or remote code is used.

To delete locally stored settings and usage data, clear the extension's site data or uninstall the extension.
