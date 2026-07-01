export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(prefix = ""): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}${time}${rand}`.toUpperCase();
}

export function generateCertificateId(): string {
  const num = Math.floor(Math.random() * 90000 + 10000);
  return num.toString();
}

export function generateAffixId(): string {
  return `AFX-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-PE", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-PE", {
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
  if (years <= 0) return `${months} meses`;
  return `${years}a ${months}m`;
}

export function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function currency(amount: number, code = "USD"): string {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: code }).format(amount);
}
