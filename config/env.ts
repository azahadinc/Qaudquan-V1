import { z } from 'zod';

/**
 * Environment variable validation schema
 * Ensures all required environment variables are present at startup
 */
const envSchema = z.object({
  // Get from deployment platform
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // API Keys - Financial Data
  NEXT_PUBLIC_POLYGON_API_KEY: z.string().optional(),
  NEXT_PUBLIC_BINANCE_WS_URL: z.string().default('wss://stream.binance.com:9443/ws'),
  OANDA_API_KEY: z.string().optional(),
  ALPHA_VANTAGE_API_KEY: z.string().optional(),
  FINNHUB_API_KEY: z.string().optional(),

  // External Services
  NEXT_PUBLIC_ANTHROPIC_API_KEY: z.string().optional(),

  // Database / Cache
  REDIS_URL: z.string().optional(),

  // App Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default('Qaudquan'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('0.1.0'),
});

type Env = z.infer<typeof envSchema>;

// Validate environment variables at module load time
let validated: Env;

try {
  validated = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  ${err.path.join('.')}: ${err.message}`);
    });
  }
  throw new Error('Failed to validate environment variables');
}

export const env = validated;
