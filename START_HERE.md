# 🚀 START HERE - Cognicare Setup Guide
## Quick Start for Video Demo (5 Days Deadline)

**Welcome!** This guide will get your Cognicare app running in **under 2 hours**.

---

## ⚡ Quick Start (30 minutes)

### Step 1: Database Setup (15 min)

1. **Create Supabase account** at [supabase.com](https://supabase.com)
2. **Create new project** → Save URL and API key
3. **Run migrations:**
   - Go to SQL Editor
   - Run: `supabase/migrations/20251008133549_create_core_schema.sql`
   - Run: `supabase/migrations/20250102000000_phase2_schema.sql`
4. **Create storage buckets:** `reels`, `avatars` (both public)

### Step 2: Frontend Setup (10 min)

```bash
# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AI_SERVER_URL=http://localhost:8000
EOF

# Start app
npm run dev
```

### Step 3: AI Server (Optional - 5 min)

```bash
cd ai/server
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Step 4: Test Login

1. Open http://localhost:5173
2. Create account
3. **If stuck on login:** See `QUICK_FIX_LOGIN.md`

---

## 📚 Detailed Guides

- **Full Deployment:** `DEPLOYMENT_GUIDE.md` (complete step-by-step)
- **Login Issues:** `QUICK_FIX_LOGIN.md` (fix login screen problem)
- **Database Setup:** `DATABASE_SETUP.md` (detailed database guide)
- **AI Training:** `AI_TRAINING_PLAN.md` (for later, not needed for demo)

---

## 🔧 Common Issues & Fixes

### Can't get past login screen?

**Quick Fix:**
1. Go to Supabase → SQL Editor
2. Run: `scripts/fix-user-profile.sql`
3. Try login again

**See:** `QUICK_FIX_LOGIN.md` for details

### Database errors?

1. Verify migrations ran successfully
2. Check Supabase project is active (not paused)
3. Verify `.env` has correct credentials

### AI server not working?

**Good news:** App works without AI server! It uses fallback mode.

---

## ✅ Verification

Run this to check everything:

```bash
npm run verify
```

This checks:
- ✅ Environment variables
- ✅ Database connection
- ✅ Dependencies installed
- ✅ AI server (optional)

---

## 📋 Pre-Demo Checklist

Before recording video:

- [ ] App loads at http://localhost:5173
- [ ] Can create account and login
- [ ] Can see home screen after login
- [ ] Can create posts in feed
- [ ] Can add child profile
- [ ] Games zone loads
- [ ] No console errors (F12)
- [ ] AI server running (or using fallback)

---

## 🎬 Demo Flow Suggestions

1. **Login/Signup** (30 sec)
2. **Community Feed** - create post (1 min)
3. **Children** - add child, view dashboard (1 min)
4. **Games** - play game, show AI (1 min)
5. **Directory/Groups** (30 sec)

**Total: ~5 minutes**

---

## 🆘 Need Help?

1. **Check browser console** (F12) for errors
2. **Check Supabase logs** (Dashboard → Logs)
3. **Run verification:** `npm run verify`
4. **See troubleshooting** in `DEPLOYMENT_GUIDE.md`

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Start app | `npm run dev` |
| Start AI server | `npm run ai:serve` |
| Verify setup | `npm run verify` |
| Build for production | `npm run build` |

---

## 🎯 Success Criteria

✅ **Ready for demo when:**
- Login works → redirects to home
- Can create posts
- Can add children
- Games work
- No critical errors

---

## ⏱️ Timeline

- **Day 1:** Database + Frontend setup (2 hours)
- **Day 2:** Test all features, fix issues (2 hours)
- **Day 3:** Prepare demo data, practice flow (1 hour)
- **Day 4:** Record video (1 hour)
- **Day 5:** Final touches, backup plan

**Total: ~6 hours over 5 days**

---

## 🚀 Let's Go!

1. **Start with:** `DEPLOYMENT_GUIDE.md` (Part 1)
2. **If login issues:** `QUICK_FIX_LOGIN.md`
3. **For questions:** Check troubleshooting sections

**Good luck! You've got this! 💪**

---

**Next Steps:**
1. Open `DEPLOYMENT_GUIDE.md`
2. Follow Part 1 (Database Setup)
3. Follow Part 2 (Frontend Setup)
4. Test login
5. If issues → `QUICK_FIX_LOGIN.md`

