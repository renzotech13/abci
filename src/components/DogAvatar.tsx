import { cn } from "@/lib/utils";
import { Dog } from "lucide-react";

export function DogAvatar({
  name, size = "md", color = "amber", photoUrl,
}: { name: string; size?: "sm" | "md" | "lg" | "xl"; color?: string; photoUrl?: string }) {
  const sizes = {
    sm: { box: "w-10 h-10", icon: "w-5 h-5" },
    md: { box: "w-14 h-14", icon: "w-7 h-7" },
    lg: { box: "w-20 h-20", icon: "w-10 h-10" },
    xl: { box: "w-32 h-32", icon: "w-16 h-16" },
  };
  const colorBg: Record<string, string> = {
    amber: "from-amber-400 to-amber-600 text-black",
    rose: "from-rose-400 to-rose-600 text-white",
    indigo: "from-indigo-400 to-indigo-600 text-white",
    emerald: "from-emerald-400 to-emerald-600 text-white",
    slate: "from-zinc-700 to-zinc-900 text-amber-500",
  };
  const palette = Object.keys(colorBg);
  const picked = colorBg[color] || colorBg[palette[name.length % palette.length]];
  const s = sizes[size];

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={cn("rounded-2xl object-cover shadow-sm shrink-0", s.box)}
      />
    );
  }

  return (
    <div className={cn("rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-sm shrink-0", picked, s.box)}>
      <Dog className={s.icon} strokeWidth={1.75} />
    </div>
  );
}
