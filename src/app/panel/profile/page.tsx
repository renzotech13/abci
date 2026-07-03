"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types";
import { Card, Button, Input, Label, Textarea, Badge } from "@/components/ui";
import { CheckCircle2 } from "lucide-react";

type Profile = Tables<"profiles">;

export default function ProfilePage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      if (profile) { setUser(profile); setForm(profile); }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const supabase = createClient();
    const patch: TablesUpdate<"profiles"> = {
      name: form.name, kennel_name: form.kennel_name, affix: form.affix,
      country: form.country, phone: form.phone, bio: form.bio,
    };
    const { data: updated } = await supabase.from("profiles").update(patch).eq("id", user.id).select("*").maybeSingle();
    if (updated) {
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Perfil y criadero</h1>
        <p className="text-sm text-muted-foreground mt-1">Administra tu perfil público y datos de contacto.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold">Datos de la cuenta</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="n">Nombre completo</Label>
                <Input id="n" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="e">Correo electrónico</Label>
                <Input id="e" type="email" value={form.email || ""} disabled />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="k">Nombre del criadero</Label>
                <Input id="k" value={form.kennel_name || ""} onChange={e => setForm({ ...form, kennel_name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="a">Afijo registrado</Label>
                <Input id="a" value={form.affix || ""} onChange={e => setForm({ ...form, affix: e.target.value.toUpperCase() })} placeholder="FIGHTING BULL" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="c">País</Label>
                <Input id="c" value={form.country || ""} onChange={e => setForm({ ...form, country: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="p">Teléfono</Label>
                <Input id="p" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="b">Biografía</Label>
              <Textarea id="b" rows={4} value={form.bio || ""} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Cuéntale a la comunidad sobre tu criadero..." />
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <Button type="submit" variant="accent">Guardar cambios</Button>
              {saved && <span className="text-sm text-emerald-500 inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Guardado</span>}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Membresía</p>
            <div className="mt-2">
              <Badge variant={user.membership === "free" ? "default" : "accent"}>
                {user.membership === "free" ? "Plan Gratuito" : user.membership === "pro" ? "Miembro Pro" : "Miembro Elite"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {user.membership === "free" ? "Mejora tu plan para acceder a tarifas reducidas, descuentos en camadas y soporte prioritario." : "¡Gracias por apoyarnos! Disfruta de tarifas reducidas y funciones prioritarias."}
            </p>
            <a href="/membresia" className="block mt-4 text-center text-sm font-medium text-amber-500 hover:underline">
              {user.membership === "free" ? "Comparar planes →" : "Administrar membresía →"}
            </a>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Cuenta</p>
            <p className="text-sm mt-2">Miembro desde {new Date(user.created_at).getFullYear()}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{user.id}</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
