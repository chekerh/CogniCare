/*
  # Cognicare Phase 2 Database Schema
  
  ## Overview
  Extends the core schema with Phase 2 features:
  - AI behavioral analysis enhancements
  - Private messaging with encryption
  - Community groups
  - Reels/short videos
  - Video consultations
  - Push notifications
  - Enhanced admin features
*/

-- ============================================
-- AI BEHAVIORAL ANALYSIS ENHANCEMENTS
-- ============================================

-- Add columns to game_sessions for AI tracking
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS video_frames jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS audio_chunks jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS engagement_metrics jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reaction_times jsonb DEFAULT '[]';

-- Add columns to ai_reports for enhanced analysis
ALTER TABLE ai_reports
ADD COLUMN IF NOT EXISTS attention_score numeric(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS emotion_distribution jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gaze_patterns jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS speech_emotions jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recommendations jsonb DEFAULT '[]';

-- Create report_shares table for sharing AI reports
CREATE TABLE IF NOT EXISTS report_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES ai_reports(id) ON DELETE CASCADE,
  shared_with uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  can_download boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(report_id, shared_with)
);

-- ============================================
-- PRIVATE MESSAGING SYSTEM (E2E ENCRYPTED)
-- ============================================

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant2_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  last_message_preview text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(participant1_id, participant2_id),
  CHECK (participant1_id != participant2_id)
);

-- Enhance messages table for encryption
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS encrypted_content text,
ADD COLUMN IF NOT EXISTS encryption_key_id text,
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- Create user_keys table for E2E encryption
CREATE TABLE IF NOT EXISTS user_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  public_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create typing_indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- ============================================
-- COMMUNITY GROUPS
-- ============================================

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_image_url text,
  avatar_url text,
  is_public boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
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
  is_pinned boolean DEFAULT false,
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_comments table
CREATE TABLE IF NOT EXISTS group_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_reactions table
CREATE TABLE IF NOT EXISTS group_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('heart', 'support', 'helpful', 'inspire', 'like')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, type)
);

-- ============================================
-- REELS / SHORT VIDEOS
-- ============================================

-- Create reels table
CREATE TABLE IF NOT EXISTS reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  poster_frame_url text,
  caption text,
  duration_seconds integer,
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'groups', 'private')),
  group_id uuid REFERENCES groups(id) ON DELETE SET NULL,
  view_count integer DEFAULT 0,
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reel_comments table
CREATE TABLE IF NOT EXISTS reel_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id uuid NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reel_reactions table
CREATE TABLE IF NOT EXISTS reel_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id uuid NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'heart', 'save')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(reel_id, user_id, type)
);

-- Create reel_views table for tracking views
CREATE TABLE IF NOT EXISTS reel_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id uuid NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(reel_id, user_id)
);

-- ============================================
-- VIDEO CONSULTATIONS
-- ============================================

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mother_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  meeting_url text,
  meeting_id text,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create availability table for specialists
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PUSH NOTIFICATIONS
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'message', 'group_post', 'reel_comment', 'reel_reaction',
    'consultation_reminder', 'consultation_confirmed', 'ai_report_ready',
    'group_invite', 'specialist_approved', 'content_flagged'
  )),
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  push_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  message_notifications boolean DEFAULT true,
  group_notifications boolean DEFAULT true,
  consultation_notifications boolean DEFAULT true,
  ai_report_notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- ENHANCED ADMIN FEATURES
-- ============================================

-- Add columns to users for admin management
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS suspended_until timestamptz,
ADD COLUMN IF NOT EXISTS suspension_reason text;

-- Create content_flags table for moderation queue
CREATE TABLE IF NOT EXISTS content_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flagged_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('post', 'comment', 'reel', 'group_post')),
  content_id uuid NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create analytics_aggregates table for anonymized metrics
CREATE TABLE IF NOT EXISTS analytics_aggregates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, metric_type)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group ON group_posts(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_author ON reels(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_visibility ON reels(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_specialist ON consultations(specialist_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_consultations_mother ON consultations(mother_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_flags_status ON content_flags(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_child ON game_sessions(child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_child ON ai_reports(child_id, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE report_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_aggregates ENABLE ROW LEVEL SECURITY;

-- Report shares policies
CREATE POLICY "Users can view shared reports"
  ON report_shares FOR SELECT
  TO authenticated
  USING (shared_with = auth.uid() OR shared_by = auth.uid());

CREATE POLICY "Mothers can share reports"
  ON report_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_reports ar
      JOIN children c ON c.id = ar.child_id
      WHERE ar.id = report_id AND c.mother_id = auth.uid()
    )
    AND shared_by = auth.uid()
  );

-- Conversations policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- Messages policies (enhanced)
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
  );

-- User keys policies
CREATE POLICY "Users can view own public key"
  ON user_keys FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR true); -- Public keys are public

CREATE POLICY "Users can manage own keys"
  ON user_keys FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Groups policies
CREATE POLICY "Anyone can view public groups"
  ON groups FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Group members can view private groups"
  ON groups FOR SELECT
  TO authenticated
  USING (
    is_public = true OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM group_members WHERE group_id = groups.id AND user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Group members policies
CREATE POLICY "Group members can view members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM groups WHERE id = group_id AND is_public = true) OR
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
  );

CREATE POLICY "Users can join public groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM groups WHERE id = group_id AND is_public = true)
  );

-- Group posts policies
CREATE POLICY "Group members can view posts"
  ON group_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = auth.uid()
      WHERE g.id = group_posts.group_id
      AND (g.is_public = true OR gm.user_id IS NOT NULL)
    )
  );

CREATE POLICY "Group members can create posts"
  ON group_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid())
  );

-- Reels policies
CREATE POLICY "Users can view public reels"
  ON reels FOR SELECT
  TO authenticated
  USING (visibility = 'public' OR author_id = auth.uid());

CREATE POLICY "Group members can view group reels"
  ON reels FOR SELECT
  TO authenticated
  USING (
    visibility = 'public' OR
    author_id = auth.uid() OR
    (visibility = 'groups' AND EXISTS (
      SELECT 1 FROM group_members WHERE group_id = reels.group_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create reels"
  ON reels FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Consultations policies
CREATE POLICY "Participants can view consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (specialist_id = auth.uid() OR mother_id = auth.uid());

CREATE POLICY "Mothers can create consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (mother_id = auth.uid());

CREATE POLICY "Specialists can update consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (specialist_id = auth.uid())
  WITH CHECK (specialist_id = auth.uid());

-- Availability policies
CREATE POLICY "Anyone can view specialist availability"
  ON availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Specialists can manage own availability"
  ON availability FOR ALL
  TO authenticated
  USING (specialist_id = auth.uid())
  WITH CHECK (specialist_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Notification preferences policies
CREATE POLICY "Users can manage own preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Content flags policies
CREATE POLICY "Users can flag content"
  ON content_flags FOR INSERT
  TO authenticated
  WITH CHECK (flagged_by = auth.uid());

CREATE POLICY "Admins can view all flags"
  ON content_flags FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update flags"
  ON content_flags FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Analytics aggregates policies (admin only)
CREATE POLICY "Admins can view analytics"
  ON analytics_aggregates FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

