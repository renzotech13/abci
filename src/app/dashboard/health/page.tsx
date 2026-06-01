"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getMyDogs, getHealthRecords, addHealthRecord, deleteHealthRecord } from "@/lib/store";
import type { Dog, HealthRecord } from "@/lib/types";
import { Card, Button, Input, Label, Select, Badge, Empty } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const TYPES = [
  { value: "vaccination", label: "Vaccination", icon: "💉" },
  { value: "checkup", label: "Checkup", icon: "🩺" },
  { value: "test", label: "Test / Diagnostic", icon: "🧪" },
  { value: "treatment", label: "Treatment", icon: "💊" },
  { value: "weight", label: "Weight check", icon: "⚖️" },
  { value: "other", label: "Other", icon: "📋" },
];

export default function HealthVaultPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filterDog, setFilterDog] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    dogId: "", type: "vaccination" as HealthRecord["type"], title: "", date: "", vet: "", notes: "",
  });

  useEffect(() => {
    setDogs(getMyDogs());
    refresh();
  }, []);

  function refresh() { setRecords(getHealthRecords()); }

  const filtered = filterDog ? records.filter(r => r.dogId === filterDog) : records;
  const myDogIds = new Set(dogs.map(d => d.id));
  const visible = filtered.filter(r => myDogIds.has(r.dogId));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addHealthRecord(form);
    setCreating(false);
    setForm({ dogId: "", type: "vaccination", title: "", date: "", vet: "", notes: "" });
    refresh();
  }

  function handleDelete(id: string) {
    deleteHealthRecord(id);
    refresh();
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Health Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">All vet records, vaccinations and tests in one secure place.</p>
        </div>
        {!creating && <Button variant="accent" onClick={() => setCreating(true)}>+ Add record</Button>}
      </div>

      {creating && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold">New health record</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="d">Dog</Label>
                <Select id="d" required value={form.dogId} onChange={e => setForm({ ...form, dogId: e.target.value })}>
                  <option value="">Select dog...</option>
                  {dogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="t">Type</Label>
                <Select id="t" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as HealthRecord["type"] })}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tt">Title</Label>
              <Input id="tt" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., DHPP Annual Booster" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dt">Date</Label>
                <Input id="dt" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="v">Vet / Clinic</Label>
                <Input id="v" value={form.vet} onChange={e => setForm({ ...form, vet: e.target.value })} placeholder="Dr. Sarah Lin" />
              </div>
            </div>
            <div>
              <Label htmlFor="n">Notes</Label>
              <Input id="n" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit" variant="accent">Save record</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mb-4">
        <Select value={filterDog} onChange={e => setFilterDog(e.target.value)} className="max-w-xs">
          <option value="">Filter by dog: All</option>
          {dogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </div>

      {visible.length === 0 ? (
        <Empty title="No health records" description="Add vaccinations, checkups, and test results to build the dog's full health story." />
      ) : (
        <div className="space-y-3">
          {visible.sort((a, b) => b.date.localeCompare(a.date)).map(r => {
            const dog = dogs.find(d => d.id === r.dogId);
            const t = TYPES.find(x => x.value === r.type);
            return (
              <Card key={r.id} className="flex items-start gap-4">
                <div className="text-3xl">{t?.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{r.title}</p>
                    <Badge>{t?.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium text-foreground">{dog?.name}</span> • {formatDate(r.date)}{r.vet && ` • ${r.vet}`}
                  </p>
                  {r.notes && <p className="text-sm text-muted-foreground mt-2">{r.notes}</p>}
                </div>
                <Button onClick={() => handleDelete(r.id)} variant="ghost" size="sm" className="text-rose-600">Delete</Button>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
