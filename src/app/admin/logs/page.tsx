"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, Input } from "@/components/ui";
import { ScrollText, Search, Activity } from "lucide-react";

type AdminLog = Tables<"admin_logs">;

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "hace un instante";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} día${days > 1 ? "s" : ""}`;
  return new Date(iso).toLocaleDateString("es-PE");
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.from("admin_logs").select("*").order("timestamp", { ascending: false }).limit(200)
      .then(({ data }) => setLogs(data ?? []));
  }, []);

  const filtered = logs.filter(l => {
    if (!query) return true;
    return `${l.action} ${l.target} ${l.admin_name} ${l.details}`.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
          <ScrollText className="w-7 h-7 text-amber-500" /> Auditoría
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Historial de acciones realizadas por los administradores del sistema.</p>
      </div>

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por acción, administrador o detalle..." className="pl-9" />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Activity className="w-9 h-9 mx-auto mb-3 opacity-50" />
            Sin acciones registradas todavía.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map(l => (
              <li key={l.id} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{l.action}{l.target && <span className="text-muted-foreground"> · {l.target}</span>}</p>
                  {l.details && <p className="text-xs text-muted-foreground mt-0.5">{l.details}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{l.admin_name} · {formatRelative(l.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminLayout>
  );
}
