export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(prefix = ""): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}${time}${rand}`.toUpperCase();
}

export function generateCertificateId(): string {
  const segments = [
    "BPX",
    Math.floor(Math.random() * 9000 + 1000).toString(),
    Math.random().toString(36).slice(2, 7).toUpperCase(),
    Math.floor(Math.random() * 90 + 10).toString(),
  ];
  return segments.join("-");
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0) return `${months} months`;
  return `${years}y ${months}m`;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function currency(amount: number, code = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(amount);
}
