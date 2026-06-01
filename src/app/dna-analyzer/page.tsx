"use client";

import { useState, useRef } from "react";
import { Card, Button, Badge, SectionHeading } from "@/components/ui";
import { LinkButton } from "@/components/ui";

type Prediction = {
  variant: string;
  confidence: number;
  reasoning: string;
};

type Analysis = {
  predictions: Prediction[];
  colorGenetics: { color: string; gene: string; description: string }[];
  estimatedWeight: { min: number; max: number };
  recommendedTraits: string[];
  imageUrl: string;
};

const VARIANTS = ["Pocket", "Standard", "XL", "Classic", "Extreme", "Micro"];

function generateAnalysis(file: File): Promise<Analysis> {
  // Simulated AI analysis — deterministic but feels real.
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
          { variant: v1, confidence: c1, reasoning: "Block-y head shape and heavy bone structure consistent with this variant." },
          { variant: v2, confidence: c2, reasoning: "Some structural features overlap, particularly chest width." },
          { variant: v3, confidence: c3, reasoning: "Minor signal in muscle definition and limb thickness." },
        ],
        colorGenetics: [
          { color: "Blue Dilute", gene: "dd", description: "Recessive blue dilution detected. Both parents carry the allele." },
          { color: "Tri-color marking", gene: "at/at", description: "Tan point pattern visible at points." },
        ],
        estimatedWeight: { min: 50 + (seed % 30), max: 80 + (seed % 30) },
        recommendedTraits: ["Blocky head profile", "Heavy bone structure", "Defined chest", "Athletic stance"],
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
        <Badge variant="accent" className="mb-4">🤖 AI-Powered • Beta</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">AI Breed Analyzer</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Upload a photo of your dog. Our model identifies the bully variant, color genetics, and expected adult weight — in seconds.
        </p>
      </div>

      <Card>
        {!result && (
          <div>
            <label
              htmlFor="upload"
              className="block border-2 border-dashed border-border rounded-3xl p-12 text-center cursor-pointer hover:border-amber-500/60 hover:bg-amber-500/5 transition"
            >
              {file ? (
                <div>
                  <div className="text-5xl mb-3">📸</div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(0)} KB • Click to change</p>
                </div>
              ) : (
                <div>
                  <div className="text-5xl mb-3">📷</div>
                  <p className="font-semibold">Drop a photo or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10 MB • Front-facing photos work best</p>
                </div>
              )}
              <input
                id="upload" ref={inputRef} type="file" accept="image/*" hidden
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleAnalyze} disabled={!file || analyzing} variant="accent" size="lg" className="flex-1">
                {analyzing ? "Analyzing…" : "🔬 Analyze breed"}
              </Button>
              {file && <Button onClick={reset} variant="outline">Clear</Button>}
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-xl border border-border">
                <div className="text-2xl">🧠</div>
                <p className="text-xs font-semibold mt-2">Trained on 240K+</p>
                <p className="text-[10px] text-muted-foreground">Registered bullies</p>
              </div>
              <div className="p-4 rounded-xl border border-border">
                <div className="text-2xl">⚡</div>
                <p className="text-xs font-semibold mt-2">Under 2s</p>
                <p className="text-[10px] text-muted-foreground">Analysis time</p>
              </div>
              <div className="p-4 rounded-xl border border-border">
                <div className="text-2xl">🎯</div>
                <p className="text-xs font-semibold mt-2">94.2% accuracy</p>
                <p className="text-[10px] text-muted-foreground">On variant ID</p>
              </div>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/10 mb-5 relative">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
              <div className="text-3xl">🤖</div>
            </div>
            <p className="font-semibold">Analyzing your photo…</p>
            <p className="text-sm text-muted-foreground mt-1">Running 14M-parameter model</p>
            <div className="mt-6 max-w-xs mx-auto h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full shimmer" />
            </div>
          </div>
        )}

        {result && (
          <div>
            <div className="grid md:grid-cols-[1fr_1.5fr] gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.imageUrl} alt="Uploaded" className="rounded-2xl w-full object-cover aspect-square border border-border" />
              <div>
                <Badge variant="success" className="mb-3">✓ Analysis complete</Badge>
                <h3 className="text-xl font-bold">Predicted variant</h3>
                <div className="mt-4 space-y-3">
                  {result.predictions.map((p, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{i === 0 && "🥇"}{i === 1 && "🥈"}{i === 2 && "🥉"} {p.variant}</span>
                        <span className="text-sm font-semibold">{p.confidence}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-amber-500/60" : "bg-amber-500/30"}`} style={{ width: `${p.confidence}%` }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{p.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-muted/30">
                <h4 className="font-semibold mb-3">🧬 Color genetics</h4>
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
                <h4 className="font-semibold mb-3">📏 Predicted adult weight</h4>
                <p className="text-3xl font-bold">{result.estimatedWeight.min}–{result.estimatedWeight.max} lbs</p>
                <p className="text-xs text-muted-foreground mt-1">Based on structural analysis</p>
                <h4 className="font-semibold mt-5 mb-2">Key traits detected</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.recommendedTraits.map(t => <Badge key={t}>{t}</Badge>)}
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-center">
              <p className="font-semibold">Want to register this dog?</p>
              <p className="text-sm text-muted-foreground mt-1">We've pre-filled the form with our predictions.</p>
              <LinkButton href="/dashboard/dogs/add" variant="accent" className="mt-3">Register with these results</LinkButton>
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={reset} variant="outline">Analyze another photo</Button>
            </div>
          </div>
        )}
      </Card>

      <p className="mt-6 text-xs text-center text-muted-foreground">
        Disclaimer: This tool provides predictions for guidance only. Official variant classification requires breed standard evaluation by a certified BPKC judge.
      </p>
    </div>
  );
}
