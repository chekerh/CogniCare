/*
  # Update AI Reports and Game Sessions Schema for Metrics-Based Analysis
  
  ## Overview
  Updates the database schema to match the new metrics-based AI analysis system.
  Ensures all fields needed for progression tracking are available.
  
  ## Changes
  1. Adds missing fields to ai_reports table (if Phase 2 migration wasn't run)
  2. Ensures game_sessions has video_frames field
  3. Adds indexes for better query performance
  4. Ensures compatibility with new metrics-based analysis
*/

-- ============================================
-- UPDATE AI_REPORTS TABLE
-- ============================================

-- Add attention_score if it doesn't exist (from Phase 2 migration)
ALTER TABLE ai_reports 
ADD COLUMN IF NOT EXISTS attention_score numeric(5,2) DEFAULT 0;

-- Add emotion_distribution (new field for metrics-based analysis)
ALTER TABLE ai_reports 
ADD COLUMN IF NOT EXISTS emotion_distribution jsonb DEFAULT '{}';

-- Add gaze_patterns (new field for metrics-based analysis)
ALTER TABLE ai_reports 
ADD COLUMN IF NOT EXISTS gaze_patterns jsonb DEFAULT '{}';

-- Add speech_emotions (new field for metrics-based analysis)
ALTER TABLE ai_reports 
ADD COLUMN IF NOT EXISTS speech_emotions jsonb DEFAULT '{}';

-- Add recommendations as jsonb array (from Phase 2 migration)
ALTER TABLE ai_reports 
ADD COLUMN IF NOT EXISTS recommendations jsonb DEFAULT '[]';

-- Migrate existing data: copy emotion_data to emotion_distribution if exists
-- This ensures backward compatibility
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_reports' AND column_name = 'emotion_data'
  ) THEN
    UPDATE ai_reports 
    SET emotion_distribution = emotion_data 
    WHERE emotion_distribution = '{}'::jsonb 
      AND emotion_data IS NOT NULL 
      AND emotion_data != '{}'::jsonb;
  END IF;
END $$;

-- Migrate existing data: copy gaze_data to gaze_patterns if exists
-- This ensures backward compatibility
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_reports' AND column_name = 'gaze_data'
  ) THEN
    UPDATE ai_reports 
    SET gaze_patterns = gaze_data 
    WHERE gaze_patterns = '{}'::jsonb 
      AND gaze_data IS NOT NULL 
      AND gaze_data != '{}'::jsonb;
  END IF;
END $$;

-- ============================================
-- UPDATE GAME_SESSIONS TABLE
-- ============================================

-- Add video_frames field if it doesn't exist
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS video_frames jsonb DEFAULT '[]';

-- Ensure metrics field can store all our new metrics
-- (metrics is already jsonb, so it can store anything)

-- ============================================
-- ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Index for querying sessions by child and date
CREATE INDEX IF NOT EXISTS idx_game_sessions_child_created 
ON game_sessions(child_id, created_at DESC);

-- Index for querying reports by child
CREATE INDEX IF NOT EXISTS idx_ai_reports_child_created 
ON ai_reports(child_id, created_at DESC);

-- Index for querying reports by engagement score (for analytics)
CREATE INDEX IF NOT EXISTS idx_ai_reports_engagement 
ON ai_reports(child_id, engagement_score DESC);

-- Index for querying sessions by accuracy (for analytics)
CREATE INDEX IF NOT EXISTS idx_game_sessions_accuracy 
ON game_sessions(child_id, accuracy DESC);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN ai_reports.attention_score IS 'Attention score (0-100) calculated from accuracy and consistency';
COMMENT ON COLUMN ai_reports.emotion_distribution IS 'Distribution of detected emotions during the session';
COMMENT ON COLUMN ai_reports.gaze_patterns IS 'Eye tracking and gaze direction patterns';
COMMENT ON COLUMN ai_reports.speech_emotions IS 'Emotions detected from speech/audio analysis';
COMMENT ON COLUMN ai_reports.recommendations IS 'Array of personalized recommendations based on session analysis';
COMMENT ON COLUMN game_sessions.video_frames IS 'Array of video frame analysis data (if camera was enabled)';
COMMENT ON COLUMN game_sessions.metrics IS 'Comprehensive game metrics including moves, reaction_times, avg_reaction_time, completion_time, etc.';

