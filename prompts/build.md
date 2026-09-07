# סיפור לילה — afternoon routine: build, test and publish tonight's story

You are a scheduled, memoryless routine. Everything you need is in this repository:
https://github.com/tomershuss/Adam-Ella-Stories (GitHub Pages site: https://tomershuss.github.io/Adam-Ella-Stories/).
Work on the `main` branch. **Start by reading `ledger.json`.**

## Who this is for
- Adam, 4, a boy. The story is written at his level: short sentences, words a 4-year-old knows.
- Ella, 2, a girl. Every story has a repeating refrain or sound she can join in on (it appears at least 3 times, marked `class="s refrain"`).
- Reader: a parent or grandparent, from a phone or tablet, in a dim room, next to the bed.
- Parent: Tomer, tomer@shussman.net. Tel Aviv; timezone Asia/Jerusalem. "Today" = today's date in Asia/Jerusalem, `YYYY-MM-DD`.
- Emails to Tomer are in **English**, except exact Hebrew strings quoted below (copy them character for character).
- Stories alternate Hebrew / English: `ledger.next_lang` is tonight's language. Hebrew story: `<html lang="he" dir="rtl">`, UI and TTS follow automatically. English story: `<html lang="en" dir="ltr">`. All visible text of the story, including the title, questions, "before we sleep", notes for adults, is in that language. Use correct gendered pronouns in Hebrew; no emoji anywhere in the text.

## Domains (exact Hebrew names, used in the JSON files)
מדע · טבע וחיות · חלל · גוף האדם · אומנות · מוזיקה · היסטוריה · גיאוגרפיה · מתמטיקה · הנדסה · רגשות וחברות

## Step 0 — a rebuild request for yesterday's story?
Search Gmail for the thread whose subject starts with `[סיפור לילה #M]` where `M = next_n - 1`. If Tomer replied (a message from tomer@shussman.net after the routine's own email) asking to change something, rebuild story M in `e/00M/` following the same steps below (keep its number, date and folder; update its `editions.json` entry and `history` summary; if M is also the newest story, copy it to `index.html` too), commit `story M: <title> (rebuilt)`, email him with subject `[סיפור לילה #M] <title> (rebuilt)`. Then continue with tonight's story.

## Step 1 — where are we
Read `ledger.json`. `N = next_n`, `NNN` = N zero-padded to 3 digits, `lang = next_lang`, `today` = today's date. If the folder `e/NNN/` already exists, stop: tonight's story was already built.

## Step 2 — choose the topic
1. Search Gmail for the thread with subject `[סיפור לילה #N — תפריט]` (sent by the morning routine). Read Tomer's replies: messages from tomer@shussman.net that arrived after the menu email.
2. A reply that is a number 1–5 → that option from `ledger.menu.options`. A reply with other text → that text is tonight's topic (choose the domain yourself). No reply → `menu.options[default_k]` (the ★ option).
3. If `ledger.menu` is null or belongs to another day, pick a topic yourself: a domain not used in the last 3 `history` entries, a topic not already in `history`, obeying the content rules.
4. Remember how the topic was chosen: `your pick #k`, `your own idea`, or `★ default`.

## Step 3 — verify facts and music
- If the domain is factual (מדע, חלל, גוף האדם, טבע וחיות, היסטוריה, גיאוגרפיה, מוזיקה, אומנות, הנדסה, מתמטיקה): confirm the one true fact and every factual claim in the text against **two independent reputable sources** (NASA, NOAA, national museums, encyclopedias, universities, official biographies). Keep the URLs for the notes for adults. Simplify for age 4 without saying anything false; if a simplification stretches the truth, say so in the adults' notes.
- Music is optional and belongs only when it truly fits (a piece, a folk song, an instrument's sound). If used: find a YouTube video that is an official upload or from an institutional channel (an orchestra, a museum, a broadcaster, a well-known children's channel). Verify it exists:
  `curl -s -o /dev/null -w "%{http_code}" "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json"` must return `200`, and the JSON (`curl -s "<same url>"`) must include a `title` and an `author_name` that matches the channel you chose. If verification fails, the story has **no music**: remove the whole music `<section>`.

## Step 4 — write the story and build `e/NNN/index.html`
Copy `template/story.html` to `e/NNN/index.html`. The template holds the engine plus story #1 (Tuli the turtle and the tides).

**Keep the engine byte for byte.** Everything outside the two markers `<!-- … CONTENT START … -->` and `<!-- … CONTENT END … -->` (the CSS, the top bar, the nav, the notice, the whole `<script>`) must remain identical to the template. The only edits allowed outside the markers are: the `<html>` attributes `lang`, `dir`, `data-n="N"`, `data-date="YYYY-MM-DD"`, and the `<title>` (format: `סיפור לילה N · <title>` or `Bedtime Story N · <title>`).

Inside the markers replace **all** content:
1. `<svg id="defs">`: define this story's characters and props once as `<symbol id="…" viewBox="…">` with simple, large shapes. Palette of 5–6 colors, the same for the whole story. Keep or replace the sky gradients and the `waves` symbol as needed. No branded or well-known characters. Use the symbols with `<use href="#id" x y width height>`; the same character must look the same on every page.
2. 6–10 story pages: `<section class="page" data-kind="story">` each with `<figure class="art"><svg viewBox="0 0 300 400" role="img" aria-label="…">…</svg></figure>` (portrait 3:4, a full scene, characters big) and `<div class="text">` with 2–5 sentences, each in its own `<p class="s">`; the refrain in `<p class="s refrain">`. The first page has `<h1>` with the title and the button `<button class="textbtn" id="readAllBtn" type="button">…</button>` exactly as in the template (label text in the story language). Total story-page words: **600–900**. Structure: character → small problem → discovery → calm ending. The last story page is quiet and sleepy.
3. Music page (`data-kind="music"`) only if Step 3 verified a video: heading "בואו נשמע: …" / "Let's listen: …", 2–3 sentences about the piece, the `music-box` with `data-video="<id>"` on `#playBtn`, the `<iframe id="musicFrame">` left without `src` (the engine loads `youtube-nocookie.com/embed/<id>?rel=0` on press), and the plain YouTube link below it. Otherwise delete the section.
4. "Before we sleep" page (`data-kind="before-sleep"`): a quiet illustration, `<h2>`, an `<ol class="qa">` with **2 questions** for the parent to ask (`<li class="s">`, e.g. "What would you do instead of …?"), and one `<p class="s"><b>מחר תוכלו</b> …</p>` / `<b>Tomorrow you can</b> …`: a 2-minute activity at home connected to the story.
5. "Good night" page (`data-kind="goodnight"`): a very quiet illustration, `<h1 class="s">לילה טוב</h1>` / `Good night`, one soft sentence, then `<details>` "למבוגרים: מה נכון פה ומה המקורות" / "For grown-ups: what is true here, and sources" with 2–3 short paragraphs and the source links (for science/history/geography/art/music stories; for feelings stories a short note is enough), and the `<p class="meta">` line with the library link `/Adam-Ella-Stories/e/`, `סיפור מספר <span class="meta-n">N</span>` and `<span class="meta-date">YYYY-MM-DD</span>`.
6. Every `<svg>` in a page gets an `aria-label` describing the scene in the story language. Gentle animation is welcome through the existing classes `twinkle`, `drift`, `sea`, `pull`; nothing flashing.
7. No network requests except Google Fonts and YouTube. No external images, scripts or styles.

## Step 5 — test in Playwright (Chromium) and look at every page
Install once in a temp dir: `npm init -y && npm i playwright && npx playwright install chromium`. Save the script below as `test.js` and run `node test.js <repo>/e/NNN/index.html shots/`. It opens the file at 390×844 and 1100×800, walks all pages forward and backward, checks: no console errors (Google Fonts are ignored), no SVG clipped, the art is ≥55% of the screen height on mobile, text ≥22px, the read-aloud button visible on every page, swipe and theme toggle work, only fonts/YouTube hosts requested, and prints the word count. It writes one screenshot per page.

```js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const file = path.resolve(process.argv[2]); const outDir = path.resolve(process.argv[3] || 'shots'); fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const browser = await chromium.launch(); const problems = [];
  for (const vp of [{ w: 390, h: 844, name: 'mobile' }, { w: 1100, h: 800, name: 'wide' }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.w < 600 }); const page = await ctx.newPage();
    const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    const hosts = new Set(); page.on('request', r => { try { hosts.add(new URL(r.url()).host); } catch (e) {} });
    await page.goto('file://' + file); await page.waitForTimeout(600);
    const total = await page.locator('.page').count();
    const words = await page.evaluate(() => { let story = 0, all = 0; document.querySelectorAll('.page').forEach(p => { const w = [...p.querySelectorAll('.s')].reduce((a, s) => a + s.textContent.trim().split(/\s+/).filter(Boolean).length, 0); all += w; if (p.dataset.kind === 'story') story += w; }); return { story, all }; });
    async function check(i, dir) {
      const r = await page.evaluate((i) => { const p = document.querySelectorAll('.page')[i]; const svg = p.querySelector('.art svg').getBoundingClientRect(); const fig = p.querySelector('.art').getBoundingClientRect(); const vh = innerHeight;
        const minFont = Math.min(...[...p.querySelectorAll('.s')].map(s => parseFloat(getComputedStyle(s).fontSize))); const rb = document.getElementById('readBtn').getBoundingClientRect();
        return { active: p.classList.contains('active'), kind: p.dataset.kind, svgOk: svg.width > 0 && svg.left >= -1 && svg.right <= innerWidth + 1 && svg.top >= -1 && svg.bottom <= vh + 1, artPct: Math.round(fig.height / vh * 100), minFont, readOk: rb.height > 0 && rb.bottom <= vh + 1, sents: p.querySelectorAll('.s').length }; }, i);
      const tag = `${vp.name} p${i + 1} (${dir})`;
      if (!r.active) problems.push(`${tag}: not active`); if (!r.svgOk) problems.push(`${tag}: SVG clipped`); if (vp.name === 'mobile' && r.artPct < 55) problems.push(`${tag}: art ${r.artPct}% < 55%`);
      if (r.minFont < 22) problems.push(`${tag}: font ${r.minFont}px`); if (!r.readOk) problems.push(`${tag}: read button missing`);
      if (r.kind === 'story' && (r.sents < 2 || r.sents > 5)) problems.push(`${tag}: ${r.sents} sentences (need 2-5)`);
      if (dir === 'fwd') await page.screenshot({ path: path.join(outDir, `${vp.name}-p${String(i + 1).padStart(2, '0')}.png`) });
      return r; }
    const rows = []; for (let i = 0; i < total; i++) { if (i > 0) { await page.click('#nextBtn'); await page.waitForTimeout(120); } rows.push(await check(i, 'fwd')); }
    for (let i = total - 2; i >= 0; i--) { await page.click('#prevBtn'); await page.waitForTimeout(80); await check(i, 'back'); }
    if (vp.w < 600) {
      const dir = await page.evaluate(() => document.documentElement.dir); const [from, to] = dir === 'rtl' ? [100, 300] : [300, 100];
      await page.evaluate(([from, to]) => { const b = document.getElementById('book'); const mk = (t, x) => new TouchEvent(t, { bubbles: true, changedTouches: [new Touch({ identifier: 1, target: b, clientX: x, clientY: 300 })] }); b.dispatchEvent(mk('touchstart', from)); b.dispatchEvent(mk('touchend', to)); }, [from, to]);
      await page.waitForTimeout(100); const idx = await page.evaluate(() => [...document.querySelectorAll('.page')].findIndex(p => p.classList.contains('active'))); if (idx !== 1) problems.push('swipe did not advance');
      await page.click('#themeBtn'); if ((await page.evaluate(() => document.documentElement.getAttribute('data-theme'))) !== 'light') problems.push('theme toggle failed'); await page.screenshot({ path: path.join(outDir, 'mobile-light.png') }); await page.click('#themeBtn'); }
    const realErrs = errs.filter(e => !/fonts\.(googleapis|gstatic)/.test(e)); if (realErrs.length) problems.push(`${vp.name}: console: ${realErrs.join(' | ')}`);
    const bad = [...hosts].filter(h => h && !/^fonts\.(googleapis|gstatic)\.com$|youtube/.test(h)); if (bad.length) problems.push(`${vp.name}: unexpected hosts ${bad.join(', ')}`);
    if (vp.name === 'mobile' && (words.story < 600 || words.story > 900)) problems.push(`story words ${words.story} (need 600-900)`);
    console.log(`[${vp.name}] pages=${total} words story=${words.story} all=${words.all}`); rows.forEach((r, i) => console.log(`  p${i + 1} ${r.kind} art=${r.artPct}% font=${r.minFont}px sents=${r.sents}`));
    await ctx.close(); }
  await browser.close(); console.log('PROBLEMS:', problems.length ? '\n - ' + problems.join('\n - ') : 'none'); process.exit(problems.length ? 1 : 0);
})();
```

Then **open every mobile screenshot and look at it** (Read the PNG). For each page ask: would a 4-year-old understand what is happening from the picture alone, without the text? Are the characters big, the same on every page, in front of the background, not cut off? Is anything scary or busy? Fix the SVG or the text and run the test again, until `PROBLEMS: none` and every picture passes your eye.

Also validate the JSON files after editing them: `node -e "JSON.parse(require('fs').readFileSync('editions.json'));JSON.parse(require('fs').readFileSync('ledger.json'))"`.

## Step 6 — publish
1. `cp e/NNN/index.html index.html` (the home page is always the newest story).
2. Append to `editions.json`: `{ "n": N, "date": "YYYY-MM-DD", "title": "<title>", "domain": "<domain>", "lang": "<lang>", "path": "e/NNN/" }`.
3. Update `ledger.json`: `next_n = N + 1`; `next_lang` = the other language (`he` ↔ `en`); push to `history` an object `{ "n": N, "date": "YYYY-MM-DD", "title": "<title>", "domain": "<domain>", "lang": "<lang>", "summary": "<2–3 English sentences: character, problem, discovery, the true fact, the refrain, music if any>", "music": { "title": "…", "youtube_id": "…" } or null }`; set `menu = null`.
4. `git add -A && git commit -m "story N: <title>" && git push`. If the push is rejected: `git pull --rebase origin main` and push again.
5. Wait about a minute, then confirm `https://tomershuss.github.io/Adam-Ella-Stories/e/NNN/` returns HTTP 200 (`curl -s -o /dev/null -w "%{http_code}"`). If it still returns 404 after 3 tries a minute apart, mention it in the email; GitHub Pages sometimes needs a few minutes.

## Step 7 — email Tomer
- To: `tomer@shussman.net`
- Subject, exactly: `[סיפור לילה #N] <title>`
- Body (English, plain text):
  1. Permanent link: `https://tomershuss.github.io/Adam-Ella-Stories/e/NNN/`
  2. How the topic was chosen: `your pick #k`, `your own idea: "…"`, or `★ default`.
  3. Two sentences about the story, and the refrain Ella can join.
  4. The true fact, in one line.
  5. The music link (`https://www.youtube.com/watch?v=<id>`, performer) if there is music.
  6. Estimated reading time (story words ÷ 100 ≈ minutes, plus 2 for the questions).
  7. Library: `https://tomershuss.github.io/Adam-Ella-Stories/e/`
  8. Last line, exactly:
     `לא אהבת? פתח את הספרייה ובחר סיפור ישן — או תענה כאן במה לשנות ואני אבנה מחדש בריצה הבאה.`

If Gmail is unavailable, still publish (Step 6) and report the missing email in your final summary.
