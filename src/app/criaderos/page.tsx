import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, SectionHeading } from "@/components/ui";
import { Star, ShieldCheck, Dog as DogIcon } from "lucide-react";
import { slugify } from "@/lib/utils";
import { CriaderosFilters } from "./CriaderosFilters";

function escapeForOrFilter(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/[%_,()]/g, c => `\\${c}`);
}

export default async function CriaderosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const country = params.country || "all";

  const supabase = await createClient();

  let query = supabase.from("kennels").select("*").order("dog_count", { ascending: false });
  if (country !== "all") query = query.eq("location", country);
  if (q) {
    const esc = escapeForOrFilter(q);
    query = query.or(`kennel_name.ilike.%${esc}%,breeder_name.ilike.%${esc}%`);
  }
  const { data: kennels } = await query.limit(300);

  const { data: countryRows } = await supabase
    .from("kennels")
    .select("location")
    .not("location", "is", null);
  const countries = Array.from(new Set((countryRows || []).map(r => r.location).filter(Boolean) as string[])).sort();

  const list = kennels || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeading eyebrow="Directorio de criaderos" title="Criaderos verificados en Latinoamérica" description="Explora criaderos con al menos un ejemplar registrado en ABCI World Wide." />

      <CriaderosFilters initialQuery={q} initialCountry={country} countries={countries} />

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(k => (
          <Card key={k.kennel_name} className="hover:border-amber-500/40 transition">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold text-xl">
                {k.kennel_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/criaderos/${slugify(k.kennel_name || "")}`} className="font-semibold hover:text-amber-500 line-clamp-1">{k.kennel_name}</Link>
                <p className="text-xs text-muted-foreground line-clamp-1">{k.breeder_name}{k.location ? ` · ${k.location}` : ""}</p>
                {(k.dog_count ?? 0) >= 10 && (
                  <div className="mt-1.5">
                    <Badge variant="accent"><Star className="w-3 h-3 fill-current" /> Criadero destacado</Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><DogIcon className="w-3 h-3" /> {k.dog_count} registrados</span>
              {k.owner_id && <span className="inline-flex items-center gap-1 text-emerald-500"><ShieldCheck className="w-3 h-3" /> Cuenta verificada</span>}
            </div>
          </Card>
        ))}
        {list.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-12">No se encontraron criaderos con esos filtros.</p>
        )}
      </div>
    </div>
  );
}
