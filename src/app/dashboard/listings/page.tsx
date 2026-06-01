"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getMarketplace, getCurrentUser, addListing } from "@/lib/store";
import type { MarketplaceListing, User } from "@/lib/types";
import { Card, Button, Input, Label, Select, Badge, Empty } from "@/components/ui";
import { currency, formatShortDate } from "@/lib/utils";

export default function MyListingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    type: "puppy" as MarketplaceListing["type"],
    title: "", description: "", price: "", location: "", image: "🐶",
  });

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) setListings(getMarketplace().filter(l => l.sellerId === u.id));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    addListing({
      type: form.type, title: form.title, description: form.description,
      price: Number(form.price), currency: "USD", location: form.location,
      sellerId: user.id, sellerName: user.kennelName || user.name, image: form.image,
    });
    setCreating(false);
    setForm({ type: "puppy", title: "", description: "", price: "", location: "", image: "🐶" });
    setListings(getMarketplace().filter(l => l.sellerId === user.id));
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Marketplace Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage what you have for sale.</p>
        </div>
        {!creating && <Button variant="accent" onClick={() => setCreating(true)}>+ New listing</Button>}
      </div>

      {creating && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold">Create listing</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="t">Type</Label>
                <Select id="t" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as MarketplaceListing["type"] })}>
                  <option value="puppy">Puppy</option>
                  <option value="adult">Adult Dog</option>
                  <option value="stud">Stud Service</option>
                  <option value="equipment">Equipment</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="p">Price (USD)</Label>
                <Input id="p" type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="tt">Title</Label>
              <Input id="tt" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="d">Description</Label>
              <Input id="d" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="l">Location</Label>
              <Input id="l" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Miami, FL" />
            </div>
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit" variant="accent">Publish</Button>
            </div>
          </form>
        </Card>
      )}

      {listings.length === 0 ? (
        !creating && <Empty title="No listings yet" description="Reach 12K+ verified breeders." action={<Button onClick={() => setCreating(true)} variant="accent">Create first listing</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {listings.map(l => (
            <Card key={l.id}>
              <div className="flex items-start gap-3">
                <div className="text-4xl">{l.image}</div>
                <div className="flex-1 min-w-0">
                  <Badge variant="accent" className="mb-2">{l.type.toUpperCase()}</Badge>
                  <h3 className="font-semibold">{l.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{l.location} • Posted {formatShortDate(l.posted)}</p>
                  <p className="text-lg font-bold mt-2 text-amber-600">{currency(l.price, l.currency)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
