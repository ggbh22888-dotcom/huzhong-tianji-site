"""Browser acceptance for the existing site. Never submits personal data or paid AI requests."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('CONTINUITY_BASE_URL', 'http://127.0.0.1:3000').rstrip('/')
OUT = Path('reports/site-continuity')
OUT.mkdir(parents=True, exist_ok=True)
results = []

with sync_playwright() as p:
    launch = {'headless': True}
    if os.environ.get('CHROMIUM_PATH'):
        launch['executable_path'] = os.environ['CHROMIUM_PATH']
    browser = p.chromium.launch(**launch)
    try:
        for width, height, language in [(1440, 960, 'zh-CN'), (1440, 960, 'en-GB'), (390, 844, 'zh-CN'), (390, 844, 'en-GB'), (768, 1024, 'en-GB'), (320, 740, 'zh-CN'), (844, 390, 'en-GB')]:
            context = browser.new_context(viewport={'width':width, 'height':height}, locale=language, reduced_motion='reduce')
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.route('**/api/reading', lambda route: route.abort())
            response = page.goto(BASE + '/', wait_until='domcontentloaded')
            assert response and response.status == 200
            dialog = page.locator('#hzp-dialog')
            expect(dialog).to_be_visible(timeout=15000)
            logo = dialog.locator('.hzp-logo')
            expect(logo).to_be_visible()
            page.wait_for_function("document.querySelector('#hzp-dialog .hzp-logo').naturalWidth > 0")
            ratio = logo.evaluate('(img) => img.naturalWidth / img.naturalHeight')
            assert ratio > 2, f'Expected full horizontal logo, got aspect ratio {ratio}'
            expected = '想不想洞彻' if language.startswith('zh') else 'Curious what'
            expect(page.locator('#hzp-title')).to_contain_text(expected)
            page.screenshot(path=str(OUT / f'popup-{width}-{height}-{language}.png'))
            dialog.locator('.hzp-yes').click()
            expect(dialog).not_to_be_visible()
            assert page.url.endswith('#daily')
            assert page.evaluate('document.body.style.overflow') != 'hidden'
            for id_ in ['services', 'draw', 'daily', 'book', 'compass']:
                assert page.locator(f'#{id_}').count() == 1, f'Missing original section {id_}'
            assert page.locator('#hzc-start .hzc-card').count() == 4
            assert page.locator('#hzp-dialog').count() == 1, 'Duplicate welcome popup'
            assert page.locator('.wa-launch').count() == 1, 'Duplicate contact widget'
            page.evaluate('window.scrollTo(0,0)')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'), f'Horizontal overflow at {width}'
            if width <= 900:
                menu = page.locator('.menu-btn')
                menu.click()
                expect(menu).to_have_attribute('aria-expanded','true')
                expect(page.locator('#hzc-ziwei-nav')).to_be_visible()
                page.keyboard.press('Escape')
                expect(menu).to_have_attribute('aria-expanded','false')
            page.locator('#btn-en').click()
            expect(page.locator('#hzc-heading')).to_have_text('Where would you like to begin?')
            page.locator('.wa-launch').click()
            expect(page.locator('#wa-panel')).to_be_visible()
            href = page.locator('#wa-send').get_attribute('href') or ''
            assert '6580148899' in href, 'Incorrect WhatsApp target'
            page.keyboard.press('Escape')
            expect(page.locator('#wa-panel')).not_to_be_visible()
            page.locator('#hzc-start').scroll_into_view_if_needed()
            page.screenshot(path=str(OUT / f'home-{width}-{height}-{language}.png'))
            page.locator('.hzc-ziwei').click()
            page.wait_for_url('**/ziwei-chart')
            expect(page.locator('html')).to_have_attribute('lang','en')
            assert page.locator('a[href="/"]').count() > 0, 'No way back to original homepage'
            page.goto(BASE + '/pan', wait_until='domcontentloaded')
            expect(page.locator('.modes button')).to_have_count(11)
            assert not errors, f'Browser errors: {errors}'
            results.append({'viewport':f'{width}x{height}', 'locale':language, 'status':'passed', 'logoAspectRatio':ratio})
            context.close()
    finally:
        browser.close()
        (OUT / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')

print(json.dumps({'status':'passed', 'cases':results}, ensure_ascii=False, indent=2))
