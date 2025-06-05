// The hash of allowedExceptions array, used for integrity validation
export const ALLOWED_EXCEPTIONS_INTEGRITY_HASH = 'sha384-...'; // This will be updated by build.js

export const allowedPages = [
  'index',
  'account',
  'send',
  'receive',
  'messages',
  'deposits',
  'export',
  'settings',
  'donate',
  'network',
  'disconnect',
  'createWallet',
  'import',
  'importFromKeys',
  'importFromFile',
  'importFromMnemonic',
  'importFromQr',
  'termsOfUse',
  'privacyPolicy',
  'support',
] as const;

// List of allowed exceptions for special URLs
export const allowedExceptions = [
  'send%3Faddress%3Dccx7V4LeUXy2eZ9waDXgsLS7Uc11e2CpNSCWVdxEqSRFAm6P6NQhSb7XMG1D6VAZKmJeaJP37WYQg84zbNrPduTX2whZ5pacfj'
] as const;

export type AllowedPage = typeof allowedPages[number];

// Helper function to check if a page is allowed
export function isAllowedPage(page: string): page is AllowedPage {
  return allowedPages.includes(page as AllowedPage);
}

// Helper function to check if a URL is an allowed exception
export function isAllowedException(url: string): boolean {
  return allowedExceptions.includes(url as typeof allowedExceptions[number]);
}

// Helper function to validate the exceptions integrity
export async function validateExceptionsIntegrity(): Promise<boolean> {
  // Calculate current hash using sha3 of just the exceptions array
  const exceptionsContent = allowedExceptions.join('').replace(/['"]/g, '').replace(/,/g, '').trim();
  const currentHash = `sha384-${(window as any).sha3_384(exceptionsContent)}`;
    
  return currentHash === ALLOWED_EXCEPTIONS_INTEGRITY_HASH;
}