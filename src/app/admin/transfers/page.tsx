"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getTransfers, updateTransfer, getDogs, getUsers, logAdminAction } from "@/lib/store";
import type { Transfer, Dog, User } from "@/lib/types";
import { Card, Badge, Button, Select } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";
import {
  ArrowLeftRight, Clock, CheckCircle2, XCircle, Filter,
} from "lucide-react";

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => { refresh(); }, []);

  function refresh() {
    setTransfers(getTransfers());
    setDogs(getDogs());
    setUsers(getUsers());
  }

  function approve(t: Transfer) {
    updateTransfer(t.id, { status: "approved", completedAt: new Date().toISOString() });
    logAdminAction("Traspaso aprobado", `Nro. ${dogs.find(d => d.id === t.dogId)?.certificateId}`, `Hacia ${t.toEmail}`);
    refresh();
  }

  function reject(t: Transfer) {
    if (!confirm("¿Rechazar este traspaso?")) return;
    updateTransfer(t.id, { status: "rejected" });
    logAdminAction("Traspaso rechazado", `Nro. ${dogs.find(d => d.id === t.dogId)?.certificateId}`);
    refresh();
  }

  const filtered = status === "all" ? transfers : transfers.filter(t => t.status === status);

  const counts = {
    pending: transfers.filter(t => t.status === "pending").length,
    approved: transfers.filter(t => t.status === "approved").length,
    rejected: transfers.filter(t => t.status === "rejected").length,
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
          <ArrowLeftRight className="w-7 h-7 text-amber-500" /> Traspasos de propiedad
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Aprobá o rechazá las solicitudes de cambio de titularidad.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card><p className="text-3xl font-bold text-amber-500">{counts.pending}</p><p className="text-sm mt-1">Pendientes</p></Card>
        <Card><p className="text-3xl font-bold text-emerald-500">{counts.approved}</p><p className="text-sm mt-1">Aprobados</p></Card>
        <Card><p className="text-3xl font-bold text-rose-500">{counts.rejected}</p><p className="text-sm mt-1">Rechazados</p></Card>
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={status} onChange={e => setStatus(e.target.value as "all" | "pending" | "approved" | "rejected")} className="max-w-xs">
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center py-12 text-muted-foreground text-sm">
          Sin traspasos para mostrar.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const dog = dogs.find(d => d.id === t.dogId);
            const fromUser = users.find(u => u.id === t.fromUserId);
            return (
              <Card key={t.id}>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{dog?.name || "Ejemplar"}</p>
                      <Badge>Nro. {dog?.certificateId}</Badge>
                      <Badge variant={t.status === "approved" ? "success" : t.status === "rejected" ? "default" : "warning"}>
                        {t.status === "pending" ? <><Clock className="w-3 h-3" /> Pendiente</> : t.status === "approved" ? <><CheckCircle2 className="w-3 h-3" /> Aprobado</> : <><XCircle className="w-3 h-3" /> Rechazado</>}
                      </Badge>
                    </div>
                    <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">De</p>
                        <p className="font-medium">{fromUser?.name || t.fromUserId}</p>
                        <p className="text-xs text-muted-foreground">{fromUser?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Hacia</p>
                        <p className="font-medium">{t.toEmail}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Solicitado el {formatShortDate(t.requestedAt)}{t.completedAt ? ` · Completado el ${formatShortDate(t.completedAt)}` : ""}</p>
                    {t.notes && <p className="text-sm text-muted-foreground mt-2 italic">&quot;{t.notes}&quot;</p>}
                  </div>
                  {t.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button onClick={() => reject(t)} variant="ghost" size="sm" className="text-rose-500">
                        <XCircle className="w-4 h-4" /> Rechazar
                      </Button>
                      <Button onClick={() => approve(t)} variant="accent" size="sm">
                        <CheckCircle2 className="w-4 h-4" /> Aprobar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
