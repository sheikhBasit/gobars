declare module '@env' {
  export const APP_ENV: 'development' | 'staging' | 'production';
  export const API_BASE_URL: string;
  export const API_KEY: string;
  export const GOOGLE_MAPS_API_KEY: string;
  export const SENTRY_DSN: string;
}
