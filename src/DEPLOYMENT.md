# Persian Connect - Deployment Guide

This guide will help you deploy your Persian Connect marketplace to your custom domain.

## 🚀 Quick Start

### 1. Update Domain Configuration

First, update your domain in `/config/domain.ts`:

```typescript
production: {
  domain: 'your-domain.com',           // Replace with your domain
  url: 'https://your-domain.com',      // Replace with your URL
  api: 'https://api.your-domain.com',  // Replace with your API URL
  cdn: 'https://cdn.your-domain.com'   // Replace with your CDN URL
}
```

### 2. Update SEO Configuration

Update the SEO settings in `/config/domain.ts`:

```typescript
export const seoConfig = {
  title: 'Your Marketplace - Bilingual Classifieds',
  description: 'Your custom description...',
  // ... update other fields
}
```

### 3. Choose Deployment Method

## Option A: Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**Custom Domain Setup:**
1. Go to your Netlify dashboard
2. Navigate to Domain settings
3. Add your custom domain
4. Configure DNS records as instructed

## Option B: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Custom Domain Setup:**
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Add your custom domain under "Domains"
4. Configure DNS records as instructed

## Option C: Docker + Your Server

```bash
# Build Docker image
docker build -f docker/Dockerfile -t persian-connect .

# Run container
docker run -d -p 80:80 --name persian-connect persian-connect
```

**Custom Domain Setup:**
1. Point your domain to your server's IP
2. Configure reverse proxy (Nginx/Apache)
3. Set up SSL certificate (Let's Encrypt recommended)

## Option D: Static Hosting (GitHub Pages, etc.)

```bash
# Build the project
npm run build

# Upload the 'dist' folder to your hosting provider
```

## 🔧 Configuration Steps

### 1. Environment Variables

Create `.env` file with your domain settings:

```bash
REACT_APP_DOMAIN=your-domain.com
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENV=production
```

### 2. Update Meta Tags

The app automatically generates meta tags based on your domain configuration. No manual updates needed!

### 3. Update Sitemap

Edit `/public/sitemap.xml` and replace all instances of `persianconnect.com` with your domain:

```xml
<loc>https://your-domain.com/</loc>
```

### 4. Update Robots.txt

Edit `/public/robots.txt` and update the sitemap URL:

```
Sitemap: https://your-domain.com/sitemap.xml
```

## 🌐 DNS Configuration

### For Netlify/Vercel:
- Add A record: `@` → provided IP address
- Add CNAME record: `www` → your-domain.netlify.app (or vercel.app)

### For Custom Server:
- Add A record: `@` → your server IP
- Add CNAME record: `www` → your-domain.com

## 📱 PWA Configuration

Your app is PWA-ready! Update `/public/manifest.json` with your branding:

```json
{
  "name": "Your Marketplace Name",
  "short_name": "YourApp",
  "start_url": "/",
  "theme_color": "#0ac2af"
}
```

## 🔒 SSL/HTTPS Setup

### Netlify/Vercel:
- SSL is automatic with custom domains

### Custom Server:
```bash
# Install Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🧪 Testing Your Deployment

### 1. Functionality Test
- [ ] Homepage loads correctly
- [ ] All categories work
- [ ] Ad posting workflow
- [ ] User authentication
- [ ] Admin dashboard (if admin)

### 2. SEO Test
- [ ] Meta tags are correct
- [ ] Sitemap is accessible (`/sitemap.xml`)
- [ ] Robots.txt is accessible (`/robots.txt`)
- [ ] Social sharing works

### 3. Performance Test
- [ ] Run Lighthouse audit
- [ ] Check mobile responsiveness
- [ ] Test loading speed

### 4. Domain Test
- [ ] Domain redirects work (www ↔ non-www)
- [ ] SSL certificate is valid
- [ ] All pages load with your domain

## 🚨 Troubleshooting

### Domain not working?
1. Check DNS propagation (can take 24-48 hours)
2. Verify DNS records are correct
3. Clear browser cache

### SSL issues?
1. Ensure DNS is pointing correctly first
2. Wait for SSL provisioning (can take up to 24 hours)
3. Try accessing via HTTPS directly

### App not loading?
1. Check browser console for errors
2. Verify build was successful
3. Check deployment logs

## 📞 Support

If you need help with deployment:

1. **Netlify Support**: [netlify.com/support](https://netlify.com/support)
2. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
3. **DNS Help**: [whatsmydns.net](https://whatsmydns.net)

## 🎉 Go Live Checklist

- [ ] Domain configured and pointing correctly
- [ ] SSL certificate active
- [ ] All environment variables set
- [ ] SEO meta tags updated
- [ ] Sitemap submitted to Google Search Console
- [ ] Analytics tracking added (optional)
- [ ] Social media links updated
- [ ] Contact information verified
- [ ] Admin access confirmed
- [ ] Backup strategy in place

Your Persian Connect marketplace is now ready for the world! 🌍