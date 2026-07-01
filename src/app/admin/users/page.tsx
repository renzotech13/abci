"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getUsers, getDogs, adminUpdateUser, adminDeleteUser, logAdminAction } from "@/lib/store";
import type { User, Dog } from "@/lib/types";
import { Card, Badge, Button, Input, Select } from "@/components/ui";
import { formatShortDate } from "@/lib/utils";
import {
  Users, Search, ShieldCheck, Star, Trash2, Edit3, X, Save,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<"all" | "free" | "pro" | "elite">("all");
  const [editing, setEditing] = useState<User | null>(null);

  useEffect(() => { refresh(); }, []);

  function refresh() {
    setUsers(getUsers());
    setDogs(getDogs());
  }

  const filtered = users.filter(u => {
    if (tier !== "all" && u.membership !== tier) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!`${u.name} ${u.email} ${u.kennelName} ${u.country}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  function handleDelete(u: User) {
    if (u.role === "admin") {
      alert("No se puede eliminar una cuenta de administrador.");
      return;
    }
    if (!confirm(`¿Eliminar a ${u.name} permanentemente?`)) return;
    adminDeleteUser(u.id);
    logAdminAction("Usuario eliminado", u.name, u.email);
    refresh();
  }

  function saveEdit() {
    if (!editing) return;
    adminUpdateUser(editing.id, editing);
    logAdminAction("Usuario actualizado", editing.name);
    setEditing(null);
    refresh();
  }

  function dogCount(uid: string) { return dogs.filter(d => d.ownerId === uid).length; }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-500" /> Usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} cuentas · {users.filter(u => u.membership === "elite").length} elite · {users.filter(u => u.membership === "pro").length} pro · {users.filter(u => u.role === "admin").length} admin
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid md:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre, correo, criadero, país..." className="pl-9" />
          </div>
          <Select value={tier} onChange={e => setTier(e.target.value as "all" | "free" | "pro" | "elite")}>
            <option value="all">Todos los planes</option>
            <option value="free">Gratuito</option>
            <option value="pro">Pro</option>
            <option value="elite">Elite</option>
          </Select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Usuario</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Criadero</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Plan</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Ejemplares</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Desde</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium inline-flex items-center gap-1.5">
                          {u.name}
                          {u.role === "admin" && (
                            <Badge variant="accent" className="text-[10px]"><ShieldCheck className="w-2.5 h-2.5" /> Admin</Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell">
                    <p>{u.kennelName || "—"}</p>
                    <p className="text-muted-foreground">{u.country || "—"}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant={u.membership === "elite" ? "accent" : u.membership === "pro" ? "success" : "default"}>
                      {u.membership === "elite" && <Star className="w-2.5 h-2.5 fill-current" />}
                      {u.membership === "pro" && <ShieldCheck className="w-2.5 h-2.5" />}
                      {u.membership.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs hidden lg:table-cell">{dogCount(u.id)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{formatShortDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => setEditing(u)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted" title="Editar">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u)} disabled={u.role === "admin"} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <Card className="max-w-md w-full" >
            <div onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Editar usuario</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted inline-flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Nombre</label>
                  <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Criadero</label>
                  <Input value={editing.kennelName || ""} onChange={e => setEditing({ ...editing, kennelName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Plan de membresía</label>
                  <Select value={editing.membership} onChange={e => setEditing({ ...editing, membership: e.target.value as User["membership"] })}>
                    <option value="free">Gratuito</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Rol</label>
                  <Select value={editing.role || "user"} onChange={e => setEditing({ ...editing, role: e.target.value as User["role"] })}>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">Cancelar</Button>
                  <Button variant="accent" onClick={saveEdit} className="flex-1"><Save className="w-4 h-4" /> Guardar</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
