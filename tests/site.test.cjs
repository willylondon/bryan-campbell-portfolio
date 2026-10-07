// Browser operations have bounded timeouts; stop any unexpected lifecycle hang.
const watchdog = setTimeout(() => { console.error("Browser suite exceeded 180 seconds"); process.exit(1); }, 180000);
// Run npm ci, npx playwright install chromium, then npm test.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let oldWorker = true;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.join(root, pathname === '/' ? 'index.html' : pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.setHeader('Content-Type', types[path.extname(file)] || 'text/plain');
  res.setHeader('Cache-Control', 'no-store');
  if (pathname === '/service-worker.js') {
    // A functioning v5 fixture exercises a real active-worker update to v6.
    const source = read('service-worker.js');
    return res.end(oldWorker ? source.replaceAll('gm-campbell-v6', 'gm-campbell-v5') : source);
  }
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let navigations = 0;
    const installedReload = new Promise(resolve => page.on('framenavigated', frame => { if (frame === page.mainFrame() && ++navigations === 2) resolve(); }));
    await page.goto(origin);
    await installedReload;
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts.ready);
    // The manifest preview is a real view of the site, not an unrelated stock image.
    if (process.env.UPDATE_SCREENSHOT) await page.screenshot({ path: path.join(root, 'images/screenshot1.png') });
    fs.mkdirSync(path.join(root, 'output/playwright'), { recursive: true });
    await page.screenshot({ path: path.join(root, 'output/playwright/desktop.png'), fullPage: true });
    let keys = await page.evaluate(() => caches.keys());
    assert(keys.includes('gm-campbell-v5'));
    await page.evaluate(() => caches.open('unrelated-cache'));
    oldWorker = false;
    const updatedReload = page.waitForEvent('framenavigated', frame => frame === page.mainFrame());
    await page.evaluate(async () => (await navigator.serviceWorker.ready).update());
    await updatedReload;
    await page.waitForFunction(async () => {
      const keys = await caches.keys();
      return keys.includes('gm-campbell-v6') && !keys.includes('gm-campbell-v5');
    });
    await page.waitForLoadState('load');
    keys = await page.evaluate(() => caches.keys());
    assert(keys.includes('unrelated-cache'));
    const cached = await page.evaluate(async () => (await (await caches.open('gm-campbell-v6')).keys()).map(r => new URL(r.url).pathname));
    for (const asset of ['/', '/index.html', '/css/styles.css', '/js/main.js', '/manifest.json', '/images/favicon.ico', '/images/apple-touch-icon.png', '/images/social-preview.png', '/images/profile.jpg']) assert(cached.includes(asset), `precache: ${asset}`);
    await context.setOffline(true);
    await page.reload();
    assert(await page.locator('h1').count());
    const staticFallback = await page.evaluate(async () => { try { await fetch('/missing-offline.png'); return false; } catch { return true; } });
    assert(staticFallback, 'offline image must not receive homepage HTML');
    await context.setOffline(false);
    console.log('PASS service worker install, v5→v6 update, scoped cleanup, precache and offline behavior');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin);
    await page.screenshot({ path: path.join(root, 'output/playwright/mobile.png'), fullPage: true });
    const toggle = page.locator('#mobile-menu');
    const nav = page.locator('.nav-links');
    for (let i = 0; i < 3; i++) {
      await toggle.focus(); await page.keyboard.press('Enter');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Home');
      await page.keyboard.press('Enter');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert(await nav.evaluate(el => el.inert));
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => !!document.activeElement.closest('.nav-links')), false, 'closed menu must not retain focus trap');
      await toggle.focus(); await page.keyboard.press('Space'); await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert(await toggle.evaluate(el => el === document.activeElement));
      await page.keyboard.press('Enter'); await page.keyboard.press('Shift+Tab');
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Book Training');
      await page.keyboard.press('Tab');
      assert(await toggle.evaluate(el => el === document.activeElement));
      await page.keyboard.press('Escape');
    }
    await toggle.click(); await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForFunction(() => document.querySelector('#mobile-menu').getAttribute('aria-expanded') === 'false');
    assert.equal(await nav.evaluate(el => el.inert), false);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    for (const key of ['Enter', 'Space']) {
      for (const trigger of await page.locator('.lightbox-trigger').all()) {
        await trigger.focus(); await page.keyboard.press(key);
        assert.equal(await page.locator('#lightbox').getAttribute('aria-hidden'), 'false');
        assert.equal(await page.locator('#lightbox-img').getAttribute('alt'), await trigger.locator('img').getAttribute('alt'));
        await page.keyboard.press('Tab');
        assert(await page.locator('.lightbox-close').evaluate(el => el === document.activeElement));
        await page.keyboard.press('Escape');
        assert(await trigger.evaluate(el => el === document.activeElement));
      }
    }
    console.log('PASS repeated keyboard menu Home/Escape/Tab/resize and all gallery Enter/Space/Escape/focus restoration');

    const manifest = JSON.parse(read('manifest.json'));
    for (const asset of [...manifest.icons, ...manifest.screenshots, { src: 'images/apple-touch-icon.png', sizes: '180x180' }]) {
      const bytes = fs.readFileSync(path.join(root, asset.src));
      assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`, asset.sizes, asset.src);
    }
    console.log('PASS manifest and Apple icon dimensions');
    // Crawl all source pages, even unlisted posts; exclude only the explicit template.
    const pages = ['index.html', 'blog.html', ...fs.readdirSync(path.join(root, 'blog')).filter(f => f.endsWith('.html') && f !== 'post-template.html').map(f => 'blog/' + f)];
    const auditContext = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
    const audit = await auditContext.newPage();
    const failures = [];
    let linkCount = 0;
    for (const file of pages) {
      await audit.goto(`${origin}/${file}`);
      const refs = await audit.locator('[href], [src], source[srcset]').evaluateAll(els => els.flatMap(el => {
        return ['href', 'src'].map(attr => el.getAttribute(attr)).filter(Boolean).concat((el.getAttribute('srcset') || '').split(',').map(s => s.trim().split(/\s+/)[0]).filter(Boolean));
      }));
      for (const ref of refs) {
        let url; try { url = new URL(ref, `${origin}/${file}`); } catch { failures.push(`${file}: invalid ${ref}`); continue; }
        if (url.hostname === 'masterbryankukibo.online') url = new URL(url.pathname + url.search + url.hash, origin);
        if (url.origin !== origin) continue;
        const target = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
        linkCount++;
        if (!fs.existsSync(path.join(root, target))) { failures.push(`${file}: missing ${ref}`); continue; }
        if (url.hash && path.extname(target) === '.html') {
          const id = decodeURIComponent(url.hash.slice(1));
          if (!read(target).includes(`id="${id}"`) && !read(target).includes(`id='${id}'`)) failures.push(`${file}: missing fragment ${ref}`);
        }
      }
      if (file.startsWith('blog/')) {
        assert(await audit.locator('a[href="https://wa.me/18768744013"]').count(), `WhatsApp CTA ${file}`);
        assert(await audit.locator('a[href="mailto:masterbryanc@yahoo.com"]').count(), `email CTA ${file}`);
      }
    }
    assert.deepEqual(failures, []);
    for (const match of read('css/styles.css').matchAll(/url\(['"]?([^)'" ]+)/g)) assert(fs.existsSync(path.resolve(root, 'css', match[1])), `CSS asset ${match[1]}`);
    const listing = read('blog.html');
    for (const match of listing.matchAll(/href="(blog\/[^"#]+\.html)"/g)) assert(read('sitemap.xml').includes(match[1]), `sitemap ${match[1]}`);
    for (const file of ['blog/karate-classes-kingston-jamaica.html', 'blog/youth-martial-arts-tournaments-jamaica.html']) assert(!/Image Placement|Meta Details|Internal Link|\*\*/.test(read(file)), `draft markers ${file}`);
    for (const width of [320, 390, 768, 1280]) {
      await audit.setViewportSize({ width, height: 844 });
      for (const file of ['index.html', 'blog.html', 'blog/karate-classes-kingston-jamaica.html', 'blog/youth-martial-arts-tournaments-jamaica.html', 'blog/2026-04-22-martial-arts-confidence-training-for-teens-in-kingston.html', 'blog/2026-04-30-best-beginner-martial-arts-training-in-kingston.html', 'blog/2026-08-27-karate-belt-levels-and-what-each-rank-means-for-adults.html']) {
        await audit.goto(`${origin}/${file}`);
        if (!await audit.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)) console.log(await audit.locator('body *').evaluateAll(els => els.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => ({tag:el.tagName, cls:el.className, right:el.getBoundingClientRect().right, scroll:el.scrollWidth, client:el.clientWidth, text:el.textContent.slice(0,60)}))));
        assert(await audit.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `horizontal overflow: ${file} at ${width}`);
      }
    }
    for (const width of [390, 1280]) {
      await audit.setViewportSize({ width, height: 844 });
      await audit.goto(origin);
      for (const section of ['gallery', 'contact']) {
        await audit.locator('#' + section).scrollIntoViewIfNeeded();
        if (section === 'gallery') await audit.waitForFunction(() => [...document.querySelectorAll('#gallery img')].every(img => img.complete && img.naturalWidth));
        await audit.screenshot({ path: path.join(root, `output/playwright/${section}-${width}.png`) });
      }
      await audit.goto(origin + '/blog.html');
      await audit.screenshot({ path: path.join(root, `output/playwright/blog-${width}.png`) });
      await audit.goto(origin + '/blog/karate-classes-kingston-jamaica.html');
      await audit.screenshot({ path: path.join(root, `output/playwright/article-${width}.png`) });
    }
    assert.deepEqual(errors, []);
    console.log(`PASS ${pages.length} HTML pages, ${linkCount} internal references/fragments, CSS assets, listed-article sitemap, CTAs and 28 responsive layouts (7 pages at 4 widths)`);
    await auditContext.close(); await context.close();
  } finally { await browser.close(); server.close(); clearTimeout(watchdog); }
})().catch(error => { console.error(error); server.close(); clearTimeout(watchdog); process.exitCode = 1; });
