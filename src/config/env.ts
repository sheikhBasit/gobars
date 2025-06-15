// config/env.ts - Replace with this simplified version
import {
  API_BASE_URL,
  API_KEY,
  GOOGLE_MAPS_API_KEY,
  SENTRY_DSN,
  APP_ENV
} from '@env';

type Environment = 'development' | 'staging' | 'production';

const validatedEnv = {
  API_BASE_URL,
  API_KEY,
  GOOGLE_MAPS_API_KEY,
  SENTRY_DSN,
  APP_ENV: APP_ENV as Environment,

  // Helper properties
  IS_DEV: APP_ENV === 'development',
  IS_STAGING: APP_ENV === 'staging',
  IS_PROD: APP_ENV === 'production',

  // Endpoints
  ENDPOINTS: {
    AUTH: {
      SIGNUP: `${API_BASE_URL}/auth/signup`,
      LOGIN: `${API_BASE_URL}/auth/login`,
    }
  }
};

// Validate required variables
if (!validatedEnv.API_BASE_URL) {
  throw new Error('API_BASE_URL is required in .env file');
}

if (!validatedEnv.API_KEY) {
  throw new Error('API_KEY is required in .env file');
}

export const Env = validatedEnv;
