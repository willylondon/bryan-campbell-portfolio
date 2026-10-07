# Audited site repairs

Base: `3d6dd0cb095e0a7beae7bf6fffb27b019b1e46d9`. Work is for a draft PR only; GitHub Pages production and `CNAME` are unchanged.

- Generated the missing favicon, Apple icon, and manifest icons from the existing GM Campbell branding; corrected the 144px icon dimensions. Added a genuine 1280×720 homepage screenshot for the manifest.
- Restored the service-worker precache, bumped its cache to v6, awaited install/activation work, limited cleanup to this site's cache prefix, and stopped returning HTML for unavailable static assets. Preserved the same-origin restrictions and update registration from PRs #1–#3.
- Removed drafting sections and literal formatting from the two audited articles. Preserved Amazon destinations and affiliate disclosures. Cleaned the index copy/excerpts and moved every card inside its intended grid.
- Added usable contact, email, telephone and WhatsApp links to article callouts, including the template, and WhatsApp on the homepage. The number and email match the existing homepage and README. A read-only HEAD request to `https://wa.me/18768744013` returns HTTP 302 to WhatsApp's send page with that same number. No message was sent; account ownership/availability was not tested.
- Fixed the menu's lingering focus trap, closed-menu focusability, Escape restoration and desktop resizing. Gallery thumbnails are native buttons with Enter/Space support, descriptive enlarged-image alt text, Escape and focus restoration.
- Added the six missing articles linked by the blog index to the sitemap.
- Converted five homepage images to quality-85 WebP: 5,282,038 bytes → 1,097,930 bytes (79.2% smaller). Original PNGs remain as picture fallbacks and source assets. The hero uses a 272KB JPEG fallback and CSS image-set instead of loading a second photo beneath the hero.
- Corrected narrow-screen overflow in cards, stats, timeline headings and contact text.

## Validation

Run `npm ci`, `npx playwright install chromium`, and `npm test`. To use installed Chrome locally, set `CHROME_PATH` to its executable. `UPDATE_SCREENSHOT=1 npm test` refreshes the manifest screenshot.

The browser suite covers a real service-worker install and update using a functioning v5 fixture, scoped cache cleanup, core precaching, offline HTML and failed-static behavior; three rounds of menu Home/Escape/Tab/Shift+Tab; desktop resize; all four gallery buttons with Enter/Space/Escape and focus restoration; exact manifest/Apple icon dimensions; 41 non-template HTML pages and 188 internal references/fragments; CSS assets; sitemap coverage for all 12 listed posts; email/WhatsApp article CTAs; and 16 layouts across 320, 390, 768 and 1280 pixels. Screenshots are written to `output/playwright/` and uploaded by the PR-only CI workflow. JavaScript syntax and `git diff --check` also pass.

## Remaining editorial work

The repository contains 27 additional unlisted automated articles beyond the 12 in the blog index. Several expose raw front matter (for example the August 27 belt-level article has `layout: post`, `categories`, and a `---` description). Their article bodies were not rewritten in this scoped repair; they received working contact links. They remain reachable by direct URL but were not newly promoted in the index or sitemap. Review these posts and the upstream publishing automation before running `scripts/rebuild-blog-listing.js`, which currently includes every non-template article. Existing claims and training facts were preserved; this is not a fact-check of that content. TikTok and Amazon links were retained as requested.
