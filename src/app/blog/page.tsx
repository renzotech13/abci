import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, SectionHeading } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { ScrollText, Tag, Dna, Palette, ArrowLeftRight, Trophy, type LucideIcon } from "lucide-react";

const COVER_ICON: Record<string, LucideIcon> = {
  "📜": ScrollText,
  "🏷️": Tag,
  "🧬": Dna,
  "🎨": Palette,
  "🔁": ArrowLeftRight,
  "🏆": Trophy,
};

function CoverArt({ cover, large }: { cover: string | null; large?: boolean }) {
  const Icon = (cover && COVER_ICON[cover]) || ScrollText;
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-zinc-900/30 aspect-video flex items-center justify-center ${large ? "" : "mb-4"}`}>
      <Icon className={`text-amber-500 ${large ? "w-24 h-24" : "w-14 h-14"}`} strokeWidth={1.25} />
    </div>
  );
}

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("blog_posts").select("*").order("date", { ascending: false });
  const all = posts ?? [];
  const featured = all[0];
  const rest = all.slice(1);

  if (!featured) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <SectionHeading eyebrow="Blog" title="Sabiduría genética, criadores e historias" description="Artículos por veterinarios, jueces y criaderos top de Latinoamérica." />
        <p className="mt-10 text-muted-foreground">Aún no hay artículos publicados.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading eyebrow="Blog" title="Sabiduría genética, criadores e historias" description="Artículos por veterinarios, jueces y criaderos top de Latinoamérica." />

      <Link href={`/blog/${featured.slug}`} className="mt-10 block">
        <Card className="grid md:grid-cols-[1fr_2fr] gap-6 hover:border-amber-500/50 transition">
          <CoverArt cover={featured.cover} />
          <div className="self-center">
            <Badge variant="accent" className="mb-3">Destacado</Badge>
            <h2 className="text-2xl font-bold leading-tight">{featured.title}</h2>
            <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
            <p className="mt-4 text-xs text-muted-foreground">Por {featured.author} · {formatDate(featured.date)} · {featured.read_time} min de lectura</p>
          </div>
        </Card>
      </Link>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rest.map(p => (
          <Link key={p.id} href={`/blog/${p.slug}`}>
            <Card className="hover:border-amber-500/40 transition h-full">
              <CoverArt cover={p.cover} />
              <div className="flex flex-wrap gap-1 mb-2">
                {p.tags.slice(0, 2).map(t => <Badge key={t}>{t}</Badge>)}
              </div>
              <h3 className="font-semibold leading-snug">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">{formatDate(p.date)} · {p.read_time} min</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
