import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const ignores = [
  ".next/**",
  "node_modules/**",
  "prisma/migrations/**",
  "next-env.d.ts",
];

const config = [
  { ignores },
  ...nextVitals,
  ...nextTs,
];

export default config;
