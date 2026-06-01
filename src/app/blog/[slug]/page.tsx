import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog";
import { Badge, LinkButton } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">← Back to blog</Link>

      <div className="mt-6 flex flex-wrap gap-2">
        {post.tags.map(t => <Badge key={t} variant="accent">{t}</Badge>)}
      </div>
      <h1 className="mt-4 text-4xl font-bold tracking-tight leading-tight">{post.title}</h1>
      <p className="mt-4 text-muted-foreground">{post.excerpt}</p>
      <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground border-b border-border pb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold">{post.author.charAt(0)}</div>
        <div>
          <p className="font-medium text-foreground">{post.author}</p>
          <p className="text-xs">{formatDate(post.date)} • {post.readTime} min read</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-rose-500/10 aspect-video flex items-center justify-center text-9xl">
        {post.cover}
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
        <h3 className="text-xl font-bold">Ready to register your bloodline?</h3>
        <p className="mt-2 text-sm text-muted-foreground">Free account. Instant digital certificate. BPKC™ recognized worldwide.</p>
        <LinkButton href="/register" variant="accent" className="mt-4">Create kennel account</LinkButton>
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-bold mb-5">Related reading</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {related.map(r => (
            <Link key={r.id} href={`/blog/${r.slug}`} className="block p-4 rounded-2xl border border-border hover:border-amber-500/40 transition">
              <div className="text-3xl">{r.cover}</div>
              <p className="font-semibold mt-2 text-sm leading-snug">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.readTime} min</p>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
