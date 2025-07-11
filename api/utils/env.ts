// api/utils/env.ts
/**
 * Environment variable validation utilities
 */

interface RequiredEnvVars {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
}

interface OptionalEnvVars {
  VERCEL_URL?: string;
  PRODUCTION_URL?: string;
  NODE_ENV?: string;
}

/**
 * Validates that all required environment variables are present
 */
export function validateEnvVars(): RequiredEnvVars & OptionalEnvVars {
  const required: (keyof RequiredEnvVars)[] = [
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return {
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL!,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN!,
    VERCEL_URL: process.env.VERCEL_URL,
    PRODUCTION_URL: process.env.PRODUCTION_URL,
    NODE_ENV: process.env.NODE_ENV || "development",
  };
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Get allowed origins based on environment
 */
export function getAllowedOrigins(): string[] {
  const env = validateEnvVars();

  const origins = [
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : null,
    env.PRODUCTION_URL || null,
  ].filter(Boolean) as string[];

  // Add development origins only in non-production
  if (!isProduction()) {
    origins.push(
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173"
    );
  }

  return origins;
}
