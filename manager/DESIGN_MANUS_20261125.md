# Manus reference refresh — 25 November 2026

Requested reference: https://huzhong-hafpr72h.manus.space

Updates the existing Netlify homepage with the reference's ink, cream and vermilion palette, single-row header, watercolor vessel artwork, editorial section layout, chapter preview, dark service grid and mobile service carousel. The full-resolution artwork matches the later supplied `huzhong-site.zip` byte-for-byte. Its 480px and 800px variants are taken directly from that archive and selected responsively; the responsive footer landscape is also copied from that archive. No external Manus runtime or analytics are embedded.

Original inline scripts remain byte-identical to the main-branch baseline. Existing prices, Stripe destinations, contact details, legal text, chart engines and reading endpoints are unchanged. Presentation adapters only decorate service cards and reposition the daily almanac. Full daily almanac content remains available.

Local verification: production build and manager guardrails pass. Desktop 1280px, mobile 390px and narrow English 320px inspected in browser; no page overflow or JavaScript errors observed. Checked language switching, all eight service prices, mobile menu, keyboard reachability of the final service, report keyboard navigation, local draw result, daily date changes and eight form options. CI expands these flows across seven viewport/locale cases and runs the existing chart-layout suite before merging.

Rollback baseline: bac3a5d90775bad2a97dedf2cd0d1a31d77f0878.
