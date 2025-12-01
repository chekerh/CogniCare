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
  attention_score: number;
  emotion_distribution: Record<string, any>;
  gaze_patterns: Record<string, any>;
  speech_emotions: Record<string, any>;
  recommendations: any[];
  created_at: string;
}

export interface ReportShare {
  id: string;
  report_id: string;
  shared_with: string;
  shared_by: string;
  can_download: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  conversation_id: string | null;
  content: string;
  encrypted_content: string | null;
  encryption_key_id: string | null;
  message_type: 'text' | 'image' | 'file' | 'system';
  media_url: string | null;
  is_read: boolean;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
}

export interface UserKey {
  id: string;
  user_id: string;
  public_key: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'member' | 'admin' | 'moderator';
  joined_at: string;
}

export interface GroupPost {
  id: string;
  group_id: string;
  author_id: string;
  content: string;
  media_urls: string[];
  tags: string[];
  is_pinned: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reel {
  id: string;
  author_id: string;
  video_url: string;
  poster_frame_url: string | null;
  caption: string | null;
  duration_seconds: number | null;
  visibility: 'public' | 'groups' | 'private';
  group_id: string | null;
  view_count: number;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  specialist_id: string;
  mother_id: string;
  child_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  meeting_url: string | null;
  meeting_id: string | null;
  notes: string | null;
  rating: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  specialist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'group_post' | 'reel_comment' | 'reel_reaction' | 'consultation_reminder' | 'consultation_confirmed' | 'ai_report_ready' | 'group_invite' | 'specialist_approved' | 'content_flagged';
  title: string;
  body: string;
  data: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  message_notifications: boolean;
  group_notifications: boolean;
  consultation_notifications: boolean;
  ai_report_notifications: boolean;
  created_at: string;
  updated_at: string;
}
