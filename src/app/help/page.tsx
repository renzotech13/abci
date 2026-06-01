"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Input, Badge, SectionHeading } from "@/components/ui";

const ARTICLES = [
  { cat: "Registration", title: "How to register your first dog", time: "3 min", href: "/dashboard/dogs/add" },
  { cat: "Registration", title: "Bulk litter registration walkthrough", time: "5 min", href: "/dashboard/litter" },
  { cat: "Certificates", title: "What's on a BPKC certificate?", time: "2 min", href: "/blog/how-to-guide-on-bully-pedigrees" },
  { cat: "Certificates", title: "Verifying a certificate (for buyers)", time: "1 min", href: "/verify" },
  { cat: "Transfers", title: "Initiating an ownership transfer", time: "4 min", href: "/dashboard/transfers" },
  { cat: "Membership", title: "Comparing Free, Pro and Elite", time: "3 min", href: "/membership" },
  { cat: "AI Tools", title: "How accurate is the breed analyzer?", time: "2 min", href: "/dna-analyzer" },
  { cat: "Marketplace", title: "Publishing your first listing", time: "3 min", href: "/dashboard/listings" },
];

export default function HelpPage() {
  const [q, setQ] = useState("");
  const filtered = ARTICLES.filter(a => !q || `${a.cat} ${a.title}`.toLowerCase().includes(q.toLowerCase()));
  const cats = Array.from(new Set(ARTICLES.map(a => a.cat)));
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <SectionHeading eyebrow="Help Center" title="How can we help?" description="Quick guides, walkthroughs and answers to common questions." center />
      <div className="mt-8 max-w-xl mx-auto">
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search help articles..." />
      </div>
      <div className="mt-10 space-y-8">
        {cats.map(c => {
          const items = filtered.filter(a => a.cat === c);
          if (items.length === 0) return null;
          return (
            <div key={c}>
              <h2 className="text-xl font-bold mb-4">{c}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {items.map(a => (
                  <Link key={a.title} href={a.href} className="block">
                    <Card className="hover:border-amber-500/40 transition flex items-center gap-3">
                      <div className="text-2xl">📖</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.time} read</p>
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
