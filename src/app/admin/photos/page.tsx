"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/adminLog";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, Button } from "@/components/ui";
import {
  Image as ImageIcon, CheckCircle2, AlertTriangle, Loader2,
  Zap, RefreshCw, Eye, EyeOff, Globe,
} from "lucide-react";

type Dog = Pick<Tables<"dogs">, "id" | "certificate_id" | "name" | "photo_url">;
type PhotoEntry = { certId: string; url: string; dog: Dog | null };
type ApplyResult = { updated: number; skipped: number };

export default function AdminPhotosPage() {
  const [photoMap, setPhotoMap] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [preview, setPreview] = useState<PhotoEntry[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<ApplyResult | null>(null);

  const [stats, setStats] = useState({ total: 0, withPhoto: 0 });

  async function refreshStats() {
    const supabase = createClient();
    const [{ count: total }, { count: withPhoto }] = await Promise.all([
      supabase.from("dogs").select("*", { count: "exact", head: true }),
      supabase.from("dogs").select("*", { count: "exact", head: true }).not("photo_url", "is", null),
    ]);
    setStats({ total: total ?? 0, withPhoto: withPhoto ?? 0 });
  }

  useEffect(() => { refreshStats(); }, [result]);

  async function loadMap() {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/abci-foto-map.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const map: Record<string, string> = await res.json();
      setPhotoMap(map);

      const supabase = createClient();
      const certIds = Object.keys(map);
      const dogs: Dog[] = [];
      for (let i = 0; i < certIds.length; i += 500) {
        const { data } = await supabase.from("dogs").select("id, certificate_id, name, photo_url").in("certificate_id", certIds.slice(i, i + 500));
        dogs.push(...(data ?? []));
      }
      const bycert = new Map<string, Dog>(dogs.map(d => [d.certificate_id, d]));
      const entries: PhotoEntry[] = Object.entries(map).map(([certId, url]) => ({
        certId,
        url,
        dog: bycert.get(certId) ?? null,
      }));

      entries.sort((a, b) => (a.dog ? 0 : 1) - (b.dog ? 0 : 1));
      setPreview(entries);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function applyPhotos() {
    if (!photoMap) return;
    setApplying(true);
    const supabase = createClient();
    let updated = 0;
    let skipped = 0;
    try {
      for (const entry of preview) {
        if (!entry.dog) { skipped++; continue; }
        if (entry.dog.photo_url && !overwrite) { skipped++; continue; }
        const { error } = await supabase.from("dogs").update({ photo_url: entry.url }).eq("id", entry.dog.id);
        if (error) skipped++; else updated++;
      }
      await logAdminAction(supabase, "Asignación masiva de fotos", undefined, `${updated} asignadas · ${skipped} omitidas`);
      setResult({ updated, skipped });
    } finally {
      setApplying(false);
    }
  }

  const matched = preview.filter(e => e.dog).length;
  const unmatched = preview.filter(e => !e.dog).length;
  const alreadyHavePhoto = preview.filter(e => e.dog?.photo_url).length;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-amber-500" /> Asignación masiva de fotos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vincula fotos del mapa heredado del sitio original (abciregistro.com) a los ejemplares del registro.
        </p>
      </div>

      <div className="mb-8 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3 max-w-3xl">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">El dominio abciregistro.com está dado de baja</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Las 1,854 fotos originales ya fueron migradas a nuestro propio almacenamiento (Supabase Storage) y no dependen de ese dominio.
            Esta herramienta solo sirve para casos excepcionales con un mapa nuevo — no vuelvas a aplicar el mapa antiguo con &quot;sobrescribir&quot; activado,
            porque las URLs que contiene ya no cargan.
          </p>
        </div>
      </div>

      {/* Estado actual */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="text-center py-5">
          <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Ejemplares en el registro</p>
        </Card>
        <Card className="text-center py-5 border-amber-500/30 bg-amber-500/5">
          <p className="text-3xl font-bold text-amber-500">{stats.withPhoto.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Con foto asignada</p>
        </Card>
        <Card className="text-center py-5">
          <p className="text-3xl font-bold text-muted-foreground">{(stats.total - stats.withPhoto).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Sin foto (pendientes)</p>
        </Card>
      </div>

      {/* Paso 1: Cargar mapa */}
      {!photoMap && (
        <Card className="max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Mapa de fotos ABCI</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Mapa heredado que vincula cada número de registro ABCI con la URL de la foto original.
                Al aplicarlo, la URL se copia al campo de foto del ejemplar en nuestra base de datos.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-muted text-xs font-mono text-muted-foreground break-all">
                /abci-foto-map.json — 1,854 vínculos foto → ejemplar
              </div>
              {loadError && (
                <div className="mt-3 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center gap-2 text-sm text-rose-500">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {loadError}
                </div>
              )}
              <Button onClick={loadMap} disabled={loading} variant="accent" className="mt-4">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</> : <><Zap className="w-4 h-4" /> Cargar mapa de fotos</>}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Paso 2: Vista previa + aplicar */}
      {photoMap && !result && (
        <div className="space-y-6 max-w-3xl">
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-500">Mapa cargado correctamente</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  <span className="font-semibold text-foreground">{matched}</span> coincidencias con ejemplares del registro ·{" "}
                  <span className="text-muted-foreground">{unmatched} sin coincidencia</span>
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-background text-center">
                <p className="text-2xl font-bold text-emerald-500">{matched}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Con match</p>
              </div>
              <div className="p-3 rounded-xl border border-amber-500/20 bg-background text-center">
                <p className="text-2xl font-bold text-amber-500">{alreadyHavePhoto}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Ya tienen foto</p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-background text-center">
                <p className="text-2xl font-bold">{matched - alreadyHavePhoto}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">A asignar</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-3">Opciones de aplicación</h3>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={e => setOverwrite(e.target.checked)}
                className="mt-0.5 accent-amber-500"
              />
              <div>
                <p className="text-sm font-medium">Sobrescribir fotos existentes</p>
                <p className="text-xs text-muted-foreground">Si está desactivado, solo se asigna foto a los ejemplares que aún no tienen ninguna.</p>
              </div>
            </label>
          </Card>

          {/* Preview de imágenes */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Vista previa de fotos</h3>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <><EyeOff className="w-3.5 h-3.5" /> Ocultar</> : <><Eye className="w-3.5 h-3.5" /> Ver {Math.min(matched, 24)} ejemplos</>}
              </Button>
            </div>
            {showPreview && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {preview.filter(e => e.dog).slice(0, 24).map(e => (
                  <div key={e.certId} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={e.url}
                      alt={e.dog?.name || e.certId}
                      className="w-full h-full object-cover rounded-xl border border-border"
                      onError={ev => { (ev.target as HTMLImageElement).src = ""; }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 rounded-b-xl px-1 py-0.5">
                      <p className="text-[8px] text-white truncate">{e.dog?.name || e.certId}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!showPreview && (
              <p className="text-sm text-muted-foreground">Vista previa de las URLs contenidas en el mapa cargado.</p>
            )}
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setPhotoMap(null); setPreview([]);}}>
              <RefreshCw className="w-4 h-4" /> Recargar mapa
            </Button>
            <Button variant="accent" size="lg" onClick={applyPhotos} disabled={applying || matched === 0}>
              {applying
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Aplicando…</>
                : <><Zap className="w-4 h-4" /> Aplicar fotos a {overwrite ? matched : matched - alreadyHavePhoto} ejemplares</>
              }
            </Button>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <Card className="max-w-2xl text-center py-10">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500/15 items-center justify-center mb-4">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold">¡Fotos aplicadas!</h2>
          <p className="text-sm text-muted-foreground mt-1">Las fotos ya se muestran en el perfil, pedigree y certificado de cada ejemplar.</p>

          <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-3xl font-bold text-emerald-500">{result.updated}</p>
              <p className="text-xs text-muted-foreground mt-1">Fotos asignadas</p>
            </div>
            <div className="p-4 rounded-xl border border-border">
              <p className="text-3xl font-bold text-muted-foreground">{result.skipped}</p>
              <p className="text-xs text-muted-foreground mt-1">Omitidos</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={() => { setResult(null); setPhotoMap(null); setPreview([]);}}>
              Aplicar de nuevo
            </Button>
            <Button variant="accent" onClick={() => window.location.href = "/admin/dogs"}>
              Ver ejemplares
            </Button>
          </div>
        </Card>
      )}
    </AdminLayout>
  );
}
