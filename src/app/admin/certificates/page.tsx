"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { getDogs, getUsers } from "@/lib/store";
import type { Dog, User } from "@/lib/types";
import { Card, Badge, Input } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";
import { FileText, Search, ShieldCheck, Eye, Printer } from "lucide-react";

export default function AdminCertificatesPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setDogs(getDogs());
    setUsers(getUsers());
  }, []);

  const filtered = dogs.filter(d => {
    if (!query) return true;
    const q = query.toLowerCase();
    return `${d.certificateId} ${d.name} ${d.kennelName}`.toLowerCase().includes(q);
  });

  function ownerName(id: string) {
    return users.find(u => u.id === id)?.name || "—";
  }

  const totalIssued = dogs.length;
  const last7 = dogs.filter(d => Date.now() - new Date(d.registrationDate).getTime() < 7 * 86400 * 1000).length;
  const last30 = dogs.filter(d => Date.now() - new Date(d.registrationDate).getTime() < 30 * 86400 * 1000).length;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
          <FileText className="w-7 h-7 text-amber-500" /> Certificados emitidos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Todos los certificados oficiales ABCI con su número único y verificación QR.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total emitidos", value: totalIssued, sub: "Histórico" },
          { label: "Últimos 7 días", value: last7, sub: "Esta semana" },
          { label: "Últimos 30 días", value: last30, sub: "Este mes" },
        ].map(s => (
          <Card key={s.label}>
            <p className="text-3xl font-bold text-amber-500">{s.value}</p>
            <p className="text-sm font-medium mt-1">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por número de registro, nombre del ejemplar o criadero..." className="pl-9 font-mono" />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Nro. ABCI</th>
                <th className="text-left px-4 py-3">Ejemplar</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Propietario</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Estado</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Emisión</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3 font-mono font-bold text-amber-500">{d.certificateId}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.breed}{d.variant ? ` · ${d.variant}` : ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell">{ownerName(d.ownerId)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="success"><ShieldCheck className="w-2.5 h-2.5" /> Verificado</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{formatShortDate(d.registrationDate)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Link href={`/certificado/${d.certificateId}`} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted" title="Ver">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/certificado/${d.certificateId}`} target="_blank" className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted" title="Imprimir">
                        <Printer className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
