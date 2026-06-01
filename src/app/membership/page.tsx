import { Card, Badge, LinkButton, SectionHeading } from "@/components/ui";

const PLANS = [
  {
    name: "Free",
    price: 0,
    description: "Get started with single-dog registration.",
    features: [
      "1 dog registration included",
      "Standard digital certificate",
      "BPKC™ verified QR",
      "Public pedigree search",
      "Verify any certificate",
    ],
    cta: "Start free",
    accent: false,
  },
  {
    name: "Pro",
    price: 12,
    description: "For active breeders running 1–3 litters per year.",
    features: [
      "Unlimited dog registrations",
      "30% off all registration fees",
      "Bulk litter registration",
      "Up to 25 transfers/year",
      "Priority email support",
      "Health Vault unlimited",
      "Listings on Marketplace",
    ],
    cta: "Go Pro",
    accent: true,
  },
  {
    name: "Elite",
    price: 49,
    description: "For full-time kennels and championship lines.",
    features: [
      "Everything in Pro",
      "60% off all registration fees",
      "Unlimited transfers",
      "Featured kennel placement",
      "AI Breed Analyzer unlimited",
      "Dedicated account manager",
      "API access (coming soon)",
      "Custom certificate branding",
    ],
    cta: "Become Elite",
    accent: false,
  },
];

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <Badge variant="accent" className="mb-4">Membership</Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">Plans built for every stage of your kennel</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Start free. Upgrade when you start producing litters. Cancel anytime.</p>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {PLANS.map(p => (
          <Card key={p.name} className={p.accent ? "relative border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-2xl" : ""}>
            {p.accent && <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2">⭐ Most popular</Badge>}
            <h3 className="text-2xl font-bold">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-bold">${p.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <LinkButton href="/register" variant={p.accent ? "accent" : "outline"} className="mt-6 w-full">{p.cta}</LinkButton>
            <ul className="mt-6 space-y-2.5">
              {p.features.map(f => (
                <li key={f} className="text-sm flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-20">
        <SectionHeading center title="Frequently asked questions" />
        <div className="mt-10 max-w-2xl mx-auto space-y-3">
          {[
            { q: "Can I cancel anytime?", a: "Yes. Cancel from your dashboard. You keep access until the end of the billing period." },
            { q: "Do I lose my certificates if I downgrade?", a: "Never. All issued certificates remain valid forever, regardless of plan." },
            { q: "How do registration fees work?", a: "Free plan: $19.99/dog. Pro: $13.99/dog. Elite: $7.99/dog. Bulk litter discounts apply on top." },
            { q: "Is the BPKC paper globally recognized?", a: "Yes, in 47 countries including the US, Mexico, Brazil, Spain, UK, Japan and South Korea." },
          ].map(f => (
            <details key={f.q} className="rounded-2xl border border-border bg-card p-5">
              <summary className="font-semibold cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
