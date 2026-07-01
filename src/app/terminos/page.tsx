import { SectionHeading } from "@/components/ui";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading eyebrow="Legal" title="Términos de servicio" description="Última actualización: enero de 2026" />
      <div className="mt-10 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>Al utilizar ABCI World Wide aceptas estos términos. Lee también nuestro <a href="/codigo-de-conducta" className="text-blue-600 underline">Código de Conducta</a>.</p>
        <Section title="Elegibilidad">Debes ser mayor de 18 años para registrar ejemplares y emitir certificados.</Section>
        <Section title="Información veraz">Cada registro debe ser verdadero. Falsificar información invalida el certificado y puede resultar en la cancelación de la cuenta.</Section>
        <Section title="Membresía y facturación">Los planes pagos se renuevan mensualmente. Cancela en cualquier momento desde tu panel. Reembolsos dentro de los 14 días posteriores al primer cobro.</Section>
        <Section title="Propiedad intelectual">El nombre ABCI World Wide, el logotipo, la marca y los diseños de certificados son propiedad de ABCI World Wide.</Section>
        <Section title="Limitación de responsabilidad">Brindamos el registro &quot;tal como está&quot;. No somos responsables por disputas entre compradores y vendedores, solo por la integridad de los registros oficiales.</Section>
        <Section title="Ley aplicable">Estos términos se rigen por las leyes peruanas y los tratados internacionales aplicables.</Section>
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
