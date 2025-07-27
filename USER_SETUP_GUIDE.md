# AI Copywriter - User Setup Guide

## For New Users

### Quick Start (Option 1: Demo Login)
1. Go to the login page
2. Click "Quick Demo Login" button
3. This uses: `test@jonesroad.com` / `password123`
4. You'll have team member access to test the app

### Creating Your Own Account (Option 2: Register)
1. Go to `/register` 
2. Enter your email and a secure password (6+ chars, letters + numbers)
3. Click "Create Account"
4. You'll be automatically logged in with team member access

### Account Types
- **Team Member**: Can generate ad copy and landing pages
- **Admin**: Full access including user management, AI training, review analytics

## For Admins

### User Management
- Go to `/users` to see all registered users
- Create new accounts with specific roles
- Update user permissions as needed

### Current Test Accounts
- `cody@jonesroadbeauty.com` (admin) - Original admin account
- `test@jonesroad.com` (team member) - Demo account  
- `sarah@jonesroad.com` (team member) - Test account

## Authentication Status: ✅ READY

The authentication system is fully functional:
- Registration and login work correctly
- Sessions persist across page refreshes
- Role-based access control is implemented
- Password hashing with bcrypt security

## Ready for Production Deployment

The app is now ready for multiple users to access safely.