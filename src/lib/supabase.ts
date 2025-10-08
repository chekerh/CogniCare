import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'mother' | 'specialist' | 'volunteer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  language_preference: 'ar' | 'fr' | 'en';
  is_verified: boolean;
  verification_documents: string | null;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  mother_id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  diagnosis: string[];
  education_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  media_urls: string[];
  tags: string[];
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  type: 'heart' | 'support' | 'helpful' | 'inspire';
  created_at: string;
}

export interface Specialist {
  id: string;
  user_id: string;
  credentials: string;
  specialty: string[];
  languages_spoken: string[];
  availability: string | null;
  verified_at: string | null;
}

export interface GameSession {
  id: string;
  child_id: string;
  game_type: string;
  duration_seconds: number;
  score: number;
  accuracy: number;
  metrics: Record<string, any>;
  camera_enabled: boolean;
  created_at: string;
}

export interface AIReport {
  id: string;
  session_id: string;
  child_id: string;
  engagement_score: number;
  emotion_data: Record<string, any>;
  gaze_data: Record<string, any>;
  insights: string | null;
  shared_with: string[];
  created_at: string;
}
