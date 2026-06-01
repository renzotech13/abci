import { SectionHeading } from "@/components/ui";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading eyebrow="Legal" title="Cookie Policy" />
      <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
        We use a small number of first-party cookies and browser local storage to keep you signed in, remember your theme preference, and maintain your draft registrations. We do not use third-party advertising cookies. You can clear cookies and local storage from your browser settings at any time without affecting your account or registrations.
      </p>
    </div>
  );
}
