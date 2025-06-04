
// Emergency fix: Pure local registration service with no Supabase calls to prevent freezing

export interface CustomUser {
  id: string;
  username: string;
  email?: string;
}

export interface CustomSession {
  access_token: string;
  expires_at: number;
}

// Mock users database for local registration
const mockUsers = new Map([
  ['test', { username: 'test', password: 'test', id: 'test-user-id-123' }],
  ['admin', { username: 'admin', password: 'admin', id: 'admin-user-id-456' }],
  ['demo', { username: 'demo', password: 'demo', id: 'demo-user-id-789' }]
]);

// Pure local registration with no Supabase calls (mirrors login logic)
export const registerUser = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  try {
    console.log('Local registration attempt for:', username);
    
    // Input validation
    if (!username || username.trim().length === 0) {
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length === 0) {
      return { user: null, session: null, error: 'Password is required' };
    }
    
    // Check if user already exists in mock users
    const existingUser = mockUsers.get(username.toLowerCase());
    if (existingUser) {
      return { user: null, session: null, error: 'Username already exists' };
    }
    
    // Create new user automatically 
    const newUser: CustomUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: username,
    };
    
    const newSession: CustomSession = {
      access_token: `mock-token-${Date.now()}`,
      expires_at: Date.now() / 1000 + 3600,
    };
    
    // Store new user in mock database
    mockUsers.set(username.toLowerCase(), { 
      username: username, 
      password: password, 
      id: newUser.id 
    });
    
    // Store auth in localStorage
    localStorage.setItem('pirate_user', JSON.stringify(newUser));
    localStorage.setItem('pirate_session', JSON.stringify(newSession));
    
    console.log('Local registration successful for:', username);
    return { user: newUser, session: newSession, error: null };
    
  } catch (error) {
    console.error('Local registration error:', error);
    return { user: null, session: null, error: 'Registration failed' };
  }
};
