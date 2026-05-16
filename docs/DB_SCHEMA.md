# 云数据库集合设计

## checklist_templates

用途：云端清单模板库。

字段：

```json
{
  "id": "travel_basic",
  "title": "旅行清单",
  "category": "travel",
  "icon": "🧳",
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

用途：保存分类、运营配置、广告开关等。

当前已写入：

```json
{
  "key": "categories",
  "value": [],
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```

## user_data

用途：用户数据同步。

字段：

```json
{
  "_openid": "用户openid",
  "data": {
    "schemaVersion": 1,
    "drafts": {},
    "favorites": [],
    "recents": [],
    "customLists": [],
    "feedbacks": [],
    "clientExportedAt": 1710000000000
  },
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```

## feedbacks

用途：收集用户反馈。

字段：

```json
{
  "_openid": "用户openid",
  "content": "希望增加宠物出行清单",
  "meta": {
    "page": "mine"
  },
  "status": "new",
  "createdAt": "serverDate"
}
```

## shared_lists

用途：保存共享清单快照。第一版只创建云端快照，后续可扩展为多人协作。

字段：

```json
{
  "_openid": "创建者openid",
  "sourceId": "travel_basic",
  "title": "旅行清单",
  "icon": "🧳",
  "groups": [],
  "status": "active",
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```
