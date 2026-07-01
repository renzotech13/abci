"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { getCurrentUser, signOut, seedData } from "@/lib/store";
import type { User } from "@/lib/types";
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

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    seedData();
    setUser(getCurrentUser());
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [pathname]);

  function handleSignOut() {
    signOut();
    setUser(null);
    router.push("/");
  }

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "glass border-b border-border" : "bg-transparent"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden lg:flex items-center gap-1">
              {nav.map(n => (
                <Link
                  key={n.href} href={n.href}
                  className={`px-3 py-2 rounded-lg text-sm transition whitespace-nowrap ${pathname === n.href ? "text-amber-500 bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/verificar"
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-muted text-foreground text-sm hover:bg-amber-500/10 hover:text-amber-500 transition whitespace-nowrap"
            >
              <QrCode className="w-4 h-4" />
              <span>Verificar QR</span>
            </Link>
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "admin" && (
                  <Link href="/admin" className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-zinc-900 border border-amber-500/40 text-amber-500 text-xs font-semibold hover:bg-amber-500 hover:text-black hover:border-amber-500 transition whitespace-nowrap">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </Link>
                )}
                <Link href="/panel" className="hidden sm:inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-amber-500 text-black text-sm font-medium hover:bg-amber-400 whitespace-nowrap">
                  <LayoutDashboard className="w-4 h-4" />
                  Mi panel
                </Link>
                <button onClick={handleSignOut} className="hidden sm:inline-flex h-9 px-3 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">Salir</button>
              </div>
            ) : (
              <>
                <Link href="/iniciar-sesion" className="hidden sm:inline-flex items-center h-9 px-3.5 rounded-full text-sm text-foreground hover:bg-muted whitespace-nowrap">Iniciar sesión</Link>
                <Link href="/registrarse" className="inline-flex items-center h-9 px-4 rounded-full bg-amber-500 text-black text-sm font-medium hover:bg-amber-400 whitespace-nowrap">Registrarse</Link>
              </>
            )}
            <button className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-border" onClick={() => setOpen(!open)} aria-label="Menú">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-border pt-3 -mx-4 px-4 bg-background">
            <nav className="flex flex-col gap-1">
              {nav.map(n => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-muted">{n.label}</Link>
              ))}
              <Link href="/verificar" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-muted">Verificar QR</Link>
              {user ? (
                <Link href="/panel" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-muted">Mi panel</Link>
              ) : (
                <Link href="/iniciar-sesion" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-muted">Iniciar sesión</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
