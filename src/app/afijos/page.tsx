import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, SectionHeading } from "@/components/ui";
import { Tag, ShieldCheck, Search } from "lucide-react";
import { AfijosFilters } from "./AfijosFilters";

function escapeForOrFilter(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/[%_,()]/g, c => `\\${c}`);
}

export default async function AfijosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const country = params.country || "all";

  const supabase = await createClient();
  let query = supabase.from("affixes").select("*").order("name");
  if (country !== "all") query = query.eq("country", country);
  if (q) {
    const esc = escapeForOrFilter(q);
    query = query.or(`name.ilike.%${esc}%,owner_name.ilike.%${esc}%,specialty.ilike.%${esc}%`);
  }
  const { data: affixes } = await query;

  const { data: countryRows } = await supabase.from("affixes").select("country").not("country", "is", null);
  const countries = Array.from(new Set((countryRows || []).map(r => r.country).filter(Boolean) as string[])).sort();

  const list = affixes || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeading eyebrow="Afijos registrados" title="Directorio oficial de afijos ABCI" description="Cada criadero registra un afijo único e irrepetible que antepone al nombre de sus ejemplares. Aquí están todos los afijos oficiales." />

      <AfijosFilters initialQuery={q} initialCountry={country} countries={countries} resultCount={list.length} />

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(a => (
          <Link key={a.id} href={`/afijos/${a.affix_code}`}>
            <Card className="hover:border-amber-500/40 transition h-full">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center">
                  <Tag className="w-7 h-7" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono font-bold text-base leading-tight">{a.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{a.affix_code}</p>
                  <Badge variant="success" className="mt-2"><ShieldCheck className="w-3 h-3" /> Activo</Badge>
                </div>
              </div>
              {a.specialty && <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{a.specialty}</p>}
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                <span>{a.owner_name}</span>
                <span>{a.country}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {list.length === 0 && (
        <Card className="text-center py-12 mt-6">
          <Search className="w-9 h-9 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
          <p className="font-semibold">No se encontraron afijos</p>
          <p className="text-sm text-muted-foreground mt-1">Prueba ajustando los filtros.</p>
        </Card>
      )}
    </div>
  );
}
