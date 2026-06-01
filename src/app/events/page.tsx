"use client";

import { useEffect, useState } from "react";
import { getEvents, seedData, toggleEventRegister } from "@/lib/store";
import type { Event } from "@/lib/types";
import { Card, Badge, Button, SectionHeading } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const TYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  show: { label: "Show", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: "🏆" },
  meetup: { label: "Meetup", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: "🤝" },
  competition: { label: "Competition", color: "bg-rose-500/15 text-rose-700 dark:text-rose-400", icon: "⚔️" },
  expo: { label: "Expo", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400", icon: "🎪" },
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    seedData();
    setEvents(getEvents());
  }, []);

  function refresh() { setEvents(getEvents()); }

  function handleToggle(id: string) {
    toggleEventRegister(id);
    refresh();
  }

  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading eyebrow="Events Calendar" title="Shows, expos and meetups worldwide" description="The most complete bully event calendar — register in one click." />

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {["all", "show", "competition", "expo", "meetup"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium transition ${filter === f ? "bg-foreground text-background" : "border border-border hover:bg-muted"}`}>
            {f === "all" ? "All events" : `${TYPE_META[f].icon} ${TYPE_META[f].label}`}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {filtered.map(e => {
          const meta = TYPE_META[e.type];
          const d = new Date(e.date);
          return (
            <Card key={e.id} className="hover:border-amber-500/40 transition">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="text-center shrink-0">
                  <div className="rounded-2xl border border-border bg-muted p-3 w-20">
                    <p className="text-xs uppercase font-semibold text-amber-600">{d.toLocaleDateString("en-US", { month: "short" })}</p>
                    <p className="text-3xl font-bold">{d.getDate()}</p>
                    <p className="text-xs text-muted-foreground">{d.getFullYear()}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                    {e.registered && <Badge variant="success">✓ Registered</Badge>}
                  </div>
                  <h3 className="text-lg font-bold mt-2">{e.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">📍 {e.location} — {e.city}, {e.country}</p>
                  <p className="text-sm mt-3">{e.description}</p>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  <Button onClick={() => handleToggle(e.id)} variant={e.registered ? "outline" : "accent"} size="sm" className="w-full sm:w-auto">
                    {e.registered ? "Cancel registration" : "Register"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
