# Raiha Ahmed · Portfolio

Static site (plain HTML, CSS and a little vanilla JS). No build step.

## Structure

```
site/
  index.html          Home
  cases/01..04/       Case files
  js/                 Small per-page scripts (reveals, parallax, carousels)
  assets/             Images (WebP/JPG)
.github/workflows/pages.yml   Deploys site/ to GitHub Pages
```

All links and image paths are relative, so the site works at
`https://<user>.github.io/` or `https://<user>.github.io/<repo>/`.

## Local preview

```bash
python3 -m http.server 8000 --directory site
```

Then open http://localhost:8000.

## Deploy

Push to `main`. The GitHub Actions workflow uploads `site/` and publishes it.
One-time setup in the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
