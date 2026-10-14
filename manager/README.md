# 壶中天机 AI Website Manager V1

这套系统把网站管理分成四层：**监测、保护、提案、批准发布**。

## 已包含

### 1. 每日网站健康检查

GitHub Actions 每天检查：

- 首页及主要页面是否可访问；
- 页面响应时间；
- 内部链接、Logo 与必要素材；
- `壶中天机`、`壶中日签`、`壶中罗盘` 是否仍存在；
- WhatsApp 是否仍为 `+65 8014 8899`；
- 标题、Meta Description、Open Graph、H1、Canonical 与 JSON-LD；
- `robots.txt` 与 `sitemap.xml`。

发现问题时，系统会建立或更新一个 GitHub Issue；恢复正常后会自动关闭该 Issue。

### 2. Pull Request 护栏

每次修改网站时自动执行：

- Repo 品牌与联系方式检查；
- API key／Secret 误提交扫描；
- AI 管理文章的必要字段、免责声明、危险链接与绝对化表述检查；
- Next.js production build。

### 3. AI 内容提案

从 GitHub Actions 手动输入文章标题、重点、语言、来源备注和 CTA 后，系统会：

1. 生成一份待审核文章；
2. 写入 `content/managed-articles.json`；
3. 验证免责声明、内容结构、链接协议与禁用表述；
4. 执行 production build；
5. 建立 Draft Pull Request；
6. 等待人工审阅。

文章只有在 Draft Pull Request 被人工确认并合并后，才会进入 `/articles` 页面并由 Netlify 部署。系统不会自行合并，也不会自动修改价格、付款链接或法律内容。

没有设置 AI Secret 时，系统会产生一份清楚标注的审核模板，而不是凭空编写内容。

### 4. 每周备份

每周生成：

- 完整 Git bundle；
- 网站源代码压缩包；
- 30 天 GitHub Actions Artifact 保留期。

GitHub 本身仍是主要版本历史与回滚来源。

## 需要的连接

### 已可运行，不需额外 Secret

- Daily Health Check
- PR Guardrails
- Weekly Backup

### 生成 AI 内容草稿时需要

在 GitHub Repository：

`Settings → Secrets and variables → Actions → New repository secret`

加入：

- `ANTHROPIC_API_KEY`
- 可选 Repository Variable：`WEBSITE_MANAGER_MODEL`

不要把 API key 写进任何文件。

### 流量与访客分析

建议在 Netlify 后台启用：

- Web Analytics
- Real User Monitoring
- Deploy failure notifications

这些需要在 Netlify 账户中启用，不需要把账号密码交给 AI。

## 推荐批准规则

在 GitHub `main` branch 设置：

- Require a pull request before merging
- Require status checks：`Website Manager Guardrails`
- Require one approval
- 禁止直接 push 到 `main`

## 常用命令

```bash
node scripts/website-manager.mjs health
node scripts/website-manager.mjs repo-check
node scripts/website-manager.mjs verify-content
node manager/verify-managed-content.mjs
```

本地建立管理文章提案：

```bash
CONTENT_TITLE="为什么出生时辰会影响命盘" \
CONTENT_FOCUS="说明时柱在传统八字中的作用，不作决定论" \
CONTENT_LANG="bilingual" \
CONTENT_SOURCE_NOTES="只使用已经审核的课程资料" \
node manager/content-proposal.mjs
```

## 安全边界

健康检查只读取公开网页，不采集客户出生资料、表单内容、付款资料或 WhatsApp 对话。
