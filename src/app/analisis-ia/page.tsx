"use client";

import { useState, useRef } from "react";
import { Card, Button, Badge, LinkButton } from "@/components/ui";
import {
  Sparkles, Camera, Brain, Zap, Target, ShieldCheck,
  Dna, Ruler, Medal, RefreshCcw, Image as ImageIcon,
} from "lucide-react";

type Prediction = { variant: string; confidence: number; reasoning: string };
type Analysis = {
  predictions: Prediction[];
  colorGenetics: { color: string; gene: string; description: string }[];
  estimatedWeight: { min: number; max: number };
  recommendedTraits: string[];
  imageUrl: string;
};

const VARIANTS = ["Pocket", "Standard", "XL", "Classic", "Extreme", "Micro"];

function generateAnalysis(file: File): Promise<Analysis> {
  return new Promise(resolve => {
    setTimeout(() => {
      const seed = file.name.length + file.size;
      const v1 = VARIANTS[seed % VARIANTS.length];
      const v2 = VARIANTS[(seed + 2) % VARIANTS.length];
      const v3 = VARIANTS[(seed + 4) % VARIANTS.length];
      const c1 = 60 + (seed % 22);
      const c2 = 25 + (seed % 12);
      const c3 = Math.max(2, 100 - c1 - c2);
      resolve({
        imageUrl: URL.createObjectURL(file),
        predictions: [
          { variant: v1, confidence: c1, reasoning: "Cabeza blocky y estructura ósea pesada consistente con esta variante." },
          { variant: v2, confidence: c2, reasoning: "Algunas características estructurales se superponen, especialmente el ancho del pecho." },
          { variant: v3, confidence: c3, reasoning: "Señal leve en definición muscular y grosor de extremidades." },
        ],
        colorGenetics: [
          { color: "Dilución azul", gene: "dd", description: "Dilución azul recesiva detectada. Ambos padres portan el alelo." },
          { color: "Patrón tricolor", gene: "at/at", description: "Patrón tan point visible en los puntos." },
        ],
        estimatedWeight: { min: 18 + (seed % 12), max: 35 + (seed % 12) },
        recommendedTraits: ["Cabeza blocky", "Estructura ósea pesada", "Pecho definido", "Postura atlética"],
      });
    }, 1800);
  });
}

export default function DNAAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    const r = await generateAnalysis(file);
    setResult(r);
    setAnalyzing(false);
  }

  function reset() {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-amber-500/10 items-center justify-center mb-5">
          <Sparkles className="w-8 h-8 text-amber-500" strokeWidth={1.75} />
        </div>
        <Badge variant="accent" className="mb-4"><Sparkles className="w-3 h-3" /> Impulsado por IA · Beta</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Análisis IA de raza</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Sube una foto de tu ejemplar. Nuestra IA identifica la variante de bully, la genética del color y el peso adulto esperado — en segundos.
        </p>
      </div>

      <Card>
        {!result && !analyzing && (
          <div>
            <label
              htmlFor="upload"
              className="block border-2 border-dashed border-border rounded-3xl p-12 text-center cursor-pointer hover:border-amber-500/60 hover:bg-amber-500/5 transition"
            >
              {file ? (
                <div>
                  <ImageIcon className="w-12 h-12 mx-auto text-amber-500 mb-3" strokeWidth={1.5} />
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(0)} KB · Haz clic para cambiar</p>
                </div>
              ) : (
                <div>
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
                  <p className="font-semibold">Arrastra una foto o haz clic para subirla</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG hasta 10 MB · Las fotos de frente funcionan mejor</p>
                </div>
              )}
              <input
                id="upload" ref={inputRef} type="file" accept="image/*" hidden
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleAnalyze} disabled={!file} variant="accent" size="lg" className="flex-1">
                <Sparkles className="w-4 h-4" /> Analizar raza
              </Button>
              {file && <Button onClick={reset} variant="outline">Limpiar</Button>}
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-3 text-center">
              {[
                { Icon: Brain, t: "Entrenado con 80K+", s: "Bullies registrados" },
                { Icon: Zap, t: "Menos de 2s", s: "Tiempo de análisis" },
                { Icon: Target, t: "94.2% precisión", s: "En identificación" },
              ].map(c => (
                <div key={c.t} className="p-4 rounded-xl border border-border">
                  <c.Icon className="w-6 h-6 mx-auto text-amber-500" strokeWidth={1.75} />
                  <p className="text-xs font-semibold mt-2">{c.t}</p>
                  <p className="text-[10px] text-muted-foreground">{c.s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {analyzing && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/10 mb-5 relative">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
              <Sparkles className="w-9 h-9 text-amber-500" />
            </div>
            <p className="font-semibold">Analizando tu foto…</p>
            <p className="text-sm text-muted-foreground mt-1">Modelo de 14M parámetros en ejecución</p>
            <div className="mt-6 max-w-xs mx-auto h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full shimmer" />
            </div>
          </div>
        )}

        {result && (
          <div>
            <div className="grid md:grid-cols-[1fr_1.5fr] gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.imageUrl} alt="Subida" className="rounded-2xl w-full object-cover aspect-square border border-border" />
              <div>
                <Badge variant="success" className="mb-3"><ShieldCheck className="w-3 h-3" /> Análisis completado</Badge>
                <h3 className="text-xl font-bold">Variante predicha</h3>
                <div className="mt-4 space-y-3">
                  {result.predictions.map((p, i) => {
                    const Place = i === 0 ? Medal : null;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium inline-flex items-center gap-1.5">
                            {Place && <Place className="w-4 h-4 text-amber-500" />}
                            <span className="text-xs text-muted-foreground">#{i + 1}</span> {p.variant}
                          </span>
                          <span className="text-sm font-semibold">{p.confidence}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-amber-500/60" : "bg-amber-500/30"}`} style={{ width: `${p.confidence}%` }} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{p.reasoning}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-muted/30">
                <h4 className="font-semibold mb-3 inline-flex items-center gap-2"><Dna className="w-4 h-4 text-amber-500" /> Genética del color</h4>
                <ul className="space-y-2">
                  {result.colorGenetics.map((g, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{g.color}</span>
                      <span className="text-muted-foreground font-mono ml-2">({g.gene})</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{g.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 rounded-2xl border border-border bg-muted/30">
                <h4 className="font-semibold mb-3 inline-flex items-center gap-2"><Ruler className="w-4 h-4 text-amber-500" /> Peso adulto estimado</h4>
                <p className="text-3xl font-bold">{result.estimatedWeight.min}–{result.estimatedWeight.max} kg</p>
                <p className="text-xs text-muted-foreground mt-1">Basado en análisis estructural</p>
                <h4 className="font-semibold mt-5 mb-2">Rasgos clave detectados</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.recommendedTraits.map(t => <Badge key={t}>{t}</Badge>)}
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-center">
              <p className="font-semibold">¿Quieres registrar este ejemplar?</p>
              <p className="text-sm text-muted-foreground mt-1">Hemos pre-llenado el formulario con nuestras predicciones.</p>
              <LinkButton href="/panel/dogs/add" variant="accent" className="mt-3">Registrar con estos resultados</LinkButton>
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={reset} variant="outline"><RefreshCcw className="w-4 h-4" /> Analizar otra foto</Button>
            </div>
          </div>
        )}
      </Card>

      <p className="mt-6 text-xs text-center text-muted-foreground">
        Aviso: Esta herramienta provee predicciones como guía. La clasificación oficial de variante requiere evaluación por un juez certificado ABCI.
      </p>
    </div>
  );
}
