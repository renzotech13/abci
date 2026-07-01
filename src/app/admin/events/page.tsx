"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getEvents, adminSaveEvent, adminDeleteEvent, logAdminAction } from "@/lib/store";
import type { Event } from "@/lib/types";
import { Card, Badge, Button, Input, Label, Select, Textarea } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";
import { generateId } from "@/lib/utils";
import {
  CalendarDays, Plus, Trash2, Edit3, X, Save, Trophy,
  Users, Swords, Tent, MapPin,
} from "lucide-react";

const TYPE_META = {
  show: { label: "Exhibición", Icon: Trophy },
  meetup: { label: "Encuentro", Icon: Users },
  competition: { label: "Competencia", Icon: Swords },
  expo: { label: "Expo", Icon: Tent },
} as const;

function emptyEvent(): Event {
  return {
    id: generateId("E-"),
    title: "",
    date: "",
    location: "",
    city: "",
    country: "",
    type: "show",
    description: "",
  };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editing, setEditing] = useState<Event | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { refresh(); }, []);
  function refresh() { setEvents(getEvents().sort((a, b) => a.date.localeCompare(b.date))); }

  function handleSave() {
    if (!editing) return;
    if (!editing.title || !editing.date) {
      alert("El título y la fecha son obligatorios.");
      return;
    }
    adminSaveEvent(editing);
    logAdminAction(isNew ? "Evento creado" : "Evento actualizado", editing.title);
    setEditing(null);
    setIsNew(false);
    refresh();
  }

  function handleDelete(e: Event) {
    if (!confirm(`¿Eliminar el evento "${e.title}"?`)) return;
    adminDeleteEvent(e.id);
    logAdminAction("Evento eliminado", e.title);
    refresh();
  }

  function openNew() {
    setEditing(emptyEvent());
    setIsNew(true);
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-amber-500" /> Eventos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{events.length} eventos programados.</p>
        </div>
        <Button variant="accent" onClick={openNew}><Plus className="w-4 h-4" /> Nuevo evento</Button>
      </div>

      <div className="space-y-3">
        {events.map(e => {
          const meta = TYPE_META[e.type];
          const d = new Date(e.date);
          return (
            <Card key={e.id} className="hover:border-amber-500/40 transition">
              <div className="flex items-start gap-5">
                <div className="text-center shrink-0">
                  <div className="rounded-xl border border-border bg-muted p-3 w-20">
                    <p className="text-xs uppercase font-semibold text-amber-500">{d.toLocaleDateString("es-PE", { month: "short" })}</p>
                    <p className="text-3xl font-bold">{d.getDate()}</p>
                    <p className="text-xs text-muted-foreground">{d.getFullYear()}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="accent"><meta.Icon className="w-3 h-3" /> {meta.label}</Badge>
                  </div>
                  <h3 className="font-bold">{e.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {e.location} — {e.city}, {e.country}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{e.description}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => { setEditing(e); setIsNew(false); }} className="w-9 h-9 rounded-lg hover:bg-muted inline-flex items-center justify-center" title="Editar">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(e)} className="w-9 h-9 rounded-lg hover:bg-rose-500/10 text-rose-500 inline-flex items-center justify-center" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <Card className="max-w-lg w-full my-8">
            <div onClick={evt => evt.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{isNew ? "Nuevo evento" : "Editar evento"}</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted inline-flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Título</Label>
                  <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value as Event["type"] })}>
                      <option value="show">Exhibición</option>
                      <option value="competition">Competencia</option>
                      <option value="expo">Expo</option>
                      <option value="meetup">Encuentro</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Fecha</Label>
                    <Input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label>Sede / Lugar</Label>
                  <Input value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} placeholder="Ej: Centro de Convenciones Jockey Plaza" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Ciudad</Label>
                    <Input value={editing.city} onChange={e => setEditing({ ...editing, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>País</Label>
                    <Input value={editing.country} onChange={e => setEditing({ ...editing, country: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">Cancelar</Button>
                  <Button variant="accent" onClick={handleSave} className="flex-1"><Save className="w-4 h-4" /> Guardar</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
