"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/adminLog";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, Badge, Input, Select } from "@/components/ui";
import { currency, formatShortDate } from "@/lib/utils";
import {
  ShoppingBag, Search, Trash2, Baby, Dog as DogIcon, Heart, Package, type LucideIcon,
} from "lucide-react";

type Listing = Tables<"marketplace_listings">;

const TYPE_ICON: Record<string, LucideIcon> = {
  puppy: Baby,
  adult: DogIcon,
  stud: Heart,
  equipment: Package,
};

export default function AdminMarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase.from("marketplace_listings").select("*").order("posted", { ascending: false });
    setListings(data ?? []);
  }

  useEffect(() => { refresh(); }, []);

  async function handleDelete(l: Listing) {
    if (!confirm(`¿Eliminar el anuncio "${l.title}"?`)) return;
    const supabase = createClient();
    await supabase.from("marketplace_listings").delete().eq("id", l.id);
    await logAdminAction(supabase, "Anuncio eliminado", l.title, l.seller_name);
    refresh();
  }

  const filtered = listings.filter(l => {
    if (type !== "all" && l.type !== type) return false;
    if (query && !`${l.title} ${l.description} ${l.seller_name}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-amber-500" /> Moderación de mercado
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{listings.length} anuncios activos. Modera contenido inapropiado o engañoso.</p>
      </div>

      <Card className="mb-6">
        <div className="grid md:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar título, descripción, vendedor..." className="pl-9" />
          </div>
          <Select value={type} onChange={e => setType(e.target.value)}>
            <option value="all">Todos los tipos</option>
            <option value="puppy">Cachorros</option>
            <option value="adult">Adultos</option>
            <option value="stud">Servicio de monta</option>
            <option value="equipment">Equipo</option>
          </Select>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(l => {
          const Icon = TYPE_ICON[l.type] || ShoppingBag;
          return (
            <Card key={l.id} className="hover:border-amber-500/40 transition">
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-amber-500/15 to-zinc-900/30 flex items-center justify-center mb-3">
                <Icon className="w-16 h-16 text-amber-500/70" strokeWidth={1.25} />
              </div>
              <Badge variant="accent" className="mb-2">{l.type.toUpperCase()}</Badge>
              <h3 className="font-semibold leading-snug line-clamp-2">{l.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{l.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold text-amber-500">{currency(l.price, l.currency)}</p>
                  <p className="text-[10px] text-muted-foreground">{l.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{l.seller_name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatShortDate(l.posted)}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(l)} className="mt-3 w-full h-9 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 inline-flex items-center justify-center gap-1.5 text-xs">
                <Trash2 className="w-3.5 h-3.5" /> Eliminar anuncio
              </button>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
