# 云数据库集合设计

## checklist_templates

用途：云端清单模板库。

```json
{
  "id": "travel_basic",
  "title": "旅行清单",
  "category": "travel",
  "icon": "🎒",
  "heat": 98,
  "description": "适合短途、长途、亲子旅行...",
  "groups": [
    {
      "id": "docs",
      "name": "证件资料",
      "items": ["身份证", "驾驶证"]
    }
  ],
  "status": "online",
  "version": 1,
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```

## app_config

用途：保存分类、管理员白名单等应用配置。

```json
{
  "key": "categories",
  "value": [],
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```

管理员白名单配置：

```json
{
  "key": "admin_openids",
  "value": ["管理员openid"],
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```

说明：管理员入口由 `adminManager` 云函数按当前用户 openid 判断，普通用户不会在“我的”页看到管理员入口。

## user_data

用途：用户私有数据同步。只能通过云函数按 `_openid` 隔离读写。

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
  "appid": "小程序appid",
  "unionid": "用户unionid，没有则为空",
  "lastLoginAt": "serverDate",
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```

## feedbacks

用途：收集用户反馈。

```json
{
  "_openid": "用户openid",
  "content": "希望增加某个清单",
  "meta": {
    "page": "mine"
  },
  "status": "new",
  "createdAt": "serverDate"
}
```

## shared_lists

用途：保存分享出去的清单快照。它不是多人协作清单，只用于让接收方通过 `shareId` 打开一份固定内容。

```json
{
  "_openid": "创建分享的用户openid",
  "sourceId": "原始模板或自定义清单id",
  "title": "我的旅行清单",
  "icon": "🎒",
  "description": "清单说明",
  "groups": [
    {
      "id": "docs",
      "name": "证件资料",
      "items": [
        {
          "id": "item_1",
          "text": "身份证",
          "checked": false,
          "custom": true
        }
      ]
    }
  ],
  "status": "active",
  "version": 1,
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```

说明：
- 前端不直接读写 `shared_lists`，统一调用 `createShareList` 云函数。
- 创建分享时保存当前页面的清单快照，之后用户继续编辑本地清单不会影响已分享出去的快照。
- 读取分享时云函数不会返回 `_openid`。
