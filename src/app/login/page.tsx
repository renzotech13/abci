"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, seedData } from "@/lib/store";
import { Button, Input, Label, Card } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    seedData();
    const user = signIn(email, password);
    if (!user) {
      setError("Invalid email or password. Try the demo account below.");
      return;
    }
    router.push("/dashboard");
  }

  function loginDemo() {
    seedData();
    const u = signIn("demo@bullypedex.app", "demo1234");
    if (u) router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your kennel and certificates.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@kennel.com" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="password" className="mb-0">Password</Label>
              <Link href="#" className="text-xs text-amber-600 hover:underline">Forgot?</Link>
            </div>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" variant="accent" size="lg" className="w-full">Sign in</Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 border-t border-border" />
          <span>or</span>
          <div className="flex-1 border-t border-border" />
        </div>
        <Button onClick={loginDemo} variant="outline" size="lg" className="w-full">
          🎟 Try with demo account
        </Button>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account? <Link href="/register" className="text-amber-600 font-medium hover:underline">Join free</Link>
      </p>
    </div>
  );
}
