壶中天机 · 黑金版 WhatsApp 更新包
更新日期：2026-09-27

联系号码：+65 8014 8899
WhatsApp：https://wa.me/6580148899

本包基于你提供的 huzhong-tianji-v2/index.html。
保留黑金配色、首页罗盘、页面布局、七项服务与中英文切换。
正式 Logo 使用你提供的原始品牌图片，未重绘。

本次新增／修复：
- 桌面浮动 WhatsApp 咨询窗口及手机版底部联系按钮。
- 五个快捷咨询主题、自定义留言、各服务的购买前咨询、页尾号码。
- 表单将填写资料带入 WhatsApp，由客户自行确认发送；不会调用原来未配置的 Web3Forms。
- 导航新增「壶中罗盘 / Compass」，指向现有壶中指南针服务。
- 壶中指南针没有有效 Stripe 付款链接，因此该服务按钮改为 WhatsApp 咨询。
- 其余六个原有 Stripe 链接和七项服务价格均保留。
- 补齐缺失的品牌图像引用、favicon 和社交分享图。

说明：保留的是现有首页罗盘图形和个人方位报告服务，未新增个人化罗盘运算。
此更新不审核原有日签／命理算法，也未验证外部付款页面或 Calendly 账户。

部署：
1. 解压 ZIP。
2. 将完整 site 文件夹（里面直接包含 index.html 及其余文件）部署到现有 Netlify 项目。
3. 发布后检查 WhatsApp、付款与预约链接。
本版本通过现有 GitHub main 分支交由 Netlify 自动部署。

文件：
index.html                 主页面及服务数据
contact.js          咨询窗口、联系入口与表单转交
contact.css         沿用黑金配色的联系组件样式
brand-logo.png       原始正式 Logo
robots.txt / sitemap.xml   原文件保持不变

联系号码设置：
index.html 的 WHATSAPP_NUMBER = '6580148899' 控制所有 WhatsApp 目标。
显示号码位于 contact.js 和本说明，更新号码时请同步修改。
网站仅保存语言偏好；本次新增功能不保存出生资料或咨询留言。
