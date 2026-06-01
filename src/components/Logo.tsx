import Link from "next/link";

export function Logo({ size = "default" }: { size?: "default" | "small" | "large" }) {
  const dim = size === "small" ? 28 : size === "large" ? 44 : 36;
  const text = size === "small" ? "text-base" : size === "large" ? "text-2xl" : "text-xl";
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      <span className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
        <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#lg)" />
          <path d="M14 32V16h7c4 0 6 2 6 5 0 2-1 3-3 4 3 1 4 2 4 5 0 3-2 5-7 5h-7zm5-4h2c1 0 2-1 2-2s-1-2-2-2h-2v4zm0-7h2c1 0 2-1 2-2s-1-2-2-2h-2v4z" fill="#0a0a0f" />
          <circle cx="36" cy="14" r="4" fill="#0a0a0f" />
        </svg>
      </span>
      <span className={`font-bold tracking-tight ${text} text-foreground`}>
        Bully<span className="text-amber-500">Pedex</span>
      </span>
    </Link>
  );
}
