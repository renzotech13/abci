"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Input, SectionHeading } from "@/components/ui";
import { BookOpen, ChevronRight } from "lucide-react";

const ARTICLES = [
  { cat: "Registro", title: "Cómo registrar tu primer ejemplar", time: "3 min", href: "/panel/dogs/add" },
  { cat: "Registro", title: "Guía paso a paso del registro masivo de camada", time: "5 min", href: "/panel/litter" },
  { cat: "Afijos", title: "¿Qué es un afijo y por qué necesito uno?", time: "3 min", href: "/panel/affixes" },
  { cat: "Certificados", title: "Qué incluye un certificado ABCI", time: "2 min", href: "/blog/que-incluye-certificado-abci" },
  { cat: "Certificados", title: "Cómo verificar un certificado (para compradores)", time: "1 min", href: "/verificar" },
  { cat: "Traspasos", title: "Cómo iniciar un traspaso de propiedad", time: "4 min", href: "/panel/transfers" },
  { cat: "Membresía", title: "Comparativa de planes Gratuito, Pro y Elite", time: "3 min", href: "/membresia" },
  { cat: "Herramientas IA", title: "Qué tan precisa es el análisis IA de raza", time: "2 min", href: "/analisis-ia" },
  { cat: "Mercado", title: "Cómo publicar tu primer anuncio", time: "3 min", href: "/panel/listings" },
];

export default function HelpPage() {
  const [q, setQ] = useState("");
  const filtered = ARTICLES.filter(a => !q || `${a.cat} ${a.title}`.toLowerCase().includes(q.toLowerCase()));
  const cats = Array.from(new Set(ARTICLES.map(a => a.cat)));
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <SectionHeading eyebrow="Centro de ayuda" title="¿En qué podemos ayudarte?" description="Guías rápidas, tutoriales y respuestas a preguntas comunes." center />
      <div className="mt-8 max-w-xl mx-auto">
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar artículos de ayuda..." />
      </div>
      <div className="mt-10 space-y-8">
        {cats.map(c => {
          const items = filtered.filter(a => a.cat === c);
          if (items.length === 0) return null;
          return (
            <div key={c}>
              <h2 className="text-xl font-bold mb-4">{c}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {items.map(a => (
                  <Link key={a.title} href={a.href} className="block">
                    <Card className="hover:border-amber-500/40 transition flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.time} de lectura</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
