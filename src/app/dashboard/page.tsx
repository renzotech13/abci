"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getCurrentUser, getMyDogs, getHealthRecords, getMyTransfers } from "@/lib/store";
import type { User, Dog } from "@/lib/types";
import { LinkButton, Card, Badge, Empty } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import Link from "next/link";
import { formatShortDate, calculateAge } from "@/lib/utils";

export default function DashboardOverview() {
  const [user, setUser] = useState<User | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [healthCount, setHealthCount] = useState(0);
  const [transferCount, setTransferCount] = useState(0);

  useEffect(() => {
    setUser(getCurrentUser());
    setDogs(getMyDogs());
    setHealthCount(getHealthRecords().length);
    setTransferCount(getMyTransfers().length);
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's what's happening across your kennel today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Registered dogs", value: dogs.length, sub: "active", color: "from-amber-400 to-amber-600", icon: "🐕" },
          { label: "Certificates issued", value: dogs.length, sub: "BPKC™ verified", color: "from-emerald-400 to-emerald-600", icon: "📜" },
          { label: "Health records", value: healthCount, sub: "across all dogs", color: "from-rose-400 to-rose-600", icon: "❤️" },
          { label: "Ownership transfers", value: transferCount, sub: "completed", color: "from-indigo-400 to-indigo-600", icon: "🔁" },
        ].map(s => (
          <Card key={s.label} className="relative overflow-hidden">
            <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br ${s.color} opacity-20`} />
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent dogs</h2>
            <Link href="/dashboard/dogs" className="text-sm text-amber-600 hover:underline">View all →</Link>
          </div>
          {dogs.length === 0 ? (
            <Empty
              title="No dogs registered yet"
              description="Add your first dog to generate a BPKC certificate."
              action={<LinkButton href="/dashboard/dogs/add" variant="accent">Register a dog</LinkButton>}
            />
          ) : (
            <div className="space-y-3">
              {dogs.slice(0, 5).map(d => (
                <Link href={`/dogs/${d.id}`} key={d.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-amber-500/50 transition">
                  <DogAvatar name={d.name} size="md" color={d.gender === "male" ? "indigo" : "rose"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold truncate">{d.name}</p>
                      <Badge>{d.gender === "male" ? "♂" : "♀"} {d.variant || d.breed}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{d.certificateId}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.color} • {calculateAge(d.dob)} • Born {formatShortDate(d.dob)}</p>
                  </div>
                  <div className="text-muted-foreground">→</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Quick actions</h2>
          <div className="space-y-3">
            <LinkButton href="/dashboard/dogs/add" variant="accent" className="w-full">➕ Register a Dog</LinkButton>
            <LinkButton href="/dashboard/litter" variant="outline" className="w-full">👪 New Litter</LinkButton>
            <LinkButton href="/dashboard/transfers" variant="outline" className="w-full">🔁 Transfer Ownership</LinkButton>
            <LinkButton href="/dna-analyzer" variant="outline" className="w-full">🤖 AI Breed Analyzer</LinkButton>
          </div>

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
            <p className="text-xs uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">Pro tip</p>
            <p className="text-sm mt-2">Order physical BPKC papers from your dog detail page — printed and shipped in 5–7 days.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
