# 原网站整合 · Site continuity

基准：`4cf9ddfa27aa90545fba0acfd2c629bee8df6a6f`。
本次是原 `huzhong-tianji-site` 的增量整合，不是新网站，也不覆盖原有产品。

## 本次范围

- 保留现有完整品牌图片 `public/brand-logo.png`，只调整显示尺寸，不裁切、不重绘。
- 保留 `contact.js` 中已有的双语欢迎弹窗；只改善外观、屏幕适配及语言衔接，不叠加第二个弹窗。
- 首页新增四个明确入口：日签、原有罗盘服务、紫微命盘、综合排盘；导航补上紫微入口。
- 修正大 Logo 与长导航挤占空间、锚点被固定页头遮挡的问题。
- 使用原 `lib/i18n.js` 中的语言偏好键，连接首页、弹窗与既有排盘页面的语言选择。
- 保留 WhatsApp `+65 8014 8899` 及原有咨询窗口，不自动发送消息或采集个人资料。
- 不修改命理算法、付款链接、价格、隐私与服务条款、原有 11 种排盘模式。

## 实现

`npm run build` / `npm run dev` 的 prebuild / predev 会运行
`node scripts/site-continuity.mjs`，在原 `public/home.html` 增量插入入口和样式／脚本引用。
安装器可重复执行，且会核对原有 inline scripts 保持逐字相同。
不要使用旧下载包覆盖现有仓库。

## 验收

`Original Site Continuity` 工作流在临时测试服务上进行 7 组 Chromium 检查，
包含中文／英文、桌面／手机／平板／低高度横屏，输出截图及结果。
检查：完整横版 Logo、单一弹窗、YES 到日签、关闭解锁滚动、原栏目存在、
无横向溢出、手机菜单、WhatsApp 链接、进入紫微页面、保留 11 个原有模式。
不提交客户资料、不进行付款、不调用付费 AI 解读。

测试完成状态应以 GitHub Actions 实际运行结果为准。本文件不是“已通过”的声明。
上线须先查看本 PR 的 Deploy Preview，正式部署状态另行确认。
Website Manager 的排程执行、API Secret 和账户分析开关不属于本次已验收范围。
