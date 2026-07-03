"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { calculateAge } from "@/lib/utils";
import {
  Dog as DogIcon, ShieldCheck, Cpu, Tag, MapPin, ZoomIn, ZoomOut, RotateCcw, Loader2,
} from "lucide-react";

type Dog = Tables<"dogs">;
type Gen = 0 | 1 | 2 | 3;

type Node = {
  dog: Dog | null;
  rawName: string;
  label: string;
  gender: "male" | "female" | null;
  gen: Gen;
};

function norm(name: string | null | undefined) {
  return (name || "").trim().toUpperCase();
}

/**
 * Resuelve hasta 3 generaciones de ancestros cruzando sireName/damName por nombre
 * contra la tabla dogs — los ejemplares migrados del WXR no tienen sire_id/dam_id
 * (el cruce por ID no se intentó al importar por ser ambiguo), pero muchos padres
 * están registrados como ejemplares propios y se resuelven así en tiempo de lectura.
 */
async function resolveGenerations(root: Dog) {
  const supabase = createClient();
  const byName = new Map<string, Dog>();

  async function fetchByNames(names: string[]) {
    const wanted = Array.from(new Set(names.map(norm).filter(Boolean)));
    const missing = wanted.filter(n => !byName.has(n));
    if (missing.length === 0) return;
    const { data } = await supabase.from("dogs").select("*").in("name", missing);
    for (const d of data || []) byName.set(norm(d.name), d);
  }

  // Algunos registros heredados del sitio anterior tienen datos de origen
  // erróneos donde un ejemplar figura como su propia madre/padre (o forman
  // un ciclo indirecto). Sin este chequeo, esas líneas se "resuelven" en un
  // bucle infinito que repite la misma tarjeta en cada generación. Se corta
  // el ciclo tratando a ese ancestro como no registrado.
  function resolve(dog: Dog | null, which: "sire" | "dam", ancestorIds: Set<string>): { dog: Dog | null; rawName: string } {
    if (!dog) return { dog: null, rawName: "" };
    const name = which === "sire" ? dog.sire_name : dog.dam_name;
    let found = byName.get(norm(name)) || null;
    if (found && ancestorIds.has(found.id)) found = null;
    return { dog: found, rawName: name || "" };
  }

  const rootIds = new Set([root.id]);

  await fetchByNames([root.sire_name || "", root.dam_name || ""]);
  const sire = resolve(root, "sire", rootIds);
  const dam = resolve(root, "dam", rootIds);

  const sireIds = new Set(sire.dog ? [...rootIds, sire.dog.id] : rootIds);
  const damIds = new Set(dam.dog ? [...rootIds, dam.dog.id] : rootIds);

  await fetchByNames([sire.dog?.sire_name || "", sire.dog?.dam_name || "", dam.dog?.sire_name || "", dam.dog?.dam_name || ""]);
  const sireSire = resolve(sire.dog, "sire", sireIds);
  const sireDam = resolve(sire.dog, "dam", sireIds);
  const damSire = resolve(dam.dog, "sire", damIds);
  const damDam = resolve(dam.dog, "dam", damIds);

  const sireSireIds = new Set(sireSire.dog ? [...sireIds, sireSire.dog.id] : sireIds);
  const sireDamIds = new Set(sireDam.dog ? [...sireIds, sireDam.dog.id] : sireIds);
  const damSireIds = new Set(damSire.dog ? [...damIds, damSire.dog.id] : damIds);
  const damDamIds = new Set(damDam.dog ? [...damIds, damDam.dog.id] : damIds);

  await fetchByNames([
    sireSire.dog?.sire_name || "", sireSire.dog?.dam_name || "",
    sireDam.dog?.sire_name || "", sireDam.dog?.dam_name || "",
    damSire.dog?.sire_name || "", damSire.dog?.dam_name || "",
    damDam.dog?.sire_name || "", damDam.dog?.dam_name || "",
  ]);
  const ggSireSireSire = resolve(sireSire.dog, "sire", sireSireIds);
  const ggSireSireDam = resolve(sireSire.dog, "dam", sireSireIds);
  const ggSireDamSire = resolve(sireDam.dog, "sire", sireDamIds);
  const ggSireDamDam = resolve(sireDam.dog, "dam", sireDamIds);
  const ggDamSireSire = resolve(damSire.dog, "sire", damSireIds);
  const ggDamSireDam = resolve(damSire.dog, "dam", damSireIds);
  const ggDamDamSire = resolve(damDam.dog, "sire", damDamIds);
  const ggDamDamDam = resolve(damDam.dog, "dam", damDamIds);

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
          {dog?.photo_url ? (
            <Image
              src={dog.photo_url}
              alt={dog.name}
              width={44}
              height={44}
              unoptimized={dog.photo_url.startsWith("data:")}
              className="w-full h-full object-cover"
            />
          ) : (
            <DogIcon className="w-5 h-5" strokeWidth={1.75} />
          )}
          {resolved && dog?.certificate_id && (
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
              {dog.kennel_name && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{dog.kennel_name}</p>
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

      {resolved && dog && (dog.certificate_id || dog.microchip) && (
        <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-1.5 flex-wrap">
          {dog.certificate_id && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-background/70 border border-border text-[9px] font-mono text-muted-foreground">
              <Tag className="w-2.5 h-2.5" /> {dog.certificate_id}
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
  const [resolvedFor, setResolvedFor] = useState<string | null>(null);
  const [gens, setGens] = useState<{ gen1: Node[]; gen2: Node[]; gen3: Node[] }>({ gen1: [], gen2: [], gen3: [] });

  useEffect(() => {
    let cancelled = false;
    resolveGenerations(dog).then(result => {
      if (!cancelled) { setGens(result); setResolvedFor(dog.id); }
    });
    return () => { cancelled = true; };
  }, [dog]);

  const loading = resolvedFor !== dog.id;
  const { gen1, gen2, gen3 } = gens;
  const resolvedCount = useMemo(
    () => 1 + [...gen1, ...gen2, ...gen3].filter(n => n.dog).length,
    [gen1, gen2, gen3],
  );
  const totalCount = 1 + gen1.length + gen2.length + gen3.length;

  function zoomIn() { setScale(s => Math.min(1.4, +(s + 0.1).toFixed(2))); }
  function zoomOut() { setScale(s => Math.max(0.5, +(s - 0.1).toFixed(2))); }
  function resetZoom() { setScale(1); }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando pedigree…
      </div>
    );
  }

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
                node={{ dog, rawName: dog.call_name || dog.name, label: dog.name, gender: dog.gender === "female" ? "female" : "male", gen: 0 }}
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
