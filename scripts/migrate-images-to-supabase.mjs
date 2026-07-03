/**
 * Sube las 1,854 fotos ya mapeadas (public/abci-foto-map.json) a Supabase Storage
 * (bucket dog-photos), leyéndolas desde src/app/images/ en vez de depender del
 * sitio WordPress original (abciregistro.com), que ya está desactivado.
 *
 * Resumible: guarda progreso en scripts/wp-export/image-migration-progress.json
 * y saltea lo ya subido en reruns. Requiere SUPABASE_SECRET_KEY.
 *
 * Uso: node scripts/migrate-images-to-supabase.mjs
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local");
  process.exit(1);
}
const supabase = createClient(url, secretKey);

const MAP_PATH = path.join(__dirname, "../public/abci-foto-map.json");
const IMAGES_BASE = path.join(__dirname, "../src/app/images");
const PROGRESS_PATH = path.join(__dirname, "wp-export/image-migration-progress.json");
const RESULT_PATH = path.join(__dirname, "wp-export/photo-migration-result.json");
const BUCKET = "dog-photos";
const CONCURRENCY = 6;

const photoMap = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
fs.mkdirSync(path.dirname(PROGRESS_PATH), { recursive: true });

let progress = {};
if (fs.existsSync(PROGRESS_PATH)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf8"));
}

function saveProgress() {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

function contentTypeFor(filename) {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

const entries = Object.entries(photoMap);
let idx = 0;
let done = 0, failed = 0, skipped = 0;

async function worker() {
  while (idx < entries.length) {
    const i = idx++;
    const [certId, wpUrl] = entries[i];

    if (progress[certId]?.status === "done") {
      skipped++;
      continue;
    }

    const rel = wpUrl.split("/wp-content/uploads/")[1];
    if (!rel) {
      progress[certId] = { status: "failed", error: "URL sin wp-content/uploads" };
      failed++;
      continue;
    }
    const localPath = path.join(IMAGES_BASE, rel);
    const filename = path.basename(rel);
    const objectPath = `${certId}/${filename}`;

    try {
      const buffer = fs.readFileSync(localPath);
      const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
        contentType: contentTypeFor(filename),
        upsert: true,
      });
      if (error) throw error;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
      progress[certId] = { status: "done", publicUrl: pub.publicUrl, objectPath };
      done++;
    } catch (e) {
      progress[certId] = { status: "failed", error: String(e.message || e) };
      failed++;
    }

    if ((done + failed) % 100 === 0) {
      saveProgress();
      process.stdout.write(`  ${done + failed + skipped}/${entries.length} (ok: ${done}, fallidas: ${failed}, saltadas: ${skipped})\r`);
    }
  }
}

console.log(`Subiendo ${entries.length} fotos a Supabase Storage (bucket: ${BUCKET})...`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
saveProgress();

const result = {};
for (const [certId, p] of Object.entries(progress)) {
  if (p.status === "done") result[certId] = p.publicUrl;
}
fs.writeFileSync(RESULT_PATH, JSON.stringify(result, null, 2));

console.log(`\n\nResumen: ${done} subidas, ${failed} fallidas, ${skipped} ya estaban hechas.`);
console.log(`Mapa final (certificateId -> URL pública): ${RESULT_PATH} (${Object.keys(result).length} entradas)`);
if (failed > 0) {
  console.log(`\nHubo fallos. Volvé a correr el script — solo reintenta lo que no quedó 'done'.`);
  process.exit(1);
}
