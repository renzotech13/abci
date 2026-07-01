"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, Badge, LinkButton, Button } from "@/components/ui";
import {
  Globe, Terminal, FileSpreadsheet, ArrowRight, CheckCircle2,
  Copy, AlertCircle, FileCode, Database, Zap, ShieldCheck,
  FileDown, Wand2, FolderOpen, Lock,
} from "lucide-react";

function CodeBlock({ children, copyable = true }: { children: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="relative group">
      <pre className="font-mono text-xs bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-lg overflow-x-auto whitespace-pre">
        <code>{children}</code>
      </pre>
      {copyable && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 h-7 rounded-md bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 text-[10px] font-medium transition"
        >
          {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      )}
    </div>
  );
}

export default function MigratePage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <Badge variant="success" className="mb-3"><CheckCircle2 className="w-3 h-3" /> Acceso al wp-admin confirmado</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
          <Database className="w-7 h-7 text-amber-500" /> Importar desde el sitio actual
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Con acceso al wp-admin, el exportador nativo de WordPress es la vía más rápida y completa
          para migrar los <strong>9,989 ejemplares</strong> registrados entre los dos tipos de contenido
          (<code className="text-amber-500">abcidog</code> y <code className="text-amber-500">registro-de-ejemplar</code>).
        </p>
      </div>

      {/* Resultado última corrida */}
      <Card className="mb-6 border-emerald-500/40 bg-emerald-500/5">
        <h2 className="font-bold inline-flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Resultado de la última extracción
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "REGISTRO 2.0 (abcidog)", value: "5,202" },
            { label: "BBDD antigua (legacy)", value: "4,787" },
            { label: "Duplicados resueltos", value: "334" },
            { label: "Únicos listos para importar", value: "9,655" },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl border border-border bg-background">
              <p className="text-2xl font-bold text-amber-500">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Calidad de los datos: 9,636 con número de certificado original · 9,514 con microchip ·
          9,639 con al menos un padre/madre vinculado · solo 16 sin fecha de nacimiento.
        </p>
      </Card>

      {/* Paso 1 */}
      <Card className="mb-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">1</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg inline-flex items-center gap-2"><FileDown className="w-5 h-5 text-amber-500" /> Exportar desde wp-admin</h3>
            <p className="text-sm text-muted-foreground mt-1">
              En el sitio WordPress actual, repite esto por cada tipo de contenido con ejemplares
              (<strong>REGISTRO 2.0</strong> = <code className="text-amber-500">abcidog</code> y
              <strong> Prueba de BBDD antigua</strong> = <code className="text-amber-500">registro-de-ejemplar</code>):
            </p>
            <ol className="mt-3 space-y-1.5 text-sm text-muted-foreground list-decimal pl-5">
              <li>Ve a <strong>Herramientas → Exportar</strong></li>
              <li>Selecciona <strong>&quot;Tipo de contenido personalizado&quot;</strong> y elige el tipo</li>
              <li>Clic en <strong>Descargar archivo de exportación</strong> → se descarga un <code className="text-amber-500">.xml</code></li>
            </ol>
            <p className="text-sm text-muted-foreground mt-3">
              Vas a terminar con dos archivos <code className="text-amber-500">.xml</code> (normalmente en tu carpeta de Descargas).
            </p>
          </div>
        </div>
      </Card>

      {/* Paso 2 */}
      <Card className="mb-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">2</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg inline-flex items-center gap-2"><Wand2 className="w-5 h-5 text-amber-500" /> Correr el parser</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              El parser lee el XML, detecta automáticamente los ~25 campos personalizados de cada ejemplar
              (sexo, raza, color, microchip, criador, propietario, padres…), descarta borradores/pruebas
              y deduplica entre los dos archivos.
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Pasando las rutas explícitamente</p>
                <CodeBlock>{`node scripts/parse-wxr-export.mjs "/ruta/a/REGISTRO 2.0.xml" "/ruta/a/BBDD ANTIGUA.xml"`}</CodeBlock>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">O sin argumentos (busca automáticamente en ~/Downloads)</p>
                <CodeBlock>{`node scripts/parse-wxr-export.mjs`}</CodeBlock>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Paso 3 */}
      <Card className="mb-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">3</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg inline-flex items-center gap-2"><FolderOpen className="w-5 h-5 text-amber-500" /> Revisar los archivos generados</h3>
            <CodeBlock copyable={false}>{`scripts/wp-export/
├── abci-import-listo-2026-06-28.xlsx       ← SUBE ESTE a /admin/import
├── abci-respaldo-completo-2026-06-28.xlsx  (todos los campos + pedigree extendido)
├── abci-respaldo-completo-2026-06-28.json  (respaldo crudo)
└── omitidos-2026-06-28.json                (registros con motivo de exclusión)`}</CodeBlock>
            <div className="mt-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Esta carpeta está en <code className="text-amber-500">.gitignore</code> — el respaldo completo
                incluye DNI y celular de propietarios, así que nunca se sube al repositorio.
                El archivo <code className="text-amber-500">abci-import-listo-*.xlsx</code> (el que sí subís al panel) no incluye esos datos.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Paso 4 */}
      <Card className="mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">4</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg">Importar al panel</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sube <code className="text-amber-500">abci-import-listo-*.xlsx</code> al importador. Ya trae los
              encabezados correctos, así que el auto-mapeo no necesita ajustes. ~9,655 registros se importan
              en menos de un minuto.
            </p>
            <div className="mt-4">
              <LinkButton href="/admin/import" variant="accent">
                <FileSpreadsheet className="w-4 h-4" /> Ir al importador
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </Card>

      {/* Plan B: scraping sin acceso al panel */}
      <Card className="border-zinc-700 bg-zinc-950/30">
        <h3 className="font-bold inline-flex items-center gap-2 mb-3">
          <Terminal className="w-5 h-5 text-amber-500" /> Plan B — Si se pierde el acceso al wp-admin
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Si en el futuro el proveedor revoca el acceso, hay un script de respaldo que extrae lo mismo
          visitando únicamente las páginas <strong>públicas</strong> del sitio — sin necesidad de credenciales.
          Es más lento (~25 min para 10K) y no ve campos privados como DNI o celular, pero funciona igual.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {[
            { Icon: Globe, label: "Sitemap público", val: "wp-sitemap.xml" },
            { Icon: FileCode, label: "API REST abierta", val: "wp-json/wp/v2/abcidog" },
            { Icon: Database, label: "Tipos de registro", val: "abcidog · registro-de-ejemplar" },
          ].map(c => (
            <div key={c.label} className="p-3 rounded-xl border border-border bg-background">
              <c.Icon className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <p className="font-mono text-xs mt-1 break-all">{c.val}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <CodeBlock>{`node scripts/migrate-from-abci.mjs --limit 50    # prueba`}</CodeBlock>
          <CodeBlock>{`node scripts/migrate-from-abci.mjs               # completo`}</CodeBlock>
          <CodeBlock>{`node scripts/migrate-from-abci.mjs --resume       # si se interrumpe`}</CodeBlock>
        </div>
        <div className="mt-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-2">
          <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Si el sitio bloquea las requests, bajá <code className="text-amber-500">CONCURRENCY</code> a 2 y
            subí <code className="text-amber-500">DELAY_MS</code> a 500 dentro del script para parecer un visitante normal.
          </p>
        </div>
      </Card>

      {/* Aviso legal */}
      <div className="mt-6 p-4 rounded-2xl border border-border bg-muted/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Nota legal</p>
          <p className="mt-1 max-w-3xl">
            Como operadores del registro, exportar y migrar tus propios datos a una nueva infraestructura
            es un derecho legítimo. Conservá el respaldo completo (JSON crudo) en un lugar seguro y no
            público — contiene datos personales de propietarios (DNI, celular) y sirve como evidencia
            del estado del registro al momento de la migración.
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs text-center text-muted-foreground">
        Documentación técnica completa: <Link href="#" className="text-amber-500 hover:underline font-mono">scripts/README.md</Link>
      </p>
    </AdminLayout>
  );
}
