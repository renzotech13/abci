"use client";

import { useEffect, useState } from "react";
import { getMarketplace, seedData } from "@/lib/store";
import type { MarketplaceListing } from "@/lib/types";
import { Card, Badge, Input, SectionHeading, LinkButton } from "@/components/ui";
import { currency, formatShortDate } from "@/lib/utils";
import Link from "next/link";
import {
  ShoppingBag, Baby, Dog as DogIcon, Heart, Package, Plus, ShieldCheck,
} from "lucide-react";

const TYPES = [
  { value: "all", label: "Todos", Icon: ShoppingBag },
  { value: "puppy", label: "Cachorros", Icon: Baby },
  { value: "adult", label: "Adultos", Icon: DogIcon },
  { value: "stud", label: "Monta", Icon: Heart },
  { value: "equipment", label: "Equipo", Icon: Package },
];

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    seedData();
    setListings(getMarketplace());
  }, []);

  const filtered = listings.filter(l => {
    if (type !== "all" && l.type !== type) return false;
    if (query && !`${l.title} ${l.description} ${l.location} ${l.sellerName}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <SectionHeading eyebrow="Mercado" title="Mercado con pedigree verificado" description="Cada anuncio está respaldado por un certificado ABCI real. Sin sorpresas." />
        <LinkButton href="/panel/listings" variant="accent"><Plus className="w-4 h-4" /> Crear anuncio</LinkButton>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar cachorros, criaderos, ubicación..." />
          <div className="flex gap-2 overflow-x-auto">
            {TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)}
                className={`shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-medium transition whitespace-nowrap ${type === t.value ? "bg-amber-500 text-black" : "border border-border hover:bg-muted"}`}>
                <t.Icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(l => {
          const TypeIcon = TYPES.find(t => t.value === l.type)?.Icon || ShoppingBag;
          return (
            <Card key={l.id} className="group hover:border-amber-500/40 transition cursor-pointer relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-zinc-900/20 flex items-center justify-center mb-4 relative overflow-hidden">
                <TypeIcon className="w-20 h-20 text-amber-500/70" strokeWidth={1.25} />
                <Badge variant="accent" className="absolute top-3 left-3">{l.type.toUpperCase()}</Badge>
              </div>
              <h3 className="font-semibold leading-snug line-clamp-2">{l.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{l.description}</p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-amber-500">{currency(l.price, l.currency)}</p>
                  <p className="text-xs text-muted-foreground">{l.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{l.sellerName}</p>
                  <p className="text-[10px] text-muted-foreground">{formatShortDate(l.posted)}</p>
                </div>
              </div>
              {l.pedigreeId && (
                <Link href={`/certificado/${l.pedigreeId}`} className="mt-3 inline-flex items-center gap-1 text-xs text-amber-500 hover:underline font-mono">
                  <ShieldCheck className="w-3 h-3" /> Pedigree ABCI Nro. {l.pedigreeId}
                </Link>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No hay anuncios que coincidan con tu búsqueda.</p>
      )}
    </div>
  );
}
