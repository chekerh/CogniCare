/*
  # Extended Features Schema for Cognicare

  ## New Tables & Features

  ### 1. `groups` - Community Groups
    - Group creation and management
    - Members can join groups based on interests
    - Support for ADHD, Autism, Dyslexia, etc.

  ### 2. `group_members` - Group Membership
    - Track which users belong to which groups
    - Membership status and roles

  ### 3. `group_posts` - Posts within Groups
    - Similar to regular posts but scoped to groups
    - Enhanced privacy within communities

  ### 4. `reels` - Short Video Content
    - Video sharing feature (like Instagram Reels)
    - Milestone celebrations
    - Educational content

  ### 5. `notifications` - Push Notifications
    - Messages, comments, reports
    - Real-time updates

  ### 6. `consultations` - Video Consultation Scheduling
    - Booking system for specialist consultations
    - Status tracking

  ### 7. `resources` - Educational Resources
    - Articles, videos, expert advice
    - Categorized by condition

  ### 8. Enhanced Columns
    - Add `game_pin` to users table
    - Add `preferred_language` to children table
    - Add `notification_preferences` to users

  ## Security
  - RLS policies for all new tables
  - Group privacy controls
  - Secure messaging
*/

-- Add new columns to existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'game_pin'
  ) THEN
    ALTER TABLE users ADD COLUMN game_pin text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE users ADD COLUMN notification_preferences jsonb DEFAULT '{"messages": true, "comments": true, "reports": true}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE children ADD COLUMN preferred_language text DEFAULT 'ar' CHECK (preferred_language IN ('ar', 'fr', 'en'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'progress_data'
  ) THEN
    ALTER TABLE children ADD COLUMN progress_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text CHECK (category IN ('autism', 'adhd', 'dyslexia', 'down_syndrome', 'general')),
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private boolean DEFAULT false,
  member_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_posts table
CREATE TABLE IF NOT EXISTS group_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_urls text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reels table
CREATE TABLE IF NOT EXISTS reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create reel_likes table
CREATE TABLE IF NOT EXISTS reel_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id uuid NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reel_id, user_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('message', 'comment', 'report', 'consultation', 'group_invite', 'system')),
  title text NOT NULL,
  content text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialist_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  meeting_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text,
  type text CHECK (type IN ('article', 'video', 'pdf', 'link')),
  category text[] DEFAULT '{}',
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  url text,
  thumbnail_url text,
  is_featured boolean DEFAULT false,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Users can view public groups or groups they are members of"
  ON groups FOR SELECT
  TO authenticated
  USING (
    is_private = false OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Group admins can update groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

-- Group members policies
CREATE POLICY "Users can view group members if they are members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND (
        groups.is_private = false OR
        EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = groups.id
          AND gm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can join public groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_id
      AND groups.is_private = false
    )
  );

-- Group posts policies
CREATE POLICY "Group members can view group posts"
  ON group_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_posts.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create posts"
  ON group_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Reels policies
CREATE POLICY "Users can view public reels"
  ON reels FOR SELECT
  TO authenticated
  USING (is_public = true OR author_id = auth.uid());

CREATE POLICY "Users can create own reels"
  ON reels FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own reels"
  ON reels FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Reel likes policies
CREATE POLICY "Users can view reel likes"
  ON reel_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like reels"
  ON reel_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike reels"
  ON reel_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Consultations policies
CREATE POLICY "Mothers and specialists can view their consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (mother_id = auth.uid() OR specialist_id = auth.uid());

CREATE POLICY "Mothers can create consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (mother_id = auth.uid());

CREATE POLICY "Participants can update consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (mother_id = auth.uid() OR specialist_id = auth.uid())
  WITH CHECK (mother_id = auth.uid() OR specialist_id = auth.uid());

-- Resources policies
CREATE POLICY "Authenticated users can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and specialists can create resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'specialist')
    )
    AND (author_id = auth.uid() OR author_id IS NULL)
  );