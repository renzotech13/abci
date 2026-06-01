"use client";

import { useEffect, useState, use } from "react";
import { getDog, seedData } from "@/lib/store";
import type { Dog } from "@/lib/types";
import { Card, Button, LinkButton, Badge } from "@/components/ui";
import { QRCode } from "@/components/QRCode";
import { formatDate, calculateAge } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CertificateInner({ id }: { id: string }) {
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";

  useEffect(() => {
    seedData();
    const d = getDog(id);
    setDog(d);
    setLoading(false);
  }, [id]);

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading certificate…</div>;

  if (!dog) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold">Certificate not found</h1>
        <p className="mt-2 text-muted-foreground">This certificate ID does not exist in our registry.</p>
        <LinkButton href="/verify" variant="accent" className="mt-6">Try another ID</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {isNew && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3 no-print">
          <span className="text-2xl">🎉</span>
          <div className="flex-1">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">Registration successful!</p>
            <p className="text-sm text-muted-foreground">{dog.name} now has an official BPKC certificate.</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 no-print">
        <div>
          <Badge variant="success">✓ Certificate Verified</Badge>
          <p className="text-xs text-muted-foreground mt-2">Verified against BullyPedex Registry blockchain anchor.</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/dogs/${dog.id}`} variant="outline" size="sm">View full profile</LinkButton>
          <Button variant="accent" size="sm" onClick={() => window.print()}>🖨 Print</Button>
        </div>
      </div>

      {/* Certificate body */}
      <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-50 via-background to-rose-50 dark:from-amber-500/5 dark:via-background dark:to-rose-500/5 p-8 sm:p-12 cert-watermark relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">BullyPedex Registry</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">Certificate of Pedigree</h1>
            <p className="text-xs text-muted-foreground mt-1">BPKC™ Globally Recognized</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-12 h-12 rounded-full bg-amber-500 text-black items-center justify-center font-bold text-2xl">B</span>
            <div>
              <p className="font-bold text-sm">BullyPedex</p>
              <p className="text-[10px] text-muted-foreground">Est. 2018</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-center mb-8">
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">This certifies that</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 leading-tight">{dog.name}</h2>
            {dog.callName && <p className="text-sm text-muted-foreground mt-1">"{dog.callName}"</p>}
            <p className="text-sm mt-4">is registered with BullyPedex Registry as a <span className="font-semibold">{dog.breed}{dog.variant ? ` (${dog.variant})` : ""}</span>, with the unique identifier:</p>
            <p className="font-mono font-bold text-xl mt-3 tracking-wider">{dog.certificateId}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-2xl border border-border">
              <QRCode value={dog.certificateId} size={132} />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">Scan to verify online</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-8 p-5 rounded-2xl bg-background/70 border border-border">
          <Field label="Date of birth" value={formatDate(dog.dob)} />
          <Field label="Age" value={calculateAge(dog.dob)} />
          <Field label="Gender" value={dog.gender === "male" ? "Male" : "Female"} />
          <Field label="Color" value={dog.color} />
          {dog.weight && <Field label="Weight" value={`${dog.weight} lbs`} />}
          {dog.height && <Field label="Height" value={`${dog.height} in`} />}
          <Field label="Microchip" value={dog.microchip || "Not provided"} mono />
          <Field label="Kennel" value={dog.kennelName || "Independent"} />
          <Field label="Registration date" value={formatDate(dog.registrationDate)} />
          <Field label="Status" value={dog.status.toUpperCase()} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sire (father)</p>
            <p className="font-semibold mt-1">{dog.sireName || "Unknown"}</p>
          </div>
          <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Dam (mother)</p>
            <p className="font-semibold mt-1">{dog.damName || "Unknown"}</p>
          </div>
        </div>

        {dog.titles && dog.titles.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Titles & Achievements</p>
            <p className="font-semibold mt-1">🏆 {dog.titles.join(" • ")}</p>
          </div>
        )}

        <div className="pt-6 border-t border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="text-xl font-serif italic mb-1">Marcus Whitlock</div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Registrar General, BullyPedex Registry</p>
          </div>
          <div className="text-right text-[10px] text-muted-foreground">
            <p>Issued {formatDate(dog.registrationDate)}</p>
            <p className="font-mono mt-1">Hash: {dog.certificateId.replace(/[^A-Z0-9]/g, "")}-{Date.now().toString(36).slice(-6).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-3 no-print">
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <p className="text-2xl">📦</p>
          <p className="text-sm font-semibold mt-1">Order physical papers</p>
          <p className="text-xs text-muted-foreground">$24.99 + shipping</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <p className="text-2xl">🔁</p>
          <p className="text-sm font-semibold mt-1">Transfer ownership</p>
          <p className="text-xs text-muted-foreground">Secure email-based</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <p className="text-2xl">📊</p>
          <p className="text-sm font-semibold mt-1">View pedigree</p>
          <p className="text-xs text-muted-foreground">5 generations</p>
        </div>
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
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading…</div>}>
      <CertificateInner id={id} />
    </Suspense>
  );
}
