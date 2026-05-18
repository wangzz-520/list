# 上线前完整测试报告

检查日期：2026-05-18

## 结论

当前项目主体功能已经具备上线前测试条件：本地模板、分类浏览、清单生成、我的清单中心、今日要做、选择困难症助手、意见反馈、管理员反馈查看、云端同步、分享快照和带小程序码海报链路均已接入。

本次检查发现并修复 2 个确定性问题：

1. 删除废弃空目录 `cloudfunctions/getWallpapers`，避免微信开发者工具误识别为云函数。
2. 补充 `docs/CLOUD_BACKEND_SETUP.md` 的云函数部署列表，加入 `cloudfunctions/getShareQrCode`。

## 静态检查

### 页面配置

- `app.json` 配置 7 个页面。
- 页面文件完整，所有页面均包含 `.js`、`.wxml`、`.wxss`、`.json`。
- tabBar 页面为：首页、分类、我的。
- 未发现缺失页面文件。

### 语法检查

已执行所有小程序页面、工具模块、模板数据、云函数的 JS 语法检查，结果通过。

检查范围：

- `pages/**/*.js`
- `utils/*.js`
- `data/templates.js`
- `cloudfunctions/**/*.js`

### WXML 检查

已检查 7 个页面 WXML 标签闭合，结果通过。

检查页面：

- `pages/index/index.wxml`
- `pages/category/category.wxml`
- `pages/checklist/checklist.wxml`
- `pages/today/today.wxml`
- `pages/decision/decision.wxml`
- `pages/admin/admin.wxml`
- `pages/mine/mine.wxml`

### JSON 检查

已检查页面 JSON、云函数 JSON、`app.json`、`project.config.json`、`sitemap.json`，结果通过。

## 云开发检查

### 云函数目录

当前有效云函数：

- `login`
- `adminManager`
- `initDatabase`
- `initTemplates`
- `getTemplates`
- `syncUserData`
- `submitFeedback`
- `createShareList`
- `getShareQrCode`

检查结果：

- 每个云函数均包含 `index.js` 和 `package.json`。
- `getShareQrCode` 包含 `config.json`，声明 `wxacode.getUnlimited` OpenAPI 权限。
- 已删除废弃的 `getWallpapers` 空目录。

### 数据库集合

当前需要的集合：

- `checklist_templates`
- `app_config`
- `user_data`
- `feedbacks`
- `shared_lists`

`initDatabase` 已包含集合创建和基础数据初始化逻辑。

## 主流程检查

### 首页

状态：通过。

- 首页展示品牌区、查看清单、选择困难症助手、常用清单、精选模板。
- 首页没有搜索框，符合当前产品决策。
- 精选模板点击进入清单详情页。

### 分类页

状态：通过。

- 分类页展示本地模板优先。
- 云端模板加载后按本地顺序排序，避免返回后模板顺序交换。
- 云端旧图标会使用本地图标兜底，避免“办事证件清单”图标消失。

### 清单详情页

状态：通过，需要真机重点回归。

- 模板清单支持勾选、快速添加事项、按分组添加、删除事项、重置、生成我的清单。
- 生成我的清单后保存为个人自定义清单，并进入 `user_data.data.customLists` 同步链路。
- 生成我的清单时会创建分享快照，并尝试保存带小程序码海报。
- 已生成的我的清单为只读展示，不再出现快速添加、重置、删除等编辑入口。
- 已生成的我的清单支持分享清单和保存分享海报。

### 分享打开指定清单

状态：通过，需要云端真机回归。

- 分享时创建 `shared_lists` 快照。
- 分享路径携带 `shareId`。
- 小程序码使用 `scene=shareId`，打开后进入对应清单快照。
- 接收方看到只读分享预览。
- 接收方可一键“复制为我的清单”。

### 我的页

状态：通过。

- 展示最近生成的清单。
- 展示常用清单。
- 展示数据同步状态。
- 支持删除自定义清单。
- 支持提交反馈。
- 管理员可看到管理员中心入口。
- 支持分享小程序。

### 今日要做

状态：通过。

- 聚合进行中的清单。
- 展示常用清单。
- 展示今日完成记录。
- 支持进入对应清单。

### 选择困难症助手

状态：通过。

- 支持常用选择模板：吃什么、去哪玩、先做哪件事。
- 支持排除上次结果。
- 支持历史记录。
- 已移除“保存为选择清单”按钮，符合当前产品决策。

## 合规检查

状态：通过。

- 未接入微信支付。
- 未强制授权手机号。
- 未引入传统服务器。
- 未引入前端 npm 依赖。
- 壁纸下载页已移除。
- 不提供动漫、游戏 IP 壁纸内容，降低审核和侵权风险。
- 用户反馈仅提交文本，不要求头像、昵称、手机号。

## 需要真机验证的项目

1. 云开发初始化后，登录小程序是否写入 `user_data`。
2. 调用 `initDatabase` 后，5 个集合是否存在。
3. `checklist_templates` 是否有模板数据，且“办事证件清单”图标为 `🧾`。
4. 生成我的清单后，`user_data.data.customLists` 是否新增对应清单。
5. 保存分享海报时，相册授权是否正常。
6. 保存的海报是否带小程序码，扫码是否打开对应清单。
7. 分享卡片打开后是否进入对应清单快照。
8. 接收方点击“复制为我的清单”后，我的页是否出现该清单。
9. 提交反馈后，`feedbacks` 集合是否新增记录。
10. 管理员 openid 配置后，管理员中心是否能看到反馈。

## 潜在风险

1. `getShareQrCode` 必须重新上传并部署，且要带上 `config.json`，否则会出现 `-604101` 权限错误。
2. 如果云数据库已经有旧模板数据，需要重新调用 `initTemplates` 或 `initDatabase` 更新云端模板。
3. 云函数测试面板默认超时时间较短，`initDatabase` 如超时，可按 `operation: collections`、`config`、`templates` 分步初始化。
4. 分享、小程序码、保存相册都依赖微信开发者工具和真机环境，静态检查无法完全替代真机测试。

## 建议上线顺序

1. 重新部署所有云函数，重点确认 `getShareQrCode` 带权限配置。
2. 调用 `initDatabase` 初始化集合和基础数据。
3. 配置管理员 openid。
4. 在开发版中完整跑一遍“生成清单、保存海报、扫码打开、复制为我的清单、提交反馈”。
5. 确认无异常后提交体验版。
