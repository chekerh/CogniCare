import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      // First verify session exists
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        return;
      }

      const currentUser = await Promise.race([
        getCurrentUser(),
        new Promise<User | null>((resolve) => 
          setTimeout(() => {
            console.warn('getCurrentUser timeout on refresh');
            resolve(null);
          }, 3000)
        )
      ]);
      
      // Only update if we got a user, or if session is gone
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Verify session is actually gone before clearing
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        if (!verifySession) {
          setUser(null);
        }
        // Otherwise keep existing user - session is valid but profile fetch failed
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Only clear user if session is actually gone
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
      }
    }
  }, []); // Empty dependency array - function doesn't depend on any props/state

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    const initializedRef = { current: false };

    // Set a timeout to ensure loading always resolves (reduced for faster UX)
    timeoutId = setTimeout(() => {
      if (mounted && !initializedRef.current) {
        console.warn('Auth loading timeout - forcing loading to false');
        setLoading(false);
        initializedRef.current = true;
      }
    }, 5000); // 5 second timeout (reduced from 10s)

    // Initial user fetch with timeout and better error handling
    const initAuth = async () => {
      if (initializedRef.current) return; // Prevent duplicate initialization
      
      try {
        // First check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No session, user is not logged in
          if (mounted && !initializedRef.current) {
            setUser(null);
            setLoading(false);
            clearTimeout(timeoutId);
            initializedRef.current = true;
          }
          return;
        }

        // We have a session, try to get user profile with timeout
        const currentUser = await Promise.race([
          getCurrentUser(),
          new Promise<User | null>((resolve) => 
            setTimeout(() => {
              console.warn('getCurrentUser timeout on init');
              resolve(null);
            }, 3000) // Increased timeout to 3 seconds
          )
        ]);
        
        if (mounted && !initializedRef.current) {
          // Only set user if we got one, or verify session is gone before clearing
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Double-check session before clearing user
            const { data: { session: verifySession } } = await supabase.auth.getSession();
            if (!verifySession) {
              setUser(null);
            }
            // If session exists but user fetch failed, we'll retry on next auth event
          }
          setLoading(false);
          clearTimeout(timeoutId);
          initializedRef.current = true;
        }
      } catch (error) {
        console.error('Error fetching initial user:', error);
        // Even on error, we should stop loading
        if (mounted && !initializedRef.current) {
          setUser(null);
          setLoading(false);
          clearTimeout(timeoutId);
          initializedRef.current = true;
        }
      }
    };

    initAuth();

    // Listen for auth state changes - handle all events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, session?.user?.email);

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in - fetch profile with timeout
          // Use Promise.race to avoid long waits
          const userPromise = Promise.race([
            getCurrentUser(),
            new Promise<User | null>((resolve) => 
              setTimeout(() => {
                console.warn('getCurrentUser timeout on SIGNED_IN');
                resolve(null);
              }, 3000) // Increased timeout to 3 seconds
            )
          ]);

          // Try once, then retry once if needed (faster)
          let user = await userPromise;
          if (!user && mounted) {
            // Quick retry after 300ms
            await new Promise(resolve => setTimeout(resolve, 300));
            user = await Promise.race([
              getCurrentUser(),
              new Promise<User | null>((resolve) => 
                setTimeout(() => resolve(null), 2500)
              )
            ]);
          }

          if (mounted) {
            // Only update if we got a user, or if we're sure there's no session
            // Don't clear user on timeout - keep existing user if session exists
            if (user) {
              setUser(user);
            } else {
              // Check if session still exists before clearing
              const { data: { session: currentSession } } = await supabase.auth.getSession();
              if (!currentSession) {
                setUser(null);
              }
              // If session exists but user fetch failed, keep existing user or retry later
            }
            setLoading(false);
            clearTimeout(timeoutId);
            initializedRef.current = true;
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          setUser(null);
          setLoading(false);
          clearTimeout(timeoutId);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token refreshed - update user but don't clear on failure
          try {
            const user = await Promise.race([
              getCurrentUser(),
              new Promise<User | null>((resolve) => 
                setTimeout(() => {
                  console.warn('getCurrentUser timeout on TOKEN_REFRESHED');
                  resolve(null);
                }, 3000)
              )
            ]);
            if (mounted) {
              // Only update if we got a user, otherwise keep existing
              if (user) {
                setUser(user);
              }
              setLoading(false);
            }
          } catch (error) {
            console.error('Error fetching user on token refresh:', error);
            // Don't clear user on error - session still valid
            if (mounted) {
              setLoading(false);
            }
          }
        } else if (event === 'INITIAL_SESSION') {
          // Initial session check - only handle if not already initialized
          if (!initializedRef.current) {
            if (session?.user) {
              try {
                const user = await Promise.race([
                  getCurrentUser(),
                  new Promise<User | null>((resolve) => 
                    setTimeout(() => resolve(null), 3000)
                  )
                ]);
                if (mounted && !initializedRef.current) {
                  // Only set user if we got one, otherwise verify session
                  if (user) {
                    setUser(user);
                  } else {
                    // Verify session before clearing
                    const { data: { session: verifySession } } = await supabase.auth.getSession();
                    if (!verifySession) {
                      setUser(null);
                    }
                  }
                  setLoading(false);
                  clearTimeout(timeoutId);
                  initializedRef.current = true;
                }
              } catch (error) {
                console.error('Error fetching user on initial session:', error);
                if (mounted && !initializedRef.current) {
                  // Only clear if session is gone
                  const { data: { session: verifySession } } = await supabase.auth.getSession();
                  if (!verifySession) {
                    setUser(null);
                  }
                  setLoading(false);
                  clearTimeout(timeoutId);
                  initializedRef.current = true;
                }
              }
            } else {
              // No session - safe to clear
              if (mounted && !initializedRef.current) {
                setUser(null);
                setLoading(false);
                clearTimeout(timeoutId);
                initializedRef.current = true;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        if (mounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
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
