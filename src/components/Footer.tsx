import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  const links = {
    Product: [
      { href: "/membership", label: "Membership Plans" },
      { href: "/verify", label: "Verify Certificate" },
      { href: "/search", label: "Pedigree Search" },
      { href: "/dna-analyzer", label: "AI Breed Analyzer" },
    ],
    Community: [
      { href: "/breeders", label: "Breeder Directory" },
      { href: "/marketplace", label: "Marketplace" },
      { href: "/events", label: "Events Calendar" },
      { href: "/blog", label: "Blog" },
    ],
    Resources: [
      { href: "/code-of-conduct", label: "Code of Conduct" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/help", label: "Help Center" },
    ],
  };
  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Logo size="large" />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              The global pedigree database and certification registry for the bully breed community. Trusted by 12,000+ kennels worldwide.
            </p>
            <div className="mt-5 flex gap-2">
              {["X", "IG", "FB", "YT"].map(s => (
                <a key={s} href="#" className="inline-flex w-9 h-9 rounded-full bg-background border border-border items-center justify-center text-xs font-semibold hover:bg-amber-500 hover:text-black transition">
                  {s}
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold mb-3">{section}</h4>
              <ul className="space-y-2">
                {items.map(i => (
                  <li key={i.href}>
                    <Link href={i.href} className="text-sm text-muted-foreground hover:text-foreground">{i.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© 2026 BullyPedex Registry. All rights reserved. BPKC™ certified papers.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
