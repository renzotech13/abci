/**
 * map-images-to-dogs.mjs
 *
 * Lee el WXR export completo de WordPress (abciworldwide.WordPress.2026-06-28.xml)
 * y construye un mapeo: certificateId → URL de imagen
 *
 * Estrategia:
 *  1. Parsea todos los <item> tipo "attachment" → { postId → filePath }
 *  2. Parsea todos los <item> tipo "abcidog" y "registro-de-ejemplar":
 *       - Extrae certificateId (numero-de-registro-abci)
 *       - Extrae _thumbnail_id (ID del attachment asociado)
 *       - Extrae foto-del-ejemplar u otros metas de foto directa
 *  3. Cruza: certificateId → attachmentId → filePath
 *  4. Escribe:
 *       - abci-foto-map.json     → { [certificateId]: "https://abciregistro.com/wp-content/uploads/..." }
 *       - abci-import-con-fotos.xlsx  → versión actualizada del import con columna "foto"
 *
 * Uso:
 *   node scripts/map-images-to-dogs.mjs
 *
 * Requiere: ~/Downloads/abciworldwide.WordPress.2026-06-28.xml
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WP_UPLOADS_BASE = "https://abciregistro.com/wp-content/uploads/";

// También soportamos XMLs individuales como fallback
const XML_PATHS = [
  path.join(process.env.HOME, "Downloads/abciworldwide.WordPress.2026-06-28.xml"),
  path.join(__dirname, "wp-export/REGISTRO 2.0.xml"),
  path.join(__dirname, "wp-export/BBDD ANTIGUA.xml"),
  path.join(process.env.HOME, "Downloads/REGISTRO 2.0.xml"),
  path.join(process.env.HOME, "Downloads/BBDD ANTIGUA.xml"),
];

const OUTPUT_DIR = path.join(__dirname, "wp-export");

// ─── Helpers ───────────────────────────────────────────────────────────────

function cdata(s) {
  const m = s?.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1].trim() : (s || "").trim();
}

function extractPostMeta(itemXml) {
  const meta = {};
  const re = /<wp:postmeta>\s*<wp:meta_key><!\[CDATA\[([^\]]+)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>\s*<\/wp:postmeta>/g;
  let m;
  while ((m = re.exec(itemXml)) !== null) {
    meta[m[1]] = m[2].trim();
  }
  // También busca meta sin CDATA
  const re2 = /<wp:postmeta>\s*<wp:meta_key>([^<]+)<\/wp:meta_key>\s*<wp:meta_value>([^<]*)<\/wp:meta_value>\s*<\/wp:postmeta>/g;
  while ((m = re2.exec(itemXml)) !== null) {
    if (!meta[m[1]]) meta[m[1]] = m[2].trim();
  }
  return meta;
}

function getField(itemXml, tag) {
  const m = itemXml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (m) return m[1].trim();
  const m2 = itemXml.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`));
  return m2 ? m2[1].trim() : "";
}

// ─── Parse ─────────────────────────────────────────────────────────────────

function parseXml(xml) {
  const attachments = new Map(); // attachmentPostId → { filePath, url }
  const dogs = [];              // { postId, certificateId, thumbnailId, directPhoto }

  // Dividir en items — el XML puede ser grande, procesamos chunk por chunk
  console.log("  Dividiendo en items...");

  // Split por </item> para procesar de a uno
  let cursor = 0;
  let count = 0;
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRe.exec(xml)) !== null) {
    const item = match[1];
    count++;
    if (count % 1000 === 0) process.stdout.write(`  Procesado ${count} items...\r`);

    const postType = cdata(item.match(/<wp:post_type>([\s\S]*?)<\/wp:post_type>/)?.[0]?.replace(/<[^>]+>/g, "") || "");
    // Extraer post_type via CDATA
    const ptMatch = item.match(/<wp:post_type><!\[CDATA\[([^\]]+)\]\]><\/wp:post_type>/);
    const pt = ptMatch ? ptMatch[1] : (item.match(/<wp:post_type>([^<]+)<\/wp:post_type>/)?.[1] || "");

    const postIdMatch = item.match(/<wp:post_id>(\d+)<\/wp:post_id>/);
    const postId = postIdMatch ? postIdMatch[1] : "";

    if (pt === "attachment") {
      // Extraer la URL del attachment directamente del guid o del meta _wp_attached_file
      const guid = item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] || "";
      const meta = extractPostMeta(item);
      const attachedFile = meta["_wp_attached_file"] || "";

      // La URL canónica del attachment
      let fileUrl = "";
      if (attachedFile) {
        fileUrl = WP_UPLOADS_BASE + attachedFile;
      } else if (guid.includes("wp-content/uploads")) {
        fileUrl = guid;
      }

      if (postId && fileUrl) {
        attachments.set(postId, {
          filePath: attachedFile,
          url: fileUrl,
        });
      }
    } else if (pt === "abcidog" || pt === "registro-de-ejemplar") {
      const meta = extractPostMeta(item);
      const certId =
        meta["numero-de-registro-abci"] ||
        meta["numero-registro-abci"] ||
        meta["numero_de_registro_abci"] ||
        "";
      const thumbnailId = meta["_thumbnail_id"] || "";

      // Algunos campos de foto directa (JetEngine puede guardar la URL directamente)
      const directPhoto =
        meta["foto-del-ejemplar"] ||
        meta["foto_del_ejemplar"] ||
        meta["foto-ejemplar"] ||
        meta["imagen-del-ejemplar"] ||
        meta["image"] ||
        meta["foto"] ||
        "";

      if (postId) {
        dogs.push({ postId, certId, thumbnailId, directPhoto });
      }
    }
  }

  console.log(`\n  Total items procesados: ${count}`);
  console.log(`  Attachments encontrados: ${attachments.size}`);
  console.log(`  Perros encontrados: ${dogs.length}`);

  return { attachments, dogs };
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Cargar XMLs disponibles
  const xmlFiles = XML_PATHS.filter(p => fs.existsSync(p));
  if (xmlFiles.length === 0) {
    console.error("❌ No se encontraron archivos XML. Asegúrate de que estén en ~/Downloads/");
    process.exit(1);
  }

  console.log(`📂 XMLs a procesar: ${xmlFiles.length}`);
  xmlFiles.forEach(f => console.log(`   · ${path.basename(f)}`));

  const allAttachments = new Map();
  const allDogs = [];

  for (const xmlPath of xmlFiles) {
    console.log(`\n🔍 Procesando ${path.basename(xmlPath)}...`);
    const xml = fs.readFileSync(xmlPath, "utf8");
    console.log(`   Tamaño: ${(xml.length / 1024 / 1024).toFixed(1)} MB`);
    const { attachments, dogs } = parseXml(xml);
    for (const [k, v] of attachments) allAttachments.set(k, v);
    allDogs.push(...dogs);
  }

  console.log(`\n📊 Totales combinados:`);
  console.log(`   Attachments: ${allAttachments.size}`);
  console.log(`   Perros: ${allDogs.length}`);

  // ── Construir mapeo certificateId → imageUrl ────────────────────────────

  const photoMap = {}; // certificateId → url
  let matched = 0;
  let directMatch = 0;
  let thumbMatch = 0;
  let noMatch = 0;

  for (const dog of allDogs) {
    if (!dog.certId) { noMatch++; continue; }

    // 1. Foto directa en el postmeta del ejemplar
    if (dog.directPhoto && dog.directPhoto.startsWith("http")) {
      photoMap[dog.certId] = dog.directPhoto;
      directMatch++;
      matched++;
      continue;
    }

    // 2. Via _thumbnail_id
    if (dog.thumbnailId && allAttachments.has(dog.thumbnailId)) {
      photoMap[dog.certId] = allAttachments.get(dog.thumbnailId).url;
      thumbMatch++;
      matched++;
      continue;
    }

    noMatch++;
  }

  console.log(`\n✅ Resultados del mapeo:`);
  console.log(`   Con foto (total):   ${matched}`);
  console.log(`   · Foto directa:     ${directMatch}`);
  console.log(`   · Via thumbnail_id: ${thumbMatch}`);
  console.log(`   Sin foto:           ${noMatch}`);
  console.log(`   Cobertura:          ${((matched / allDogs.filter(d => d.certId).length) * 100).toFixed(1)}%`);

  // ── Guardar mapeo ───────────────────────────────────────────────────────
  const mapOut = path.join(OUTPUT_DIR, "abci-foto-map.json");
  fs.writeFileSync(mapOut, JSON.stringify(photoMap, null, 2));
  console.log(`\n💾 Mapeo guardado: ${mapOut}`);

  // ── Generar Excel actualizado con fotos ─────────────────────────────────
  try {
    const { default: XLSX } = await import("xlsx");
    const backupJson = path.join(OUTPUT_DIR, "abci-respaldo-completo-2026-06-28.json");
    if (fs.existsSync(backupJson)) {
      const dogs = JSON.parse(fs.readFileSync(backupJson, "utf8"));
      let updated = 0;
      const rows = dogs.map(d => {
        const foto = photoMap[d.certificateId] || "";
        if (foto) updated++;
        return {
          "Nombre completo del ejemplar": d.name,
          "Numero de registro ABCI": d.certificateId,
          "Fecha de nacimiento": d.dob,
          "Sexo (male/female)": d.gender,
          "Raza": d.breed,
          "Color": d.color,
          "Microchip": d.microchip || "",
          "Criadero": d.kennelName || "",
          "Criador": d.breederName || "",
          "Nombre del padre": d.sireName || "",
          "Nombre de la madre": d.damName || "",
          "Nro. registro padre": d.sireCert || "",
          "Nro. registro madre": d.damCert || "",
          "País": d.country || "",
          "Foto URL": foto,
        };
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ejemplares");
      const xlsxOut = path.join(OUTPUT_DIR, `abci-import-con-fotos-${new Date().toISOString().slice(0,10)}.xlsx`);
      XLSX.writeFile(wb, xlsxOut);
      console.log(`📊 Excel con fotos guardado: ${xlsxOut} (${updated} ejemplares con foto)`);
    }
  } catch (e) {
    console.log("⚠️  No se pudo generar Excel (xlsx no disponible):", e.message);
  }

  // ── Muestra de resultados ───────────────────────────────────────────────
  const sample = Object.entries(photoMap).slice(0, 10);
  console.log("\n📷 Muestra de mapeo (primeros 10):");
  for (const [cert, url] of sample) {
    console.log(`   ${cert} → ${url.split("/").slice(-1)[0]}`);
  }
}

main().catch(e => { console.error("Error:", e); process.exit(1); });
