"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDog, seedData } from "@/lib/store";
import { Card, Button, Input, LinkButton, Badge, SectionHeading } from "@/components/ui";

export default function VerifyPage() {
  const router = useRouter();
  const [cert, setCert] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    seedData();
    const dog = getDog(cert.trim().toUpperCase());
    if (!dog) {
      setError("Certificate not found. Double-check the ID and try again.");
      return;
    }
    router.push(`/certificate/${dog.certificateId}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center mb-10">
        <Badge variant="success" className="mb-4">100% free • No account needed</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Verify a BullyPedex certificate</h1>
        <p className="mt-3 text-muted-foreground">Enter the certificate ID printed on any BPKC paper or scanned via QR code.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Certificate ID</label>
            <Input
              value={cert}
              onChange={e => { setCert(e.target.value); setError(""); }}
              placeholder="BPX-2025-DIESEL-01"
              className="font-mono text-base"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Format: BPX-XXXX-XXXXX-XX</p>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" variant="accent" size="lg" className="w-full">Verify certificate</Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm font-medium mb-3">Try these demo certificates:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {["BPX-2025-DIESEL-01", "BPX-2025-NOVA-02", "BPX-1024-ZEUS-19", "BPX-2024-ROCKY-77"].map(c => (
              <button key={c} onClick={() => setCert(c)} className="text-left p-3 rounded-xl border border-border hover:border-amber-500 hover:bg-amber-500/5 transition font-mono text-xs">
                {c}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-12 grid sm:grid-cols-3 gap-4">
        {[
          { icon: "🔒", t: "Tamper-evident", d: "Every cert is hashed and tied to a blockchain anchor." },
          { icon: "⚡", t: "Instant lookup", d: "No login, no waiting — verify in under 2 seconds." },
          { icon: "🌍", t: "47 countries", d: "Used by buyers and judges across 5 continents." },
        ].map(b => (
          <Card key={b.t} className="text-center">
            <div className="text-2xl">{b.icon}</div>
            <p className="font-semibold mt-2">{b.t}</p>
            <p className="text-xs text-muted-foreground mt-1">{b.d}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
