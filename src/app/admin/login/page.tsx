"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Label, Card } from "@/components/ui";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setBusy(false);
      setError("Credenciales inválidas.");
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setBusy(false);
      setError("Esta cuenta no tiene permisos de administrador.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-black px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al sitio
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 items-center justify-center mb-5">
            <ShieldCheck className="w-8 h-8 text-black" strokeWidth={2.25} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Panel administrador</h1>
          <p className="mt-2 text-sm text-zinc-400">Acceso restringido al equipo ABCI World Wide.</p>
        </div>

        <Card className="bg-zinc-950 border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-zinc-200">Correo administrador</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@abciregistro.app" className="bg-zinc-900 border-zinc-800 text-white" />
            </div>
            <div>
              <Label htmlFor="password" className="text-zinc-200">Contraseña</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-zinc-900 border-zinc-800 text-white" />
            </div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={busy}>Ingresar al panel</Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Si eres criador, <Link href="/iniciar-sesion" className="text-amber-500 hover:underline">inicia sesión aquí</Link>.
        </p>
      </div>
    </div>
  );
}
