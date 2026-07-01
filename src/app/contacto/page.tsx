"use client";

import { useState } from "react";
import { Card, Button, Input, Label, Textarea, Badge } from "@/components/ui";
import { Mail, MessageCircle, Phone, Building2, Send } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <Badge variant="accent" className="mb-4">Contacto</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Habla con una persona real</h1>
        <p className="mt-3 text-muted-foreground">Nuestro equipo responde cada mensaje en menos de 24 horas en días hábiles.</p>
      </div>

      <div className="grid md:grid-cols-[2fr_1fr] gap-6">
        <Card>
          {sent ? (
            <div className="text-center py-10">
              <Send className="w-12 h-12 mx-auto text-amber-500 mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold">¡Mensaje enviado!</h3>
              <p className="text-muted-foreground mt-2">Te responderemos al correo que proporcionaste.</p>
              <Button onClick={() => setSent(false)} variant="outline" className="mt-6">Enviar otro</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tu nombre</Label>
                  <Input id="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" required />
                </div>
              </div>
              <div>
                <Label htmlFor="topic">Tema</Label>
                <select id="topic" className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm">
                  <option>Consulta general</option>
                  <option>Ayuda con registro</option>
                  <option>Problema de verificación</option>
                  <option>Reportar una violación</option>
                  <option>Membresía / facturación</option>
                  <option>Prensa / alianzas</option>
                </select>
              </div>
              <div>
                <Label htmlFor="msg">Mensaje</Label>
                <Textarea id="msg" rows={6} required placeholder="¿En qué podemos ayudarte?" />
              </div>
              <Button type="submit" variant="accent" size="lg" className="w-full">
                <Send className="w-4 h-4" /> Enviar mensaje
              </Button>
            </form>
          )}
        </Card>

        <div className="space-y-4">
          {[
            { Icon: Mail, t: "Correo", v: "contacto@abciregistro.app" },
            { Icon: MessageCircle, t: "Chat en vivo", v: "Lun–Vie, 9am–6pm PET" },
            { Icon: Phone, t: "WhatsApp", v: "+51 987 555 019" },
            { Icon: Building2, t: "Sede", v: "Lima, Perú" },
          ].map(c => (
            <Card key={c.t}>
              <c.Icon className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">{c.t}</p>
              <p className="font-medium mt-1">{c.v}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
