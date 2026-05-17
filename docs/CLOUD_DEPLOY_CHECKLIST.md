# 云开发上线检查清单

## 开发前

- [ ] 已注册微信小程序 AppID
- [ ] 已在微信开发者工具中开通云开发
- [ ] 已复制云环境 ID
- [ ] 已填写 `config/cloud.js` 的 `CLOUD_ENV_ID`
- [ ] `project.config.json` 已包含 `cloudfunctionRoot: "cloudfunctions/"`

## 云函数部署

- [ ] 部署 `login`
- [ ] 部署 `initDatabase`
- [ ] 部署 `initTemplates`
- [ ] 部署 `getTemplates`
- [ ] 部署 `syncUserData`
- [ ] 部署 `submitFeedback`
- [ ] 部署 `createShareList`

## 数据初始化

- [ ] 调用 `initDatabase`
- [ ] 检查 5 个集合已创建
- [ ] 调用 `initTemplates`
- [ ] 检查 `checklist_templates` 有 25 条模板数据
- [ ] 检查 `app_config` 有 categories 配置

## 小程序测试

- [ ] 首页能显示热门清单
- [ ] 分类页能显示云端模板
- [ ] 清单详情能正常勾选
- [ ] 常用清单设置后重新打开仍保留
- [ ] 生成我的清单后能在“我的”页最近生成中看到
- [ ] 最近生成清单进入后为只读展示
- [ ] 分享清单能生成共享快照
- [ ] 提交反馈后 `feedbacks` 集合有记录
- [ ] 未配置云环境时仍可本地运行

## 上线前风险检查

- [ ] 不接微信支付
- [ ] 不强制手机号授权
- [ ] 不做医疗诊断、用药建议、金融建议、法律结论
- [ ] 老人、母婴、就医相关内容仅作为生活准备清单
- [ ] 服务类目与实际功能一致
