"use client";

import { useEffect, useState, use, Suspense } from "react";
import { getDog, seedData } from "@/lib/store";
import type { Dog } from "@/lib/types";
import { Card, Button, LinkButton, Badge } from "@/components/ui";
import { QRCode } from "@/components/QRCode";
import { formatDate, calculateAge } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import {
  PartyPopper, ShieldCheck, Eye, Printer, XCircle,
  Package, ArrowLeftRight, GitBranch, Trophy,
} from "lucide-react";

function CertificateInner({ id }: { id: string }) {
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyUrl, setVerifyUrl] = useState("");
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";

  useEffect(() => {
    seedData();
    const d = getDog(id);
    setDog(d);
    setLoading(false);
    if (d && typeof window !== "undefined") {
      setVerifyUrl(`${window.location.origin}/certificado/${d.certificateId}`);
    }
  }, [id]);

  if (loading) return <div className="py-20 text-center text-muted-foreground">Cargando certificado…</div>;

  if (!dog) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <XCircle className="w-14 h-14 mx-auto text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold">Certificado no encontrado</h1>
        <p className="mt-2 text-muted-foreground">Este número de registro no existe en ABCI World Wide.</p>
        <LinkButton href="/verificar" variant="accent" className="mt-6">Probar otro número</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {isNew && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3 no-print">
          <PartyPopper className="w-6 h-6 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-500">¡Registro exitoso!</p>
            <p className="text-sm text-muted-foreground">{dog.name} ya tiene su certificado oficial ABCI.</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 no-print">
        <div>
          <Badge variant="success"><ShieldCheck className="w-3 h-3" /> Certificado verificado</Badge>
          <p className="text-xs text-muted-foreground mt-2">Verificado contra el registro blockchain de ABCI World Wide.</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/ejemplar/${dog.id}`} variant="outline" size="sm"><Eye className="w-3.5 h-3.5" /> Ver perfil</LinkButton>
          <Button variant="accent" size="sm" onClick={() => window.print()}><Printer className="w-3.5 h-3.5" /> Imprimir</Button>
        </div>
      </div>

      {/* Certificate body */}
      <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-background to-amber-500/10 dark:from-zinc-950 dark:via-black dark:to-zinc-950 p-8 sm:p-12 cert-watermark relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">ABCI World Wide — Registro Internacional</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">Certificado de Pedigree</h1>
            <p className="text-xs text-muted-foreground mt-1">All Breeders Cynologique International</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-12 h-12 rounded-full bg-amber-500 text-black items-center justify-center font-black text-base tracking-tight">ABCI</span>
            <div>
              <p className="font-bold text-sm">ABCI World Wide</p>
              <p className="text-[10px] text-muted-foreground">Latinoamérica</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-center mb-8">
          <div className="md:col-span-2 flex items-start gap-4">
            {dog.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dog.photo} alt={dog.name} className="w-20 h-20 rounded-xl object-cover border border-border shrink-0" />
            )}
            <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Este documento certifica que</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 leading-tight">{dog.name}</h2>
            {dog.callName && <p className="text-sm text-muted-foreground mt-1">&quot;{dog.callName}&quot;</p>}
            <p className="text-sm mt-4">se encuentra registrado en ABCI World Wide como <span className="font-semibold">{dog.breed}{dog.variant ? ` (${dog.variant})` : ""}</span>, con el siguiente número oficial:</p>
            <p className="font-mono font-bold text-3xl mt-3 tracking-wider text-amber-500">{dog.certificateId}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-2xl border border-border">
              <QRCode value={verifyUrl || dog.certificateId} size={132} />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">Escanea para verificar</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-8 p-5 rounded-2xl bg-background/70 border border-border">
          <Field label="Fecha de nacimiento" value={formatDate(dog.dob)} />
          <Field label="Edad" value={calculateAge(dog.dob)} />
          <Field label="Sexo" value={dog.gender === "male" ? "Macho" : "Hembra"} />
          <Field label="Color" value={dog.color} />
          {dog.weight && <Field label="Peso" value={`${dog.weight} kg`} />}
          {dog.height && <Field label="Altura" value={`${dog.height} cm`} />}
          <Field label="Microchip" value={dog.microchip || "No proporcionado"} mono />
          <Field label="Criadero" value={dog.kennelName || "Independiente"} />
          <Field label="Criador" value={dog.breederName || "—"} />
          <Field label="Ubicación" value={dog.location || "—"} />
          <Field label="Fecha de registro" value={formatDate(dog.registrationDate)} />
          <Field label="Estado" value={dog.status === "active" ? "ACTIVO" : dog.status.toUpperCase()} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Padre</p>
            <p className="font-semibold mt-1">{dog.sireName || "Desconocido"}</p>
          </div>
          <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Madre</p>
            <p className="font-semibold mt-1">{dog.damName || "Desconocida"}</p>
          </div>
        </div>

        {dog.titles && dog.titles.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Títulos y logros
            </p>
            <p className="font-semibold mt-1">{dog.titles.join(" · ")}</p>
          </div>
        )}

        <div className="pt-6 border-t border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="text-xl font-serif italic mb-1">Dr. Marcos Velarde</div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Registrador General — ABCI World Wide</p>
          </div>
          <div className="text-right text-[10px] text-muted-foreground">
            <p>Emitido el {formatDate(dog.registrationDate)}</p>
            <p className="font-mono mt-1">Hash: {dog.certificateId}-{Date.now().toString(36).slice(-6).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-3 no-print">
        {[
          { Icon: Package, t: "Solicitar copia física", d: "$15 + envío" },
          { Icon: ArrowLeftRight, t: "Traspasar propiedad", d: "Seguro por correo" },
          { Icon: GitBranch, t: "Ver pedigree", d: "4 generaciones" },
        ].map(b => (
          <div key={b.t} className="p-4 rounded-xl border border-border bg-card text-center">
            <b.Icon className="w-6 h-6 mx-auto text-amber-500" strokeWidth={1.75} />
            <p className="text-sm font-semibold mt-2">{b.t}</p>
            <p className="text-xs text-muted-foreground">{b.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Cargando…</div>}>
      <CertificateInner id={id} />
    </Suspense>
  );
}
