# סיפור לילה · Bedtime Story

A static GitHub Pages site. Every evening a new 5–10 minute bedtime story appears, illustrated, read aloud by a parent (or by the phone), for Adam (4) and Ella (2).

Live site: https://tomershuss.github.io/Adam-Ella-Stories/

## Layout

```
index.html            ← always a copy of the newest story
e/index.html          ← library: reads editions.json, one card per story, newest first
e/001/index.html      ← story #1 (permanent link), e/002/, e/003/ …
template/story.html   ← the engine + story #1. New stories are built from this file
editions.json         ← list shown by the library: n, date, title, domain, lang, path
ledger.json           ← state for the routines: next_n, next_lang, family, history, tonight's menu
prompts/menu.md       ← prompt for the morning routine (sends 5 topic options by email)
prompts/build.md      ← prompt for the afternoon routine (builds, tests, publishes, emails)
.nojekyll             ← tells GitHub Pages not to run Jekyll
```

## The story page

One self-contained HTML file. Everything outside the `CONTENT START` / `CONTENT END` markers is the engine
(CSS, navigation, swipe, read-aloud via `speechSynthesis`, night mode, footer) and must stay identical across stories.
Inside the markers: a hidden `<svg id="defs">` with the story's characters as `<symbol>`s, then one `<section class="page">`
per page (portrait SVG, viewBox `0 0 300 400`, plus 2–5 sentences as `<p class="s">`), an optional music page,
a "before we sleep" page and a "good night" page with notes and sources for adults.

Stories alternate between Hebrew (`<html lang="he" dir="rtl">`) and English (`lang="en" dir="ltr"`); the engine picks
UI labels and the text-to-speech voice from `lang`.

## Routines

Two scheduled Claude Code routines work on this repo (see `prompts/`):

- **Morning** (~07:30 Asia/Jerusalem): reads `ledger.json`, emails 5 topic options, writes the menu into the ledger, commits `menu N`.
- **Afternoon** (~15:05 Asia/Jerusalem): reads the reply (or takes the default), verifies facts and the YouTube video, builds `e/NNN/index.html`
  from the template, tests it in Playwright at 390px and 1100px, publishes, updates `editions.json` and `ledger.json`, commits `story N: <title>`, emails the link.

## Testing a story locally

```bash
npx playwright install chromium
node test.js path/to/story.html shots/
```
(the test script lives in `prompts/build.md`, step 5).
