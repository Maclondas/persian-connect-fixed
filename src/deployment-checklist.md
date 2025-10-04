# Persian Connect Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Environment Variables
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key  
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- [ ] `VITE_SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 2. Supabase Setup
- [ ] Database tables created (use ultra-simple-db setup)
- [ ] RLS policies configured
- [ ] Edge functions deployed (`/supabase/functions/server/`)
- [ ] Storage buckets created
- [ ] Auth providers configured (if using social login)

### 3. Domain & DNS
- [ ] Domain name purchased
- [ ] DNS pointing to hosting provider
- [ ] SSL certificate configured
- [ ] Custom domain added to hosting platform

### 4. Final Testing
- [ ] Build runs successfully (`npm run build`)
- [ ] All pages load without errors
- [ ] Authentication works
- [ ] Payment processing works
- [ ] Image uploads work
- [ ] Chat functionality works
- [ ] PWA installs correctly

### 5. Production Configuration
- [ ] Analytics setup (optional)
- [ ] Error monitoring (optional)
- [ ] Performance monitoring (optional)
- [ ] Backup strategy in place

## 🚀 Recommended Deployment: Vercel

**Why Vercel?**
- Automatic deployments from GitHub
- Built-in CDN and edge functions
- Easy environment variable management
- Excellent performance
- Free tier available

**Quick Deploy:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy!

## 📱 Post-Deployment Steps

### 1. Test Everything
- [ ] Homepage loads
- [ ] User registration/login
- [ ] Ad posting works
- [ ] Payment processing
- [ ] Chat functionality
- [ ] Admin dashboard access

### 2. SEO & Marketing
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (optional)
- [ ] Configure social media meta tags
- [ ] Test mobile responsiveness

### 3. Monitoring
- [ ] Set up error tracking
- [ ] Monitor performance metrics
- [ ] Check Supabase usage/billing
- [ ] Monitor Stripe transactions

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check Tailwind CSS v4 compatibility
2. **Environment variables not working**: Use `VITE_` prefix
3. **Supabase connection errors**: Check RLS policies
4. **404 errors**: Ensure SPA routing is configured
5. **Images not loading**: Check Supabase storage permissions

### Support Resources:
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)