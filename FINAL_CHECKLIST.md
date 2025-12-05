# ✅ Final Pre-Demo Checklist
## Complete Verification Before Video Recording

**Date:** ___________  
**Team Member:** ___________  
**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Part 1: Environment Setup (15 min)

### Database (Supabase)
- [ ] Supabase account created
- [ ] Project created and active (not paused)
- [ ] URL copied: `https://__________.supabase.co`
- [ ] Anon key copied: `eyJ...`
- [ ] Migrations run successfully:
  - [ ] `20251008133549_create_core_schema.sql` ✅
  - [ ] `20250102000000_phase2_schema.sql` ✅
- [ ] Storage buckets created:
  - [ ] `reels` (public)
  - [ ] `avatars` (public, optional)
  - [ ] `group-covers` (public, optional)
- [ ] User profile trigger installed (run `scripts/fix-user-profile.sql`)

### Frontend Environment
- [ ] `.env` file created in project root
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] `VITE_AI_SERVER_URL` set (optional)
- [ ] Dependencies installed: `npm install` ✅

### AI Server (Optional)
- [ ] Python 3.9+ installed
- [ ] Dependencies installed: `pip install -r ai/server/requirements.txt`
- [ ] Server can start: `npm run ai:serve`

---

## Part 2: Application Testing (20 min)

### Basic Functionality
- [ ] App starts: `npm run dev` → http://localhost:5173
- [ ] No console errors (F12 → Console)
- [ ] Login screen displays correctly
- [ ] Can create new account
- [ ] Can login with existing account
- [ ] **CRITICAL:** Login redirects to home screen (not stuck)

### Core Features
- [ ] **Community Feed:**
  - [ ] Can view posts
  - [ ] Can create new post
  - [ ] Can add reactions
  - [ ] Can comment on posts

- [ ] **Children Management:**
  - [ ] Can add child profile
  - [ ] Can view child list
  - [ ] Can access child dashboard
  - [ ] Dashboard shows charts/graphs

- [ ] **Games Zone:**
  - [ ] Memory game loads
  - [ ] Can play game
  - [ ] Game records score
  - [ ] AI analysis works (or shows fallback)

- [ ] **Specialist Directory:**
  - [ ] Can browse specialists
  - [ ] Can view specialist profiles
  - [ ] Search works (if implemented)

- [ ] **Groups (if testing):**
  - [ ] Can view groups
  - [ ] Can create group
  - [ ] Can post in group

- [ ] **Messaging (if testing):**
  - [ ] Inbox loads
  - [ ] Can send message

---

## Part 3: Demo Preparation (15 min)

### Test Data
- [ ] At least 2-3 sample posts in feed
- [ ] At least 1 child profile added
- [ ] At least 1 game session completed
- [ ] Sample data looks realistic

### Performance
- [ ] App loads in < 3 seconds
- [ ] No lag when navigating
- [ ] Images load properly
- [ ] No memory leaks (check browser dev tools)

### Visual Quality
- [ ] UI looks polished
- [ ] Arabic text displays correctly (RTL)
- [ ] No broken images
- [ ] Colors/theme consistent
- [ ] Mobile responsive (if testing mobile)

---

## Part 4: Error Handling

### Common Issues Checked
- [ ] Login works after account creation
- [ ] No "user profile not found" errors
- [ ] Database connection stable
- [ ] AI server responds (or gracefully handles offline)
- [ ] Storage uploads work (if testing)

### Browser Compatibility
- [ ] Works in Chrome/Edge
- [ ] Works in Firefox (if needed)
- [ ] Works in Safari (if needed)

---

## Part 5: Video Recording Setup

### Technical
- [ ] Screen recording software ready
- [ ] Audio quality good
- [ ] Screen resolution appropriate (1920x1080 recommended)
- [ ] Browser zoom set to 100%
- [ ] Demo account credentials saved

### Script/Flow
- [ ] Demo flow practiced (5 minutes)
- [ ] Key features highlighted
- [ ] Smooth transitions between features
- [ ] Backup plan if something breaks

---

## Part 6: Verification Script

Run the automated check:

```bash
npm run verify
```

Expected output:
- ✅ Environment variables configured
- ✅ Dependencies installed
- ✅ Database connection successful
- ✅ All tables accessible
- ✅ AI server (optional) responding

---

## Quick Fixes Reference

### If Login Doesn't Work:
1. Run: `scripts/fix-user-profile.sql` in Supabase SQL Editor
2. Check: Browser console for errors
3. Verify: User exists in `users` table

### If Database Errors:
1. Check: Supabase project is active
2. Verify: Migrations ran successfully
3. Check: RLS policies are enabled

### If App Won't Start:
1. Run: `npm install` again
2. Check: Node.js version (18+)
3. Clear: `node_modules` and reinstall

---

## Final Sign-Off

**Before recording video:**

- [ ] All Part 1 items complete
- [ ] All Part 2 items complete
- [ ] All Part 3 items complete
- [ ] Verification script passes
- [ ] Demo flow practiced
- [ ] Backup plan ready

**Ready for Demo:** ⬜ Yes | ⬜ No

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

---

## Emergency Contacts / Resources

- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Quick Fix Login:** `QUICK_FIX_LOGIN.md`
- **Start Here:** `START_HERE.md`
- **Database Setup:** `DATABASE_SETUP.md`

**Good luck with your demo! 🚀**

