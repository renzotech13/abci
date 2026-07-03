/**
 * Importa los 9,655 ejemplares reales del respaldo WXR a Postgres (tabla dogs),
 * adjuntando photo_url desde el resultado de migrate-images-to-supabase.mjs,
 * y separando dni/phone hacia dog_legacy_contacts (tabla restringida a admins).
 *
 * Idempotente: la clave de upsert es certificate_id (único), así que
 * volver a correr el script completo no duplica nada.
 *
 * Uso: node scripts/import-dogs-to-supabase.mjs
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

const SRC_PATH = path.join(__dirname, "wp-export/abci-respaldo-completo-2026-06-28.json");
const PHOTO_MAP_PATH = path.join(__dirname, "wp-export/photo-migration-result.json");
const LOG_PATH = path.join(__dirname, "wp-export/import-log.json");
const BATCH_SIZE = 500;

const rawDogs = JSON.parse(fs.readFileSync(SRC_PATH, "utf8"));
const photoMap = fs.existsSync(PHOTO_MAP_PATH)
  ? JSON.parse(fs.readFileSync(PHOTO_MAP_PATH, "utf8"))
  : {};

const legacySeen = new Set();
const contactsToInsert = []; // { certificate_id, dni, phone }

const COUNTRY_ALIASES = {
  PERU: "Perú",
  ECUADOR: "Ecuador", CHILE: "Chile", URUGUAY: "Uruguay",
  ARGENTINA: "Argentina", BOLIVIA: "Bolivia", COLOMBIA: "Colombia",
};

function normalizeCountry(raw) {
  const v = raw.trim();
  if (!v || v.startsWith("#")) return null;
  const key = v.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return COUNTRY_ALIASES[key] || (v[0].toUpperCase() + v.slice(1).toLowerCase());
}

function toRow(d) {
  let certId = d.certificateId && String(d.certificateId).trim();
  if (!certId) {
    certId = `LEGACY-${d.postId}`;
    if (legacySeen.has(certId)) return null;
    legacySeen.add(certId);
  }

  if (d.dni || d.phone) {
    contactsToInsert.push({ certificate_id: certId, dni: d.dni || null, phone: d.phone || null });
  }

  return {
    certificate_id: certId,
    name: d.name || "Sin nombre",
    breed: d.breed || "American Bully",
    gender: (d.gender || "male").toLowerCase() === "female" ? "female" : "male",
    color: d.color || null,
    dob: d.dob || null,
    microchip: d.microchip || null,
    registration_date: d.registeredDate || new Date().toISOString(),
    sire_name: d.sireName || null,
    dam_name: d.damName || null,
    sire_cert: d.sireCert || null,
    dam_cert: d.damCert || null,
    sire_color: d.sireColor || null,
    dam_color: d.damColor || null,
    kennel_name: d.kennelName || null,
    breeder_name: d.breederName || null,
    owner_name: d.ownerName || null,
    location: d.country ? normalizeCountry(d.country) : null,
    grandparents: d.grandparents && Object.keys(d.grandparents).length ? d.grandparents : null,
    photo_url: photoMap[d.certificateId] || null,
    owner_id: null,
    source: "legacy_import",
  };
}

const rows = rawDogs.map(toRow).filter(Boolean);

console.log(`Importando ${rows.length} ejemplares en lotes de ${BATCH_SIZE}...`);

let inserted = 0;
const errors = [];

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const { error } = await supabase.from("dogs").upsert(batch, { onConflict: "certificate_id" });
  if (error) {
    errors.push({ batchStart: i, error: error.message });
    console.error(`  ✗ lote ${i}-${i + batch.length}: ${error.message}`);
  } else {
    inserted += batch.length;
    console.log(`  ✓ lote ${i}-${i + batch.length} (${inserted}/${rows.length})`);
  }
}

console.log(`\nEjemplares: ${inserted} procesados, ${errors.length} lotes con error.`);

// Contactos legacy: resolver certificate_id -> dogs.id ya insertado
if (contactsToInsert.length > 0) {
  console.log(`\nInsertando ${contactsToInsert.length} contactos legacy (dni/phone)...`);
  let contactsInserted = 0;
  for (let i = 0; i < contactsToInsert.length; i += BATCH_SIZE) {
    const batch = contactsToInsert.slice(i, i + BATCH_SIZE);
    const certIds = batch.map(c => c.certificate_id);
    const { data: dogs, error: fetchErr } = await supabase
      .from("dogs").select("id, certificate_id").in("certificate_id", certIds);
    if (fetchErr) {
      errors.push({ contactsBatchStart: i, error: fetchErr.message });
      continue;
    }
    const idByCert = new Map(dogs.map(d => [d.certificate_id, d.id]));
    const contactRows = batch
      .map(c => idByCert.has(c.certificate_id) ? { dog_id: idByCert.get(c.certificate_id), dni: c.dni, phone: c.phone } : null)
      .filter(Boolean);
    if (contactRows.length === 0) continue;
    const { error: insErr } = await supabase.from("dog_legacy_contacts").upsert(contactRows, { onConflict: "dog_id" });
    if (insErr) errors.push({ contactsBatchStart: i, error: insErr.message });
    else contactsInserted += contactRows.length;
  }
  console.log(`Contactos legacy: ${contactsInserted} insertados.`);
}

fs.writeFileSync(LOG_PATH, JSON.stringify({ total: rows.length, inserted, errors, contactsTotal: contactsToInsert.length }, null, 2));
console.log(`\nLog: ${LOG_PATH}`);
if (errors.length > 0) process.exit(1);
