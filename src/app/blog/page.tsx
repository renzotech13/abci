import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog";
import { Card, Badge, SectionHeading } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function BlogPage() {
  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading eyebrow="Blog" title="Pedigree wisdom, genetics, and breeder stories" description="Articles by champions, vets and registry insiders." />

      <Link href={`/blog/${featured.slug}`} className="mt-10 block">
        <Card className="grid md:grid-cols-[1fr_2fr] gap-6 hover:border-amber-500/50 transition">
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-rose-500/10 aspect-video flex items-center justify-center text-7xl">
            {featured.cover}
          </div>
          <div className="self-center">
            <Badge variant="accent" className="mb-3">Featured</Badge>
            <h2 className="text-2xl font-bold leading-tight">{featured.title}</h2>
            <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
            <p className="mt-4 text-xs text-muted-foreground">By {featured.author} • {formatDate(featured.date)} • {featured.readTime} min read</p>
          </div>
        </Card>
      </Link>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rest.map(p => (
          <Link key={p.id} href={`/blog/${p.slug}`}>
            <Card className="hover:border-amber-500/40 transition h-full">
              <div className="rounded-2xl bg-gradient-to-br from-muted to-transparent aspect-video flex items-center justify-center text-5xl mb-4">
                {p.cover}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {p.tags.slice(0, 2).map(t => <Badge key={t}>{t}</Badge>)}
              </div>
              <h3 className="font-semibold leading-snug">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">{formatDate(p.date)} • {p.readTime} min</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
