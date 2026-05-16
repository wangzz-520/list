# 微信云开发接入说明

本项目已经升级为“本地优先 + 微信云开发同步”架构。

- 不接微信支付
- 不要求用户授权手机号、头像、昵称
- 本地缓存仍可用
- 云端用于模板库、用户数据同步、反馈收集、共享清单

## 1. 需要准备什么

1. 一个已注册的小程序 AppID。
2. 微信开发者工具。
3. 在微信开发者工具中开通“云开发”环境。
4. 一个云环境 ID，例如：`prod-xxxxx`。

## 2. 修改云环境 ID

打开：

```text
config/cloud.js
```

修改：

```js
const CLOUD_ENV_ID = '你的云环境ID';
const ENABLE_CLOUD = true;
```

如果 `CLOUD_ENV_ID` 留空，代码会尝试使用微信开发者工具当前默认云环境。

## 3. 项目目录变化

```text
cloudfunctions/
├─ login/             获取 openid
├─ initTemplates/     初始化 20 个内置模板到云数据库
├─ getTemplates/      云端模板查询
├─ syncUserData/      收藏、最近使用、自定义清单、勾选进度同步
├─ submitFeedback/    用户反馈提交
└─ createShareList/   创建共享清单快照

config/
└─ cloud.js           云开发开关和环境 ID

utils/
├─ cloudApi.js        小程序端云函数封装
├─ cloudSync.js       用户数据同步封装
├─ storage.js         本地缓存 + 云同步触发
└─ checklist.js       清单进度计算
```

## 4. 云数据库集合

建议在云开发控制台创建以下集合：

```text
checklist_templates   清单模板库
app_config            应用配置，例如分类配置
user_data             用户收藏、勾选进度、自定义清单
feedbacks             用户反馈
shared_lists          共享清单快照
```

也可以先不手动创建，部分集合会在云函数首次写入时自动创建，但上线前建议你在控制台确认集合和权限。

## 5. 数据库权限建议

本项目默认通过云函数访问数据库，前端不直接读写数据库。因此建议：

```text
checklist_templates：仅云函数可写；如果未来前端直读，可设置所有用户可读
app_config：仅云函数可写；如需前端直读，可设置所有用户可读
user_data：仅云函数读写
feedbacks：仅云函数写入和管理
shared_lists：仅云函数读写；分享访问通过 `createShareList` 云函数按 `shareId` 读取 active 快照
```

## 6. 部署云函数

在微信开发者工具中：

```text
cloudfunctions/login             右键 → 上传并部署：云端安装依赖
cloudfunctions/initTemplates     右键 → 上传并部署：云端安装依赖
cloudfunctions/getTemplates      右键 → 上传并部署：云端安装依赖
cloudfunctions/syncUserData      右键 → 上传并部署：云端安装依赖
cloudfunctions/submitFeedback    右键 → 上传并部署：云端安装依赖
cloudfunctions/createShareList   右键 → 上传并部署：云端安装依赖
```

`createShareList` 同时负责：

```text
operation 默认/create：创建共享清单快照
operation=get：按 shareId 读取 active 共享清单快照
```

## 7. 初始化模板数据

部署 `initTemplates` 后，在微信开发者工具的云函数面板里测试调用：

```json
{}
```

成功后会返回类似：

```json
{
  "ok": true,
  "total": 20,
  "created": 20,
  "updated": 0,
  "categories": 7
}
```

此时 `checklist_templates` 集合中会写入 20 个模板。

## 8. 小程序端如何工作

### 没有云环境时

小程序仍然使用：

```text
data/templates.js
wx.setStorageSync / wx.getStorageSync
```

用户可以正常查看、勾选、收藏、新建自定义清单。

### 配置云环境并部署云函数后

小程序会自动启用：

```text
云端模板查询
云端用户数据同步
云端反馈收集
云端共享清单快照
```

本地缓存仍然保留，网络异常时不会影响基础使用。

## 9. 云端同步字段

`user_data` 中保存的数据结构：

```json
{
  "_openid": "用户openid",
  "data": {
    "schemaVersion": 1,
    "drafts": {},
    "favorites": [],
    "pinnedTemplates": [],
    "recents": [],
    "completedLists": [],
    "customLists": [],
    "feedbacks": [],
    "clientExportedAt": 1710000000000
  },
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```

## 10. Codex 继续开发建议

接下来可以让 Codex 执行：

```text
请阅读 docs/CLOUD_BACKEND_SETUP.md、config/cloud.js、utils/cloudApi.js、utils/cloudSync.js 和 cloudfunctions 目录。检查微信云开发接入是否完整，然后输出 docs/cloud_backend_test_report.md。不要接微信支付，不要引入传统服务器。
```
