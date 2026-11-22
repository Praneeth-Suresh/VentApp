# Deployment Notes

This documents the original prototype configuration. Use a disposable Firebase project and fictional feedback. A deployment is not evidence of production readiness.

## Pre-Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Firestore database initialized with security rules
- [ ] Service account key created
- [ ] All environment variables added to Vercel
- [ ] API key generated (use crypto.randomBytes or similar)
- [ ] Cron secret configured
- [ ] vercel.json deployed with cron configuration

## Deployment Steps

### 1. Local Testing
```bash
pnpm install --frozen-lockfile
pnpm build
```

### 2. GitHub Push
```bash
git add .
git commit -m "Initial MVP deployment"
git push origin main
```

### 3. Vercel Deployment

**First Time:**
1. Go to https://vercel.com/new
2. Import GitHub repository
3. Add environment variables:
   - All NEXT_PUBLIC_FIREBASE_* variables
   - ADMIN_API_KEY
   - FIREBASE_CREDS_JSON
   - CRON_SECRET
4. Deploy

**Subsequent Deployments:**
- Automatic via GitHub integration
- Cron jobs automatically configured from vercel.json

### 4. Verify Deployment
1. Test home page: https://your-app.vercel.app
2. Submit test feedback
3. Verify submission count updates
4. Test tracker page with ID
5. Test moderator dashboard: https://your-app.vercel.app/moderator
6. Test admin dashboard: https://your-app.vercel.app/admin

## Production Considerations

### Security
- Rotate ADMIN_API_KEY monthly
- Monitor Firestore for unusual activity
- Set up alerts for high submission volumes
- Review flagged submissions regularly

### Monitoring
- Enable Vercel Analytics
- Set up Firestore monitoring
- Track API response times
- Monitor cron job execution

### Maintenance
- Regular database backups (Firestore auto-backups)
- Review and update analytics algorithm
- Archive old submissions (optional)
- Update moderation guidelines

## Troubleshooting

### Submissions not appearing
- Check Firestore is initialized
- Verify security rules allow reads
- Check browser console for errors
- Verify Firebase config

### Moderator/Admin dashboard not loading
- Verify API key is correct
- Check authorization header format: `Bearer <key>`
- Verify Firestore has data

### Cron job not running
- Check vercel.json exists in root
- Verify cron URL is correct
- Check Vercel logs in dashboard
- Test manually: curl your-app.vercel.app/api/cron/daily-analytics
