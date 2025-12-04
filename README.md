# 🧠 Cognicare - منصة دعم شاملة للأطفال ذوي الاحتياجات الخاصة

<div align="center">

![Cognicare](https://img.shields.io/badge/Cognicare-Platform-14b8a6?style=for-the-badge&logo=heart&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**A comprehensive support platform for mothers of children with special needs in Tunisia**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment) • [Contributing](#-contributing)

[English](#-cognicare) | [العربية](#-cognicare---منصة-دعم-شاملة-للأطفال-ذوي-الاحتياجات-الخاصة)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

Cognicare is a comprehensive web platform designed specifically to support mothers of children with special needs in Tunisia. The platform combines a secure social network, specialist support, personalized care plans, and AI-assisted behavioral analysis.

### Key Highlights

- 🔒 **Secure & Private** - End-to-end encrypted messaging, RLS policies
- 🤖 **AI-Powered** - Behavioral analysis with emotion recognition
- 👥 **Community-Driven** - Groups, feed, and specialist directory
- 📊 **Data-Driven** - Progress dashboards with detailed analytics
- 🌍 **Trilingual** - Full support for Arabic (RTL), French, and English

---

## ✨ Features

### Phase 1 (Core Features)
- ✅ **User Authentication** - Secure login/signup with role-based access
- ✅ **Children Profiles** - Manage multiple child profiles with detailed information
- ✅ **Community Feed** - Posts, comments, and reactions
- ✅ **Specialist Directory** - Search and connect with verified specialists
- ✅ **Games Zone** - Interactive memory games with performance tracking
- ✅ **AI Reports** - Behavioral analysis and engagement metrics

### Phase 2 (Advanced Features)
- ✅ **Private Messaging** - End-to-end encrypted WhatsApp-like messaging
- ✅ **Community Groups** - Create and join groups, group posts and discussions
- ✅ **Reels/Short Videos** - Instagram-style vertical video feed
- ✅ **Progress Dashboards** - Detailed charts and analytics for each child
- ✅ **Video Consultations** - Book and conduct video calls with specialists
- ✅ **Push Notifications** - Real-time notifications for all activities
- ✅ **Enhanced Admin Panel** - Comprehensive admin tools and moderation

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Recharts** - Beautiful charts and graphs

### Backend & Database
- **Supabase** - PostgreSQL database with:
  - Authentication (JWT)
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage for videos/images
  - Edge Functions

### AI & ML
- **FastAPI** - Python API server for AI analysis
- **OpenCV** - Image/video processing
- **Emotion Recognition** - Facial emotion detection
- **Speech Analysis** - Audio emotion recognition

### Security
- **libsodium** - End-to-end encryption
- **JWT** - Secure authentication
- **RLS Policies** - Database-level security

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn
- Supabase account ([Sign up free](https://supabase.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/chekerh/CogniCare.git
cd cognicare

# Install dependencies
npm install

# Create .env file (copy & edit this template)
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_AI_SERVER_URL=http://localhost:8000
EOF

# Set up database (see DATABASE_SETUP.md)
# Run migrations in Supabase SQL Editor

# Start development server
npm run dev
```

Visit `http://localhost:5173` 🎉

**📖 For detailed setup instructions, see [SETUP.md](./SETUP.md) or [QUICK_START.md](./QUICK_START.md)**

---

## 📁 Project Structure

```
cognicare/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication forms
│   │   ├── children/        # Child management
│   │   ├── dashboard/      # Progress dashboards
│   │   ├── directory/       # Specialist directory
│   │   ├── feed/            # Community feed
│   │   ├── games/           # Games zone
│   │   ├── groups/          # Community groups
│   │   ├── layout/          # Layout components
│   │   ├── messaging/       # Private messaging
│   │   └── reels/           # Short videos
│   ├── contexts/           # React contexts
│   ├── lib/                 # Utilities & services
│   │   ├── ai.ts           # AI integration
│   │   ├── auth.ts         # Authentication
│   │   ├── encryption.ts   # E2E encryption
│   │   └── supabase.ts     # Supabase client
│   └── main.tsx            # Entry point
├── supabase/
│   └── migrations/         # Database migrations
├── ai/
│   └── server/             # FastAPI AI server
├── scripts/                # Utility scripts
└── docs/                   # Documentation
```

---

## 🗄 Database Setup

Cognicare uses Supabase (PostgreSQL) with comprehensive Row Level Security.

### Quick Setup

1. **Create Supabase Project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Create new project
   - Save your credentials

2. **Run Migrations**
   - Go to SQL Editor in Supabase
   - Run migrations in order:
     - `20251008133549_create_core_schema.sql`
     - `20251008134158_add_demo_data.sql` (optional)
     - `20250102000000_phase2_schema.sql`

3. **Create Storage Buckets**
   - `reels` (public, 100MB)
   - `avatars` (public, 5MB)
   - `group-covers` (public, 10MB)

**📖 Complete guide: [DATABASE_SETUP.md](./DATABASE_SETUP.md)**

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking

# AI Server (optional)
npm run ai:setup     # Setup Kaggle credentials
npm run ai:train     # Train AI models
npm run ai:serve     # Start AI server (port 8000)
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AI_SERVER_URL=http://localhost:8000
```

---

## 🚢 Deployment

### Recommended Stack

- **Frontend**: [Vercel](https://vercel.com) (recommended) or Netlify
- **AI Server**: [Railway](https://railway.app) or Render
- **Database**: Supabase (already cloud-hosted)

### Quick Deploy

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

**📖 Complete deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 📚 Documentation

Comprehensive documentation is available:

- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup step-by-step
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute quick start
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** - GitHub repository setup

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Add comments for complex logic
- Write meaningful commit messages
- Test your changes thoroughly

---

## 📊 Database Schema

### Core Tables
- `users` - User accounts and profiles
- `children` - Child profiles
- `posts` - Community feed posts
- `comments` - Post comments
- `reactions` - Post reactions
- `specialists` - Specialist profiles
- `game_sessions` - Game play sessions
- `ai_reports` - AI analysis reports

### Phase 2 Tables
- `conversations` - Private messaging conversations
- `messages` - Encrypted messages
- `groups` - Community groups
- `group_posts` - Group posts
- `reels` - Short videos
- `consultations` - Video consultations
- `notifications` - Push notifications

All tables have Row Level Security (RLS) enabled for data protection.

---

## 🔒 Security

- **End-to-End Encryption** - Private messages encrypted with libsodium
- **Row Level Security** - Database-level access control
- **JWT Authentication** - Secure token-based auth
- **Environment Variables** - All secrets in `.env` (never committed)
- **HTTPS Only** - All production deployments use HTTPS
- **Input Validation** - Client and server-side validation

---

## 🌍 Internationalization

Cognicare supports three languages:

- **Arabic** (العربية) - Primary language with RTL support
- **French** (Français) - Secondary language
- **English** - For technical documentation

---

## 📈 Roadmap

### Phase 3 (Planned)
- [ ] Mobile app (React Native)
- [ ] Advanced video analysis
- [ ] Eye tracking integration
- [ ] Comprehensive training programs
- [ ] Nutrition planning system

### Phase 4 (Future)
- [ ] Multi-language expansion
- [ ] International deployment
- [ ] Advanced AI models
- [ ] Integration with health systems

---

## 📝 License

This project is open source and available for educational and charitable use.

---

## 💬 Support

- **Documentation**: Check the docs in this repository
- **Issues**: [GitHub Issues](https://github.com/chekerh/CogniCare/issues)
- **Email**: support@cognicare.tn
- **Website**: www.cognicare.tn

---

## 🙏 Acknowledgments

- All mothers who inspired us with their stories
- Specialists who provided their expertise
- Open source community for amazing tools
- Supabase team for excellent platform

---

## ⭐ Star History

If you find this project helpful, please consider giving it a star ⭐

---

<div align="center">

**Made with ❤️ for supporting children with special needs and their families**

[⬆ Back to Top](#-cognicare---منصة-دعم-شاملة-للأطفال-ذوي-الاحتياجات-الخاصة)

</div>
