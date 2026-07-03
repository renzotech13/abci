import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, SectionHeading, LinkButton } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import { calculateAge, formatShortDate } from "@/lib/utils";
import { Search, ChevronRight } from "lucide-react";
import { SearchControls } from "./SearchControls";

const PAGE_SIZE = 24;

function escapeForOrFilter(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/[%_,()]/g, c => `\\${c}`);
}

export default async function EjemplaresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; gender?: string; breed?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const gender = params.gender === "male" || params.gender === "female" ? params.gender : "all";
  const breed = params.breed || "all";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const rangeEnd = page * PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("dogs")
    .select("*", { count: "exact" })
    .order("registration_date", { ascending: false });

  if (gender !== "all") query = query.eq("gender", gender);
  if (breed !== "all") query = query.eq("breed", breed);
  if (q) {
    const esc = escapeForOrFilter(q);
    query = query.or(
      [
        `name.ilike.%${esc}%`,
        `kennel_name.ilike.%${esc}%`,
        `certificate_id.ilike.%${esc}%`,
        `sire_name.ilike.%${esc}%`,
        `dam_name.ilike.%${esc}%`,
        `color.ilike.%${esc}%`,
      ].join(","),
    );
  }

  const { data: dogs, count } = await query.range(0, rangeEnd);
  const { data: breedRows } = await supabase.from("dogs").select("breed").order("breed");
  const breeds = Array.from(new Set((breedRows || []).map(r => r.breed))).sort();

  const totalCount = count ?? 0;
  const list = dogs ?? [];

  const loadMoreParams = new URLSearchParams();
  if (q) loadMoreParams.set("q", q);
  if (gender !== "all") loadMoreParams.set("gender", gender);
  if (breed !== "all") loadMoreParams.set("breed", breed);
  loadMoreParams.set("page", String(page + 1));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading
        eyebrow="Búsqueda de ejemplares"
        title={`Explora ${totalCount.toLocaleString("es-PE")} ejemplares verificados`}
        description="Busca por nombre, criadero, padre, madre, color o número de registro ABCI."
      />

      <SearchControls initialQuery={q} initialGender={gender} initialBreed={breed} breeds={breeds} resultCount={totalCount} />

      <div className="mt-6 space-y-3">
        {list.map(d => (
          <Link key={d.id} href={`/ejemplar/${d.id}`} className="block group">
            <Card className="flex items-center gap-4 transition-all duration-200 hover:border-amber-500/40 hover:shadow-elevation-2 hover:-translate-y-0.5 cursor-pointer">
              <DogAvatar name={d.name} size="md" color={d.gender === "male" ? "indigo" : "rose"} photoUrl={d.photo_url ?? undefined} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{d.name}</p>
                  <Badge>{d.gender === "male" ? "♂" : "♀"}</Badge>
                  <Badge>{d.breed}{d.variant ? ` · ${d.variant}` : ""}</Badge>
                  {d.color && <Badge variant="accent">{d.color}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-1">Nro. de registro {d.certificate_id}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {d.kennel_name && `${d.kennel_name} · `}
                  {d.dob ? `${calculateAge(d.dob)} · Nac. ${formatShortDate(d.dob)}` : "Fecha de nacimiento no registrada"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Padre: <span className="text-foreground">{d.sire_name || "—"}</span> · Madre: <span className="text-foreground">{d.dam_name || "—"}</span></p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
            </Card>
          </Link>
        ))}
        {list.length === 0 && (
          <Card className="text-center py-12">
            <Search className="w-9 h-9 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
            <p className="font-semibold">Sin coincidencias</p>
            <p className="text-sm text-muted-foreground mt-1">Prueba ajustando los filtros o quitando algunas palabras de la búsqueda.</p>
          </Card>
        )}
        {totalCount > list.length && (
          <div className="pt-2 text-center">
            <LinkButton variant="outline" href={`?${loadMoreParams.toString()}`}>
              Cargar más ({totalCount - list.length} restantes)
            </LinkButton>
          </div>
        )}
      </div>
    </div>
  );
}
