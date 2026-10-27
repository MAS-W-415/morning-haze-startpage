# Edge 加载项商店提交清单

这个目录是公开上架用的文案和素材。发布前先完成根目录 README 里的 GitHub 配置。

## 已准备

- 扩展包：由 GitHub Actions 生成 `morning-haze-startpage.zip`
- 商店 Logo：`store/assets/extension-logo-300x300.png`
- 小促销图：`store/assets/small-promo-tile-440x280.png`
- 截图：`store/screenshots/`，均为 1280×800 PNG
- 商店文案：`store/listing-zh.md`
- Partner Center 字段答案：`store/partner-center-answers.md`
- 隐私政策源文件：`PRIVACY.md`
- 隐私政策页面：`docs/privacy.html`

## 发布前需要替换

在以下文件中把 `MAS-W-415` 替换成实际的 GitHub 用户名：

- `README.md`
- `PRIVACY.md`
- `docs/config.js`
- `docs/app.js` 不需要改，它读取 `docs/config.js`
- `docs/index.html` 里的静态兜底链接
- `docs/privacy.html` 里的静态兜底链接
- `store/listing-zh.md`
- `store/partner-center-answers.md`
- `store/README.md`

如果仓库名不是 `morning-haze-startpage`，也要一起替换。

确认这些地址可以访问：

```text
https://MAS-W-415.github.io/morning-haze-startpage/
https://MAS-W-415.github.io/morning-haze-startpage/privacy.html
https://github.com/MAS-W-415/morning-haze-startpage
https://github.com/MAS-W-415/morning-haze-startpage/issues
```

GitHub Pages 设置：

```text
Settings → Pages → Deploy from a branch → main → /docs
```

## 提交流程

1. 注册免费的 Microsoft Edge 开发者账号：
   https://partner.microsoft.com/dashboard/microsoftedge/public/login
2. 在 Partner Center 创建扩展，上传 `morning-haze-startpage.zip`
3. **Availability**：
   - Visibility：`Public`
   - Markets：全市场，或按需要选择
4. **Properties**：
   - Category：`Productivity`
   - Website：GitHub Pages 安装页
   - Support contact detail：GitHub Issues 地址
   - Mature content：不勾选
5. **Privacy**：
   - 使用 `store/partner-center-answers.md` 里的 Single Purpose、权限说明和测试说明
   - 远程代码：No
   - 隐私政策 URL：GitHub Pages 的 `privacy.html`
   - 数据使用声明按表单如实填写，保持和隐私政策一致
6. **Store listings**：
   - 语言：中文（简体）
   - 名称、短描述来自 `manifest.json`
   - 长描述使用 `store/listing-zh.md`
   - Logo：`store/assets/extension-logo-300x300.png`
   - 截图：4 张 1280×800 PNG
   - 官网、支持、隐私链接使用上面的 GitHub Pages 地址
7. **Notes for certification**：粘贴 `store/partner-center-answers.md` 里的测试说明
8. 发布并等待审核。官方文档说明认证最长约 7 个工作日

## 审核时可能关注

- `bookmarks` 权限：只读收藏夹栏，用于新标签页展示；代码不写入、不上传
- `favicon` 权限：使用 Chromium 本地图标接口
- 新标签页覆盖：扩展的核心功能
- 焦点行为：Chromium 新标签页可能把焦点放在地址栏，点击页面空白是预期替代操作
- Bing / Google 图标：仅用于标识搜索引擎，项目与两家公司无隶属关系
- 没有远程代码、分析统计、广告或账号系统

## 更新版本

1. 修改 `manifest.json` 的版本号
2. 更新 `CHANGELOG.md`
3. 提交并打 tag，例如 `v1.0.1`
4. GitHub Actions 会生成新的 `morning-haze-startpage.zip`
5. 在 Partner Center 的 **Packages** 页面上传同一个 ZIP
6. 提交更新并等待审核

## 隐私和公开信息

- 商店发布者显示名称建议使用品牌名“晨雾”，不要用真实姓名
- 支持渠道使用 GitHub Issues，不在公开页面写私人邮箱
- 截图使用演示书签，不包含个人收藏
- GitHub 提交邮箱建议使用 GitHub 的 noreply 地址
- 公开页面的发布者名称、官网、支持链接和隐私政策会展示给用户
- Partner Center 后台的开发者验证资料按 Microsoft 要求填写，公开前用预览确认展示字段
