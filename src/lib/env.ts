type EnvSpec = {
  required: boolean;
  defaultValue?: string;
  secret?: boolean;
};

const envSpec: Record<string, EnvSpec> = {
  DATABASE_URL: { required: true, defaultValue: "file:./dev.db" },
  NEXT_PUBLIC_SITE_URL: { required: true, defaultValue: "http://localhost:3000" },
  ADMIN_PASSWORD: { required: true, defaultValue: "turingscout-admin", secret: true },
  AUTH_SECRET: { required: false, defaultValue: "local-auth", secret: true },
  CRON_SECRET: { required: false, defaultValue: "change-me", secret: true },
};

export function getEnv(name: keyof typeof envSpec) {
  return process.env[name] ?? envSpec[name].defaultValue ?? "";
}

export function validateEnv() {
  const issues: Array<{ key: string; severity: "error" | "warning"; message: string }> = [];
  for (const [key, spec] of Object.entries(envSpec)) {
    const value = process.env[key] ?? spec.defaultValue;
    if (spec.required && !value) issues.push({ key, severity: "error", message: `${key} is required` });
    if (process.env.NODE_ENV === "production" && spec.secret && value === spec.defaultValue) {
      issues.push({ key, severity: "error", message: `${key} must be changed in production` });
    }
    if (key === "NEXT_PUBLIC_SITE_URL" && value) {
      try {
        const url = new URL(value);
        if (process.env.NODE_ENV === "production" && url.protocol !== "https:") issues.push({ key, severity: "warning", message: "Production site URL should use HTTPS" });
      } catch {
        issues.push({ key, severity: "error", message: `${key} must be a valid URL` });
      }
    }
  }
  return { ok: issues.every((issue) => issue.severity !== "error"), issues };
}

export function publicEnvSnapshot() {
  const validation = validateEnv();
  return {
    ok: validation.ok,
    issues: validation.issues,
    runtime: process.env.NODE_ENV ?? "development",
    databaseConfigured: Boolean(process.env.DATABASE_URL ?? envSpec.DATABASE_URL.defaultValue),
    siteUrl: getEnv("NEXT_PUBLIC_SITE_URL"),
  };
}
