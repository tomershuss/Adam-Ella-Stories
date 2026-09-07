#!/usr/bin/env node
// Generate per-sentence narration (MP3) for a story with ElevenLabs, plus audio/manifest.json.
//
//   node scripts/make-audio.mjs e/001        one story
//   node scripts/make-audio.mjs --all        every story under e/*/ whose audio is missing or outdated
//
// Env:  ELEVENLABS_API_KEY   required (never commit it; GitHub Actions gets it from a repo secret)
//       ELEVENLABS_VOICE_ID  optional, default "Lily" (pFZP5JQG7iQjIQuC4Bku), a soft, warm narrator
//       ELEVENLABS_MODEL     optional, default eleven_v3 (supports Hebrew and English)
//
// Only sentences whose text changed since the last run are regenerated (hash kept in the manifest).
// Output files are small (mp3 44.1kHz 64kbps mono): about 2–4 MB per story.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE = process.env.ELEVENLABS_VOICE_ID || 'pFZP5JQG7iQjIQuC4Bku';
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_v3';
const FORMAT = 'mp3_44100_64';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const flagVal = (f) => { const i = argv.indexOf(f); return i >= 0 ? (argv[i + 1] || '') : null; };
const LIST = argv.includes('--list-voices');          // your voices (premade + added), with labels
const LIBRARY = flagVal('--library');                  // search the public voice library, e.g. --library he
const AUDITION = flagVal('--audition');                // --audition id1,id2 [e/NNN]: record 2 sample sentences per voice into audition/
const arg = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--library' && argv[i - 1] !== '--audition');
if (!arg && !LIST && LIBRARY === null && AUDITION === null) {
  console.error('usage: make-audio.mjs [--dry-run] <e/NNN | --all>\n       make-audio.mjs --list-voices | --library <lang> | --audition <id,id,...> [e/NNN]'); process.exit(2);
}
if (!KEY && !DRY) { console.error('ELEVENLABS_API_KEY is not set'); process.exit(2); }

const H = { 'xi-api-key': KEY };
async function getJson(url) { const r = await fetch(url, { headers: H }); if (!r.ok) throw new Error(`${r.status} ${await r.text()}`); return r.json(); }
const label = (v) => [v.labels?.language, v.labels?.accent, v.labels?.gender, v.labels?.age, v.labels?.use_case || v.labels?.descriptive].filter(Boolean).join(', ');

if (LIST) {
  const { voices } = await getJson('https://api.elevenlabs.io/v1/voices');
  for (const v of voices) console.log(`${v.voice_id}  ${v.name.padEnd(14)} ${v.category.padEnd(12)} ${label(v)}${v.description ? '  — ' + v.description.slice(0, 80) : ''}`);
  process.exit(0);
}
if (LIBRARY !== null) {
  const q = new URLSearchParams({ language: LIBRARY || 'he', page_size: '40', sort: 'usage_character_count_1y' });
  const { voices } = await getJson('https://api.elevenlabs.io/v1/shared-voices?' + q);
  console.log(`Public library voices for language "${LIBRARY || 'he'}" (add one to "My voices" in the ElevenLabs app before using its id):`);
  for (const v of voices) console.log(`${v.voice_id}  ${v.name.padEnd(18)} ${[v.gender, v.age, v.accent, v.use_case].filter(Boolean).join(', ')}${v.description ? '  — ' + v.description.slice(0, 90) : ''}`);
  process.exit(0);
}

const decode = (s) => s.replace(/<[^>]+>/g, ' ')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();
const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const pad = (n) => String(n).padStart(2, '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Sentences per page, in the exact order the engine reads them (every element with class "s", SVGs removed).
function extract(html) {
  const lang = (/<html[^>]*\blang="([a-z]{2})/i.exec(html) || [, 'he'])[1];
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  const pages = [...main.matchAll(/<section class="page"[^>]*>([\s\S]*?)<\/section>/g)]
    .map((m) => m[1].replace(/<svg[\s\S]*?<\/svg>/g, ''))
    .map((p) => [...p.matchAll(/<(p|li|h1|h2)\b[^>]*class="s[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => decode(m[2])));
  return { lang, pages };
}

async function tts(text, lang) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=${FORMAT}`;
  const body = { text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75 } };
  if (/v2_5|flash|turbo/.test(MODEL)) body.language_code = lang === 'he' ? 'he' : 'en';
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { method: 'POST', headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' }, body: JSON.stringify(body) });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const msg = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 4) { console.warn(`  ${res.status}, retrying in ${attempt * 5}s`); await sleep(attempt * 5000); continue; }
    throw new Error(`ElevenLabs ${res.status}: ${msg.slice(0, 300)}`);
  }
}

async function buildStory(dir) {
  const file = path.join(ROOT, dir, 'index.html');
  if (!fs.existsSync(file)) { console.error(`no ${file}`); return { chars: 0, made: 0 }; }
  const { lang, pages } = extract(fs.readFileSync(file, 'utf8'));
  if (DRY) { // no API calls, nothing written: show what would be narrated
    let chars = 0; pages.forEach((p, i) => { p.forEach((t) => (chars += t.length)); console.log(`  page ${i + 1}: ${p.length} sentences${p.length ? ' · ' + p[0].slice(0, 40) + '…' : ''}`); });
    console.log(`${dir} (${lang}): ${pages.length} pages, ${pages.flat().length} sentences, ${chars} characters`);
    return { chars, made: 0 };
  }
  const outDir = path.join(ROOT, dir, 'audio');
  fs.mkdirSync(outDir, { recursive: true });
  const manifestPath = path.join(outDir, 'manifest.json');
  const old = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { hashes: {} };
  const sameVoice = old.voice_id === VOICE && old.model === MODEL;
  const manifest = { voice_id: VOICE, model: MODEL, format: FORMAT, lang, generated: new Date().toISOString(), pages: [], hashes: {} };
  let chars = 0, made = 0;
  for (let i = 0; i < pages.length; i++) {
    const files = [];
    for (let k = 0; k < pages[i].length; k++) {
      const text = pages[i][k]; const name = `p${pad(i + 1)}-s${pad(k + 1)}.mp3`; const h = sha(text);
      const out = path.join(outDir, name);
      if (!(sameVoice && old.hashes[name] === h && fs.existsSync(out))) {
        process.stdout.write(`  ${dir} ${name} (${text.length} chars) … `);
        fs.writeFileSync(out, await tts(text, lang)); chars += text.length; made++;
        console.log('ok'); await sleep(400);
      }
      files.push(name); manifest.hashes[name] = h;
    }
    manifest.pages.push(files);
  }
  // remove stale files from a previous, longer version
  for (const f of fs.readdirSync(outDir)) if (f.endsWith('.mp3') && !manifest.hashes[f]) fs.unlinkSync(path.join(outDir, f));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
  console.log(`${dir}: ${manifest.pages.length} pages, ${Object.keys(manifest.hashes).length} sentences, ${made} generated, ${chars} chars`);
  return { chars, made };
}

function needsWork(dir) {
  const m = path.join(ROOT, dir, 'audio', 'manifest.json');
  if (!fs.existsSync(m)) return true;
  const old = JSON.parse(fs.readFileSync(m, 'utf8'));
  if (old.voice_id !== VOICE || old.model !== MODEL) return true;
  const { pages } = extract(fs.readFileSync(path.join(ROOT, dir, 'index.html'), 'utf8'));
  return pages.some((p, i) => p.some((t, k) => old.hashes[`p${pad(i + 1)}-s${pad(k + 1)}.mp3`] !== sha(t)));
}

if (AUDITION !== null) { // same two sentences with each candidate voice, into audition/ (git-ignored), nothing else touched
  const dir = arg || 'e/001';
  const { lang, pages } = extract(fs.readFileSync(path.join(ROOT, dir, 'index.html'), 'utf8'));
  const samples = [pages[0][0], pages[0].find((t) => /\.\.\./.test(t)) || pages[0][pages[0].length - 1]];
  const out = path.join(ROOT, 'audition'); fs.mkdirSync(out, { recursive: true });
  const mine = Object.fromEntries((await getJson('https://api.elevenlabs.io/v1/voices')).voices.map((v) => [v.voice_id, v.name]));
  let chars = 0;
  for (const id of AUDITION.split(',').map((s) => s.trim()).filter(Boolean)) {
    const name = mine[id] || 'unknown';
    if (!mine[id]) { console.warn(`${id}: not in your voices (add it in the ElevenLabs app first), skipping`); continue; }
    process.stdout.write(`${name} (${id}) … `);
    const bufs = []; for (const t of samples) { bufs.push(await tts(t, lang)); chars += t.length; await sleep(300); }
    const f = path.join(out, `${name}-${id}.mp3`); fs.writeFileSync(f, Buffer.concat(bufs)); console.log(f);
  }
  console.log(`audition done, ${chars} characters. Listen: afplay audition/<file>.mp3`);
  process.exit(0);
}

const dirs = arg === '--all'
  ? fs.readdirSync(path.join(ROOT, 'e')).filter((d) => /^\d{3}$/.test(d) && fs.existsSync(path.join(ROOT, 'e', d, 'index.html'))).map((d) => `e/${d}`).filter(needsWork)
  : [arg.replace(/\/$/, '')];
if (!dirs.length) { console.log('nothing to do'); process.exit(0); }
let total = 0;
for (const d of dirs) total += (await buildStory(d)).chars;
console.log(`done. characters sent to ElevenLabs: ${total}`);
