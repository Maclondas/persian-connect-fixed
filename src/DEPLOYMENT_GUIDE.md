# 🚀 Persian Connect - Complete Deployment Guide

This guide will walk you through deploying Persian Connect to various platforms.

## 📋 Pre-Deployment Checklist

### ✅ Required Accounts & Services
- [ ] **GitHub account** (for code repository)
- [ ] **Supabase account** (for database & auth)
- [ ] **Stripe account** (for payments)
- [ ] **Vercel/Netlify account** (for hosting)

### ✅ Environment Setup
- [ ] Supabase project created
- [ ] Database schemas deployed
- [ ] Edge functions deployed
- [ ] Stripe webhook configured
- [ ] Environment variables ready

---

## 🔧 Step 1: Supabase Setup

### 1.1 Create Supabase Project
```bash
# Go to https://supabase.com/dashboard
# Click "New Project"
# Fill in project details
# Wait for setup to complete
```

### 1.2 Deploy Database Schemas
```sql
-- Run these SQL scripts in Supabase SQL Editor:
-- 1. /supabase/database-setup.sql
-- 2. /supabase/ads-schema.sql  
-- 3. /supabase/chat-schema-fixed.sql
```

### 1.3 Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy edge functions
supabase functions deploy server
```

### 1.4 Configure Authentication
```bash
# In Supabase Dashboard:
# 1. Go to Authentication > Settings
# 2. Enable Email authentication
# 3. Configure email templates (optional)
# 4. Set up redirect URLs for your domain
```

---

## 💳 Step 2: Stripe Setup

### 2.1 Create Stripe Account
```bash
# Go to https://stripe.com
# Sign up for account
# Complete verification process
# Switch to live mode when ready for production
```

### 2.2 Configure Products & Prices
```bash
# In Stripe Dashboard:
# 1. Go to Products
# 2. Create product: "Ad Posting" - $2.00 USD
# 3. Create product: "Featured Boost" - $10.00 USD
# 4. Note down the price IDs
```

### 2.3 Setup Webhooks
```bash
# In Stripe Dashboard:
# 1. Go to Developers > Webhooks
# 2. Add endpoint: https://YOUR_DOMAIN.com/api/stripe/webhook
# 3. Select events: checkout.session.completed, payment_intent.succeeded
# 4. Note down the webhook secret
```

---

## 🌐 Step 3: Vercel Deployment (Recommended)

### 3.1 Quick Deploy
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/persian-connect)

### 3.2 Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Clone and setup
git clone https://github.com/yourusername/persian-connect.git
cd persian-connect
npm install

# Deploy
vercel

# Follow prompts to configure
```

### 3.3 Environment Variables
```bash
# In Vercel Dashboard:
# 1. Go to your project > Settings > Environment Variables
# 2. Add all variables from .env.example
# 3. Make sure to set for Production, Preview, and Development
```

---

## 🔷 Step 4: Netlify Deployment (Alternative)

### 4.1 Quick Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/persian-connect)

### 4.2 Manual Deploy
```bash
# Build locally
npm run build

# Drag and drop dist/ folder to Netlify
# Or connect Git repository
```

### 4.3 Configuration
```toml
# netlify.toml (already included)
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🐳 Step 5: Docker Deployment (Optional)

### 5.1 Build Docker Image
```bash
# Build image
docker build -t persian-connect .

# Run container
docker run -p 3000:80 persian-connect
```

### 5.2 Docker Compose
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down
```

---

## ⚙️ Step 6: Domain & SSL Setup

### 6.1 Custom Domain
```bash
# In your hosting platform:
# 1. Go to Domains section
# 2. Add your custom domain
# 3. Configure DNS records
# 4. Enable SSL (usually automatic)
```

### 6.2 DNS Configuration
```dns
# Required DNS records:
Type    Name    Value
A       @       [hosting-platform-ip]
CNAME   www     [hosting-platform-domain]
```

---

## 🔐 Step 7: Security Configuration

### 7.1 Environment Variables Security
```bash
# ⚠️ NEVER commit these to Git:
VITE_SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY

# ✅ Safe to include in client build:
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
```

### 7.2 Supabase RLS Policies
```sql
-- Already configured in schema files
-- Verify Row Level Security is enabled
-- Test with different user roles
```

---

## 📊 Step 8: Monitoring & Analytics

### 8.1 Vercel Analytics
```bash
# Vercel automatically provides:
# - Performance metrics
# - Error tracking
# - Traffic analytics
```

### 8.2 Custom Analytics (Optional)
```javascript
// Add to vite.config.ts if desired
// Google Analytics
// Plausible Analytics
// PostHog
```

---

## 🧪 Step 9: Testing Deployment

### 9.1 Functionality Tests
- [ ] User registration/login
- [ ] Ad posting with payment
- [ ] Image uploads
- [ ] Real-time messaging
- [ ] Admin dashboard access
- [ ] Mobile responsiveness
- [ ] Language switching

### 9.2 Performance Tests
```bash
# Test with Lighthouse
# Check Core Web Vitals
# Verify PWA functionality
```

---

## 🚨 Step 10: Troubleshooting

### Common Issues:

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

#### Environment Variables Not Loading
```bash
# Check variable names start with VITE_
# Verify they're set in hosting platform
# Restart deployment after adding variables
```

#### Database Connection Issues
```bash
# Verify Supabase URL and keys
# Check RLS policies
# Ensure edge functions are deployed
```

#### Payment Issues
```bash
# Verify Stripe keys
# Check webhook endpoint
# Test in Stripe test mode first
```

---

## 📞 Support & Resources

- **Documentation**: Check `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/persian-connect/issues)
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## 🎯 Post-Deployment Checklist

- [ ] All functionality working
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Admin account created (ommzadeh@gmail.com)
- [ ] Test payments completed
- [ ] Documentation updated

---

**🎉 Congratulations! Your Persian Connect marketplace is now live!**