#!/usr/bin/env node
// Validate every source article, then rebuild only articles already selected in blog.html.
// This keeps unlisted outlines/FAQ fragments out until an editor chooses to publish them.
const fs = require('fs');
const path = require('path');
const { validatePost, escapeHtml } = require('./blog-validation');

function rebuild(root = path.join(__dirname, '..'), checkOnly = false) {
  const blogDir = path.join(root, 'blog');
  const listingPath = path.join(root, 'blog.html');
  const blogHtml = fs.readFileSync(listingPath, 'utf8');
  const start = '<!-- POSTS:START -->';
  const end = '<!-- POSTS:END -->';
  const si = blogHtml.indexOf(start);
  const ei = blogHtml.indexOf(end);
  if (si < 0 || ei <= si) throw new Error('Missing or out-of-order POSTS markers');

  // Validate before writing anything, including unlisted posts reachable by direct URL.
  const posts = new Map(fs.readdirSync(blogDir)
    .filter(file => file.endsWith('.html') && file !== 'post-template.html')
    .map(file => [file, validatePost(fs.readFileSync(path.join(blogDir, file), 'utf8'), file)]));
  const selected = [...blogHtml.slice(si, ei).matchAll(/href="blog\/([^"/]+\.html)"/g)].map(match => match[1]);
  if (!selected.length || new Set(selected).size !== selected.length) throw new Error('Listing must select unique existing articles');
  for (const file of selected) if (!posts.has(file)) throw new Error(`Listed article does not exist: ${file}`);
  const sorted = selected.map(file => ({ file, ...posts.get(file) })).sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file));
  const cards = sorted.map(post => {
    const date = new Date(`${post.date}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
    return `      <article class="card">
        <span>${date}</span>
        <h2>${escapeHtml(post.headline)}</h2>
        <p>${escapeHtml(post.description)}</p>
        <a class="cta" href="blog/${escapeHtml(post.file)}">Read article</a>
      </article>`;
  }).join('\n\n');
  const inner = `\n    <section class="grid">\n${cards}\n    </section>\n    `;
  const updated = blogHtml.slice(0, si + start.length) + inner + blogHtml.slice(ei);
  if (!checkOnly) fs.writeFileSync(listingPath, updated);
  return { validated: posts.size, listed: selected.length, html: updated };
}

if (require.main === module) {
  try {
    const result = rebuild(undefined, process.argv.includes('--check'));
    console.log(`Validated ${result.validated} articles; ${result.listed} selected for the blog index.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { rebuild };
