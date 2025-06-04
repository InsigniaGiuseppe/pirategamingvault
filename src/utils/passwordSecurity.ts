
// Mock password security check
export const checkPasswordCompromised = async (password: string): Promise<boolean> => {
  // Simple mock check - just return false for passwords longer than 8 chars
  return Promise.resolve(password.length < 8);
};

export const evaluatePasswordStrength = (password: string): number => {
  let score = 0;
  
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  
  return Math.min(score, 100);
};

export const getPasswordFeedback = (score: number): { text: string; color: string } => {
  if (score < 30) {
    return { text: 'Very Weak', color: 'text-red-500' };
  } else if (score < 50) {
    return { text: 'Weak', color: 'text-orange-500' };
  } else if (score < 70) {
    return { text: 'Fair', color: 'text-yellow-500' };
  } else if (score < 90) {
    return { text: 'Strong', color: 'text-blue-500' };
  } else {
    return { text: 'Very Strong', color: 'text-green-500' };
  }
};

export const generateSecurePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest with random characters
  for (let i = 4; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
