# City PMU landing page

Static landing page (plain HTML/CSS/JS, no build step) for an independent sanitation verification unit.

## Run locally

```
cd site
python -m http.server 8000
```

Open http://localhost:8000 (use browser dev tools at 360px width for the mobile view).

## Layout

- `site/index.html`, `styles.css`, `app.js`: the page
- `site/config.js`: product name, demo link, form endpoint (single place to rename)
- `site/i18n/hi.json`: Hindi copy, supplied by the owner; the language toggle stays hidden while it is empty
- `apps-script/Code.gs`: form handler (writes a sheet row, then sends the alert)

Confidential material, print assets and internal notes are kept out of this repository.
