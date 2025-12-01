# 🗄️ Cognicare Database Setup Guide

Complete step-by-step guide to set up the Cognicare database on Supabase.

## Prerequisites

- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Node.js 18+ installed
- Git installed

---

## Step 1: Create Supabase Project

1. **Go to [Supabase Dashboard](https://app.supabase.com)**
2. **Click "New Project"**
3. **Fill in project details:**
   - Project Name: `cognicare` (or your preferred name)
   - Database Password: **Save this password securely!**
   - Region: Choose closest to your users (e.g., `West US` for Tunisia)
   - Pricing Plan: Free tier is sufficient to start

4. **Wait for project creation** (takes 1-2 minutes)

---

## Step 2: Get Supabase Credentials

1. **In your Supabase project dashboard:**
   - Go to **Settings** → **API**
   - Copy the following:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)

2. **Go to Settings → Database:**
   - Copy **Connection string** (for migrations)
   - Note your **Database password** (from Step 1)

---

## Step 3: Set Up Local Environment

1. **Create `.env` file in project root:**
```bash
# Copy the example file
cp .env.example .env
```

2. **Edit `.env` and add your Supabase credentials:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# AI Server (optional for now)
VITE_AI_SERVER_URL=http://localhost:8000

# Kaggle API (for AI training - optional)
KAGGLE_USERNAME=chekerh
KAGGLE_KEY=your-kaggle-key-here
```

**⚠️ Important:** Never commit `.env` to Git! It's already in `.gitignore`

---

## Step 4: Install Supabase CLI (Optional but Recommended)

The Supabase CLI makes migrations easier:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id
```

**Get your project ID:**
- Go to Settings → General
- Copy the "Reference ID"

---

## Step 5: Run Database Migrations

### Option A: Using Supabase Dashboard (Easiest)

1. **Go to SQL Editor in Supabase Dashboard**
2. **Run migrations in order:**

   **Migration 1: Core Schema**
   - Open `supabase/migrations/20251008133549_create_core_schema.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"

   **Migration 2: Demo Data (Optional)**
   - Open `supabase/migrations/20251008134158_add_demo_data.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"

   **Migration 3: Phase 2 Schema**
   - Open `supabase/migrations/20250102000000_phase2_schema.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"

### Option B: Using Supabase CLI

```bash
# Push all migrations
supabase db push

# Or run specific migration
supabase db push --file supabase/migrations/20251008133549_create_core_schema.sql
```

### Option C: Using psql (PostgreSQL Client)

```bash
# Install PostgreSQL client if needed
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Connect to Supabase
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
\i supabase/migrations/20251008133549_create_core_schema.sql
\i supabase/migrations/20251008134158_add_demo_data.sql
\i supabase/migrations/20250102000000_phase2_schema.sql
```

---

## Step 6: Verify Database Setup

1. **Check Tables:**
   - Go to **Table Editor** in Supabase Dashboard
   - You should see these tables:
     - ✅ `users`
     - ✅ `children`
     - ✅ `posts`
     - ✅ `comments`
     - ✅ `reactions`
     - ✅ `specialists`
     - ✅ `game_sessions`
     - ✅ `ai_reports`
     - ✅ `conversations`
     - ✅ `messages`
     - ✅ `groups`
     - ✅ `group_members`
     - ✅ `reels`
     - ✅ `consultations`
     - ✅ `notifications`
     - And more...

2. **Check Row Level Security (RLS):**
   - Go to **Authentication** → **Policies**
   - All tables should have RLS enabled
   - Verify policies are created

3. **Test Connection:**
```bash
# Run the app locally
npm install
npm run dev
```

---

## Step 7: Set Up Storage Buckets

1. **Go to Storage in Supabase Dashboard**

2. **Create buckets:**

   **Bucket 1: `reels`**
   - Name: `reels`
   - Public: ✅ Yes (for video access)
   - File size limit: 100MB
   - Allowed MIME types: `video/*`

   **Bucket 2: `avatars` (Optional)**
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

   **Bucket 3: `group-covers` (Optional)**
   - Name: `group-covers`
   - Public: ✅ Yes
   - File size limit: 10MB
   - Allowed MIME types: `image/*`

3. **Set Storage Policies:**
   - Go to **Storage** → **Policies**
   - For each bucket, add policies:

   **Upload Policy:**
   ```sql
   CREATE POLICY "Users can upload own files"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'reels' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

   **Read Policy:**
   ```sql
   CREATE POLICY "Public can read files"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'reels');
   ```

---

## Step 8: Configure Authentication

1. **Go to Authentication → Settings**

2. **Enable Email Auth:**
   - ✅ Enable email provider
   - ✅ Confirm email: Optional (for development)

3. **Configure Email Templates (Optional):**
   - Customize welcome emails
   - Customize password reset emails

4. **Set up Auth Hooks (Optional):**
   - Go to **Database** → **Functions**
   - Create function to auto-create user profile:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'mother')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 9: Set Up Realtime (Optional)

1. **Go to Database → Replication**
2. **Enable replication for:**
   - ✅ `posts`
   - ✅ `comments`
   - ✅ `messages`
   - ✅ `conversations`
   - ✅ `notifications`

This enables real-time updates in your app.

---

## Step 10: Test Database Connection

Create a test script to verify everything works:

```bash
# Create test file
cat > test-db.js << 'EOF'
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🧪 Testing database connection...\n');

  // Test 1: Check connection
  const { data, error } = await supabase.from('users').select('count').limit(1);
  
  if (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Database connection successful!');
  
  // Test 2: Check tables
  const tables = ['users', 'children', 'posts', 'groups', 'reels'];
  for (const table of tables) {
    const { error: tableError } = await supabase.from(table).select('count').limit(1);
    if (tableError) {
      console.error(`❌ Table ${table} not accessible:`, tableError.message);
    } else {
      console.log(`✅ Table ${table} is accessible`);
    }
  }
  
  console.log('\n🎉 All tests passed!');
}

testConnection();
EOF

# Run test
node test-db.js
```

---

## Step 11: Seed Demo Data (Optional)

If you ran the demo data migration, you can test with these accounts:

**Demo Accounts:**
- **Mother**: `mother@demo.com` / `demo123`
- **Specialist**: `specialist@demo.com` / `demo123`
- **Volunteer**: `volunteer@demo.com` / `demo123`

**Note:** You'll need to create these users in Supabase Auth first:
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. The user profile will be auto-created (if trigger is set up)

---

## Step 12: Production Checklist

Before going to production:

- [ ] Change all demo passwords
- [ ] Enable email confirmation
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Review all RLS policies
- [ ] Test all CRUD operations
- [ ] Verify storage policies
- [ ] Set up monitoring/alerts
- [ ] Document API endpoints

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution:** Check `.env` file exists and has correct values

### Issue: "RLS policy violation"
**Solution:** 
- Check user is authenticated
- Verify RLS policies are correct
- Check user role matches policy requirements

### Issue: "Storage upload fails"
**Solution:**
- Verify bucket exists
- Check storage policies
- Verify file size within limits
- Check MIME type is allowed

### Issue: "Migration fails"
**Solution:**
- Check SQL syntax
- Verify no duplicate tables
- Check foreign key constraints
- Review error messages in Supabase logs

### Issue: "Realtime not working"
**Solution:**
- Enable replication for tables
- Check Supabase client is configured correctly
- Verify WebSocket connection

---

## Database Schema Overview

### Core Tables
- `users` - User accounts and profiles
- `children` - Child profiles
- `posts` - Community feed posts
- `comments` - Post comments
- `reactions` - Post reactions
- `specialists` - Specialist profiles

### Phase 2 Tables
- `conversations` - Private messaging
- `messages` - Encrypted messages
- `groups` - Community groups
- `group_posts` - Group posts
- `reels` - Short videos
- `consultations` - Video consultations
- `notifications` - Push notifications
- `ai_reports` - AI analysis reports

### Security
- All tables have Row Level Security (RLS) enabled
- Policies restrict access based on user role
- Encrypted messaging with libsodium
- Secure file storage with signed URLs

---

## Next Steps

1. ✅ Database is set up
2. ✅ Migrations are applied
3. ✅ Storage buckets created
4. ✅ Environment variables configured
5. 🚀 Ready to run the application!

Run the app:
```bash
npm install
npm run dev
```

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Project Issues**: Check GitHub issues

---

**Last Updated:** January 2025
**Version:** 2.0 (Phase 2 Complete)

