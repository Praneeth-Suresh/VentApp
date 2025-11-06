# NUS Anonymous Feedback MVP - Environment Setup

## Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database (test mode initially, then switch to production rules)
3. Create a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

4. Add these environment variables to your `.env.local`:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>

# Admin/Moderator API Key (use a strong, randomly generated key)
ADMIN_API_KEY=your-secure-random-api-key-here

# Firebase Credentials for Python Analytics Script (JSON as string)
FIREBASE_CREDS_JSON={"type":"service_account",...}

# Cron Security
CRON_SECRET=your-cron-secret-key
\`\`\`

## Firestore Security Rules

Set these in Firebase Console → Firestore → Rules:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for submission queries
    match /submissions/{document=**} {
      allow read;
      allow create;
      allow update, delete: if false;
    }

    // Admin comments - read only by admin
    match /admin_comments/{document=**} {
      allow read, write: if false;
    }

    // Analytics - read only by admin
    match /analytics/{document=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
\`\`\`

## Running the Application

### Development
\`\`\`bash
npm install
npm run dev
\`\`\`

### Production Deployment to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel Settings
4. Enable Cron Jobs in Vercel (vercel.json is already configured)
5. Deploy

## Python Analytics Script Setup

For daily analytics at 12:00 PM UTC:

### Local Testing
\`\`\`bash
pip install firebase-admin
export FIREBASE_CREDS_JSON='{"type":"service_account",...}'
python scripts/analytics.py
\`\`\`

### Production Setup
- The Vercel Cron will call `/api/cron/daily-analytics` at 12:00 PM UTC
- The API route should trigger your Python script via a webhook or external service
- Alternatively, deploy `scripts/analytics.py` as a separate Vercel Function

## Testing the Application

### Run API Tests
\`\`\`bash
npm test
\`\`\`

### Manual Testing Checklist

**User Submission:**
- [ ] Submit feedback on home page
- [ ] Verify ID is displayed
- [ ] Verify counter increments

**Query Tracking:**
- [ ] Navigate to tracker page
- [ ] Enter submission ID
- [ ] Verify correct status is shown

**Moderator Dashboard:**
- [ ] Login with API key
- [ ] See pending submissions
- [ ] Flag submission
- [ ] Approve submission
- [ ] Refresh loads new submissions

**Admin Dashboard:**
- [ ] Login with API key
- [ ] View analytics metrics
- [ ] View approved submissions
- [ ] Add comments to submissions

## Scaling Considerations

For ~100 submissions/day, this setup is production-ready:

- **Firestore**: Free tier handles ~50K writes/day
- **Analytics**: Daily batch job runs once at noon
- **API**: Serverless functions scale automatically
- **Storage**: Negligible costs at this volume

### Future Optimization
- Add Firestore indexes for query performance
- Implement caching for analytics data
- Add rate limiting for submissions
- Consider Firestore backups
