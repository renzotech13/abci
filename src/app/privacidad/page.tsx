import { SectionHeading } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading eyebrow="Legal" title="Política de privacidad" description="Última actualización: enero de 2026" />
      <div className="mt-10 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <Section title="Qué información recopilamos">
          Recopilamos los datos que proporcionas al crear una cuenta (nombre, correo, país) y los ejemplares y certificados que decides registrar. No vendemos tus datos personales.
        </Section>
        <Section title="Cómo la usamos">
          Usamos esta información para emitir certificados, verificar pedigrees y operar el registro. Podemos utilizar estadísticas anónimas agregadas para investigación.
        </Section>
        <Section title="Qué compartimos">
          La información pública (nombre del criadero, ejemplares registrados, números de certificado) es buscable. Los datos privados (correo, teléfono, facturación) nunca se comparten con terceros sin tu consentimiento.
        </Section>
        <Section title="Cookies">
          Usamos cookies propias para mantener tu sesión y guardar tus preferencias de tema. No utilizamos cookies publicitarias de terceros.
        </Section>
        <Section title="Tus derechos">
          Puedes solicitar la exportación, corrección o eliminación de tus datos en cualquier momento contactándonos.
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
