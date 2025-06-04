
// Mock password security check
export const checkPasswordCompromised = async (password: string): Promise<boolean> => {
  // Simple mock check - just return false for passwords longer than 8 chars
  return Promise.resolve(password.length < 8);
};
