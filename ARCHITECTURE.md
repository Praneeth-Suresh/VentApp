# NUS Anonymous Feedback MVP - Architecture & Design Decisions

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                       Internet / Users                        │
└──────────┬──────────────────────────────────────────────────┘
           │
     ┌─────▼─────┐
     │  Vercel   │ (Hosting & CDN)
     │  Edge     │
     └─────┬─────┘
           │
     ┌─────▼────────────────────────────────────────┐
     │        Next.js 15 App (Node Runtime)        │
     │  ┌────────────────────────────────────────┐  │
     │  │  Pages & Components (React 19)         │  │
     │  │  - Home (Submission)                   │  │
     │  │  - Tracker (Query)                     │  │
     │  │  - Moderator Dashboard                 │  │
     │  │  - Admin Dashboard                     │  │
     │  └────────────────────────────────────────┘  │
     │  ┌────────────────────────────────────────┐  │
     │  │  API Routes                            │  │
     │  │  - /api/submissions/*                  │  │
     │  │  - /api/admin/*                        │  │
     │  │  - /api/cron/daily-analytics           │  │
     │  └────────────────────────────────────────┘  │
     │  ┌────────────────────────────────────────┐  │
     │  │  Utilities                             │  │
     │  │  - lib/firebase.ts (SDK)               │  │
     │  │  - lib/db.ts (Firestore ops)           │  │
     │  │  - lib/auth.ts (API key validation)    │  │
     │  └────────────────────────────────────────┘  │
     └─────┬────────────────────────────────────────┘
           │
     ┌─────▼──────────────────┐
     │   Firebase Project     │
     │  ┌────────────────────┐│
     │  │ Firestore Database ││ (NoSQL - Free Tier: 1GB/day)
     │  │ ┌────────────────┐ ││
     │  │ │ submissions    │ ││ ~100-150 docs/day
     │  │ │ admin_comments │ ││ ~5-10 docs/day
     │  │ │ analytics      │ ││ 1 doc/day
     │  │ └────────────────┘ ││
     │  └────────────────────┘│
     │  ┌────────────────────┐│
     │  │ Security Rules     ││ (Enforce data access)
     │  └────────────────────┘│
     └────────┬───────────────┘
              │
     ┌────────▼──────────────┐
     │   Cron Job (Daily)    │ (12:00 UTC)
     │   - Trigger via API   │
     │   - Run Python script │
     │   - Store analytics   │
     └───────────────────────┘
\`\`\`

## Key Design Decisions

### 1. Database: Firestore (NoSQL) vs SQL
**Decision**: Firestore
**Rationale**:
- Schema flexibility for MVP rapid iteration
- Automatic scaling (100 submissions/day is trivial)
- Real-time capabilities for future features
- Firebase integration with Auth (future)
- Free tier generous for pilot phase
- No infrastructure management needed

### 2. Authentication: API Key vs OAuth
**Decision**: API Key (Bearer token)
**Rationale**:
- Simple implementation for MVP
- No external dependencies
- Stateless verification
- Easy rotation strategy
- Can migrate to OAuth later

### 3. Analytics: Python Script vs Real-time
**Decision**: Daily batch job (Python)
**Rationale**:
- Simple NLP algorithms (no external API needed)
- Runs once daily = minimal cost
- Decoupled from API (won't block requests)
- Can process all submissions in one pass
- Results can be cached/returned quickly

### 4. Frontend Architecture: Monolithic vs Separate
**Decision**: Monolithic Next.js (Frontend + Backend)
**Rationale**:
- Single deployment unit = simpler DevOps
- Faster development in MVP phase
- Can be separated later if needed
- Firestore handles data consistency
- Cost-effective at this scale

### 5. Styling: Tailwind v4 + Custom Theme
**Decision**: Custom CSS variables + Tailwind v4
**Rationale**:
- Neon green theme requires custom colors
- CSS variables allow theme consistency
- Tailwind utility classes for speed
- Dark mode support (future)
- No additional CSS framework overhead

## Data Flow

### Submission Flow
\`\`\`
User Input
   ↓
validate(length, content)
   ↓
POST /api/submissions
   ↓
Firestore.create(submissions)
   ↓
Return ID
   ↓
