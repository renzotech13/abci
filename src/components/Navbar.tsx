"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { usePathname, useRouter } from "next/navigation";
import { QrCode, Menu, X, LayoutDashboard, ShieldCheck } from "lucide-react";

const nav = [
  { href: "/ejemplares", label: "Ejemplares" },
  { href: "/criaderos", label: "Criaderos" },
  { href: "/afijos", label: "Afijos" },
  { href: "/mercado", label: "Mercado" },
  { href: "/eventos", label: "Eventos" },
  { href: "/blog", label: "Blog" },
  { href: "/membresia", label: "Membresía" },
];

type Profile = Tables<"profiles">;

export function Navbar() {
  const [user, setUser] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadProfile(authUserId: string | undefined) {
      if (!authUserId) { if (!cancelled) setUser(null); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", authUserId).maybeSingle();
      if (!cancelled) setUser(data);
    }

    supabase.auth.getUser().then(({ data }) => loadProfile(data.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user?.id);
    });

    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    handler();
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.removeEventListener("scroll", handler);
    };
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass border-b border-border shadow-elevation-1" : "bg-transparent border-b border-transparent"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden lg:flex items-center gap-1">
              {nav.map(n => {
                const active = pathname === n.href;
                return (
                  <Link
                    key={n.href} href={n.href}
                    className={`relative px-3 py-2 rounded-lg text-sm transition-colors duration-200 whitespace-nowrap ${active ? "text-amber-500" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    {n.label}
                    {active && (
                      <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-amber-500 animate-fade-in-up" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/verificar"
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-muted text-foreground text-sm transition-all duration-200 hover:bg-amber-500/10 hover:text-amber-500 whitespace-nowrap cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Verificar QR</span>
            </Link>
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "admin" && (
                  <Link href="/admin" className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-zinc-900 border border-amber-500/40 text-amber-500 text-xs font-semibold transition-all duration-200 hover:bg-amber-500 hover:text-black hover:border-amber-500 whitespace-nowrap cursor-pointer">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </Link>
                )}
                <Link href="/panel" className="hidden sm:inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-amber-500 text-black text-sm font-medium transition-all duration-200 hover:bg-amber-400 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(232,185,35,0.35)] whitespace-nowrap cursor-pointer">
                  <LayoutDashboard className="w-4 h-4" />
                  Mi panel
                </Link>
                <button onClick={handleSignOut} className="hidden sm:inline-flex h-9 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap cursor-pointer">Salir</button>
              </div>
            ) : (
              <>
                <Link href="/iniciar-sesion" className="hidden sm:inline-flex items-center h-9 px-3.5 rounded-full text-sm text-foreground transition-colors duration-200 hover:bg-muted whitespace-nowrap cursor-pointer">Iniciar sesión</Link>
                <Link href="/registrarse" className="inline-flex items-center h-9 px-4 rounded-full bg-amber-500 text-black text-sm font-medium transition-all duration-200 hover:bg-amber-400 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(232,185,35,0.35)] whitespace-nowrap cursor-pointer">Registrarse</Link>
              </>
            )}
            <button className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-border transition-colors hover:bg-muted cursor-pointer" onClick={() => setOpen(!open)} aria-label="Menú" aria-expanded={open}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden overflow-hidden transition-[grid-template-rows] duration-300 ease-out grid ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="pb-4 border-t border-border pt-3 -mx-4 px-4 bg-background">
              <nav className="flex flex-col gap-1">
                {nav.map(n => (
                  <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${pathname === n.href ? "text-amber-500 bg-amber-500/10" : "hover:bg-muted"}`}>{n.label}</Link>
                ))}
                <Link href="/verificar" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors">Verificar QR</Link>
                {user ? (
                  <Link href="/panel" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors">Mi panel</Link>
                ) : (
                  <Link href="/iniciar-sesion" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors">Iniciar sesión</Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
