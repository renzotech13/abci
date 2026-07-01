"use client";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";

/**
 * QR real y escaneable (no decorativo). Siempre se renderiza en negro sobre
 * blanco con buen contraste, independiente del tema claro/oscuro del sitio.
 */
export function QRCode({ value, size = 132 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCodeLib.toDataURL(value, {
      width: size * 2, // mayor resolución para impresión nítida
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(url => { if (!cancelled) setDataUrl(url); })
      .catch(() => { if (!cancelled) setDataUrl(null); });
    return () => { cancelled = true; };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="bg-zinc-100 animate-pulse rounded-md"
        style={{ width: size, height: size }}
        aria-label="Generando código QR…"
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt={`Código QR para verificar ${value}`} width={size} height={size} className="block" />;
}
