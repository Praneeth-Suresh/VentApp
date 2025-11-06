# Testing Guide for NUS Anonymous Feedback MVP

## Pre-Deployment Testing Checklist

### 1. Firebase & Environment Setup
- [ ] Firebase project created
- [ ] Firestore database initialized
- [ ] Service account key generated
- [ ] All environment variables added to .env.local
- [ ] Security rules deployed to Firestore
- [ ] API key generated (strong, random)

### 2. Local Development Testing

#### Homepage Tests
\`\`\`
Test 1: Submit Feedback
- Navigate to http://localhost:3000
- Enter feedback in form
- Click "Submit"
- Expected: ID displayed, counter increments

Test 2: View Submission Count
- Note initial count
- Submit feedback
- Expected: Counter updates

Test 3: Neon Green Theme
- Expected: Neon green (#CCFF00) background
- Expected: Black text on neon background
- Expected: Disclaimer section visible
- Expected: "Track Your Feedback" button visible
\`\`\`

#### Query Tracker Tests
\`\`\`
Test 4: Track Feedback
- Click "Track Your Feedback" on homepage
- Enter submission ID from Test 1
- Click "Search"
- Expected: Submission details displayed
- Expected: Status shows "pending"

Test 5: Invalid Query
- Enter fake ID
- Expected: Error message "Feedback not found"

Test 6: Status Updates
- Track submission after flagging/approving
- Expected: Status updates reflect changes
\`\`\`

#### Moderator Dashboard Tests
\`\`\`
Test 7: Moderator Login
- Navigate to http://localhost:3000/moderator
- Enter admin API key
- Expected: Dashboard loads with pending submissions

Test 8: Flag Submission
- Click "Flag for Removal" on a submission
- Expected: Submission removed from queue

Test 9: Approve Submission
- Click "Approve" on a submission
- Expected: Submission removed from queue
- Expected: Status changes to "approved"

Test 10: Moderator Refresh
- Click "Refresh"
- Expected: New submissions load

Test 11: Moderator Logout
- Click "Logout"
- Expected: Return to login screen
\`\`\`

#### Admin Dashboard Tests
\`\`\`
Test 12: Admin Login
- Navigate to http://localhost:3000/admin
- Enter admin API key (same as moderator)
- Expected: Dashboard loads with analytics

Test 13: View Analytics
- Expected: See metrics cards:
  - Total Submissions
  - Average Relevance
  - Average Sentiment
  - Flagged Count

Test 14: Add Comment
- Click "Show Analysis" on a submission
- Enter comment in textarea
- Click "Save Comment"
- Expected: Comment saves successfully

Test 15: Admin Refresh
- Click "Refresh"
- Expected: Latest data loads

Test 16: Admin Logout
- Click "Logout"
- Expected: Return to login screen
\`\`\`

### 3. API Testing

\`\`\`bash
# Run the test suite
npm test

# Manual API tests with curl

# Test 1: Submit Feedback
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"content": "Test feedback"}' \
  | jq .

# Test 2: Get Count
curl http://localhost:3000/api/submissions/count | jq .

# Test 3: Get Submission
# Replace {id} with submission ID from Test 1
curl http://localhost:3000/api/submissions/{id} | jq .

# Test 4: Flag Submission (Unauthorized - should fail)
curl -X PATCH http://localhost:3000/api/submissions/{id}/flag

# Test 5: Flag Submission (Authorized)
curl -X PATCH http://localhost:3000/api/submissions/{id}/flag \
  -H "Authorization: Bearer your-admin-api-key"

# Test 6: Get Analytics (with auth)
curl http://localhost:3000/api/admin/analytics \
  -H "Authorization: Bearer your-admin-api-key" | jq .
\`\`\`

### 4. Load Testing

\`\`\`bash
# Test with Apache Bench (simulates ~100 submissions/day)

# Install ab (comes with Apache)
# macOS: brew install httpd

# Simulate 100 submissions
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/submissions \
    -H "Content-Type: application/json" \
    -d '{"content": "Test feedback '$i'"}' &
done
wait

# Check counter incremented to 100+
curl http://localhost:3000/api/submissions/count
\`\`\`

### 5. Performance Testing

\`\`\`
Load Test Results Target:
- Page load: <2 seconds
- API response: <500ms
- Submission creation: <300ms
- Query tracking: <300ms
- Analytics loading: <500ms
\`\`\`

### 6. Security Testing

\`\`\`
Test 1: API Key Validation
- Try invalid key: Should return 401
- Try missing auth: Should return 401
- Try valid key: Should work

Test 2: XSS Prevention
- Submit feedback with: <script>alert('xss')</script>
- Expected: Rendered as text, not executed

Test 3: SQL Injection
- Submit: '; DROP TABLE submissions; --
- Expected: Treated as normal text

Test 4: CSRF Protection
- All state-changing requests require API key
- Cross-origin requests properly validated
\`\`\`

### 7. Browser Compatibility

Test in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Chrome (Android)

### 8. Firestore Testing

\`\`\`javascript
// In Firebase Console, verify:
1. Submissions collection exists
2. Security rules are deployed
3. Data structure matches schema
4. Indexes created if needed
5. Backup is enabled
\`\`\`

## Production Testing Checklist

### Pre-Deployment (Vercel)
- [ ] All tests pass locally
- [ ] Environment variables set in Vercel
- [ ] vercel.json committed and pushed
- [ ] GitHub integration enabled
- [ ] Build succeeds
- [ ] Preview deployment tested

### Post-Deployment
- [ ] Home page loads (https://your-domain)
- [ ] Submit feedback works
- [ ] Counter updates
- [ ] Tracker page works
- [ ] Query works with real ID
- [ ] Moderator dashboard accessible
- [ ] Admin dashboard accessible
- [ ] API endpoints respond correctly
- [ ] Cron job scheduled (check Vercel dashboard)

### Production Verification

\`\`\`bash
# Test live site
curl https://your-domain/api/submissions/count
curl -X POST https://your-domain/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"content": "Production test"}'

# Verify cron job
# Check Vercel dashboard > Functions > Logs
# Look for successful /api/cron/daily-analytics calls
\`\`\`

## Monitoring Checklist

### Daily
- [ ] Check Firestore quota usage
- [ ] Review Vercel function errors
- [ ] Verify cron job ran successfully

### Weekly
- [ ] Review moderation queue
- [ ] Check analytics trends
- [ ] Monitor API response times

### Monthly
- [ ] Rotate API key
- [ ] Review security logs
- [ ] Backup Firestore export
- [ ] Update monitoring thresholds

## Troubleshooting

### Issue: "Firebase not initialized"
**Solution**: Check NEXT_PUBLIC_FIREBASE_* variables in .env.local

### Issue: "Unauthorized" when accessing moderator/admin
**Solution**: Verify ADMIN_API_KEY matches in .env.local

### Issue: Submissions not appearing
**Solution**: 
- Check Firestore collection exists
- Verify security rules allow writes
- Check browser console for errors

### Issue: Cron job not running
**Solution**:
- Verify vercel.json exists in root
- Check Vercel logs
- Test endpoint: curl https://your-domain/api/cron/daily-analytics

### Issue: Performance degradation
**Solution**:
- Check Firestore usage
- Add indexes if recommended
- Review API logs for slow queries

## Sign-Off Template

Use this to sign off on testing completion:

\`\`\`
Testing Completed: [DATE]
Tester: [NAME]
Environment: [local/staging/production]

All Tests Passed: [YES/NO]

Critical Issues: [NONE / LIST]
Minor Issues: [NONE / LIST]

Performance: [ACCEPTABLE / NEEDS IMPROVEMENT]
Security: [PASS / NEEDS REVIEW]
Functionality: [COMPLETE / INCOMPLETE]

Ready for Deployment: [YES/NO]

Signed: _________________
\`\`\`

## Performance Benchmarks

Expected performance for ~100 submissions/day:

| Metric | Target | Actual |
|--------|--------|--------|
| Homepage Load | <2s | __ |
| Submit Feedback | <300ms | __ |
| Query Tracker | <300ms | __ |
| Moderator Queue Load | <500ms | __ |
| Admin Analytics | <500ms | __ |
| API Success Rate | >99.9% | __ |
| Firestore Latency | <50ms | __ |

---

**Last Updated**: November 2025
**Version**: 1.0.0 MVP
