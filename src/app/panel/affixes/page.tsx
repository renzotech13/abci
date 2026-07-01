"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getAffixes, getCurrentUser, addAffix } from "@/lib/store";
import type { Affix, User } from "@/lib/types";
import { Card, Button, Input, Label, Badge, Empty, LinkButton } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";
import { Plus, Tag, ShieldCheck } from "lucide-react";

export default function MyAffixesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [affixes, setAffixes] = useState<Affix[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", specialty: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) setAffixes(getAffixes().filter(a => a.ownerId === u.id));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const exists = getAffixes().find(a => a.name.toUpperCase() === form.name.toUpperCase());
    if (exists) {
      setError("Ese afijo ya está registrado en ABCI. Elige otro nombre único.");
      return;
    }
    addAffix({
      name: form.name.toUpperCase(),
      ownerId: user.id,
      ownerName: user.name,
      country: user.country || "",
      description: form.description,
      specialty: form.specialty,
    });
    setCreating(false);
    setForm({ name: "", description: "", specialty: "" });
    setError("");
    setAffixes(getAffixes().filter(a => a.ownerId === user.id));
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mis afijos</h1>
          <p className="text-sm text-muted-foreground mt-1">El afijo es el nombre único de tu criadero, antepuesto a cada ejemplar que registras.</p>
        </div>
        {!creating && <Button variant="accent" onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Registrar afijo</Button>}
      </div>

      {creating && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold">Registrar nuevo afijo</h2>
            <div>
              <Label htmlFor="n">Nombre del afijo</Label>
              <Input id="n" required value={form.name} onChange={e => { setForm({ ...form, name: e.target.value.toUpperCase() }); setError(""); }} placeholder="FIGHTING BULL" className="font-mono" />
              <p className="text-xs text-muted-foreground mt-1">Usa MAYÚSCULAS. Será único e irrepetible en todo ABCI World Wide.</p>
            </div>
            <div>
              <Label htmlFor="s">Especialidad</Label>
              <Input id="s" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} placeholder="American Bully — Pocket / Standard" />
            </div>
            <div>
              <Label htmlFor="d">Descripción del criadero</Label>
              <Input id="d" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Breve descripción de tu enfoque de cría" />
            </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button type="submit" variant="accent">Registrar afijo</Button>
            </div>
          </form>
        </Card>
      )}

      {affixes.length === 0 ? (
        !creating && <Empty
          title="Aún no tienes afijos registrados"
          description="Registra tu afijo para proteger el nombre de tu criadero en toda Latinoamérica."
          action={<Button onClick={() => setCreating(true)} variant="accent">Registrar mi primer afijo</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {affixes.map(a => (
            <Card key={a.id}>
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Tag className="w-7 h-7 text-amber-500" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono font-bold text-lg">{a.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{a.affixId}</p>
                  <Badge variant="success" className="mt-2"><ShieldCheck className="w-3 h-3" /> Activo</Badge>
                  {a.specialty && <p className="text-sm text-muted-foreground mt-3">{a.specialty}</p>}
                  <p className="text-xs text-muted-foreground mt-2">Registrado el {formatShortDate(a.createdAt)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <LinkButton href={`/afijos/${a.id}`} variant="outline" size="sm">Ver perfil público</LinkButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
