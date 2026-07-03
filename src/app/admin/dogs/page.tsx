"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/adminLog";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, Badge, Button, Input, Select } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";
import {
  Dog as DogIcon, Search, Download, Trash2, Eye, FileText,
  ChevronLeft, ChevronRight, Filter, X,
} from "lucide-react";

type Dog = Tables<"dogs">;
const PAGE_SIZE = 12;

function escapeForOrFilter(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/[%_,()]/g, c => `\\${c}`);
}

export default function AdminDogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [breed, setBreed] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function refresh() {
    const supabase = createClient();

    let q = supabase.from("dogs").select("*", { count: "exact" }).order("registration_date", { ascending: false });
    if (gender !== "all") q = q.eq("gender", gender);
    if (breed !== "all") q = q.eq("breed", breed);
    if (query) {
      const esc = escapeForOrFilter(query);
      q = q.or(`name.ilike.%${esc}%,kennel_name.ilike.%${esc}%,certificate_id.ilike.%${esc}%,call_name.ilike.%${esc}%`);
    }
    const { data, count } = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    setDogs(data ?? []);
    setFilteredCount(count ?? 0);
    setSelected(new Set());
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.from("dogs").select("*", { count: "exact", head: true }).then(({ count }) => setTotalCount(count ?? 0));
    supabase.from("dogs").select("breed").then(({ data }) => {
      setBreeds(Array.from(new Set((data ?? []).map(r => r.breed))).sort());
    });
  }, []);

  useEffect(() => { refresh(); }, [page, gender, breed, query]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }
  function toggleAllVisible() {
    if (dogs.every(d => selected.has(d.id))) {
      const next = new Set(selected);
      dogs.forEach(d => next.delete(d.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      dogs.forEach(d => next.add(d.id));
      setSelected(next);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar ${name} del registro?`)) return;
    const supabase = createClient();
    await supabase.from("dogs").delete().eq("id", id);
    await logAdminAction(supabase, "Ejemplar eliminado", name);
    refresh();
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`¿Eliminar ${selected.size} ejemplares del registro? Esta acción no se puede deshacer.`)) return;
    const supabase = createClient();
    await supabase.from("dogs").delete().in("id", Array.from(selected));
    await logAdminAction(supabase, "Eliminación masiva", undefined, `${selected.size} ejemplares`);
    refresh();
  }

  async function exportSelected() {
    const supabase = createClient();
    let list: Dog[];
    if (selected.size > 0) {
      list = dogs.filter(d => selected.has(d.id));
    } else {
      let q = supabase.from("dogs").select("*").order("registration_date", { ascending: false });
      if (gender !== "all") q = q.eq("gender", gender);
      if (breed !== "all") q = q.eq("breed", breed);
      if (query) {
        const esc = escapeForOrFilter(query);
        q = q.or(`name.ilike.%${esc}%,kennel_name.ilike.%${esc}%,certificate_id.ilike.%${esc}%,call_name.ilike.%${esc}%`);
      }
      const { data } = await q;
      list = data ?? [];
    }
    const rows = list.map(d => ({
      "Nro. de registro": d.certificate_id,
      "Nombre": d.name,
      "Llamada": d.call_name || "",
      "Raza": d.breed,
      "Variante": d.variant || "",
      "Sexo": d.gender === "male" ? "Macho" : "Hembra",
      "Color": d.color,
      "Peso (kg)": d.weight || "",
      "Altura (cm)": d.height || "",
      "Nacimiento": d.dob,
      "Microchip": d.microchip || "",
      "Padre": d.sire_name || "",
      "Madre": d.dam_name || "",
      "Criadero": d.kennel_name || "",
      "Criador": d.breeder_name || "",
      "Ubicación": d.location || "",
      "Estado": d.status,
      "Registrado": d.registration_date,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ejemplares");
    XLSX.writeFile(wb, `abci-ejemplares-${new Date().toISOString().slice(0, 10)}.xlsx`);
    await logAdminAction(supabase, "Exportación de ejemplares", undefined, `${list.length} ejemplares`);
  }

  const allVisibleSelected = dogs.length > 0 && dogs.every(d => selected.has(d.id));

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
            <DogIcon className="w-7 h-7 text-amber-500" /> Ejemplares
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{totalCount.toLocaleString("es-PE")} ejemplares totales · {filteredCount.toLocaleString("es-PE")} en vista actual</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportSelected}>
            <Download className="w-4 h-4" /> Exportar {selected.size > 0 ? `(${selected.size})` : "Excel"}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Buscar por nombre, criadero, nro. de registro..." className="pl-9" />
          </div>
          <Select value={gender} onChange={e => { setGender(e.target.value as "all" | "male" | "female"); setPage(1); }}>
            <option value="all">Ambos sexos</option>
            <option value="male">♂ Macho</option>
            <option value="female">♀ Hembra</option>
          </Select>
          <Select value={breed} onChange={e => { setBreed(e.target.value); setPage(1); }}>
            <option value="all">Todas las razas</option>
            {breeds.map(b => <option key={b}>{b}</option>)}
          </Select>
        </div>
      </Card>

      {selected.size > 0 && (
        <Card className="mb-6 border-amber-500/40 bg-amber-500/5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-medium">{selected.size} seleccionado{selected.size > 1 ? "s" : ""}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}><X className="w-3.5 h-3.5" /> Limpiar</Button>
              <Button variant="ghost" size="sm" onClick={exportSelected} className="text-amber-500"><Download className="w-3.5 h-3.5" /> Exportar</Button>
              <Button variant="ghost" size="sm" onClick={bulkDelete} className="text-rose-500"><Trash2 className="w-3.5 h-3.5" /> Eliminar</Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} className="w-4 h-4 rounded accent-amber-500" />
                </th>
                <th className="text-left px-4 py-3">Ejemplar</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Raza</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Criadero</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Registrado</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dogs.map(d => (
                <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggle(d.id)} className="w-4 h-4 rounded accent-amber-500" />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/ejemplar/${d.id}`} className="font-medium hover:text-amber-500">{d.name}</Link>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge>{d.gender === "male" ? "♂" : "♀"}</Badge>
                      <Badge>Nro. {d.certificate_id}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell">
                    <p>{d.breed}</p>
                    <p className="text-muted-foreground">{d.variant} · {d.color}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{d.kennel_name || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{formatShortDate(d.registration_date)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Link href={`/ejemplar/${d.id}`} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted" title="Ver">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/certificado/${d.certificate_id}`} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted" title="Certificado">
                        <FileText className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(d.id, d.name)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-rose-500" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {dogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    Sin resultados. Prueba con otros filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredCount > PAGE_SIZE && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
