import Link from "next/link";

export function Logo({ size = "default" }: { size?: "default" | "small" | "large" }) {
  const dim = size === "small" ? 32 : size === "large" ? 52 : 40;
  const text = size === "small" ? "text-sm" : size === "large" ? "text-2xl" : "text-lg";
  const sub = size === "small" ? "text-[7px]" : size === "large" ? "text-[10px]" : "text-[8px]";
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: dim, height: dim }}>
        <svg viewBox="0 0 56 56" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="abci-belt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a2d0a" />
              <stop offset="50%" stopColor="#000000" />
              <stop offset="100%" stopColor="#3a2d0a" />
            </linearGradient>
            <radialGradient id="abci-medal" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#f5cc46" />
              <stop offset="55%" stopColor="#d4a017" />
              <stop offset="100%" stopColor="#7a5d0a" />
            </radialGradient>
          </defs>
          <rect x="0" y="20" width="56" height="16" rx="3" fill="url(#abci-belt)" />
          <rect x="0" y="20" width="56" height="2" fill="#e8b923" opacity="0.7" />
          <rect x="0" y="34" width="56" height="2" fill="#e8b923" opacity="0.7" />
          <circle cx="28" cy="28" r="18" fill="url(#abci-medal)" stroke="#e8b923" strokeWidth="1.5" />
          <circle cx="28" cy="28" r="14" fill="none" stroke="#fff8d6" strokeWidth="0.6" opacity="0.6" />
          <text x="28" y="32" textAnchor="middle" fontSize="11" fontWeight="900" fill="#000000" fontFamily="system-ui, sans-serif" letterSpacing="0.5">ABCI</text>
          <circle cx="6" cy="28" r="2" fill="#e8b923" />
          <circle cx="50" cy="28" r="2" fill="#e8b923" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-black tracking-tight ${text} text-foreground`}>
          ABCI <span className="text-amber-500">World Wide</span>
        </span>
        <span className={`${sub} uppercase tracking-[0.25em] text-muted-foreground mt-1`}>Registro Internacional Canino</span>
      </span>
    </Link>
  );
}
