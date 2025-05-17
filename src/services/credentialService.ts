
// Credential service for managing user authentication
import { v4 as uuidv4 } from 'uuid';

export interface Credential {
  id: string;
  username: string;
  password: string;
  authCode: string;
  active: boolean;
  createdAt: string;
}

// Initialize the credential store with default admin
const initializeCredStore = (): Credential[] => {
  const existingStore = localStorage.getItem('pirateCreds');
  if (existingStore) {
    return JSON.parse(existingStore);
  }

  // Create initial admin account
  const initialStore: Credential[] = [
    {
      id: uuidv4(),
      username: "Dannehsbum",
      password: "lol123!",
      authCode: "010101!",
      active: true,
      createdAt: new Date().toISOString()
    }
  ];
  
  localStorage.setItem('pirateCreds', JSON.stringify(initialStore));
  return initialStore;
};

// Generate a random 6-digit auth code
export const generateAuthCode = (): string => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomNumber = array[0] % 1000000;
  return randomNumber.toString().padStart(6, '0');
};

// Get all credentials
export const getCredentials = (): Credential[] => {
  return initializeCredStore();
};

// Find a credential by username
export const findCredentialByUsername = (username: string): Credential | undefined => {
  const creds = getCredentials();
  return creds.find(cred => cred.username.toLowerCase() === username.toLowerCase());
};

// Verify credentials
export const verifyCredentials = (username: string, password: string): Credential | undefined => {
  const credential = findCredentialByUsername(username);
  if (credential && credential.password === password && credential.active) {
    return credential;
  }
  return undefined;
};

// Verify auth code for a user
export const verifyAuthCode = (username: string, authCode: string): boolean => {
  const credential = findCredentialByUsername(username);
  return credential ? credential.authCode === authCode : false;
};

// Add a new credential
export const addCredential = (username: string, password: string, authCode?: string): Credential => {
  const creds = getCredentials();
  
  // Check if username already exists
  if (creds.some(cred => cred.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username already exists');
  }
  
  const newCredential: Credential = {
    id: uuidv4(),
    username,
    password,
    authCode: authCode || generateAuthCode(),
    active: true,
    createdAt: new Date().toISOString()
  };
  
  creds.push(newCredential);
  localStorage.setItem('pirateCreds', JSON.stringify(creds));
  
  return newCredential;
};

// Update a credential
export const updateCredential = (id: string, updates: Partial<Credential>): Credential => {
  const creds = getCredentials();
  const index = creds.findIndex(cred => cred.id === id);
  
  if (index === -1) {
    throw new Error('Credential not found');
  }
  
  const updated = { ...creds[index], ...updates };
  creds[index] = updated;
  
  localStorage.setItem('pirateCreds', JSON.stringify(creds));
  return updated;
};

// Toggle a credential active status
export const toggleCredentialStatus = (id: string): Credential => {
  const creds = getCredentials();
  const index = creds.findIndex(cred => cred.id === id);
  
  if (index === -1) {
    throw new Error('Credential not found');
  }
  
  creds[index].active = !creds[index].active;
  localStorage.setItem('pirateCreds', JSON.stringify(creds));
  
  return creds[index];
};

// Delete a credential
export const deleteCredential = (id: string): void => {
  const creds = getCredentials();
  const filteredCreds = creds.filter(cred => cred.id !== id);
  localStorage.setItem('pirateCreds', JSON.stringify(filteredCreds));
};

// Export credentials as CSV
export const exportCredentialsAsCSV = (): string => {
  const creds = getCredentials();
  const headers = 'ID,Username,Password,AuthCode,Active,CreatedAt\n';
  
  const rows = creds.map(cred => 
    `${cred.id},${cred.username},${cred.password},${cred.authCode},${cred.active},${cred.createdAt}`
  ).join('\n');
  
  return headers + rows;
};

// Update admin credentials 
export const updateAdminCredentials = (username: string, password: string): Credential | undefined => {
  const creds = getCredentials();
  const adminIndex = creds.findIndex(cred => cred.username === "Dannehsbum");
  
  if (adminIndex !== -1) {
    creds[adminIndex].username = username;
    creds[adminIndex].password = password;
    localStorage.setItem('pirateCreds', JSON.stringify(creds));
    return creds[adminIndex];
  }
  
  return undefined;
};
