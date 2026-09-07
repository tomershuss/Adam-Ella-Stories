# סיפור לילה — morning routine: send tonight's menu

You are a scheduled, memoryless routine. Everything you need is in this repository:
https://github.com/tomershuss/Adam-Ella-Stories (GitHub Pages site: https://tomershuss.github.io/Adam-Ella-Stories/).
Work on the `main` branch. **Start by reading `ledger.json`.**

## Who this is for
- Adam, 4, a boy. The story is written at his level.
- Ella, 2, a girl. Every story has a repeating refrain or sound she can join in on.
- Parent: Tomer, tomer@shussman.net. Family lives in Tel Aviv; timezone Asia/Jerusalem. "Today" means today's date in Asia/Jerusalem, written `YYYY-MM-DD`.
- Emails to Tomer are in **English**, except the exact Hebrew strings quoted below, which must be copied character for character.
- Stories alternate Hebrew / English. `ledger.next_lang` is tonight's language (`"he"` or `"en"`).

## Rules for topics
Domains rotate through: מדע (science), טבע וחיות (nature & animals), חלל (space), גוף האדם (the human body), אומנות (art: a painter or a way of making things), מוזיקה (an instrument, a composer, a kind of music), היסטוריה (a person or an invention), גיאוגרפיה (a place in the world), מתמטיקה (shapes, counting, patterns), הנדסה (how something works), רגשות וחברות (feelings & friendship). Use these exact Hebrew domain names in `ledger.json` and `editions.json`.

Every story: one character (a child, an animal, or a real historical figure adapted for age 4), a small problem, a discovery, a calm ending, and one true fact that stays with the child. No fear, no threatening villains, no action at the end. The story should put children to sleep, not wake them up.

## Steps
1. Read `ledger.json`. Let `N = next_n`, `today` = today's date, `lang = next_lang`.
   If `menu` is not null and `menu.n == N` and `menu.date == today`, stop: the menu was already sent today.
2. Look at `history`. Collect the domains of the **last 3** entries (excluded tonight) and the domains of the last 10 (prefer the ones used least). Collect every past title and summary (no topic may repeat, in any language).
3. Propose **5 options**, each in a **different domain**, none in the 3 excluded domains, none repeating a past topic. For each option write:
   - a title in tonight's language (`lang`),
   - one sentence describing the story (English),
   - the domain (exact Hebrew name),
   - optional: a music suggestion when it fits naturally (a classical piece, a folk song, the sound of an instrument) with the composer/performer to look for. Leave empty when nothing fits; most stories have no music.
   Mark exactly one option as the default with `★`: the calmest, clearest story with the best true fact.
4. Send one email:
   - To: `tomer@shussman.net`
   - Subject, exactly: `[סיפור לילה #N — תפריט] YYYY-MM-DD` (replace N and the date; keep the Hebrew, the em dash and the brackets).
   - Body: first line `Tonight's story is in Hebrew` or `Tonight's story is in English`. Then the five options, numbered 1–5, each on its own block: title, the one sentence, `Domain: …`, `Music: …` if any, and `★` at the start of the default option's title line. Last line, exactly:
     `תענה במספר, או תכתוב רעיון משלך. בלי תגובה עד 15:00 — ★.`
5. Write the menu into `ledger.json` under `menu` (replace the whole value; change nothing else in the file):
   ```json
   "menu": {
     "n": N, "date": "YYYY-MM-DD", "lang": "he",
     "options": [
       {"k": 1, "title": "…", "summary": "…", "domain": "…", "music": "… or null"},
       {"k": 2, "...": "..."}, {"k": 3}, {"k": 4}, {"k": 5}
     ],
     "default_k": 3
   }
   ```
   Keep the JSON valid (check with `python3 -m json.tool ledger.json` or `node -e "JSON.parse(require('fs').readFileSync('ledger.json'))"`).
6. Commit and push: `git add ledger.json && git commit -m "menu N" && git push`. If the push is rejected, run `git pull --rebase origin main` and push again.

If email cannot be sent (no Gmail access), still do steps 5–6 so the afternoon routine has a menu, and say so in your final summary.
