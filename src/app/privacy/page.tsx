import { SectionHeading } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading eyebrow="Legal" title="Privacy Policy" description="Last updated: January 2026" />
      <div className="mt-10 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <Section title="What we collect">
          We collect the information you provide when creating an account (name, email, country) and the dogs and certificates you choose to register. We do not sell your personal data.
        </Section>
        <Section title="How we use it">
          We use this information to issue certificates, verify pedigrees, and operate the registry. We may use aggregated, anonymized statistics for research.
        </Section>
        <Section title="What we share">
          Public information (kennel name, registered dogs, certificate IDs) is searchable. Private data (email, phone, billing) is never shared with third parties without your consent.
        </Section>
        <Section title="Cookies">
          We use first-party cookies for session and theme preferences. No third-party advertising cookies.
        </Section>
        <Section title="Your rights">
          You may request data export, correction or deletion at any time by contacting us.
        </Section>
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
