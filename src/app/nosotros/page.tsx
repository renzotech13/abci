import { Card, SectionHeading, LinkButton } from "@/components/ui";
import { Target, FlaskConical } from "lucide-react";

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-amber-500 font-semibold text-sm tracking-widest uppercase">Sobre ABCI World Wide</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">Un registro hecho por criadores, para criadores.</h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">All Breeders Cynologique International nació para documentar la genealogía canina y mantener un historial genético confiable en toda Latinoamérica.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-5">
        {[
          { num: "29,000+", label: "Ejemplares en la base de datos" },
          { num: "2,400+", label: "Criaderos activos" },
          { num: "18", label: "Países de Latinoamérica" },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <p className="text-4xl font-bold text-amber-500">{s.num}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 space-y-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 text-amber-500" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-amber-500 font-semibold text-xs tracking-widest uppercase mb-2">Nuestra misión</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Documentar la genética canina con integridad</h2>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          ABCI World Wide existe para emitir documentos que respalden la genealogía de cada ejemplar y mantener un historial genético verificable. Promovemos la cría responsable y las prácticas que benefician la salud, el carácter y el comportamiento del perro como compañero de vida.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Cada certificado emitido por ABCI lleva un número único, un código QR a prueba de fraude y queda registrado de forma permanente. Los compradores, jueces y criaderos pueden verificar la autenticidad de cualquier documento en segundos, sin necesidad de cuenta.
        </p>

        <div className="flex items-start gap-4 mt-12">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <FlaskConical className="w-6 h-6 text-amber-500" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-amber-500 font-semibold text-xs tracking-widest uppercase mb-2">Lo que viene</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">El siguiente capítulo es la genética molecular</h2>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Para finales de 2026, cada certificado ABCI podrá incluir opcionalmente un hash de ADN calculado a partir de una muestra verificada en laboratorios acreditados. Esto eliminará la última fuente de fraude en pedigrees y abrirá el camino a información genética real para criadores.
        </p>

        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-8 text-center mt-12">
          <h3 className="text-xl font-bold">Únete al registro</h3>
          <p className="text-sm text-muted-foreground mt-2">Cuenta gratuita. Certificado instantáneo. Sin tarjeta de crédito.</p>
          <LinkButton href="/registrarse" variant="accent" className="mt-4">Empezar</LinkButton>
        </div>
      </section>
    </div>
  );
}
