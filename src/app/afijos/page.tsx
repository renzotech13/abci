"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAffixes, seedData } from "@/lib/store";
import type { Affix } from "@/lib/types";
import { Card, Input, Badge, SectionHeading } from "@/components/ui";
import { Tag, ShieldCheck, Search } from "lucide-react";

export default function AfijosPage() {
  const [affixes, setAffixes] = useState<Affix[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");

  useEffect(() => {
    seedData();
    setAffixes(getAffixes());
  }, []);

  const countries = Array.from(new Set(affixes.map(a => a.country).filter(Boolean)));

  const filtered = affixes.filter(a => {
    if (country !== "all" && a.country !== country) return false;
    if (query && !`${a.name} ${a.ownerName} ${a.country} ${a.specialty}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeading eyebrow="Afijos registrados" title="Directorio oficial de afijos ABCI" description="Cada criadero registra un afijo único e irrepetible que antepone al nombre de sus ejemplares. Aquí están todos los afijos oficiales." />

      <Card className="mt-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre del afijo, dueño o especialidad..." />
          <select value={country} onChange={e => setCountry(e.target.value)} className="h-11 px-3 rounded-xl border border-border bg-background text-sm">
            <option value="all">Todos los países</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <p className="text-sm text-muted-foreground mt-3">{filtered.length} afijos registrados</p>
      </Card>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(a => (
          <Link key={a.id} href={`/afijos/${a.id}`}>
            <Card className="hover:border-amber-500/40 transition h-full">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center">
                  <Tag className="w-7 h-7" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono font-bold text-base leading-tight">{a.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{a.affixId}</p>
                  <Badge variant="success" className="mt-2"><ShieldCheck className="w-3 h-3" /> Activo</Badge>
                </div>
              </div>
              {a.specialty && <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{a.specialty}</p>}
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                <span>{a.ownerName}</span>
                <span>{a.country}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="text-center py-12 mt-6">
          <Search className="w-9 h-9 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
          <p className="font-semibold">No se encontraron afijos</p>
          <p className="text-sm text-muted-foreground mt-1">Prueba ajustando los filtros.</p>
        </Card>
      )}
    </div>
  );
}
