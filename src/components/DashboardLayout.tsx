"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { getCurrentUser, seedData } from "@/lib/store";
import type { User } from "@/lib/types";
import { Badge } from "./ui";

const items = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/dogs", label: "My Dogs", icon: "🐶" },
  { href: "/dashboard/dogs/add", label: "Register a Dog", icon: "➕" },
  { href: "/dashboard/litter", label: "Litter Registration", icon: "👪" },
  { href: "/dashboard/transfers", label: "Ownership Transfers", icon: "🔁" },
  { href: "/dashboard/health", label: "Health Vault", icon: "❤️" },
  { href: "/dashboard/listings", label: "My Listings", icon: "🛒" },
  { href: "/dashboard/profile", label: "Profile & Kennel", icon: "⚙️" },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedData();
    const u = getCurrentUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
    setLoading(false);
  }, [router, pathname]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">
        Loading…
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
                <p className="text-xs text-muted-foreground truncate">{user.kennelName || user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <Badge variant={user.membership === "free" ? "default" : "accent"}>
                {user.membership === "free" ? "Free Plan" : user.membership === "pro" ? "Pro Member" : "Elite Member"}
              </Badge>
              {user.membership === "free" && (
                <Link href="/membership" className="text-amber-600 font-medium">Upgrade</Link>
              )}
            </div>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {items.map(it => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href} href={it.href}
                  className={`shrink-0 inline-flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{it.icon}</span> <span>{it.label}</span>
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
