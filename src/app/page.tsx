import Link from "next/link";
import { LinkButton, Badge, Card, SectionHeading } from "@/components/ui";
import {
  Trophy, ShieldCheck, QrCode, Zap, FileText, GitBranch,
  Users2, ArrowLeftRight, Tag, Smartphone, Sparkles,
  ShoppingBag, CalendarDays, HeartPulse, ArrowRight,
  Star, Dog as DogIcon, Award,
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute inset-0 bg-radial-fade" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="accent" className="mb-5">
                <Trophy className="w-3.5 h-3.5" />
                El registro canino más confiable de Latinoamérica
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                Documenta y verifica la <span className="text-amber-500">genealogía</span> de tu ejemplar en línea.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                ABCI World Wide emite certificados oficiales con QR verificable, registra criaderos y afijos, y mantiene un historial genético internacional para criadores responsables.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/registrarse" variant="accent" size="lg">
                  Registrar un ejemplar
                  <ArrowRight className="w-4 h-4" />
                </LinkButton>
                <LinkButton href="/verificar" variant="outline" size="lg">
                  <QrCode className="w-4 h-4" />
                  Verificar certificado
                </LinkButton>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Reconocimiento internacional
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-amber-500" /> QR a prueba de fraude
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-500" /> Certificado digital instantáneo
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 via-amber-500/10 to-transparent blur-3xl rounded-3xl" />
              <div className="relative rounded-3xl border border-border bg-card p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nro. de registro ABCI</p>
                    <p className="font-mono font-semibold">29601</p>
                  </div>
                  <Badge variant="success"><ShieldCheck className="w-3 h-3" /> VERIFICADO</Badge>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 border border-border p-6 cert-watermark">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Ejemplar registrado</p>
                      <h3 className="text-2xl font-bold mt-1">FIGHTING BULL MILI</h3>
                      <p className="text-sm text-muted-foreground">American Bully — Pocket</p>
                    </div>
                    <DogIcon className="w-12 h-12 text-amber-500 animate-float-slow" strokeWidth={1.5} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-background/60 border border-border">
                      <p className="text-muted-foreground">Padre</p>
                      <p className="font-semibold mt-0.5">FIGHTING BULL KHABIT</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/60 border border-border">
                      <p className="text-muted-foreground">Madre</p>
                      <p className="font-semibold mt-0.5">FIGHTING BULL CARACHAMA</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/60 border border-border">
                      <p className="text-muted-foreground">Fecha de nacimiento</p>
                      <p className="font-semibold mt-0.5">12 de mayo de 2024</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/60 border border-border">
                      <p className="text-muted-foreground">Color</p>
                      <p className="font-semibold mt-0.5">Azul</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <p className="text-muted-foreground">Emitido por ABCI World Wide</p>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-3 rounded-sm bg-foreground" />
                    <span className="w-1 h-3 rounded-sm bg-foreground" />
                    <span className="w-2 h-3 rounded-sm bg-foreground" />
                    <span className="w-1 h-3 rounded-sm bg-foreground" />
                    <span className="w-1.5 h-3 rounded-sm bg-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: "29,000+", label: "Ejemplares registrados" },
              { num: "2,400+", label: "Criaderos activos" },
              { num: "18", label: "Países en Latinoamérica" },
              { num: "850K", label: "Vistas mensuales" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5 text-center">
                <p className="text-3xl font-bold tracking-tight text-amber-500">{s.num}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading eyebrow="Qué hacemos" title="Todo lo que necesitas para documentar tu genética canina" description="Desde el registro de un ejemplar hasta el manejo del afijo de tu criadero, traspaso de propiedad y verificación pública con QR." />
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { Icon: FileText, title: "Certificado oficial ABCI", desc: "Documento digital y físico con QR único, verificable globalmente sin necesidad de cuenta." },
            { Icon: GitBranch, title: "Pedigree genealógico", desc: "Árbol interactivo de hasta 4 generaciones con cálculo de coeficiente de consanguinidad (COI)." },
            { Icon: Users2, title: "Registro masivo de camada", desc: "Inscribe toda una camada en minutos. Los padres se vinculan automáticamente al pedigree." },
            { Icon: ArrowLeftRight, title: "Traspaso de propiedad", desc: "Transfiere la titularidad de tu ejemplar de forma segura con auditoría completa." },
            { Icon: Tag, title: "Afijo registrado", desc: "Protege el nombre de tu criadero con un afijo oficial reconocido en toda Latinoamérica." },
            { Icon: Smartphone, title: "Lector QR móvil", desc: "Cualquier comprador puede escanear el QR del certificado y verificar la autenticidad al instante." },
          ].map(f => (
            <Card key={f.title} className="hover:border-amber-500/40 hover:shadow-lg transition group">
              <div className="inline-flex w-12 h-12 rounded-xl bg-amber-500/10 items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition">
                <f.Icon className="w-6 h-6 text-amber-500 group-hover:text-black" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ADDED VALUE FEATURES */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <SectionHeading eyebrow="Novedades" title="Más que un registro: un ecosistema completo" description="Herramientas que ningún otro registro canino latinoamericano ofrece." />
            <Badge variant="accent">Edición 2026</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { Icon: Sparkles, title: "Análisis IA de raza", desc: "Sube una foto de tu ejemplar y la IA identifica la variante de bully (Pocket, Standard, XL, Extreme), genética de color y peso adulto esperado.", href: "/analisis-ia", tag: "IA" },
              { Icon: ShoppingBag, title: "Mercado verificado", desc: "Compra y vende cachorros, ejemplares adultos y servicio de monta — cada anuncio respaldado por un certificado ABCI real.", href: "/mercado", tag: "NUEVO" },
              { Icon: CalendarDays, title: "Calendario de eventos", desc: "Exposiciones, juzgamientos y encuentros en toda Latinoamérica. Inscríbete desde un solo lugar.", href: "/eventos", tag: "NUEVO" },
              { Icon: HeartPulse, title: "Bóveda de salud", desc: "Registra vacunas, radiografías, tests genéticos y controles veterinarios. Sincronizado al certificado.", href: "/panel/health", tag: "NUEVO" },
            ].map(f => (
              <Link key={f.title} href={f.href} className="group rounded-2xl border border-border bg-card p-6 hover:border-amber-500/50 hover:shadow-xl transition relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Badge variant="accent">{f.tag}</Badge>
                </div>
                <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 items-center justify-center text-black">
                  <f.Icon className="w-7 h-7" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-500">
                  Probar ahora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading eyebrow="3 pasos sencillos" title="Registra tu ejemplar en menos de 5 minutos" center />
        <div className="mt-14 grid md:grid-cols-3 gap-6 relative">
          {[
            { n: "01", title: "Crea tu cuenta de criadero", desc: "Registro gratuito con tu nombre, país, afijo y datos de contacto. Sin tarjeta de crédito." },
            { n: "02", title: "Carga los datos del ejemplar", desc: "Nombre, fecha de nacimiento, color, microchip, padre y madre. Vincula a ejemplares ya registrados." },
            { n: "03", title: "Recibe el certificado digital", desc: "Tu ejemplar obtiene un número de registro ABCI único y QR verificable. Solicita la copia física cuando quieras." },
          ].map(s => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-8 relative">
              <span className="absolute -top-3 left-6 inline-flex w-14 h-7 items-center justify-center rounded-full bg-amber-500 text-black text-xs font-bold tracking-widest">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading eyebrow="Criaderos que confían" title="Lo que dicen nuestros criadores" />
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { q: "Cambiamos a ABCI World Wide hace dos años y el cambio fue total. Los compradores escanean el QR del certificado desde su celular y la verificación es inmediata.", n: "Marco Díaz", k: "Empire Bullies Kennel — Lima, Perú" },
            { q: "El registro masivo de camada me ahorra horas. Antes era papelería interminable; ahora cargo los 8 cachorros en 10 minutos.", n: "Sasha Quispe", k: "Quispe Bloodline — Arequipa, Perú" },
            { q: "He vendido cachorros a México, Chile y Argentina sin un solo reclamo de pedigree. El historial auditable es lo que me convenció.", n: "Carlos Rocha", k: "Brazilian Royalty — São Paulo, Brasil" },
          ].map(t => (
            <Card key={t.n}>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-sm leading-relaxed">&quot;{t.q}&quot;</p>
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-sm font-semibold">{t.n}</p>
                <p className="text-xs text-muted-foreground">{t.k}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-black via-zinc-950 to-black text-white p-12 sm:p-16 text-center">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 to-transparent" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(232,185,35,0.15), transparent 70%)" }} />
          <div className="relative">
            <Award className="w-10 h-10 mx-auto text-amber-500 mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">¿Listo para dar a tu sangre un pasaporte internacional?</h2>
            <p className="mt-3 text-base opacity-80 max-w-xl mx-auto">Más de 2,400 criaderos en Latinoamérica ya confían en ABCI. Cuenta gratuita, sin tarjeta de crédito.</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <LinkButton href="/registrarse" variant="accent" size="lg">Crear cuenta gratuita</LinkButton>
              <LinkButton href="/membresia" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">Comparar planes</LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
