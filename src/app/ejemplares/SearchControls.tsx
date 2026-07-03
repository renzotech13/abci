"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Input, Select } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

const DEBOUNCE_MS = 250;

export function SearchControls({
  initialQuery, initialGender, initialBreed, breeds, resultCount,
}: {
  initialQuery: string;
  initialGender: string;
  initialBreed: string;
  breeds: string[];
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
    const t = setTimeout(() => pushParams({ q: queryInput || undefined, page: undefined }), DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  return (
    <Reveal>
      <Card className="mt-8">
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <Input
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            placeholder="Prueba 'KHABIT', 'FIGHTING BULL' o 29601..."
          />
          <Select
            value={initialGender}
            onChange={e => pushParams({ gender: e.target.value === "all" ? undefined : e.target.value, page: undefined })}
          >
            <option value="all">Ambos sexos</option>
            <option value="male">♂ Macho</option>
            <option value="female">♀ Hembra</option>
          </Select>
          <Select
            value={initialBreed}
            onChange={e => pushParams({ breed: e.target.value === "all" ? undefined : e.target.value, page: undefined })}
          >
            <option value="all">Todas las razas</option>
            {breeds.map(b => <option key={b} value={b}>{b}</option>)}
          </Select>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span className="tabular-nums">{resultCount.toLocaleString("es-PE")} ejemplares encontrados</span>
          <span className="text-xs">Mostrando resultados del registro público</span>
        </div>
      </Card>
    </Reveal>
  );
}
