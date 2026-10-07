# Master Bryan Kukibo Blog Publishing Workflow

## Goal
Publish articles that attract qualified training leads for private coaching, group classes, seminars, and fitness clients.

## Article Priorities
- Self-defense training
- Martial arts discipline and mindset
- Fitness coaching
- Seminar topics for groups and organizations
- Beginner questions about training

## Publishing Steps
1. Duplicate `blog/post-template.html`.
2. Save the new article in `blog/` using a simple keyword-rich slug.
3. Run `node scripts/rebuild-blog-listing.js --check` to validate all article files, including unlisted pages reachable by direct URL. Fix reported errors before publishing.
4. After editorial review, add the article link inside the `POSTS:START` / `POSTS:END` region in `blog.html`, then run `node scripts/rebuild-blog-listing.js`. The generator preserves this selected set; it does not automatically promote every file in `blog/`.
5. Add the article card to the homepage blog section in `index.html`.
6. Add the URL to `sitemap.xml`.
7. Add the article to `rss.xml`.
8. Run `npm test` and review the resulting diff before committing.

## Local publishing safeguards

The generator rejects raw front matter, drafting sections, placeholder links, literal Markdown, truncated metadata, invalid dates, and missing contact links before writing the index. It escapes metadata when rendering cards. `npm test` runs these checks and regression tests, including proof that rejected input leaves the index unchanged.

These are repository-local checks, not an automatic content rewrite or a fact-check. The upstream n8n writer is outside this repository and has not been changed. It must invoke the validation command or use a reviewed PR workflow for these guards to protect its writes; direct pushes that bypass checks can still reintroduce unfinished content. Do not promote outline-only or partial articles merely because mechanical validation passes.

## SEO Checklist
- Primary keyword in title
- Primary keyword in first 100 words
- One clear H1
- Meta description between 150 and 160 characters
- Closing CTA for training, classes, or seminar booking
- At least one internal link back to the homepage or blog

## Best Next Topics
- How Kukibo martial arts builds confidence in shy children and teens
- Corporate team building through Kukibo martial arts seminars in Kingston
- How long does it take to earn a black belt in Kukibo martial arts
- Combining strength training with martial arts for total fitness
- Why Jamaican parents are choosing martial arts over traditional sports
- Common myths about martial arts training debunked
- Staying motivated in your martial arts journey: tips for beginners
- Couples martial arts: a unique bonding experience in Kingston
- The history and evolution of Kukibo martial arts in Jamaica
- Bullying prevention and self-defense for Jamaican school children
- Martial arts for busy professionals: fitting training into your work week
- How Kukibo martial arts improves coordination and athletic performance
- What to expect at your first martial arts seminar in Jamaica
- Martial arts injury prevention: staying safe while training hard
- The mental health benefits of consistent martial arts practice
