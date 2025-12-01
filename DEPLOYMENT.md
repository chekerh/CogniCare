# 🚀 Cognicare Deployment Guide

## Architecture Overview

Your application uses:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI Server**: FastAPI (Python)
- **Build Tool**: Vite

## Recommended Deployment Strategy

### Option 1: Vercel (Recommended for Frontend) ⭐

**Best for**: React/Vite applications with Supabase

**Why Vercel?**
- ✅ Zero-config deployment for Vite/React
- ✅ Automatic HTTPS and CDN
- ✅ Environment variables management
- ✅ Preview deployments for PRs
- ✅ Free tier is generous
- ✅ Excellent performance globally

**Setup Steps:**

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Add environment variables in Vercel dashboard:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_SERVER_URL`

4. **Create `vercel.json` (optional):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Cost**: Free tier includes 100GB bandwidth/month

---

### Option 2: Netlify

**Best for**: JAMstack applications

**Why Netlify?**
- ✅ Easy drag-and-drop deployment
- ✅ Built-in CI/CD
- ✅ Form handling
- ✅ Edge functions support
- ✅ Free tier available

**Setup Steps:**

1. **Install Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Create `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. **Deploy:**
```bash
netlify deploy --prod
```

**Cost**: Free tier includes 100GB bandwidth/month

---

### Option 3: Cloudflare Pages

**Best for**: Global performance and low cost

**Why Cloudflare?**
- ✅ Unlimited bandwidth on free tier
- ✅ Global CDN
- ✅ Excellent performance
- ✅ DDoS protection included
- ✅ Workers for edge computing

**Setup Steps:**

1. **Install Wrangler CLI:**
```bash
npm i -g wrangler
```

2. **Deploy via Cloudflare Dashboard:**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Build output: `dist`

**Cost**: Free tier includes unlimited bandwidth

---

## AI Server Deployment (FastAPI)

Your AI server needs Python hosting. Here are the best options:

### Option 1: Railway ⭐ (Recommended)

**Why Railway?**
- ✅ Easy Python deployment
- ✅ Automatic HTTPS
- ✅ Environment variables
- ✅ $5/month for hobby projects
- ✅ Great developer experience

**Setup:**
1. Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd ai/server && python -m uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

2. Deploy via Railway dashboard or CLI

### Option 2: Render

**Why Render?**
- ✅ Free tier available
- ✅ Auto-deploy from Git
- ✅ Built-in SSL
- ✅ Easy environment variables

**Setup:**
1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: cognicare-ai
    env: python
    buildCommand: pip install -r ai/server/requirements.txt
    startCommand: cd ai/server && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PORT
        value: 8000
```

### Option 3: Fly.io

**Why Fly.io?**
- ✅ Global edge deployment
- ✅ Free tier for small apps
- ✅ Great for Python
- ✅ Low latency worldwide

**Setup:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Create `fly.toml` in `ai/server/`:
```toml
app = "cognicare-ai"
primary_region = "iad"

[build]

[env]
  PORT = "8000"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
```

3. Deploy: `fly deploy`

---

## Complete Deployment Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │  ← React + Vite
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌─────▼──────────┐
│   Supabase     │  │  AI Server     │
│   (Cloud)      │  │  (Railway)     │
│                │  │                │
│ - PostgreSQL   │  │ - FastAPI      │
│ - Auth         │  │ - ML Models    │
│ - Storage      │  │ - Emotion AI   │
│ - Realtime     │  │                │
└────────────────┘  └────────────────┘
```

---

## Environment Variables Setup

### Frontend (.env)
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_SERVER_URL=https://your-ai-server.railway.app
```

### AI Server
```bash
KAGGLE_USERNAME=chekerh
KAGGLE_KEY=your_kaggle_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

---

## Recommended Stack (Based on Your Code)

### Production Setup:

1. **Frontend**: **Vercel** (best DX, free tier)
2. **AI Server**: **Railway** (easiest Python deployment)
3. **Database/Auth**: **Supabase** (already using, keep it)
4. **Storage**: **Supabase Storage** (for reels/videos)

### Why This Stack?

- ✅ **Vercel**: Perfect for Vite/React, zero config
- ✅ **Railway**: Simple Python deployment, good pricing
- ✅ **Supabase**: Already integrated, no migration needed
- ✅ **All services**: Have free tiers to start

---

## Migration Steps from Bolt

1. **Export environment variables** from Bolt dashboard
2. **Set up Vercel account** and connect GitHub
3. **Deploy frontend** to Vercel
4. **Set up Railway** for AI server
5. **Update frontend env vars** with new AI server URL
6. **Test all features** end-to-end
7. **Update domain** DNS if using custom domain

---

## Cost Estimate

**Free Tier (Starting):**
- Vercel: Free (100GB bandwidth)
- Railway: $5/month (hobby plan)
- Supabase: Free tier available
- **Total: ~$5/month**

**Production Scale:**
- Vercel Pro: $20/month
- Railway Pro: $20/month
- Supabase Pro: $25/month
- **Total: ~$65/month**

---

## Quick Start Commands

### Deploy Frontend to Vercel:
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Deploy AI Server to Railway:
```bash
npm i -g @railway/cli
railway login
cd ai/server
railway init
railway up
```

---

## Additional Recommendations

1. **Monitoring**: Add Sentry for error tracking
2. **Analytics**: Use Vercel Analytics or Plausible
3. **CI/CD**: GitHub Actions for automated testing
4. **Backup**: Supabase has built-in backups
5. **CDN**: Vercel/Cloudflare provide global CDN automatically

---

## Support

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs

