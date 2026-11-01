# Adding an article

Articles live in `public/articles/` and are served at `https://mirath-guide-site.vercel.app/articles/<slug>`
(no `.html` in the URL).

1. Copy `templates/article.html` to `public/articles/<slug>.html`.
2. Replace every `[[...]]` placeholder: title, description, slug, dates, body.
3. Deploy as a **draft** first: the page keeps `noindex`, so Google ignores it and it stays out of the sitemap.
4. When the author has reviewed and approved the text, replace the `noindex` robots line with
   `<meta name="robots" content="index,follow,max-image-preview:large">`.
5. Add a link to the new article from the home page and from related articles.
6. Commit and push. The Vercel build (`npm run build`) adds the page to `sitemap.xml` automatically.
   The build stops with an error if a published page still has `[[placeholders]]`,
   is missing its canonical link, or uses a bad date.

When editing an article later, update `dateModified` in its JSON-LD (and `article:modified_time`);
the sitemap's `<lastmod>` is taken from `dateModified`.

## Slugs

Short, lowercase, Latin letters and hyphens. They stay readable when shared on WhatsApp/Facebook
(Arabic URLs turn into long `%D8%A7...` strings). The Arabic keywords go in the title and headings.

| Planned article (title in Arabic)              | URL                               |
| ---------------------------------------------- | --------------------------------- |
| كيفية استخراج القسام الشرعي في العراق           | `/articles/qassam-sharii-iraq`    |
| طريقة حساب أصل المسألة في المواريث              | `/articles/asl-al-masala`         |
| نصيب الزوجة من الميراث                          | `/articles/naseeb-al-zawja`       |
| نصيب البنت من الميراث                           | `/articles/naseeb-al-bint`        |
| نصيب الأم من الميراث                            | `/articles/naseeb-al-umm`         |
| أسباب الميراث وشروطه وموانعه                    | `/articles/asbab-shurut-mawani`   |
| الفرق بين القسام الشرعي والقسام النظامي          | `/articles/qassam-sharii-nizami`  |
