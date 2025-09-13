/**
 * Configuration settings for the FalconPass backend
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Environment type
type Environment = 'development' | 'test' | 'production';

// Configuration interface
interface Config {
  env: Environment;
  isDevelopment: boolean;
  isTest: boolean;
  isProduction: boolean;
  host: string;
  port: number;
  logLevel: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  cookieSecret: string;
  rpID: string; // Relying Party ID for WebAuthn
  rpName: string; // Relying Party Name for WebAuthn
  origin: string; // Origin URL for WebAuthn and CORS
  dbConfig: {
    client: string;
    connection: {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
    };
    migrations: {
      directory: string;
    };
    seeds: {
      directory: string;
    };
  };
}

// Get environment
const env = (process.env.NODE_ENV || 'development') as Environment;

// Create and export configuration
export const config: Config = {
  env,
  isDevelopment: env === 'development',
  isTest: env === 'test',
  isProduction: env === 'production',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-token-for-falcon-pass',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  cookieSecret: process.env.COOKIE_SECRET || 'super-secret-cookie-for-falcon-pass',
  rpID: process.env.RP_ID || 'localhost',
  rpName: process.env.RP_NAME || 'FalconPass',
  origin: process.env.ORIGIN || 'http://localhost:5174',
  dbConfig: {
    client: 'sqlite3',
    connection: {
      filename: resolve(__dirname, '../falcon_pass.db'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: resolve(__dirname, '../migrations'),
    },
    seeds: {
      directory: resolve(__dirname, '../seeds'),
    },
  },
};