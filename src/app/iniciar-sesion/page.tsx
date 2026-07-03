"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Label, Card } from "@/components/ui";
import { Ticket } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function doSignIn(email: string, password: string) {
    setBusy(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError("Correo o contraseña incorrectos. Prueba con la cuenta demo más abajo.");
      return;
    }
    router.push("/panel");
    router.refresh();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSignIn(email, password);
  }

  function loginDemo() {
    doSignIn("demo@abciregistro.app", "demo1234");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</h1>
        <p className="mt-2 text-sm text-muted-foreground">Inicia sesión para administrar tu criadero y certificados.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@criadero.com" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="password" className="mb-0">Contraseña</Label>
              <Link href="#" className="text-xs text-amber-500 hover:underline">¿Olvidaste?</Link>
            </div>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={busy}>Iniciar sesión</Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 border-t border-border" />
          <span>o</span>
          <div className="flex-1 border-t border-border" />
        </div>
        <Button onClick={loginDemo} variant="outline" size="lg" className="w-full" disabled={busy}>
          <Ticket className="w-4 h-4" /> Probar con cuenta demo
        </Button>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta? <Link href="/registrarse" className="text-amber-500 font-medium hover:underline">Crear gratis</Link>
      </p>
    </div>
  );
}
