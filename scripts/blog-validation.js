'use strict';

function decodeHtml(text) {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
  return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, key) => {
    if (key[0] === '#') return String.fromCodePoint(parseInt(key.slice(key[1].toLowerCase() === 'x' ? 2 : 1), key[1].toLowerCase() === 'x' ? 16 : 10));
    return entities[key.toLowerCase()] || entity;
  });
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function validatePost(html, filename) {
  const fail = message => { throw new Error(`${filename}: ${message}`); };
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const metaDescription = decodeHtml(html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] || '');
  let metadata;
  if (ld) {
    try { metadata = JSON.parse(ld[1]); } catch { fail('invalid JSON-LD'); }
  } else {
    // Legacy article uses title/meta tags and a dated filename rather than JSON-LD.
    metadata = {
      headline: decodeHtml(html.match(/<title>([^<]+)<\/title>/)?.[1].split(' | ')[0] || ''),
      description: metaDescription,
      datePublished: filename.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
    };
  }
  const { headline, description, datePublished: date } = metadata;
  for (const [label, value] of [['headline', headline], ['description', description], ['meta description', metaDescription]]) {
    if (typeof value !== 'string' || !value.trim() || /<[^>]*>|\*\*|^#+|^---$|Blog Outline:/i.test(value)) fail(`unfinished ${label}`);
    if (label !== 'headline' && (value.length < 40 || !/[.!?]["'”’]?$/.test(value))) fail(`${label} must contain complete prose, not a truncated excerpt`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) fail('invalid publication date');
  const article = html.match(/<article>([\s\S]*?)<\/article>/)?.[1];
  if (!article) fail('missing article');
  const text = decodeHtml(article.replace(/<[^>]*>/g, ' '));
  const draftMarkers = /(?:^|\s)(?:layout|title|date|categories|excerpt|author)\s*:|(?:Image Placements?|Meta (?:Title|Description|Details|Data|Information)|Internal Link(?:s|ing| Spots)?|SEO Recommendations|Blog Outline)\s*:|Image Placements?|SEO Recommendations|Meta (?:Title|Description|Details|Data|Information)|Internal Links?|Internal Linking Suggestions|\b(?:Hook|CTA):|\bRecap the|\*\*|(?:^|\s)#{2,}\s|\[[^\]]+\]\([^)]*\)|(?:^|\s)---(?:\s|$)|\[(?:Insert|TODO|Body paragraph|Useful point)/i;
  if (draftMarkers.test(text)) fail('exposed drafting instructions, front matter, placeholders or Markdown');
  if (/<(?:p|li)>\s*\*[^<]+\*\s*<\//.test(article)) fail('literal Markdown emphasis');
  if (/href=["'](?:#|#!)["']/.test(article)) fail('placeholder link');
  for (const href of ['../index.html#contact', 'mailto:masterbryanc@yahoo.com', 'https://wa.me/18768744013']) {
    if (!article.includes(`href="${href}"`)) fail(`missing actionable contact link: ${href}`);
  }
  return { headline, description, date };
}

module.exports = { validatePost, escapeHtml };
