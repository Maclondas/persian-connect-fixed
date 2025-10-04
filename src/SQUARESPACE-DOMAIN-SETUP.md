# Connecting Your Squarespace Domain to Persian Connect

## 🎯 Your Domain: www.persian-connect.com

Great choice! Your domain is already configured in the codebase. Here's how to connect it to your hosting platform.

## 📋 Prerequisites

- Your Persian Connect marketplace is built and ready to deploy
- You have access to your Squarespace domain settings
- You've chosen a hosting platform (Netlify, Vercel, or custom server)

## 🚀 Step-by-Step Setup

### Step 1: Choose Your Hosting Platform

#### Option A: Netlify (Recommended for beginners)

1. **Build your site:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `dist` folder to Netlify Drop
   - Or connect your GitHub repository for auto-deployment

3. **Get Netlify DNS settings:**
   - After deployment, go to your site dashboard
   - Click "Domain settings" 
   - Click "Add custom domain"
   - Enter: `persian-connect.com`
   - Netlify will provide DNS records

#### Option B: Vercel

1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Add custom domain:**
   - Go to your Vercel dashboard
   - Navigate to your project
   - Go to "Settings" → "Domains"
   - Add: `persian-connect.com` and `www.persian-connect.com`
   - Vercel will provide DNS records

#### Option C: Custom Server (Advanced)

1. **Deploy using Docker:**
   ```bash
   docker build -f docker/Dockerfile -t persian-connect .
   docker run -d -p 80:80 --name persian-connect persian-connect
   ```

2. **Get your server IP address**

### Step 2: Configure DNS in Squarespace

1. **Access Squarespace Domain Settings:**
   - Log into your Squarespace account
   - Go to Settings → Domains
   - Find `persian-connect.com`
   - Click "Manage" or "DNS Settings"

2. **For Netlify/Vercel - Add DNS Records:**

   **A Records:**
   ```
   Type: A
   Host/Name: @
   Value: [Netlify/Vercel provided IP]
   TTL: 300 (or Auto)
   ```

   **CNAME Record:**
   ```
   Type: CNAME  
   Host/Name: www
   Value: [your-site-name].netlify.app (or .vercel.app)
   TTL: 300 (or Auto)
   ```

3. **For Custom Server - Add DNS Records:**

   **A Records:**
   ```
   Type: A
   Host/Name: @
   Value: [Your Server IP]
   TTL: 300
   
   Type: A
   Host/Name: www  
   Value: [Your Server IP]
   TTL: 300
   ```

### Step 3: SSL Certificate Setup

#### For Netlify/Vercel:
- SSL is automatic once DNS propagates (usually 24-48 hours)
- You'll get HTTPS automatically

#### For Custom Server:
```bash
# Install Certbot
sudo apt update
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Get SSL certificate
sudo certbot --nginx -d persian-connect.com -d www.persian-connect.com
```

### Step 4: Test Your Setup

1. **Wait for DNS Propagation (24-48 hours)**
   - Check status at: [whatsmydns.net](https://whatsmydns.net)
   - Enter: `persian-connect.com`

2. **Test Your URLs:**
   - ✅ https://www.persian-connect.com
   - ✅ https://persian-connect.com  
   - ✅ Both should redirect to www version

3. **Test Site Functionality:**
   - Homepage loads correctly
   - All categories work
   - Ad posting works
   - User authentication works

## 🔧 Squarespace-Specific Settings

### Domain Forwarding (If Needed)
If you want to redirect from non-www to www:

1. In Squarespace DNS settings
2. Add URL Redirect:
   ```
   From: persian-connect.com
   To: https://www.persian-connect.com
   Type: 301 (Permanent)
   ```

### Email Setup (Optional)
If you want email@persian-connect.com:

1. In Squarespace, go to Email & G Suite
2. Set up Google Workspace or other email provider
3. Configure MX records as provided

## 🚨 Troubleshooting

### Domain Not Working?
- **Wait longer**: DNS can take up to 48 hours
- **Check DNS**: Use [dnschecker.org](https://dnschecker.org)
- **Clear cache**: Clear browser cache and try incognito mode

### SSL Certificate Issues?
- **Netlify/Vercel**: SSL provisions automatically after DNS
- **Custom server**: Ensure DNS points correctly before running Certbot
- **Mixed content**: Ensure all resources use HTTPS

### Site Not Loading?
- **Check build**: Ensure `npm run build` completed successfully
- **Check deployment**: Verify files uploaded correctly
- **Check console**: Open browser dev tools for error messages

### Common Squarespace Issues:
- **DNS Management**: Ensure you're managing DNS through Squarespace, not third-party
- **Propagation**: Squarespace DNS changes can be slower than other providers
- **Conflicting records**: Remove any conflicting A or CNAME records

## 📞 Getting Help

### Hosting Platform Support:
- **Netlify**: [netlify.com/support](https://netlify.com/support)
- **Vercel**: [vercel.com/help](https://vercel.com/help)

### Domain Support:
- **Squarespace**: [support.squarespace.com](https://support.squarespace.com)
- **DNS Tools**: [dnschecker.org](https://dnschecker.org), [whatsmydns.net](https://whatsmydns.net)

## ✅ Final Checklist

- [ ] Site built successfully (`npm run build`)
- [ ] Deployed to hosting platform
- [ ] Custom domain added to hosting platform
- [ ] DNS records added in Squarespace
- [ ] Waited 24-48 hours for propagation
- [ ] Both www and non-www versions work
- [ ] HTTPS/SSL certificate active
- [ ] All site features working
- [ ] Admin access confirmed
- [ ] Contact forms working (if any)

## 🎉 You're Live!

Once everything is working:

1. **Submit to Google Search Console**
   - Add both www and non-www versions
   - Submit your sitemap: `https://www.persian-connect.com/sitemap.xml`

2. **Social Media**
   - Update your social profiles with the new domain
   - Test social sharing from your site

3. **Analytics** (Optional)
   - Add Google Analytics
   - Set up conversion tracking

Your Persian Connect marketplace is now live at **www.persian-connect.com**! 🌟

---

**Need Help?** If you run into issues, the most common solution is simply waiting longer for DNS propagation. Most domain connection issues resolve themselves within 24-48 hours.