"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/adminLog";
import { Card, Button } from "@/components/ui";
import {
  Settings, Database, Download, RefreshCw, Info,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminSettingsPage() {
  const [counts, setCounts] = useState({
    dogs: 0, users: 0, events: 0, listings: 0, affixes: 0, transfers: 0, logs: 0,
  });

  async function refresh() {
    const supabase = createClient();
    const [dogs, users, events, listings, affixes, transfers, logs] = await Promise.all([
      supabase.from("dogs").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("marketplace_listings").select("*", { count: "exact", head: true }),
      supabase.from("affixes").select("*", { count: "exact", head: true }),
      supabase.from("transfers").select("*", { count: "exact", head: true }),
      supabase.from("admin_logs").select("*", { count: "exact", head: true }),
    ]);
    setCounts({
      dogs: dogs.count ?? 0, users: users.count ?? 0, events: events.count ?? 0,
      listings: listings.count ?? 0, affixes: affixes.count ?? 0,
      transfers: transfers.count ?? 0, logs: logs.count ?? 0,
    });
  }

  useEffect(() => { refresh(); }, []);

  async function exportFullBackup() {
    const supabase = createClient();
    const [dogs, users, events, listings, affixes, transfers, logs] = await Promise.all([
      supabase.from("dogs").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("events").select("*"),
      supabase.from("marketplace_listings").select("*"),
      supabase.from("affixes").select("*"),
      supabase.from("transfers").select("*"),
      supabase.from("admin_logs").select("*"),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dogs.data ?? []), "Ejemplares");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(users.data ?? []), "Usuarios");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(events.data ?? []), "Eventos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(listings.data ?? []), "Mercado");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(affixes.data ?? []), "Afijos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(transfers.data ?? []), "Traspasos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logs.data ?? []), "Auditoria");
    XLSX.writeFile(wb, `abci-backup-${new Date().toISOString().slice(0, 10)}.xlsx`);
    await logAdminAction(supabase, "Backup completo descargado");
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
          <Settings className="w-7 h-7 text-amber-500" /> Configuración del sistema
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Ajustes globales, backups y operaciones de mantenimiento.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Database stats */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold">Estado de la base de datos</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Ejemplares", value: counts.dogs },
              { label: "Usuarios", value: counts.users },
              { label: "Afijos", value: counts.affixes },
              { label: "Traspasos", value: counts.transfers },
              { label: "Eventos", value: counts.events },
              { label: "Anuncios", value: counts.listings },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-lg border border-border bg-muted/30">
                <p className="text-2xl font-bold text-amber-500">{s.value.toLocaleString("es-PE")}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <Button onClick={refresh} variant="outline" size="sm" className="mt-4 w-full">
            <RefreshCw className="w-4 h-4" /> Actualizar conteos
          </Button>
        </Card>

        {/* Backup */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold">Backup completo</h2>
          </div>
          <p className="text-sm text-muted-foreground">Descarga un archivo Excel con todas las tablas del sistema: ejemplares, usuarios, afijos, eventos, traspasos, mercado y log de auditoría.</p>
          <Button onClick={exportFullBackup} variant="accent" className="mt-4 w-full">
            <Download className="w-4 h-4" /> Descargar backup .xlsx
          </Button>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/30 flex items-start gap-2 text-xs">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-muted-foreground">Con {counts.dogs.toLocaleString("es-PE")} ejemplares, la descarga puede tardar unos segundos.</p>
          </div>
        </Card>

        {/* System info */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold">Información del sistema</h2>
          </div>
          <dl className="space-y-2 text-sm">
            {[
              { k: "Versión", v: "ABCI Admin v2.0.0" },
              { k: "Capa de datos", v: "Supabase (Postgres)" },
              { k: "Framework", v: "Next.js 16 + TypeScript" },
              { k: "Acciones registradas", v: counts.logs },
            ].map(r => (
              <div key={r.k} className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground">{r.k}</dt>
                <dd className="font-mono text-xs">{r.v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </AdminLayout>
  );
}
