
// Emergency fix: Pure local auth service with no Supabase calls to prevent freezing

export interface CustomUser {
  id: string;
  username: string;
  email?: string;
}

export interface CustomSession {
  access_token: string;
  expires_at: number;
}

// Mock users database for local auth
const mockUsers = new Map([
  ['test', { username: 'test', password: 'test', id: 'test-user-id-123' }],
  ['admin', { username: 'admin', password: 'admin', id: 'admin-user-id-456' }],
  ['demo', { username: 'demo', password: 'demo', id: 'demo-user-id-789' }]
]);

// Pure local login with no Supabase calls
export const login = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  try {
    console.log('Local login attempt for:', username);
    
    // Input validation
    if (!username || username.trim().length === 0) {
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length === 0) {
      return { user: null, session: null, error: 'Password is required' };
    }
    
    // Check mock users
    const mockUser = mockUsers.get(username.toLowerCase());
    if (mockUser && mockUser.password === password) {
      const customUser: CustomUser = {
        id: mockUser.id,
        username: mockUser.username,
      };
      
      const customSession: CustomSession = {
        access_token: `mock-token-${Date.now()}`,
        expires_at: Date.now() / 1000 + 3600, // 1 hour from now
      };
      
      // Store auth in localStorage for persistence
      localStorage.setItem('pirate_user', JSON.stringify(customUser));
      localStorage.setItem('pirate_session', JSON.stringify(customSession));
      
      console.log('Local login successful for:', username);
      return { user: customUser, session: customSession, error: null };
    }
    
    // If not in mock users, create a new user automatically (auto-registration)
    const newUser: CustomUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: username,
    };
    
    const newSession: CustomSession = {
      access_token: `mock-token-${Date.now()}`,
      expires_at: Date.now() / 1000 + 3600,
    };
    
    // Store new user
    mockUsers.set(username.toLowerCase(), { 
      username: username, 
      password: password, 
      id: newUser.id 
    });
    
    // Store auth in localStorage
    localStorage.setItem('pirate_user', JSON.stringify(newUser));
    localStorage.setItem('pirate_session', JSON.stringify(newSession));
    
    console.log('Auto-registration successful for:', username);
    return { user: newUser, session: newSession, error: null };
    
  } catch (error) {
    console.error('Local login error:', error);
    return { user: null, session: null, error: 'Login failed' };
  }
};

// Pure local logout
export const logout = async (): Promise<{error: string | null}> => {
  try {
    localStorage.removeItem('pirate_user');
    localStorage.removeItem('pirate_session');
    console.log('Local logout successful');
    return { error: null };
  } catch (error) {
    console.error('Local logout error:', error);
    return { error: null }; // Always succeed for logout
  }
};

// Pure local session verification
export const verifySession = async (): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  try {
    console.log('Verifying local session...');
    
    const storedUser = localStorage.getItem('pirate_user');
    const storedSession = localStorage.getItem('pirate_session');
    
    if (storedUser && storedSession) {
      const user = JSON.parse(storedUser) as CustomUser;
      const session = JSON.parse(storedSession) as CustomSession;
      
      // Check if session is expired
      if (session.expires_at * 1000 > Date.now()) {
        console.log('Valid local session found for:', user.username);
        return { user, session, error: null };
      } else {
        console.log('Expired local session, removing');
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
      }
    }
    
    console.log('No valid local session found');
    return { user: null, session: null, error: null };
  } catch (error) {
    console.error('Session verification error:', error);
    return { user: null, session: null, error: null };
  }
};

// Export registration service that's also purely local
export const registerUser = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  // Registration is the same as login with auto-creation
  return login(username, password);
};
