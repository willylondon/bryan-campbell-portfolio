#!/usr/bin/env node
// Rebuilds the <section class="grid"> in blog.html from all blog/*.html posts.
// Run: node scripts/rebuild-blog-listing.js
// Wire into n8n by running this as a shell step after GitHub Commit.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const BLOG_HTML = path.join(ROOT, 'blog.html');
const SKIP = ['post-template.html'];

function extractMeta(html) {
  // Pull datePublished from JSON-LD
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  let date = '', headline = '', description = '', slug = '';
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1]);
      date = ld.datePublished || '';
      headline = ld.headline || '';
      description = ld.description || '';
    } catch (e) {}
  }
  // Fallback: <title> tag (strip site suffix)
  if (!headline) {
    const t = html.match(/<title>([^<]+)<\/title>/);
    if (t) headline = t[1].replace(/\s*\|\s*Master Bryan Kukibo.*$/, '').trim();
  }
  // Fallback: <meta name="description">
  if (!description) {
    const d = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    if (d) description = d[1];
  }
  return { date, headline, description };
}

function formatDate(iso) {
  if (!iso) return '';
  // Parse as local date to avoid UTC-offset shifting the day
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Read all posts
const files = fs.readdirSync(BLOG_DIR)
  .filter(f => f.endsWith('.html') && !SKIP.includes(f));

const posts = files.map(f => {
  const html = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8');
  const meta = extractMeta(html);
  return { file: f, ...meta };
}).filter(p => p.headline);

// Sort newest first
posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

// Build card HTML
const cards = posts.map(p => `      <article class="card">
        <span>${formatDate(p.date)}</span>
        <h2>${p.headline}</h2>
        <p>${p.description}</p>
        <a class="cta" href="blog/${p.file}">Read article</a>
      </article>`).join('\n\n');

const START = '<!-- POSTS:START -->';
const END   = '<!-- POSTS:END -->';
const inner = `    <section class="grid">\n${cards}\n    </section>`;

let blogHtml = fs.readFileSync(BLOG_HTML, 'utf8');
const si = blogHtml.indexOf(START);
const ei = blogHtml.indexOf(END);
if (si === -1 || ei === -1) {
  console.error(`Could not find ${START} / ${END} markers in blog.html`);
  process.exit(1);
}
const updated = blogHtml.slice(0, si) + START + '\n' + inner + '\n    ' + END + blogHtml.slice(ei + END.length);

fs.writeFileSync(BLOG_HTML, updated);
console.log(`blog.html updated — ${posts.length} posts listed:`);
posts.forEach(p => console.log(`  ${p.date}  ${p.file}`));
