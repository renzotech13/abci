import Link from "next/link";
import { LinkButton, Badge, Card, SectionHeading } from "@/components/ui";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute inset-0 bg-radial-fade" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="accent" className="mb-5">🏆 #1 Bully Community in the World</Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                The global registry where every <span className="text-amber-500">bully bloodline</span> lives forever.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                Digital and physical BPKC certifications, AI-powered breed analysis, multi-generation pedigrees, and a marketplace trusted by 12,000+ kennels in 47 countries.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/register" variant="accent" size="lg">
                  Register a dog →
                </LinkButton>
                <LinkButton href="/verify" variant="outline" size="lg">
                  Verify a certificate
                </LinkButton>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500" /> Globally Recognized BPKC™
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex w-2 h-2 rounded-full bg-amber-500" /> Tamper-proof QR
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex w-2 h-2 rounded-full bg-sky-500" /> Instant digital
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 via-rose-500/10 to-transparent blur-3xl rounded-3xl" />
              <div className="relative rounded-3xl border border-border bg-card p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Certificate ID</p>
                    <p className="font-mono font-semibold">BPX-2025-DIESEL-01</p>
                  </div>
                  <Badge variant="success">VERIFIED</Badge>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-background to-rose-500/5 border border-border p-6 cert-watermark">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Registered Dog</p>
                      <h3 className="text-2xl font-bold mt-1">Crown's Diesel Prime</h3>
                      <p className="text-sm text-muted-foreground">American Bully — XL</p>
                    </div>
                    <div className="text-5xl animate-float-slow">🐕</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-background/60 border border-border">
                      <p className="text-muted-foreground">Sire</p>
                      <p className="font-semibold mt-0.5">CH Black Zeus</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/60 border border-border">
                      <p className="text-muted-foreground">Dam</p>
                      <p className="font-semibold mt-0.5">CH Silver Luna</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/60 border border-border">
                      <p className="text-muted-foreground">DOB</p>
                      <p className="font-semibold mt-0.5">Jan 15, 2024</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/60 border border-border">
                      <p className="text-muted-foreground">Color</p>
                      <p className="font-semibold mt-0.5">Chocolate Tri</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <p className="text-muted-foreground">Issued by BullyPedex Registry</p>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-3 rounded-sm bg-foreground" />
                    <span className="w-1 h-3 rounded-sm bg-foreground" />
                    <span className="w-2 h-3 rounded-sm bg-foreground" />
                    <span className="w-1 h-3 rounded-sm bg-foreground" />
                    <span className="w-1.5 h-3 rounded-sm bg-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: "847K+", label: "Dogs registered" },
              { num: "12.4K", label: "Active kennels" },
              { num: "47", label: "Countries" },
              { num: "1.2M", label: "Monthly views" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5 text-center">
                <p className="text-3xl font-bold tracking-tight">{s.num}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading eyebrow="What we do" title="Everything you need to register, prove and grow your bloodlines" description="From single-dog registration to multi-generational pedigrees, ownership transfers, and breed-wide analytics." />
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: "📜", title: "Digital BPKC Papers", desc: "Instant digital and physical certificates with a tamper-evident QR. Globally recognized." },
            { icon: "🧬", title: "Multi-Gen Pedigree", desc: "Interactive 5-generation pedigree trees with COI calculator and inbreeding alerts." },
            { icon: "👪", title: "Bulk Litter Registration", desc: "Register an entire litter in minutes with auto-linked sire/dam relationships." },
            { icon: "🔁", title: "Ownership Transfers", desc: "Securely transfer ownership with verified email-based signatures and audit trail." },
            { icon: "🔎", title: "Pedigree Search", desc: "Full-text search across 847K+ dogs by registry, kennel, sire, dam or bloodline." },
            { icon: "✅", title: "Certificate Verification", desc: "Buyers verify any BullyPedex paper in seconds — no account needed." },
          ].map(f => (
            <Card key={f.title} className="hover:border-amber-500/40 hover:shadow-lg transition">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ADDED VALUE FEATURES */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <SectionHeading eyebrow="What's new" title="Beyond just paperwork" description="Tools that make BullyPedex more than a registry — a full ecosystem for breeders and owners." />
            <Badge variant="accent">2026 Release</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "🤖", title: "AI Breed Analyzer", desc: "Upload a photo. Our model identifies bully variant (Pocket, Standard, XL, Extreme, Classic) and color genetics in seconds.", href: "/dna-analyzer", tag: "AI" },
              { icon: "🛒", title: "Verified Marketplace", desc: "Buy and sell puppies, adults and stud service — every listing tied to a verified pedigree.", href: "/marketplace", tag: "NEW" },
              { icon: "📅", title: "Events Calendar", desc: "ABKC shows, expos, meetups. Filter by country and register from one place.", href: "/events", tag: "NEW" },
              { icon: "❤️", title: "Health Vault", desc: "Track vaccinations, OFA results, weight and vet history. Sync to certificates automatically.", href: "/dashboard/health", tag: "NEW" },
            ].map(f => (
              <Link key={f.title} href={f.href} className="group rounded-2xl border border-border bg-card p-6 hover:border-amber-500/50 hover:shadow-xl transition relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Badge variant="accent">{f.tag}</Badge>
                </div>
                <div className="text-4xl">{f.icon}</div>
                <h3 className="mt-4 text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                  Try it now <span className="group-hover:translate-x-1 transition">→</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading eyebrow="3-step process" title="Register in under 4 minutes" center />
        <div className="mt-14 grid md:grid-cols-3 gap-6 relative">
          {[
            { n: "01", title: "Create your kennel profile", desc: "Free account, kennel name, country, contact info. Optional but boosts trust." },
            { n: "02", title: "Add your dog & lineage", desc: "DOB, color, microchip, sire and dam (link to existing or enter manually)." },
            { n: "03", title: "Receive digital papers", desc: "Instant certificate ID and QR. Order physical papers anytime from your dashboard." },
          ].map(s => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-8 relative">
              <span className="absolute -top-3 left-6 inline-flex w-14 h-7 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold tracking-widest">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading eyebrow="Trusted globally" title="What top kennels say" />
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { q: "We replaced 3 paper registries with BullyPedex. Buyers actually trust the QR — instant verification on their phone.", n: "Marco Diaz", k: "Empire Bullies Kennel, Texas" },
            { q: "The bulk litter tool saves me an entire afternoon every drop. And the pedigree tree is gorgeous.", n: "Sasha Kim", k: "Kim Bloodline, South Korea" },
            { q: "I've sold pups internationally with zero pedigree disputes. The audit trail is what convinced me to switch.", n: "Carlos Rocha", k: "Brazilian Royalty, São Paulo" },
          ].map(t => (
            <Card key={t.n}>
              <div className="text-amber-500 mb-3">★★★★★</div>
              <p className="text-sm leading-relaxed">"{t.q}"</p>
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-sm font-semibold">{t.n}</p>
                <p className="text-xs text-muted-foreground">{t.k}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-foreground to-foreground/95 text-background p-12 sm:p-16 text-center">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to give your bloodline a global passport?</h2>
            <p className="mt-3 text-base opacity-80 max-w-xl mx-auto">Join 12,400+ kennels worldwide. Free account, no credit card.</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <LinkButton href="/register" variant="accent" size="lg">Create free account</LinkButton>
              <LinkButton href="/membership" variant="outline" size="lg" className="border-background/30 text-background hover:bg-background/10">Compare plans</LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
