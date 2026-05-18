# 微信云开发接入说明

本项目采用“本地优先 + 微信云开发增强”的结构：

- 不接微信支付
- 不要求手机号、头像、昵称授权
- 不引入传统服务器
- 本地缓存始终可用
- 云端用于模板库、用户数据同步、反馈收集、管理员反馈查看和共享清单快照

## 1. 准备

1. 一个已认证或可发布的小程序 AppID。
2. 微信开发者工具。
3. 在微信开发者工具中开通云开发环境。
4. 一个云环境 ID，例如 `prod-xxxxx`。

## 2. 配置云环境 ID

打开：

```text
config/cloud.js
```

配置：

```js
const CLOUD_ENV_ID = '你的云环境ID';
const ENABLE_CLOUD = true;
```

如果 `CLOUD_ENV_ID` 留空，代码会尝试使用微信开发者工具当前默认云环境。

## 3. 云函数目录

```text
cloudfunctions/
├─ login/             获取 openid，并写入或更新 user_data 登录记录
├─ adminManager/      管理员身份、反馈查看
├─ initDatabase/      一站式创建集合、配置和模板数据
├─ initTemplates/     兼容保留：单独刷新模板数据
├─ getTemplates/      云端模板查询
├─ syncUserData/      用户私有数据同步
├─ submitFeedback/    用户反馈提交
└─ createShareList/   创建和读取共享清单快照
```

## 4. 云数据库集合

`initDatabase` 会创建：

```text
checklist_templates   清单模板库
app_config            应用配置，例如分类、管理员 openid
user_data             用户私有数据
feedbacks             用户反馈
shared_lists          共享清单快照
```

如果云函数没有创建集合权限，请在云开发控制台手动创建以上 5 个集合后，再调用 `initDatabase`。

## 5. 数据库权限建议

本项目默认通过云函数访问数据库，前端不直接读写数据库。建议：

```text
checklist_templates：仅云函数可写；如未来前端直读，可设置所有用户可读
app_config：仅云函数可写；如需前端直读，可设置所有用户可读
user_data：仅云函数读写，并按 _openid 隔离
feedbacks：仅云函数写入和管理员读取
shared_lists：仅云函数读写；读取分享时不返回 _openid
```

## 6. 部署云函数

在微信开发者工具中右键以下目录，选择“上传并部署：云端安装依赖”：

```text
cloudfunctions/login
cloudfunctions/adminManager
cloudfunctions/initDatabase
cloudfunctions/initTemplates
cloudfunctions/getTemplates
cloudfunctions/syncUserData
cloudfunctions/submitFeedback
cloudfunctions/createShareList
cloudfunctions/getShareQrCode
```

## 7. 初始化集合和基础数据

部署 `initDatabase` 后，在云函数测试面板调用：

```json
{}
```

成功后会返回类似：

```json
{
  "ok": true,
  "total": 5,
  "created": 5,
  "existed": 0,
  "failed": 0,
  "seeded": true,
  "templates": {
    "total": 25,
    "created": 25,
    "updated": 0
  },
  "categories": 8
}
```

它会初始化：

```text
checklist_templates   内置模板
app_config            categories 分类配置
app_config            admin_openids 管理员白名单占位，默认 []
```

如果云函数测试面板出现 `Invoking task timed out after 3 seconds`，先确认已重新上传部署 `cloudfunctions/initDatabase`，因为现在已增加 `config.json` 超时配置。仍然超时时，可以分步调用：

```json
{ "operation": "collections" }
```

```json
{ "operation": "config" }
```

```json
{ "operation": "templates", "offset": 0, "limit": 10 }
```

然后按返回的 `nextOffset` 继续调用，例如：

```json
{ "operation": "templates", "offset": 10, "limit": 10 }
```

直到 `hasMore` 为 `false`。

## 8. 共享清单快照流程

1. 用户在已生成清单页点击“分享清单”。
2. 前端调用 `createShareList` 云函数，把当前清单内容写入 `shared_lists`。
3. 云函数返回 `shareId`。
4. 分享路径变为 `/pages/checklist/checklist?shareId=xxx`。
5. 接收方打开后通过 `createShareList` 的 `operation: "get"` 读取快照。

说明：共享清单是固定快照，不是多人实时协作。创建者后续修改本地清单，不会自动改变已经分享出去的内容。

## 9. 本地降级

未配置云环境、未部署云函数或云函数调用失败时：

- 首页、分类页仍使用 `data/templates.js`
- 勾选、常用、最近生成、自定义清单仍使用本地缓存
- 反馈先保存本地，再尝试云端提交
- 分享清单会退回普通页面路径，云端快照不可用
