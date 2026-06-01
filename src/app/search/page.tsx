"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDogs, seedData } from "@/lib/store";
import type { Dog } from "@/lib/types";
import { Card, Input, Badge, SectionHeading } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import { calculateAge, formatShortDate } from "@/lib/utils";

export default function SearchPage() {
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
      <SectionHeading eyebrow="Pedigree Search" title="Explore 847,000+ verified bullies" description="Search by registered name, kennel, sire, dam, color or certificate ID." />

      <Card className="mt-8">
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Try 'Zeus', 'Crown', or BPX-2025-DIESEL-01..." />
          <select value={gender} onChange={e => setGender(e.target.value as "all" | "male" | "female")} className="h-11 px-3 rounded-xl border border-border bg-background text-sm">
            <option value="all">All genders</option>
            <option value="male">♂ Male</option>
            <option value="female">♀ Female</option>
          </select>
          <select value={breed} onChange={e => setBreed(e.target.value)} className="h-11 px-3 rounded-xl border border-border bg-background text-sm">
            <option value="all">All breeds</option>
            {breeds.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>{filtered.length} dogs found</span>
          <span className="text-xs">Showing local + public registry results</span>
        </div>
      </Card>

      <div className="mt-6 space-y-3">
        {filtered.map(d => (
          <Link key={d.id} href={`/dogs/${d.id}`} className="block">
            <Card className="hover:border-amber-500/40 transition flex items-center gap-4">
              <DogAvatar name={d.name} size="md" color={d.gender === "male" ? "indigo" : "rose"} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{d.name}</p>
                  <Badge>{d.gender === "male" ? "♂" : "♀"}</Badge>
                  <Badge>{d.breed}{d.variant ? ` • ${d.variant}` : ""}</Badge>
                  <Badge variant="accent">{d.color}</Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-1">{d.certificateId}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {d.kennelName && `${d.kennelName} • `}{calculateAge(d.dob)} • Born {formatShortDate(d.dob)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Sire: <span className="text-foreground">{d.sireName || "—"}</span> • Dam: <span className="text-foreground">{d.damName || "—"}</span></p>
              </div>
              <span className="text-muted-foreground">→</span>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold">No matches</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting filters or removing the search term.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
