/**
 * Temporary Email Service for FalconPass Frontend
 * Provides functionality for generating and managing temporary email addresses
 */

// List of common temporary email domains
export const TEMP_EMAIL_DOMAINS = [
  'tempmail.com',
  'temp-mail.org',
  'disposable.com',
  'mailinator.com',
  'guerrillamail.com',
  'falconpass-temp.com', // Custom domain for FalconPass
];

// Characters to use for username generation
const USERNAME_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a random string of specified length using provided character set
 */
function generateRandomString(length: number, charset: string = USERNAME_CHARS): string {
  let result = '';
  const charsetLength = charset.length;
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(randomValues[i] % charsetLength);
  }
  
  return result;
}

/**
 * Generate a random temporary email address
 */
export function generateTempEmail(options: {
  usernameLength?: number;
  customDomain?: string;
  includeTimestamp?: boolean;
} = {}): string {
  const {
    usernameLength = 10,
    customDomain,
    includeTimestamp = true,
  } = options;
  
  // Generate random username
  let username = generateRandomString(usernameLength);
  
  // Add timestamp for uniqueness if requested
  if (includeTimestamp) {
    username += `.${Date.now().toString(36)}`;
  }
  
  // Select domain (custom or random from list)
  const domain = customDomain || TEMP_EMAIL_DOMAINS[Math.floor(Math.random() * TEMP_EMAIL_DOMAINS.length)];
  
  return `${username}@${domain}`;
}

/**
 * Validate if an email appears to be a temporary/disposable email
 */
export function isTempEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  return TEMP_EMAIL_DOMAINS.some(tempDomain => domain.includes(tempDomain));
}

/**
 * Generate multiple temporary email addresses
 */
export function generateMultipleTempEmails(count: number, options = {}): string[] {
  const emails: string[] = [];
  for (let i = 0; i < count; i++) {
    emails.push(generateTempEmail(options));
  }
  return emails;
}

// Export a default service object
const tempEmailService = {
  generateTempEmail,
  isTempEmail,
  generateMultipleTempEmails,
};

export default tempEmailService;