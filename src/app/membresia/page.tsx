import { Card, Badge, LinkButton, SectionHeading } from "@/components/ui";
import { Star, Check } from "lucide-react";

const PLANS = [
  {
    name: "Gratuito",
    price: 0,
    description: "Para empezar con el registro de un solo ejemplar.",
    features: [
      "1 registro de ejemplar incluido",
      "Certificado digital estándar",
      "QR verificable ABCI",
      "Búsqueda pública de pedigrees",
      "Verificación de certificados",
    ],
    cta: "Empezar gratis",
    accent: false,
  },
  {
    name: "Pro",
    price: 9,
    description: "Para criadores activos con 1 a 3 camadas al año.",
    features: [
      "Registros de ejemplares ilimitados",
      "30% de descuento en tarifas",
      "Registro masivo de camada",
      "Hasta 25 traspasos al año",
      "Soporte prioritario por correo",
      "Bóveda de salud ilimitada",
      "Anuncios en el Mercado",
      "Hasta 3 afijos",
    ],
    cta: "Hazme Pro",
    accent: true,
  },
  {
    name: "Elite",
    price: 29,
    description: "Para criaderos de tiempo completo y líneas de campeones.",
    features: [
      "Todo lo de Pro",
      "60% de descuento en tarifas",
      "Traspasos ilimitados",
      "Posicionamiento destacado",
      "Análisis IA ilimitado",
      "Asesor de cuenta dedicado",
      "Acceso API (próximamente)",
      "Branding personalizado",
      "Afijos ilimitados",
    ],
    cta: "Hazme Elite",
    accent: false,
  },
];

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <Badge variant="accent" className="mb-4">Membresía</Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">Planes para cada etapa de tu criadero</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Empieza gratis. Mejora tu plan cuando empieces a producir camadas. Cancela cuando quieras.</p>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {PLANS.map(p => (
          <Card key={p.name} className={p.accent ? "relative border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-2xl" : ""}>
            {p.accent && (
              <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Star className="w-3 h-3 fill-current" /> Más popular
              </Badge>
            )}
            <h3 className="text-2xl font-bold">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-bold">${p.price}</span>
              <span className="text-muted-foreground">USD/mes</span>
            </div>
            <LinkButton href="/registrarse" variant={p.accent ? "accent" : "outline"} className="mt-6 w-full">{p.cta}</LinkButton>
            <ul className="mt-6 space-y-2.5">
              {p.features.map(f => (
                <li key={f} className="text-sm flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-20">
        <SectionHeading center title="Preguntas frecuentes" />
        <div className="mt-10 max-w-2xl mx-auto space-y-3">
          {[
            { q: "¿Puedo cancelar mi membresía?", a: "Sí, en cualquier momento desde tu panel. Mantienes el acceso hasta el final del periodo facturado." },
            { q: "¿Pierdo mis certificados si bajo de plan?", a: "Nunca. Todos los certificados emitidos siguen siendo válidos para siempre, sin importar el plan que tengas." },
            { q: "¿Cómo funcionan las tarifas por registro?", a: "Plan Gratuito: $15 USD por ejemplar. Pro: $10.50. Elite: $6. Los descuentos por camada se aplican encima." },
            { q: "¿Los documentos ABCI son reconocidos internacionalmente?", a: "Sí. ABCI World Wide es reconocido en 18 países de Latinoamérica y socios internacionales en Europa, Asia y Norteamérica." },
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
