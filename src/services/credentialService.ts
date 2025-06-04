
export interface Credential {
  id: string;
  username: string;
  password: string;
  authCode: string;
  active: boolean;
  createdAt: number;
}

// Mock credential verification service
export const verifyAuthCode = (user: any, code: string): boolean => {
  // Simple mock verification - accept specific codes
  const validCodes = ['010101!', 'admin123', 'pirate', 'test123'];
  return validCodes.includes(code);
};

export const verifyCredentials = (username: string, password: string): Credential | null => {
  const credentials = getCredentials();
  return credentials.find(cred => 
    cred.username === username && 
    cred.password === password && 
    cred.active
  ) || null;
};

export const resetCredentials = (): void => {
  // Reset to default admin credentials
  const defaultCredentials: Credential[] = [
    {
      id: 'admin-default',
      username: 'admin',
      password: 'admin',
      authCode: 'admin123',
      active: true,
      createdAt: Date.now()
    }
  ];
  localStorage.setItem('pirateCredentials', JSON.stringify(defaultCredentials));
};

export const getCredentials = (): Credential[] => {
  const stored = localStorage.getItem('pirateCredentials');
  if (!stored) {
    resetCredentials();
    return getCredentials();
  }
  return JSON.parse(stored);
};

export const addCredential = (username: string, password: string, authCode: string): void => {
  const credentials = getCredentials();
  
  // Check if username already exists
  if (credentials.some(cred => cred.username === username)) {
    throw new Error('Username already exists');
  }
  
  const newCredential: Credential = {
    id: crypto.randomUUID(),
    username,
    password,
    authCode,
    active: true,
    createdAt: Date.now()
  };
  
  credentials.push(newCredential);
  localStorage.setItem('pirateCredentials', JSON.stringify(credentials));
};

export const updateCredential = (id: string, updates: Partial<Credential>): void => {
  const credentials = getCredentials();
  const index = credentials.findIndex(cred => cred.id === id);
  
  if (index === -1) {
    throw new Error('Credential not found');
  }
  
  credentials[index] = { ...credentials[index], ...updates };
  localStorage.setItem('pirateCredentials', JSON.stringify(credentials));
};

export const toggleCredentialStatus = (id: string): void => {
  const credentials = getCredentials();
  const credential = credentials.find(cred => cred.id === id);
  
  if (credential) {
    credential.active = !credential.active;
    localStorage.setItem('pirateCredentials', JSON.stringify(credentials));
  }
};

export const deleteCredential = (id: string): void => {
  const credentials = getCredentials();
  const filtered = credentials.filter(cred => cred.id !== id);
  localStorage.setItem('pirateCredentials', JSON.stringify(filtered));
};

export const generateAuthCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const exportCredentialsAsJSON = (): string => {
  const credentials = getCredentials();
  return JSON.stringify(credentials, null, 2);
};

export const importCredentialsFromJSON = (jsonData: string): boolean => {
  try {
    const credentials = JSON.parse(jsonData);
    
    // Validate the data structure
    if (!Array.isArray(credentials)) {
      return false;
    }
    
    // Basic validation of credential structure
    for (const cred of credentials) {
      if (!cred.id || !cred.username || !cred.password || !cred.authCode) {
        return false;
      }
    }
    
    localStorage.setItem('pirateCredentials', JSON.stringify(credentials));
    return true;
  } catch (error) {
    return false;
  }
};

export const exportCredentialsAsCSV = (): string => {
  const credentials = getCredentials();
  const headers = ['ID', 'Username', 'Password', 'Auth Code', 'Active', 'Created At'];
  const rows = credentials.map(cred => [
    cred.id,
    cred.username,
    cred.password,
    cred.authCode,
    cred.active.toString(),
    new Date(cred.createdAt).toISOString()
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
};

export const updateAdminCredentials = (username: string, password: string): boolean => {
  try {
    // Update the default admin credential
    const credentials = getCredentials();
    const adminIndex = credentials.findIndex(cred => cred.id === 'admin-default');
    
    if (adminIndex !== -1) {
      credentials[adminIndex].username = username;
      credentials[adminIndex].password = password;
      localStorage.setItem('pirateCredentials', JSON.stringify(credentials));
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
};
