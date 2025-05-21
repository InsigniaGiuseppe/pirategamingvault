
/**
 * Checks if a password has been compromised using the HaveIBeenPwned API
 * Uses k-anonymity model for security (only sends first 5 chars of hash)
 * @param password The password to check
 * @returns Promise<boolean> True if password is compromised, false otherwise
 */
export const checkPasswordCompromised = async (password: string): Promise<boolean> => {
  try {
    // Convert password to SHA-1 hash using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    
    // Convert hash buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Split the hash into prefix and suffix for k-anonymity
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);
    
    console.log('Checking password security with HaveIBeenPwned API');
    
    // Make request to the HaveIBeenPwned API
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    
    if (!response.ok) {
      console.error('HaveIBeenPwned API error:', response.status);
      return false; // Assume password is safe if API fails
    }
    
    // Get list of hash suffixes and their occurrence counts
    const responseText = await response.text();
    const hashList = responseText.split('\r\n');
    
    // Check if our hash suffix exists in the returned list
    for (const line of hashList) {
      const [hashSuffix, count] = line.split(':');
      
      if (hashSuffix === suffix) {
        console.log(`Password found in ${count} breaches`);
        return true; // Password is compromised
      }
    }
    
    console.log('Password not found in breaches');
    return false; // Password is not compromised
  } catch (error) {
    console.error('Error checking password security:', error);
    return false; // Assume password is safe if check fails
  }
};

/**
 * Evaluates password strength on a scale from 0-100
 * @param password The password to evaluate
 * @returns number Score from 0-100
 */
export const evaluatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  // Start with a base score
  let score = 0;
  
  // Add points for length (max 30 points)
  score += Math.min(30, password.length * 3);
  
  // Add points for character variety
  if (/[A-Z]/.test(password)) score += 10; // Uppercase
  if (/[a-z]/.test(password)) score += 10; // Lowercase
  if (/[0-9]/.test(password)) score += 10; // Numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 15; // Special chars
  
  // Add points for having multiple types of characters
  const charTypes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(regex => 
    regex.test(password)
  ).length;
  score += (charTypes - 1) * 5;
  
  // Deduct points for common patterns
  if (/^123/.test(password) || /password/i.test(password)) {
    score -= 20;
  }
  
  // Cap score between 0-100
  return Math.max(0, Math.min(100, score));
};

/**
 * Gets feedback based on password strength score
 * @param score The password strength score (0-100)
 * @returns { text: string, color: string } Feedback text and color
 */
export const getPasswordFeedback = (score: number): { text: string, color: string } => {
  if (score < 30) {
    return { text: "Very weak", color: "text-red-600" };
  } else if (score < 50) {
    return { text: "Weak", color: "text-orange-500" };
  } else if (score < 70) {
    return { text: "Moderate", color: "text-yellow-500" };
  } else if (score < 90) {
    return { text: "Strong", color: "text-green-500" };
  } else {
    return { text: "Very strong", color: "text-emerald-600" };
  }
};

/**
 * Generates a secure random password
 * @param length The length of the password (default: 12)
 * @param includeSpecial Whether to include special characters (default: true)
 * @returns string A secure random password
 */
export const generateSecurePassword = (length = 12, includeSpecial = true): string => {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I to avoid confusion with 1
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz'; // No l to avoid confusion with 1
  const numberChars = '23456789'; // No 0/1 to avoid confusion with O/l
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  
  let charset = uppercaseChars + lowercaseChars + numberChars;
  if (includeSpecial) charset += specialChars;
  
  // Ensure we have at least one of each type
  let password = '';
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += numberChars[Math.floor(Math.random() * numberChars.length)];
  if (includeSpecial) {
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  }
  
  // Fill the rest randomly
  const remainingLength = length - password.length;
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
