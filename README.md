# Raiha Ahmed · Portfolio

Static site (plain HTML, CSS and a little vanilla JS). No build step.

## Structure

```
docs/
  index.html          Home
  cases/01..04/       Case files
  js/                 Small per-page scripts (reveals, parallax, carousels)
  assets/             Images (WebP/JPG)
```

All links and image paths are relative, so the site works at
`https://<user>.github.io/` or `https://<user>.github.io/<repo>/`.

## Local preview

```bash
python3 -m http.server 8000 --directory docs
```

Then open http://localhost:8000.

## Deploy

Push to `main`. GitHub Pages serves the `docs/` folder of the `main` branch
(Settings → Pages → Deploy from a branch → main / docs).
