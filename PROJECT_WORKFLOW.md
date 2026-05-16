# PROJECT_WORKFLOW.md

## 项目总目标

开发一个个人主体可上线的微信小程序：“万能生活清单助手”。

核心价值：帮助用户在旅行、搬家、装修、待产、开学、老人就医等生活场景中防止遗漏事项。

## 阶段 0：初始化检查

负责人：开发 Agent

输出：

```text
确认项目能在微信开发者工具编译
确认 app.json 页面配置正确
确认首页、分类、详情、新建、我的 5 个页面可访问
```

Codex 提示词：

```text
请检查当前微信小程序项目结构，确认 app.json、pages、utils、data 是否完整。不要新增云后台，不要引入 npm。发现明显编译问题请直接修复，并列出修复文件。
```

## 阶段 1：产品体验打磨

负责人：产品/策划 Agent

目标：让用户一眼知道这个小程序能解决什么问题。

输出文档：

```text
docs/product_home_optimization.md
```

Codex 提示词：

```text
你是产品策划。请基于当前“万能生活清单助手”项目，分析首页、分类页、清单详情页的用户体验，输出 docs/product_home_optimization.md。重点检查：首页是否清楚、模板是否够实用、分享动机是否明确、是否适合个人小程序上线。不要修改代码。
```

## 阶段 2：模板扩充

负责人：内容 Agent

目标：把内置模板从 20 个扩充到 50 个。

输出：

```text
data/templates.js
```

Codex 提示词：

```text
请在 data/templates.js 中把生活清单模板从当前 20 个扩充到 50 个。要求保持已有数据结构不变，覆盖出行、搬家租房、装修家居、母婴家庭、学习考试、银发生活、活动筹备。不要添加医疗诊断、金融建议、法律结论。每个模板至少 3 个分组，每个分组至少 4 个事项。
```

## 阶段 3：UI 优化

负责人：UI Agent

目标：提升卡片层次、首页视觉、详情页操作效率。

输出：

```text
pages/**/*.wxss
app.wxss
```

Codex 提示词：

```text
请优化当前微信小程序 UI，但不要改变功能逻辑。重点优化：首页 hero 区、分类卡片、清单详情页进度区域、我的页面列表。保持工具型、清爽、蓝色主视觉。不要引入图片素材和第三方库。
```

## 阶段 4：功能增强

负责人：开发 Agent

建议增强功能：

```text
1. 清单复制
2. 分类内搜索
3. 常用模板置顶
4. 分享后打开指定清单
5. 自定义清单编辑
6. 分享海报预留入口
```

Codex 提示词：

```text
请为当前小程序增加“自定义清单编辑”能力。用户在我的页面点击自定义清单后，详情页可以新增、删除、重命名事项。保持本地存储，不要接云后台。完成后说明修改了哪些文件，以及如何在微信开发者工具中验证。
```

## 阶段 5：云后台准备

当前阶段不要直接做，等用户量起来后再做。

未来云开发集合建议：

```text
checklist_templates 云端模板
user_checklists 用户清单
user_favorites 用户收藏
feedback 用户反馈
share_lists 共享清单
```

Codex 提示词：

```text
请设计第二版微信云开发方案，只输出 docs/cloudbase_plan.md，不要修改当前代码。要求包含数据库集合设计、云函数列表、迁移步骤、风险点和不接微信支付的广告变现路径。
```

## 阶段 6：上线前检查

负责人：测试 Agent

测试清单：

```text
首页能打开
分类能切换
搜索能返回结果
清单能勾选
进度能变化
新增事项能保存
删除事项能保存
重置能恢复
收藏能在我的页展示
自定义清单能创建
分享路径能打开
清空本地数据有效
```

Codex 提示词：

```text
请对当前微信小程序做上线前静态检查。重点检查 JS 语法、WXML 绑定、app.json 页面路径、本地存储 key、空数据状态、用户隐私风险。请直接修复低风险问题，并输出测试报告 docs/release_checklist.md。
```

---

## AI 员工协作流程

本项目已加入 6 个 AI 员工，统一说明见：

```text
docs/AI_EMPLOYEES.md
.codex/teams/life-checklist-team.yaml
.codex/tasks/EMPLOYEE_PROMPTS.md
```

### 阶段 A：整体设计

负责人：

```text
product-planner
合规增长 growth-compliance
```

输出：

```text
docs/product_mvp_plan.md
docs/growth_compliance_plan.md
```

目标：先明确万能生活清单助手第一版到底做什么、不做什么、哪些功能延后。

### 阶段 B：可运行检查

负责人：

```text
miniprogram-developer
qa-tester
```

输出：

```text
低风险问题直接修复
docs/release_checklist.md
```

目标：确保项目能在微信开发者工具里导入、编译、打开页面。

### 阶段 C：内容扩充和 UI 优化

负责人：

```text
checklist-content-operator
ui-designer
```

输出：

```text
data/templates.js
docs/template_expansion_notes.md
app.wxss
pages/**/*.wxss
```

目标：把清单模板扩充到 50 个，并优化工具型小程序界面体验。

### 阶段 D：功能增强

负责人：

```text
miniprogram-developer
qa-tester
```

输出：

```text
分类内搜索
自定义清单编辑
分享路径优化
docs/release_checklist.md 更新版
```

目标：在不接云后台的前提下，增强本地可用体验。

### 阶段 E：上线准备

负责人：

```text
growth-compliance
qa-tester
```

输出：

```text
docs/ad_monetization_plan.md
docs/final_release_checklist.md
```

目标：检查个人主体上线边界、隐私风险、广告接入准备和最终验收。

---

# 云开发接入阶段

## 阶段目标

把“万能生活清单助手”从本地 MVP 升级为微信云开发版，同时保留本地降级能力。

## 执行顺序

```text
1. cloudbase-backend-developer 检查 config/cloud.js 和 cloudfunctions 目录
2. cloudbase-backend-developer 输出 docs/cloud_backend_test_report.md
3. miniprogram-developer 检查首页、分类页、详情页、我的页的云端调用 fallback
4. qa-tester 根据 docs/CLOUD_DEPLOY_CHECKLIST.md 做测试
5. growth-compliance 检查是否仍符合个人开发者、不接支付、轻工具定位
```

## Codex 可复制指令

```text
请按云开发接入阶段工作。先由 cloudbase-backend-developer 检查微信云开发接入完整性，再由 miniprogram-developer 检查前端调用和本地 fallback，最后由 qa-tester 输出 docs/cloud_backend_test_report.md 和 docs/release_checklist.md。不要接微信支付，不要引入传统服务器。
```
