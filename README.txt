壶中天机 · 新版网站部署包
=================================

部署步骤（2 分钟）：
1. 打开 https://app.netlify.com/projects/huzhongtianji/overview
2. 左侧菜单选 "Deploys"
3. 把本文件夹里的所有文件（index.html、robots.txt、sitemap.xml）拖进页面
4. 等待几秒，网站自动更新

⚠️ 部署前必须替换 2 处（在 index.html 里搜索即可找到）：

① Web3Forms Access Key
   到 https://web3forms.com/ 免费注册 → 复制你的 access_key
   在 index.html 搜索 YOUR_WEB3FORMS_ACCESS_KEY → 替换
   否则客户提交表单会失败。

② 壶中指南针 Stripe 付款链接
   到 https://dashboard.stripe.com/payment-links 创建一笔 SGD 98 的链接
   在 index.html 搜索 REPLACE_WITH_COMPASS_LINK → 替换为真实链接
   否则客户点"选择此项"会跳到 404。

建议用 VS Code 或记事本打开 index.html，Ctrl+F 搜索即可。

文件清单：
- index.html   主网页（完整新版，含一签/日签/七项服务/中英双语）
- robots.txt   告诉搜索引擎可以收录
- sitemap.xml  搜索引擎地图

域名：当前使用 https://huzhongtianji.netlify.app/
以后买域名时，把 index.html 里所有 netlify.app 批量替换为新域名即可。
