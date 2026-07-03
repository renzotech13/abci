"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Input, Select } from "@/components/ui";

const DEBOUNCE_MS = 250;

export function AfijosFilters({
  initialQuery, initialCountry, countries, resultCount,
}: {
  initialQuery: string;
  initialCountry: string;
  countries: string[];
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [queryInput, setQueryInput] = useState(initialQuery);

  function pushParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(next.toString() ? `${pathname}?${next.toString()}` : pathname);
  }

  useEffect(() => {
    const current = searchParams.get("q") || "";
    if (queryInput === current) return;
    const t = setTimeout(() => pushParams({ q: queryInput || undefined }), DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  return (
    <Card className="mt-8">
      <div className="grid md:grid-cols-[1fr_auto] gap-3">
        <Input value={queryInput} onChange={e => setQueryInput(e.target.value)} placeholder="Buscar por nombre del afijo, dueño o especialidad..." />
        <Select value={initialCountry} onChange={e => pushParams({ country: e.target.value === "all" ? undefined : e.target.value })}>
          <option value="all">Todos los países</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>
      <p className="text-sm text-muted-foreground mt-3">{resultCount} afijos registrados</p>
    </Card>
  );
}
