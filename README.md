# 万能生活清单助手 - 微信小程序云开发版

这是一个适合个人开发者起步的微信小程序完整工程包，定位为：

- 不接微信支付
- 不做头像、文案、AI 生成器
- 使用原生微信小程序技术
- 已接入微信云开发 CloudBase
- 本地缓存优先，云端同步增强
- 支持收藏、最近使用、自定义清单、勾选进度、反馈、分享
- 已加入 Codex AI 员工团队配置

## 一、当前功能

### 已实现页面

```text
pages/index/index          首页：搜索、热门分类、热门清单、最近使用
pages/category/category    分类：按场景查看模板
pages/checklist/checklist  清单详情：勾选、进度、收藏、添加、删除、重置、分享
pages/mine/mine            我的：收藏、自定义清单、反馈、云端同步、本地数据管理
```

### 已实现云开发能力

```text
cloudfunctions/login             获取 openid
cloudfunctions/initTemplates     初始化 20 个内置模板到云数据库
cloudfunctions/getTemplates      查询云端清单模板
cloudfunctions/syncUserData      同步收藏、最近使用、自定义清单、勾选进度
cloudfunctions/submitFeedback    提交用户反馈
cloudfunctions/createShareList   创建共享清单快照
```

### 已内置模板

当前内置 20 个模板，覆盖：

```text
出行旅行：旅行、出差、露营、自驾
搬家租房：搬家、租房验房、退租
装修家居：新房入住、装修验收、家电购买
母婴家庭：待产包、宝宝出门、家庭应急
学习考试：开学、考试、面试
银发生活：老人就医、防诈骗、老人手机设置
活动筹备：春节回家、生日聚会、婚礼筹备
```

## 二、如何在微信开发者工具运行

1. 下载并解压本项目 zip。
2. 打开微信开发者工具。
3. 选择“导入项目”。
4. 项目目录选择解压后的根目录。
5. AppID 改成你自己的个人小程序 AppID。
6. 点击编译。

如果要上传审核，请把 `project.config.json` 里的：

```json
"appid": "touristappid"
```

改成你自己的小程序 AppID。

## 三、如何启用云后台

详细步骤见：

```text
docs/CLOUD_BACKEND_SETUP.md
```

核心步骤：

```text
1. 在微信开发者工具中开通云开发环境
2. 复制云环境 ID
3. 修改 config/cloud.js
4. 部署 cloudfunctions 目录下的云函数
5. 调用 initTemplates 初始化模板数据
6. 重新编译小程序
```

云环境配置文件：

```js
// config/cloud.js
const CLOUD_ENV_ID = '你的云环境ID';
const ENABLE_CLOUD = true;
```

如果没有配置云环境，项目仍然可以用本地缓存运行。

## 四、项目结构

```text
life-checklist-codex-package/
├─ app.js
├─ app.json
├─ app.wxss
├─ project.config.json
├─ sitemap.json
├─ config/
│  └─ cloud.js
├─ data/
│  └─ templates.js
├─ utils/
│  ├─ storage.js
│  ├─ checklist.js
│  ├─ cloudApi.js
│  └─ cloudSync.js
├─ pages/
│  ├─ index/
│  ├─ category/
│  ├─ checklist/
│  ├─ custom/
│  └─ mine/
├─ cloudfunctions/
│  ├─ login/
│  ├─ initTemplates/
│  ├─ getTemplates/
│  ├─ syncUserData/
│  ├─ submitFeedback/
│  └─ createShareList/
├─ docs/
│  ├─ CLOUD_BACKEND_SETUP.md
│  ├─ CLOUD_DEPLOY_CHECKLIST.md
│  ├─ DB_SCHEMA.md
│  └─ AI_EMPLOYEES.md
├─ AGENTS.md
├─ CODEX_TASKS.md
├─ PROJECT_WORKFLOW.md
└─ .codex/
```

## 五、云数据库集合

```text
checklist_templates   清单模板库
app_config            应用配置
user_data             用户同步数据
feedbacks             用户反馈
shared_lists          共享清单快照
```

具体字段见：

```text
docs/DB_SCHEMA.md
```

## 六、如何交给 Codex 继续开发

推荐把本项目作为一个 Git 仓库：

```bash
git init
git add .
git commit -m "init life checklist mini program with cloud backend"
```

然后在 Codex 中打开仓库，直接使用 `CODEX_TASKS.md` 或 `.codex/tasks/EMPLOYEE_PROMPTS.md` 里的任务提示。

推荐你在 Codex 里先复制这条任务：

```text
请先阅读 AGENTS.md、docs/CLOUD_BACKEND_SETUP.md、docs/DB_SCHEMA.md、docs/CLOUD_DEPLOY_CHECKLIST.md、docs/AI_EMPLOYEES.md 和 .codex/teams/life-checklist-team.yaml。然后检查微信云开发接入是否完整，输出 docs/cloud_backend_test_report.md。当前项目不要接微信支付，不要引入传统服务器，不要删除本地缓存降级能力。
```

## 七、AI 员工团队

本项目已经加入适合 Codex 使用的 AI 员工配置：

```text
product-planner                 产品策划
miniprogram-developer           小程序开发
cloudbase-backend-developer     微信云开发后端
ui-designer                     UI 设计
checklist-content-operator      清单内容运营
qa-tester                       测试验收
growth-compliance               合规增长
```

入口文件：

```text
docs/AI_EMPLOYEES.md
.codex/teams/life-checklist-team.yaml
.codex/tasks/EMPLOYEE_PROMPTS.md
.codex/agents/*.md
.codex/skills/*/SKILL.md
```

## 八、后续迭代建议

优先级从高到低：

1. 在微信开发者工具中完成云开发部署。
2. 用 `initTemplates` 初始化云端模板库。
3. 扩充到 50+ 清单模板。
4. 增加共享清单详情页，支持家人查看同一份清单。
5. 增加运营配置，例如热门模板排序、推荐位开关。
6. 用户量达标后，申请小程序流量主广告。

## 九、注意事项

- 本项目不包含微信支付。
- 本项目不提供医疗、法律、金融等专业建议。
- “老人就医准备清单”“待产包清单”等只做物品准备提醒，不做诊断、治疗或用药建议。
- 上线前请在微信公众平台确认服务类目是否匹配。
- 云开发上线前，请检查数据库权限，避免用户越权读取他人数据。
