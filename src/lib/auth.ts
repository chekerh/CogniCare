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
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) throw error;
  return user;
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
