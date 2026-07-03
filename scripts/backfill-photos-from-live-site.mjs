/**
 * Completa fotos faltantes cruzando contra el sitio WP en vivo (abciregistro.com),
 * que resultó seguir activo (a diferencia de lo asumido en la migración original).
 *
 * El mapa de fotos original (public/abci-foto-map.json, 1,854 entradas) se construyó
 * parseando el XML WXR buscando los custom fields "foto-del-ejemplar", "_thumbnail_id",
 * etc. — pero el campo real que usa el sitio es "imagen" (con {id,url} anidado), que
 * ese parser nunca miró. La API REST de WP sí expone ese campo directamente.
 *
 * El REST API no expone el número de registro ABCI (no está registrado para REST),
 * así que el cruce se hace por título exacto (nombre completo del ejemplar), que WP
 * sí expone y coincide 1:1 con dogs.name. Para evitar asignar la foto al ejemplar
 * equivocado, solo se aplica cuando:
 *   - el nombre es único en nuestra tabla dogs (sin duplicados), Y
 *   - todas las publicaciones de WP con ese título comparten la misma URL de imagen
 *     (si hay ambigüedad de fotos entre duplicados del lado de WP, se descarta)
 *
 * Resumible: guarda progreso en scripts/wp-export/photo-backfill-progress.json.
 * Requiere SUPABASE_SECRET_KEY en .env.local.
 *
 * Uso: node scripts/backfill-photos-from-live-site.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
if (!SUPABASE_URL || !SECRET_KEY) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SECRET_KEY);

const WP_BASE = "https://abciregistro.com";
const POST_TYPES = ["abcidog", "registro-de-ejemplar"];
const BUCKET = "dog-photos";
const CONCURRENCY = 8;
const PROGRESS_PATH = path.join(__dirname, "wp-export/photo-backfill-progress.json");
fs.mkdirSync(path.dirname(PROGRESS_PATH), { recursive: true });

function normalizeName(s) {
  return (s || "").replace(/&amp;/g, "&").replace(/&#8217;/g, "'").replace(/&#8211;/g, "-")
    .replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().toUpperCase();
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJsonRetry(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "ABCI-PhotoBackfill/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
    return await res.json();
  } catch (e) {
    if (attempt >= 3) throw e;
    await sleep(1000 * (attempt + 1));
    return fetchJsonRetry(url, attempt + 1);
  }
}

// ── 1. Recolectar título → URL de imagen desde WP (paginado) ────────────────
async function collectWpPhotosByTitle() {
  const byTitle = new Map(); // normalizedTitle -> Set<imageUrl>

  for (const type of POST_TYPES) {
    let page = 1;
    let totalPages = 1;
    do {
      const url = `${WP_BASE}/wp-json/wp/v2/${type}?per_page=100&page=${page}&_fields=id,title,meta`;
      const res = await fetch(url, { headers: { "User-Agent": "ABCI-PhotoBackfill/1.0" } });
      if (!res.ok) {
        if (res.status === 400 && page > 1) break; // WP devuelve 400 al pasar la última página
        throw new Error(`HTTP ${res.status} en ${url}`);
      }
      totalPages = parseInt(res.headers.get("x-wp-totalpages") || "1", 10);
      const posts = await res.json();

      for (const post of posts) {
        const title = normalizeName(post.title?.rendered);
        const imagen = post.meta?.imagen;
        const imgUrl = imagen && typeof imagen === "object" ? imagen.url : "";
        if (!title || !imgUrl || !imgUrl.startsWith("http")) continue;
        if (!byTitle.has(title)) byTitle.set(title, new Set());
        byTitle.get(title).add(imgUrl);
      }

      process.stdout.write(`  [${type}] página ${page}/${totalPages}\r`);
      page++;
      await sleep(80);
    } while (page <= totalPages);
    console.log(`\n  ✓ ${type} completo`);
  }

  return byTitle;
}

// ── 2. Reducir a matches sin ambigüedad ──────────────────────────────────────
function unambiguousPhotoByTitle(byTitle) {
  const out = new Map();
  for (const [title, urls] of byTitle) {
    if (urls.size === 1) out.set(title, [...urls][0]);
  }
  return out;
}

// ── 3. Traer ejemplares sin foto desde Supabase ──────────────────────────────
async function fetchDogsMissingPhoto() {
  const rows = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("dogs")
      .select("id, name, certificate_id")
      .eq("has_photo", false)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

function contentTypeFor(filename) {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

async function main() {
  console.log("1/4 — Recolectando fotos desde abciregistro.com (API REST)...");
  const byTitle = await collectWpPhotosByTitle();
  const unambiguous = unambiguousPhotoByTitle(byTitle);
  console.log(`  Títulos con foto en WP: ${byTitle.size} (sin ambigüedad: ${unambiguous.size})`);

  console.log("\n2/4 — Buscando ejemplares sin foto en nuestra base...");
  const missing = await fetchDogsMissingPhoto();
  const nameCounts = new Map();
  for (const d of missing) nameCounts.set(d.name, (nameCounts.get(d.name) || 0) + 1);
  console.log(`  Sin foto: ${missing.length}`);

  console.log("\n3/4 — Cruzando por nombre único...");
  const candidates = [];
  for (const d of missing) {
    if (nameCounts.get(d.name) !== 1) continue; // nombre duplicado en nuestra tabla: se omite
    const url = unambiguous.get(normalizeName(d.name));
    if (url) candidates.push({ id: d.id, certificateId: d.certificate_id, name: d.name, url });
  }
  console.log(`  Candidatos con match seguro: ${candidates.length}`);

  let progress = {};
  if (fs.existsSync(PROGRESS_PATH)) progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf8"));
  function saveProgress() { fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2)); }

  console.log("\n4/4 — Descargando y subiendo a Supabase Storage...");
  let idx = 0, done = 0, failed = 0, skipped = 0;

  async function worker() {
    while (idx < candidates.length) {
      const i = idx++;
      const c = candidates[i];
      if (progress[c.id]?.status === "done") { skipped++; continue; }

      try {
        const imgRes = await fetch(c.url, { headers: { "User-Agent": "ABCI-PhotoBackfill/1.0" } });
        if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status} descargando imagen`);
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const filename = c.url.split("/").pop().split("?")[0] || "foto.jpg";
        const objectPath = `${c.certificateId}/${filename}`;

        const { error: upErr } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
          contentType: contentTypeFor(filename),
          upsert: true,
        });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
        const { error: dbErr } = await supabase.from("dogs").update({ photo_url: pub.publicUrl }).eq("id", c.id);
        if (dbErr) throw dbErr;

        progress[c.id] = { status: "done", publicUrl: pub.publicUrl, certificateId: c.certificateId };
        done++;
      } catch (e) {
        progress[c.id] = { status: "failed", error: String(e.message || e), certificateId: c.certificateId };
        failed++;
      }

      if ((done + failed) % 50 === 0) {
        saveProgress();
        process.stdout.write(`  ${done + failed + skipped}/${candidates.length} (ok: ${done}, fallidas: ${failed}, saltadas: ${skipped})\r`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  saveProgress();

  console.log(`\n\nResumen final:`);
  console.log(`  Ejemplares sin foto (total):        ${missing.length}`);
  console.log(`  Con nombre único + match en WP:     ${candidates.length}`);
  console.log(`  Fotos subidas exitosamente:         ${done}`);
  console.log(`  Fallidas:                           ${failed}`);
  console.log(`  Ya estaban hechas (rerun):          ${skipped}`);
  console.log(`  Quedan sin foto (nombre duplicado o sin match en WP): ${missing.length - candidates.length}`);
}

main().catch(e => { console.error("\n💥 Error fatal:", e); process.exit(1); });
