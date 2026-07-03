import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui";
import { DogDetailClient } from "./DogDetailClient";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function DogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const filter = UUID_RE.test(id) ? `id.eq.${id},certificate_id.eq.${id}` : `certificate_id.eq.${id}`;
  const { data: dog } = await supabase.from("dogs").select("*").or(filter).maybeSingle();

  if (!dog) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Ejemplar no encontrado</h1>
        <p className="mt-2 text-muted-foreground">El ejemplar que buscas no existe o ha sido removido.</p>
        <LinkButton href="/ejemplares" variant="accent" className="mt-6">Buscar en el registro</LinkButton>
      </div>
    );
  }

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  let isAdmin = false;
  if (userId) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    isAdmin = profile?.role === "admin";
  }
  // Los ~9,655 ejemplares migrados desde el sitio anterior aún no tienen un
  // propietario real vinculado (owner_id queda null hasta que cada criador
  // reclame su cuenta). Mientras tanto, el equipo admin puede gestionarlos.
  const canManage = (!!userId && userId === dog.owner_id) || isAdmin;

  return <DogDetailClient dog={dog} canManage={canManage} />;
}
