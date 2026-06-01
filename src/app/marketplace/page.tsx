"use client";

import { useEffect, useState } from "react";
import { getMarketplace, seedData } from "@/lib/store";
import type { MarketplaceListing } from "@/lib/types";
import { Card, Badge, Input, SectionHeading, LinkButton } from "@/components/ui";
import { currency, formatShortDate } from "@/lib/utils";
import Link from "next/link";

const TYPES = [
  { value: "all", label: "All", icon: "🛒" },
  { value: "puppy", label: "Puppies", icon: "🐶" },
  { value: "adult", label: "Adults", icon: "🐕" },
  { value: "stud", label: "Stud Service", icon: "🦮" },
  { value: "equipment", label: "Equipment", icon: "📿" },
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
        <SectionHeading eyebrow="Marketplace" title="Verified-pedigree marketplace" description="Every listing is tied to a real BPKC certificate. No more guessing." />
        <LinkButton href="/dashboard/listings" variant="accent">+ Create listing</LinkButton>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search puppies, kennels, locations..." />
          <div className="flex gap-2 overflow-x-auto">
            {TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)}
                className={`shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-medium transition ${type === t.value ? "bg-foreground text-background" : "border border-border hover:bg-muted"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(l => (
          <Card key={l.id} className="group hover:border-amber-500/40 transition cursor-pointer relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-rose-500/10 flex items-center justify-center text-7xl mb-4 relative overflow-hidden">
              {l.image}
              <Badge variant="accent" className="absolute top-3 left-3">{l.type.toUpperCase()}</Badge>
            </div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-snug line-clamp-2">{l.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{l.description}</p>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-amber-600">{currency(l.price, l.currency)}</p>
                <p className="text-xs text-muted-foreground">{l.location}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">{l.sellerName}</p>
                <p className="text-[10px] text-muted-foreground">{formatShortDate(l.posted)}</p>
              </div>
            </div>
            {l.pedigreeId && (
              <Link href={`/certificate/${l.pedigreeId}`} className="block mt-3 text-xs text-amber-600 hover:underline font-mono">
                ✓ Pedigree: {l.pedigreeId}
              </Link>
            )}
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No listings match your filters.</p>
      )}
    </div>
  );
}
