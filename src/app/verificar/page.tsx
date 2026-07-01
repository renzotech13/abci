"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDog, seedData } from "@/lib/store";
import { Card, Button, Input, Badge } from "@/components/ui";
import { Lock, Zap, Globe, QrCode } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const [cert, setCert] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    seedData();
    const dog = getDog(cert.trim().toUpperCase());
    if (!dog) {
      setError("Certificado no encontrado. Revisa el número e inténtalo de nuevo.");
      return;
    }
    router.push(`/certificado/${dog.certificateId}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-amber-500/10 items-center justify-center mb-5">
          <QrCode className="w-8 h-8 text-amber-500" strokeWidth={1.75} />
        </div>
        <Badge variant="success" className="mb-4">100% gratuito · Sin cuenta necesaria</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Verificar certificado ABCI</h1>
        <p className="mt-3 text-muted-foreground">Ingresa el número de registro impreso en el certificado o escanea su QR.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Número de registro</label>
            <Input
              value={cert}
              onChange={e => { setCert(e.target.value); setError(""); }}
              placeholder="29601"
              className="font-mono text-base"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Ingresa solo el número (sin guiones ni letras)</p>
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button type="submit" variant="accent" size="lg" className="w-full">Verificar certificado</Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm font-medium mb-3">Prueba con estos certificados demo:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {["29601", "29602", "28401", "28950", "27889", "26551"].map(c => (
              <button key={c} onClick={() => setCert(c)} className="text-left p-3 rounded-xl border border-border hover:border-amber-500 hover:bg-amber-500/5 transition font-mono text-xs">
                Nro. {c}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-12 grid sm:grid-cols-3 gap-4">
        {[
          { Icon: Lock, t: "A prueba de fraude", d: "Cada certificado tiene un hash único anclado a registro blockchain." },
          { Icon: Zap, t: "Verificación instantánea", d: "Sin login, sin esperas — verifica en menos de 2 segundos." },
          { Icon: Globe, t: "18 países", d: "Usado por compradores y jueces en toda Latinoamérica." },
        ].map(b => (
          <Card key={b.t} className="text-center">
            <b.Icon className="w-6 h-6 mx-auto text-amber-500" strokeWidth={1.75} />
            <p className="font-semibold mt-2">{b.t}</p>
            <p className="text-xs text-muted-foreground mt-1">{b.d}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
