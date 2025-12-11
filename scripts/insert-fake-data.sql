-- ============================================
-- Insert Fake Data for Visualization
-- User: chekerh2002@mail.com
-- Child: farouk
-- ============================================

-- Step 1: Get user and child IDs
DO $$
DECLARE
  v_user_id uuid;
  v_child_id uuid;
  v_session_id uuid;
  v_created_at timestamptz;
  v_accuracy numeric;
  v_score integer;
  v_duration integer;
  v_moves numeric;
  v_engagement_score numeric;
  v_attention_score numeric;
  v_avg_reaction_time numeric;
  i integer;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id 
  FROM users 
  WHERE email = 'chekerh2002@mail.com' OR email = 'chekerh2002@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found. Please check the email address.';
  END IF;
  
  -- Get child ID
  SELECT id INTO v_child_id 
  FROM children 
  WHERE mother_id = v_user_id 
  AND LOWER(name) LIKE '%farouk%';
  
  IF v_child_id IS NULL THEN
    RAISE EXCEPTION 'Child "farouk" not found for this user.';
  END IF;
  
  RAISE NOTICE 'Found user: %', v_user_id;
  RAISE NOTICE 'Found child: %', v_child_id;
  
  -- Step 2: Insert 10 game sessions with progressive improvement
  FOR i IN 1..10 LOOP
    -- Calculate dates (sessions spread over last 2 weeks)
    v_created_at := NOW() - (INTERVAL '1 day' * (10 - i));
    
    -- Progressive improvement: accuracy and scores improve over time
    v_accuracy := 50 + (i * 4) + (RANDOM() * 5); -- 54% to 95%
    v_score := 60 + (i * 3) + (RANDOM() * 10); -- 63 to 100
    v_duration := 180 - (i * 8) + (RANDOM() * 20); -- 180s to 100s (faster over time)
    v_moves := 12 - (i * 0.5) + (RANDOM() * 2); -- 12 to 7 moves (fewer moves = better)
    v_moves := ROUND(v_moves); -- Round to integer
    v_avg_reaction_time := 2000 - (i * 150) + (RANDOM() * 200); -- 2000ms to 500ms (faster)
    
    -- Calculate engagement and attention scores based on metrics
    v_engagement_score := (v_accuracy * 0.35) + ((2000 - v_avg_reaction_time) / 20 * 0.25) + ((180 - v_duration) / 1.8 * 0.20) + ((12 - v_moves) * 5 * 0.20);
    v_engagement_score := LEAST(100, GREATEST(0, v_engagement_score));
    
    v_attention_score := (v_accuracy * 0.7) + (30 * (1 - (v_avg_reaction_time / 2000)));
    v_attention_score := LEAST(100, GREATEST(0, v_attention_score));
    
    -- Generate reaction times array
    DECLARE
      reaction_times_array jsonb := '[]'::jsonb;
      j integer;
      rt numeric;
    BEGIN
      FOR j IN 1..v_moves::integer LOOP
        rt := v_avg_reaction_time + (RANDOM() * 500 - 250); -- Variation around average
        reaction_times_array := reaction_times_array || jsonb_build_array(rt);
      END LOOP;
      
      -- Insert game session
      INSERT INTO game_sessions (
        child_id,
        game_type,
        duration_seconds,
        score,
        accuracy,
        metrics,
        camera_enabled,
        video_frames,
        created_at
      ) VALUES (
        v_child_id,
        'memory_match',
        v_duration,
        v_score,
        v_accuracy,
        jsonb_build_object(
          'moves', v_moves,
          'pairs', 6,
          'reaction_times', reaction_times_array,
          'avg_reaction_time', v_avg_reaction_time,
          'completion_time', v_duration,
          'errors', GREATEST(0, v_moves - 6),
          'engagement_score', v_engagement_score,
          'attention_score', v_attention_score
        ),
        false,
        '[]'::jsonb,
        v_created_at
      ) RETURNING id INTO v_session_id;
      
      -- Generate emotion distribution (more positive emotions as performance improves)
      DECLARE
        happy_val numeric := 20 + (i * 5) + (RANDOM() * 10);
        focused_val numeric := 15 + (i * 4) + (RANDOM() * 8);
        neutral_val numeric := 30 - (i * 2) + (RANDOM() * 5);
        sad_val numeric := GREATEST(0, 20 - (i * 2) + (RANDOM() * 5));
        total numeric;
      BEGIN
        total := happy_val + focused_val + neutral_val + sad_val;
        happy_val := (happy_val / total) * 100;
        focused_val := (focused_val / total) * 100;
        neutral_val := (neutral_val / total) * 100;
        sad_val := (sad_val / total) * 100;
        
        -- Generate insights based on performance
        DECLARE
          insights_text text;
          recommendations_array jsonb;
        BEGIN
          IF v_accuracy >= 85 THEN
            insights_text := 'أداء ممتاز! الطفل أظهر تحسناً ملحوظاً في التركيز والدقة.';
            recommendations_array := jsonb_build_array(
              'استمر في الممارسة للحفاظ على التقدم',
              'جرب ألعاب أكثر صعوبة لمواصلة التحدي',
              'احتفل بالإنجازات لتعزيز الدافعية'
            );
          ELSIF v_accuracy >= 70 THEN
            insights_text := 'أداء جيد. هناك تحسن مستمر في المهارات.';
            recommendations_array := jsonb_build_array(
              'استمر في الممارسة المنتظمة',
              'ركز على تحسين سرعة رد الفعل',
              'خذ فترات راحة قصيرة بين الجلسات'
            );
          ELSE
            insights_text := 'أداء مقبول مع إمكانية للتحسين.';
            recommendations_array := jsonb_build_array(
              'تدريب إضافي على التركيز والدقة',
              'تمارين لتحسين سرعة رد الفعل',
              'تأكد من أن الطفل مرتاح ومستعد للعب'
            );
          END IF;
          
          -- Insert AI report
          INSERT INTO ai_reports (
            session_id,
            child_id,
            engagement_score,
            attention_score,
            emotion_distribution,
            gaze_patterns,
            speech_emotions,
            insights,
            recommendations,
            created_at
          ) VALUES (
            v_session_id,
            v_child_id,
            v_engagement_score,
            v_attention_score,
            jsonb_build_object(
              'happy', ROUND(happy_val, 2),
              'focused', ROUND(focused_val, 2),
              'neutral', ROUND(neutral_val, 2),
              'sad', ROUND(sad_val, 2)
            ),
            jsonb_build_object(
              'avg_focus_duration', 3.5 + (i * 0.2),
              'focus_consistency', 70 + (i * 2)
            ),
            jsonb_build_object(
              'calm', 40 + (i * 3),
              'excited', 30 + (i * 2),
              'neutral', 30 - (i * 2)
            ),
            insights_text,
            recommendations_array,
            v_created_at
          );
        END;
      END;
    END;
    
    RAISE NOTICE 'Inserted session % with accuracy: %', i, ROUND(v_accuracy, 1);
    RAISE NOTICE '  Engagement: %, Attention: %', ROUND(v_engagement_score, 1), ROUND(v_attention_score, 1);
  END LOOP;
  
  RAISE NOTICE 'Successfully inserted 10 game sessions and AI reports for child: %', v_child_id::text;
END $$;

-- Verify the data was inserted
SELECT 
  gs.id,
  gs.created_at,
  gs.accuracy,
  gs.score,
  gs.duration_seconds,
  gs.metrics->>'moves' as moves,
  gs.metrics->>'avg_reaction_time' as avg_reaction_time,
  ar.engagement_score,
  ar.attention_score,
  ar.insights
FROM game_sessions gs
JOIN ai_reports ar ON ar.session_id = gs.id
JOIN children c ON gs.child_id = c.id
JOIN users u ON c.mother_id = u.id
WHERE (u.email = 'chekerh2002@mail.com' OR u.email = 'chekerh2002@gmail.com')
  AND LOWER(c.name) LIKE '%farouk%'
ORDER BY gs.created_at DESC;

