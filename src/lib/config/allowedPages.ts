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

export type AllowedPage = typeof allowedPages[number];

// Helper function to check if a page is allowed
export function isAllowedPage(page: string): page is AllowedPage {
  return allowedPages.includes(page as AllowedPage);
} 