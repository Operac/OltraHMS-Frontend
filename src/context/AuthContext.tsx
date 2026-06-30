import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { RoleType } from '../constants/roles';

interface User {
  id: string;
  email: string;
  role: RoleType;
  firstName: string;
  lastName: string;
  staffId?: string;
}

  interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
        // Decode JWT payload and check expiry without a library
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp && payload.exp * 1000 < Date.now();
            const hasRefreshToken = !!localStorage.getItem('refreshToken');

            if (isExpired && !hasRefreshToken) {
                // Access token expired and no refresh token to recover — clear session
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
            } else {
                // Either still valid, or expired but recoverable via refresh token.
                // The api interceptor will silently refresh on the next request.
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        } catch {
            // Malformed token — clear it
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            setToken(null);
        }
    }
    setLoading(false);
    // Note: the 401 handling + silent token refresh interceptor is installed
    // once on the default axios instance in main.tsx (installAuthInterceptors).
  }, [token]);

  const login = (newToken: string, newUser: User, refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
