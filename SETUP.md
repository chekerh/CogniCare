# 🚀 Cognicare Complete Setup Guide

Complete setup guide for local development and production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Setup](#database-setup)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** installed
- **Supabase account** (free at [supabase.com](https://supabase.com))
- **Python 3.9+** (for AI server - optional)

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cognicare.git
cd cognicare
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
# See DATABASE_SETUP.md for detailed instructions
```

**Required variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

---

## Database Setup

**📖 See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for complete database setup instructions.**

### Quick Start:

1. **Create Supabase project** at [app.supabase.com](https://app.supabase.com)
2. **Get credentials** from Settings → API
3. **Run migrations** in SQL Editor:
   - `supabase/migrations/20251008133549_create_core_schema.sql`
   - `supabase/migrations/20251008134158_add_demo_data.sql` (optional)
   - `supabase/migrations/20250102000000_phase2_schema.sql`
4. **Create storage buckets:**
   - `reels` (public, 100MB limit)
   - `avatars` (public, 5MB limit)
   - `group-covers` (public, 10MB limit)

---

## Local Development

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking

# AI Server (optional)
npm run ai:setup     # Setup Kaggle credentials
npm run ai:train     # Train AI models
npm run ai:serve     # Start AI server (port 8000)
```

### Project Structure

```
cognicare/
├── src/
│   ├── components/      # React components
│   │   ├── auth/       # Authentication
│   │   ├── children/   # Child management
│   │   ├── dashboard/  # Progress dashboards
│   │   ├── directory/  # Specialist directory
│   │   ├── feed/       # Community feed
│   │   ├── games/      # Games zone
│   │   ├── groups/     # Community groups
│   │   ├── layout/     # Layout components
│   │   ├── messaging/  # Private messaging
│   │   └── reels/      # Short videos
│   ├── contexts/       # React contexts
│   ├── lib/            # Utilities & services
│   └── main.tsx        # Entry point
├── supabase/
│   └── migrations/     # Database migrations
├── ai/
│   └── server/         # FastAPI AI server
└── dist/               # Build output
```

---

## Production Deployment

**📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.**

### Quick Deploy:

#### Frontend (Vercel)

```bash
npm i -g vercel
vercel login
vercel --prod
```

#### AI Server (Railway)

```bash
npm i -g @railway/cli
cd ai/server
railway init
railway up
```

---

## Testing the Setup

### 1. Test Database Connection

```bash
# Start the app
npm run dev

# Try to sign up a new user
# Check Supabase dashboard → Authentication → Users
```

### 2. Test Features

- ✅ User registration/login
- ✅ Create child profile
- ✅ Create post in community feed
- ✅ Browse specialist directory
- ✅ Play memory game
- ✅ View progress dashboard

### 3. Verify Database

- Go to Supabase → Table Editor
- Check tables are created
- Verify RLS policies are active

---

## Troubleshooting

### Common Issues

#### "Missing Supabase environment variables"
- Check `.env` file exists
- Verify variables are correct
- Restart dev server after changing `.env`

#### "RLS policy violation"
- Check user is authenticated
- Verify user role matches requirements
- Review RLS policies in Supabase

#### "Build fails"
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Check for TypeScript errors: `npm run typecheck`

#### "AI server not connecting"
- Verify AI server is running: `npm run ai:serve`
- Check `VITE_AI_SERVER_URL` in `.env`
- AI server is optional - app works without it

---

## Next Steps

1. ✅ Setup complete
2. ✅ Database configured
3. ✅ App running locally
4. 🚀 Ready to develop!

### Recommended Reading:

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed database setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [README.md](./README.md) - Project overview

---

## Getting Help

- **Documentation**: Check the docs in this repository
- **Issues**: Open an issue on GitHub
- **Supabase**: [Supabase Docs](https://supabase.com/docs)
- **React**: [React Docs](https://react.dev)

---

**Happy Coding! 🎉**

