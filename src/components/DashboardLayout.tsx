"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { Badge } from "./ui";
import {
  Home, Dog as DogIcon, PlusCircle, Users2, Tag,
  ArrowLeftRight, HeartPulse, ShoppingBag, Settings,
} from "lucide-react";

const items = [
  { href: "/panel", label: "Resumen", Icon: Home },
  { href: "/panel/dogs", label: "Mis ejemplares", Icon: DogIcon },
  { href: "/panel/dogs/add", label: "Registrar ejemplar", Icon: PlusCircle },
  { href: "/panel/litter", label: "Registro de camada", Icon: Users2 },
  { href: "/panel/affixes", label: "Mis afijos", Icon: Tag },
  { href: "/panel/transfers", label: "Traspasos", Icon: ArrowLeftRight },
  { href: "/panel/health", label: "Bóveda de salud", Icon: HeartPulse },
  { href: "/panel/listings", label: "Mis anuncios", Icon: ShoppingBag },
  { href: "/panel/profile", label: "Perfil y criadero", Icon: Settings },
];

type Profile = Tables<"profiles">;

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/iniciar-sesion");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
      if (cancelled) return;
      setUser(profile);
      setLoading(false);
    }
    check();
    return () => { cancelled = true; };
  }, [router, pathname]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground animate-pulse">
        Cargando…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl border border-border bg-card p-5 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.kennel_name || user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <Badge variant={user.membership === "free" ? "default" : "accent"}>
                {user.membership === "free" ? "Plan Gratuito" : user.membership === "pro" ? "Miembro Pro" : "Miembro Elite"}
              </Badge>
              {user.membership === "free" && (
                <Link href="/membresia" className="text-amber-500 font-medium">Mejorar</Link>
              )}
            </div>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {items.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href} href={href}
                  className={`shrink-0 inline-flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    active ? "bg-amber-500 text-black shadow-[0_2px_10px_rgba(232,185,35,0.3)]" : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5"
                  }`}
                >
                  <Icon className="w-4 h-4" /> <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
