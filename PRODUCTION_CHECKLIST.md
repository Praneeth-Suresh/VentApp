# Production Deployment Checklist

## Pre-Deployment (1 Week Before)

### Infrastructure
- [ ] Firebase project created and verified
- [ ] Firestore database created (production mode)
- [ ] Backups enabled in Firestore
- [ ] Service account key generated
- [ ] API key generated (strong: >32 characters)
- [ ] Cron secret generated
- [ ] All environment variables documented

### Code Quality
- [ ] All tests passing locally
- [ ] Code reviewed
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured

### Security
- [ ] Security rules deployed to Firestore
- [ ] API key rotation strategy documented
- [ ] Data encryption at rest verified
- [ ] HTTPS enforced
- [ ] Environment variables not in code
- [ ] API key not exposed in client code

### Documentation
- [ ] README.md complete
- [ ] ENV_SETUP.md updated
- [ ] DEPLOYMENT.md reviewed
- [ ] TESTING_GUIDE.md completed
- [ ] API endpoints documented
- [ ] Database schema documented

## Deployment Day

### Pre-Deployment (2 Hours Before)
- [ ] Notify stakeholders
- [ ] Create backup of Firestore
- [ ] Final testing in development
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Review changelog

### Deployment (Vercel)
- [ ] All environment variables added to Vercel
- [ ] vercel.json validated and committed
- [ ] GitHub integration verified
- [ ] Manual or automatic deployment triggered
- [ ] Build completes successfully
- [ ] No errors in deployment logs

### Post-Deployment Verification (1 Hour)
- [ ] Homepage loads correctly
- [ ] Submission form works
- [ ] Counter updates
- [ ] Tracker page functional
- [ ] Moderator dashboard accessible
- [ ] Admin dashboard accessible
- [ ] API endpoints responding correctly
- [ ] No JavaScript errors in console
- [ ] Analytics cron job visible in Vercel

### Monitoring Setup (First Day)
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Database monitoring active
- [ ] Alerts configured for:
  - High error rate (>1%)
  - High latency (>1s)
  - Firestore quota exceeded
  - Cron job failure

## Post-Deployment (First Week)

### Daily Monitoring
- [ ] Check error logs daily
- [ ] Verify submissions are being received
- [ ] Monitor API response times
- [ ] Check Firestore usage
- [ ] Verify cron job runs at 12:00 UTC

### Weekly Tasks
- [ ] Review analytics quality
- [ ] Check moderation queue
- [ ] Monitor user feedback
- [ ] Review security logs
- [ ] Test disaster recovery

### Incident Response
- [ ] Have on-call rotation setup
- [ ] Document incident procedures
- [ ] Have rollback plan ready
- [ ] Have downtime communication template

## Optimization (After 1 Month)

### Performance Optimization
- [ ] Analyze slow queries
- [ ] Add Firestore indexes if needed
- [ ] Optimize API response times
- [ ] Cache frequently accessed data
- [ ] Optimize database queries

### Cost Optimization
- [ ] Review Firestore charges
- [ ] Review Vercel usage
- [ ] Optimize data storage
- [ ] Clean up old analytics
- [ ] Archive old submissions if needed

### Feature Enhancements
- [ ] Gather user feedback
- [ ] Implement improvement requests
- [ ] Add new moderation rules
- [ ] Enhance analytics
- [ ] Improve UX

## Disaster Recovery Plan

### Backup & Recovery
- [ ] Firestore backups enabled
- [ ] Backup tested monthly
- [ ] Recovery RTO: 1 hour
- [ ] Recovery RPO: 1 day

### Rollback Procedure
1. Revert to previous version in Vercel
2. Verify deployment succeeded
3. Test all functionality
4. Monitor for 24 hours

### Communication Plan
1. Identify issue and severity
2. Notify stakeholders
3. Update status page (if available)
4. Implement fix or rollback
5. Post-mortem analysis

## 30-Day Review Checklist

- [ ] All systems operational
- [ ] Performance metrics acceptable
- [ ] Security audit passed
- [ ] Analytics working correctly
- [ ] Moderation queue manageable
- [ ] User feedback positive
- [ ] No major bugs reported
- [ ] Documentation up to date

## Sign-Off

**Project**: NUS Anonymous Feedback MVP  
**Version**: 1.0.0  
**Deployment Date**: _________  
**Deployed By**: _________  
**Verified By**: _________  

**Production Ready**: ☐ YES ☐ NO

**Issues/Notes**:
_________________________________
_________________________________

**Sign-Off**: _________________ Date: _______
