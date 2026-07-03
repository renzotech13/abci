import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge, LinkButton } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, ScrollText, Tag, Dna, Palette, ArrowLeftRight, Trophy, type LucideIcon } from "lucide-react";

const COVER_ICON: Record<string, LucideIcon> = {
  "📜": ScrollText,
  "🏷️": Tag,
  "🧬": Dna,
  "🎨": Palette,
  "🔁": ArrowLeftRight,
  "🏆": Trophy,
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
  if (!post) notFound();

  const { data: related } = await supabase.from("blog_posts").select("*").neq("slug", slug).limit(3);
  const CoverIcon = (post.cover && COVER_ICON[post.cover]) || ScrollText;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver al blog
      </Link>

      <div className="mt-6 flex flex-wrap gap-2">
        {post.tags.map(t => <Badge key={t} variant="accent">{t}</Badge>)}
      </div>
      <h1 className="mt-4 text-4xl font-bold tracking-tight leading-tight">{post.title}</h1>
      <p className="mt-4 text-muted-foreground">{post.excerpt}</p>
      <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground border-b border-border pb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold">{post.author.charAt(0)}</div>
        <div>
          <p className="font-medium text-foreground">{post.author}</p>
          <p className="text-xs">{formatDate(post.date)} · {post.read_time} min de lectura</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-zinc-900/30 aspect-video flex items-center justify-center">
        <CoverIcon className="w-32 h-32 text-amber-500" strokeWidth={1.25} />
      </div>

      <div className="prose prose-lg max-w-none mt-10 leading-relaxed text-foreground/90 space-y-4">
        {post.body.split("\n\n").map((paragraph, i) => {
          if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
            return <h2 key={i} className="text-xl font-bold mt-8">{paragraph.replace(/\*\*/g, "")}</h2>;
          }
          if (paragraph.startsWith("- ")) {
            return (
              <ul key={i} className="list-disc pl-6 space-y-1">
                {paragraph.split("\n").map((li, j) => <li key={j}>{li.replace(/^- /, "")}</li>)}
              </ul>
            );
          }
          return <p key={i}>{paragraph}</p>;
        })}
      </div>

      <div className="mt-12 p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 text-center">
        <h3 className="text-xl font-bold">¿Listo para registrar tu línea?</h3>
        <p className="mt-2 text-sm text-muted-foreground">Cuenta gratuita. Certificado digital instantáneo. Reconocido en toda Latinoamérica.</p>
        <LinkButton href="/registrarse" variant="accent" className="mt-4">Crear cuenta de criadero</LinkButton>
      </div>

      {related && related.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-5">Lecturas relacionadas</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map(r => {
              const Icon = (r.cover && COVER_ICON[r.cover]) || ScrollText;
              return (
                <Link key={r.id} href={`/blog/${r.slug}`} className="block p-4 rounded-2xl border border-border hover:border-amber-500/40 transition">
                  <Icon className="w-7 h-7 text-amber-500" strokeWidth={1.5} />
                  <p className="font-semibold mt-2 text-sm leading-snug">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.read_time} min</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
