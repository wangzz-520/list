# Codex 可直接复制的任务提示词

## 任务 1：检查项目是否能运行

```text
请检查这个微信小程序项目是否能在微信开发者工具中编译。重点检查 app.json、project.config.json、页面路径、JS require 路径、WXML 绑定变量。不要接云后台，不要引入 npm。发现问题请直接修复，并给出验证步骤。
```

## 任务 2：把模板扩充到 50 个

```text
请扩充 data/templates.js，把当前 20 个生活清单模板扩充到 50 个。保持 categories 和 template 数据结构不变。每个模板必须包含 id、title、category、icon、heat、description、groups。每个模板至少 3 个分组，每个分组至少 4 个事项。不要加入医疗诊断、投资建议、法律结论、支付或交易相关功能。
```

## 任务 3：优化 UI

```text
请优化当前微信小程序 UI。要求：工具型、清爽、适合个人小程序上线；主色保持 #2f6fed；提升首页、分类页、清单详情页、我的页面的视觉层次。不要引入第三方 UI 库，不要使用网络图片，不要改变核心业务逻辑。
```

## 任务 4：增加分类内搜索

```text
请在 pages/category/category 页面增加分类内搜索。用户输入关键词后，只筛选当前分类下匹配标题、描述、分组名或事项内容的模板。保持本地数据，不接云后台。完成后说明修改文件和验证方式。
```

## 任务 5：增加自定义清单编辑

```text
请为自定义清单增加编辑能力。用户可以在详情页修改自定义清单标题、添加分组、删除分组、修改事项文本。要求兼容现有本地数据结构，不影响内置模板。不要接云后台，不引入 npm。
```

## 任务 6：输出云开发二期方案

```text
请只输出 docs/cloudbase_plan.md，不要修改源码。内容包括：为什么第一版不接云后台、第二版什么时候接入云开发、数据库集合设计、云函数设计、用户数据迁移方案、家庭共享清单方案、反馈收集方案、上线风险。
```

## 任务 7：上线前测试报告

```text
请做上线前静态测试，输出 docs/release_checklist.md。检查页面路径、JS 语法、WXML 绑定、本地存储、空状态、分享路径、敏感内容边界、用户隐私、是否误触微信支付或登录授权。能直接修复的小问题请修复。
```

## 任务 8：先让 AI 员工团队接管项目

```text
请先阅读 AGENTS.md、docs/AI_EMPLOYEES.md、.codex/teams/life-checklist-team.yaml、.codex/tasks/EMPLOYEE_PROMPTS.md。然后按照以下 AI 员工顺序推进项目：

第 1 批：product-planner 输出 docs/product_mvp_plan.md；growth-compliance 输出 docs/growth_compliance_plan.md。
第 2 批：miniprogram-developer 检查并修复项目可运行问题；qa-tester 输出 docs/release_checklist.md 初版。
第 3 批：checklist-content-operator 扩充 data/templates.js 到 50 个模板；ui-designer 优化首页、分类页、详情页、我的页 UI。
第 4 批：miniprogram-developer 增加分类内搜索、自定义清单编辑、分享路径优化；qa-tester 做回归测试。

每个员工都必须按自己的 .codex/agents/*.md 身份执行，并在输出中说明：目标、影响文件、修改内容、验证方式、潜在风险。当前阶段不要接微信支付，不要接云后台，不要引入 npm。
```

## 任务 9：只生成 AI 员工阶段计划，不改代码

```text
请读取 docs/AI_EMPLOYEES.md 和 .codex/teams/life-checklist-team.yaml，只输出 docs/ai_team_execution_plan.md，不要修改源码。内容包括：每个 AI 员工的职责、输入文件、输出文件、执行顺序、交接标准、验收标准、风险控制。
```

---

# 云开发版新增任务

## 任务：检查微信云后台接入

```text
请阅读 AGENTS.md、docs/CLOUD_BACKEND_SETUP.md、docs/DB_SCHEMA.md、docs/CLOUD_DEPLOY_CHECKLIST.md、config/cloud.js、utils/cloudApi.js、utils/cloudSync.js、utils/storage.js 和 cloudfunctions 目录。检查当前微信云开发接入是否完整，输出 docs/cloud_backend_test_report.md。

要求：
1. 不接微信支付。
2. 不引入传统服务器。
3. 不删除本地缓存降级能力。
4. 检查云函数返回结构是否包含 ok。
5. 检查 user_data 是否通过 openid 隔离。
6. 给出微信开发者工具里的部署步骤。
```

## 任务：完善共享清单功能

```text
请基于现有 createShareList 云函数，新增共享清单查看页 pages/share/share。要求用户打开分享链接后可以查看共享清单快照，但不要支持多人实时协作。必须保留原有普通清单详情页功能，不要接微信支付。
```
