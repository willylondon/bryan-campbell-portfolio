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

The browser suite covers a real service-worker install and update using a functioning v5 fixture, scoped cache cleanup, core precaching, offline HTML and failed-static behavior; three rounds of menu Home/Escape/Tab/Shift+Tab; desktop resize; all four gallery buttons with Enter/Space/Escape and focus restoration; exact manifest/Apple icon dimensions; 41 non-template HTML pages and internal references/fragments across all 41 pages; CSS assets; sitemap coverage for all 12 listed posts; email/WhatsApp article CTAs; and 28 layouts (seven representative pages) across 320, 390, 768 and 1280 pixels. Screenshots are written to `output/playwright/` and uploaded by the PR-only CI workflow. JavaScript syntax and `git diff --check` also pass.

## Follow-up mechanical content cleanup

All 27 additional unlisted automated posts were inspected and mechanically cleaned. Existing excerpts or complete sentences replace broken descriptions in meta tags and JSON-LD. Raw front matter, publisher-facing image/SEO/internal-link instructions, placeholder reference topics, literal Markdown headings/emphasis and separator markers were removed or rendered as HTML. Homepage Markdown links now use the existing homepage URL. No new article facts, images or contact details were introduced.

The local listing generator now validates all 39 non-template articles before writing, escapes metadata, and preserves the 12 articles already selected in the index. It does not automatically promote all files. Twenty-one regression tests cover rejected draft patterns, metadata, contacts, dates, missing files, escaping, idempotence and failure without modifying the index. These checks also run in PR CI. The upstream n8n writer is external and unchanged: a direct push bypassing these checks can still reintroduce unfinished content. No branch protection or external automation was changed.

## Remaining editorial decisions

- `2026-04-22-martial-arts-confidence-training-for-teens-in-kingston.html` remains largely an outline of topics, including syllabus and testimonial headings. Supplying a real syllabus, testimonial quotations or supporting examples requires approved source material.
- `2026-04-30-best-beginner-martial-arts-training-in-kingston.html` has only a booking FAQ and closing paragraph; the full beginner guide is missing. Existing material was formatted without inventing a guide.
- `2026-08-10-how-martial-arts-teaches-respect-and-discipline-to-teenagers.html` consists of three FAQs and a closing paragraph. Expanding it into a full article is deferred.
- Claims such as online self-defense classes in the April 23 women's article, upcoming workshops in the May 1 article, and testimonials/case studies in the corporate articles were preserved, not verified or expanded. Confirm availability and supporting evidence editorially.

The 27 posts remain unlisted; their content was not newly promoted in the index or sitemap. TikTok and Amazon links remain intact. Mechanical checks are not a factual or completeness review.
