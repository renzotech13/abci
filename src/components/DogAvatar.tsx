import { cn } from "@/lib/utils";

export function DogAvatar({ name, size = "md", color = "amber" }: { name: string; size?: "sm" | "md" | "lg" | "xl"; color?: string }) {
  const sizes = {
    sm: "w-10 h-10 text-base",
    md: "w-14 h-14 text-xl",
    lg: "w-20 h-20 text-3xl",
    xl: "w-32 h-32 text-5xl",
  };
  const colorBg: Record<string, string> = {
    amber: "from-amber-400 to-amber-600",
    rose: "from-rose-400 to-rose-600",
    indigo: "from-indigo-400 to-indigo-600",
    emerald: "from-emerald-400 to-emerald-600",
    slate: "from-slate-400 to-slate-600",
  };
  const palette = Object.keys(colorBg);
  const picked = colorBg[color] || colorBg[palette[name.length % palette.length]];
  return (
    <div className={cn("rounded-2xl bg-gradient-to-br flex items-center justify-center text-black font-bold shadow-sm shrink-0", picked, sizes[size])}>
      🐾
    </div>
  );
}
