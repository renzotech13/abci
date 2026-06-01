"use client";

import { useEffect, useState, use } from "react";
import { getDog, getCurrentUser, getHealthRecords } from "@/lib/store";
import type { Dog, HealthRecord, User } from "@/lib/types";
import { Card, Badge, LinkButton, SectionHeading } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import { PedigreeTree } from "@/components/PedigreeTree";
import { formatDate, calculateAge } from "@/lib/utils";
import Link from "next/link";

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
        <h1 className="text-2xl font-bold">Dog not found</h1>
        <p className="mt-2 text-muted-foreground">The dog you're looking for doesn't exist or has been removed.</p>
        <LinkButton href="/search" variant="accent" className="mt-6">Search the registry</LinkButton>
      </div>
    );
  }

  const isOwner = user?.id === dog.ownerId;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <DogAvatar name={dog.name} size="xl" color={dog.gender === "male" ? "indigo" : "rose"} />
          <div className="flex-1 min-w-0">
            <Badge variant="success" className="mb-3">✓ BPKC™ Certified</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{dog.name}</h1>
            {dog.callName && <p className="text-lg text-muted-foreground mt-0.5">Call name "{dog.callName}"</p>}
            <p className="font-mono text-sm text-muted-foreground mt-2">{dog.certificateId}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{dog.gender === "male" ? "♂ Male" : "♀ Female"}</Badge>
              <Badge>{dog.breed}</Badge>
              {dog.variant && <Badge>{dog.variant}</Badge>}
              <Badge variant="accent">{dog.color}</Badge>
              {dog.titles?.map(t => <Badge key={t} variant="warning">🏆 {t}</Badge>)}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <LinkButton href={`/certificate/${dog.certificateId}`} variant="accent">View Certificate</LinkButton>
            {isOwner && <LinkButton href={`/dashboard/dogs`} variant="outline" size="sm">Edit</LinkButton>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border overflow-x-auto">
        {(["overview", "pedigree", "health", "siblings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${tab === t ? "border-amber-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid md:grid-cols-3 gap-5">
            <Card className="md:col-span-2">
              <h3 className="font-semibold mb-4">Profile</h3>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <Row label="Date of birth" value={formatDate(dog.dob)} />
                <Row label="Age" value={calculateAge(dog.dob)} />
                <Row label="Weight" value={dog.weight ? `${dog.weight} lbs` : "—"} />
                <Row label="Height" value={dog.height ? `${dog.height} in` : "—"} />
                <Row label="Microchip" value={dog.microchip || "—"} mono />
                <Row label="Kennel" value={dog.kennelName || "—"} />
                <Row label="Registration date" value={formatDate(dog.registrationDate)} />
                <Row label="Status" value={dog.status.toUpperCase()} />
              </div>
              {dog.notes && (
                <>
                  <h3 className="font-semibold mt-6 mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{dog.notes}</p>
                </>
              )}
            </Card>
            <Card>
              <h3 className="font-semibold mb-4">Parents</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sire</p>
                  <p className="font-semibold text-sm mt-0.5">{dog.sireName || "Unknown"}</p>
                </div>
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Dam</p>
                  <p className="font-semibold text-sm mt-0.5">{dog.damName || "Unknown"}</p>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">COI (Coefficient of inbreeding)</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "12%" }} />
                  </div>
                  <span className="text-sm font-semibold">3.2%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">Healthy range (under 6.25%)</p>
              </div>
            </Card>
          </div>
        )}

        {tab === "pedigree" && (
          <Card>
            <SectionHeading title="5-Generation Pedigree" description="Click parents to view their own pedigree page." />
            <div className="mt-6">
              <PedigreeTree dog={dog} />
            </div>
          </Card>
        )}

        {tab === "health" && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Health Vault</h3>
              {isOwner && <LinkButton href="/dashboard/health" variant="outline" size="sm">Add record</LinkButton>}
            </div>
            {health.length === 0 ? (
              <p className="text-sm text-muted-foreground">No health records yet for this dog.</p>
            ) : (
              <ul className="space-y-3">
                {health.map(h => (
                  <li key={h.id} className="flex items-start gap-3 p-3 rounded-xl border border-border">
                    <span className="text-xl">
                      {h.type === "vaccination" ? "💉" : h.type === "checkup" ? "🩺" : h.type === "test" ? "🧪" : h.type === "weight" ? "⚖️" : "📋"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{h.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(h.date)}{h.vet && ` • ${h.vet}`}</p>
                      {h.notes && <p className="text-sm mt-1 text-muted-foreground">{h.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {tab === "siblings" && (
          <Card>
            <h3 className="font-semibold mb-4">Littermates & Siblings</h3>
            <p className="text-sm text-muted-foreground">Dogs sharing the same sire and dam appear here.</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
                Sibling search coming soon
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
