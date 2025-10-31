import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiMe, apiSignIn, apiSignUp, setAuthToken } from '../lib/api';

type LocalUser = { id: string | number; email: string } | null;

interface AuthContextType {
  user: LocalUser;
  session: null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LocalUser>(null);
  const [session] = useState<null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setAuthToken(token);
      apiMe()
        .then((u) => {
          setUser({ id: u.id, email: u.email });
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          setAuthToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, _fullName?: string) => {
    try {
      await apiSignUp(email, password);
      // Optionally auto-login after signup
      const { access_token } = await apiSignIn(email, password);
      localStorage.setItem('auth_token', access_token);
      setAuthToken(access_token);
      const u = await apiMe();
      setUser({ id: u.id, email: u.email });
      return { error: null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error('Signup failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { access_token } = await apiSignIn(email, password);
      localStorage.setItem('auth_token', access_token);
      setAuthToken(access_token);
      const u = await apiMe();
      setUser({ id: u.id, email: u.email });
      return { error: null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error('Login failed') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    setUser(null);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
