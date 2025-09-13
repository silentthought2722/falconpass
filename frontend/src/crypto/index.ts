/**
 * FalconPass Cryptography Module
 * 
 * This module implements client-side cryptography for the password manager:
 * - Argon2id for key derivation from master password
 * - XChaCha20-Poly1305 for authenticated encryption of vault entries
 * - Zero-knowledge design: master password never sent to server
 */

import * as argon2 from 'argon2-browser';
import * as sodium from 'libsodium-wrappers';

// Constants for cryptography
const SALT_BYTES = 16;
const NONCE_BYTES = 24; // XChaCha20 uses 24-byte nonces
const KEY_BYTES = 32;

/**
 * Initialize the sodium library
 */
export async function initCrypto(): Promise<void> {
  await sodium.ready;
  console.log('Cryptography module initialized');
}

/**
 * Derive a key from the master password using Argon2id
 * @param password The master password
 * @param salt Optional salt (generated if not provided)
 * @returns Object containing the derived key and salt used
 */
export async function deriveKeyFromPassword(
  password: string,
  salt?: Uint8Array
): Promise<{ key: Uint8Array; salt: Uint8Array }> {
  // Generate salt if not provided
  if (!salt) {
    salt = sodium.randombytes_buf(SALT_BYTES);
  }

  // Use Argon2id to derive a key from the password
  const result = await argon2.hash({
    pass: password,
    salt: salt,
    type: argon2.ArgonType.Argon2id,
    time: 3, // Number of iterations
    mem: 65536, // Memory to use in KiB (64 MB)
    hashLen: KEY_BYTES, // Output key length
  });

  return {
    key: new Uint8Array(result.hash),
    salt: salt,
  };
}

/**
 * Encrypt data using XChaCha20-Poly1305
 * @param data The plaintext data to encrypt
 * @param key The encryption key
 * @returns Object containing the ciphertext, nonce, and salt
 */
export function encryptData(
  data: string,
  key: Uint8Array
): { ciphertext: Uint8Array; nonce: Uint8Array } {
  // Generate a random nonce
  const nonce = sodium.randombytes_buf(NONCE_BYTES);
  
  // Convert data to Uint8Array
  const dataBytes = sodium.from_string(data);
  
  // Encrypt the data
  const ciphertext = sodium.crypto_secretbox_easy(dataBytes, nonce, key);
  
  return {
    ciphertext,
    nonce,
  };
}

/**
 * Decrypt data using XChaCha20-Poly1305
 * @param ciphertext The encrypted data
 * @param nonce The nonce used for encryption
 * @param key The encryption key
 * @returns The decrypted data as a string
 */
export function decryptData(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  key: Uint8Array
): string {
  try {
    // Decrypt the data
    const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
    
    // Convert back to string
    return sodium.to_string(decrypted);
  } catch (error) {
    throw new Error('Decryption failed. Invalid key or corrupted data.');
  }
}

/**
 * Generate a secure random password
 * @param length The length of the password
 * @param options Options for password generation
 * @returns A randomly generated password
 */
export function generatePassword(
  length: number = 16,
  options: {
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
  } = {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  }
): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let charset = '';
  if (options.uppercase) charset += uppercaseChars;
  if (options.lowercase) charset += lowercaseChars;
  if (options.numbers) charset += numberChars;
  if (options.symbols) charset += symbolChars;
  
  // Default to alphanumeric if no options selected
  if (charset === '') {
    charset = uppercaseChars + lowercaseChars + numberChars;
  }
  
  // Generate random bytes
  const randomBytes = sodium.randombytes_buf(length * 2);
  
  // Convert to password
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Serialize encrypted vault entry for storage
 * @param ciphertext The encrypted data
 * @param nonce The nonce used for encryption
 * @param salt The salt used for key derivation
 * @returns Base64 encoded string of serialized data
 */
export function serializeEncryptedData(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  salt: Uint8Array
): string {
  // Concatenate all bytes: [salt][nonce][ciphertext]
  const combined = new Uint8Array(salt.length + nonce.length + ciphertext.length);
  combined.set(salt, 0);
  combined.set(nonce, salt.length);
  combined.set(ciphertext, salt.length + nonce.length);
  
  // Convert to Base64 for storage
  return sodium.to_base64(combined);
}

/**
 * Deserialize encrypted vault entry from storage
 * @param serialized Base64 encoded string of serialized data
 * @returns Object containing the ciphertext, nonce, and salt
 */
export function deserializeEncryptedData(
  serialized: string
): { ciphertext: Uint8Array; nonce: Uint8Array; salt: Uint8Array } {
  // Convert from Base64
  const combined = sodium.from_base64(serialized);
  
  // Extract components
  const salt = combined.slice(0, SALT_BYTES);
  const nonce = combined.slice(SALT_BYTES, SALT_BYTES + NONCE_BYTES);
  const ciphertext = combined.slice(SALT_BYTES + NONCE_BYTES);
  
  return {
    ciphertext,
    nonce,
    salt,
  };
}