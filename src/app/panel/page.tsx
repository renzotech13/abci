"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { LinkButton, Card, Badge, Empty } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { DogAvatar } from "@/components/DogAvatar";
import Link from "next/link";
import { formatShortDate, calculateAge } from "@/lib/utils";
import {
  Dog as DogIcon, FileText, HeartPulse, ArrowLeftRight,
  PlusCircle, Users2, Sparkles, Lightbulb, ChevronRight,
} from "lucide-react";

type Profile = Tables<"profiles">;
type Dog = Tables<"dogs">;

export default function DashboardOverview() {
  const [user, setUser] = useState<Profile | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [healthCount, setHealthCount] = useState(0);
  const [transferCount, setTransferCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const authUser = data.user;
      if (!authUser) return;

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
      setUser(profile);

      const { data: myDogs } = await supabase.from("dogs").select("*").eq("owner_id", authUser.id);
      setDogs(myDogs ?? []);

      const dogIds = (myDogs ?? []).map(d => d.id);
      if (dogIds.length > 0) {
        const { count } = await supabase.from("health_records").select("*", { count: "exact", head: true }).in("dog_id", dogIds);
        setHealthCount(count ?? 0);
      }

      const { count: tCount } = await supabase.from("transfers").select("*", { count: "exact", head: true }).eq("from_user_id", authUser.id);
      setTransferCount(tCount ?? 0);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Bienvenido de nuevo, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground mt-1">Esto es lo que está pasando en tu criadero hoy.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Ejemplares registrados", value: dogs.length, sub: "activos", Icon: DogIcon },
          { label: "Certificados emitidos", value: dogs.length, sub: "verificados ABCI", Icon: FileText },
          { label: "Registros de salud", value: healthCount, sub: "de todos los ejemplares", Icon: HeartPulse },
          { label: "Traspasos", value: transferCount, sub: "iniciados", Icon: ArrowLeftRight },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 60}>
            <Card hoverable className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-amber-500/10" />
              <s.Icon className="w-6 h-6 text-amber-500 mb-2 relative" strokeWidth={1.75} />
              <p className="text-3xl font-bold relative tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground relative">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-1 relative">{s.sub}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ejemplares recientes</h2>
            <Link href="/panel/dogs" className="link-underline text-sm text-amber-500 inline-flex items-center gap-1">
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {dogs.length === 0 ? (
            <Empty
              title="Aún no hay ejemplares registrados"
              description="Registra a tu primer ejemplar para generar su certificado ABCI."
              action={<LinkButton href="/panel/dogs/add" variant="accent">Registrar ejemplar</LinkButton>}
            />
          ) : (
            <div className="space-y-3">
              {dogs.slice(0, 5).map(d => (
                <Link href={`/ejemplar/${d.id}`} key={d.id} className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card transition-all duration-200 hover:border-amber-500/50 hover:shadow-elevation-2 hover:-translate-y-0.5 cursor-pointer">
                  <DogAvatar name={d.name} size="md" color={d.gender === "male" ? "indigo" : "rose"} photoUrl={d.photo_url ?? undefined} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold truncate">{d.name}</p>
                      <Badge>{d.gender === "male" ? "♂" : "♀"} {d.variant || d.breed}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">Nro. {d.certificate_id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.color} • {d.dob ? calculateAge(d.dob) : "—"} • {d.dob ? `Nac. ${formatShortDate(d.dob)}` : ""}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Acciones rápidas</h2>
          <div className="space-y-3">
            <LinkButton href="/panel/dogs/add" variant="accent" className="w-full"><PlusCircle className="w-4 h-4" /> Registrar ejemplar</LinkButton>
            <LinkButton href="/panel/litter" variant="outline" className="w-full"><Users2 className="w-4 h-4" /> Nueva camada</LinkButton>
            <LinkButton href="/panel/transfers" variant="outline" className="w-full"><ArrowLeftRight className="w-4 h-4" /> Traspasar propiedad</LinkButton>
            <LinkButton href="/analisis-ia" variant="outline" className="w-full"><Sparkles className="w-4 h-4" /> Análisis IA de raza</LinkButton>
          </div>

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-amber-500">
              <Lightbulb className="w-3.5 h-3.5" /> Tip pro
            </div>
            <p className="text-sm mt-2">Solicita el certificado físico desde la página del ejemplar — impreso y enviado en 7–10 días hábiles.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
