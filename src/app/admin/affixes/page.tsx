"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/adminLog";
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types";
import { Card, Badge, Button, Input, Select } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";
import {
  Tag, Search, Trash2, ShieldCheck, Eye, Edit3, X, Save,
} from "lucide-react";

type Affix = Tables<"affixes">;

export default function AdminAffixesPage() {
  const [affixes, setAffixes] = useState<Affix[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [editing, setEditing] = useState<Affix | null>(null);

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase.from("affixes").select("*").order("name");
    setAffixes(data ?? []);
  }

  useEffect(() => { refresh(); }, []);

  const countries = Array.from(new Set(affixes.map(a => a.country).filter(Boolean)));

  const filtered = affixes.filter(a => {
    if (country !== "all" && a.country !== country) return false;
    if (query && !`${a.name} ${a.owner_name} ${a.specialty}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  async function handleDelete(a: Affix) {
    if (!confirm(`¿Eliminar el afijo ${a.name}? Esta acción no se puede deshacer.`)) return;
    const supabase = createClient();
    await supabase.from("affixes").delete().eq("id", a.id);
    await logAdminAction(supabase, "Afijo eliminado", a.name);
    refresh();
  }

  async function saveEdit() {
    if (!editing) return;
    const supabase = createClient();
    const patch: TablesUpdate<"affixes"> = {
      name: editing.name, specialty: editing.specialty, description: editing.description,
    };
    await supabase.from("affixes").update(patch).eq("id", editing.id);
    await logAdminAction(supabase, "Afijo actualizado", editing.name);
    setEditing(null);
    refresh();
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
          <Tag className="w-7 h-7 text-amber-500" /> Afijos registrados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{affixes.length} afijos oficiales en {countries.length} países.</p>
      </div>

      <Card className="mb-6">
        <div className="grid md:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar afijo, propietario o especialidad..." className="pl-9 font-mono" />
          </div>
          <Select value={country} onChange={e => setCountry(e.target.value)}>
            <option value="all">Todos los países</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </Select>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(a => (
          <Card key={a.id} className="hover:border-amber-500/40 transition">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center">
                <Tag className="w-6 h-6" />
              </div>
              <Badge variant="success"><ShieldCheck className="w-3 h-3" /> Activo</Badge>
            </div>
            <h3 className="font-mono font-bold text-lg mt-4">{a.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{a.affix_code}</p>
            {a.specialty && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{a.specialty}</p>}
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <span>{a.owner_name}</span>
              <span>{a.country}</span>
            </div>
            <div className="mt-4 flex gap-1">
              <Link href={`/afijos/${a.id}`} className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border text-xs hover:bg-muted">
                <Eye className="w-3.5 h-3.5" /> Ver
              </Link>
              <button onClick={() => setEditing(a)} className="h-9 px-3 inline-flex items-center justify-center rounded-lg border border-border hover:bg-muted">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(a)} className="h-9 px-3 inline-flex items-center justify-center rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">Registrado {formatShortDate(a.created_at)}</p>
          </Card>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <Card className="max-w-md w-full" >
            <div onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Editar afijo</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted inline-flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Nombre del afijo</label>
                  <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value.toUpperCase() })} className="font-mono" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Especialidad</label>
                  <Input value={editing.specialty || ""} onChange={e => setEditing({ ...editing, specialty: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Descripción</label>
                  <Input value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">Cancelar</Button>
                  <Button variant="accent" onClick={saveEdit} className="flex-1"><Save className="w-4 h-4" /> Guardar</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
