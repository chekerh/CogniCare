# ⚡ Quick Start Guide

Get Cognicare up and running in 5 minutes!

## 1️⃣ Clone & Install

```bash
git clone https://github.com/yourusername/cognicare.git
cd cognicare
npm install
```

## 2️⃣ Set Up Environment

```bash
# Create .env file
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_AI_SERVER_URL=http://localhost:8000
EOF
```

**Get Supabase credentials:**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Create new project
3. Settings → API → Copy URL and anon key

## 3️⃣ Set Up Database

1. **Go to Supabase SQL Editor**
2. **Run migrations in order:**
   - Copy/paste `supabase/migrations/20251008133549_create_core_schema.sql` → Run
   - Copy/paste `supabase/migrations/20250102000000_phase2_schema.sql` → Run
3. **Create storage bucket:**
   - Storage → New bucket → Name: `reels` → Public: Yes

## 4️⃣ Run the App

```bash
npm run dev
```

Open http://localhost:5173 🎉

## 📚 Need More Details?

- **Full Setup**: [SETUP.md](./SETUP.md)
- **Database Details**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**That's it! You're ready to go! 🚀**

