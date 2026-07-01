"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Envuelve contenido y lo revela con un fade+slide sutil cuando entra en viewport.
 * Usa IntersectionObserver (una sola vez, se desconecta tras revelar) — no impacta
 * el rendimiento de scroll. Respeta prefers-reduced-motion vía CSS (ver globals.css).
 */
export function Reveal({
  children, delay = 0, className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={visible ? "visible" : undefined}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={className}
    >
      {children}
    </div>
  );
}

/** Revela una grilla de hijos con un desfase escalonado (30-50ms por elemento). */
export function RevealGroup({
  children, className, stagger = 60,
}: {
  children: ReactNode[];
  className?: string;
  stagger?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * stagger}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
