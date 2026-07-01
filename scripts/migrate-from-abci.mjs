#!/usr/bin/env node
/**
 * Script de migración: extrae todos los ejemplares del registro WP actual
 * y los exporta a un Excel listo para importar en el panel admin ABCI.
 *
 * Estrategia:
 *  1. Lee los sitemaps XML para descubrir todas las URLs públicas.
 *  2. Consulta la API REST de WordPress (wp-json/wp/v2/...) en lotes
 *     de 100 por página para obtener el listado base (rápido).
 *  3. Para cada URL visita la página HTML y extrae los campos
 *     estructurados (nombre, raza, color, sexo, microchip, padre,
 *     madre, criador, propietario, fecha de nacimiento).
 *  4. Guarda resultados parciales en JSON cada N items
 *     (resumible si se interrumpe).
 *  5. Exporta el resultado final a XLSX y CSV.
 *
 * Uso:
 *   cd bullypedex-clone
 *   node scripts/migrate-from-abci.mjs           # corre todo
 *   node scripts/migrate-from-abci.mjs --resume  # continúa donde quedó
 *   node scripts/migrate-from-abci.mjs --limit 100   # primeros 100
 *   node scripts/migrate-from-abci.mjs --type abcidog
 */

import fs from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";

const BASE = "https://abciregistro.com";
const POST_TYPES = ["abcidog", "registro-de-ejemplar"]; // formato nuevo + legacy
const OUTPUT_DIR = path.join(process.cwd(), "scripts", "abci-export");
const CONCURRENCY = 6;        // requests simultáneas
const DELAY_MS = 150;         // pausa entre tandas (respeta el servidor)
const RETRY_MAX = 3;
const CHECKPOINT_EVERY = 100;

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flag = (name, def = false) => {
  const i = args.indexOf(name);
  if (i === -1) return def;
  const next = args[i + 1];
  if (next && !next.startsWith("--")) return next;
  return true;
};

const RESUME = flag("--resume", false);
const LIMIT = parseInt(flag("--limit", "0"), 10);
const TYPE_FILTER = flag("--type", null);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchText(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ABCI-Migrator/1.0" },
    });
    // 404 no se reintenta (recurso no existe)
    if (res.status === 404) {
      const e = new Error(`HTTP 404 en ${url}`);
      e.status = 404;
      throw e;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
    return await res.text();
  } catch (err) {
    if (err.status === 404) throw err;
    if (attempt >= RETRY_MAX) throw err;
    const wait = 1000 * (attempt + 1);
    console.warn(`  ⚠ reintentando (${attempt + 1}/${RETRY_MAX}) en ${wait}ms — ${err.message}`);
    await sleep(wait);
    return fetchText(url, attempt + 1);
  }
}

async function fetchJSON(url) {
  const text = await fetchText(url);
  return JSON.parse(text);
}

// Parser de sitemap sin dependencias: extrae los <loc>
function parseSitemapLocs(xml) {
  const out = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

// Pool de promesas con concurrencia limitada
async function processWithConcurrency(items, worker, concurrency) {
  const results = [];
  let i = 0;
  async function spawn() {
    while (i < items.length) {
      const myIdx = i++;
      try {
        results[myIdx] = await worker(items[myIdx], myIdx);
      } catch (err) {
        results[myIdx] = { __error: err.message, url: items[myIdx] };
      }
    }
  }
  const runners = Array.from({ length: concurrency }, spawn);
  await Promise.all(runners);
  return results;
}

// ────────────────────────────────────────────────────────────────────────
// 1. Descubrir URLs vía sitemap
// ────────────────────────────────────────────────────────────────────────

async function discoverAllUrls() {
  console.log("📡 Leyendo índice de sitemaps…");
  const indexXml = await fetchText(`${BASE}/wp-sitemap.xml`);
  const subSitemaps = parseSitemapLocs(indexXml);

  const matchTypes = TYPE_FILTER ? [TYPE_FILTER] : POST_TYPES;
  const relevant = subSitemaps.filter(u =>
    matchTypes.some(t => u.includes(`wp-sitemap-posts-${t}-`))
  );

  console.log(`   Encontrados ${relevant.length} sub-sitemaps relevantes`);
  const allUrls = new Set();

  for (const sm of relevant) {
    const fname = sm.split("/").pop();
    try {
      console.log(`   ↳ leyendo ${fname}`);
      const xml = await fetchText(sm);
      const locs = parseSitemapLocs(xml);
      console.log(`     ✓ ${locs.length} URLs`);
      for (const loc of locs) allUrls.add(loc);
    } catch (err) {
      if (err.status === 404) {
        console.log(`     · ${fname} no existe (omitido)`);
      } else {
        console.warn(`     ⚠ error en ${fname}: ${err.message}`);
      }
    }
  }

  console.log(`✅ Total de URLs descubiertas: ${allUrls.size}`);
  return Array.from(allUrls);
}

// ────────────────────────────────────────────────────────────────────────
// 2. Extracción de datos de cada página HTML
// ────────────────────────────────────────────────────────────────────────

/**
 * Extrae campos de la página HTML del ejemplar.
 * Estrategia:
 *  1. Limpia el HTML (sin scripts/styles/comentarios).
 *  2. Recorre el texto plano buscando las posiciones de cada etiqueta conocida.
 *  3. Extrae el contenido entre cada etiqueta y la siguiente — evita que
 *     "Color BLUE Fecha 2023-08-13" devuelva "BLUE Fecha 2023-08-13" en color.
 *  4. Aplica limpieza específica por campo (fechas, microchip numérico, etc.).
 */
function extractFromHtml(html) {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&aacute;/gi, "á").replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í").replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú").replace(/&ntilde;/gi, "ñ");

  const text = cleaned.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  // Etiquetas exactas que aparecen en las páginas (orden importa para la
  // detección de límites, pero las posiciones se calculan dinámicamente).
  const LABELS = [
    { key: "certificateIdAbci", re: /Registro\s+ABCI\s*:\s*/i },
    { key: "breed", re: /\bRaza\s+/i },
    { key: "gender", re: /\bSexo\s+/i },
    { key: "color", re: /\bColor\s+/i },
    { key: "dob", re: /Fecha\s+de\s+nacimiento\s+/i },
    { key: "microchip", re: /Microchip\s+/i },
    { key: "sireNumber", re: /N°\s+Registro\s+del\s+Padre\s+/i },
    { key: "damNumber", re: /N°\s+Registro\s+de\s+la\s+Madre\s+/i },
    { key: "sireName", re: /Nombre\s+del\s+Padre\s+/i },
    { key: "damName", re: /Nombre\s+de\s+la\s+Madre\s+/i },
    { key: "breederName", re: /Criador\s+/i },
    { key: "ownerName", re: /Propietario\s+/i },
    { key: "location", re: /Ubicaci[oó]n\s+/i },
  ];

  // Boundaries: cualquier etiqueta de cierre de sección termina un valor
  const BOUNDARY = /(N°\s+Registro\s+del|N°\s+Registro\s+de\s+la|Información\s+Familiar|Información\s+General|Galer[ií]a|Compartir|Datos\s+Administrativos|DEL\s+EJEMPLAR|Titulos|T[ií]tulos|Multimedia|Pedigree)/i;

  // Encuentra todas las posiciones de etiquetas
  const found = [];
  for (const { key, re } of LABELS) {
    const m = text.match(re);
    if (m && typeof m.index === "number") {
      found.push({ key, start: m.index, after: m.index + m[0].length });
    }
  }
  // Ordenar por posición y extraer el valor hasta la siguiente etiqueta o boundary
  found.sort((a, b) => a.start - b.start);

  const out = {};
  for (let i = 0; i < found.length; i++) {
    const cur = found[i];
    const nextStart = i + 1 < found.length ? found[i + 1].start : text.length;
    let value = text.slice(cur.after, nextStart).trim();

    // Recortar si aparece una palabra-boundary antes que la siguiente etiqueta
    const bMatch = value.match(BOUNDARY);
    if (bMatch && typeof bMatch.index === "number") {
      value = value.slice(0, bMatch.index).trim();
    }

    // Quitar ":" inicial residual
    value = value.replace(/^:\s*/, "").trim();
    if (value) out[cur.key] = value;
  }

  // Limpieza específica por campo
  if (out.microchip) {
    const m = out.microchip.match(/\d{10,20}/);
    out.microchip = m ? m[0] : "";
  }
  if (out.dob) {
    const iso = out.dob.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    out.dob = iso ? `${iso[1]}-${iso[2].padStart(2,"0")}-${iso[3].padStart(2,"0")}` : "";
  }
  if (out.gender) {
    const g = out.gender.toUpperCase();
    out.gender = g.startsWith("H") || g === "FEMALE" || g === "F" ? "female" : "male";
  }
  if (out.certificateIdAbci) {
    const n = out.certificateIdAbci.match(/\d{2,8}/);
    out.certificateId = n ? n[0] : out.certificateIdAbci;
    delete out.certificateIdAbci;
  }
  // Limpiar números de padre/madre — solo dígitos
  if (out.sireNumber) {
    const m = out.sireNumber.match(/\d+/);
    out.sireNumber = m && m[0] !== "0" && !/^0{4,}$/.test(m[0]) ? m[0] : "";
  }
  if (out.damNumber) {
    const m = out.damNumber.match(/\d+/);
    out.damNumber = m && m[0] !== "0" && !/^0{4,}$/.test(m[0]) ? m[0] : "";
  }
  // Quitar valores "ALL" o de placeholder
  if (out.breed && /^(all|todas?)$/i.test(out.breed)) delete out.breed;
  // Limpiar valores placeholder "—" "-" "00000" "N/A"
  for (const k of Object.keys(out)) {
    if (/^[-—–\s]+$/.test(out[k]) || /^0{4,}$/.test(out[k]) || /^n\/?a$/i.test(out[k])) {
      delete out[k];
    }
  }
  return out;
}

async function fetchAndParse(url) {
  const html = await fetchText(url);

  // El nombre del ejemplar viene del <title> o del <h1> de la página
  const slug = url.replace(/\/$/, "").split("/").pop();
  let name = "";
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) name = h1[1].replace(/<[^>]+>/g, "").trim();
  if (!name) {
    const t = html.match(/<title>([^<]+)<\/title>/i);
    if (t) name = t[1].split("|")[0].split("–")[0].split("-")[0].trim();
  }
  name = name
    .replace(/&amp;/g, "&").replace(/&#8217;/g, "'").replace(/&#8211;/g, "–")
    .replace(/\s+ABCI\s+WORLD\s+WIDE.*$/i, "")
    .replace(/\s*[–\-]\s*$/g, "")
    .trim();

  const fields = extractFromHtml(html);
  return {
    sourceUrl: url,
    slug,
    name: (name || slug).toUpperCase(),
    ...fields,
  };
}

// ────────────────────────────────────────────────────────────────────────
// 3. Orquestación principal
// ────────────────────────────────────────────────────────────────────────

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const checkpointFile = path.join(OUTPUT_DIR, "checkpoint.json");
  const errorsFile = path.join(OUTPUT_DIR, "errors.json");

  let urls;
  let processed = {};
  if (RESUME) {
    try {
      const cp = JSON.parse(await fs.readFile(checkpointFile, "utf8"));
      urls = cp.urls;
      processed = cp.processed || {};
      console.log(`📂 Reanudando: ${Object.keys(processed).length}/${urls.length} ya procesados`);
    } catch {
      console.log("⚠ No hay checkpoint, empezando desde cero");
      urls = await discoverAllUrls();
    }
  } else {
    urls = await discoverAllUrls();
  }

  if (LIMIT) urls = urls.slice(0, LIMIT);
  const pending = urls.filter(u => !processed[u]);
  console.log(`\n🚀 Procesando ${pending.length} URLs (concurrencia: ${CONCURRENCY})\n`);

  let count = Object.keys(processed).length;
  const errors = [];

  await processWithConcurrency(pending, async (url) => {
    try {
      const data = await fetchAndParse(url);
      processed[url] = data;
      count++;
      if (count % 10 === 0) {
        process.stdout.write(`\r   procesados: ${count}/${urls.length}`);
      }
      if (count % CHECKPOINT_EVERY === 0) {
        await fs.writeFile(checkpointFile, JSON.stringify({ urls, processed }));
      }
      await sleep(DELAY_MS);
    } catch (err) {
      errors.push({ url, error: err.message });
      console.warn(`\n   ✗ ${url} → ${err.message}`);
    }
  }, CONCURRENCY);

  process.stdout.write("\n");

  // Guardar checkpoint final + errores
  await fs.writeFile(checkpointFile, JSON.stringify({ urls, processed }));
  if (errors.length) {
    await fs.writeFile(errorsFile, JSON.stringify(errors, null, 2));
    console.log(`⚠ ${errors.length} errores guardados en ${errorsFile}`);
  }

  // Exportar
  const rows = Object.values(processed).filter(d => d && !d.__error);
  console.log(`\n📊 Exportando ${rows.length} ejemplares…`);

  // Mapeo a columnas listas para importar en el admin
  const excelRows = rows.map(r => ({
    "Nombre de registro":         r.name || "",
    "Nombre de llamada":          "",
    "Raza":                       r.breed || "American Bully",
    "Variante":                   "",
    "Sexo (male/female)":         /h(embra|emale)/i.test(r.gender || "") ? "female" : "male",
    "Color":                      r.color || "",
    "Fecha de nacimiento (YYYY-MM-DD)": normalizeDate(r.dob),
    "Peso (kg)":                  "",
    "Altura (cm)":                "",
    "Microchip":                  r.microchip || "",
    "Padre":                      r.sireName || "",
    "Madre":                      r.damName || "",
    "Criadero":                   r.kennelName || "",
    "Criador":                    r.breederName || "",
    "Ubicación":                  r.location || "",
    "Nro. de registro (opcional)": r.certificateId || "",
    "URL origen":                 r.sourceUrl,
  }));

  // XLSX
  const ws = XLSX.utils.json_to_sheet(excelRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ejemplares");
  const stamp = new Date().toISOString().slice(0, 10);
  const xlsxPath = path.join(OUTPUT_DIR, `abci-export-${stamp}.xlsx`);
  XLSX.writeFile(wb, xlsxPath);

  // CSV
  const csvPath = path.join(OUTPUT_DIR, `abci-export-${stamp}.csv`);
  await fs.writeFile(csvPath, XLSX.utils.sheet_to_csv(ws), "utf8");

  // JSON crudo
  const jsonPath = path.join(OUTPUT_DIR, `abci-export-${stamp}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(rows, null, 2), "utf8");

  console.log(`\n✅ Migración completa`);
  console.log(`   ${rows.length} ejemplares extraídos`);
  console.log(`   ${errors.length} con error`);
  console.log(`\n📁 Archivos generados:`);
  console.log(`   · ${xlsxPath}   ← importar este en el admin`);
  console.log(`   · ${csvPath}`);
  console.log(`   · ${jsonPath}`);
}

function normalizeDate(s) {
  if (!s) return "";
  // Acepta "2024-05-12", "12/05/2024", "12-05-2024", "May 12, 2024"
  const iso = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const dmy = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  return "";
}

main().catch(err => {
  console.error("\n💥 Error fatal:", err);
  process.exit(1);
});
