# 微信云开发接入检查报告

## 检查结论

当前项目已具备“本地优先 + 微信云开发同步”的接入结构。小程序端在云开发不可用时会回退到本地模板和本地缓存；云开发可用并部署云函数后，可使用云端模板、用户数据同步、反馈收集和共享清单快照。

需要注意：`project.config.json` 已配置小程序 AppID。接入云开发前，需要确认该 AppID 是当前微信开发者工具登录账号有权限管理的小程序，并在云开发控制台开通环境。

## 1. 云开发初始化

- `app.js` 会读取 `config/cloud.js`。
- `ENABLE_CLOUD = true` 时尝试调用 `wx.cloud.init()`。
- `CLOUD_ENV_ID` 为空时，使用微信开发者工具当前默认云环境。
- 当前为测试号或未配置真实 AppID 时，`app.js` 会跳过云初始化并自动降级为本地模式。
- `wx.cloud` 不存在或初始化失败时，会保持 `globalData.cloudReady = false`，并降级为本地模式。
- 初始化成功后，会调用 `cloudSync.pullAndMerge()` 拉取云端用户数据并合并到本地缓存。

结论：初始化逻辑正确，具备失败降级能力。

## 2. cloudfunctionRoot

`project.config.json` 配置如下：

```json
{
  "miniprogramRoot": "./",
  "cloudfunctionRoot": "cloudfunctions/"
}
```

结论：云函数根目录配置正确。

## 3. 云函数清单与依赖

已检查 6 个云函数目录，均包含 `index.js` 和 `package.json`：

- `login`
- `initTemplates`
- `getTemplates`
- `syncUserData`
- `submitFeedback`
- `createShareList`

每个 `package.json` 均包含 `wx-server-sdk` 依赖。已执行 Node 语法检查，云函数 JS 均通过。

## 4. 云函数与前端调用名称

前端调用与云函数目录匹配：

| 前端位置 | 调用名称 | 云函数 |
| --- | --- | --- |
| `utils/cloudApi.js` | `getTemplates` | `cloudfunctions/getTemplates` |
| `utils/cloudSync.js` | `syncUserData` | `cloudfunctions/syncUserData` |
| `utils/storage.js` | `syncUserData` | `cloudfunctions/syncUserData` |
| `utils/cloudApi.js` | `submitFeedback` | `cloudfunctions/submitFeedback` |
| `utils/cloudApi.js` | `createShareList` | `cloudfunctions/createShareList` |

`login` 和 `initTemplates` 是部署/初始化辅助函数，当前前端不直接调用，符合项目设计。

## 5. 页面云端数据调用

- 首页：先加载 `data/templates.js` 本地热门模板，再调用 `cloudApi.getTemplates({ sortByHot: true })` 覆盖为云端热门模板；搜索时先本地搜索，再尝试云端搜索。
- 分类页：先按本地分类模板展示，再调用 `cloudApi.getTemplates({ category })` 覆盖为云端分类模板。
- 我的页：使用本地缓存展示收藏、自定义清单；反馈提交会先写本地，再尝试调用 `submitFeedback`；“立即同步”会调用 `syncUserData` 执行 push/pull。

结论：首页、分类页、我的页均保留本地优先，并在云开发可用时调用云端能力。

## 6. 本地降级能力

未配置云环境、未部署云函数或云函数调用失败时：

- `cloudApi.callFunction()` 返回 `{ ok: false, reason: 'cloud_not_ready' }` 或 `{ ok: false, reason: 'call_failed' }`。
- 首页、分类页仍使用 `data/templates.js`。
- 勾选、收藏、最近使用、自定义清单仍使用 `utils/storage.js` 的本地缓存。
- 反馈会先保存到本地，再尝试云端提交。

结论：核心功能可降级为本地模式。

## 7. 已修复问题

- 为 `initTemplates`、`syncUserData`、`submitFeedback`、`createShareList` 补充异常捕获，确保失败时也返回 `ok: false`。
- 为 `submitFeedback`、`createShareList` 增加 `_openid` 检查，避免私有数据写入时缺少用户隔离字段。
- 替换前端和云函数中的 `flatMap` 用法，降低微信开发者工具和云函数运行环境兼容风险。

## 8. 静态验证结果

已执行：

```text
app.json / project.config.json / sitemap.json / pages/*.json JSON 解析检查
app.js / utils/*.js / data/templates.js 语法检查
pages/**/*.js 语法检查
cloudfunctions/**/*.js 语法检查
cloudfunctions/*/package.json 依赖检查
```

结果：通过。

## 9. 部署前必做

1. 在微信开发者工具中确认 `project.config.json` 的 `appid` 是你有权限管理的小程序 AppID。
2. 在微信开发者工具中开通云开发环境。
3. 如需指定环境，将 `config/cloud.js` 的 `CLOUD_ENV_ID` 填为云环境 ID；不填写则使用开发者工具当前默认云环境。
4. 依次上传并部署 6 个云函数，选择“云端安装依赖”。
5. 调用 `initTemplates` 初始化 `checklist_templates` 和 `app_config`。
6. 在首页、分类页、我的页验证云端读取、反馈提交和用户数据同步。

## 10. 合规边界

本次检查和修复未接入微信支付，未强制手机号授权，未引入传统服务器，未引入前端 npm 依赖。
