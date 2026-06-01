"use client";

import type { Dog } from "@/lib/types";
import { getDog } from "@/lib/store";
import Link from "next/link";

type Node = { name: string; cert?: string; gen: number; gender?: "male" | "female" };

function buildNode(name?: string, gen = 0): Node | null {
  if (!name) return null;
  return { name, gen };
}

export function PedigreeTree({ dog }: { dog: Dog }) {
  const sire = dog.sireId ? getDog(dog.sireId) : null;
  const dam = dog.damId ? getDog(dog.damId) : null;

  function NodeCard({ label, name, cert, gender, link }: { label: string; name?: string; cert?: string; gender?: "male" | "female"; link?: string }) {
    const colors = gender === "male" ? "from-indigo-500/15 to-indigo-500/5 border-indigo-500/30" : gender === "female" ? "from-rose-500/15 to-rose-500/5 border-rose-500/30" : "from-zinc-500/10 to-transparent border-border";
    const content = (
      <div className={`rounded-xl border bg-gradient-to-br ${colors} p-3`}>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold mt-0.5 leading-snug">{name || "Unknown"}</p>
        {cert && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{cert}</p>}
      </div>
    );
    return link ? <Link href={link} className="block hover:opacity-90">{content}</Link> : content;
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[760px] grid grid-cols-4 gap-3">
        {/* Gen 0 — Dog itself */}
        <div className="flex flex-col justify-center">
          <NodeCard label={`${dog.name}`} name={dog.callName || dog.name} cert={dog.certificateId} gender={dog.gender} />
        </div>

        {/* Gen 1 — parents */}
        <div className="flex flex-col gap-3 justify-center">
          <NodeCard label="Sire" name={sire?.name || dog.sireName} cert={sire?.certificateId} gender="male" link={sire ? `/dogs/${sire.id}` : undefined} />
          <NodeCard label="Dam" name={dam?.name || dog.damName} cert={dam?.certificateId} gender="female" link={dam ? `/dogs/${dam.id}` : undefined} />
        </div>

        {/* Gen 2 — grandparents */}
        <div className="flex flex-col gap-2 justify-center">
          <NodeCard label="Paternal Grandsire" name={sire?.sireName} gender="male" />
          <NodeCard label="Paternal Granddam" name={sire?.damName} gender="female" />
          <NodeCard label="Maternal Grandsire" name={dam?.sireName} gender="male" />
          <NodeCard label="Maternal Granddam" name={dam?.damName} gender="female" />
        </div>

        {/* Gen 3 — great-grandparents (text only placeholders) */}
        <div className="flex flex-col gap-1.5 justify-center text-[11px] text-muted-foreground">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-2 py-1.5 rounded-lg border border-dashed border-border bg-muted/30">
              <span className="text-[9px] uppercase tracking-wider">Great-grand #{i + 1}</span>
              <p className="italic">Unknown</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
