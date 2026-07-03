"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/adminLog";
import type { TablesInsert } from "@/lib/supabase/database.types";
import { Card, Button, Badge, LinkButton, Label, Select } from "@/components/ui";
import {
  Upload, FileSpreadsheet, Trash2, ArrowRight, CheckCircle2, RefreshCw,
  AlertTriangle, Download, Eye, ArrowLeft, FileWarning,
} from "lucide-react";

type SheetRow = Record<string, string | number | undefined>;

type MappedDog = {
  name?: string; callName?: string; breed?: string; variant?: string;
  gender?: "male" | "female"; color?: string; dob?: string; weight?: number; height?: number;
  microchip?: string; sireName?: string; damName?: string; kennelName?: string;
  breederName?: string; location?: string; certificateId?: string; photo?: string;
};

const FIELDS: { key: keyof MappedDog; label: string; required?: boolean; example: string }[] = [
  { key: "name", label: "Nombre de registro", required: true, example: "FIGHTING BULL MILI" },
  { key: "callName", label: "Nombre de llamada", example: "Mili" },
  { key: "breed", label: "Raza", example: "American Bully" },
  { key: "variant", label: "Variante", example: "Pocket" },
  { key: "gender", label: "Sexo (male/female)", required: true, example: "female" },
  { key: "color", label: "Color", example: "Azul" },
  { key: "dob", label: "Fecha de nacimiento (YYYY-MM-DD)", required: true, example: "2024-05-12" },
  { key: "weight", label: "Peso (kg)", example: "18" },
  { key: "height", label: "Altura (cm)", example: "35" },
  { key: "microchip", label: "Microchip", example: "900233005206193" },
  { key: "sireName", label: "Padre", example: "FIGHTING BULL KHABIT" },
  { key: "damName", label: "Madre", example: "FIGHTING BULL CARACHAMA" },
  { key: "kennelName", label: "Criadero", example: "Fighting Bulls Kennel" },
  { key: "breederName", label: "Criador", example: "Anthony Huamán" },
  { key: "location", label: "Ubicación", example: "Lima, Perú" },
  { key: "certificateId", label: "Nro. de registro (opcional)", example: "29601" },
  { key: "photo", label: "Foto URL", example: "https://ejemplo.com/foto.jpg" },
];

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/[áàä]/g, "a").replace(/[éèë]/g, "e").replace(/[íìï]/g, "i").replace(/[óòö]/g, "o").replace(/[úùü]/g, "u").replace(/[ñ]/g, "n");
}

function autoMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  const norms = headers.map(h => ({ raw: h, norm: normalizeKey(h) }));
  const guesses: Record<keyof MappedDog, string[]> = {
    name: ["nombre de registro", "nombre completo", "nombre del ejemplar", "nombre", "name"],
    callName: ["nombre de llamada", "call name", "llamada", "apodo"],
    breed: ["raza", "breed"],
    variant: ["variante", "variant", "tipo"],
    gender: ["sexo", "gender", "genero", "género"],
    color: ["color", "colour"],
    dob: ["fecha de nacimiento", "fecha nacimiento", "nacimiento", "dob", "birth date", "fecha"],
    weight: ["peso", "weight"],
    height: ["altura", "alto", "height"],
    microchip: ["microchip", "chip", "microchipid"],
    sireName: ["nombre del padre", "padre", "sire name", "sire"],
    damName: ["nombre de la madre", "madre", "dam name", "dam"],
    kennelName: ["criadero", "kennel name", "kennel", "afijo"],
    breederName: ["criador", "breeder name", "breeder"],
    location: ["ubicacion", "ubicación", "location", "lugar", "ciudad"],
    certificateId: ["nro. de registro", "nro de registro", "numero de registro", "número de registro", "n° de registro", "id de registro", "registro id", "certificate id", "certificate", "certificado", "registro abci"],
    photo: ["foto url", "foto", "photo", "imagen", "image", "foto del ejemplar", "url foto", "url imagen", "photo url"],
  };

  for (const f of FIELDS) {
    const candidates = guesses[f.key] || [];
    let match = norms.find(h => candidates.some(c => h.norm === c));
    if (!match) match = norms.find(h => candidates.some(c => h.norm.startsWith(c)));
    if (!match) match = norms.find(h => candidates.some(c => h.norm.includes(c)));
    if (match) map[f.key] = match.raw;
  }
  return map;
}

export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ added: number; updated: number; skipped: number; errors: string[] } | null>(null);

  async function handleFile(file: File) {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const json: SheetRow[] = XLSX.utils.sheet_to_json<SheetRow>(sheet, { raw: false, defval: "" });
    if (json.length === 0) {
      alert("El archivo no contiene datos");
      return;
    }
    const hs = Object.keys(json[0]);
    setHeaders(hs);
    setRows(json);
    setMapping(autoMap(hs));
    setFileName(file.name);
    setStep("preview");
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function reset() {
    setFileName(""); setHeaders([]); setRows([]); setMapping({});
    setStep("upload"); setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([
      FIELDS.reduce((acc, f) => ({ ...acc, [f.label]: f.example }), {}),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ejemplares");
    XLSX.writeFile(wb, "plantilla-abci-ejemplares.xlsx");
  }

  async function performImport() {
    setImporting(true);
    const supabase = createClient();

    const mapped: MappedDog[] = rows.map(row => {
      const obj: MappedDog = {};
      for (const f of FIELDS) {
        const sourceCol = mapping[f.key];
        if (!sourceCol) continue;
        const v = row[sourceCol];
        if (v === undefined || v === "") continue;
        if (f.key === "weight" || f.key === "height") {
          (obj as Record<string, unknown>)[f.key] = Number(v);
        } else if (f.key === "gender") {
          const g = String(v).toLowerCase();
          obj.gender = (g.startsWith("h") || g === "female" || g === "f") ? "female" : "male";
        } else {
          (obj as Record<string, unknown>)[f.key] = String(v);
        }
        if (f.key === "photo" && obj.photo && !String(obj.photo).startsWith("http")) {
          delete obj.photo;
        }
      }
      return obj;
    });

    let skipped = 0;
    const errors: string[] = [];
    const valid: MappedDog[] = [];
    for (const row of mapped) {
      if (!row.name) { skipped++; errors.push("Fila sin nombre"); continue; }
      if (!row.dob) { skipped++; errors.push(`${row.name}: falta fecha de nacimiento`); continue; }
      valid.push(row);
    }

    const finalRows: TablesInsert<"dogs">[] = [];
    for (const row of valid) {
      let certId = row.certificateId;
      if (!certId) {
        const { data } = await supabase.rpc("generate_certificate_id");
        certId = data as string;
      }
      finalRows.push({
        certificate_id: certId,
        owner_id: null,
        name: row.name!.toUpperCase(),
        call_name: row.callName || null,
        breed: row.breed || "American Bully",
        variant: row.variant || null,
        gender: row.gender || "male",
        color: row.color || null,
        weight: row.weight ?? null,
        height: row.height ?? null,
        dob: row.dob || null,
        microchip: row.microchip || null,
        sire_name: row.sireName || null,
        dam_name: row.damName || null,
        kennel_name: row.kennelName || null,
        breeder_name: row.breederName || null,
        location: row.location || null,
        photo_url: row.photo || null,
        source: "app",
      });
    }

    const certIds = finalRows.map(r => r.certificate_id);
    const existingSet = new Set<string>();
    for (let i = 0; i < certIds.length; i += 500) {
      const { data: existing } = await supabase.from("dogs").select("certificate_id").in("certificate_id", certIds.slice(i, i + 500));
      (existing ?? []).forEach(d => existingSet.add(d.certificate_id));
    }

    let hardErrors = 0;
    for (let i = 0; i < finalRows.length; i += 500) {
      const batch = finalRows.slice(i, i + 500);
      const { error } = await supabase.from("dogs").upsert(batch, { onConflict: "certificate_id" });
      if (error) { hardErrors += batch.length; errors.push(`Lote ${i}-${i + batch.length}: ${error.message}`); }
    }

    const added = finalRows.filter(r => !existingSet.has(r.certificate_id)).length;
    const updated = finalRows.length - added - hardErrors;

    await logAdminAction(supabase, "Importación masiva de ejemplares", undefined, `${added} agregados · ${updated} actualizados · ${skipped} omitidos`);

    setResult({ added, updated, skipped, errors });
    setStep("done");
    setImporting(false);
  }

  const previewRows = rows.slice(0, 8);
  const missingRequired = FIELDS.filter(f => f.required && !mapping[f.key]);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
          <Upload className="w-7 h-7 text-amber-500" /> Importar ejemplares desde Excel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Carga masiva de ejemplares al registro ABCI. Soporta .xlsx, .xls y .csv.</p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8 max-w-md">
        {(["upload", "preview", "done"] as const).map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${
              step === s ? "bg-amber-500"
              : (["upload", "preview", "done"] as const).indexOf(step) > i ? "bg-amber-500/40"
              : "bg-muted"
            }`} />
            <p className={`text-[10px] uppercase tracking-widest mt-1.5 font-semibold ${step === s ? "text-amber-500" : "text-muted-foreground"}`}>
              {s === "upload" ? "1 · Subir" : s === "preview" ? "2 · Mapear" : "3 · Resultado"}
            </p>
          </div>
        ))}
      </div>

      {step === "upload" && (
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <Card>
            <label
              htmlFor="excel-upload"
              className="block border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-amber-500/60 hover:bg-amber-500/5 transition"
            >
              <FileSpreadsheet className="w-14 h-14 mx-auto text-amber-500 mb-3" strokeWidth={1.5} />
              <p className="font-semibold text-lg">Arrastra tu archivo o haz clic para subir</p>
              <p className="text-sm text-muted-foreground mt-1">Excel (.xlsx, .xls) o CSV — hasta 5,000 filas</p>
              <input id="excel-upload" ref={inputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={onFileSelected} />
            </label>

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {[
                { Icon: CheckCircle2, t: "Detección automática", d: "Las columnas se mapean solas" },
                { Icon: Eye, t: "Vista previa", d: "Revisa antes de importar" },
                { Icon: AlertTriangle, t: "Validación", d: "Detecta filas inválidas" },
              ].map(b => (
                <div key={b.t} className="p-3 rounded-xl border border-border text-center">
                  <b.Icon className="w-5 h-5 mx-auto text-amber-500" />
                  <p className="text-xs font-semibold mt-2">{b.t}</p>
                  <p className="text-[10px] text-muted-foreground">{b.d}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="bg-amber-500/5 border-amber-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold">Plantilla de Excel</h3>
              </div>
              <p className="text-sm text-muted-foreground">Descarga la plantilla con las columnas correctas para asegurar una importación exitosa.</p>
              <Button onClick={downloadTemplate} variant="accent" size="sm" className="mt-4 w-full">
                <Download className="w-4 h-4" /> Descargar plantilla
              </Button>
            </Card>

            <Card>
              <h3 className="font-semibold mb-3">Columnas reconocidas</h3>
              <ul className="space-y-1 text-xs">
                {FIELDS.map(f => (
                  <li key={f.key} className="flex items-center gap-2">
                    {f.required ? <span className="text-rose-500">●</span> : <span className="text-muted-foreground">○</span>}
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-muted-foreground mt-3 italic">● = obligatorio · ○ = opcional</p>
            </Card>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Archivo cargado</p>
                <p className="font-semibold inline-flex items-center gap-2 mt-0.5">
                  <FileSpreadsheet className="w-4 h-4 text-amber-500" /> {fileName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{rows.length} filas detectadas · {headers.length} columnas</p>
              </div>
              <Button variant="outline" size="sm" onClick={reset}><Trash2 className="w-3.5 h-3.5" /> Quitar archivo</Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-1">Mapeo de columnas</h3>
            <p className="text-sm text-muted-foreground mb-5">Asigna cada campo del registro ABCI con la columna correspondiente de tu archivo. Las marcadas en rojo son obligatorias.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <Label className="flex items-center gap-1.5">
                    {f.label}
                    {f.required && <span className="text-rose-500 text-xs">obligatorio</span>}
                  </Label>
                  <Select value={mapping[f.key] || ""} onChange={e => setMapping({ ...mapping, [f.key]: e.target.value })}>
                    <option value="">— No mapear —</option>
                    {headers.map(h => <option key={h}>{h}</option>)}
                  </Select>
                </div>
              ))}
            </div>
            {missingRequired.length > 0 && (
              <div className="mt-5 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-2">
                <FileWarning className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Faltan campos obligatorios</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Mapea: {missingRequired.map(f => f.label).join(", ")}</p>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold mb-3 inline-flex items-center gap-2"><Eye className="w-4 h-4" /> Vista previa (primeras 8 filas)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    {headers.map(h => (
                      <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      {headers.map(h => (
                        <td key={h} className="px-3 py-2 whitespace-nowrap">{String(r[h] ?? "—")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button variant="outline" onClick={reset}><ArrowLeft className="w-4 h-4" /> Cancelar</Button>
            <Button variant="accent" size="lg" onClick={performImport} disabled={missingRequired.length > 0 || importing}>
              {importing ? "Importando…" : <>Importar {rows.length} ejemplares <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </div>
        </div>
      )}

      {step === "done" && result && (
        <Card className="max-w-2xl mx-auto text-center py-10">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500/15 items-center justify-center mb-4">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold">¡Importación completada!</h2>
          <p className="text-sm text-muted-foreground mt-1">{fileName}</p>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-3xl font-bold text-emerald-500">{result.added}</p>
              <p className="text-xs text-muted-foreground mt-1">Nuevos agregados</p>
            </div>
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <p className="text-3xl font-bold text-amber-500">{result.updated}</p>
              <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1 justify-center"><RefreshCw className="w-3 h-3" /> Reemplazados</p>
            </div>
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
              <p className="text-3xl font-bold text-rose-500">{result.skipped}</p>
              <p className="text-xs text-muted-foreground mt-1">Filas omitidas</p>
            </div>
          </div>
          {result.updated > 0 && (
            <p className="mt-3 text-xs text-muted-foreground max-w-md mx-auto">
              Los {result.updated} ejemplares reemplazados ya existían con el mismo número de certificado
              (por ejemplo, de una importación anterior) — sus datos se actualizaron con los del archivo nuevo.
            </p>
          )}

          {result.errors.length > 0 && (
            <div className="mt-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-left">
              <Badge variant="warning" className="mb-2">Detalles de errores</Badge>
              <ul className="text-xs text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                {result.errors.slice(0, 10).map((e, i) => <li key={i}>· {e}</li>)}
                {result.errors.length > 10 && <li>… y {result.errors.length - 10} más</li>}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={reset}>Importar otro archivo</Button>
            <LinkButton href="/admin/dogs" variant="accent">Ver ejemplares</LinkButton>
          </div>
        </Card>
      )}
    </AdminLayout>
  );
}
