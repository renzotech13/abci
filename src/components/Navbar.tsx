"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { getCurrentUser, signOut, seedData } from "@/lib/store";
import type { User } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { href: "/search", label: "Pedigree Search" },
  { href: "/breeders", label: "Breeders" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/membership", label: "Membership" },
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
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden lg:flex items-center gap-1">
              {nav.map(n => (
                <Link
                  key={n.href} href={n.href}
                  className={`px-3 py-2 rounded-lg text-sm transition ${pathname === n.href ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/verify" className="hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-muted text-foreground text-sm hover:bg-amber-500/10 hover:text-amber-600 transition">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 12 2 2 4-4"/><path d="M21 12c0 5-3.5 7.5-9 9-5.5-1.5-9-4-9-9V5l9-3 9 3v7z"/></svg>
              Verify
            </Link>
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="hidden sm:inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-foreground text-background text-sm hover:opacity-90">
                  <span className="inline-flex w-6 h-6 rounded-full bg-amber-500 text-black text-xs items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </span>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="hidden sm:inline-flex h-9 px-3 text-sm text-muted-foreground hover:text-foreground">Sign out</button>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex items-center h-9 px-3.5 rounded-full text-sm text-foreground hover:bg-muted">Sign in</Link>
                <Link href="/register" className="inline-flex items-center h-9 px-4 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90">Join free</Link>
              </>
            )}
            <button className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-border" onClick={() => setOpen(!open)} aria-label="Menu">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">{open ? <path d="M18 6 6 18M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}</svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-border pt-3 -mx-4 px-4 bg-background">
            <nav className="flex flex-col gap-1">
              {nav.map(n => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-muted">{n.label}</Link>
              ))}
              <Link href="/verify" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-muted">Verify Certificate</Link>
              {user ? (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-muted">Dashboard</Link>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-muted">Sign in</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
