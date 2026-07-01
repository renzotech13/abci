#!/usr/bin/env node
/**
 * Parser de exportación nativa de WordPress (formato WXR / XML).
 *
 * A diferencia del scraper HTML (migrate-from-abci.mjs), este script lee
 * directamente el XML que genera WordPress en Herramientas → Exportar.
 * Es mucho más confiable porque cada campo personalizado (postmeta) viene
 * limpio y estructurado — sin necesidad de adivinar nada desde el HTML.
 *
 * Soporta los dos tipos de contenido del registro ABCI:
 *   - abcidog               (REGISTRO 2.0, el formato nuevo)
 *   - registro-de-ejemplar  (BBDD antigua, formato legacy)
 *
 * Uso:
 *   node scripts/parse-wxr-export.mjs "/ruta/REGISTRO 2.0.xml" "/ruta/BBDD ANTIGUA.xml"
 *
 *   # Si no se pasan rutas, busca automáticamente en ~/Downloads
 *   node scripts/parse-wxr-export.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import * as XLSX from "xlsx";

const OUTPUT_DIR = path.join(process.cwd(), "scripts", "wp-export");
const VALID_POST_TYPES = new Set(["abcidog", "registro-de-ejemplar"]);
const VALID_STATUSES = new Set(["publish", "pending"]);

// Valor placeholder que aparece en registros de prueba del sitio original
const PLACEHOLDER_RE = /^5342153245234534235242354234\d*$/;

// ────────────────────────────────────────────────────────────────────────
// 1. Localizar archivos de entrada
// ────────────────────────────────────────────────────────────────────────

async function resolveInputFiles() {
  const argPaths = process.argv.slice(2).filter(a => !a.startsWith("--"));
  if (argPaths.length > 0) return argPaths;

  console.log("ℹ No se pasaron rutas — buscando archivos .xml en ~/Downloads…");
  const downloads = path.join(os.homedir(), "Downloads");
  const entries = await fs.readdir(downloads);
  const xmlFiles = entries.filter(f => f.toLowerCase().endsWith(".xml"));
  if (xmlFiles.length === 0) {
    throw new Error("No se encontraron archivos .xml en ~/Downloads. Pasa las rutas como argumentos.");
  }
  console.log(`   Encontrados: ${xmlFiles.join(", ")}`);
  return xmlFiles.map(f => path.join(downloads, f));
}

// ────────────────────────────────────────────────────────────────────────
// 2. Parser de WXR (regex-based, suficiente para este formato fijo)
// ────────────────────────────────────────────────────────────────────────

function unescapeCdata(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function extractTag(itemXml, tag) {
  const re = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i");
  const m = itemXml.match(re);
  return m ? unescapeCdata(m[1]) : "";
}

function extractPlainTag(itemXml, tag) {
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`, "i");
  const m = itemXml.match(re);
  return m ? m[1].trim() : "";
}

function extractAllPostmeta(itemXml) {
  const meta = {};
  const re = /<wp:postmeta>\s*<wp:meta_key><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>\s*<\/wp:postmeta>/g;
  let m;
  while ((m = re.exec(itemXml)) !== null) {
    const key = m[1].trim();
    const value = unescapeCdata(m[2]);
    meta[key] = value;
  }
  return meta;
}

function isPlaceholderJunk(value) {
  return !value || PLACEHOLDER_RE.test(value) || /^0+$/.test(value);
}

function parseWxrFile(xmlContent, sourceLabel) {
  const items = xmlContent.match(/<item>[\s\S]*?<\/item>/g) || [];
  const records = [];
  const skipped = [];

  for (const item of items) {
    const postType = extractTag(item, "wp:post_type");
    if (!VALID_POST_TYPES.has(postType)) continue;

    const status = extractTag(item, "wp:status");
    if (!VALID_STATUSES.has(status)) {
      skipped.push({ title: extractTag(item, "title"), reason: `estado: ${status}` });
      continue;
    }

    const meta = extractAllPostmeta(item);
    const title = extractTag(item, "title");
    const link = extractPlainTag(item, "link");
    const postId = extractPlainTag(item, "wp:post_id");
    const postDate = extractTag(item, "wp:post_date");

    // Nombre completo del ejemplar (preferimos el campo ya combinado)
    let name = meta["nombre-completo-ejemplar"] || title || "";
    if (isPlaceholderJunk(name)) name = title || "";

    const certificateId = !isPlaceholderJunk(meta["numero-de-registro-abci"])
      ? meta["numero-de-registro-abci"]
      : "";

    const dob = !isPlaceholderJunk(meta["fecha-de-nacimiento"]) ? meta["fecha-de-nacimiento"] : "";
    const gender = (meta["sexo"] || "").toUpperCase().startsWith("H") ? "female" : "male";
    const breed = !isPlaceholderJunk(meta["raza"]) ? meta["raza"] : "American Bully";
    const color = !isPlaceholderJunk(meta["color"]) ? meta["color"] : "";
    const microchip = !isPlaceholderJunk(meta["microchip"]) ? meta["microchip"] : "";
    const kennelName = !isPlaceholderJunk(meta["afijo-del-ejemplar"]) ? meta["afijo-del-ejemplar"] : "";
    const breederName = !isPlaceholderJunk(meta["criador"]) ? meta["criador"] : "";
    const ownerName = !isPlaceholderJunk(meta["propietario"]) ? meta["propietario"] : "";
    const country = !isPlaceholderJunk(meta["pais"]) ? meta["pais"] : "";
    const dni = !isPlaceholderJunk(meta["dni"]) ? meta["dni"] : "";
    const phone = !isPlaceholderJunk(meta["celular"]) ? meta["celular"] : "";
    const sireName = !isPlaceholderJunk(meta["nombre-del-padre"]) ? meta["nombre-del-padre"] : "";
    const damName = !isPlaceholderJunk(meta["nombre-de-la-madre"]) ? meta["nombre-de-la-madre"] : "";
    const sireCert = !isPlaceholderJunk(meta["numero-registro-abci-padre"]) ? meta["numero-registro-abci-padre"] : "";
    const damCert = !isPlaceholderJunk(meta["numero-registro-abci-madre"]) ? meta["numero-registro-abci-madre"] : "";
    const sireColor = !isPlaceholderJunk(meta["color-padre"]) ? meta["color-padre"] : "";
    const damColor = !isPlaceholderJunk(meta["color-madre"]) ? meta["color-madre"] : "";

    // Validación mínima: sin nombre o claramente basura de prueba → se omite
    if (!name || isPlaceholderJunk(name)) {
      skipped.push({ title: title || `post #${postId}`, reason: "sin nombre válido / datos de prueba" });
      continue;
    }

    records.push({
      sourcePostType: postType,
      sourceFile: sourceLabel,
      sourceUrl: link,
      postId,
      registeredDate: postDate,
      name: name.toUpperCase(),
      certificateId,
      breed,
      gender,
      color,
      dob,
      microchip,
      kennelName,
      breederName,
      ownerName,
      country,
      dni,
      phone,
      sireName,
      damName,
      sireCert,
      damCert,
      sireColor,
      damColor,
      // Generaciones extra de pedigree, si existen (no van al importador, quedan en el respaldo completo)
      grandparents: {
        abuelaMaternaNombre: meta["nombre-abuela-materna"] || "",
        abuelaMaternaColor: meta["color-abuela-materna"] || "",
        madreAbuelaMaterna: meta["madre-abuela-materna"] || "",
      },
    });
  }

  return { records, skipped, totalItemsInFile: items.length };
}

// ────────────────────────────────────────────────────────────────────────
// 3. Deduplicación entre archivos (BBDD antigua vs REGISTRO 2.0)
// ────────────────────────────────────────────────────────────────────────

function dedupe(allRecords) {
  // Prioriza registros del formato nuevo (abcidog) sobre el legacy cuando
  // comparten el mismo número de certificado — se asume que el nuevo es
  // la versión más reciente/corregida del mismo ejemplar.
  const byCert = new Map();
  const noCert = [];

  for (const r of allRecords) {
    if (!r.certificateId) {
      noCert.push(r);
      continue;
    }
    const existing = byCert.get(r.certificateId);
    if (!existing) {
      byCert.set(r.certificateId, r);
    } else if (existing.sourcePostType !== "abcidog" && r.sourcePostType === "abcidog") {
      byCert.set(r.certificateId, r); // el nuevo formato gana
    }
  }

  return [...byCert.values(), ...noCert];
}

// ────────────────────────────────────────────────────────────────────────
// 4. Exportación
// ────────────────────────────────────────────────────────────────────────

function buildImportReadyRows(records) {
  // Mismas columnas/encabezados que reconoce el auto-mapeo de /admin/import
  return records.map(r => ({
    "Nombre de registro": r.name,
    "Nombre de llamada": "",
    "Raza": r.breed,
    "Variante": "",
    "Sexo (male/female)": r.gender,
    "Color": r.color,
    "Fecha de nacimiento (YYYY-MM-DD)": r.dob,
    "Peso (kg)": "",
    "Altura (cm)": "",
    "Microchip": r.microchip,
    "Padre": r.sireName,
    "Madre": r.damName,
    "Criadero": r.kennelName,
    "Criador": r.breederName,
    "Ubicación": r.country,
    "Nro. de registro (opcional)": r.certificateId,
  }));
}

function buildFullBackupRows(records) {
  return records.map(r => ({
    "ID original (WP)": r.postId,
    "Tipo de origen": r.sourcePostType,
    "Archivo origen": r.sourceFile,
    "URL original": r.sourceUrl,
    "Fecha de creación en WP": r.registeredDate,
    "Nombre completo": r.name,
    "Nro. de registro ABCI": r.certificateId,
    "Raza": r.breed,
    "Sexo": r.gender,
    "Color": r.color,
    "Fecha de nacimiento": r.dob,
    "Microchip": r.microchip,
    "Criadero / Afijo": r.kennelName,
    "Criador": r.breederName,
    "Propietario": r.ownerName,
    "DNI propietario": r.dni,
    "Celular propietario": r.phone,
    "País": r.country,
    "Padre": r.sireName,
    "Nro. registro padre": r.sireCert,
    "Color padre": r.sireColor,
    "Madre": r.damName,
    "Nro. registro madre": r.damCert,
    "Color madre": r.damColor,
    "Abuela materna": r.grandparents.abuelaMaternaNombre,
    "Color abuela materna": r.grandparents.abuelaMaternaColor,
    "Madre de abuela materna": r.grandparents.madreAbuelaMaterna,
  }));
}

// ────────────────────────────────────────────────────────────────────────
// 5. Main
// ────────────────────────────────────────────────────────────────────────

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const files = await resolveInputFiles();
  console.log(`\n📂 Archivos a procesar:`);
  for (const f of files) console.log(`   · ${f}`);
  console.log("");

  let allRecords = [];
  let allSkipped = [];
  const fileStats = [];

  for (const filePath of files) {
    const label = path.basename(filePath);
    console.log(`📖 Leyendo ${label}…`);
    const xml = await fs.readFile(filePath, "utf8");
    const { records, skipped, totalItemsInFile } = parseWxrFile(xml, label);
    console.log(`   ✓ ${records.length} ejemplares válidos · ${skipped.length} omitidos · ${totalItemsInFile} items totales en el XML`);
    allRecords.push(...records);
    allSkipped.push(...skipped.map(s => ({ ...s, file: label })));
    fileStats.push({ file: label, valid: records.length, skipped: skipped.length, total: totalItemsInFile });
  }

  console.log(`\n🔍 Total combinado antes de deduplicar: ${allRecords.length}`);
  const deduped = dedupe(allRecords);
  const removedDupes = allRecords.length - deduped.length;
  console.log(`🔁 Duplicados resueltos (mismo Nro. ABCI en ambos archivos): ${removedDupes}`);
  console.log(`✅ Total final de ejemplares únicos: ${deduped.length}`);

  // Exportar: archivo listo para importar + respaldo completo + log
  const stamp = new Date().toISOString().slice(0, 10);

  const importRows = buildImportReadyRows(deduped);
  const wbImport = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbImport, XLSX.utils.json_to_sheet(importRows), "Ejemplares");
  const importPath = path.join(OUTPUT_DIR, `abci-import-listo-${stamp}.xlsx`);
  XLSX.writeFile(wbImport, importPath);

  const backupRows = buildFullBackupRows(deduped);
  const wbBackup = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbBackup, XLSX.utils.json_to_sheet(backupRows), "Respaldo completo");
  const backupPath = path.join(OUTPUT_DIR, `abci-respaldo-completo-${stamp}.xlsx`);
  XLSX.writeFile(wbBackup, backupPath);

  const jsonPath = path.join(OUTPUT_DIR, `abci-respaldo-completo-${stamp}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(deduped, null, 2), "utf8");

  if (allSkipped.length) {
    const skippedPath = path.join(OUTPUT_DIR, `omitidos-${stamp}.json`);
    await fs.writeFile(skippedPath, JSON.stringify(allSkipped, null, 2), "utf8");
  }

  console.log(`\n📊 Resumen por archivo:`);
  for (const s of fileStats) {
    console.log(`   ${s.file}: ${s.valid} válidos / ${s.skipped} omitidos / ${s.total} en total`);
  }

  console.log(`\n📁 Archivos generados en scripts/wp-export/:`);
  console.log(`   · ${path.basename(importPath)}   ← SUBE ESTE al panel /admin/import`);
  console.log(`   · ${path.basename(backupPath)}   (todos los campos, incluye pedigree extendido)`);
  console.log(`   · ${path.basename(jsonPath)}   (respaldo crudo en JSON)`);
  if (allSkipped.length) {
    console.log(`   · omitidos-${stamp}.json   (${allSkipped.length} registros que no se pudieron usar)`);
  }
  console.log(`\n✅ Listo. ${deduped.length} ejemplares preparados para importar.\n`);
}

main().catch(err => {
  console.error("\n💥 Error fatal:", err);
  process.exit(1);
});
