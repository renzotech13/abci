"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import {
  getDogs, getUsers, getEvents, getMarketplace, getAffixes,
  getTransfers, getAdminLogs, logAdminAction,
} from "@/lib/store";
import { Card, Button, Badge } from "@/components/ui";
import {
  Settings, Database, Trash2, AlertTriangle, Download,
  ShieldAlert, RefreshCw, Info,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminSettingsPage() {
  const [counts, setCounts] = useState({
    dogs: 0, users: 0, events: 0, listings: 0, affixes: 0, transfers: 0, logs: 0,
  });

  useEffect(() => { refresh(); }, []);

  function refresh() {
    setCounts({
      dogs: getDogs().length,
      users: getUsers().length,
      events: getEvents().length,
      listings: getMarketplace().length,
      affixes: getAffixes().length,
      transfers: getTransfers().length,
      logs: getAdminLogs().length,
    });
  }

  function exportFullBackup() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getDogs()), "Ejemplares");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getUsers()), "Usuarios");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getEvents()), "Eventos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getMarketplace()), "Mercado");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getAffixes()), "Afijos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getTransfers()), "Traspasos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getAdminLogs()), "Auditoria");
    XLSX.writeFile(wb, `abci-backup-${new Date().toISOString().slice(0, 10)}.xlsx`);
    logAdminAction("Backup completo descargado");
  }

  function clearSeedAndReload() {
    if (!confirm("¿Restablecer la base de datos a los datos demo? Se perderán todos los cambios.")) return;
    if (!confirm("CONFIRMACIÓN FINAL: esta acción no se puede deshacer.")) return;
    const keys = Object.keys(localStorage).filter(k => k.startsWith("abci:"));
    for (const k of keys) localStorage.removeItem(k);
    location.reload();
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
                <p className="text-2xl font-bold text-amber-500">{s.value}</p>
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
            <p className="text-muted-foreground">Se recomienda hacer backup antes de cualquier operación masiva o restablecimiento.</p>
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
              { k: "Versión", v: "ABCI Admin v1.0.0" },
              { k: "Build", v: "abci-2026.06.27" },
              { k: "Capa de datos", v: "localStorage del navegador" },
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

        {/* Danger zone */}
        <Card className="border-rose-500/30 bg-rose-500/5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-rose-500">Zona de peligro</h2>
          </div>
          <Badge variant="warning" className="mb-4">Operaciones irreversibles</Badge>
          <p className="text-sm text-muted-foreground">
            Restablecer borrará todos los registros, usuarios y certificados emitidos. La base volverá al estado inicial con los datos demo.
          </p>
          <Button onClick={clearSeedAndReload} variant="outline" size="sm" className="mt-4 w-full border-rose-500/30 text-rose-500 hover:bg-rose-500/10">
            <Trash2 className="w-4 h-4" /> Restablecer base de datos
          </Button>
          <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-muted-foreground">Esta acción no se puede deshacer. Haz backup antes de continuar.</p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
