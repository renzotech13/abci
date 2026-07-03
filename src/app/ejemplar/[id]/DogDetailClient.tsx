"use client";

import { useState } from "react";
import { Card, Badge, LinkButton, SectionHeading } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PedigreeTree } from "@/components/PedigreeTree";
import { formatDate, calculateAge } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/database.types";
import {
  ShieldCheck, Trophy, FileText, Edit3, Plus,
} from "lucide-react";
import { updateDogPhoto } from "./actions";

type Dog = Tables<"dogs">;

export function DogDetailClient({ dog: initialDog, canManage }: { dog: Dog; canManage: boolean }) {
  const [dog, setDog] = useState(initialDog);
  const [tab, setTab] = useState<"overview" | "pedigree" | "health" | "siblings">("overview");

  async function handlePhotoChange(photo: string | undefined) {
    setDog(d => ({ ...d, photo_url: photo ?? null }));
    const res = await updateDogPhoto(dog.id, photo);
    if (!res.ok) setDog(initialDog); // revertir si no se pudo persistir
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {canManage ? (
            <PhotoUpload value={dog.photo_url ?? undefined} onChange={handlePhotoChange} size="xl" />
          ) : (
            <DogAvatar name={dog.name} size="xl" color={dog.gender === "male" ? "indigo" : "rose"} photoUrl={dog.photo_url ?? undefined} />
          )}
          <div className="flex-1 min-w-0">
            <Badge variant="success" className="mb-3"><ShieldCheck className="w-3 h-3" /> Certificado ABCI verificado</Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">{dog.name}</h1>
            {dog.call_name && <p className="text-lg text-muted-foreground mt-0.5">Llamado &quot;{dog.call_name}&quot;</p>}
            <p className="font-mono text-sm text-muted-foreground mt-2">Nro. de registro {dog.certificate_id}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{dog.gender === "male" ? "♂ Macho" : "♀ Hembra"}</Badge>
              <Badge>{dog.breed}</Badge>
              {dog.variant && <Badge>{dog.variant}</Badge>}
              {dog.color && <Badge variant="accent">{dog.color}</Badge>}
              {dog.titles?.map(t => <Badge key={t} variant="warning"><Trophy className="w-3 h-3" /> {t}</Badge>)}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <LinkButton href={`/certificado/${dog.certificate_id}`} variant="accent"><FileText className="w-4 h-4" /> Ver certificado</LinkButton>
            {canManage && <LinkButton href={`/panel/dogs`} variant="outline" size="sm"><Edit3 className="w-3.5 h-3.5" /> Editar</LinkButton>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border overflow-x-auto">
        {([
          ["overview", "Información"],
          ["pedigree", "Pedigree"],
          ["health", "Salud"],
          ["siblings", "Hermanos"],
        ] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap cursor-pointer ${tab === t ? "border-amber-500 text-amber-500" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid md:grid-cols-3 gap-5">
            <Card className="md:col-span-2">
              <h3 className="font-semibold mb-4">Información general</h3>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <Row label="Fecha de nacimiento" value={dog.dob ? formatDate(dog.dob) : "No registrada"} />
                <Row label="Edad" value={dog.dob ? calculateAge(dog.dob) : "—"} />
                <Row label="Peso" value={dog.weight ? `${dog.weight} kg` : "—"} />
                <Row label="Altura" value={dog.height ? `${dog.height} cm` : "—"} />
                <Row label="Microchip" value={dog.microchip || "—"} mono />
                <Row label="Criadero" value={dog.kennel_name || "—"} />
                <Row label="Criador" value={dog.breeder_name || "—"} />
                <Row label="Ubicación" value={dog.location || "—"} />
                <Row label="Fecha de registro" value={formatDate(dog.registration_date)} />
                <Row label="Estado" value={dog.status === "active" ? "ACTIVO" : dog.status.toUpperCase()} />
              </div>
              {dog.notes && (
                <>
                  <h3 className="font-semibold mt-6 mb-2">Notas</h3>
                  <p className="text-sm text-muted-foreground">{dog.notes}</p>
                </>
              )}
            </Card>
            <Card>
              <h3 className="font-semibold mb-4">Información familiar</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Padre</p>
                  <p className="font-semibold text-sm mt-0.5">{dog.sire_name || "Desconocido"}</p>
                </div>
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Madre</p>
                  <p className="font-semibold text-sm mt-0.5">{dog.dam_name || "Desconocida"}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "pedigree" && (
          <Card>
            <SectionHeading title="Pedigree de 4 generaciones" description="Haz clic sobre los padres para ver su propio pedigree." />
            <div className="mt-6">
              <PedigreeTree dog={dog} />
            </div>
          </Card>
        )}

        {tab === "health" && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Bóveda de salud</h3>
              {canManage && <LinkButton href="/panel/health" variant="outline" size="sm"><Plus className="w-3.5 h-3.5" /> Agregar registro</LinkButton>}
            </div>
            <p className="text-sm text-muted-foreground">Aún no hay registros de salud para este ejemplar.</p>
          </Card>
        )}

        {tab === "siblings" && (
          <Card>
            <h3 className="font-semibold mb-4">Hermanos de camada</h3>
            <p className="text-sm text-muted-foreground">Los ejemplares que comparten padre y madre aparecen aquí.</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
                Búsqueda de hermanos próximamente
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}
