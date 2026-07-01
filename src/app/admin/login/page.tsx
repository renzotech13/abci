"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, seedData, getCurrentUser } from "@/lib/store";
import { Button, Input, Label, Card } from "@/components/ui";
import { ShieldCheck, Ticket, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    seedData();
    const user = signIn(email, password);
    if (!user) {
      setError("Credenciales inválidas.");
      return;
    }
    if (user.role !== "admin") {
      setError("Esta cuenta no tiene permisos de administrador.");
      return;
    }
    router.push("/admin");
  }

  function loginDemo() {
    seedData();
    const u = signIn("admin@abciregistro.app", "admin1234");
    if (u && u.role === "admin") router.push("/admin");
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
            <Button type="submit" variant="accent" size="lg" className="w-full">Ingresar al panel</Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-zinc-500">
            <div className="flex-1 border-t border-zinc-800" />
            <span>o</span>
            <div className="flex-1 border-t border-zinc-800" />
          </div>

          <Button onClick={loginDemo} variant="outline" size="lg" className="w-full border-zinc-700 text-white hover:bg-zinc-900">
            <Ticket className="w-4 h-4" /> Cuenta admin demo
          </Button>

          <div className="mt-5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-zinc-300">
            <p className="font-semibold text-amber-400 mb-1">Credenciales demo:</p>
            <p className="font-mono">admin@abciregistro.app / admin1234</p>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Si eres criador, <Link href="/iniciar-sesion" className="text-amber-500 hover:underline">inicia sesión aquí</Link>.
        </p>
      </div>
    </div>
  );
}
