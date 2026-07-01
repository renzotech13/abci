"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { addDog, getCurrentUser } from "@/lib/store";
import { Button, Input, Label, Card, Select } from "@/components/ui";
import { PhotoUpload } from "@/components/PhotoUpload";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

const BREEDS = ["American Bully", "American Pitbull Terrier", "American Staffordshire Terrier", "Staffordshire Bull Terrier", "Bull Terrier", "Bulldog Inglés", "Bulldog Francés", "Olde English Bulldogge"];
const VARIANTS = ["Pocket", "Standard", "XL", "Classic", "Extreme", "Micro"];
const COLORS = ["Negro sólido", "Azul", "Azul tri", "Chocolate", "Chocolate tri", "Lila", "Lila tri", "Merle azul", "Champagne", "Atigrado", "Leonado", "Blanco", "Negro y blanco"];

export default function AddDogPage() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? getCurrentUser() : null;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", callName: "", breed: "American Bully", variant: "Standard",
    gender: "male" as "male" | "female", color: "Negro sólido",
    weight: "", height: "", dob: "", microchip: "",
    sireName: "", damName: "",
    kennelName: user?.kennelName || "",
    breederName: user?.name || "",
    location: "",
    notes: "",
    photo: undefined as string | undefined,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dog = addDog({
      name: form.name.toUpperCase(),
      callName: form.callName,
      breed: form.breed,
      variant: form.variant,
      gender: form.gender,
      color: form.color,
      weight: form.weight ? Number(form.weight) : undefined,
      height: form.height ? Number(form.height) : undefined,
      dob: form.dob,
      microchip: form.microchip,
      sireName: form.sireName,
      damName: form.damName,
      kennelName: form.kennelName,
      breederName: form.breederName,
      location: form.location,
      notes: form.notes,
      photo: form.photo,
    });
    router.push(`/certificado/${dog.certificateId}?new=1`);
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Registrar un ejemplar</h1>
        <p className="text-sm text-muted-foreground mt-1">Paso {step} de 3 — Genera el certificado ABCI en minutos</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(n => (
          <div key={n} className={`flex-1 h-1.5 rounded-full ${step >= n ? "bg-amber-500" : "bg-muted"}`} />
        ))}
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Información general</h2>
              <div>
                <Label>Foto del ejemplar <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <PhotoUpload value={form.photo} onChange={photo => setForm({ ...form, photo })} />
                <p className="text-xs text-muted-foreground mt-1.5">Se mostrará en el perfil, el certificado y el árbol genealógico.</p>
              </div>
              <div>
                <Label htmlFor="name">Nombre de registro (con afijo)</Label>
                <Input id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="FIGHTING BULL MILI" />
                <p className="text-xs text-muted-foreground mt-1">Usa MAYÚSCULAS y antepone el afijo del criadero</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="callName">Nombre de llamada</Label>
                  <Input id="callName" value={form.callName} onChange={e => setForm({ ...form, callName: e.target.value })} placeholder="Mili" />
                </div>
                <div>
                  <Label htmlFor="kennel">Nombre del criadero</Label>
                  <Input id="kennel" value={form.kennelName} onChange={e => setForm({ ...form, kennelName: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="breed">Raza</Label>
                  <Select id="breed" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })}>
                    {BREEDS.map(b => <option key={b}>{b}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="variant">Variante</Label>
                  <Select id="variant" value={form.variant} onChange={e => setForm({ ...form, variant: e.target.value })}>
                    {VARIANTS.map(v => <option key={v}>{v}</option>)}
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Detalles físicos</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Sexo</Label>
                  <div className="flex gap-2">
                    {(["male", "female"] as const).map(g => (
                      <button type="button" key={g} onClick={() => setForm({ ...form, gender: g })}
                        className={`flex-1 h-11 px-4 rounded-xl text-sm font-medium border transition ${form.gender === g ? "bg-amber-500 text-black border-amber-500" : "border-border hover:bg-muted"}`}>
                        {g === "male" ? "♂ Macho" : "♀ Hembra"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select id="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}>
                    {COLORS.map(c => <option key={c}>{c}</option>)}
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dob">Fecha de nacimiento</Label>
                  <Input id="dob" type="date" required value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input id="weight" type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input id="height" type="number" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="micro">Nro. de microchip</Label>
                <Input id="micro" value={form.microchip} onChange={e => setForm({ ...form, microchip: e.target.value })} placeholder="15 dígitos del microchip" />
              </div>
              <div>
                <Label htmlFor="loc">Ubicación del ejemplar</Label>
                <Input id="loc" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Lima, Perú" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Información familiar</h2>
              <p className="text-sm text-muted-foreground">Escribe los nombres de los padres. Si ya están registrados en ABCI, podrás vincularlos después.</p>
              <div>
                <Label htmlFor="sire">Padre</Label>
                <Input id="sire" value={form.sireName} onChange={e => setForm({ ...form, sireName: e.target.value.toUpperCase() })} placeholder="FIGHTING BULL KHABIT" />
              </div>
              <div>
                <Label htmlFor="dam">Madre</Label>
                <Input id="dam" value={form.damName} onChange={e => setForm({ ...form, damName: e.target.value.toUpperCase() })} placeholder="FIGHTING BULL CARACHAMA" />
              </div>
              <div>
                <Label htmlFor="breeder">Nombre del criador</Label>
                <Input id="breeder" value={form.breederName} onChange={e => setForm({ ...form, breederName: e.target.value })} placeholder="Anthony Cristhian Huamán Quiroz" />
              </div>
              <div>
                <Label htmlFor="notes">Notas adicionales</Label>
                <textarea id="notes" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none" placeholder="Títulos, características, etc." />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4" /> Atrás</Button>
            ) : <span />}
            {step < 3 ? (
              <Button type="button" variant="accent" onClick={() => setStep(step + 1)}>Continuar <ArrowRight className="w-4 h-4" /></Button>
            ) : (
              <Button type="submit" variant="accent"><Sparkles className="w-4 h-4" /> Generar certificado</Button>
            )}
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
