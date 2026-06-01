import { Card, SectionHeading, LinkButton } from "@/components/ui";

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-amber-600 font-semibold text-sm tracking-widest uppercase">About BullyPedex</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">A registry built by breeders, for breeders.</h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">We started in 2018 as a side project to verify pedigrees in our own kennel. Today we power 847,000+ registrations across 47 countries.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-5">
        {[
          { num: "847K+", label: "Dogs in database" },
          { num: "12.4K", label: "Active kennels" },
          { num: "47", label: "Countries" },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <p className="text-4xl font-bold">{s.num}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 space-y-8">
        <SectionHeading eyebrow="Our story" title="From paper papers to a global database" />
        <p className="text-muted-foreground leading-relaxed">In 2018, our founder Marcus was selling a litter of pocket bullies. Three different buyers asked for paper pedigrees scanned and emailed. The fourth buyer pointed out that the scans could easily be faked. That weekend, the first prototype of BullyPedex was born.</p>
        <p className="text-muted-foreground leading-relaxed">We launched with a simple promise: every certificate would be unique, scannable, and verifiable without an account. Eight years later, we are the largest bully-focused registry in the world.</p>

        <SectionHeading eyebrow="What's next" title="The next chapter is genetics" />
        <p className="text-muted-foreground leading-relaxed">By the end of 2026, every BullyPedex certificate will optionally include a DNA hash, computed from a verified sample at an accredited lab. This will eliminate the last source of pedigree fraud — and unlock real genetic insights for breeders.</p>

        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-8 text-center mt-12">
          <h3 className="text-xl font-bold">Join the registry</h3>
          <p className="text-sm text-muted-foreground mt-2">Free account. Instant certificate. No credit card.</p>
          <LinkButton href="/register" variant="accent" className="mt-4">Get started</LinkButton>
        </div>
      </section>
    </div>
  );
}
