/*
  # Add Demo Data for Cognicare Platform

  ## Overview
  Inserts sample data to demonstrate the platform's functionality including:
  - Sample users (mother, specialist, volunteer)
  - Community posts and comments
  - Specialist profiles
  - Children profiles with game sessions

  ## Important Notes
  - Demo passwords are hashed but simple for testing
  - All demo users are pre-verified
  - Sample content is in Arabic to match the platform's target audience
*/

-- Note: Supabase auth users would normally be created via the auth.users table
-- For demo purposes, we'll insert into our users table with placeholder IDs
-- In production, these would be linked to actual auth.users entries

-- Insert demo mother user
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mother@demo.com') THEN
    INSERT INTO users (id, email, role, full_name, display_name, location, language_preference, is_verified)
    VALUES (
      '11111111-1111-1111-1111-111111111111',
      'mother@demo.com',
      'mother',
      'فاطمة أحمد',
      'فاطمة',
      'تونس',
      'ar',
      true
    );
  END IF;
END $$;

-- Insert demo specialist user
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'specialist@demo.com') THEN
    INSERT INTO users (id, email, role, full_name, display_name, location, language_preference, is_verified)
    VALUES (
      '22222222-2222-2222-2222-222222222222',
      'specialist@demo.com',
      'specialist',
      'د. محمد السعيدي',
      'د. محمد',
      'تونس',
      'ar',
      true
    );
  END IF;
END $$;

-- Insert demo volunteer user
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'volunteer@demo.com') THEN
    INSERT INTO users (id, email, role, full_name, display_name, location, language_preference, is_verified)
    VALUES (
      '33333333-3333-3333-3333-333333333333',
      'volunteer@demo.com',
      'volunteer',
      'أمينة بن علي',
      'أمينة',
      'صفاقس',
      'ar',
      true
    );
  END IF;
END $$;

-- Insert specialist profile
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM specialists WHERE user_id = '22222222-2222-2222-2222-222222222222') THEN
    INSERT INTO specialists (user_id, credentials, specialty, languages_spoken, availability, verified_at)
    VALUES (
      '22222222-2222-2222-2222-222222222222',
      'دكتوراه في علم النفس السريري - جامعة تونس',
      ARRAY['اضطراب طيف التوحد', 'علاج سلوكي', 'تقييم نفسي'],
      ARRAY['العربية', 'الفرنسية'],
      'متاح من الاثنين إلى الجمعة، 9 صباحاً - 5 مساءً',
      now()
    );
  END IF;
END $$;

-- Update specialist user with bio
DO $$
BEGIN
  UPDATE users
  SET bio = 'أخصائي نفسي مختص في اضطرابات النمو عند الأطفال. خبرة 15 سنة في مجال التوحد والتدخل المبكر.'
  WHERE id = '22222222-2222-2222-2222-222222222222'
  AND (bio IS NULL OR bio = '');
END $$;

-- Insert sample posts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM posts WHERE author_id = '11111111-1111-1111-1111-111111111111') THEN
    INSERT INTO posts (author_id, content, tags, created_at)
    VALUES
    (
      '11111111-1111-1111-1111-111111111111',
      'مرحباً بالجميع! أنا أم جديدة في هذا المجتمع. ابني عمره 5 سنوات ولديه اضطراب طيف التوحد. أبحث عن نصائح حول كيفية تحسين التواصل معه.',
      ARRAY['التوحد', 'التواصل'],
      now() - interval '2 hours'
    ),
    (
      '33333333-3333-3333-3333-333333333333',
      'نصيحة اليوم: الروتين اليومي مهم جداً للأطفال ذوي الاحتياجات الخاصة. حاولوا أن تكون أوقات الأكل والنوم واللعب في نفس الوقت كل يوم.',
      ARRAY['نصائح', 'روتين'],
      now() - interval '5 hours'
    ),
    (
      '22222222-2222-2222-2222-222222222222',
      'من المهم جداً الاحتفال بالإنجازات الصغيرة. كل خطوة إلى الأمام هي نجاح يستحق التقدير. لا تقارني طفلك بالآخرين، بل قارنيه بنفسه قبل شهر أو شهرين.',
      ARRAY['تشجيع', 'تطور'],
      now() - interval '1 day'
    );
  END IF;
END $$;

-- Insert sample comments
DO $$
DECLARE
  post_id_1 uuid;
BEGIN
  SELECT id INTO post_id_1
  FROM posts
  WHERE author_id = '11111111-1111-1111-1111-111111111111'
  LIMIT 1;

  IF post_id_1 IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM comments WHERE post_id = post_id_1
  ) THEN
    INSERT INTO comments (post_id, author_id, content, created_at)
    VALUES
    (
      post_id_1,
      '22222222-2222-2222-2222-222222222222',
      'مرحباً فاطمة! من الجميل أن تنضمي إلينا. بالنسبة للتواصل، جربي استخدام البطاقات المصورة والتواصل البصري. يمكنني مساعدتك بمزيد من التقنيات إذا أردت.',
      now() - interval '1 hour'
    ),
    (
      post_id_1,
      '33333333-3333-3333-3333-333333333333',
      'أهلاً وسهلاً! أنا أيضاً أم لطفل مع التوحد. الصبر والاستمرارية هما المفتاح. سترين تحسناً تدريجياً بإذن الله.',
      now() - interval '30 minutes'
    );
  END IF;
END $$;

-- Insert sample child profile
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM children WHERE mother_id = '11111111-1111-1111-1111-111111111111') THEN
    INSERT INTO children (id, mother_id, name, age, gender, diagnosis, education_level)
    VALUES (
      '44444444-4444-4444-4444-444444444444',
      '11111111-1111-1111-1111-111111111111',
      'يوسف',
      5,
      'male',
      ARRAY['اضطراب طيف التوحد'],
      'روضة'
    );
  END IF;
END $$;

-- Insert sample game session
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM game_sessions WHERE child_id = '44444444-4444-4444-4444-444444444444') THEN
    INSERT INTO game_sessions (child_id, game_type, duration_seconds, score, accuracy, metrics, camera_enabled)
    VALUES (
      '44444444-4444-4444-4444-444444444444',
      'memory_match',
      180,
      85,
      75.5,
      '{"moves": 12, "pairs": 6}'::jsonb,
      false
    );
  END IF;
END $$;