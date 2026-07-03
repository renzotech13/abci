"use client";

import { useState } from "react";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, Badge, SectionHeading } from "@/components/ui";
import { EventRegisterButton } from "./EventRegisterButton";
import { Trophy, Users, Swords, Tent, MapPin, CheckCircle2 } from "lucide-react";

type Event = Tables<"events">;

const TYPE_META = {
  show: { label: "Exhibición", Icon: Trophy, tone: "bg-amber-500/15 text-amber-500" },
  meetup: { label: "Encuentro", Icon: Users, tone: "bg-emerald-500/15 text-emerald-500" },
  competition: { label: "Competencia", Icon: Swords, tone: "bg-rose-500/15 text-rose-500" },
  expo: { label: "Expo", Icon: Tent, tone: "bg-indigo-500/15 text-indigo-500" },
} as const;

export function EventsList({ events, registeredIds }: { events: Event[]; registeredIds: string[] }) {
  const [filter, setFilter] = useState<string>("all");
  const registered = new Set(registeredIds);

  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);
  const filterLabels: Record<string, string> = { all: "Todos los eventos", show: "Exhibiciones", competition: "Competencias", expo: "Expos", meetup: "Encuentros" };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading eyebrow="Calendario de eventos" title="Exhibiciones, expos y encuentros en toda Latinoamérica" description="El calendario más completo de eventos bully — inscríbete con un clic." />

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {(["all", "show", "competition", "expo", "meetup"] as const).map(f => {
          const Icon = f === "all" ? null : TYPE_META[f].Icon;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium transition whitespace-nowrap ${filter === f ? "bg-amber-500 text-black" : "border border-border hover:bg-muted"}`}>
              {Icon && <Icon className="w-4 h-4" />} {filterLabels[f]}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        {filtered.map(e => {
          const meta = TYPE_META[e.type as keyof typeof TYPE_META] ?? TYPE_META.show;
          const d = new Date(e.date);
          const isRegistered = registered.has(e.id);
          return (
            <Card key={e.id} className="hover:border-amber-500/40 transition">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="text-center shrink-0">
                  <div className="rounded-2xl border border-border bg-muted p-3 w-20">
                    <p className="text-xs uppercase font-semibold text-amber-500">{d.toLocaleDateString("es-PE", { month: "short" })}</p>
                    <p className="text-3xl font-bold">{d.getDate()}</p>
                    <p className="text-xs text-muted-foreground">{d.getFullYear()}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.tone}`}>
                      <meta.Icon className="w-3 h-3" /> {meta.label}
                    </span>
                    {isRegistered && <Badge variant="success"><CheckCircle2 className="w-3 h-3" /> Inscrito</Badge>}
                  </div>
                  <h3 className="text-lg font-bold mt-2">{e.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {e.location} — {e.city}, {e.country}
                  </p>
                  <p className="text-sm mt-3">{e.description}</p>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  <EventRegisterButton eventId={e.id} initialRegistered={isRegistered} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
