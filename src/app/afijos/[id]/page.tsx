import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, SectionHeading, LinkButton } from "@/components/ui";
import { DogAvatar } from "@/components/DogAvatar";
import { formatShortDate, formatDate } from "@/lib/utils";
import { Tag, ShieldCheck } from "lucide-react";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AfijoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const filter = UUID_RE.test(id) ? `id.eq.${id},affix_code.eq.${id}` : `affix_code.eq.${id}`;
  const { data: affix } = await supabase.from("affixes").select("*").or(filter).maybeSingle();

  if (!affix) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Afijo no encontrado</h1>
        <p className="mt-2 text-muted-foreground">El afijo que buscas no existe en ABCI World Wide.</p>
        <LinkButton href="/afijos" variant="accent" className="mt-6">Volver al directorio</LinkButton>
      </div>
    );
  }

  const esc = affix.name.replace(/\\/g, "\\\\").replace(/[%_,()]/g, c => `\\${c}`);
  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .or(`kennel_name.ilike.%${esc}%,name.ilike.${esc}%`)
    .order("registration_date", { ascending: false })
    .limit(60);
  const list = dogs || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center">
            <Tag className="w-12 h-12" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <Badge variant="success" className="mb-3"><ShieldCheck className="w-3 h-3" /> Afijo oficial verificado</Badge>
            <h1 className="text-3xl font-mono font-black tracking-tight">{affix.name}</h1>
            <p className="font-mono text-sm text-muted-foreground mt-1">{affix.affix_code}</p>
            {affix.specialty && <p className="text-base mt-3"><strong>Especialidad:</strong> {affix.specialty}</p>}
            {affix.description && <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{affix.description}</p>}
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Propietario</p>
                <p className="font-medium mt-0.5">{affix.owner_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">País</p>
                <p className="font-medium mt-0.5">{affix.country}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Registrado</p>
                <p className="font-medium mt-0.5">{formatDate(affix.created_at)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Ejemplares en ABCI</p>
                <p className="font-medium mt-0.5">{list.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {list.length > 0 && (
        <div className="mt-10">
          <SectionHeading title="Ejemplares con este afijo" description={`${list.length} ejemplares registrados`} />
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
          </div>
        </div>
      )}
    </div>
  );
}
