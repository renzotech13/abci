"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { addDog, getMyDogs, addLitter, getLitters } from "@/lib/store";
import type { Dog, Litter } from "@/lib/types";
import { Card, Button, Input, Label, Select, Badge, Empty } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";

type Puppy = { name: string; gender: "male" | "female"; color: string };

const COLORS = ["Solid Black", "Blue", "Blue Tri", "Chocolate", "Chocolate Tri", "Lilac", "Merle Blue", "Champagne", "Brindle", "Fawn"];

export default function LitterPage() {
  const router = useRouter();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [creating, setCreating] = useState(false);
  const [sireId, setSireId] = useState("");
  const [damId, setDamId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [puppies, setPuppies] = useState<Puppy[]>([
    { name: "", gender: "male", color: "Solid Black" },
  ]);

  useEffect(() => {
    setDogs(getMyDogs());
    setLitters(getLitters());
  }, []);

  const males = dogs.filter(d => d.gender === "male");
  const females = dogs.filter(d => d.gender === "female");

  function addPuppy() { setPuppies([...puppies, { name: "", gender: "male", color: "Solid Black" }]); }
  function removePuppy(i: number) { setPuppies(puppies.filter((_, idx) => idx !== i)); }
  function updatePuppy(i: number, patch: Partial<Puppy>) {
    setPuppies(puppies.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sire = dogs.find(d => d.id === sireId);
    const dam = dogs.find(d => d.id === damId);
    if (!sire || !dam) return;
    const puppyIds: string[] = [];
    for (const p of puppies) {
      if (!p.name) continue;
      const dog = addDog({
        name: p.name,
        breed: sire.breed,
        variant: sire.variant,
        gender: p.gender,
        color: p.color,
        dob: birthDate,
        sireId: sire.id,
        damId: dam.id,
        sireName: sire.name,
        damName: dam.name,
        kennelName: sire.kennelName,
      });
      puppyIds.push(dog.id);
    }
    addLitter({
      ownerId: sire.ownerId,
      sireId: sire.id,
      damId: dam.id,
      birthDate,
      puppyIds,
    });
    router.push("/dashboard/dogs");
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Litter Registration</h1>
          <p className="text-sm text-muted-foreground mt-1">Register up to 12 puppies at once with auto-linked sire & dam.</p>
        </div>
        {!creating && <Button variant="accent" onClick={() => setCreating(true)}>+ New litter</Button>}
      </div>

      {creating ? (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sire">Sire (must be male)</Label>
                <Select id="sire" required value={sireId} onChange={e => setSireId(e.target.value)}>
                  <option value="">Select sire...</option>
                  {males.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="dam">Dam (must be female)</Label>
                <Select id="dam" required value={damId} onChange={e => setDamId(e.target.value)}>
                  <option value="">Select dam...</option>
                  {females.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="bd">Litter birth date</Label>
              <Input id="bd" type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Puppies ({puppies.length})</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addPuppy}>+ Add puppy</Button>
              </div>
              <div className="space-y-2">
                {puppies.map((p, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 rounded-xl border border-border bg-muted/30">
                    <Input placeholder={`Puppy #${i + 1} name`} value={p.name} onChange={e => updatePuppy(i, { name: e.target.value })} />
                    <Select value={p.gender} onChange={e => updatePuppy(i, { gender: e.target.value as "male" | "female" })} className="sm:w-32">
                      <option value="male">♂ Male</option>
                      <option value="female">♀ Female</option>
                    </Select>
                    <Select value={p.color} onChange={e => updatePuppy(i, { color: e.target.value })} className="sm:w-44">
                      {COLORS.map(c => <option key={c}>{c}</option>)}
                    </Select>
                    {puppies.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePuppy(i)} className="text-rose-600 sm:w-12">✕</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit" variant="accent">Register litter</Button>
            </div>
          </form>
        </Card>
      ) : litters.length === 0 ? (
        <Empty
          title="No litters registered yet"
          description="Register an entire litter at once — saves you hours."
          action={<Button variant="accent" onClick={() => setCreating(true)}>Register a litter</Button>}
        />
      ) : (
        <div className="space-y-3">
          {litters.map(l => (
            <Card key={l.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Litter born {formatShortDate(l.birthDate)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{l.puppyIds.length} puppies registered</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
