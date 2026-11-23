# CLAUDE.md — City PMU marketing build

Read this first. Plan and dates live in [PLAN.md](PLAN.md). Source documents live in `reference/` (git-ignored, confidential). **This repo is public: never write internal figures, names or strategy into any tracked file.**

## What this project is
City PMU (working name; **will change**) is an independent verification unit for city sanitation, sold by Human Matrix to Municipal Commissioners. It shows every measure twice, *as reported* and *as verified*, per ward, contractor and zone. Go-to-market is live now; Parth builds the marketing assets. The only job of every asset: **get an officer to ask for the half-day visit.**

Audience: Municipal Commissioners and senior city officers (Hindi + English, mostly on phones). Assets are shown to them directly, so polish and restraint matter more than feature count.

## Deliverables (owner: Parth) and dates
| Asset | First | Final |
|---|---|---|
| Landing page, EN + HI, mobile first, ends in visit-request form | wireframe 25 Nov | live 30 Nov |
| Leave-behind: Master pitch, 2-page A4 PDF | 25 Nov | 30 Nov |
| Talk-track card (1 page, EN + HI) | 27 Nov | — |
| Six-slide phone deck | 27 Nov | — |
| Form → pipeline sheet row + instant alert to Pavanjeet | with landing page | 30 Nov |
| Sample pack (with Shruti's team) | 2 Dec | — |
| Two-minute demo video of what is live today | 7 Dec | — |

## Hard rules (from the owner; never break, never "improve")
1. **Master pitch wording is fixed.** Design around it. Do not rewrite, reorder claims, or add claims. Source of truth: `reference/Master pitch (1).docx`.
2. **Show results, never the method.** No checklists, sampling rules, KPI sheets, or software internals in any asset.
3. **No prices in print or on the web.** Only the phrase "priced per household per month". Any figure from the internal quote sheet in `reference/` stays out of the repo entirely.
4. **No client names, logos or officers' names** without written clearance from the owner.
5. **Credentials block stays a placeholder** until the owner confirms (the "Why Human Matrix" claims: years, awards, software, Task Force).
6. **Never mention a city's rank, its consultant, or its vendors.** Internal sales guidance in `reference/` stays there.
7. **Product name and logo swap in one place** (`site/config.js` + CSS tokens). No hard-coded name in markup, PDFs, or deck.
8. Illustrative numbers (Ward 23 table) must be labelled "illustrative" wherever shown.

## Open conflicts to resolve with the owner before 25 Nov
- Pitch Day-14 row and "ward-wise action plan" mention KPI sheets; rule 2 forbids showing them. Proposed: keep the row, drop the phrase "KPI sheet" only if owner approves.
- Pitch Sources name two cities. Rules 4 and 6 suggest leaving city names off public assets. Proposed: cite the programme only, pending OK.
- "@sunpreet" byline in the pitch is an internal handle; omit from all assets.
- The City PMU doc refers to tabs **Talk track, Ten-city plan, Marketing brief** (dates, landing sections, form fields, Hindi lines). They are **not** in `reference/`. We need them; Hindi copy in particular must come from there, not be invented.
- Anything about lead rewards or per-ward figures is internal-only (see `reference/`).

## Stack decisions
- Plain static HTML/CSS/JS in `site/`. No framework, no build step. Hosted on GitHub Pages.
- Copy lives in `site/i18n/en.json` and `hi.json`; markup only has keys. Language toggle, remembered locally.
- Brand/name/logo in `site/config.js`; colours, type, spacing as CSS variables.
- PDFs (leave-behind, talk card) and slide deck render from the same HTML/CSS with headless Chrome, so copy never forks.
- Form posts to a Google Apps Script web app that appends a row to the pipeline sheet and sends the alert. Sheet URL and alert channel are TBD from Pavanjeet.

## UI standard
Government-grade trust, not startup gloss. Calm, high contrast, generous whitespace, one accent colour. Devanagari typeset properly (Noto Sans Devanagari, adequate line height). Tap targets ≥ 44px, body ≥ 16px, WCAG AA contrast, works at 360px width and on slow 4G, no layout shift on language switch. The hero object is the **reported vs verified** ward page: the pitch's own table, made interactive and labelled illustrative.

## Git workflow
- Remote: https://github.com/ParthAkhand/digital-governance.git, branch `main` (no history yet).
- All work goes on GitHub: small commits, one per deliverable step, pushed as we go.
- `reference/` is git-ignored: it holds confidential pricing and strategy. Do not commit it, and do not paste its numbers into code, commit messages or issues.
- Commits end with the attribution line the harness specifies.

## Working style
Smallest change that fully works. Ask before anything outward-facing (publishing the live site, sending alerts, touching the pipeline sheet). Verify in a browser at 360px and desktop before calling UI done.
