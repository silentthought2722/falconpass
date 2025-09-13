/**
 * Utility functions for the FalconPass backend
 */

import { randomBytes } from 'crypto';

/**
 * Generate a random string of specified length
 * @param length Length of the random string
 * @returns Random string in hex format
 */
export function generateRandomString(length: number): string {
  return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * Format error for consistent API responses
 * @param message Error message
 * @param code HTTP status code
 * @param details Additional error details
 * @returns Formatted error object
 */
export function formatError(message: string, code: number = 500, details?: any): any {
  return {
    error: {
      message,
      code,
      details,
    },
  };
}

/**
 * Safely parse JSON with error handling
 * @param json JSON string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed JSON or default value
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Safely stringify JSON with error handling
 * @param data Data to stringify
 * @param defaultValue Default value to return if stringification fails
 * @returns JSON string or default value
 */
export function safeJsonStringify(data: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Validate email format
 * @param email Email to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize a string for safe storage and display
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .trim();
}

/**
 * Convert database snake_case to camelCase for API responses
 * @param obj Object with snake_case keys
 * @returns Object with camelCase keys
 */
export function snakeToCamel<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key];
    }
  }
  
  return result as T;
}

/**
 * Convert camelCase to snake_case for database operations
 * @param obj Object with camelCase keys
 * @returns Object with snake_case keys
 */
export function camelToSnake<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
  }
  
  return result as T;
}

/**
 * Mask sensitive data for logging
 * @param data Data containing sensitive information
 * @param fieldsToMask Fields to mask
 * @returns Data with masked sensitive fields
 */
export function maskSensitiveData<T extends Record<string, any>>(
  data: T,
  fieldsToMask: string[] = ['password', 'token', 'secret', 'key', 'verifier']
): T {
  const result = { ...data };
  
  for (const field of fieldsToMask) {
    for (const key in result) {
      if (key.toLowerCase().includes(field.toLowerCase()) && typeof result[key] === 'string') {
        result[key] = '********';
      }
    }
  }
  
  return result;
}