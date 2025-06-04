
// Mock credential verification service
export const verifyAuthCode = (user: any, code: string): boolean => {
  // Simple mock verification - accept specific codes
  const validCodes = ['010101!', 'admin123', 'pirate', 'test123'];
  return validCodes.includes(code);
};
