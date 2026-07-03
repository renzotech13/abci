"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { LinkButton, Card, Badge, Empty, Input, Button } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import Link from "next/link";
import { formatShortDate, calculateAge } from "@/lib/utils";
import { Plus, Trophy, Trash2, Eye, FileText } from "lucide-react";

type Dog = Tables<"dogs">;

export default function MyDogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [query, setQuery] = useState("");
  const [filterGender, setFilterGender] = useState<"all" | "male" | "female">("all");

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { data: rows } = await supabase.from("dogs").select("*").eq("owner_id", data.user.id);
    setDogs(rows ?? []);
  }

  useEffect(() => { refresh(); }, []);

  const filtered = dogs.filter(d => {
    if (filterGender !== "all" && d.gender !== filterGender) return false;
    if (query && !`${d.name} ${d.call_name} ${d.certificate_id} ${d.color}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar a ${name} de tu criadero? Esta acción no se puede deshacer.`)) return;
    const supabase = createClient();
    await supabase.from("dogs").delete().eq("id", id);
    refresh();
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mis ejemplares</h1>
          <p className="text-sm text-muted-foreground mt-1">{dogs.length} registrados · {dogs.filter(d => d.gender === "male").length} machos · {dogs.filter(d => d.gender === "female").length} hembras</p>
        </div>
        <LinkButton href="/panel/dogs/add" variant="accent"><Plus className="w-4 h-4" /> Registrar nuevo</LinkButton>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre, nro. de registro, color..." />
          <div className="flex gap-2">
            {(["all", "male", "female"] as const).map(g => (
              <button
                key={g}
                onClick={() => setFilterGender(g)}
                className={`h-11 px-4 rounded-xl text-sm font-medium transition ${filterGender === g ? "bg-amber-500 text-black" : "border border-border hover:bg-muted"}`}
              >
                {g === "all" ? "Todos" : g === "male" ? "♂ Machos" : "♀ Hembras"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Empty
          title={dogs.length === 0 ? "Aún no hay ejemplares" : "Ningún ejemplar coincide con la búsqueda"}
          description={dogs.length === 0 ? "Obtén tu primer certificado ABCI en menos de 5 minutos." : "Prueba con otra búsqueda o filtro."}
          action={dogs.length === 0 ? <LinkButton href="/panel/dogs/add" variant="accent">Registrar ejemplar</LinkButton> : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(d => (
            <Card key={d.id} className="hover:border-amber-500/40 transition">
              <div className="flex items-start gap-4">
                <DogAvatar name={d.name} size="lg" color={d.gender === "male" ? "indigo" : "rose"} photoUrl={d.photo_url ?? undefined} />
                <div className="flex-1 min-w-0">
                  <Link href={`/ejemplar/${d.id}`} className="font-semibold text-lg hover:text-amber-500">{d.name}</Link>
                  {d.call_name && <p className="text-sm text-muted-foreground">&quot;{d.call_name}&quot;</p>}
                  <p className="text-xs text-muted-foreground font-mono mt-1">Nro. {d.certificate_id}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge>{d.gender === "male" ? "♂ Macho" : "♀ Hembra"}</Badge>
                    <Badge>{d.variant || d.breed}</Badge>
                    {d.color && <Badge variant="accent">{d.color}</Badge>}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <p>{d.dob ? `Edad: ${calculateAge(d.dob)} · Nac. ${formatShortDate(d.dob)}` : "Fecha de nacimiento no registrada"}</p>
                    {d.titles && d.titles.length > 0 && (
                      <p className="mt-1 inline-flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-500" /> {d.titles.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                <LinkButton href={`/ejemplar/${d.id}`} variant="outline" size="sm"><Eye className="w-3.5 h-3.5" /> Ver</LinkButton>
                <LinkButton href={`/certificado/${d.certificate_id}`} variant="outline" size="sm"><FileText className="w-3.5 h-3.5" /> Certificado</LinkButton>
                <Button onClick={() => handleDelete(d.id, d.name)} variant="ghost" size="sm" className="text-rose-500 ml-auto"><Trash2 className="w-3.5 h-3.5" /> Eliminar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
