import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, supabase } from '../lib/supabase';
import { onAuthStateChange, getCurrentUser } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial user fetch
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Also listen to session changes directly
    const { data: { subscription: sessionSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Refresh user after sign in
        try {
          const user = await getCurrentUser();
          setUser(user);
          setLoading(false);
        } catch (error) {
          console.error('Error refreshing user after sign in:', error);
          setLoading(false);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
      sessionSub?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
