import { SectionHeading } from "@/components/ui";

const sections = [
  {
    title: "1. Honestidad en el registro",
    body: "Cada ejemplar registrado debe describirse con veracidad. Falsificar parentesco, color, raza, microchip o fecha de nacimiento es motivo de suspensión inmediata de todos los certificados ligados a la cuenta.",
  },
  {
    title: "2. Bienestar animal",
    body: "No toleramos programas de cría que prioricen la estética sobre la salud. Los miembros deben cumplir con las leyes de bienestar animal de su jurisdicción. Reportes de desnutrición, sobre-cría (más de 5 camadas por hembra durante su vida) o malas condiciones de alojamiento son investigados.",
  },
  {
    title: "3. Marketing veraz",
    body: "Los anuncios en el Mercado deben referenciar un número de certificado real cuando corresponda. Las afirmaciones engañosas sobre líneas, títulos o proyecciones de peso están prohibidas.",
  },
  {
    title: "4. Respeto en la comunidad",
    body: "ABCI World Wide es una comunidad latinoamericana. El acoso, los insultos, las amenazas y la suplantación de identidad no se toleran en ningún espacio público: comentarios, perfiles de criadero o mensajería.",
  },
  {
    title: "5. Transparencia en la propiedad",
    body: "Siempre transfiere el registro cuando cambie la propiedad del ejemplar. Vender un ejemplar sin traspasar el certificado debilita el registro y constituye una violación de este código.",
  },
  {
    title: "6. Reporte de violaciones",
    body: "Los miembros pueden reportar violaciones de forma anónima a través del formulario de Contacto. Nuestro equipo de integridad revisa cada reporte en un plazo máximo de 5 días hábiles.",
  },
];

export default function CodeOfConductPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading eyebrow="Estándares de la comunidad" title="Código de conducta ABCI" description="La integridad de nuestro registro depende de cada miembro. Al crear una cuenta, aceptas mantener estos estándares." />
      <div className="mt-10 space-y-5">
        {sections.map(s => (
          <div key={s.title} className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="font-bold text-lg">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 text-xs text-muted-foreground text-center">Última actualización: enero de 2026</p>
    </div>
  );
}
