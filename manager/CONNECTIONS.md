# 外部连接清单

## GitHub

用途：源码、审批、版本历史、自动报告与备份。

状态：本系统通过 Pull Request 工作，不直接发布到 `main`。

## Netlify

用途：正式部署、Deploy Preview、Web Analytics、Real User Monitoring、部署通知。

建议设置：

1. 确认项目由 GitHub `main` 自动部署；
2. 开启 Deploy Previews；
3. 开启 Web Analytics 与 Real User Monitoring；
4. 开启 Deploy failed / Deploy succeeded Email Notification；
5. 保留 `ANTHROPIC_API_KEY` 在 Netlify Environment Variables，不写入代码。

## AI 内容草稿

GitHub Actions 需要单独的 `ANTHROPIC_API_KEY` Repository Secret。Netlify 内的 Secret 不会自动分享给 GitHub。

## 后续可选连接

- Google Search Console：关键字、曝光与点击报告；
- Plausible 或 GA4：事件型转化追踪；
- Resend：表单确认电邮；
- CRM / Google Sheet：客户明确同意后才保存线索。

所有连接都应采用最小权限独立账号，不共用主密码。
