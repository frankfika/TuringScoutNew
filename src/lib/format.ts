export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function asSteps(value: unknown): string[] {
  return asStringArray(value);
}

export function scoreFor(organic?: number | null, override?: number | null) {
  return override ?? organic ?? 0;
}

export function formatMinutes(minutes?: number | null) {
  if (!minutes) return "Time varies";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours} hr`;
}

export function labelize(value?: string | null) {
  if (!value) return "Unknown";
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function siteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}
