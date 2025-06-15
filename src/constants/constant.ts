import { Env } from '../config/env';

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${Env.API_BASE_URL}/auth/signup`,
    LOGIN: `${Env.API_BASE_URL}/auth/login`,
    // Add other auth endpoints
  },
  USER: {
    PROFILE: `${Env.API_BASE_URL}/user/profile`,
    // Add other user endpoints
  },
  // Add other API categories
};

export const APP_CONSTANTS = {
  NAME: 'MyApp',
  VERSION: '1.0.0',
  ENVIRONMENT: Env.APP_ENV,
};
