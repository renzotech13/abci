"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { addDog, getMyDogs, addLitter, getLitters } from "@/lib/store";
import type { Dog, Litter } from "@/lib/types";
import { Card, Button, Input, Label, Select, Badge, Empty } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";
import { Plus, X, Users2 } from "lucide-react";

type Puppy = { name: string; gender: "male" | "female"; color: string };

const COLORS = ["Negro sólido", "Azul", "Azul tri", "Chocolate", "Chocolate tri", "Lila", "Merle azul", "Champagne", "Atigrado", "Leonado"];

export default function LitterPage() {
  const router = useRouter();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [creating, setCreating] = useState(false);
  const [sireId, setSireId] = useState("");
  const [damId, setDamId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [puppies, setPuppies] = useState<Puppy[]>([
    { name: "", gender: "male", color: "Negro sólido" },
  ]);

  useEffect(() => {
    setDogs(getMyDogs());
    setLitters(getLitters());
  }, []);

  const males = dogs.filter(d => d.gender === "male");
  const females = dogs.filter(d => d.gender === "female");

  function addPuppy() { setPuppies([...puppies, { name: "", gender: "male", color: "Negro sólido" }]); }
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
        name: p.name.toUpperCase(),
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
        breederName: sire.breederName,
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
    router.push("/panel/dogs");
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Registro de camada</h1>
          <p className="text-sm text-muted-foreground mt-1">Inscribe hasta 12 cachorros a la vez con padres vinculados automáticamente.</p>
        </div>
        {!creating && <Button variant="accent" onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Nueva camada</Button>}
      </div>

      {creating ? (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sire">Padre (debe ser macho)</Label>
                <Select id="sire" required value={sireId} onChange={e => setSireId(e.target.value)}>
                  <option value="">Selecciona el padre...</option>
                  {males.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="dam">Madre (debe ser hembra)</Label>
                <Select id="dam" required value={damId} onChange={e => setDamId(e.target.value)}>
                  <option value="">Selecciona la madre...</option>
                  {females.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="bd">Fecha de nacimiento de la camada</Label>
              <Input id="bd" type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Cachorros ({puppies.length})</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addPuppy}><Plus className="w-3.5 h-3.5" /> Agregar</Button>
              </div>
              <div className="space-y-2">
                {puppies.map((p, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 rounded-xl border border-border bg-muted/30">
                    <Input placeholder={`Cachorro #${i + 1} — nombre`} value={p.name} onChange={e => updatePuppy(i, { name: e.target.value })} />
                    <Select value={p.gender} onChange={e => updatePuppy(i, { gender: e.target.value as "male" | "female" })} className="sm:w-32">
                      <option value="male">♂ Macho</option>
                      <option value="female">♀ Hembra</option>
                    </Select>
                    <Select value={p.color} onChange={e => updatePuppy(i, { color: e.target.value })} className="sm:w-44">
                      {COLORS.map(c => <option key={c}>{c}</option>)}
                    </Select>
                    {puppies.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePuppy(i)} className="text-rose-500 sm:w-12"><X className="w-4 h-4" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button type="submit" variant="accent">Registrar camada</Button>
            </div>
          </form>
        </Card>
      ) : litters.length === 0 ? (
        <Empty
          title="Aún no has registrado camadas"
          description="Inscribe una camada completa de una sola vez — te ahorra horas."
          action={<Button variant="accent" onClick={() => setCreating(true)}>Registrar una camada</Button>}
        />
      ) : (
        <div className="space-y-3">
          {litters.map(l => (
            <Card key={l.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Users2 className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Camada nacida el {formatShortDate(l.birthDate)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{l.puppyIds.length} cachorros registrados</p>
                  </div>
                </div>
                <Badge variant="success">Activa</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
