const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { rebuild } = require('../scripts/rebuild-blog-listing');
const { validatePost } = require('../scripts/blog-validation');
const good = fs.readFileSync(path.join(__dirname, '../blog/karate-classes-kingston-jamaica.html'), 'utf8');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'campbell-publishing-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'blog'));
  fs.writeFileSync(path.join(root, 'blog/selected.html'), good);
  fs.writeFileSync(path.join(root, 'blog/unlisted.html'), good);
  fs.writeFileSync(path.join(root, 'blog/post-template.html'), '<p>[Body paragraph]</p>');
  const listing = '<!-- POSTS:START --><a href="blog/selected.html">Read article</a><!-- POSTS:END -->';
  fs.writeFileSync(path.join(root, 'blog.html'), listing);
  return { root, listing };
}

test('rebuild preserves editorial selection, escapes metadata and is idempotent', t => {
  const { root } = fixture(t);
  const postPath = path.join(root, 'blog/selected.html');
  const edited = good.replace(/("headline":\s*)"(?:\\.|[^"\\])*"/, '$1"Training & confidence"');
  fs.writeFileSync(postPath, edited);
  const result = rebuild(root);
  assert.equal(result.validated, 2);
  assert.equal(result.listed, 1);
  assert(result.html.includes('Training &amp; confidence'));
  assert(!result.html.includes('unlisted.html'));
  assert.equal(rebuild(root).html, result.html);
});

test('check-only validates without changing the listing', t => {
  const { root, listing } = fixture(t);
  rebuild(root, true);
  assert.equal(fs.readFileSync(path.join(root, 'blog.html'), 'utf8'), listing);
});

for (const marker of [
  '<p>layout: post</p>', '<p>categories: [Fitness]</p>', '<p>---</p>',
  '<h2>Image Placement Suggestions</h2>', '<h2>Internal Links</h2>',
  '<h2>Meta Details</h2>', '<p>*Meta Title:* Draft</p>', '<h2>SEO Recommendations</h2>',
  '<p>#### FAQ</p>', '<li>### Topic</li>', '<p>**Bold**</p>', '<p>*Emphasis*</p>',
  '<p>[website](#)</p>', '<p><a href="#">website</a></p>', '<p>[Insert image]</p>',
  '<p><strong>Hook:</strong> Draft</p>', '<p>Recap the main points.</p>'
]) {
  test(`reject unfinished unlisted source without modifying index: ${marker}`, t => {
    const { root, listing } = fixture(t);
    fs.writeFileSync(path.join(root, 'blog/unlisted.html'), good.replace('</article>', marker + '</article>'));
    assert.throws(() => rebuild(root), /unlisted.html:/);
    assert.equal(fs.readFileSync(path.join(root, 'blog.html'), 'utf8'), listing);
  });
}

test('reject truncated metadata, invalid structured data, missing CTAs and impossible dates', () => {
  assert.throws(() => validatePost(good.replace(/("description":\s*)"(?:\\.|[^"\\])*"/, '$1"A description cut off mid"'), 'test.html'), /complete prose/);
  assert.throws(() => validatePost(good.replace('"@context":', '"@context"'), 'test.html'), /invalid JSON-LD/);
  assert.throws(() => validatePost(good.replace('https://wa.me/18768744013', '#'), 'test.html'), /placeholder link/);
  assert.throws(() => validatePost(good.replaceAll('2026-04-17', '2026-02-31'), 'test.html'), /invalid publication date/);
});

test('reject a selected article missing from disk before writing', t => {
  const { root, listing } = fixture(t);
  fs.unlinkSync(path.join(root, 'blog/selected.html'));
  assert.throws(() => rebuild(root), /does not exist/);
  assert.equal(fs.readFileSync(path.join(root, 'blog.html'), 'utf8'), listing);
});
