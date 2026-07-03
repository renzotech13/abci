import { createClient } from "@/lib/supabase/server";
import { SectionHeading, LinkButton } from "@/components/ui";
import { Plus } from "lucide-react";
import { MarketplaceList } from "./MarketplaceList";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: listings } = await supabase.from("marketplace_listings").select("*").order("posted", { ascending: false });

  const pedigreeIds = Array.from(new Set((listings ?? []).map(l => l.pedigree_id).filter((id): id is string => !!id)));
  let certByDogId: Record<string, string> = {};
  if (pedigreeIds.length > 0) {
    const { data: dogs } = await supabase.from("dogs").select("id, certificate_id").in("id", pedigreeIds);
    certByDogId = Object.fromEntries((dogs ?? []).map(d => [d.id, d.certificate_id]));
  }

  const enriched = (listings ?? []).map(l => ({
    ...l,
    pedigree_certificate_id: l.pedigree_id ? certByDogId[l.pedigree_id] ?? null : null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <SectionHeading eyebrow="Mercado" title="Mercado con pedigree verificado" description="Cada anuncio está respaldado por un certificado ABCI real. Sin sorpresas." />
        <LinkButton href="/panel/listings" variant="accent"><Plus className="w-4 h-4" /> Crear anuncio</LinkButton>
      </div>

      <MarketplaceList listings={enriched} />
    </div>
  );
}
