"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDogs, seedData } from "@/lib/store";
import type { Dog } from "@/lib/types";
import { Card, Input, Badge, SectionHeading } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import { calculateAge, formatShortDate } from "@/lib/utils";
import { Search, ChevronRight } from "lucide-react";

export default function EjemplaresPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [breed, setBreed] = useState("all");

  useEffect(() => {
    seedData();
    setDogs(getDogs());
  }, []);

  const breeds = Array.from(new Set(dogs.map(d => d.breed)));

  const filtered = dogs.filter(d => {
    if (gender !== "all" && d.gender !== gender) return false;
    if (breed !== "all" && d.breed !== breed) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = `${d.name} ${d.callName} ${d.kennelName} ${d.certificateId} ${d.sireName} ${d.damName} ${d.color}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading eyebrow="Búsqueda de ejemplares" title="Explora más de 29,000 ejemplares verificados" description="Busca por nombre, criadero, padre, madre, color o número de registro ABCI." />

      <Card className="mt-8">
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Prueba 'KHABIT', 'FIGHTING BULL' o 29601..." />
          <select value={gender} onChange={e => setGender(e.target.value as "all" | "male" | "female")} className="h-11 px-3 rounded-xl border border-border bg-background text-sm">
            <option value="all">Ambos sexos</option>
            <option value="male">♂ Macho</option>
            <option value="female">♀ Hembra</option>
          </select>
          <select value={breed} onChange={e => setBreed(e.target.value)} className="h-11 px-3 rounded-xl border border-border bg-background text-sm">
            <option value="all">Todas las razas</option>
            {breeds.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>{filtered.length} ejemplares encontrados</span>
          <span className="text-xs">Mostrando resultados del registro público</span>
        </div>
      </Card>

      <div className="mt-6 space-y-3">
        {filtered.map(d => (
          <Link key={d.id} href={`/ejemplar/${d.id}`} className="block">
            <Card className="hover:border-amber-500/40 transition flex items-center gap-4">
              <DogAvatar name={d.name} size="md" color={d.gender === "male" ? "indigo" : "rose"} photoUrl={d.photo} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{d.name}</p>
                  <Badge>{d.gender === "male" ? "♂" : "♀"}</Badge>
                  <Badge>{d.breed}{d.variant ? ` · ${d.variant}` : ""}</Badge>
                  <Badge variant="accent">{d.color}</Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-1">Nro. de registro {d.certificateId}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {d.kennelName && `${d.kennelName} · `}{calculateAge(d.dob)} · Nac. {formatShortDate(d.dob)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Padre: <span className="text-foreground">{d.sireName || "—"}</span> · Madre: <span className="text-foreground">{d.damName || "—"}</span></p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <Card className="text-center py-12">
            <Search className="w-9 h-9 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
            <p className="font-semibold">Sin coincidencias</p>
            <p className="text-sm text-muted-foreground mt-1">Prueba ajustando los filtros o quitando algunas palabras de la búsqueda.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
