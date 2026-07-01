"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUsers, getDogs, seedData } from "@/lib/store";
import type { User, Dog } from "@/lib/types";
import { Card, Input, Badge, SectionHeading } from "@/components/ui";
import { Star, ShieldCheck, Dog as DogIcon } from "lucide-react";

type Breeder = User & { dogCount: number };

export default function CriaderosPage() {
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
    const synthetic: Breeder[] = [
      { id: "U-S-1", email: "synth1", password: "", name: "Carlos Tonnard", kennelName: "Tonnard Bullies Kennel", affix: "TONNARD BULLIES", country: "Perú", membership: "elite", createdAt: "2020-04-01", bio: "Líneas clásicas con campeones nacionales en variantes Standard y Classic. Más de 6 años trabajando bloodlines de exportación.", dogCount: 24 },
      { id: "U-S-2", email: "synth2", password: "", name: "Diego Romero", kennelName: "Bullscape Kennel", affix: "BULLSCAPE", country: "Argentina", membership: "pro", createdAt: "2019-06-12", bio: "Bloodlines premium argentinos especializados en Pocket. Exportación a toda la región.", dogCount: 18 },
      { id: "U-S-3", email: "synth3", password: "", name: "Pedro Salazar", kennelName: "Arizona Bulls Kennel", affix: "ARIZONA BULLS", country: "Chile", membership: "elite", createdAt: "2020-06-22", bio: "Criadero chileno con campeones en la variante Extreme. Estructura exótica y cabeza blocky.", dogCount: 32 },
      { id: "U-S-4", email: "synth4", password: "", name: "Andrea Misari", kennelName: "Misari Bulls Kennel", affix: "MISARI BULLS", country: "Perú", membership: "pro", createdAt: "2022-01-08", bio: "Criadero boutique en Lima especializado en Pocket y Micro. Línea genética propia.", dogCount: 12 },
      { id: "U-S-5", email: "synth5", password: "", name: "Hugo Baes", kennelName: "Baes Bulls Kennel", affix: "BAES BULLS", country: "Ecuador", membership: "free", createdAt: "2021-05-15", bio: "Líneas ecuatorianas con estructura sólida y temperamento estable.", dogCount: 8 },
      { id: "U-S-6", email: "synth6", password: "", name: "Andrés Clavijo", kennelName: "Clavijo Bulls Kennel", affix: "CLAVIJO BULLS", country: "Colombia", membership: "elite", createdAt: "2020-08-25", bio: "Criadero colombiano reconocido con campeones nacionales en Pocket y Standard.", dogCount: 21 },
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
      <SectionHeading eyebrow="Directorio de criaderos" title="2,400+ criaderos verificados en Latinoamérica" description="Explora criaderos confiables. Cada uno verificado con al menos un ejemplar registrado en ABCI World Wide." />

      <Card className="mt-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por criadero o nombre del criador..." />
          <select value={country} onChange={e => setCountry(e.target.value)} className="h-11 px-3 rounded-xl border border-border bg-background text-sm">
            <option value="all">Todos los países</option>
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
                <Link href={`/criaderos/${b.id}`} className="font-semibold hover:text-amber-500 line-clamp-1">{b.kennelName}</Link>
                <p className="text-xs text-muted-foreground line-clamp-1">{b.name} · {b.country}</p>
                <div className="mt-1.5">
                  <Badge variant={b.membership === "elite" ? "accent" : b.membership === "pro" ? "success" : "default"}>
                    {b.membership === "elite" ? <><Star className="w-3 h-3 fill-current" /> Elite</> : b.membership === "pro" ? <><ShieldCheck className="w-3 h-3" /> Pro</> : "Gratuito"}
                  </Badge>
                </div>
              </div>
            </div>
            {b.bio && <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{b.bio}</p>}
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><DogIcon className="w-3 h-3" /> {b.dogCount} registrados</span>
              <span>Desde {new Date(b.createdAt).getFullYear()}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
