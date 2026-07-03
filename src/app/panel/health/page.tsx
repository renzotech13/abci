"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, Button, Input, Label, Select, Badge, Empty } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import {
  Syringe, Stethoscope, FlaskConical, Pill, Scale, ClipboardList,
  Plus, Trash2,
} from "lucide-react";

type Dog = Tables<"dogs">;
type HealthRecord = Tables<"health_records">;

const TYPES = [
  { value: "vaccination", label: "Vacunación", Icon: Syringe },
  { value: "checkup", label: "Chequeo", Icon: Stethoscope },
  { value: "test", label: "Análisis / Diagnóstico", Icon: FlaskConical },
  { value: "treatment", label: "Tratamiento", Icon: Pill },
  { value: "weight", label: "Control de peso", Icon: Scale },
  { value: "other", label: "Otro", Icon: ClipboardList },
];

export default function HealthVaultPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filterDog, setFilterDog] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    dogId: "", type: "vaccination" as HealthRecord["type"], title: "", date: "", vet: "", notes: "",
  });

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { data: myDogs } = await supabase.from("dogs").select("*").eq("owner_id", data.user.id);
    setDogs(myDogs ?? []);
    const dogIds = (myDogs ?? []).map(d => d.id);
    if (dogIds.length === 0) { setRecords([]); return; }
    const { data: recs } = await supabase.from("health_records").select("*").in("dog_id", dogIds);
    setRecords(recs ?? []);
  }

  useEffect(() => { refresh(); }, []);

  const filtered = filterDog ? records.filter(r => r.dog_id === filterDog) : records;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    await supabase.from("health_records").insert({
      dog_id: form.dogId, type: form.type, title: form.title, date: form.date,
      vet: form.vet || null, notes: form.notes || null,
    });
    setCreating(false);
    setForm({ dogId: "", type: "vaccination", title: "", date: "", vet: "", notes: "" });
    refresh();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("health_records").delete().eq("id", id);
    refresh();
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bóveda de salud</h1>
          <p className="text-sm text-muted-foreground mt-1">Todos los registros veterinarios, vacunas y análisis en un solo lugar seguro.</p>
        </div>
        {!creating && <Button variant="accent" onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Agregar registro</Button>}
      </div>

      {creating && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold">Nuevo registro de salud</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="d">Ejemplar</Label>
                <Select id="d" required value={form.dogId} onChange={e => setForm({ ...form, dogId: e.target.value })}>
                  <option value="">Selecciona el ejemplar...</option>
                  {dogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="t">Tipo</Label>
                <Select id="t" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as HealthRecord["type"] })}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tt">Título</Label>
              <Input id="tt" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ej: Refuerzo anual quíntuple" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dt">Fecha</Label>
                <Input id="dt" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="v">Veterinario / Clínica</Label>
                <Input id="v" value={form.vet} onChange={e => setForm({ ...form, vet: e.target.value })} placeholder="Dra. Sara Lin" />
              </div>
            </div>
            <div>
              <Label htmlFor="n">Notas</Label>
              <Input id="n" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button type="submit" variant="accent">Guardar registro</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mb-4">
        <Select value={filterDog} onChange={e => setFilterDog(e.target.value)} className="max-w-xs">
          <option value="">Filtrar por ejemplar: Todos</option>
          {dogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Empty title="Sin registros de salud" description="Agrega vacunas, chequeos y análisis para construir el historial veterinario completo de tu ejemplar." />
      ) : (
        <div className="space-y-3">
          {[...filtered].sort((a, b) => b.date.localeCompare(a.date)).map(r => {
            const dog = dogs.find(d => d.id === r.dog_id);
            const t = TYPES.find(x => x.value === r.type);
            const Icon = t?.Icon || ClipboardList;
            return (
              <Card key={r.id} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{r.title}</p>
                    <Badge>{t?.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium text-foreground">{dog?.name}</span> · {formatDate(r.date)}{r.vet && ` · ${r.vet}`}
                  </p>
                  {r.notes && <p className="text-sm text-muted-foreground mt-2">{r.notes}</p>}
                </div>
                <Button onClick={() => handleDelete(r.id)} variant="ghost" size="sm" className="text-rose-500"><Trash2 className="w-3.5 h-3.5" /></Button>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
