import { SectionHeading } from "@/components/ui";

const sections = [
  {
    title: "1. Honesty in registration",
    body: "Every dog registered must be accurately described. Falsifying parentage, color, breed, microchip or DOB is grounds for immediate suspension of all certificates tied to your account.",
  },
  {
    title: "2. Welfare first",
    body: "We do not tolerate breeding programs that prioritize aesthetics over health. Members must comply with welfare laws in their jurisdiction. Reports of malnutrition, overbreeding (5+ litters per female lifetime) or unhealthy housing conditions are investigated.",
  },
  {
    title: "3. Truthful marketing",
    body: "Marketplace listings must reference an authentic certificate ID where applicable. Misleading claims about lineage, titles, or weight projections are prohibited.",
  },
  {
    title: "4. Respect in the community",
    body: "BullyPedex is a global community. Harassment, slurs, threats and impersonation are not tolerated in any public area — comments, breeder profiles, or messaging.",
  },
  {
    title: "5. Ownership transparency",
    body: "Always transfer registration when ownership changes. Selling a dog without transferring the certificate undermines the registry and is a violation of this code.",
  },
  {
    title: "6. Reporting violations",
    body: "Members can report violations anonymously through the Contact form. Our integrity team reviews every report within 5 business days.",
  },
];

export default function CodeOfConductPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading eyebrow="Community Standards" title="BullyPedex Code of Conduct" description="The integrity of our registry depends on every member. By creating an account, you agree to uphold these standards." />
      <div className="mt-10 space-y-5">
        {sections.map(s => (
          <div key={s.title} className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="font-bold text-lg">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 text-xs text-muted-foreground text-center">Last updated: January 2026</p>
    </div>
  );
}
