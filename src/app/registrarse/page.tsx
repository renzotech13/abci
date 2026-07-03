"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Label, Card } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", kennelName: "", country: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, kennel_name: form.kennelName || null, country: form.country || null } },
    });
    setBusy(false);
    if (signUpError) {
      setError(signUpError.message.includes("already registered")
        ? "Ya existe una cuenta con este correo electrónico."
        : signUpError.message);
      return;
    }
    router.push("/panel");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Únete a ABCI World Wide</h1>
        <p className="mt-2 text-sm text-muted-foreground">Crea tu cuenta gratuita. Registra a tu primer ejemplar en minutos.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Anthony Huamán" />
          </div>
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@criadero.com" />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <Label htmlFor="kennel">Nombre del criadero <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Input id="kennel" value={form.kennelName} onChange={e => setForm({ ...form, kennelName: e.target.value })} placeholder="Fighting Bulls Kennel" />
          </div>
          <div>
            <Label htmlFor="country">País</Label>
            <Input id="country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Perú" />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={busy}>{busy ? "Creando cuenta…" : "Crear cuenta gratuita"}</Button>
          <p className="text-xs text-muted-foreground text-center">
            Al registrarte aceptas nuestros <Link href="/terminos" className="underline">Términos</Link> y nuestro <Link href="/codigo-de-conducta" className="underline">Código de Conducta</Link>.
          </p>
        </form>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta? <Link href="/iniciar-sesion" className="text-amber-500 font-medium hover:underline">Iniciar sesión</Link>
      </p>
    </div>
  );
}
