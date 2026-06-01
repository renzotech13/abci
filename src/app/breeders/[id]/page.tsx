"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getUsers, getDogs, seedData } from "@/lib/store";
import type { User, Dog } from "@/lib/types";
import { Card, Badge, SectionHeading, LinkButton } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import { formatShortDate } from "@/lib/utils";

export default function BreederDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);

  useEffect(() => {
    seedData();
    const u = getUsers().find(x => x.id === id);
    setUser(u || null);
    setDogs(getDogs().filter(d => d.ownerId === id));
  }, [id]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Breeder not found</h1>
        <LinkButton href="/breeders" variant="accent" className="mt-6">Back to directory</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold text-4xl">
            {user.kennelName?.charAt(0)}
          </div>
          <div className="flex-1">
            <Badge variant={user.membership === "elite" ? "accent" : "success"} className="mb-3">
              {user.membership === "elite" ? "⭐ Elite Kennel" : user.membership === "pro" ? "✓ Pro Verified" : "Verified"}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">{user.kennelName}</h1>
            <p className="text-muted-foreground mt-1">{user.name} • {user.country}</p>
            {user.bio && <p className="mt-4 text-sm text-muted-foreground max-w-2xl">{user.bio}</p>}
            <div className="mt-5 flex gap-2">
              <LinkButton href="/contact" variant="accent" size="sm">Contact kennel</LinkButton>
              <button className="inline-flex h-9 px-4 rounded-full border border-border text-sm">Follow</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[220px]">
            <div>
              <p className="text-2xl font-bold">{dogs.length}</p>
              <p className="text-xs text-muted-foreground">Dogs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{dogs.filter(d => d.titles && d.titles.length > 0).length}</p>
              <p className="text-xs text-muted-foreground">Titled</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{new Date().getFullYear() - new Date(user.createdAt).getFullYear()}y</p>
              <p className="text-xs text-muted-foreground">Member</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading title="Registered Dogs" description={`${dogs.length} dogs in this kennel`} />
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {dogs.map(d => (
            <Link key={d.id} href={`/dogs/${d.id}`}>
              <Card className="hover:border-amber-500/40 transition flex items-start gap-3">
                <DogAvatar name={d.name} size="md" color={d.gender === "male" ? "indigo" : "rose"} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{d.certificateId}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge>{d.gender === "male" ? "♂" : "♀"}</Badge>
                    <Badge variant="accent">{d.color}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Born {formatShortDate(d.dob)}</p>
                </div>
              </Card>
            </Link>
          ))}
          {dogs.length === 0 && (
            <p className="col-span-2 text-center text-muted-foreground py-12">This kennel hasn't published any dogs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
