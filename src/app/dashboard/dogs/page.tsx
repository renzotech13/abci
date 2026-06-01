"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getMyDogs, deleteDog } from "@/lib/store";
import type { Dog } from "@/lib/types";
import { LinkButton, Card, Badge, Empty, Input, Button } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import Link from "next/link";
import { formatShortDate, calculateAge } from "@/lib/utils";

export default function MyDogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [query, setQuery] = useState("");
  const [filterGender, setFilterGender] = useState<"all" | "male" | "female">("all");

  useEffect(() => { setDogs(getMyDogs()); }, []);

  const filtered = dogs.filter(d => {
    if (filterGender !== "all" && d.gender !== filterGender) return false;
    if (query && !`${d.name} ${d.callName} ${d.certificateId} ${d.color}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  function handleDelete(id: string, name: string) {
    if (confirm(`Remove ${name} from your kennel? This cannot be undone.`)) {
      deleteDog(id);
      setDogs(getMyDogs());
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Dogs</h1>
          <p className="text-sm text-muted-foreground mt-1">{dogs.length} registered • {dogs.filter(d => d.gender === "male").length} males • {dogs.filter(d => d.gender === "female").length} females</p>
        </div>
        <LinkButton href="/dashboard/dogs/add" variant="accent">+ Register new dog</LinkButton>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, certificate ID, color..." />
          <div className="flex gap-2">
            {(["all", "male", "female"] as const).map(g => (
              <button
                key={g}
                onClick={() => setFilterGender(g)}
                className={`h-11 px-4 rounded-xl text-sm font-medium transition ${filterGender === g ? "bg-foreground text-background" : "border border-border hover:bg-muted"}`}
              >
                {g === "all" ? "All" : g === "male" ? "♂ Male" : "♀ Female"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Empty
          title={dogs.length === 0 ? "No dogs yet" : "No dogs match your search"}
          description={dogs.length === 0 ? "Get your first BPKC certificate in under 4 minutes." : "Try a different search or filter."}
          action={dogs.length === 0 ? <LinkButton href="/dashboard/dogs/add" variant="accent">Register a dog</LinkButton> : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(d => (
            <Card key={d.id} className="hover:border-amber-500/40 transition">
              <div className="flex items-start gap-4">
                <DogAvatar name={d.name} size="lg" color={d.gender === "male" ? "indigo" : "rose"} />
                <div className="flex-1 min-w-0">
                  <Link href={`/dogs/${d.id}`} className="font-semibold text-lg hover:text-amber-600">{d.name}</Link>
                  {d.callName && <p className="text-sm text-muted-foreground">"{d.callName}"</p>}
                  <p className="text-xs text-muted-foreground font-mono mt-1">{d.certificateId}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge>{d.gender === "male" ? "♂ Male" : "♀ Female"}</Badge>
                    <Badge>{d.variant || d.breed}</Badge>
                    <Badge variant="accent">{d.color}</Badge>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <p>Age: {calculateAge(d.dob)} • Born {formatShortDate(d.dob)}</p>
                    {d.titles && d.titles.length > 0 && <p className="mt-1">🏆 {d.titles.join(", ")}</p>}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                <LinkButton href={`/dogs/${d.id}`} variant="outline" size="sm">View</LinkButton>
                <LinkButton href={`/certificate/${d.certificateId}`} variant="outline" size="sm">Certificate</LinkButton>
                <Button onClick={() => handleDelete(d.id, d.name)} variant="ghost" size="sm" className="text-rose-600 ml-auto">Remove</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
