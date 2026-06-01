"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUsers, getDogs, seedData } from "@/lib/store";
import type { User, Dog } from "@/lib/types";
import { Card, Input, Badge, SectionHeading } from "@/components/ui";

type Breeder = User & { dogCount: number };

export default function BreedersPage() {
  const [breeders, setBreeders] = useState<Breeder[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");

  useEffect(() => {
    seedData();
    const users = getUsers();
    const dogs = getDogs();
    const list: Breeder[] = users
      .filter(u => !!u.kennelName)
      .map(u => ({ ...u, dogCount: dogs.filter(d => d.ownerId === u.id).length }));
    // Add synthetic ones for richer directory
    const synthetic: Breeder[] = [
      { id: "U-S-1", email: "synth1", password: "", name: "Marco Diaz", kennelName: "Empire Bullies Kennel", country: "United States", membership: "elite", createdAt: "2021-04-01", bio: "ABKC champions in Pocket and Standard. 25 years of bloodline.", dogCount: 32 },
      { id: "U-S-2", email: "synth2", password: "", name: "Sasha Kim", kennelName: "Kim Bloodline", country: "South Korea", membership: "pro", createdAt: "2020-06-12", bio: "Specializing in Pocket Bullies with exotic structure.", dogCount: 18 },
      { id: "U-S-3", email: "synth3", password: "", name: "Carlos Rocha", kennelName: "Brazilian Royalty", country: "Brazil", membership: "elite", createdAt: "2019-01-22", bio: "Top XL bloodlines in South America. International export.", dogCount: 47 },
      { id: "U-S-4", email: "synth4", password: "", name: "Anna Lindqvist", kennelName: "Nordic Beasts", country: "Sweden", membership: "pro", createdAt: "2021-10-08", bio: "European Champion lines. Tested for health and temperament.", dogCount: 14 },
      { id: "U-S-5", email: "synth5", password: "", name: "Yuki Tanaka", kennelName: "Sakura Bullies", country: "Japan", membership: "free", createdAt: "2023-02-15", bio: "Boutique kennel with Classic and Standard bullies.", dogCount: 7 },
      { id: "U-S-6", email: "synth6", password: "", name: "Diego Romero", kennelName: "Pampas Legends", country: "Argentina", membership: "elite", createdAt: "2018-09-30", bio: "Heritage lines bred for show and family.", dogCount: 29 },
    ];
    setBreeders([...list, ...synthetic]);
  }, []);

  const countries = Array.from(new Set(breeders.map(b => b.country).filter(Boolean))) as string[];
  const filtered = breeders.filter(b => {
    if (country !== "all" && b.country !== country) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!`${b.name} ${b.kennelName} ${b.country}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeading eyebrow="Breeder Directory" title="12,400+ verified kennels worldwide" description="Browse trusted breeders. Every kennel is verified with at least one BPKC registration." />

      <Card className="mt-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by kennel or breeder name..." />
          <select value={country} onChange={e => setCountry(e.target.value)} className="h-11 px-3 rounded-xl border border-border bg-background text-sm">
            <option value="all">All countries</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </Card>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(b => (
          <Card key={b.id} className="hover:border-amber-500/40 transition">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold text-xl">
                {b.kennelName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/breeders/${b.id}`} className="font-semibold hover:text-amber-600 line-clamp-1">{b.kennelName}</Link>
                <p className="text-xs text-muted-foreground line-clamp-1">{b.name} • {b.country}</p>
                <div className="mt-1.5">
                  <Badge variant={b.membership === "elite" ? "accent" : b.membership === "pro" ? "success" : "default"}>
                    {b.membership === "elite" ? "⭐ Elite" : b.membership === "pro" ? "✓ Pro" : "Free"}
                  </Badge>
                </div>
              </div>
            </div>
            {b.bio && <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{b.bio}</p>}
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <span>🐕 {b.dogCount} registered</span>
              <span>Since {new Date(b.createdAt).getFullYear()}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
