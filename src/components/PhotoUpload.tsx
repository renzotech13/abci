"use client";

import { useRef, useState } from "react";
import { Camera, X, Loader2, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_DIMENSION = 640; // px — suficiente para tarjetas, perfil y pedigree
const JPEG_QUALITY = 0.78;
const MAX_SOURCE_MB = 12; // rechaza archivos absurdamente grandes antes de procesarlos

/** Redimensiona y comprime una imagen en el navegador, devuelve un data URL JPEG liviano. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.onload = () => {
      img.onerror = () => reject(new Error("Archivo de imagen inválido"));
      img.onload = () => {
        const ratio = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas no disponible")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoUpload({
  value, onChange, size = "lg", shape = "square",
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  size?: "md" | "lg" | "xl";
  shape?: "square" | "circle";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sizeClass = { md: "w-20 h-20", lg: "w-28 h-28", xl: "w-36 h-36" }[size];
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  async function handleFile(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > MAX_SOURCE_MB * 1024 * 1024) {
      setError(`La imagen es muy grande (máx. ${MAX_SOURCE_MB}MB).`);
      return;
    }
    setBusy(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch {
      setError("No se pudo procesar la imagen. Probá con otro archivo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={cn(
            "relative flex items-center justify-center overflow-hidden border-2 border-dashed border-border bg-muted hover:border-amber-500/60 transition shrink-0",
            sizeClass, shapeClass,
          )}
          aria-label="Subir foto"
        >
          {busy ? (
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Foto del ejemplar" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Camera className="w-6 h-6" strokeWidth={1.5} />
              <span className="text-[10px]">Subir foto</span>
            </div>
          )}

          {!busy && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Camera className="w-5 h-5 text-white" />
            </div>
          )}
        </button>

        {value && !busy && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow hover:bg-rose-600 transition"
            aria-label="Quitar foto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-rose-500 inline-flex items-center gap-1 max-w-[14rem]">
          <ImageOff className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
      {!error && (
        <p className="text-[10px] text-muted-foreground">JPG, PNG o WEBP. Se optimiza automáticamente.</p>
      )}
    </div>
  );
}
