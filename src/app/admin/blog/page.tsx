"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { getStoredBlogPosts, adminSaveBlogPost, adminDeleteBlogPost, logAdminAction } from "@/lib/store";
import { BLOG_POSTS } from "@/lib/blog";
import type { BlogPost } from "@/lib/types";
import { Card, Badge, Button, Input, Label, Textarea } from "@/components/ui";
import { formatShortDate, slugify, generateId } from "@/lib/utils";
import {
  Newspaper, Plus, Trash2, Edit3, X, Save, Eye, FileText,
} from "lucide-react";

const COVERS = ["📜", "🏷️", "🧬", "🎨", "🔁", "🏆"];

function emptyPost(): BlogPost {
  return {
    id: generateId("BP-"),
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    author: "",
    date: new Date().toISOString().slice(0, 10),
    tags: [],
    cover: "📜",
    readTime: 5,
  };
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [tagsRaw, setTagsRaw] = useState("");

  useEffect(() => { refresh(); }, []);

  function refresh() {
    const stored = getStoredBlogPosts();
    const seedMap = new Map(BLOG_POSTS.map(p => [p.slug, p]));
    for (const s of stored) seedMap.set(s.slug, s);
    setPosts(Array.from(seedMap.values()).sort((a, b) => b.date.localeCompare(a.date)));
  }

  function openNew() {
    const p = emptyPost();
    setEditing(p);
    setTagsRaw("");
    setIsNew(true);
  }

  function openEdit(p: BlogPost) {
    setEditing({ ...p });
    setTagsRaw(p.tags.join(", "));
    setIsNew(false);
  }

  function handleSave() {
    if (!editing) return;
    if (!editing.title) { alert("El título es obligatorio."); return; }
    const post: BlogPost = {
      ...editing,
      slug: editing.slug || slugify(editing.title),
      tags: tagsRaw.split(",").map(t => t.trim()).filter(Boolean),
    };
    adminSaveBlogPost(post);
    logAdminAction(isNew ? "Artículo publicado" : "Artículo actualizado", post.title);
    setEditing(null);
    setIsNew(false);
    refresh();
  }

  function handleDelete(p: BlogPost) {
    if (!confirm(`¿Eliminar el artículo "${p.title}"?`)) return;
    adminDeleteBlogPost(p.id);
    logAdminAction("Artículo eliminado", p.title);
    refresh();
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-amber-500" /> Blog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{posts.length} artículos publicados.</p>
        </div>
        <Button variant="accent" onClick={openNew}><Plus className="w-4 h-4" /> Nuevo artículo</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Título</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Autor</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Tags</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Fecha</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition">
                <td className="px-4 py-3">
                  <p className="font-medium line-clamp-1">{p.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</p>
                </td>
                <td className="px-4 py-3 text-xs hidden md:table-cell">{p.author}</td>
                <td className="px-4 py-3 text-xs hidden sm:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 2).map(t => <Badge key={t}>{t}</Badge>)}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{formatShortDate(p.date)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Link href={`/blog/${p.slug}`} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted" title="Ver">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => openEdit(p)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-muted" title="Editar">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-rose-500" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <Card className="max-w-2xl w-full my-8">
            <div onClick={evt => evt.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg inline-flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  {isNew ? "Nuevo artículo" : "Editar artículo"}
                </h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted inline-flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Título</Label>
                  <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Slug (URL)</Label>
                    <Input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} placeholder="se generará desde el título" className="font-mono text-xs" />
                  </div>
                  <div>
                    <Label>Autor</Label>
                    <Input value={editing.author} onChange={e => setEditing({ ...editing, author: e.target.value })} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Fecha</Label>
                    <Input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Tiempo de lectura (min)</Label>
                    <Input type="number" value={editing.readTime} onChange={e => setEditing({ ...editing, readTime: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Portada</Label>
                    <div className="flex gap-1">
                      {COVERS.map(c => (
                        <button key={c} onClick={() => setEditing({ ...editing, cover: c })} className={`w-9 h-9 rounded-lg border ${editing.cover === c ? "border-amber-500 bg-amber-500/10" : "border-border"}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Tags (separados por coma)</Label>
                  <Input value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} placeholder="Genética, Salud, Guía" />
                </div>
                <div>
                  <Label>Extracto</Label>
                  <Textarea rows={2} value={editing.excerpt} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} />
                </div>
                <div>
                  <Label>Contenido del artículo (Markdown ligero)</Label>
                  <Textarea rows={10} value={editing.body} onChange={e => setEditing({ ...editing, body: e.target.value })}
                    placeholder="Escribe el contenido aquí. Usa **texto** para títulos." />
                  <p className="text-[10px] text-muted-foreground mt-1">Usa **texto** para títulos de sección. Separa párrafos con doble enter.</p>
                </div>
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">Cancelar</Button>
                  <Button variant="accent" onClick={handleSave} className="flex-1"><Save className="w-4 h-4" /> Publicar</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
