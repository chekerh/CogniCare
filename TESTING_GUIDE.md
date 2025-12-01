# 🧪 Testing Guide

Complete guide for testing Cognicare before hosting.

## 🚀 Quick Test

Run the automated test script:

```bash
npm run test
```

This will test:
- ✅ Database connection
- ✅ All tables exist
- ✅ RLS policies
- ✅ Storage access
- ✅ Migrations applied

## 📋 Manual Testing Checklist

### 1. Authentication ✅
- [ ] **Sign Up**
  - Create new account
  - Select role (mother/specialist/volunteer)
  - Verify email validation
  - Verify password requirements
  - Check success toast notification

- [ ] **Login**
  - Login with valid credentials
  - Test invalid credentials
  - Check error messages
  - Verify session persistence

- [ ] **Logout**
  - Click logout button
  - Verify redirect to login
  - Check session cleared

### 2. Children Management ✅
- [ ] **Add Child**
  - Fill form with valid data
  - Test validation (age, name)
  - Submit and verify success
  - Check child appears in list

- [ ] **View Children**
  - List all children
  - Verify data display
  - Check empty state

- [ ] **Edit Child**
  - Update child information
  - Verify changes saved
  - Check success notification

### 3. Community Feed ✅
- [ ] **Create Post**
  - Write post content
  - Add tags
  - Submit post
  - Verify appears in feed

- [ ] **Interact with Posts**
  - Add reaction (heart, support, etc.)
  - Add comment
  - Verify real-time updates
  - Check reaction counts

### 4. Specialist Directory ✅
- [ ] **Browse Specialists**
  - View specialist list
  - Check verification badges
  - View specialist details

- [ ] **Search**
  - Search by name
  - Search by specialty
  - Search by location
  - Verify results

### 5. Games Zone ✅
- [ ] **Play Memory Game**
  - Select child
  - Start game
  - Complete game
  - Verify score saved
  - Check session recorded

- [ ] **AI Integration** (if camera enabled)
  - Enable camera
  - Play game
  - Verify frames captured
  - Check AI report generated

### 6. Private Messaging ✅
- [ ] **Generate Encryption Keys**
  - Click "إعداد التشفير" button
  - Generate keys
  - Verify success message

- [ ] **Start Conversation**
  - Create new conversation
  - Send message
  - Verify encryption
  - Check real-time delivery

- [ ] **Chat Features**
  - Send messages
  - Receive messages
  - Mark as read
  - Check unread count

### 7. Community Groups ✅
- [ ] **Create Group**
  - Fill group form
  - Set privacy (public/private)
  - Create group
  - Verify appears in list

- [ ] **Join Group**
  - Browse groups
  - Join public group
  - Verify membership

- [ ] **Group Posts**
  - Create post in group
  - Add reactions
  - Add comments
  - Verify real-time updates

### 8. Reels ✅
- [ ] **Upload Reel** (requires storage setup)
  - Select video file
  - Add caption
  - Set visibility
  - Upload
  - Verify in feed

- [ ] **View Reels**
  - Scroll through feed
  - Like reel
  - Add comment
  - Check view count

### 9. Progress Dashboard ✅
- [ ] **View Dashboard**
  - Select child
  - View charts
  - Check engagement metrics
  - View achievements

- [ ] **Export PDF**
  - Click export button
  - Verify PDF downloads
  - Check content

### 10. Consultations ✅
- [ ] **Book Consultation**
  - Select specialist
  - Choose date/time
  - Select child (optional)
  - Submit booking
  - Verify confirmation

- [ ] **Manage Consultations**
  - View bookings
  - Accept/decline (specialist)
  - Check status updates
  - View meeting URL

### 11. Notifications ✅
- [ ] **View Notifications**
  - Click bell icon
  - Check unread count
  - Mark as read
  - Verify updates

### 12. Admin Panel ✅
- [ ] **User Management** (admin only)
  - View users list
  - Suspend user
  - Approve specialist
  - Verify changes

- [ ] **Content Moderation**
  - View flagged content
  - Resolve flags
  - Remove content
  - Verify actions

### 13. Mobile Responsiveness ✅
- [ ] **Mobile Menu**
  - Open menu on mobile
  - Navigate between views
  - Close menu
  - Verify all links work

- [ ] **Responsive Layouts**
  - Test on mobile (375px)
  - Test on tablet (768px)
  - Test on desktop (1920px)
  - Verify no horizontal scroll

### 14. Error Handling ✅
- [ ] **Error Boundaries**
  - Trigger component error
  - Verify error boundary catches
  - Check error message
  - Test reload button

- [ ] **Network Errors**
  - Disconnect internet
  - Try to load data
  - Verify error message
  - Reconnect and retry

### 15. Performance ✅
- [ ] **Page Load**
  - Check initial load time
  - Verify < 3 seconds
  - Check bundle size

- [ ] **Navigation**
  - Switch between views
  - Verify smooth transitions
  - Check no lag

## 🔍 Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## 📱 Device Testing

Test on:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Desktop (Chrome/Firefox)

## 🐛 Common Issues to Check

### Database Issues
- [ ] Tables not found → Run migrations
- [ ] RLS errors → Check policies
- [ ] Connection errors → Check .env

### Storage Issues
- [ ] Upload fails → Check bucket exists
- [ ] Images not loading → Check policies
- [ ] File size errors → Check limits

### Authentication Issues
- [ ] Login fails → Check Supabase Auth
- [ ] Session expires → Check JWT settings
- [ ] Role not working → Check user table

### Real-time Issues
- [ ] Updates not appearing → Check subscriptions
- [ ] Multiple updates → Check channel cleanup

## ✅ Pre-Launch Checklist

### Code Quality
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All imports resolved

### Functionality
- [ ] All features work
- [ ] Forms validate
- [ ] Errors handled
- [ ] Loading states work

### Security
- [ ] No exposed secrets
- [ ] Input sanitized
- [ ] RLS policies active
- [ ] Encryption working

### Performance
- [ ] Fast page loads
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Optimized images

### UX
- [ ] Clear error messages
- [ ] Helpful empty states
- [ ] Loading indicators
- [ ] Success feedback

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

✅ Passed: ___
❌ Failed: ___
⏭️  Skipped: ___

Critical Issues:
1. 
2. 
3. 

Notes:
```

---

**Run `npm run test` for automated database tests!**

