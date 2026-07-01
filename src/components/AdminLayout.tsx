"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { getCurrentUser, isAdmin, seedData, signOut } from "@/lib/store";
import type { User } from "@/lib/types";
import { Badge } from "./ui";
import {
  LayoutDashboard, Dog as DogIcon, Users, FileText, Tag,
  ArrowLeftRight, ShoppingBag, CalendarDays, Newspaper,
  Upload, ScrollText, Settings, LogOut, ShieldCheck, Home,
  ChevronLeft, Menu, Database, Image as ImageIcon,
} from "lucide-react";

const groups = [
  {
    title: "Resumen",
    items: [
      { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
      { href: "/admin/logs", label: "Auditoría", Icon: ScrollText },
    ],
  },
  {
    title: "Importación",
    items: [
      { href: "/admin/import", label: "Importar Excel", Icon: Upload },
      { href: "/admin/photos", label: "Asignar fotos masivas", Icon: ImageIcon },
      { href: "/admin/migrate", label: "Migrar desde sitio actual", Icon: Database },
    ],
  },
  {
    title: "Registros",
    items: [
      { href: "/admin/dogs", label: "Ejemplares", Icon: DogIcon },
      { href: "/admin/certificates", label: "Certificados", Icon: FileText },
      { href: "/admin/affixes", label: "Afijos", Icon: Tag },
      { href: "/admin/transfers", label: "Traspasos", Icon: ArrowLeftRight },
    ],
  },
  {
    title: "Personas",
    items: [
      { href: "/admin/users", label: "Usuarios", Icon: Users },
    ],
  },
  {
    title: "Contenido",
    items: [
      { href: "/admin/events", label: "Eventos", Icon: CalendarDays },
      { href: "/admin/marketplace", label: "Mercado", Icon: ShoppingBag },
      { href: "/admin/blog", label: "Blog", Icon: Newspaper },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/admin/settings", label: "Configuración", Icon: Settings },
    ],
  },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    seedData();
    const u = getCurrentUser();
    if (!u) {
      router.push("/admin/login");
      return;
    }
    if (!isAdmin()) {
      router.push("/panel");
      return;
    }
    setUser(u);
    setLoading(false);
  }, [router, pathname]);

  function handleSignOut() {
    signOut();
    router.push("/admin/login");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Verificando permisos…
      </div>
    );
  }

  const sidebarWidth = collapsed ? "lg:w-20" : "lg:w-72";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 h-14 px-4 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="inline-flex w-9 h-9 rounded-lg items-center justify-center hover:bg-muted">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-500" /> Admin ABCI
        </div>
        <button onClick={handleSignOut} className="inline-flex w-9 h-9 rounded-lg items-center justify-center hover:bg-muted">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen ${sidebarWidth} ${mobileOpen ? "w-72 translate-x-0" : "-translate-x-full lg:translate-x-0"} transition-all duration-300 ease-out bg-zinc-950 dark:bg-black border-r border-border flex flex-col`}>
          <div className="h-16 px-5 flex items-center justify-between border-b border-border shrink-0">
            <Link href="/admin" className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-black" strokeWidth={2.25} />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">ABCI Admin</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Panel de control</p>
                </div>
              )}
            </Link>
            <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:inline-flex w-7 h-7 rounded-md items-center justify-center hover:bg-zinc-800 text-zinc-400">
              <ChevronLeft className={`w-4 h-4 transition ${collapsed ? "rotate-180" : ""}`} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
            {groups.map(g => (
              <div key={g.title}>
                {!collapsed && (
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 px-2 mb-1.5 font-semibold">{g.title}</p>
                )}
                <div className="space-y-0.5">
                  {g.items.map(({ href, label, Icon }) => {
                    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                    return (
                      <Link
                        key={href} href={href}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          active
                            ? "bg-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(232,185,35,0.3)]"
                            : "text-zinc-300 hover:bg-zinc-800 hover:text-white hover:translate-x-0.5"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? label : undefined}
                      >
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-border p-3 shrink-0">
            {!collapsed ? (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <Badge variant="accent" className="text-[10px] mt-0.5">ADMIN</Badge>
                </div>
                <button onClick={handleSignOut} title="Cerrar sesión" className="w-8 h-8 rounded-md inline-flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={handleSignOut} title="Cerrar sesión" className="w-full h-10 rounded-lg inline-flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white">
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <Link href="/" className={`mt-2 flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition ${collapsed ? "justify-center" : ""}`}>
              <Home className="w-3.5 h-3.5" />
              {!collapsed && <span>Ver sitio público</span>}
            </Link>
          </div>
        </aside>

        {/* Overlay */}
        {mobileOpen && (
          <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
