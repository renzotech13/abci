"use client";

import { useState } from "react";
import { Card, Button, Input, Label, Textarea, Badge, SectionHeading } from "@/components/ui";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <Badge variant="accent" className="mb-4">Contact</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Talk to a real human</h1>
        <p className="mt-3 text-muted-foreground">Our team responds to every message within 24 hours on weekdays.</p>
      </div>

      <div className="grid md:grid-cols-[2fr_1fr] gap-6">
        <Card>
          {sent ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">📨</div>
              <h3 className="text-xl font-bold">Message sent!</h3>
              <p className="text-muted-foreground mt-2">We'll get back to you at the email you provided.</p>
              <Button onClick={() => setSent(false)} variant="outline" className="mt-6">Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required />
                </div>
              </div>
              <div>
                <Label htmlFor="topic">Topic</Label>
                <select id="topic" className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm">
                  <option>General question</option>
                  <option>Registration help</option>
                  <option>Certificate verification issue</option>
                  <option>Report a violation</option>
                  <option>Membership / billing</option>
                  <option>Press / partnership</option>
                </select>
              </div>
              <div>
                <Label htmlFor="msg">Message</Label>
                <Textarea id="msg" rows={6} required placeholder="How can we help?" />
              </div>
              <Button type="submit" variant="accent" size="lg" className="w-full">Send message</Button>
            </form>
          )}
        </Card>

        <div className="space-y-4">
          {[
            { icon: "📧", t: "Email", v: "hello@bullypedex.app" },
            { icon: "💬", t: "Live chat", v: "Mon–Fri, 9am–6pm EST" },
            { icon: "📞", t: "Phone (US)", v: "+1 (305) 555-0190" },
            { icon: "🏢", t: "HQ", v: "Miami, FL — USA" },
          ].map(c => (
            <Card key={c.t}>
              <div className="text-xl">{c.icon}</div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">{c.t}</p>
              <p className="font-medium mt-1">{c.v}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
