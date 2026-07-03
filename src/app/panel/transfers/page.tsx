"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import { approveTransfer } from "@/lib/transfers";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, Button, Input, Label, Select, Badge, Empty } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";
import { Plus, Clock, CheckCircle2, XCircle } from "lucide-react";

type Dog = Tables<"dogs">;
type Transfer = Tables<"transfers">;

export default function TransfersPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [creating, setCreating] = useState(false);
  const [dogId, setDogId] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [notes, setNotes] = useState("");

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    setUserId(data.user.id);
    const { data: myDogs } = await supabase.from("dogs").select("*").eq("owner_id", data.user.id);
    setDogs(myDogs ?? []);
    const { data: myTransfers } = await supabase.from("transfers").select("*").eq("from_user_id", data.user.id);
    setTransfers(myTransfers ?? []);
  }

  useEffect(() => { refresh(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dog = dogs.find(d => d.id === dogId);
    if (!dog || !userId) return;
    const supabase = createClient();
    await supabase.from("transfers").insert({ dog_id: dogId, from_user_id: userId, to_email: toEmail, notes: notes || null });
    setCreating(false);
    setDogId(""); setToEmail(""); setNotes("");
    refresh();
  }

  async function approve(t: Transfer) {
    const supabase = createClient();
    await approveTransfer(supabase, t);
    refresh();
  }

  async function cancel(id: string) {
    const supabase = createClient();
    await supabase.from("transfers").update({ status: "rejected" }).eq("id", id);
    refresh();
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Traspasos de propiedad</h1>
          <p className="text-sm text-muted-foreground mt-1">Transfiere la titularidad de cualquier ejemplar registrado mediante correo electrónico.</p>
        </div>
        {!creating && <Button variant="accent" onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Nuevo traspaso</Button>}
      </div>

      {creating && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold">Iniciar traspaso</h2>
            <div>
              <Label htmlFor="d">Ejemplar</Label>
              <Select id="d" required value={dogId} onChange={e => setDogId(e.target.value)}>
                <option value="">Selecciona el ejemplar a traspasar...</option>
                {dogs.map(d => <option key={d.id} value={d.id}>{d.name} — Nro. {d.certificate_id}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="e">Correo del nuevo propietario</Label>
              <Input id="e" type="email" required value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="nuevo-dueno@ejemplo.com" />
              <p className="text-xs text-muted-foreground mt-1">Si el destinatario ya tiene cuenta ABCI, la titularidad se reasigna automáticamente al aprobar.</p>
            </div>
            <div>
              <Label htmlFor="n">Notas</Label>
              <Input id="n" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Mensaje opcional" />
            </div>
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button type="submit" variant="accent">Enviar solicitud</Button>
            </div>
          </form>
        </Card>
      )}

      {transfers.length === 0 ? (
        !creating && <Empty title="Sin traspasos aún" description="Cuando transfieras la propiedad de un ejemplar, el historial aparecerá aquí." />
      ) : (
        <div className="space-y-3">
          {transfers.map(t => {
            const dog = dogs.find(d => d.id === t.dog_id);
            return (
              <Card key={t.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{dog?.name || "Ejemplar"}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">Nro. {dog?.certificate_id}</p>
                    <p className="text-sm mt-2">Para: <span className="font-medium">{t.to_email}</span></p>
                    <p className="text-xs text-muted-foreground">Solicitado el {formatShortDate(t.requested_at)}</p>
                    {t.notes && <p className="text-sm text-muted-foreground mt-2 italic">&quot;{t.notes}&quot;</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={t.status === "approved" ? "success" : t.status === "rejected" ? "default" : "warning"}>
                      {t.status === "pending" ? <><Clock className="w-3 h-3" /> Pendiente</> : t.status === "approved" ? <><CheckCircle2 className="w-3 h-3" /> Aprobado</> : <><XCircle className="w-3 h-3" /> Rechazado</>}
                    </Badge>
                    {t.status === "pending" && (
                      <div className="flex gap-2">
                        <Button onClick={() => cancel(t.id)} variant="ghost" size="sm">Cancelar</Button>
                        <Button onClick={() => approve(t)} variant="accent" size="sm">Aprobar</Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
