"""Layout acceptance: anonymous synthetic birth data only, never paid AI or payments."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('LAYOUT_BASE_URL', 'http://127.0.0.1:3000').rstrip('/')
OUT = Path(os.environ.get('LAYOUT_REPORT_DIR', 'reports/layout/browser'))
OUT.mkdir(parents=True, exist_ok=True)
results, failures = [], []

def loc(page, name):
    return page.locator('[class*="_' + name + '__"]')

def fits_page(page):
    actual = page.evaluate('({viewport:innerWidth,width:document.documentElement.scrollWidth})')
    assert actual['width'] <= actual['viewport'] + 2, 'Page overflows: ' + str(actual)

def screenshot(page, name):
    page.screenshot(path=str(OUT / (name + '.png')), animations='disabled')

with sync_playwright() as p:
    for engine in ['chromium', 'webkit']:
        browser = getattr(p, engine).launch(headless=True)
        matrix = [(1440,960),(1280,800),(1920,1080),(768,1024),(390,844),(320,740),(844,390)] if engine == 'chromium' else [(1440,960),(390,844)]
        try:
            for width, height in matrix:
                for language in ['zh-CN','en-GB']:
                    name = f'{engine}-{width}-{height}-{language}'
                    record = {'case':name, 'base':BASE, 'status':'failed'}
                    context = browser.new_context(viewport={'width':width,'height':height}, locale=language, reduced_motion='reduce')
                    page = context.new_page()
                    errors = []
                    page.on('pageerror', lambda e: errors.append(str(e)))
                    page.route('**/api/reading', lambda r:r.abort())
                    try:
                        response = page.goto(BASE + '/ziwei-chart', wait_until='networkidle', timeout=45000)
                        assert response and response.status == 200
                        expected_lang = 'zh-CN' if language.startswith('zh') else 'en'
                        expect(page.locator('html')).to_have_attribute('lang',expected_lang)
                        expect(loc(page,'siteHeader')).to_be_visible()
                        assert loc(page,'page').evaluate('(el)=>getComputedStyle(el).getPropertyValue("--hztj-layout-revision").trim()') == 'ziwei-layout-20261015'
                        page.evaluate('document.fonts.ready')
                        fits_page(page)
                        header = loc(page,'siteHeader').bounding_box()
                        hero = loc(page,'heroCopy').bounding_box()
                        heading = loc(page,'hero').locator('h1').bounding_box()
                        logo = loc(page,'logoLink').locator('img')
                        page.wait_for_function('document.querySelector("header img").naturalWidth > 0')
                        dimensions = logo.bounding_box()
                        assert 100 <= dimensions['width'] <= 280 and dimensions['height'] <= 100
                        assert header['height'] < (160 if width > 800 else 230), str(header)
                        minimum = 400 if width >= 1100 else min(670,width-64) if width <= 800 else 300
                        assert hero['width'] >= minimum, str(hero)
                        assert heading['height'] < 300, str(heading)
                        record.update(headerHeight=header['height'], headingWidth=heading['width'], headingHeight=heading['height'], logoWidth=dimensions['width'])
                        controls = loc(page,'langSwitch').locator('button')
                        assert controls.count() == 2
                        b0, b1 = controls.nth(0).bounding_box(), controls.nth(1).bounding_box()
                        assert abs(b0['y']-b1['y']) < 3 and max(b0['width'],b1['width']) < 90
                        for image in page.locator('img').all():
                            box=image.bounding_box()
                            if box: assert box['width'] <= 300, 'Oversized brand artwork'
                        screenshot(page, name + '-top')
                        motif=loc(page,'previewCenter').evaluate('(e)=>({height:e.clientHeight,scroll:e.scrollHeight})')
                        assert motif['scroll'] <= motif['height']+2, 'Motif caption overlaps the ring: '+str(motif)
                        loc(page,'previewShell').screenshot(path=str(OUT/(name+'-motif.png')))
                        loc(page,'heroActions').locator('button').click()
                        expect(loc(page,'formCard')).to_be_in_viewport()
                        fields = loc(page,'personWrap').locator('input:not([type=checkbox]), select')
                        for field in fields.all():
                            box=field.bounding_box()
                            style=field.evaluate('(el)=>({font:parseFloat(getComputedStyle(el).fontSize),color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor})')
                            assert box['width'] >= 95 and box['height'] >= 44, 'Unreadable control: '+str(box)
                            assert style['font'] >= 16 and style['color'] != style['background']
                            assert box['x'] >= -1 and box['x']+box['width'] <= width+1
                        screenshot(page, name + '-form')
                        page.evaluate('document.documentElement.setAttribute("data-theme","dark")')
                        assert fields.first.evaluate('(el)=>getComputedStyle(el).backgroundColor') == 'rgb(255, 253, 248)'
                        page.evaluate('document.documentElement.removeAttribute("data-theme")')
                        unknown = loc(page,'personWrap').locator('input[type=checkbox]').first
                        unknown.check()
                        loc(page,'generateButton').click()
                        # Next.js also has a route-announcer alert; inspect only this form's validation error.
                        expect(loc(page,'formCard').locator('[role=alert]')).to_be_visible()
                        unknown.uncheck()
                        with page.expect_response(lambda r:'/api/ziwei-chart' in r.url and r.request.method=='POST') as reply:
                            loc(page,'generateButton').click()
                        assert reply.value.status == 200, reply.value.text()
                        expect(loc(page,'palaceCell')).to_have_count(12)
                        expect(loc(page,'palaceDetail')).to_be_visible()
                        expect(loc(page,'summaryGrid').locator('> div')).to_have_count(6)
                        fits_page(page)
                        cells=loc(page,'palaceCell')
                        cells.last.click()
                        expect(cells.last).to_have_attribute('aria-pressed','true')
                        assert loc(page,'chartCenter').locator('img').bounding_box()['width'] <= 245
                        screenshot(page, name + '-chart')
                        loc(page,'basisBlock').scroll_into_view_if_needed()
                        fits_page(page)
                        if width <= 800: assert loc(page,'basisBlock').bounding_box()['width'] >= width-64
                        page.emulate_media(media='print')
                        expect(loc(page,'siteHeader')).not_to_be_visible()
                        expect(loc(page,'chartGrid')).to_be_visible()
                        page.emulate_media(media='screen')
                        loc(page,'langSwitch').locator('button').nth(1 if language.startswith('zh') else 0).click()
                        expect(page.locator('html')).to_have_attribute('lang','en' if language.startswith('zh') else 'zh-CN')
                        fits_page(page)
                        assert not errors, errors
                        record.update(status='passed',chartCells=12)
                    except Exception as error:
                        record['error']=str(error); failures.append(name+': '+str(error))
                        try: screenshot(page,name+'-FAILED')
                        except Exception: pass
                    finally:
                        results.append(record); context.close()
            if engine == 'chromium':
                for width,height in [(1440,960),(390,844)]:
                    for route in ['/','/pan','/tools','/articles','/classics','/tools/wuxing','/tools/nongli','/tools/phone','/tools/plate','/tools/yinyuan','/articles/bazi-is-a-manual-not-a-verdict']:
                        context=browser.new_context(viewport={'width':width,'height':height},locale='en-GB',reduced_motion='reduce')
                        page=context.new_page();page.route('**/api/reading',lambda r:r.abort())
                        name='site-'+route.strip('/').replace('/','-')+'-'+str(width)
                        record={'case':name,'base':BASE,'status':'failed'}
                        try:
                            r=page.goto(BASE+route,wait_until='networkidle',timeout=45000)
                            assert r and r.status == 200
                            if route=='/':
                                expect(page.locator('#hzp-dialog')).to_be_visible(timeout=15000)
                                page.locator('#hzp-dialog .hzp-no').click()
                            fits_page(page)
                            h=page.locator('h1').first
                            expect(h).to_be_visible()
                            assert h.bounding_box()['width'] >= min(width-64,400)
                            if route=='/pan': expect(page.locator('.modes button')).to_have_count(11)
                            screenshot(page,name);record['status']='passed'
                        except Exception as error:
                            record['error']=str(error);failures.append(name+': '+str(error))
                            try: screenshot(page,name+'-FAILED')
                            except Exception: pass
                        finally:
                            results.append(record);context.close()
        finally:
            browser.close()
            (OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps({'passed':len(results)-len(failures),'total':len(results),'failures':failures},ensure_ascii=False,indent=2))
if failures: raise SystemExit(1)
