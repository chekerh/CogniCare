import { supabase, User, UserRole } from './supabase';

export async function signUp(
  email: string,
  password: string,
  userData: {
    full_name: string;
    role: UserRole;
    display_name?: string;
    location?: string;
    language_preference?: 'ar' | 'fr' | 'en';
  }
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user returned from signup');

  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    email,
    role: userData.role,
    full_name: userData.full_name,
    display_name: userData.display_name || userData.full_name.split(' ')[0],
    location: userData.location || '',
    language_preference: userData.language_preference || 'ar',
    is_verified: false,
  });

  if (profileError) throw profileError;

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Use getSession instead of getUser for faster response (cached)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return null;
    }

    if (!session?.user) return null;

    // Fetch user profile with optimized query
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      // If it's a "not found" error, that's okay - user might not have profile yet
      if (error.code === 'PGRST116') {
        console.warn('User profile not found in database:', session.user.id);
        return null;
      }
      console.error('Error fetching user profile:', error);
      // Don't throw, return null to allow retry
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      try {
        // Add retry logic for user profile fetch
        let user = null;
        let retries = 3;
        while (!user && retries > 0) {
        try {
            user = await getCurrentUser();
            if (!user) {
              await new Promise(resolve => setTimeout(resolve, 500));
              retries--;
            }
          } catch (error) {
            console.error('Error fetching user, retrying...', error);
            await new Promise(resolve => setTimeout(resolve, 500));
            retries--;
          }
        }
          callback(user);
        } catch (error) {
          console.error('Error fetching user:', error);
          callback(null);
        }
    } else if (event === 'SIGNED_OUT') {
      callback(null);
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      // Also handle token refresh
      try {
        const user = await getCurrentUser();
        callback(user);
      } catch (error) {
        console.error('Error fetching user on token refresh:', error);
      }
    }
  });
}
