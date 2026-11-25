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
            hero = page.locator('#top')
            motion = page.locator('#hero-motion-toggle')
            expect(page.locator('#top[data-motion-ready]')).to_have_count(1)
            expect(hero).to_have_attribute('data-motion', 'paused')
            expect(hero).to_have_attribute('data-motion-active', 'false')
            expect(motion).to_have_text('播放动画' if language.startswith('zh') else 'Play animation')
            if width <= 900:
                menu = page.locator('.menu-btn')
                menu.click()
                expect(menu).to_have_attribute('aria-expanded','true')
                expect(page.locator('#hzc-ziwei-nav')).to_be_visible()
                page.keyboard.press('Escape')
                expect(menu).to_have_attribute('aria-expanded','false')
            page.locator('#btn-en').click()
            expect(page.locator('#hzc-heading')).to_have_text('Where would you like to begin?')
            expect(motion).to_have_text('Play animation')
            expect(hero).to_have_attribute('data-motion', 'paused')
            # The new report preview follows language changes and keyboard selection.
            tabs = page.get_by_role('tablist', name='Life Book chapters')
            expect(tabs).to_be_visible()
            tabs.get_by_role('tab', name='02 Work & direction').click()
            expect(page.locator('#sheet-title')).to_have_text('Find a way of working that fits.')
            tabs.get_by_role('tab', name='02 Work & direction').press('End')
            expect(page.locator('#sheet-page')).to_have_text('05 / 05')
            expect(hero).to_have_attribute('data-motion', 'paused')
            expect(page.locator('#report-panel')).to_contain_text('Not a personal chart or prediction.')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'), f'Report overflows at {width}'
            # Layout adapters must preserve all purchase routes after language re-rendering.
            services = page.locator('#svcGrid .svc')
            expect(services).to_have_count(8)
            expect(page.locator('#svcGrid a[href^="https://buy.stripe.com/"]')).to_have_count(8)
            assert page.locator('#svcGrid .svc-price').all_text_contents() == ['SGD 38', 'SGD 68', 'SGD 38', 'SGD 108', 'SGD 68', 'SGD 68', 'SGD 168', 'SGD 38']
            if width <= 620:
                # Keyboard users can reach the final card in the horizontal mobile rail.
                services.last.locator('a.btn').focus()
                assert page.locator('#svcGrid').evaluate('(el) => el.scrollLeft > 0')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
            # The moved result area must replace the empty slip and show a real local draw.
            page.locator('#drawDate').fill('1990-01-01')
            page.get_by_role('button', name='Reveal my draw', exact=True).click()
            expect(page.locator('#drawResult')).to_be_visible()
            expect(page.locator('#drawResult .gz')).to_have_text('戊辰')
            expect(page.locator('.draw-empty')).not_to_be_visible()
            # Reparenting the daily almanac must not break the existing date controls.
            before = page.locator('#dailyDate').inner_text()
            page.get_by_role('button', name='Next →', exact=True).click()
            expect(page.locator('#dailyDate')).not_to_have_text(before)
            expect(page.locator('.daily-layout > .almanac')).to_have_count(1)
            page.get_by_role('button', name='← Prev', exact=True).click()
            expect(page.locator('#dailyDate')).to_have_text(before)
            expect(page.locator('#fService option')).to_have_count(8)
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

        # Exercise real motion separately; all responsive flow cases above respect Reduce Motion.
        context = browser.new_context(viewport={'width':1280, 'height':900}, locale='en-GB', reduced_motion='no-preference')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.route('**/api/reading', lambda route: route.abort())
        page.goto(BASE + '/', wait_until='domcontentloaded')
        dialog = page.locator('#hzp-dialog')
        expect(dialog).to_be_visible(timeout=15000)
        dialog.locator('.hzp-no').click()
        expect(dialog).not_to_be_visible()
        hero, motion, art = page.locator('#top'), page.locator('#hero-motion-toggle'), page.locator('.art-image')
        art.scroll_into_view_if_needed()

        def expect_motion_advancing():
            expect(hero).to_have_attribute('data-motion', 'playing')
            expect(hero).to_have_attribute('data-motion-active', 'true')
            page.wait_for_function("document.querySelector('.art-image').getAnimations().some(a => a.playState === 'running')")
            transform = art.evaluate('(el) => getComputedStyle(el).transform')
            page.wait_for_function("before => getComputedStyle(document.querySelector('.art-image')).transform !== before", arg=transform, timeout=5000)

        def expect_motion_frozen():
            expect(hero).to_have_attribute('data-motion', 'paused')
            expect(hero).to_have_attribute('data-motion-active', 'false')
            transform = art.evaluate('(el) => getComputedStyle(el).transform')
            # A timed sample proves Pause freezes the picture instead of only changing its label.
            page.wait_for_timeout(250)
            assert art.evaluate('(el) => getComputedStyle(el).transform') == transform
            assert page.locator('.sky-orbit').evaluate("el => el.getAnimations().every(a => a.playState !== 'running')")

        expect_motion_advancing()
        expect(motion).to_have_text('Pause animation')
        motion.press('Space')
        expect_motion_frozen()
        page.locator('#btn-zh').click()
        expect(motion).to_have_text('播放动画')
        expect(hero).to_have_attribute('data-motion', 'paused')
        page.locator('#btn-en').click()
        expect(motion).to_have_text('Play animation')
        expect_motion_frozen()
        motion.press('Enter')
        expect_motion_advancing()
        # Going offscreen suspends work without cancelling the visitor's Play choice.
        page.locator('#services').scroll_into_view_if_needed()
        expect(hero).to_have_attribute('data-motion-active', 'false')
        expect(hero).to_have_attribute('data-motion', 'playing')
        art.scroll_into_view_if_needed()
        expect_motion_advancing()
        # A changed system preference pauses immediately; a deliberate Play remains available.
        page.emulate_media(reduced_motion='reduce')
        expect_motion_frozen()
        expect(motion).to_have_text('Play animation')
        motion.click()
        expect_motion_advancing()
        motion.click()
        expect_motion_frozen()
        assert not errors, f'Motion browser errors: {errors}'
        results.append({'viewport':'1280x900', 'locale':'en-GB', 'case':'artwork-motion', 'status':'passed'})
        context.close()
    finally:
        browser.close()
        (OUT / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')

print(json.dumps({'status':'passed', 'cases':results}, ensure_ascii=False, indent=2))
