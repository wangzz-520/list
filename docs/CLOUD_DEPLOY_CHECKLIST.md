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
- [ ] 部署 `adminManager`
- [ ] 部署 `createShareList`
- [ ] 部署 `getShareQrCode`
- [ ] 确认 `getShareQrCode/config.json` 已随云函数上传，允许调用 `wxacode.getUnlimited`

## 数据初始化

- [ ] 调用 `initDatabase`
- [ ] 如果 `initDatabase` 超时，改用 `operation: "collections"`、`operation: "config"`、`operation: "templates"` 分步初始化
- [ ] 检查 5 个集合已创建：`checklist_templates`、`app_config`、`user_data`、`feedbacks`、`shared_lists`
- [ ] 检查 `initDatabase` 返回 `seeded: true`
- [ ] 检查 `checklist_templates` 有模板数据
- [ ] 检查 `app_config` 有 `categories` 配置
- [ ] 检查 `app_config` 有 `admin_openids` 配置
- [ ] 在 `app_config` 的 `admin_openids.value` 中加入管理员 openid

## 小程序测试

- [ ] 首页能显示热门清单
- [ ] 分类页能显示云端模板
- [ ] 清单详情能正常勾选、添加事项和生成我的清单
- [ ] 生成后的清单能在“我的”页最近生成中看到
- [ ] 已生成清单点击“分享清单”后，`shared_lists` 集合新增快照
- [ ] 分享卡片打开后进入 `/pages/checklist/checklist?shareId=...` 并显示对应清单
- [ ] 已生成清单点击“保存分享海报”后，图片保存到相册，扫码能打开对应清单
- [ ] 常用清单设置后重新打开仍保留
- [ ] 管理员账号能看到“管理员中心”
- [ ] 普通用户看不到“管理员中心”
- [ ] 管理员可查看用户反馈
- [ ] 提交反馈后 `feedbacks` 集合有记录
- [ ] 未配置云环境时仍可本地运行

## 上线前风险检查

- [ ] 不接微信支付
- [ ] 不强制手机号授权
- [ ] 不做医疗诊断、用药建议、金融建议、法律结论
- [ ] 老人、母婴、就医相关内容仅作为生活准备清单
- [ ] 服务类目与实际功能一致
