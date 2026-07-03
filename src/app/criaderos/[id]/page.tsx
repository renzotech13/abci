import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, SectionHeading, LinkButton } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import { formatShortDate } from "@/lib/utils";
import { slugify } from "@/lib/utils";
import { ShieldCheck, Mail } from "lucide-react";

export default async function BreederDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: kennels } = await supabase.from("kennels").select("*");
  const match = (kennels || []).find(k => slugify(k.kennel_name || "") === id);

  if (!match || !match.kennel_name) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Criadero no encontrado</h1>
        <LinkButton href="/criaderos" variant="accent" className="mt-6">Volver al directorio</LinkButton>
      </div>
    );
  }

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .eq("kennel_name", match.kennel_name)
    .order("registration_date", { ascending: false });

  const list = dogs || [];
  let profile = null;
  if (match.owner_id) {
    const { data } = await supabase.from("profiles").select("*").eq("id", match.owner_id).maybeSingle();
    profile = data;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold text-4xl">
            {match.kennel_name?.charAt(0)}
          </div>
          <div className="flex-1">
            {match.owner_id && (
              <Badge variant="success" className="mb-3"><ShieldCheck className="w-3 h-3" /> Cuenta verificada</Badge>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{match.kennel_name}</h1>
            {profile?.affix && <p className="font-mono text-sm text-amber-500 mt-1">Afijo: {profile.affix}</p>}
            <p className="text-muted-foreground mt-1">{profile?.name || match.breeder_name}{(profile?.country || match.location) ? ` · ${profile?.country || match.location}` : ""}</p>
            {profile?.bio && <p className="mt-4 text-sm text-muted-foreground max-w-2xl">{profile.bio}</p>}
            <div className="mt-5 flex gap-2">
              <LinkButton href="/contacto" variant="accent" size="sm"><Mail className="w-3.5 h-3.5" /> Contactar</LinkButton>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center sm:min-w-[160px]">
            <div>
              <p className="text-2xl font-bold text-amber-500">{list.length}</p>
              <p className="text-xs text-muted-foreground">Ejemplares</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{list.filter(d => d.titles && d.titles.length > 0).length}</p>
              <p className="text-xs text-muted-foreground">Titulados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading title="Ejemplares registrados" description={`${list.length} ejemplares en este criadero`} />
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {list.map(d => (
            <Link key={d.id} href={`/ejemplar/${d.id}`}>
              <Card className="hover:border-amber-500/40 transition flex items-start gap-3">
                <DogAvatar name={d.name} size="md" color={d.gender === "male" ? "indigo" : "rose"} photoUrl={d.photo_url ?? undefined} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">Nro. {d.certificate_id}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge>{d.gender === "male" ? "♂" : "♀"}</Badge>
                    {d.color && <Badge variant="accent">{d.color}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{d.dob ? `Nac. ${formatShortDate(d.dob)}` : "Fecha no registrada"}</p>
                </div>
              </Card>
            </Link>
          ))}
          {list.length === 0 && (
            <p className="col-span-2 text-center text-muted-foreground py-12">Este criadero aún no ha publicado ejemplares.</p>
          )}
        </div>
      </div>
    </div>
  );
}
