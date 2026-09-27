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

DAILY PAGE / MANUAL WHATSAPP SUBSCRIPTION
The daily page uses Singapore dates and 372 Chinese editorial reflections on rotation.
Subscription form requires an international phone number and explicit consent. It opens a prefilled WhatsApp draft to +65 8014 8899; the customer must send it and the owner must confirm registration. No subscriber database or automatic customer messages are implemented. Reply STOP / 停止 to unsubscribe; the owner must remove that subscriber manually.
A Codex heartbeat is scheduled for 06:00 Asia/Singapore to prepare a PDF in this conversation. It depends on the local app/runtime being available. Website date rotation runs in the browser independently.
Daily PDF source and generator: sibling daily/content.json and daily/make_pdf.py (kept outside the public deploy package).

ALMANAC: lunar-javascript 1.7.7 bundled in contact.js (MIT); PDF uses lunar_python 1.4.8. Fu direction uses sect 2. Zodiac harmonies follow day branch. Colours use day-stem element; Hetu numbers Wood 3/8, Fire 2/7, Earth 5/10, Metal 4/9, Water 1/6. These are explicitly labelled cultural references.

CURRENT SHARING FLOW: Public phone labels removed. Phone registration replaced with WhatsApp group icon and free, personal best-effort service statement. The owner has not yet supplied a group invite URL; button remains explicitly disabled until provided. Contact wa.me destinations remain configured internally. Artwork is from the project-only authorized library at ../huzhongtianji-image-library; original sheet is retained intact and decorative viewports rotate daily.

Popup V2：保留黑金主站，每次打开或刷新页面均显示，可关闭。纪念日依用户提供农历表，常规月份按原月日；不自动重复闰月，不将三十移至二十九。五月十六佛诞为参考表日期，明确标注，不代表所有传统。

最新订阅方式：已改用用户提供的 WhatsApp Business 原始二维码，可扫码打开工作室聊天申请日签分享；手机按钮也可直接申请。此二维码不是群邀请，不会自动入群。

壶中度月 / The Twelve-Month Journey：SGD 68，一次交付完整 PDF；从购买月份下个月起连续 12 个公历月份。新服务咨询与订单资料接现有 WhatsApp，尚无独立付款链接。个人分析需客户生辰资料，不使用通用预测冒充个人报告。
