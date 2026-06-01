"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, seedData } from "@/lib/store";
import { Button, Input, Label, Card } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", kennelName: "", country: "",
  });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    seedData();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const user = signUp(form);
    if (!user) {
      setError("An account with this email already exists.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Join BullyPedex</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create a free kennel account. Register your first dog in minutes.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@kennel.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </div>
          <div>
            <Label htmlFor="kennel">Kennel name <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="kennel" value={form.kennelName} onChange={e => setForm({ ...form, kennelName: e.target.value })} placeholder="Crown Bullies Kennel" />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="United States" />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" variant="accent" size="lg" className="w-full">Create free account</Button>
          <p className="text-xs text-muted-foreground text-center">
            By signing up you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/code-of-conduct" className="underline">Code of Conduct</Link>.
          </p>
        </form>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-amber-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
