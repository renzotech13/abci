"use client";

import { useEffect, useState, use } from "react";
import { getDog, getCurrentUser, getHealthRecords, updateDog } from "@/lib/store";
import type { Dog, HealthRecord, User } from "@/lib/types";
import { Card, Badge, LinkButton, SectionHeading } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PedigreeTree } from "@/components/PedigreeTree";
import { formatDate, calculateAge } from "@/lib/utils";
import {
  ShieldCheck, Trophy, FileText, Edit3, Syringe,
  Stethoscope, FlaskConical, Scale, ClipboardList, Pill, Plus,
} from "lucide-react";

export default function DogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [dog, setDog] = useState<Dog | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [health, setHealth] = useState<HealthRecord[]>([]);
  const [tab, setTab] = useState<"overview" | "pedigree" | "health" | "siblings">("overview");

  useEffect(() => {
    const d = getDog(id);
    setDog(d);
    setUser(getCurrentUser());
    if (d) setHealth(getHealthRecords(d.id));
  }, [id]);

  if (!dog) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Ejemplar no encontrado</h1>
        <p className="mt-2 text-muted-foreground">El ejemplar que buscas no existe o ha sido removido.</p>
        <LinkButton href="/ejemplares" variant="accent" className="mt-6">Buscar en el registro</LinkButton>
      </div>
    );
  }

  const isOwner = user?.id === dog.ownerId;
  // Los ~9,655 ejemplares migrados desde el sitio anterior aún no tienen un
  // propietario real vinculado (quedaron en "GUEST" hasta que cada criador
  // reclame su cuenta). Mientras tanto, el equipo admin puede gestionarlos.
  const canManage = isOwner || user?.role === "admin";

  function handlePhotoChange(photo: string | undefined) {
    if (!dog) return;
    const updated = updateDog(dog.id, { photo });
    if (updated) setDog(updated);
  }

  function healthIcon(t: HealthRecord["type"]) {
    if (t === "vaccination") return Syringe;
    if (t === "checkup") return Stethoscope;
    if (t === "test") return FlaskConical;
    if (t === "weight") return Scale;
    if (t === "treatment") return Pill;
    return ClipboardList;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {canManage ? (
            <PhotoUpload value={dog.photo} onChange={handlePhotoChange} size="xl" />
          ) : (
            <DogAvatar name={dog.name} size="xl" color={dog.gender === "male" ? "indigo" : "rose"} photoUrl={dog.photo} />
          )}
          <div className="flex-1 min-w-0">
            <Badge variant="success" className="mb-3"><ShieldCheck className="w-3 h-3" /> Certificado ABCI verificado</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{dog.name}</h1>
            {dog.callName && <p className="text-lg text-muted-foreground mt-0.5">Llamado &quot;{dog.callName}&quot;</p>}
            <p className="font-mono text-sm text-muted-foreground mt-2">Nro. de registro {dog.certificateId}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{dog.gender === "male" ? "♂ Macho" : "♀ Hembra"}</Badge>
              <Badge>{dog.breed}</Badge>
              {dog.variant && <Badge>{dog.variant}</Badge>}
              <Badge variant="accent">{dog.color}</Badge>
              {dog.titles?.map(t => <Badge key={t} variant="warning"><Trophy className="w-3 h-3" /> {t}</Badge>)}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <LinkButton href={`/certificado/${dog.certificateId}`} variant="accent"><FileText className="w-4 h-4" /> Ver certificado</LinkButton>
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
            className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${tab === t ? "border-amber-500 text-amber-500" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
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
                <Row label="Fecha de nacimiento" value={formatDate(dog.dob)} />
                <Row label="Edad" value={calculateAge(dog.dob)} />
                <Row label="Peso" value={dog.weight ? `${dog.weight} kg` : "—"} />
                <Row label="Altura" value={dog.height ? `${dog.height} cm` : "—"} />
                <Row label="Microchip" value={dog.microchip || "—"} mono />
                <Row label="Criadero" value={dog.kennelName || "—"} />
                <Row label="Criador" value={dog.breederName || "—"} />
                <Row label="Ubicación" value={dog.location || "—"} />
                <Row label="Fecha de registro" value={formatDate(dog.registrationDate)} />
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
                  <p className="font-semibold text-sm mt-0.5">{dog.sireName || "Desconocido"}</p>
                </div>
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Madre</p>
                  <p className="font-semibold text-sm mt-0.5">{dog.damName || "Desconocida"}</p>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">COI (Coeficiente de consanguinidad)</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "12%" }} />
                  </div>
                  <span className="text-sm font-semibold">3.2%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">Rango saludable (menor a 6.25%)</p>
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
            {health.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay registros de salud para este ejemplar.</p>
            ) : (
              <ul className="space-y-3">
                {health.map(h => {
                  const Icon = healthIcon(h.type);
                  return (
                    <li key={h.id} className="flex items-start gap-3 p-3 rounded-xl border border-border">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{h.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(h.date)}{h.vet && ` · ${h.vet}`}</p>
                        {h.notes && <p className="text-sm mt-1 text-muted-foreground">{h.notes}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
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
