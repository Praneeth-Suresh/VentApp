# NUS Anonymous Feedback MVP - Quick Start Guide

Get the application running in under 5 minutes!

## Prerequisites
- Node.js 18+ (download from nodejs.org)
- A Firebase account (free at firebase.google.com)
- 5 minutes of setup time

## Step 1: Clone & Install (1 min)

\`\`\`bash
git clone <repo-url> nus-feedback
cd nus-feedback
npm install
\`\`\`

## Step 2: Firebase Setup (2 min)

1. Go to https://console.firebase.google.com
2. Click "Create Project" → enter "NUS Feedback" → click "Create"
3. Once created, go to "Build" → "Firestore Database"
4. Click "Create Database" → Select "Start in test mode"
5. Go to "Project Settings" (gear icon) → "Service Accounts"
6. Click "Generate New Private Key" → Save the JSON file
7. Go back to "Project Settings" → "General"
8. Copy your config values (API Key, Auth Domain, Project ID, etc.)

## Step 3: Configure Environment (1 min)

Create `.env.local` in your project root:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=<copy from Project Settings>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>

ADMIN_API_KEY=dev-test-key-change-in-production
FIREBASE_CREDS_JSON=<paste entire service account JSON here>
CRON_SECRET=dev-cron-secret
\`\`\`

## Step 4: Run & Test (1 min)

\`\`\`bash
# Start development server
npm run dev

# In another terminal, run tests
npm test
\`\`\`

## Step 5: Access the App

- **Homepage**: http://localhost:3000
- **Tracker**: http://localhost:3000/tracker
- **Moderator**: http://localhost:3000/moderator (API key: `dev-test-key-change-in-production`)
- **Admin**: http://localhost:3000/admin (API key: `dev-test-key-change-in-production`)

## Manual Testing

1. **Submit feedback**: Enter text on homepage, click Submit
2. **Track feedback**: Copy ID, go to Tracker, search for ID
3. **Moderate**: Go to /moderator, flag or approve submissions
4. **View analytics**: Go to /admin, see submission metrics

## Deploy to Production (Vercel)

\`\`\`bash
# 1. Create GitHub repo and push code
git init && git add . && git commit -m "Initial commit"
# Push to GitHub...

# 2. Go to vercel.com → Import GitHub repository
# 3. Add environment variables from .env.local
# 4. Click Deploy
\`\`\`

## Troubleshooting

**"Cannot find Firebase config"**
→ Make sure `.env.local` exists with all NEXT_PUBLIC_* variables

**"API key invalid" on moderator/admin dashboard**
→ Use the API key from `.env.local`: `dev-test-key-change-in-production`

**"Firestore permission denied"**
→ Go to Firestore Rules tab, switch to "test mode"

**"Tests failing"**
→ Make sure dev server is running: `npm run dev`

## Next Steps

1. Review README.md for full documentation
2. Check ENV_SETUP.md for production configuration
3. Read TESTING_GUIDE.md before deploying
4. Follow DEPLOYMENT.md for Vercel deployment

## Need Help?

- Check README.md - comprehensive documentation
- Review DEPLOYMENT.md - step-by-step deployment guide
- Check Vercel logs - errors visible in dashboard
- Check Firebase console - data visible in Firestore

---

**You're all set!** Start submitting and moderating feedback. 🚀
