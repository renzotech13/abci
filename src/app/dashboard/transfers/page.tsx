"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getMyDogs, getMyTransfers, addTransfer, updateTransfer } from "@/lib/store";
import type { Dog, Transfer } from "@/lib/types";
import { Card, Button, Input, Label, Select, Badge, Empty } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";

export default function TransfersPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [creating, setCreating] = useState(false);
  const [dogId, setDogId] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setDogs(getMyDogs());
    setTransfers(getMyTransfers());
  }, []);

  function refresh() {
    setTransfers(getMyTransfers());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dog = dogs.find(d => d.id === dogId);
    if (!dog) return;
    addTransfer({ dogId, fromUserId: dog.ownerId, toEmail, notes });
    setCreating(false);
    setDogId(""); setToEmail(""); setNotes("");
    refresh();
  }

  function approve(id: string) {
    updateTransfer(id, { status: "approved", completedAt: new Date().toISOString() });
    refresh();
  }

  function cancel(id: string) {
    updateTransfer(id, { status: "rejected" });
    refresh();
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ownership Transfers</h1>
          <p className="text-sm text-muted-foreground mt-1">Securely transfer ownership of any registered dog by email.</p>
        </div>
        {!creating && <Button variant="accent" onClick={() => setCreating(true)}>+ New transfer</Button>}
      </div>

      {creating && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold">Initiate transfer</h2>
            <div>
              <Label htmlFor="d">Dog</Label>
              <Select id="d" required value={dogId} onChange={e => setDogId(e.target.value)}>
                <option value="">Select dog to transfer...</option>
                {dogs.map(d => <option key={d.id} value={d.id}>{d.name} — {d.certificateId}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="e">Recipient email</Label>
              <Input id="e" type="email" required value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="new-owner@example.com" />
              <p className="text-xs text-muted-foreground mt-1">Recipient will receive an email to confirm and accept ownership.</p>
            </div>
            <div>
              <Label htmlFor="n">Notes</Label>
              <Input id="n" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional message" />
            </div>
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit" variant="accent">Send transfer request</Button>
            </div>
          </form>
        </Card>
      )}

      {transfers.length === 0 ? (
        !creating && <Empty title="No transfers yet" description="When you transfer ownership of a dog, the audit trail will appear here." />
      ) : (
        <div className="space-y-3">
          {transfers.map(t => {
            const dog = dogs.find(d => d.id === t.dogId);
            return (
              <Card key={t.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{dog?.name || "Dog"}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{dog?.certificateId}</p>
                    <p className="text-sm mt-2">To: <span className="font-medium">{t.toEmail}</span></p>
                    <p className="text-xs text-muted-foreground">Requested {formatShortDate(t.requestedAt)}</p>
                    {t.notes && <p className="text-sm text-muted-foreground mt-2 italic">"{t.notes}"</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={t.status === "approved" ? "success" : t.status === "rejected" ? "default" : "warning"}>
                      {t.status === "pending" ? "⏳ Pending" : t.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                    </Badge>
                    {t.status === "pending" && (
                      <div className="flex gap-2">
                        <Button onClick={() => cancel(t.id)} variant="ghost" size="sm">Cancel</Button>
                        <Button onClick={() => approve(t.id)} variant="accent" size="sm">Simulate approve</Button>
                      </div>
                    )}
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
