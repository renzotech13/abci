import { SectionHeading } from "@/components/ui";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading eyebrow="Legal" title="Terms of Service" description="Last updated: January 2026" />
      <div className="mt-10 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>By using BullyPedex you agree to these terms. Please also read our <a href="/code-of-conduct" className="text-amber-600 underline">Code of Conduct</a>.</p>
        <Section title="Eligibility">You must be at least 18 years old to register dogs and issue certificates.</Section>
        <Section title="Accurate information">Every registration must be truthful. Falsifying information voids the certificate and may result in account termination.</Section>
        <Section title="Membership and billing">Paid plans renew monthly. Cancel anytime from your dashboard. Refunds within 14 days of first charge.</Section>
        <Section title="Intellectual property">The BullyPedex name, logo, BPKC mark and certificate template designs are trademarks owned by BullyPedex Inc.</Section>
        <Section title="Limitation of liability">We provide the registry &quot;as is&quot;. We are not responsible for disputes between buyers and sellers, only for the integrity of registered records.</Section>
        <Section title="Governing law">These terms are governed by the laws of the State of Florida, USA.</Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
