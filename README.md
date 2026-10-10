# 壺中天機 · huzhongtianji.netlify.app

One Next.js project:
- `/` → `public/home.html` — the original brand site (services, Stripe, 日签, 抽签, Calendly, WhatsApp). Edit it as plain HTML.
- `/pan` → `app/pan/page.js` — AI 排盘 engine: 8 chart systems × 9 reading modes, streaming readings.
- `/tools/*` → five free deterministic tools (五行查询 / 农历换算 / 手机号码 / 车牌 / 姻缘何时来), `lib/tools.js`, no AI cost.
- `/api/reading` → server route calling Claude. Needs `ANTHROPIC_API_KEY` in Netlify env vars.

Engines live in `lib/` (see comments in each file). Voice & mode prompts: `lib/prompts.js`.
