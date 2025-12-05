# 🔧 Quick Fix: Login Screen Issue

## Problem
User can't get past login screen - stuck after entering credentials.

## Root Cause
User exists in `auth.users` but profile doesn't exist in `public.users` table.

## Solution (Choose One)

### Option 1: Run SQL Fix (Recommended - 2 minutes)

1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy and paste** the contents of `scripts/fix-user-profile.sql`
3. **Click "Run"**
4. **Try logging in again**

This will:
- ✅ Create auto-trigger for new users
- ✅ Fix existing users without profiles
- ✅ Prevent future issues

### Option 2: Manual Fix (If SQL doesn't work)

1. **Go to Supabase → Authentication → Users**
2. **Find the user's ID** (copy it)
3. **Go to SQL Editor** and run:

```sql
INSERT INTO public.users (id, email, full_name, role, display_name, language_preference, is_verified)
VALUES (
  'PASTE_USER_ID_HERE',
  'user@example.com',
  'User Name',
  'mother',
  'User',
  'ar',
  false
);
```

Replace:
- `PASTE_USER_ID_HERE` with actual user ID
- `user@example.com` with actual email
- `User Name` with actual name

### Option 3: Create New Account

If fix doesn't work, create a new account - the trigger will auto-create the profile.

---

## Verification

After running the fix:

1. **Check Supabase → Table Editor → users**
2. **Verify your user exists** in the table
3. **Try logging in again**

---

## Prevention

The SQL fix includes a trigger that automatically creates user profiles when auth users are created. This prevents the issue from happening again.

---

## Still Having Issues?

1. Check browser console (F12) for errors
2. Verify `.env` file has correct Supabase credentials
3. Check Supabase project is not paused
4. Try clearing browser cache and cookies

