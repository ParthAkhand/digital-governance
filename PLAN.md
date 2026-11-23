# Execution plan — City PMU marketing assets

Today: 23 Nov 2026. First review: **25 Nov**. Live: **30 Nov**. Rules and conflicts: see [CLAUDE.md](CLAUDE.md).

## 1. Analysis of the brief

**Goal.** One thing: an officer asks for the half-day visit. Every asset is judged by that.

**Audience.** Commissioners and senior officers. They read on phones, often in Hindi, and distrust vendor gloss. The pitch's strongest idea is the *reported vs verified gap*; the UI should make that gap the visual centre.

**What is fixed.** The Master pitch text, the ten rules, the dates. Our freedom is layout, typography, interaction, and engineering.

**What is missing (blocks quality).**
1. Tabs *Talk track*, *Ten-city plan*, *Marketing brief* (landing sections, form fields, Hindi lines). Not in `reference/`. Hindi must come from the owner, not from us.
2. Pipeline sheet location, and the alert channel Pavanjeet wants (WhatsApp vs email vs both).
3. Product name/logo (may change), brand colours if any, owner's confirmation of credentials.
4. Decision on the rule conflicts listed in CLAUDE.md.

**Quote sheet (internal).** Checked against its own formula; consistent. Nothing priced goes in any asset; "per household per month" is the only commercial wording.

**Risks.**
| Risk | Mitigation |
|---|---|
| Rule breach (price, name, method) slips into an asset | `scripts/check-rules` grep over built copy for ₹, "lakh", city names, "KPI", "checklist", client list; run before every push |
| Hindi mistranslation embarrasses us in front of an officer | Hindi only from owner's brief; native review before 30 Nov |
| Form lead lost silently | Apps Script writes row first, then alerts; failure shows the visitor a phone/WhatsApp fallback; daily test submission |
| Spam or junk leads | Honeypot field + server-side validation; no CAPTCHA friction |
| Personal data (officer name, phone, city) | Consent line on form, collect minimum fields, DPDP Act aware, no analytics cookies |
| Name change late | Single config, tested by renaming once in CI-free check |
| 7-day deadline vs 5 assets | Build one design system once; every asset reuses it |

## 2. Design direction

- Tone: sober civic authority. Off-white paper, deep ink text, one accent (a verified-green or civic blue; final with brand), reported figures in muted grey and verified figures in the accent so the gap reads at a glance.
- Type: a serif or humanist display for headlines, Noto Sans / Noto Sans Devanagari for body.
- Signature element: the **Ward 23 gap table** as an animated, tappable component (reported bar vs verified bar, gap highlighted), always captioned "illustrative".
- Second element: the 30-day timeline (4 phases, 3 gates) redrawn as native SVG from the pitch, not the pasted image.
- Page order follows the pitch exactly: headline → problem → what you see weekly → why independent → fits your city → what the Commissioner gets (calendar + scorecard) → live in 30 days → what we need from the city → what PMU does not do → credentials *(placeholder)* → commercials/next step → **visit-request form**. Sticky "Request a visit" button on mobile.
- Form fields: name, designation, city, mobile, preferred time, consent. Final list from the Marketing brief tab.

## 3. Execution phases

### Phase 0 — Foundations (23 Nov)
- Commit CLAUDE.md, PLAN.md, `.gitignore` (excludes `reference/`) and push.
- Send the owner the open-questions list (missing tabs, name, colours, conflicts, pipeline sheet).
- Scaffold `site/`: `index.html`, `styles.css`, `config.js`, `i18n/en.json`, `i18n/hi.json`, `app.js`.

### Phase 1 — Wireframe for 25 Nov review (23–24 Nov)
- Low-fi → mid-fi landing page in English with real pitch copy, mobile and desktop.
- Hindi layout shell with placeholder strings, to show Devanagari rhythm.
- Leave-behind: 2-page A4 layout draft from the same copy.
- Publish via GitHub Pages **only after owner OK** (outward-facing); otherwise share screenshots.
- Exit: owner can comment on structure; unresolved questions listed.

### Phase 2 — Build and design polish (25–27 Nov)
- High-fidelity landing page, interactive gap table, SVG timeline, language toggle, accessibility pass.
- Talk-track card (EN + HI, 1 page) and six-slide phone deck (portrait, 9:16) from shared tokens.
- Exit 27 Nov: card + deck first versions.

### Phase 3 — Form to pipeline (27–29 Nov)
- Apps Script web app: validate → append row → alert Pavanjeet. Deployed under owner's account.
- Client: inline errors, success state with "named closer within 24 hours" wording only if owner confirms that promise is public.
- End-to-end test with dummy leads; confirm row and alert arrive.

### Phase 4 — Finalise (29–30 Nov)
- Native Hindi review, rule-check script, Lighthouse (≥ 90 mobile perf/a11y), real-device test on a mid-range Android on 4G.
- Final PDF of leave-behind. Hand WhatsApp catalogue asset to Pavanjeet.
- Go live 30 Nov with owner sign-off.

### Phase 5 — After launch
- 2 Dec: sample pack with Shruti's team (format agreed with them first; same no-method rule).
- 7 Dec: two-minute demo video of what is live today. Record only real, live product; no mock footage.

## 4. Repo layout
```
CLAUDE.md  PLAN.md  .gitignore
reference/        (ignored)
site/             index.html, styles.css, config.js, app.js, i18n/, assets/
print/            leave-behind.html, talk-card.html, deck.html  (render to PDF)
scripts/          check-rules, build-pdf
apps-script/      form handler source
```

## 5. GitHub workflow
- `main` is the deployable branch. Work on short feature branches (`landing`, `leave-behind`, `form`, `deck`), merge via PR so the owner can review diffs.
- Each PR: description, screenshot at 360px and desktop, rule-check output.
- Never commit `reference/`, secrets, sheet IDs or webhook URLs (use config the owner sets at deploy).

## 6. Definition of done (per asset)
Copy matches the Master pitch verbatim; zero rule-check hits; name swaps from one place; EN and HI both complete; passes 360px and desktop review; owner has signed off.
