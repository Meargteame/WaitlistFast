# Quick Test Guide - MVP Features

## Start the App

```bash
npm run dev:all
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

---

## Test 1: Export Functionality (2 minutes)

1. Login: demo@waitlistfast.com / demo123
2. Click on any waitlist
3. Click "Analytics"
4. Scroll to "Email Signups" section
5. Click "Export CSV" → File downloads
6. Click "Export JSON" → File downloads
7. Open both files to verify data

**Expected**:
- CSV has headers: Email, Position, Joined Date, Joined Time, Referral Code
- JSON has structured data with metadata
- Filenames include timestamp

---

## Test 2: Advanced Analytics (3 minutes)

1. From Analytics page, scroll up
2. See 3 stat cards (Views, Signups, Conversion Rate)
3. Scroll down to "Signups Over Time" chart
4. Hover over chart points → See tooltips
5. Scroll to "Traffic Sources" section
6. See pie chart and breakdown table

**Expected**:
- Line chart shows views and signups over time
- Pie chart shows traffic source distribution
- Table lists sources with counts
- Charts are responsive

---

## Test 3: Email Campaigns (5 minutes)

### Send Campaign
1. From Analytics page, click "Email Campaigns"
2. Click "New Campaign"
3. Enter subject: "Test Campaign"
4. Enter message: "This is a test message"
5. See recipient count
6. Click "Send Campaign"
7. Wait for "Sending..." → "Sent"

**Expected**:
- Composer shows character counter
- Recipient count is accurate
- Campaign sends successfully
- Redirects to history

### View History
1. See campaign in "Campaign History"
2. Check subject, date, time
3. Check delivery stats (Delivered, Failed, Total)
4. Status badge shows "sent"

**Expected**:
- Campaign appears in history
- Stats are accurate
- Timestamp is correct

---

## Test 4: Error Handling (2 minutes)

### Test Empty Campaign
1. Click "New Campaign"
2. Leave subject empty
3. Click "Send Campaign"
4. See error: "Subject and message are required"

### Test No Signups
1. Create new waitlist with 0 signups
2. Go to Email Campaigns
3. Try to send campaign
4. See error: "No signups to send to"

**Expected**:
- Errors display in modal
- User-friendly messages
- Can close error modal

---

## Test 5: Navigation (1 minute)

1. Dashboard → Analytics → Email Campaigns
2. Email Campaigns → Analytics → Dashboard
3. All navigation works smoothly

**Expected**:
- No broken links
- Smooth transitions
- Correct page loads

---

## Test 6: Responsive Design (2 minutes)

1. Open Analytics page
2. Resize browser to mobile width (375px)
3. Check charts render correctly
4. Open Email Campaigns page
5. Check composer is usable on mobile

**Expected**:
- Charts scale to fit
- Buttons are tappable
- Text is readable
- No horizontal scroll

---

## Quick Verification Checklist

- [ ] CSV export works
- [ ] JSON export works
- [ ] Time-series chart displays
- [ ] Traffic sources chart displays
- [ ] Can compose campaign
- [ ] Can send campaign
- [ ] Campaign appears in history
- [ ] Error handling works
- [ ] Navigation works
- [ ] Mobile responsive

---

## Common Issues

### Charts Not Showing
**Cause**: No analytics data
**Fix**: Visit waitlist page to generate views, add signups

### Campaign Not Sending
**Cause**: No RESEND_API_KEY in .env.local
**Fix**: Check server logs, emails are logged if no API key

### Export Empty
**Cause**: No signups
**Fix**: Add signups to waitlist first

---

## Production Checklist

Before deploying:

1. [ ] Configure Stripe (see STRIPE_SETUP.md)
2. [ ] Add RESEND_API_KEY to production env
3. [ ] Test all features in production
4. [ ] Setup error monitoring (Sentry)
5. [ ] Setup uptime monitoring
6. [ ] Configure CDN for static assets
7. [ ] Enable HTTPS
8. [ ] Test email deliverability
9. [ ] Verify analytics tracking
10. [ ] Test payment flow

---

## Performance Benchmarks

### Expected Load Times
- Dashboard: <1s
- Analytics: <1.5s
- Email Campaigns: <1s
- Chart rendering: <500ms
- Export generation: <200ms

### Email Sending
- Single email: ~100-200ms
- 100 emails: ~10-20s
- 1000 emails: ~2-3min

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check server logs (terminal running dev:server)
3. Verify database has data (check waitlist.db)
4. Check environment variables (.env.local)
5. Restart servers (Ctrl+C, npm run dev:all)

---

## Next Steps

After testing:

1. ✅ All features work → Deploy to production
2. ⚠️ Some issues → Fix and retest
3. 🎉 Production deployed → Start marketing!

**You're ready to launch! 🚀**
