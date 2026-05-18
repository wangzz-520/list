# 微信云开发接入检查报告

## 检查结论

当前项目具备“本地优先 + 微信云开发增强”的接入结构。云开发可用时支持云端模板、用户数据同步、反馈收集、管理员反馈查看和共享清单快照；云开发不可用时，首页、分类、清单详情和我的页面核心功能仍可本地运行。

本次新增并修复了“共享清单快照云端能力”：分享清单时创建 `shared_lists` 快照，分享路径携带 `shareId`，接收方可通过云函数读取固定快照。

## 1. 云开发初始化

- `app.js` 读取 `config/cloud.js`。
- `ENABLE_CLOUD = true` 时尝试调用 `wx.cloud.init()`。
- `CLOUD_ENV_ID` 为空时使用开发者工具默认云环境。
- `wx.cloud` 不存在或初始化失败时，保持 `globalData.cloudReady = false` 并降级为本地模式。
- 初始化成功后会尝试调用 `cloudSync.pullAndMerge()` 拉取用户数据。

结论：初始化逻辑正确，具备失败降级能力。

## 2. cloudfunctionRoot

`project.config.json` 已配置：

```json
{
  "miniprogramRoot": "./",
  "cloudfunctionRoot": "cloudfunctions/"
}
```

结论：云函数根目录配置正确。

## 3. 云函数与依赖

需要部署的核心云函数：

- `login`
- `adminManager`
- `initDatabase`
- `initTemplates`
- `getTemplates`
- `syncUserData`
- `submitFeedback`
- `createShareList`

每个核心云函数均包含 `index.js` 和 `package.json`，并依赖 `wx-server-sdk`。

## 4. 前端调用名称

| 前端位置 | 调用名称 | 云函数 |
| --- | --- | --- |
| `utils/cloudApi.js` | `login` | `cloudfunctions/login` |
| `utils/cloudApi.js` | `getTemplates` | `cloudfunctions/getTemplates` |
| `utils/cloudSync.js` | `syncUserData` | `cloudfunctions/syncUserData` |
| `utils/storage.js` | `syncUserData` | `cloudfunctions/syncUserData` |
| `utils/cloudApi.js` | `submitFeedback` | `cloudfunctions/submitFeedback` |
| `utils/cloudApi.js` | `adminManager` | `cloudfunctions/adminManager` |
| `utils/cloudApi.js` | `createShareList` | `cloudfunctions/createShareList` |

结论：前端调用名称与云函数目录一致。

## 5. 页面云端数据调用

- 首页：本地模板优先，再用 `cloudApi.getTemplates({ sortByHot: true })` 覆盖云端热门模板。
- 分类页：本地分类模板优先，再用 `cloudApi.getTemplates({ category })` 覆盖云端分类模板。
- 我的页：展示本地最近生成、常用清单和同步状态；反馈通过 `submitFeedback` 提交；用户数据通过 `syncUserData` 同步。
- 清单详情页：模板从本地和云端模板读取；已生成清单分享时调用 `createShareList` 创建云端快照；通过 `shareId` 打开时调用 `createShareList` 读取快照。

## 6. 本地降级能力

未配置云环境、未部署云函数或云函数调用失败时：

- `cloudApi.callFunction()` 返回 `{ ok: false, reason: "cloud_not_ready" }` 或 `{ ok: false, reason: "call_failed" }`。
- 首页、分类页继续使用 `data/templates.js`。
- 勾选、常用、最近生成、自定义清单继续使用 `utils/storage.js`。
- 分享清单退回普通页面路径，云端快照不可用。

结论：核心功能可降级为本地模式。

## 7. 本次修复

- 修复 `createShareList` 云函数，支持创建和读取共享清单快照。
- `createShareList` 写入 `shared_lists` 时按 `_openid` 记录创建者，并限制分组、事项数量和文本长度。
- `createShareList` 读取快照时不返回 `_openid`。
- `initDatabase` 增加 `shared_lists` 集合创建。
- `initDatabase` 增加 20 秒超时配置，并支持 `collections`、`config`、`templates` 分步初始化，避免测试面板 3 秒超时。
- 清单详情页分享逻辑改为先创建 `shareId`，再分享 `/pages/checklist/checklist?shareId=...`。
- 更新 `docs/DB_SCHEMA.md`、`docs/CLOUD_BACKEND_SETUP.md` 和 `docs/CLOUD_DEPLOY_CHECKLIST.md`。

## 8. 静态验证结果

已执行：

```text
node --check pages/checklist/checklist.js
node --check cloudfunctions/createShareList/index.js
node --check cloudfunctions/initDatabase/index.js
```

结果：通过。

## 9. 部署后手工验证

1. 上传并部署 `initDatabase` 和 `createShareList`。
2. 调用 `initDatabase`，确认返回 `total: 5`，并确认 `shared_lists` 集合存在。
3. 从“我的”页最近生成清单进入已生成清单详情。
4. 点击“分享清单”，确认 `shared_lists` 新增一条快照。
5. 用分享卡片打开，确认进入 `shareId` 路径并显示正确清单。

## 10. 合规边界

本次未接入微信支付，未强制手机号授权，未引入传统服务器，未引入前端 npm 依赖。
