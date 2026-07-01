import { SectionHeading } from "@/components/ui";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading eyebrow="Legal" title="Política de cookies" />
      <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
        Utilizamos un pequeño número de cookies propias y almacenamiento local del navegador para mantener tu sesión activa, recordar tu preferencia de tema (claro/oscuro) y conservar tus borradores de registro. No usamos cookies publicitarias de terceros. Puedes borrar las cookies y el almacenamiento local desde la configuración de tu navegador en cualquier momento, sin afectar tu cuenta ni tus registros.
      </p>
    </div>
  );
}
