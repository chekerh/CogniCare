# 🧠 Cognicare - منصة دعم شاملة للأطفال ذوي الاحتياجات الخاصة

<div align="center">

![Cognicare](https://img.shields.io/badge/Cognicare-Platform-14b8a6?style=for-the-badge&logo=heart&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A comprehensive support platform for mothers of children with special needs in Tunisia**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment) • [Contributing](#-contributing)

[English](#-cognicare) | [العربية](#-cognicare---منصة-دعم-شاملة-للأطفال-ذوي-الاحتياجات-الخاصة)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
  - [Core Features](#core-features)
  - [AI & Analytics](#ai--analytics)
  - [UI/UX Features](#uiux-features)
  - [Community Features](#community-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [AI System](#-ai-system)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

Cognicare is a comprehensive web platform designed specifically to support mothers of children with special needs in Tunisia. The platform combines a secure social network, specialist support, personalized care plans, and AI-assisted behavioral analysis to help track and improve children's development.

### Key Highlights

- 🔒 **Secure & Private** - End-to-end encrypted messaging, Row Level Security (RLS) policies
- 🤖 **AI-Powered Analytics** - Metrics-based behavioral analysis with automatic report generation
- 👥 **Community-Driven** - Groups, feed, specialist directory, and peer support
- 📊 **Data-Driven Insights** - Comprehensive progress dashboards with detailed analytics and trends
- 🌍 **Trilingual Support** - Full support for Arabic (RTL), French, and English
- 🎨 **Customizable UI** - Light, Dark, and Winnie-the-Pooh themes
- 📈 **Progression Tracking** - Detailed statistics and trend analysis for child development

---

## ✨ Features

### Core Features

#### 👤 User Management
- **Role-Based Access Control** - Mothers, Specialists, Volunteers, and Admins
- **Secure Authentication** - JWT-based authentication via Supabase
- **Profile Management** - Customizable profiles with display names and avatars
- **Multi-Child Support** - Manage multiple child profiles per mother account

#### 👶 Children Profiles
- **Comprehensive Profiles** - Name, age, gender, diagnosis, education level
- **Intake Forms** - Detailed questionnaires for behavioral assessment
- **Progress Tracking** - Track development across multiple sessions
- **Achievement System** - Badges and milestones for progress

#### 🎮 Games Zone
- **Memory Match Game** - Interactive card matching game
- **Real-Time Tracking** - Tracks moves, reaction times, accuracy, and duration
- **Performance Metrics** - Automatic calculation of engagement and attention scores
- **Session History** - Complete history of all game sessions

### AI & Analytics

#### 📊 Metrics-Based Analysis
- **No Camera Required** - Works entirely from game performance metrics
- **Automatic Analysis** - AI reports generated after every game session
- **Engagement Scoring** - Calculates engagement based on accuracy, reaction time, and error rate
- **Attention Scoring** - Measures focus and consistency
- **Personalized Insights** - AI-generated observations and recommendations

#### 📈 Progress Dashboards
- **Overview Dashboard** - Quick stats, achievements, and recent sessions
- **Detailed Statistics Page** - Comprehensive metrics with interactive charts
- **Trend Analysis** - Compare recent sessions vs previous sessions
- **Multiple Metrics** - Reaction time, accuracy, completion time, score, engagement
- **Visual Charts** - Line charts, bar charts, and pie charts for data visualization
- **PDF Export** - Download progress reports as PDF

#### 🤖 AI Report Generation
- **Always Active** - Reports generated for every game session
- **Comprehensive Metrics**:
  - Engagement Score (0-100)
  - Attention Score (0-100)
  - Average Reaction Time
  - Accuracy Percentage
  - Completion Time
- **Actionable Recommendations** - Personalized suggestions for improvement
- **Insights** - Textual observations about performance

### UI/UX Features

#### 🎨 Theme System
- **Light Mode** - Clean, bright interface
- **Dark Mode** - Eye-friendly dark theme with full component support
- **Winnie-the-Pooh Theme** - Warm, child-friendly color scheme
- **Theme Persistence** - Preferences saved in localStorage
- **Profile Settings** - Theme switcher accessible from profile page

#### 🌍 Internationalization
- **Three Languages**:
  - **Arabic (العربية)** - Primary language with full RTL support
  - **French (Français)** - Secondary language
  - **English** - Technical documentation and fallback
- **RTL Support** - Proper right-to-left layout for Arabic
- **Language Persistence** - Preferences saved and synced with user profile
- **Complete Translation** - All UI elements translated

#### 📱 Responsive Design
- **Mobile-First** - Optimized for mobile devices
- **Responsive Layout** - Adapts to all screen sizes
- **Touch-Friendly** - Large buttons and touch targets
- **Mobile Menu** - Hamburger menu for mobile navigation

### Community Features

#### 📝 Community Feed
- **Posts & Comments** - Share experiences and get support
- **Reactions** - Heart, support, helpful, inspire reactions
- **Media Support** - Upload images and videos
- **Tagging System** - Categorize posts with tags
- **Moderation** - Flag inappropriate content

#### 👥 Community Groups
- **Create Groups** - Form communities around specific topics
- **Group Posts** - Share within groups
- **Join/Leave** - Easy group management
- **Group Discovery** - Search and find relevant groups

#### 🎥 Reels
- **Short Videos** - Instagram-style vertical video feed
- **Video Upload** - Share short videos with the community
- **Engagement** - Like and comment on reels
- **Auto-Play** - Seamless video playback

#### 💬 Private Messaging
- **End-to-End Encryption** - Secure, private conversations
- **WhatsApp-Like Interface** - Familiar messaging experience
- **Real-Time Delivery** - Instant message delivery
- **Conversation Management** - Organize and search conversations

#### 🏥 Specialist Directory
- **Verified Specialists** - Search verified professionals
- **Specialty Filtering** - Find specialists by expertise
- **Location-Based** - Find specialists in your area
- **Language Support** - Filter by spoken languages
- **Direct Contact** - Request consultations

#### 📅 Consultations
- **Video Calls** - Book and conduct video consultations
- **Scheduling** - Manage appointment calendar
- **Specialist Profiles** - View credentials and availability

---

## 🛠 Tech Stack

### Frontend
- **React 18.3** - Modern UI library with hooks and context API
- **TypeScript 5.5** - Type-safe development with full type coverage
- **Vite 5.4** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework with custom theme support
- **Lucide React** - Beautiful, consistent icon library
- **Recharts 2.10** - Powerful charts and data visualization
- **jsPDF** - PDF generation for reports

### Backend & Database
- **Supabase** - PostgreSQL database with:
  - **Authentication** - JWT-based auth with email/password
  - **Row Level Security (RLS)** - Database-level access control
  - **Real-time Subscriptions** - Live updates for messages and notifications
  - **Storage** - File storage for videos, images, and avatars
  - **Edge Functions** - Serverless functions for complex operations

### AI & ML
- **FastAPI** - Python API server for AI analysis
- **Metrics-Based Analysis** - Heuristic algorithms for engagement/attention scoring
- **Optional Camera Support** - Can enhance analysis with video frames (optional)
- **Fallback System** - Always works even without AI server

### Security
- **libsodium-wrappers** - End-to-end encryption for private messages
- **JWT Tokens** - Secure authentication tokens
- **RLS Policies** - Database-level security policies
- **Input Validation** - Client and server-side validation
- **HTTPS Only** - All production deployments use HTTPS

### Development Tools
- **ESLint** - Code linting and quality
- **TypeScript Compiler** - Type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Supabase account** ([Sign up free](https://supabase.com))
- **Git** - For cloning the repository

### Installation

```bash
# Clone the repository
git clone https://github.com/chekerh/CogniCare.git
cd cognicare

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_AI_SERVER_URL=http://localhost:8000
EOF

# Set up database (see SETUP.md for detailed instructions)
# 1. Create Supabase project
# 2. Run migrations in SQL Editor:
#    - 20251008133549_create_core_schema.sql
#    - 20250102000000_phase2_schema.sql
#    - 20250115000000_update_ai_reports_schema.sql
# 3. Create storage buckets (reels, avatars, group-covers)

# Start development server
npm run dev
```

Visit `http://localhost:5173` 🎉

**📖 For complete setup instructions, see [SETUP.md](./SETUP.md) - This is your main guide!**

---

## 📁 Project Structure

```
cognicare/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication forms (Login, Signup)
│   │   ├── children/        # Child management (Add, List, Stats)
│   │   ├── dashboard/      # Progress dashboards (Overview, Statistics)
│   │   ├── directory/       # Specialist directory
│   │   ├── feed/            # Community feed (Posts, Comments)
│   │   ├── games/           # Games zone (Memory Game)
│   │   ├── groups/          # Community groups
│   │   ├── layout/          # Layout components (Header, MobileMenu)
│   │   ├── messaging/       # Private messaging (Inbox, Chat)
│   │   ├── reels/           # Short videos
│   │   └── common/          # Shared components (ThemeSwitcher, etc.)
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx      # Authentication state
│   │   ├── ThemeContext.tsx     # Theme management
│   │   ├── LanguageContext.tsx   # Language management
│   │   └── ToastContext.tsx     # Toast notifications
│   ├── lib/                 # Utilities & services
│   │   ├── ai.ts           # AI integration and metrics calculation
│   │   ├── auth.ts         # Authentication helpers
│   │   ├── encryption.ts   # E2E encryption
│   │   ├── supabase.ts     # Supabase client and types
│   │   ├── translations.ts # Translation dictionary
│   │   └── theme.ts        # Theme utilities
│   ├── index.css           # Global styles and theme variables
│   └── main.tsx            # Application entry point
├── supabase/
│   └── migrations/         # Database migrations
│       ├── 20251008133549_create_core_schema.sql
│       ├── 20250102000000_phase2_schema.sql
│       └── 20250115000000_update_ai_reports_schema.sql
├── ai/
│   └── server/             # FastAPI AI server (optional)
│       ├── main.py         # AI server entry point
│       ├── requirements.txt # Python dependencies
│       └── models/         # AI model files (gitignored)
├── scripts/                # Utility scripts
│   ├── fix-user-profile.sql    # Fix user profile trigger
│   └── verify-setup.js         # Setup verification
├── .gitignore              # Git ignore rules
├── .gitattributes          # Line ending normalization
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── README.md               # This file
├── SETUP.md                # Complete setup guide
└── DATABASE_PROGRESSION_TRACKING.md # Database schema docs
```

---

## 🗄 Database Setup

Cognicare uses Supabase (PostgreSQL) with comprehensive Row Level Security.

### Quick Setup

1. **Create Supabase Project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Create new project
   - Save your credentials (URL and anon key)

2. **Run Migrations** (in order)
   - Go to SQL Editor in Supabase Dashboard
   - Run migrations:
     - `20251008133549_create_core_schema.sql` - Core tables
     - `20250102000000_phase2_schema.sql` - Phase 2 features
     - `20250115000000_update_ai_reports_schema.sql` - **Required for progression tracking**
   - Run `scripts/fix-user-profile.sql` - Fix user profile trigger

3. **Create Storage Buckets**
   - `reels` (public, 100MB limit)
   - `avatars` (public, 5MB limit)
   - `group-covers` (public, 10MB limit)

4. **Verify Setup**
   - Check that all tables exist in Table Editor
   - Verify `ai_reports` has: `attention_score`, `recommendations`, `emotion_distribution`
   - Verify `game_sessions` has: `metrics`, `video_frames`

**📖 Complete guide: [SETUP.md](./SETUP.md)**
**📊 Database schema: [DATABASE_PROGRESSION_TRACKING.md](./DATABASE_PROGRESSION_TRACKING.md)**

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking

# AI Server (optional)
npm run ai:setup     # Setup Kaggle credentials
npm run ai:train     # Train AI models
npm run ai:serve     # Start AI server (http://localhost:8000)

# Utilities
npm run verify       # Verify setup configuration
npm run test         # Run tests
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# AI Server (Optional - uses fallback if not set)
VITE_AI_SERVER_URL=http://localhost:8000
```

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Edit files in `src/`
   - Hot Module Replacement (HMR) will auto-reload

3. **Type Checking**
   ```bash
   npm run typecheck
   ```

4. **Linting**
   ```bash
   npm run lint
   ```

---

## 🤖 AI System

### How It Works

Cognicare uses a **metrics-based AI analysis system** that works entirely from game performance data - no camera or microphone required.

#### Analysis Process

1. **Game Play**
   - Child plays memory match game
   - System tracks: moves, reaction times, errors, duration

2. **Metrics Calculation**
   - **Accuracy**: `(correct pairs / total moves) × 100`
   - **Average Reaction Time**: Mean of all reaction times
   - **Error Rate**: Number of incorrect matches
   - **Completion Time**: Total duration

3. **AI Analysis** (Automatic)
   - **Engagement Score**: Calculated from accuracy, reaction time, error rate, completion time
   - **Attention Score**: Based on accuracy and consistency
   - **Insights**: Textual observations (e.g., "دقة ممتازة في اللعبة!")
   - **Recommendations**: Actionable suggestions (e.g., "تدريب إضافي على التركيز")

4. **Report Generation**
   - AI report automatically created after each session
   - Stored in `ai_reports` table
   - Linked to game session and child profile

#### Metrics Formulas

**Engagement Score (0-100)**:
```
engagement = (accuracy × 0.35) + 
             (reaction_time_score × 0.25) + 
             (completion_time_score × 0.20) + 
             (error_rate_score × 0.20)
```

**Attention Score (0-100)**:
```
attention = (accuracy × 0.7) + (consistency_score × 30)
```

#### Optional Camera Enhancement

If camera is enabled:
- Video frames can be analyzed for emotion detection
- Enhances engagement and attention scores
- Falls back to metrics-based analysis if camera fails

**📖 For more details: [DATABASE_PROGRESSION_TRACKING.md](./DATABASE_PROGRESSION_TRACKING.md)**

---

## 🚢 Deployment

### Recommended Stack

- **Frontend**: [Vercel](https://vercel.com) (recommended) or [Netlify](https://netlify.com)
- **AI Server**: [Railway](https://railway.app) or [Render](https://render.com) (optional)
- **Database**: Supabase (already cloud-hosted)

### Quick Deploy

#### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### AI Server (Railway) - Optional

```bash
# Install Railway CLI
npm i -g @railway/cli

# Initialize
cd ai/server
railway init

# Deploy
railway up
```

### Environment Variables

Set these in your deployment platform:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_AI_SERVER_URL` - AI server URL (optional)

**📖 Complete deployment guide: [SETUP.md](./SETUP.md#part-4-production-deployment)**

---

## 📚 Documentation

### Main Guides

- **[SETUP.md](./SETUP.md)** - Complete setup guide (start here!)
- **[DATABASE_PROGRESSION_TRACKING.md](./DATABASE_PROGRESSION_TRACKING.md)** - Database schema and progression tracking
- **[COMMIT_READY.md](./COMMIT_READY.md)** - Summary of recent changes

### Additional Resources

- **AI Training**: See `ai/server/GET_ACCURATE_MODEL.md` for AI model training
- **Database Schema**: See migration files in `supabase/migrations/`
- **Code Documentation**: Inline comments in source code

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code patterns
   - Add TypeScript types
   - Write meaningful commit messages
4. **Test your changes**
   - Run `npm run typecheck`
   - Run `npm run lint`
   - Test manually in browser
5. **Commit and push**
   ```bash
   git commit -m "feat: add amazing feature"
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Code Style

- Use **TypeScript** for all new code
- Follow **existing code patterns**
- Add **comments** for complex logic
- Use **meaningful variable names**
- Write **descriptive commit messages**
- Test **thoroughly** before submitting

### Commit Message Format

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

---

## 📊 Database Schema

### Core Tables

- `users` - User accounts and profiles
- `children` - Child profiles
- `posts` - Community feed posts
- `comments` - Post comments
- `reactions` - Post reactions
- `specialists` - Specialist profiles
- `game_sessions` - Game play sessions with metrics
- `ai_reports` - AI analysis reports with engagement/attention scores

### Phase 2 Tables

- `conversations` - Private messaging conversations
- `messages` - Encrypted messages
- `groups` - Community groups
- `group_posts` - Group posts
- `reels` - Short videos
- `consultations` - Video consultations
- `notifications` - Push notifications

### Key Fields for Progression Tracking

**`game_sessions.metrics`** (jsonb):
```json
{
  "moves": 8,
  "pairs": 4,
  "reaction_times": [1200, 1500, 1100],
  "avg_reaction_time": 1350,
  "completion_time": 120
}
```

**`ai_reports`**:
- `engagement_score` (0-100)
- `attention_score` (0-100)
- `insights` (text)
- `recommendations` (jsonb array)

All tables have **Row Level Security (RLS)** enabled for data protection.

---

## 🔒 Security

- **End-to-End Encryption** - Private messages encrypted with libsodium
- **Row Level Security** - Database-level access control policies
- **JWT Authentication** - Secure token-based authentication
- **Environment Variables** - All secrets in `.env` (never committed)
- **HTTPS Only** - All production deployments use HTTPS
- **Input Validation** - Client and server-side validation
- **SQL Injection Protection** - Parameterized queries via Supabase
- **XSS Protection** - React's built-in XSS protection

---

## 🌍 Internationalization

Cognicare supports three languages with full RTL support:

- **Arabic (العربية)** - Primary language with RTL layout
- **French (Français)** - Secondary language
- **English** - Technical documentation and fallback

### Language Features

- **Complete Translation** - All UI elements translated
- **RTL Support** - Proper right-to-left layout for Arabic
- **Language Persistence** - Preferences saved in localStorage and user profile
- **Dynamic Switching** - Change language without page reload
- **Context-Aware** - Language context available throughout the app

---

## 📈 Roadmap

### Phase 3 (Planned)
- [ ] Mobile app (React Native)
- [ ] Advanced video analysis with ML models
- [ ] Eye tracking integration
- [ ] Comprehensive training programs
- [ ] Nutrition planning system
- [ ] Medication reminders

### Phase 4 (Future)
- [ ] Multi-language expansion (Spanish, Italian)
- [ ] International deployment
- [ ] Advanced AI models (trained on real data)
- [ ] Integration with health systems
- [ ] Telemedicine features
- [ ] Parent support groups

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
- React and TypeScript communities

---

## ⭐ Star History

If you find this project helpful, please consider giving it a star ⭐

---

<div align="center">

**Made with ❤️ for supporting children with special needs and their families**

[⬆ Back to Top](#-cognicare---منصة-دعم-شاملة-للأطفال-ذوي-الاحتياجات-الخاصة)

</div>
