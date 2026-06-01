"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { addDog, getCurrentUser } from "@/lib/store";
import { Button, Input, Label, Card, Select } from "@/components/ui";

const BREEDS = ["American Bully", "American Pitbull Terrier", "American Staffordshire Terrier", "Staffordshire Bull Terrier", "Bull Terrier", "English Bulldog", "French Bulldog", "Olde English Bulldogge"];
const VARIANTS = ["Pocket", "Standard", "XL", "Classic", "Extreme", "Micro"];
const COLORS = ["Solid Black", "Blue", "Blue Tri", "Chocolate", "Chocolate Tri", "Lilac", "Lilac Tri", "Merle Blue", "Champagne", "Brindle", "Fawn", "White", "Black & White"];

export default function AddDogPage() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? getCurrentUser() : null;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", callName: "", breed: "American Bully", variant: "Standard",
    gender: "male" as "male" | "female", color: "Solid Black",
    weight: "", height: "", dob: "", microchip: "",
    sireName: "", damName: "",
    kennelName: user?.kennelName || "",
    notes: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dog = addDog({
      name: form.name,
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
      notes: form.notes,
    });
    router.push(`/certificate/${dog.certificateId}?new=1`);
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Register a dog</h1>
        <p className="text-sm text-muted-foreground mt-1">Step {step} of 3 — Create a BPKC certificate in minutes</p>
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
              <h2 className="text-lg font-semibold">Basic info</h2>
              <div>
                <Label htmlFor="name">Registered name</Label>
                <Input id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Crown's Diesel Prime" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="callName">Call name</Label>
                  <Input id="callName" value={form.callName} onChange={e => setForm({ ...form, callName: e.target.value })} placeholder="Diesel" />
                </div>
                <div>
                  <Label htmlFor="kennel">Kennel name</Label>
                  <Input id="kennel" value={form.kennelName} onChange={e => setForm({ ...form, kennelName: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Select id="breed" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })}>
                    {BREEDS.map(b => <option key={b}>{b}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="variant">Variant</Label>
                  <Select id="variant" value={form.variant} onChange={e => setForm({ ...form, variant: e.target.value })}>
                    {VARIANTS.map(v => <option key={v}>{v}</option>)}
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Physical details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Gender</Label>
                  <div className="flex gap-2">
                    {(["male", "female"] as const).map(g => (
                      <button type="button" key={g} onClick={() => setForm({ ...form, gender: g })}
                        className={`flex-1 h-11 px-4 rounded-xl text-sm font-medium border transition ${form.gender === g ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}>
                        {g === "male" ? "♂ Male" : "♀ Female"}
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
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input id="dob" type="date" required value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input id="weight" type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="height">Height (in)</Label>
                  <Input id="height" type="number" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="micro">Microchip ID</Label>
                <Input id="micro" value={form.microchip} onChange={e => setForm({ ...form, microchip: e.target.value })} placeholder="15-digit microchip number" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Lineage</h2>
              <p className="text-sm text-muted-foreground">Enter parent names. If parents are already registered, you can link them later.</p>
              <div>
                <Label htmlFor="sire">Sire (father)</Label>
                <Input id="sire" value={form.sireName} onChange={e => setForm({ ...form, sireName: e.target.value })} placeholder="CH Black Zeus" />
              </div>
              <div>
                <Label htmlFor="dam">Dam (mother)</Label>
                <Input id="dam" value={form.damName} onChange={e => setForm({ ...form, damName: e.target.value })} placeholder="CH Silver Luna" />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea id="notes" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none" placeholder="Additional notes (titles, traits, etc.)" />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>← Back</Button>
            ) : <span />}
            {step < 3 ? (
              <Button type="button" variant="accent" onClick={() => setStep(step + 1)}>Continue →</Button>
            ) : (
              <Button type="submit" variant="accent">Generate certificate 🎉</Button>
            )}
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
