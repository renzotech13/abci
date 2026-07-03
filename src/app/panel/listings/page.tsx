"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, Button, Input, Label, Select, Badge, Empty } from "@/components/ui";
import { currency, formatShortDate } from "@/lib/utils";
import { Plus, ShoppingBag, Baby, Dog as DogIcon, Heart, Package, type LucideIcon } from "lucide-react";

type Profile = Tables<"profiles">;
type Listing = Tables<"marketplace_listings">;

const TYPE_ICON: Record<string, LucideIcon> = {
  puppy: Baby,
  adult: DogIcon,
  stud: Heart,
  equipment: Package,
};

export default function MyListingsPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    type: "puppy", title: "", description: "", price: "", location: "",
  });

  async function refresh(uid: string) {
    const supabase = createClient();
    const { data } = await supabase.from("marketplace_listings").select("*").eq("seller_id", uid);
    setListings(data ?? []);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      setUser(profile);
      if (profile) refresh(profile.id);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const supabase = createClient();
    await supabase.from("marketplace_listings").insert({
      type: form.type, title: form.title, description: form.description,
      price: Number(form.price), currency: "USD", location: form.location,
      seller_id: user.id, seller_name: user.kennel_name || user.name, image: "",
    });
    setCreating(false);
    setForm({ type: "puppy", title: "", description: "", price: "", location: "" });
    refresh(user.id);
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mis anuncios</h1>
          <p className="text-sm text-muted-foreground mt-1">Administra lo que tienes a la venta.</p>
        </div>
        {!creating && <Button variant="accent" onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Nuevo anuncio</Button>}
      </div>

      {creating && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold">Crear anuncio</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="t">Tipo</Label>
                <Select id="t" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="puppy">Cachorro</option>
                  <option value="adult">Ejemplar adulto</option>
                  <option value="stud">Servicio de monta</option>
                  <option value="equipment">Equipo / Accesorios</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="p">Precio (USD)</Label>
                <Input id="p" type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="tt">Título</Label>
              <Input id="tt" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="d">Descripción</Label>
              <Input id="d" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="l">Ubicación</Label>
              <Input id="l" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Lima, Perú" />
            </div>
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button type="submit" variant="accent">Publicar</Button>
            </div>
          </form>
        </Card>
      )}

      {listings.length === 0 ? (
        !creating && <Empty title="Aún no tienes anuncios" description="Llega a más de 2,400 criadores verificados." action={<Button onClick={() => setCreating(true)} variant="accent">Crear primer anuncio</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {listings.map(l => {
            const Icon = TYPE_ICON[l.type] || ShoppingBag;
            return (
              <Card key={l.id}>
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-7 h-7 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="accent" className="mb-2">{l.type.toUpperCase()}</Badge>
                    <h3 className="font-semibold">{l.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{l.location} · Publicado {formatShortDate(l.posted)}</p>
                    <p className="text-lg font-bold mt-2 text-amber-500">{currency(l.price, l.currency)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
