# vent. development environment

Use a disposable test project and fictional submissions only. Do not configure this prototype against a production database.

## Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database in your disposable project. Do not enable open test-mode rules.
3. Create a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

4. Add these environment variables to your `.env.local`:

```
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
```

## Firestore access

The prototype’s routes use the Firebase client SDK, and their ability to read and write depends on your project’s rules. Do not grant blanket access to make a demo work. A live pilot would need an explicit authorization design and tested, least-privilege rules before accepting real data.

## Running the Application

### Development
```bash
pnpm install --frozen-lockfile
pnpm dev
```

### Production Deployment to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel Settings
4. Enable Cron Jobs in Vercel (vercel.json is already configured)
5. Deploy

## Python Analytics Script Setup

For daily analytics at 12:00 PM UTC:

### Local Testing
```bash
pip install firebase-admin
export FIREBASE_CREDS_JSON='{"type":"service_account",...}'
python scripts/analytics.py
```

### Production Setup
- The Vercel Cron will call `/api/cron/daily-analytics` at 12:00 PM UTC
- The API route should trigger your Python script via a webhook or external service
- Alternatively, deploy `scripts/analytics.py` as a separate Vercel Function

## Testing the Application

### Test with a disposable Firebase project

The package does not define an `npm test` script. The API harness in `tests/api.test.ts` is a standalone integration script that sends write requests to a running app. Do not point it at a production instance or a project with real feedback. The [README walkthrough](README.md#what-to-try) is the simplest supported smoke check.

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

## Scaling considerations

Capacity and deployment costs have not been measured. Validate the actual workload and access model before planning a pilot.

### Future Optimization
- Add Firestore indexes for query performance
- Implement caching for analytics data
- Add rate limiting for submissions
- Consider Firestore backups
