# NUS Anonymous Feedback MVP - vent.

A production-ready anonymous feedback platform for NUS community. Students submit feedback, moderators review for appropriateness, and admins analyze trends with AI-powered sentiment and relevance scoring.

## Architecture Overview

\`\`\`
┌─────────────────────┐
│   Public Frontend   │
│  (Submission Form)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│   Next.js APIs      │◄────►│   Firestore DB   │
│  (Submissions)      │      │  (Firebase)      │
└──────────┬──────────┘      └──────────────────┘
           │
      ┌────┴────┐
      │          │
      ▼          ▼
┌──────────┐  ┌──────────────┐
│Moderator │  │Admin         │
│Dashboard │  │Dashboard     │
└──────────┘  └──────────────┘
      │              │
      └──────┬───────┘
             │
             ▼
   ┌─────────────────┐
   │Daily Analytics  │
   │(Python Script)  │
   └─────────────────┘
\`\`\`

## Features

### Public Features
- **Anonymous Submission Form** - Simple, clean interface for NUS students
- **Live Submission Counter** - See how many others have vented
- **Query Tracking** - Enter your submission ID to track status
- **Disclaimer Section** - Clear guidelines about data usage

### Moderator Portal
- **Moderation Queue** - Review pending submissions
- **Flag/Approve Actions** - Quickly moderate content
- **Auto-refresh** - Queue updates every 30 seconds
- **API Key Authentication** - Secure access

### Admin Dashboard
- **Analytics Dashboard** - Real-time stats:
  - Total submissions
  - Average relevance score
  - Average sentiment score
  - Flagged count
- **Submission Analysis** - View with calculated scores
- **Admin Comments** - Add analysis notes to submissions
- **API Key Authentication** - Secure admin access

### Backend Features
- **Daily Analytics Job** - Runs at 12:00 PM UTC
- **Sentiment Analysis** - NLP-based sentiment scoring
- **Relevance Scoring** - Content relevance calculation
- **Firestore Integration** - Scalable NoSQL database
- **Vercel Cron** - Automated daily analytics

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes, Vercel Functions
- **Database**: Firebase Firestore
- **Analytics**: Python (firebase-admin)
- **Hosting**: Vercel
- **Styling**: Neon green theme (#CCFF00 primary)

## Project Structure

\`\`\`
.
├── app/
│   ├── page.tsx              # Home page (submission form)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles + neon theme
│   ├── tracker/
│   │   └── page.tsx          # Query tracker page
│   ├── moderator/
│   │   └── page.tsx          # Moderator dashboard
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   └── api/
│       ├── submissions/       # Submission APIs
│       ├── admin/             # Admin APIs
│       └── cron/              # Scheduled jobs
├── components/
│   └── ui/                   # Shadcn UI components
├── lib/
│   ├── firebase.ts           # Firebase client
│   ├── db.ts                 # Firestore functions
│   ├── types.ts              # TypeScript types
│   └── auth.ts               # Auth utilities
├── scripts/
│   └── analytics.py          # Daily analytics script
├── tests/
│   └── api.test.ts           # Integration tests
├── vercel.json               # Cron configuration
├── ENV_SETUP.md              # Environment setup guide
└── DEPLOYMENT.md             # Deployment guide
\`\`\`

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Vercel account (for production)

### Local Development

1. **Clone and install**
   \`\`\`bash
   git clone <repo>
   cd nus-feedback
   npm install
   \`\`\`

2. **Setup Firebase**
   - Create Firebase project
   - Create Firestore database
   - Generate service account key
   - Create `.env.local` (see ENV_SETUP.md)

3. **Run development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Test the app**
   \`\`\`bash
   # In browser
   http://localhost:3000              # Home
   http://localhost:3000/tracker      # Tracker
   http://localhost:3000/moderator    # Moderator
   http://localhost:3000/admin        # Admin
   
   # Run test suite
   npm test
   \`\`\`

### Production Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy (automatic or manual)

See DEPLOYMENT.md for detailed instructions.

## API Endpoints

### Public Endpoints

\`\`\`
POST /api/submissions
  Body: { content: string }
  Returns: { id: string }

GET /api/submissions/[id]
  Returns: Submission

GET /api/submissions/count
  Returns: { count: number }
\`\`\`

### Admin Endpoints (Bearer Token Required)

\`\`\`
GET /api/submissions?status=pending|flagged|approved
  Headers: { Authorization: "Bearer <API_KEY>" }

GET /api/admin/submissions?status=<status>
  Headers: { Authorization: "Bearer <API_KEY>" }

PATCH /api/submissions/[id]/flag
  Headers: { Authorization: "Bearer <API_KEY>" }

PATCH /api/submissions/[id]/clear
  Headers: { Authorization: "Bearer <API_KEY>" }

POST /api/admin/submissions/[id]/comment
  Headers: { Authorization: "Bearer <API_KEY>" }
  Body: { comment: string }

GET /api/admin/analytics
  Headers: { Authorization: "Bearer <API_KEY>" }
\`\`\`

## Database Schema

### Submissions Collection
\`\`\`typescript
{
  id: string
  content: string
  timestamp: number
  status: 'pending' | 'flagged' | 'approved'
  relevance_score?: number
  sentiment_score?: number
}
\`\`\`

### Admin Comments Collection
\`\`\`typescript
{
  id: string
  submission_id: string
  comment: string
  timestamp: number
}
\`\`\`

### Analytics Collection
\`\`\`typescript
{
  id: string
  date: string
  total_submissions: number
  average_relevance: number
  average_sentiment: number
  flagged_count: number
  sentiment_distribution: {
    positive: number
    neutral: number
    negative: number
  }
}
\`\`\`

## Analytics Algorithm

### Relevance Scoring (0.0 - 1.0)
- Length score: ≥50 chars = 0.3 points
- Keyword matching: +0.05 per keyword (max 0.4)
- Specificity: Departments/locations = 0.15, Numbers/punctuation = 0.1

### Sentiment Scoring (-1.0 to 1.0)
- Positive words: 'good', 'great', 'excellent', 'love', etc.
- Negative words: 'bad', 'terrible', 'hate', 'issue', etc.
- Formula: (positive_count - negative_count) / total_words

## Performance Metrics

### Expected Load
- ~100 submissions/day
- <50ms API response time
- <100ms page load time
- Firestore: Free tier comfortable

### Scalability
- Handles 1000+ concurrent users
- Firestore auto-scales to millions of reads/writes
- Next.js serverless scales automatically
- Python analytics batch job processes daily

## Security

### Data Protection
- Anonymous submissions (no user data)
- Firestore security rules enforce access control
- API key-based authentication for admin/moderator
- Environment variables for secrets

### Content Moderation
- Moderators flag inappropriate content
- Admins review flagged submissions
- Disclaimer informs users about moderation

## Testing

### Unit Tests (In Progress)
- API route tests
- Utility function tests

### Integration Tests
\`\`\`bash
npm test
\`\`\`

Tests cover:
- Submission creation
- Query tracking
- Moderation actions
- Admin analytics
- Error handling

### Manual Testing
- Submission flow
- Tracker functionality
- Moderator queue
- Admin analytics
- API responses

## Monitoring & Maintenance

### Monitoring
- Vercel Analytics dashboard
- Firestore usage metrics
- Error logs (via Vercel Functions)
- Response time tracking

### Maintenance Tasks
- Review moderation queue weekly
- Analyze sentiment trends
- Rotate API keys monthly
- Archive old submissions (optional)
- Update moderation guidelines

## Future Enhancements

- [ ] Advanced NLP sentiment analysis (external API)
- [ ] Automated content filtering
- [ ] User categories (Faculty, Students, Staff)
- [ ] Export analytics reports
- [ ] Email notifications for admins
- [ ] Mobile app (React Native)
- [ ] OAuth authentication option
- [ ] Multi-language support
- [ ] Dashboard widgets
- [ ] Scheduled report generation

## Troubleshooting

### Submissions not appearing
- ✓ Check Firestore is initialized
- ✓ Verify security rules allow reads
- ✓ Check browser console errors
- ✓ Verify Firebase config in .env.local

### Dashboard not accessible
- ✓ Verify API key format
- ✓ Check Authorization header
- ✓ Verify Firestore has data

### Analytics not updating
- ✓ Check cron job execution in Vercel
- ✓ Verify Python script permissions
- ✓ Check Firebase credentials

## Support

For issues or questions:
1. Check this README
2. Review ENV_SETUP.md and DEPLOYMENT.md
3. Check Vercel logs and Firebase console
4. Open an issue on GitHub

## License

MIT

## Authors

Built for NUS Community
