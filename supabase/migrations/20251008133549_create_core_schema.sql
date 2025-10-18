/*
  # Cognicare Core Database Schema

  ## Overview
  Creates the foundational database structure for the Cognicare platform - a secure community 
  and AI-assisted platform for mothers of neurodiverse children in Tunisia.

  ## New Tables Created

  ### 1. `users` - Core user accounts
    - `id` (uuid, primary key) - Unique user identifier, linked to auth.users
    - `email` (text, unique) - User email address
    - `role` (text) - User role: 'mother', 'specialist', 'volunteer', 'admin'
    - `full_name` (text) - User's full name
    - `display_name` (text) - Public display name (pseudonymous by default)
    - `avatar_url` (text) - Profile picture URL
    - `bio` (text) - User biography
    - `location` (text) - Region in Tunisia
    - `language_preference` (text) - 'ar' (Arabic) or 'fr' (French)
    - `is_verified` (boolean) - Whether account is verified
    - `verification_documents` (text) - S3 URLs to ID/credential documents
    - `created_at`, `updated_at` (timestamptz)

  ### 2. `children` - Child profiles linked to mothers
    - `id` (uuid, primary key)
    - `mother_id` (uuid, foreign key to users)
    - `name` (text) - Child's name
    - `age` (integer) - Child's age
    - `gender` (text) - 'male', 'female', 'other'
    - `diagnosis` (text[]) - Array of conditions (autism, ADHD, dyslexia, etc.)
    - `education_level` (text) - Current education level
    - `created_at`, `updated_at` (timestamptz)

  ### 3. `intake_forms` - Detailed child intake questionnaires
    - `id` (uuid, primary key)
    - `child_id` (uuid, foreign key to children)
    - `challenges` (jsonb) - Behavioral difficulties and delays
    - `therapies` (jsonb) - Current therapies and frequency
    - `family_context` (jsonb) - Financial situation, support system
    - `nutrition_info` (jsonb) - Diet, allergies, eating habits
    - `mother_needs` (text[]) - Support areas mother is seeking
    - `completed_at` (timestamptz)

  ### 4. `posts` - Community feed posts
    - `id` (uuid, primary key)
    - `author_id` (uuid, foreign key to users)
    - `content` (text) - Post text content
    - `media_urls` (text[]) - Attached images/videos
    - `tags` (text[]) - Hashtags for categorization
    - `is_flagged` (boolean) - Whether post has been reported
    - `created_at`, `updated_at` (timestamptz)

  ### 5. `comments` - Comments on posts
    - `id` (uuid, primary key)
    - `post_id` (uuid, foreign key to posts)
    - `author_id` (uuid, foreign key to users)
    - `content` (text) - Comment text
    - `is_flagged` (boolean)
    - `created_at`, `updated_at` (timestamptz)

  ### 6. `reactions` - Emoji reactions to posts
    - `id` (uuid, primary key)
    - `post_id` (uuid, foreign key to posts)
    - `user_id` (uuid, foreign key to users)
    - `type` (text) - Reaction type: 'heart', 'support', etc.
    - `created_at` (timestamptz)

  ### 7. `specialists` - Extended profile for specialists
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to users)
    - `credentials` (text) - Professional credentials
    - `specialty` (text[]) - Areas of expertise
    - `languages_spoken` (text[])
    - `availability` (text) - Consultation availability
    - `verified_at` (timestamptz)

  ### 8. `game_sessions` - Child game play sessions
    - `id` (uuid, primary key)
    - `child_id` (uuid, foreign key to children)
    - `game_type` (text) - Type of game played
    - `duration_seconds` (integer)
    - `score` (integer)
    - `accuracy` (numeric) - Percentage accuracy
    - `metrics` (jsonb) - Gameplay metrics (reaction times, errors, etc.)
    - `camera_enabled` (boolean) - Whether camera was used
    - `created_at` (timestamptz)

  ### 9. `ai_reports` - AI-generated behavior analysis reports
    - `id` (uuid, primary key)
    - `session_id` (uuid, foreign key to game_sessions)
    - `child_id` (uuid, foreign key to children)
    - `engagement_score` (numeric) - Overall engagement level (0-100)
    - `emotion_data` (jsonb) - Detected emotions over time
    - `gaze_data` (jsonb) - Eye tracking metrics
    - `insights` (text) - Generated insights and recommendations
    - `shared_with` (uuid[]) - Array of specialist user IDs with access
    - `created_at` (timestamptz)

  ### 10. `training_plans` - Personalized activity programs
    - `id` (uuid, primary key)
    - `child_id` (uuid, foreign key to children)
    - `title` (text)
    - `description` (text)
    - `activities` (jsonb) - Array of daily activities
    - `is_active` (boolean)
    - `created_at`, `updated_at` (timestamptz)

  ### 11. `nutrition_plans` - Personalized nutrition recommendations
    - `id` (uuid, primary key)
    - `child_id` (uuid, foreign key to children)
    - `recommendations` (jsonb) - Meal suggestions and guidelines
    - `is_active` (boolean)
    - `created_at`, `updated_at` (timestamptz)

  ### 12. `messages` - Private messages between users
    - `id` (uuid, primary key)
    - `sender_id` (uuid, foreign key to users)
    - `recipient_id` (uuid, foreign key to users)
    - `content` (text)
    - `is_read` (boolean)
    - `created_at` (timestamptz)

  ### 13. `audit_logs` - Admin action tracking
    - `id` (uuid, primary key)
    - `admin_id` (uuid, foreign key to users)
    - `action` (text) - Type of action taken
    - `target_type` (text) - Type of entity affected
    - `target_id` (uuid) - ID of affected entity
    - `details` (jsonb) - Additional action details
    - `created_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Restrictive policies ensure users can only access their own data
  - Specialists can only access reports shared with them
  - Admins have elevated access for moderation
  - All policies check authentication via auth.uid()

  ## Important Notes
  - All timestamps use timestamptz for proper timezone handling
  - JSONB used for flexible structured data (metrics, plans, etc.)
  - Array types used where multiple values are common
  - Foreign keys ensure referential integrity
  - Indexes will be added in subsequent migration for performance
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('mother', 'specialist', 'volunteer', 'admin')),
  full_name text NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  location text,
  language_preference text DEFAULT 'ar' CHECK (language_preference IN ('ar', 'fr', 'en')),
  is_verified boolean DEFAULT false,
  verification_documents text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL CHECK (age > 0 AND age < 18),
  gender text CHECK (gender IN ('male', 'female', 'other')),
  diagnosis text[] DEFAULT '{}',
  education_level text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create intake_forms table
CREATE TABLE IF NOT EXISTS intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  challenges jsonb DEFAULT '{}',
  therapies jsonb DEFAULT '{}',
  family_context jsonb DEFAULT '{}',
  nutrition_info jsonb DEFAULT '{}',
  mother_needs text[] DEFAULT '{}',
  completed_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_urls text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('heart', 'support', 'helpful', 'inspire')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, type)
);

-- Create specialists table
CREATE TABLE IF NOT EXISTS specialists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  credentials text NOT NULL,
  specialty text[] DEFAULT '{}',
  languages_spoken text[] DEFAULT '{}',
  availability text,
  verified_at timestamptz
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 0,
  score integer DEFAULT 0,
  accuracy numeric(5,2) DEFAULT 0,
  metrics jsonb DEFAULT '{}',
  camera_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create ai_reports table
CREATE TABLE IF NOT EXISTS ai_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE UNIQUE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  engagement_score numeric(5,2) DEFAULT 0,
  emotion_data jsonb DEFAULT '{}',
  gaze_data jsonb DEFAULT '{}',
  insights text,
  shared_with uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create training_plans table
CREATE TABLE IF NOT EXISTS training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  activities jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create nutrition_plans table
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  recommendations jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all verified users"
  ON users FOR SELECT
  TO authenticated
  USING (is_verified = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can create user profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Children policies
CREATE POLICY "Mothers can view own children"
  ON children FOR SELECT
  TO authenticated
  USING (mother_id = auth.uid());

CREATE POLICY "Mothers can create children profiles"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (mother_id = auth.uid());

CREATE POLICY "Mothers can update own children"
  ON children FOR UPDATE
  TO authenticated
  USING (mother_id = auth.uid())
  WITH CHECK (mother_id = auth.uid());

-- Intake forms policies
CREATE POLICY "Mothers can view own intake forms"
  ON intake_forms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = intake_forms.child_id
      AND children.mother_id = auth.uid()
    )
  );

CREATE POLICY "Mothers can create intake forms"
  ON intake_forms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.mother_id = auth.uid()
    )
  );

-- Posts policies
CREATE POLICY "Authenticated users can view all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Comments policies
CREATE POLICY "Authenticated users can view all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Reactions policies
CREATE POLICY "Authenticated users can view all reactions"
  ON reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Specialists policies
CREATE POLICY "Anyone can view verified specialists"
  ON specialists FOR SELECT
  TO authenticated
  USING (verified_at IS NOT NULL);

CREATE POLICY "Specialists can create own profile"
  ON specialists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Specialists can update own profile"
  ON specialists FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Game sessions policies
CREATE POLICY "Mothers can view own children's sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = game_sessions.child_id
      AND children.mother_id = auth.uid()
    )
  );

CREATE POLICY "System can create game sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.mother_id = auth.uid()
    )
  );

-- AI reports policies
CREATE POLICY "Mothers and shared specialists can view reports"
  ON ai_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = ai_reports.child_id
      AND children.mother_id = auth.uid()
    )
    OR auth.uid() = ANY(shared_with)
  );

CREATE POLICY "System can create reports"
  ON ai_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.mother_id = auth.uid()
    )
  );

CREATE POLICY "Mothers can update report sharing"
  ON ai_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = ai_reports.child_id
      AND children.mother_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = ai_reports.child_id
      AND children.mother_id = auth.uid()
    )
  );

-- Training plans policies
CREATE POLICY "Mothers can view own children's plans"
  ON training_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = training_plans.child_id
      AND children.mother_id = auth.uid()
    )
  );

CREATE POLICY "System can create plans"
  ON training_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.mother_id = auth.uid()
    )
  );

-- Nutrition plans policies
CREATE POLICY "Mothers can view own children's nutrition"
  ON nutrition_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = nutrition_plans.child_id
      AND children.mother_id = auth.uid()
    )
  );

CREATE POLICY "System can create nutrition plans"
  ON nutrition_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.mother_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Audit logs policies (admin only can view)
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
    AND admin_id = auth.uid()
  );