"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getCurrentUser, updateUser } from "@/lib/store";
import type { User } from "@/lib/types";
import { Card, Button, Input, Label, Textarea, Badge } from "@/components/ui";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      setForm(u);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updated = updateUser(form);
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile & Kennel</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your public kennel profile and contact info.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold">Account info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="n">Full name</Label>
                <Input id="n" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="e">Email</Label>
                <Input id="e" type="email" value={form.email || ""} disabled />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="k">Kennel name</Label>
                <Input id="k" value={form.kennelName || ""} onChange={e => setForm({ ...form, kennelName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="c">Country</Label>
                <Input id="c" value={form.country || ""} onChange={e => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="p">Phone</Label>
              <Input id="p" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="b">Bio</Label>
              <Textarea id="b" rows={4} value={form.bio || ""} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell the community about your kennel..." />
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <Button type="submit" variant="accent">Save changes</Button>
              {saved && <span className="text-sm text-emerald-600">✓ Saved</span>}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Membership</p>
            <div className="mt-2">
              <Badge variant={user.membership === "free" ? "default" : "accent"}>
                {user.membership === "free" ? "Free Plan" : user.membership === "pro" ? "Pro Member" : "Elite Member"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {user.membership === "free" ? "Upgrade for lower registration fees, bulk litter discounts and priority support." : "Thanks for being a supporter — enjoy reduced fees and priority features."}
            </p>
            <a href="/membership" className="block mt-4 text-center text-sm font-medium text-amber-600 hover:underline">
              {user.membership === "free" ? "Compare plans →" : "Manage membership →"}
            </a>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Account</p>
            <p className="text-sm mt-2">Member since {new Date(user.createdAt).getFullYear()}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{user.id}</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
