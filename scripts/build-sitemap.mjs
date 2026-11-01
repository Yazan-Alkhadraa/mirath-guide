// Regenerates public/sitemap.xml from the HTML pages in public/.
// Runs automatically on every Vercel deploy (see vercel.json), or locally with `npm run build`.
//
// A page is listed when it has a <link rel="canonical"> on SITE_URL and is not marked noindex.
// Its <lastmod> is the first "dateModified" found in the page's JSON-LD.
// The build fails if a page that would be indexed still contains [[template placeholders]].

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://mirath-guide-site.vercel.app/';
const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));

const files = (await readdir(PUBLIC_DIR, { recursive: true }))
  .filter((f) => f.endsWith('.html'))
  // Google Search Console verification files are not pages
  .filter((f) => !/^google[0-9a-f]+\.html$/.test(f));

const entries = [];
const errors = [];
const seen = new Map();

for (const file of files) {
  const html = await readFile(join(PUBLIC_DIR, file), 'utf8');

  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) {
    console.log(`skip (noindex draft): ${file}`);
    continue;
  }

  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (!canonical) {
    errors.push(`${file}: missing <link rel="canonical">`);
    continue;
  }
  if (!canonical.startsWith(SITE_URL)) {
    errors.push(`${file}: canonical ${canonical} is not on ${SITE_URL}`);
    continue;
  }
  if (seen.has(canonical)) {
    errors.push(`${file}: same canonical as ${seen.get(canonical)}`);
    continue;
  }
  seen.set(canonical, file);

  if (html.includes('[[')) {
    errors.push(`${file}: still contains [[placeholders]] but is not marked noindex`);
    continue;
  }

  const lastmod = html.match(/"dateModified"\s*:\s*"([^"]+)"/)?.[1];
  if (lastmod && !/^\d{4}-\d{2}-\d{2}/.test(lastmod)) {
    errors.push(`${file}: dateModified "${lastmod}" is not YYYY-MM-DD`);
    continue;
  }

  entries.push({ loc: new URL(canonical).href, lastmod });
}

if (errors.length) {
  console.error('Sitemap build failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}

// Home page first, then the rest alphabetically
entries.sort((a, b) => (a.loc === SITE_URL ? -1 : b.loc === SITE_URL ? 1 : a.loc.localeCompare(b.loc)));

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(({ loc, lastmod }) => `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`;

await writeFile(join(PUBLIC_DIR, 'sitemap.xml'), xml);
console.log(`sitemap.xml written with ${entries.length} URL(s)`);
