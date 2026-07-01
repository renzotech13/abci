import Link from "next/link";
import { Logo } from "./Logo";
import { Camera, Play, Music2, Smartphone, Globe } from "lucide-react";

export function Footer() {
  const links = {
    "Servicios": [
      { href: "/membresia", label: "Planes de membresía" },
      { href: "/verificar", label: "Verificar certificado" },
      { href: "/ejemplares", label: "Buscar ejemplares" },
      { href: "/analisis-ia", label: "Análisis IA de raza" },
    ],
    "Comunidad": [
      { href: "/criaderos", label: "Criaderos" },
      { href: "/afijos", label: "Afijos" },
      { href: "/mercado", label: "Mercado" },
      { href: "/eventos", label: "Eventos" },
      { href: "/blog", label: "Blog" },
    ],
    "Recursos": [
      { href: "/codigo-de-conducta", label: "Código de conducta" },
      { href: "/nosotros", label: "Nosotros" },
      { href: "/contacto", label: "Contacto" },
      { href: "/ayuda", label: "Centro de ayuda" },
    ],
  };
  const socials = [
    { Icon: Globe, label: "Facebook" },
    { Icon: Camera, label: "Instagram" },
    { Icon: Play, label: "YouTube" },
    { Icon: Music2, label: "TikTok" },
  ];
  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Logo size="large" />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              El registro internacional canino más confiable de Latinoamérica. Documentamos la genealogía de tu ejemplar y mantenemos un historial genético verificable globalmente.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label} className="inline-flex w-9 h-9 rounded-full bg-background border border-border items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-500 transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="mt-5">
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> App móvil disponible</p>
              <div className="mt-2 flex gap-2">
                <a href="#" className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted hover:border-amber-500/40">Google Play</a>
                <a href="#" className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted hover:border-amber-500/40">App Store</a>
              </div>
            </div>
          </div>
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold mb-3">{section}</h4>
              <ul className="space-y-2">
                {items.map(i => (
                  <li key={i.href}>
                    <Link href={i.href} className="text-sm text-muted-foreground hover:text-amber-500 transition">{i.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© 2026 ABCI World Wide — All Breeders Cynologique International. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacidad" className="hover:text-amber-500">Privacidad</Link>
            <Link href="/terminos" className="hover:text-amber-500">Términos</Link>
            <Link href="/cookies" className="hover:text-amber-500">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
