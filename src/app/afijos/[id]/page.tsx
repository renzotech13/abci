"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getAffixes, getDogs, seedData } from "@/lib/store";
import type { Affix, Dog } from "@/lib/types";
import { Card, Badge, SectionHeading, LinkButton } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import { formatShortDate, formatDate } from "@/lib/utils";
import { Tag, ShieldCheck } from "lucide-react";

export default function AfijoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [affix, setAffix] = useState<Affix | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);

  useEffect(() => {
    seedData();
    const a = getAffixes().find(x => x.id === id || x.affixId === id) || null;
    setAffix(a);
    if (a) {
      setDogs(getDogs().filter(d => d.kennelName?.toUpperCase().includes(a.name) || d.name.startsWith(a.name)));
    }
  }, [id]);

  if (!affix) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Afijo no encontrado</h1>
        <p className="mt-2 text-muted-foreground">El afijo que buscas no existe en ABCI World Wide.</p>
        <LinkButton href="/afijos" variant="accent" className="mt-6">Volver al directorio</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center">
            <Tag className="w-12 h-12" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <Badge variant="success" className="mb-3"><ShieldCheck className="w-3 h-3" /> Afijo oficial verificado</Badge>
            <h1 className="text-3xl font-mono font-black tracking-tight">{affix.name}</h1>
            <p className="font-mono text-sm text-muted-foreground mt-1">{affix.affixId}</p>
            {affix.specialty && <p className="text-base mt-3"><strong>Especialidad:</strong> {affix.specialty}</p>}
            {affix.description && <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{affix.description}</p>}
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Propietario</p>
                <p className="font-medium mt-0.5">{affix.ownerName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">País</p>
                <p className="font-medium mt-0.5">{affix.country}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Registrado</p>
                <p className="font-medium mt-0.5">{formatDate(affix.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Ejemplares en ABCI</p>
                <p className="font-medium mt-0.5">{dogs.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {dogs.length > 0 && (
        <div className="mt-10">
          <SectionHeading title="Ejemplares con este afijo" description={`${dogs.length} ejemplares registrados`} />
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {dogs.map(d => (
              <Link key={d.id} href={`/ejemplar/${d.id}`}>
                <Card className="hover:border-amber-500/40 transition flex items-start gap-3">
                  <DogAvatar name={d.name} size="md" color={d.gender === "male" ? "indigo" : "rose"} photoUrl={d.photo} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">Nro. {d.certificateId}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge>{d.gender === "male" ? "♂" : "♀"}</Badge>
                      <Badge variant="accent">{d.color}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Nac. {formatShortDate(d.dob)}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
