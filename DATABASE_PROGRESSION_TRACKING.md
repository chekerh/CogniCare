# Database Schema for Child Progression Tracking

## Overview

This document explains how the database schema supports tracking child progression through game sessions and AI analysis.

## Key Tables

### 1. `game_sessions` Table

Stores each game session a child plays.

**Essential Fields:**
- `child_id` - Links to the child
- `game_type` - Type of game (e.g., 'memory_match')
- `duration_seconds` - How long the game took
- `score` - Final score achieved
- `accuracy` - Percentage of correct moves (0-100)
- `metrics` (jsonb) - Comprehensive metrics including:
  ```json
  {
    "moves": 8,
    "pairs": 4,
    "reaction_times": [1200, 1500, 1100, ...],
    "avg_reaction_time": 1350,
    "completion_time": 120,
    "engagement_score": 75.5,
    "attention_score": 80.2
  }
  ```
- `video_frames` (jsonb) - Optional camera data
- `camera_enabled` (boolean) - Whether camera was used
- `created_at` - Timestamp of the session

### 2. `ai_reports` Table

Stores AI analysis results for each game session.

**Essential Fields:**
- `session_id` - Links to the game session
- `child_id` - Links to the child
- `engagement_score` (0-100) - Overall engagement level
- `attention_score` (0-100) - Attention and focus level
- `emotion_distribution` (jsonb) - Distribution of emotions detected
- `gaze_patterns` (jsonb) - Eye tracking patterns (if camera used)
- `speech_emotions` (jsonb) - Emotions from speech (if microphone used)
- `insights` (text) - Generated insights about the session
- `recommendations` (jsonb array) - Personalized recommendations
- `created_at` - Timestamp of the report

## How Progression is Measured

### Metrics Calculated During Game Play

1. **Accuracy**: `(correct pairs / total moves) × 100`
2. **Reaction Time**: Time between card flips (milliseconds)
3. **Average Reaction Time**: Mean of all reaction times
4. **Errors**: Number of incorrect matches
5. **Completion Time**: Total duration of the game

### AI Analysis (Metrics-Based)

The system uses `calculateFallbackMetrics()` to compute:

1. **Engagement Score** (0-100):
   - Formula: `(accuracy × 0.35) + (reaction_time_score × 0.25) + (completion_time_score × 0.20) + (error_rate_score × 0.20)`
   - Higher = more engaged

2. **Attention Score** (0-100):
   - Formula: `(accuracy × 0.7) + (consistency_score × 30)`
   - Consistency = low variance in reaction times
   - Higher = better focus

3. **Insights**: Textual observations based on performance
4. **Recommendations**: Actionable suggestions for improvement

## Progression Tracking Queries

### Get All Sessions for a Child
```sql
SELECT * FROM game_sessions 
WHERE child_id = 'child-uuid' 
ORDER BY created_at DESC;
```

### Get Average Metrics
```sql
SELECT 
  AVG(accuracy) as avg_accuracy,
  AVG(duration_seconds) as avg_duration,
  AVG(score) as avg_score
FROM game_sessions 
WHERE child_id = 'child-uuid';
```

### Get AI Reports with Engagement
```sql
SELECT 
  ar.engagement_score,
  ar.attention_score,
  ar.insights,
  ar.recommendations,
  gs.accuracy,
  gs.score
FROM ai_reports ar
JOIN game_sessions gs ON ar.session_id = gs.id
WHERE ar.child_id = 'child-uuid'
ORDER BY ar.created_at DESC;
```

### Get Reaction Times from Metrics
```sql
SELECT 
  id,
  created_at,
  metrics->>'reaction_times' as reaction_times,
  metrics->>'avg_reaction_time' as avg_reaction_time
FROM game_sessions
WHERE child_id = 'child-uuid'
  AND metrics->>'reaction_times' IS NOT NULL;
```

### Calculate Trends (Last 3 vs Previous 3)
```sql
WITH recent_sessions AS (
  SELECT accuracy 
  FROM game_sessions 
  WHERE child_id = 'child-uuid'
  ORDER BY created_at DESC 
  LIMIT 3
),
previous_sessions AS (
  SELECT accuracy 
  FROM game_sessions 
  WHERE child_id = 'child-uuid'
  ORDER BY created_at DESC 
  OFFSET 3 LIMIT 3
)
SELECT 
  AVG((SELECT accuracy FROM recent_sessions)) as recent_avg,
  AVG((SELECT accuracy FROM previous_sessions)) as previous_avg,
  AVG((SELECT accuracy FROM recent_sessions)) - 
  AVG((SELECT accuracy FROM previous_sessions)) as trend
```

## Required Migrations

To ensure all fields exist, run these migrations in order:

1. `20251008133549_create_core_schema.sql` - Creates base tables
2. `20250102000000_phase2_schema.sql` - Adds Phase 2 features
3. `20250115000000_update_ai_reports_schema.sql` - **Ensures all progression fields exist**

## Indexes for Performance

The migration creates indexes for fast queries:

- `idx_game_sessions_child_created` - Fast session lookups by child
- `idx_ai_reports_child_created` - Fast report lookups by child
- `idx_ai_reports_engagement` - Fast engagement-based queries
- `idx_game_sessions_accuracy` - Fast accuracy-based queries

## Data Flow

```
Child Plays Game
    ↓
Game Tracks Metrics (moves, reaction times, errors)
    ↓
Game Completes → saveGameSession()
    ↓
Calculate Metrics:
  - accuracy
  - avg_reaction_time
  - engagement_score
  - attention_score
    ↓
Save to game_sessions:
  - metrics: { reaction_times, avg_reaction_time, ... }
  - accuracy, score, duration_seconds
    ↓
Save to ai_reports:
  - engagement_score
  - attention_score
  - insights
  - recommendations
    ↓
Mother Views Dashboard:
  - Loads all sessions for child
  - Loads all reports for child
  - Calculates averages and trends
  - Displays charts and statistics
```

## Troubleshooting

### If statistics don't show:

1. **Check if migrations ran:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'ai_reports' 
   AND column_name IN ('attention_score', 'recommendations');
   ```

2. **Check if data exists:**
   ```sql
   SELECT COUNT(*) FROM game_sessions WHERE child_id = 'your-child-id';
   SELECT COUNT(*) FROM ai_reports WHERE child_id = 'your-child-id';
   ```

3. **Verify metrics field structure:**
   ```sql
   SELECT metrics FROM game_sessions LIMIT 1;
   ```
   Should show: `{"reaction_times": [...], "avg_reaction_time": 1234, ...}`

### If AI reports aren't created:

1. Check browser console for errors
2. Verify `ai_reports` table has all required columns
3. Check that `game_sessions` insert succeeded before `ai_reports` insert

