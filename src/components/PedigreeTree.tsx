"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Dog } from "@/lib/types";
import { getDogs } from "@/lib/store";
import { calculateAge } from "@/lib/utils";
import {
  Dog as DogIcon, ShieldCheck, Cpu, Tag, MapPin, ZoomIn, ZoomOut, RotateCcw,
} from "lucide-react";

type Gen = 0 | 1 | 2 | 3;

type Node = {
  dog: Dog | null;
  rawName: string;
  label: string;
  gender: "male" | "female" | null;
  gen: Gen;
};

function buildIndexes(dogs: Dog[]) {
  const byId = new Map<string, Dog>();
  const byName = new Map<string, Dog>();
  for (const d of dogs) {
    byId.set(d.id, d);
    const key = d.name.trim().toUpperCase();
    if (key && !byName.has(key)) byName.set(key, d);
  }
  return { byId, byName };
}

function resolveParent(
  indexes: { byId: Map<string, Dog>; byName: Map<string, Dog> },
  dog: Dog | null,
  which: "sire" | "dam"
): { dog: Dog | null; rawName: string } {
  if (!dog) return { dog: null, rawName: "" };
  const id = which === "sire" ? dog.sireId : dog.damId;
  const name = (which === "sire" ? dog.sireName : dog.damName) || "";
  if (id) {
    const byId = indexes.byId.get(id);
    if (byId) return { dog: byId, rawName: byId.name };
  }
  const key = name.trim().toUpperCase();
  if (key) {
    const byName = indexes.byName.get(key);
    if (byName) return { dog: byName, rawName: byName.name };
  }
  return { dog: null, rawName: name };
}

function buildTree(dog: Dog, indexes: { byId: Map<string, Dog>; byName: Map<string, Dog> }) {
  const sire = resolveParent(indexes, dog, "sire");
  const dam = resolveParent(indexes, dog, "dam");

  const sireSire = resolveParent(indexes, sire.dog, "sire");
  const sireDam = resolveParent(indexes, sire.dog, "dam");
  const damSire = resolveParent(indexes, dam.dog, "sire");
  const damDam = resolveParent(indexes, dam.dog, "dam");

  const ggSireSireSire = resolveParent(indexes, sireSire.dog, "sire");
  const ggSireSireDam = resolveParent(indexes, sireSire.dog, "dam");
  const ggSireDamSire = resolveParent(indexes, sireDam.dog, "sire");
  const ggSireDamDam = resolveParent(indexes, sireDam.dog, "dam");
  const ggDamSireSire = resolveParent(indexes, damSire.dog, "sire");
  const ggDamSireDam = resolveParent(indexes, damSire.dog, "dam");
  const ggDamDamSire = resolveParent(indexes, damDam.dog, "sire");
  const ggDamDamDam = resolveParent(indexes, damDam.dog, "dam");

  const gen1: Node[] = [
    { ...sire, label: "Padre", gender: "male", gen: 1 },
    { ...dam, label: "Madre", gender: "female", gen: 1 },
  ];
  const gen2: Node[] = [
    { ...sireSire, label: "Abuelo paterno", gender: "male", gen: 2 },
    { ...sireDam, label: "Abuela paterna", gender: "female", gen: 2 },
    { ...damSire, label: "Abuelo materno", gender: "male", gen: 2 },
    { ...damDam, label: "Abuela materna", gender: "female", gen: 2 },
  ];
  const gen3: Node[] = [
    { ...ggSireSireSire, label: "Bisabuelo", gender: "male", gen: 3 },
    { ...ggSireSireDam, label: "Bisabuela", gender: "female", gen: 3 },
    { ...ggSireDamSire, label: "Bisabuelo", gender: "male", gen: 3 },
    { ...ggSireDamDam, label: "Bisabuela", gender: "female", gen: 3 },
    { ...ggDamSireSire, label: "Bisabuelo", gender: "male", gen: 3 },
    { ...ggDamSireDam, label: "Bisabuela", gender: "female", gen: 3 },
    { ...ggDamDamSire, label: "Bisabuelo", gender: "male", gen: 3 },
    { ...ggDamDamDam, label: "Bisabuela", gender: "female", gen: 3 },
  ];

  return { gen1, gen2, gen3 };
}

function NodeCard({ node, isSubject }: { node: Node; isSubject?: boolean }) {
  const { dog, rawName, label, gender } = node;
  const resolved = !!dog;

  const toneRing = gender === "male"
    ? "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30"
    : gender === "female"
    ? "from-rose-500/20 to-rose-500/5 border-rose-500/30"
    : "from-zinc-700/20 to-transparent border-border";

  const content = (
    <div
      className={`relative rounded-2xl border bg-gradient-to-br p-4 transition ${
        resolved ? `${toneRing} hover:border-amber-500/60 hover:shadow-lg cursor-pointer` : "border-dashed border-border/70 bg-muted/20"
      } ${isSubject ? "border-amber-500/60 border-2 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]" : ""}`}
    >
      {isSubject && (
        <span className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-bold uppercase tracking-wider">
          Ejemplar principal
        </span>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${
            resolved
              ? gender === "male" ? "bg-indigo-500/15 text-indigo-400" : "bg-rose-500/15 text-rose-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {dog?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dog.photo} alt={dog.name} className="w-full h-full object-cover" />
          ) : (
            <DogIcon className="w-5 h-5" strokeWidth={1.75} />
          )}
          {resolved && dog?.certificateId && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-background">
              <ShieldCheck className="w-2.5 h-2.5 text-black" strokeWidth={3} />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className={`text-sm font-bold leading-tight mt-0.5 truncate ${resolved ? "" : "text-muted-foreground italic"}`}>
            {rawName || "Desconocido"}
          </p>

          {resolved && dog && (
            <>
              {dog.kennelName && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{dog.kennelName}</p>
              )}
              <p className="text-[11px] font-medium text-amber-500 mt-1 truncate">
                {dog.breed}{dog.variant ? ` · ${dog.variant}` : ""}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                <span>{dog.gender === "male" ? "♂" : "♀"}</span>
                {dog.color && <span className="truncate">{dog.color}</span>}
                {dog.dob && <span>· {calculateAge(dog.dob)}</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {resolved && dog && (dog.certificateId || dog.microchip) && (
        <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-1.5 flex-wrap">
          {dog.certificateId && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-background/70 border border-border text-[9px] font-mono text-muted-foreground">
              <Tag className="w-2.5 h-2.5" /> {dog.certificateId}
            </span>
          )}
          {dog.microchip && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-[9px] font-mono text-sky-400">
              <Cpu className="w-2.5 h-2.5" /> {dog.microchip.slice(-6)}
            </span>
          )}
        </div>
      )}

      {resolved && dog?.location && (
        <p className="mt-2 text-[9px] text-muted-foreground inline-flex items-center gap-1 truncate">
          <MapPin className="w-2.5 h-2.5 shrink-0" /> {dog.location}
        </p>
      )}
    </div>
  );

  if (resolved && dog) {
    return (
      <Link href={`/ejemplar/${dog.id}`} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

function Connector() {
  return (
    <div className="flex items-center justify-center px-1" aria-hidden>
      <div className="w-5 sm:w-8 h-px bg-gradient-to-r from-border via-amber-500/40 to-border" />
    </div>
  );
}

export function PedigreeTree({ dog }: { dog: Dog }) {
  const [scale, setScale] = useState(1);
  const allDogs = useMemo(() => getDogs(), []);
  const indexes = useMemo(() => buildIndexes(allDogs), [allDogs]);
  const { gen1, gen2, gen3 } = useMemo(() => buildTree(dog, indexes), [dog, indexes]);

  const resolvedCount =
    1 + [...gen1, ...gen2, ...gen3].filter(n => n.dog).length;
  const totalCount = 1 + gen1.length + gen2.length + gen3.length;

  function zoomIn() { setScale(s => Math.min(1.4, +(s + 0.1).toFixed(2))); }
  function zoomOut() { setScale(s => Math.max(0.5, +(s - 0.1).toFixed(2))); }
  function resetZoom() { setScale(1); }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-xs text-muted-foreground">
          <span className="text-amber-500 font-semibold">{resolvedCount}</span> de {totalCount} ejemplares
          del árbol están registrados y enlazados — hacé clic en cualquier tarjeta para seguir navegando.
        </p>
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
          <button onClick={zoomOut} className="w-7 h-7 rounded-full inline-flex items-center justify-center hover:bg-muted transition" aria-label="Alejar">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono w-10 text-center text-muted-foreground">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="w-7 h-7 rounded-full inline-flex items-center justify-center hover:bg-muted transition" aria-label="Acercar">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button onClick={resetZoom} className="w-7 h-7 rounded-full inline-flex items-center justify-center hover:bg-muted transition" aria-label="Restablecer zoom">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden pb-3 -mx-1 px-1">
        <div
          className="origin-top-left transition-transform"
          style={{ transform: `scale(${scale})`, width: scale < 1 ? `${100 / scale}%` : undefined }}
        >
          <div className="min-w-[920px] grid grid-cols-[200px_28px_200px_28px_200px_28px_200px] gap-2 items-center">
            {/* Gen 0 — sujeto principal */}
            <div className="flex flex-col justify-center">
              <NodeCard
                isSubject
                node={{ dog, rawName: dog.callName || dog.name, label: dog.name, gender: dog.gender, gen: 0 }}
              />
            </div>

            <Connector />

            {/* Gen 1 — padres */}
            <div className="flex flex-col gap-3 justify-center">
              {gen1.map((n, i) => <NodeCard key={`g1-${i}`} node={n} />)}
            </div>

            <Connector />

            {/* Gen 2 — abuelos */}
            <div className="flex flex-col gap-2 justify-center">
              {gen2.map((n, i) => <NodeCard key={`g2-${i}`} node={n} />)}
            </div>

            <Connector />

            {/* Gen 3 — bisabuelos */}
            <div className="flex flex-col gap-1.5 justify-center">
              {gen3.map((n, i) => <NodeCard key={`g3-${i}`} node={n} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
