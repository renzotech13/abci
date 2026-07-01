import { cn } from "@/lib/utils";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

export function Button({
  children, variant = "primary", size = "md", className, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "outline" | "accent"; size?: "sm" | "md" | "lg" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer";
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  };
  const variants = {
    primary: "bg-foreground text-background hover:opacity-90",
    secondary: "bg-muted text-foreground hover:bg-border",
    ghost: "text-foreground hover:bg-muted",
    outline: "border border-border bg-transparent text-foreground hover:bg-muted hover:border-foreground/30",
    accent: "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_2px_12px_rgba(232,185,35,0.25)] hover:shadow-[0_4px_20px_rgba(232,185,35,0.4)] hover:-translate-y-0.5",
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props}>{children}</button>;
}

export function LinkButton({
  children, href, variant = "primary", size = "md", className, ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: "primary" | "secondary" | "ghost" | "outline" | "accent"; size?: "sm" | "md" | "lg" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out active:scale-[0.97] whitespace-nowrap cursor-pointer";
  const sizes = { sm: "h-9 px-4 text-sm", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-base" };
  const variants = {
    primary: "bg-foreground text-background hover:opacity-90",
    secondary: "bg-muted text-foreground hover:bg-border",
    ghost: "text-foreground hover:bg-muted",
    outline: "border border-border bg-transparent text-foreground hover:bg-muted hover:border-foreground/30",
    accent: "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_2px_12px_rgba(232,185,35,0.25)] hover:shadow-[0_4px_20px_rgba(232,185,35,0.4)] hover:-translate-y-0.5",
  };
  return <Link href={href} className={cn(base, sizes[size], variants[variant], className)} {...props}>{children}</Link>;
}

export function Card({ children, className, hoverable }: { children: ReactNode; className?: string; hoverable?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border border-border bg-card p-6 shadow-elevation-1 transition-all duration-300 ease-out",
      hoverable && "hover:shadow-elevation-2 hover:border-amber-500/30 hover:-translate-y-0.5",
      className
    )}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = "default", className }: { children: ReactNode; variant?: "default" | "accent" | "success" | "warning"; className?: string }) {
  const variants = {
    default: "bg-muted text-foreground",
    accent: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    warning: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  };
  return <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors", variants[variant], className)}>{children}</span>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full h-11 px-4 rounded-xl border border-border bg-background text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("w-full h-11 px-3 rounded-xl border border-border bg-background text-sm outline-none transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500", props.className)} />;
}

export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return <label htmlFor={htmlFor} className={cn("block text-sm font-medium text-foreground mb-1.5", className)}>{children}</label>;
}

export function SectionHeading({ eyebrow, title, description, center }: { eyebrow?: string; title: string; description?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <span className="inline-block mb-3 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-wider uppercase">{eyebrow}</span>}
      <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.15]">{title}</h2>
      {description && <p className="mt-3 text-base text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  );
}

export function Empty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-14 px-6 rounded-2xl border border-dashed border-border">
      <PawPrint className="w-9 h-9 mx-auto mb-3 text-amber-500" strokeWidth={1.5} />
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
