/**
 * Crea las 3 cuentas demo/admin reales en Supabase Auth (requiere SUPABASE_SECRET_KEY
 * — auth.admin.createUser() hashea la contraseña vía GoTrue, no es un INSERT SQL directo).
 * El trigger handle_new_user() crea la fila en profiles automáticamente; acá solo
 * completamos los campos que el trigger no puede inferir (kennelName, bio, etc.).
 *
 * Uso: node scripts/seed-demo-accounts.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carga simple de .env.local sin dependencias externas
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

const accounts = [
  {
    email: "admin@abciregistro.app", password: "admin1234",
    name: "Dr. Marcos Velarde",
    profile: {
      kennel_name: "ABCI World Wide — Oficina Central", country: "Perú", phone: "+51 987 000 100",
      bio: "Registrador General — ABCI World Wide. Administrador del sistema.",
    },
  },
  {
    email: "demo@abciregistro.app", password: "demo1234",
    name: "Anthony Huamán",
    profile: {
      kennel_name: "Figthing Bulls Kennel", affix: "FIGHTING BULL", country: "Perú", phone: "+51 987 555 019",
      bio: "Criadero peruano especializado en American Bully Pocket. Camada Mili/Mely/Moli/Malu nacida en mayo 2024.",
    },
  },
  {
    email: "ruby@bullycamp.app", password: "demo1234",
    name: "Rosa Castillo",
    profile: {
      kennel_name: "BullyCamp Kennel", affix: "BULLYCAMP", country: "México",
      bio: "Criadero internacional con bloodlines XL y Extreme. Campeones ABCI 2024.",
    },
  },
];

for (const acc of accounts) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: acc.email,
    password: acc.password,
    email_confirm: true,
    user_metadata: { name: acc.name },
  });

  if (error) {
    if (error.message?.toLowerCase().includes("already been registered") || error.code === "email_exists") {
      console.log(`↷ ${acc.email} ya existe, actualizando perfil...`);
      const { data: existing } = await supabase.auth.admin.listUsers();
      const found = existing.users.find(u => u.email === acc.email);
      if (found) {
        const { error: updErr } = await supabase.from("profiles").update(acc.profile).eq("id", found.id);
        if (updErr) console.error(`  error actualizando perfil de ${acc.email}:`, updErr.message);
        else console.log(`  ✓ perfil actualizado`);
      }
      continue;
    }
    console.error(`✗ Error creando ${acc.email}:`, error.message);
    continue;
  }

  const { error: updErr } = await supabase.from("profiles").update(acc.profile).eq("id", data.user.id);
  if (updErr) console.error(`  error completando perfil de ${acc.email}:`, updErr.message);
  else console.log(`✓ ${acc.email} creado (id: ${data.user.id})`);
}

console.log("\nListo.");
