# 🚀 Cognicare Complete Deployment Guide
## Step-by-Step Setup for Video Demo (5-Day Deadline)

**Last Updated:** January 2025  
**Target:** Get app fully working for video demonstration

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] A Supabase account (free at [supabase.com](https://supabase.com))
- [ ] Python 3.9+ installed (for AI server - optional)
- [ ] A code editor (VS Code recommended)

---

## Part 1: Database Setup (Supabase) - 30 minutes

### Step 1.1: Create Supabase Project

1. **Go to [app.supabase.com](https://app.supabase.com)**
2. **Click "New Project"**
3. **Fill in details:**
   - Project Name: `cognicare-demo`
   - Database Password: **SAVE THIS PASSWORD!** (You'll need it)
   - Region: Choose closest to you (e.g., `West US` or `Europe West`)
   - Plan: Free tier is fine

4. **Wait 1-2 minutes** for project creation

### Step 1.2: Get Your Credentials

1. **In Supabase Dashboard:**
   - Go to **Settings** → **API**
   - Copy these values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public key** (starts with `eyJ...`)

2. **Save these in a text file** - you'll need them soon!

### Step 1.3: Run Database Migrations

1. **Go to SQL Editor** in Supabase Dashboard (left sidebar)

2. **Run Migration 1: Core Schema**
   - Click "New Query"
   - Open file: `supabase/migrations/20251008133549_create_core_schema.sql`
   - Copy **ALL** contents
   - Paste into SQL Editor
   - Click **"Run"** (or press Ctrl+Enter)
   - Wait for "Success" message

3. **Run Migration 2: Phase 2 Schema**
   - Click "New Query" again
   - Open file: `supabase/migrations/20250102000000_phase2_schema.sql`
   - Copy **ALL** contents
   - Paste into SQL Editor
   - Click **"Run"**
   - Wait for "Success" message

4. **Optional: Add Demo Data**
   - If you want test data, run: `supabase/migrations/20251008134158_add_demo_data.sql`

### Step 1.4: Create Storage Buckets

1. **Go to Storage** in Supabase Dashboard

2. **Create Bucket 1: `reels`**
   - Click "New bucket"
   - Name: `reels`
   - Public: ✅ **Yes** (check the box)
   - Click "Create bucket"

3. **Create Bucket 2: `avatars`** (optional)
   - Name: `avatars`
   - Public: ✅ **Yes**
   - Click "Create bucket"

4. **Create Bucket 3: `group-covers`** (optional)
   - Name: `group-covers`
   - Public: ✅ **Yes**
   - Click "Create bucket"

### Step 1.5: Verify Database Setup

1. **Go to Table Editor** in Supabase
2. **Check these tables exist:**
   - ✅ `users`
   - ✅ `children`
   - ✅ `posts`
   - ✅ `groups`
   - ✅ `reels`
   - ✅ `messages`
   - ✅ `consultations`

If all tables exist, **database is ready! ✅**

---

## Part 2: Frontend Setup - 20 minutes

### Step 2.1: Clone and Install

```bash
# Navigate to project folder
cd /path/to/cognicare

# Install dependencies
npm install
```

**Wait for installation to complete** (may take 2-3 minutes)

### Step 2.2: Create Environment File

1. **Create `.env` file** in project root:

```bash
# In project root, create .env file
touch .env
```

2. **Open `.env` file** and add:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_AI_SERVER_URL=http://localhost:8000
```

**Replace:**
- `your-project-id.supabase.co` with your actual Supabase URL
- `your-anon-key-here` with your actual anon key

3. **Save the file**

### Step 2.3: Test Local Development

```bash
# Start development server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

4. **Open browser:** http://localhost:5173

5. **Test login:**
   - Try to create an account
   - If it works, you'll see the home screen ✅
   - If you see errors, check browser console (F12)

### Step 2.4: Fix Common Issues

**Issue: "Missing Supabase environment variables"**
- ✅ Check `.env` file exists
- ✅ Check file has correct variable names (VITE_ prefix)
- ✅ Restart dev server after changing `.env`

**Issue: "RLS policy violation"**
- ✅ Make sure migrations ran successfully
- ✅ Check user is authenticated
- ✅ Verify user profile was created in `users` table

**Issue: "Cannot read property of undefined"**
- ✅ Check browser console for specific error
- ✅ Verify Supabase connection is working

---

## Part 3: AI Server Setup - 30 minutes

### Step 3.1: Install Python Dependencies

```bash
# Navigate to AI server folder
cd ai/server

# Create virtual environment (recommended)
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3.2: Configure AI Server

The AI server will work **WITHOUT trained models** using fallback heuristics. This is fine for demo purposes.

**No additional configuration needed!** The server automatically uses fallback logic if models aren't found.

### Step 3.3: Start AI Server

```bash
# Make sure you're in ai/server directory
cd ai/server

# Start server
python -m uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Test AI server:**
- Open: http://localhost:8000/health
- Should see: `{"status":"healthy","service":"cognicare-ai"}`

### Step 3.4: AI Server Without Models (Fallback Mode)

The AI server is designed to work **without trained models** for demo purposes:

- ✅ Emotion detection: Uses heuristic fallback
- ✅ Attention tracking: Uses simple calculations
- ✅ Engagement scoring: Uses basic metrics

**This is sufficient for video demo!** Models can be trained later for production.

---

## Part 4: Testing the Full App - 15 minutes

### Step 4.1: Create Test Account

1. **Open app:** http://localhost:5173
2. **Click "إنشاء حساب جديد"** (Create new account)
3. **Fill in form:**
   - Name: Test User
   - Email: test@example.com
   - Password: test123456 (8+ characters)
   - Role: أم (Mother)
4. **Click "إنشاء حساب"** (Create account)

### Step 4.2: Test Core Features

**After login, test these features:**

1. **Community Feed** (المنشورات)
   - ✅ Create a post
   - ✅ View posts
   - ✅ Add reactions

2. **Children Management** (الأطفال)
   - ✅ Add a child profile
   - ✅ View child dashboard

3. **Games Zone** (الألعاب)
   - ✅ Play memory game
   - ✅ Check if AI analysis works (may use fallback)

4. **Specialist Directory** (الأخصائيون)
   - ✅ Browse specialists
   - ✅ View profiles

### Step 4.3: Verify Everything Works

**Checklist:**
- [ ] Login works ✅
- [ ] Can create posts ✅
- [ ] Can add children ✅
- [ ] Games load ✅
- [ ] No console errors ✅
- [ ] AI server responds ✅

---

## Part 5: Production Deployment (Optional for Demo)

If you need to deploy for video demo:

### Option A: Vercel (Recommended - 10 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Add environment variables in Vercel dashboard:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_SERVER_URL` (your deployed AI server URL)

### Option B: Netlify (Alternative)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

---

## Part 6: Troubleshooting Guide

### Problem: Can't get past login screen

**Solution:**
1. Check browser console (F12) for errors
2. Verify `.env` file has correct Supabase credentials
3. Check Supabase dashboard → Authentication → Users (user should exist)
4. Check Supabase dashboard → Table Editor → `users` table (profile should exist)
5. If user exists in auth but not in users table, manually create profile:

```sql
-- In Supabase SQL Editor
INSERT INTO users (id, email, full_name, role, language_preference)
VALUES (
  'user-id-from-auth',  -- Get from Authentication → Users
  'user@example.com',
  'Test User',
  'mother',
  'ar'
);
```

### Problem: Database connection errors

**Solution:**
1. Verify Supabase project is active (not paused)
2. Check Supabase URL and key are correct
3. Test connection in Supabase dashboard
4. Check RLS policies are set up (migrations should have done this)

### Problem: AI server not working

**Solution:**
1. AI server works in fallback mode without models
2. Check server is running: `curl http://localhost:8000/health`
3. Verify `VITE_AI_SERVER_URL` in `.env` is correct
4. For demo, fallback mode is sufficient

### Problem: Storage upload fails

**Solution:**
1. Verify storage buckets are created
2. Check buckets are set to "Public"
3. Check file size limits (reels: 100MB, avatars: 5MB)

---

## Part 7: Quick Start Commands Reference

```bash
# 1. Install dependencies
npm install

# 2. Start frontend (Terminal 1)
npm run dev

# 3. Start AI server (Terminal 2)
cd ai/server
python -m uvicorn main:app --reload --port 8000

# 4. Test health
curl http://localhost:8000/health

# 5. Build for production
npm run build
```

---

## Part 8: Video Demo Preparation

### Pre-Demo Checklist

- [ ] Database is set up and working
- [ ] Test account created and can login
- [ ] At least 2-3 sample posts in feed
- [ ] At least 1 child profile added
- [ ] Games zone is functional
- [ ] AI server is running (or using fallback)
- [ ] No console errors
- [ ] App loads quickly (< 3 seconds)

### Demo Flow Suggestions

1. **Show login/signup** (30 seconds)
2. **Show community feed** - create a post (1 minute)
3. **Show children management** - add child, view dashboard (1 minute)
4. **Show games zone** - play game, show AI analysis (1 minute)
5. **Show specialist directory** (30 seconds)
6. **Show groups/messaging** (30 seconds)

**Total: ~5 minutes**

---

## Support & Help

### If You Get Stuck:

1. **Check browser console** (F12) for errors
2. **Check Supabase logs** (Dashboard → Logs)
3. **Verify all environment variables** are set
4. **Test each component** individually
5. **Check this guide** for common issues

### Quick Fixes:

- **Restart dev server** after changing `.env`
- **Clear browser cache** if seeing old errors
- **Check Supabase project** is not paused
- **Verify migrations** ran successfully

---

## Success Criteria

✅ **App is ready for demo when:**
- Login works and redirects to home screen
- Can create posts and view feed
- Can add children and view dashboards
- Games load and work
- No critical console errors
- AI server responds (even in fallback mode)

---

## Next Steps After Demo

1. **Train AI models** (see AI_TRAINING_PLAN.md)
2. **Deploy to production** (Vercel + Railway)
3. **Add more test data**
4. **Optimize performance**
5. **Add monitoring/analytics**

---

**Good luck with your demo! 🚀**

**Questions?** Check the troubleshooting section or review the code comments.

