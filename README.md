# 壺中天機 · huzhongtianji.netlify.app

One Next.js project:
- `/` → `public/home.html` — the original brand site (services, Stripe, 日签, 抽签, Calendly, WhatsApp). Edit it as plain HTML.
- `/pan` → `app/pan/page.js` — AI 排盘 engine: 8 chart systems × 9 reading modes, streaming readings.
- `/api/reading` → server route calling Claude. Needs `ANTHROPIC_API_KEY` in Netlify env vars.

Engines live in `lib/` (see comments in each file). Voice & mode prompts: `lib/prompts.js`.
