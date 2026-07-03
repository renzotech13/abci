"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, LinkButton } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";
import {
  Dog as DogIcon, Users, FileText, Tag, ArrowLeftRight,
  CalendarDays, ShoppingBag, TrendingUp, AlertCircle, ChevronRight,
  Upload, Activity,
} from "lucide-react";

type Dog = Tables<"dogs">;
type AdminLog = Tables<"admin_logs">;

export default function AdminDashboardPage() {
  const [dogCount, setDogCount] = useState(0);
  const [last30Days, setLast30Days] = useState(0);
  const [recentDogs, setRecentDogs] = useState<Dog[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [elite, setElite] = useState(0);
  const [pro, setPro] = useState(0);
  const [affixCount, setAffixCount] = useState(0);
  const [pendingTransfers, setPendingTransfers] = useState(0);
  const [transferCount, setTransferCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [listingCount, setListingCount] = useState(0);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400 * 1000).toISOString();

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase.from("profiles").select("name").eq("id", data.user.id).maybeSingle();
      if (profile) setAdminName(profile.name.split(" ")[0]);
    });

    supabase.from("dogs").select("*", { count: "exact", head: true }).then(({ count }) => setDogCount(count ?? 0));
    supabase.from("dogs").select("*", { count: "exact", head: true }).gte("registration_date", thirtyDaysAgo).then(({ count }) => setLast30Days(count ?? 0));
    supabase.from("dogs").select("*").order("registration_date", { ascending: false }).limit(5).then(({ data: rows }) => setRecentDogs(rows ?? []));

    supabase.from("profiles").select("*", { count: "exact", head: true }).then(({ count }) => setUserCount(count ?? 0));
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("membership", "elite").then(({ count }) => setElite(count ?? 0));
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("membership", "pro").then(({ count }) => setPro(count ?? 0));

    supabase.from("affixes").select("*", { count: "exact", head: true }).then(({ count }) => setAffixCount(count ?? 0));

    supabase.from("transfers").select("*", { count: "exact", head: true }).then(({ count }) => setTransferCount(count ?? 0));
    supabase.from("transfers").select("*", { count: "exact", head: true }).eq("status", "pending").then(({ count }) => setPendingTransfers(count ?? 0));

    supabase.from("events").select("*", { count: "exact", head: true }).then(({ count }) => setEventCount(count ?? 0));
    supabase.from("marketplace_listings").select("*", { count: "exact", head: true }).then(({ count }) => setListingCount(count ?? 0));

    supabase.from("admin_logs").select("*").order("timestamp", { ascending: false }).limit(6).then(({ data: rows }) => setLogs(rows ?? []));
  }, []);

  const stats = [
    { label: "Ejemplares totales", value: dogCount, sub: `+${last30Days} este mes`, Icon: DogIcon, href: "/admin/dogs" },
    { label: "Usuarios registrados", value: userCount, sub: `${elite} elite · ${pro} pro`, Icon: Users, href: "/admin/users" },
    { label: "Certificados emitidos", value: dogCount, sub: "100% verificados", Icon: FileText, href: "/admin/certificates" },
    { label: "Afijos registrados", value: affixCount, sub: "Activos", Icon: Tag, href: "/admin/affixes" },
    { label: "Traspasos pendientes", value: pendingTransfers, sub: `${transferCount} totales`, Icon: ArrowLeftRight, href: "/admin/transfers", alert: pendingTransfers > 0 },
    { label: "Eventos programados", value: eventCount, sub: "Próximos", Icon: CalendarDays, href: "/admin/events" },
    { label: "Anuncios en mercado", value: listingCount, sub: "Activos", Icon: ShoppingBag, href: "/admin/marketplace" },
    { label: "Crecimiento mensual", value: `${Math.round((last30Days / Math.max(dogCount, 1)) * 100)}%`, sub: "Ejemplares nuevos", Icon: TrendingUp },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hola {adminName}, bienvenido al panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen del sistema y atajos rápidos para gestionar el registro.</p>
      </div>

      {pendingTransfers > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Tienes {pendingTransfers} traspaso{pendingTransfers > 1 ? "s" : ""} pendiente{pendingTransfers > 1 ? "s" : ""}</p>
              <p className="text-xs text-muted-foreground">Requieren tu aprobación para completarse.</p>
            </div>
          </div>
          <LinkButton href="/admin/transfers" variant="accent" size="sm">Revisar</LinkButton>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => {
          const content = (
            <Card className={`relative h-full ${s.href ? "hover:border-amber-500/50 transition cursor-pointer" : ""} ${s.alert ? "border-amber-500/40" : ""}`}>
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${s.alert ? "bg-amber-500 text-black" : "bg-amber-500/10 text-amber-500"} flex items-center justify-center`}>
                  <s.Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                {s.href && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </div>
              <p className="text-3xl font-bold mt-3">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </Card>
          );
          return s.href ? <Link key={s.label} href={s.href}>{content}</Link> : <div key={s.label}>{content}</div>;
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ejemplares registrados recientemente</h2>
            <Link href="/admin/dogs" className="text-sm text-amber-500 hover:underline inline-flex items-center gap-1">
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Nombre</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Nro.</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Criadero</th>
                  <th className="text-left px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentDogs.map(d => (
                  <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <Link href={`/ejemplar/${d.id}`} className="font-medium hover:text-amber-500">{d.name}</Link>
                      <p className="text-xs text-muted-foreground sm:hidden">Nro. {d.certificate_id}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs hidden sm:table-cell">{d.certificate_id}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{d.kennel_name || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatShortDate(d.registration_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Upload className="w-4 h-4" />
              <p className="text-xs uppercase tracking-wider font-semibold">Acción rápida</p>
            </div>
            <p className="font-semibold mt-1">Importar base masiva</p>
            <p className="text-xs text-muted-foreground mt-1">Sube un Excel y registra cientos de ejemplares en segundos.</p>
            <LinkButton href="/admin/import" variant="accent" size="sm" className="mt-3 w-full">Ir al importador</LinkButton>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4" /> Actividad reciente</h3>
              <Link href="/admin/logs" className="text-xs text-amber-500 hover:underline">Ver todo</Link>
            </div>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin acciones registradas todavía.</p>
            ) : (
              <ul className="space-y-3">
                {logs.map(l => (
                  <li key={l.id} className="text-xs">
                    <p className="font-medium">{l.action}</p>
                    <p className="text-muted-foreground mt-0.5">{l.admin_name} · {formatShortDate(l.timestamp)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
