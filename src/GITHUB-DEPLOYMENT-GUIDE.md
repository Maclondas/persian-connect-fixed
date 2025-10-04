# 🚀 GitHub Deployment Guide for Persian Connect

## Step-by-Step Instructions to Deploy Your Marketplace

### 📋 Prerequisites
- GitHub account
- Git installed on your computer
- Your Persian Connect project ready

---

## 🎯 Step 1: Create GitHub Repository

### Option A: Create New Repository on GitHub.com

1. **Go to GitHub.com** and sign in
2. **Click the "+" icon** in the top right → "New repository"
3. **Repository settings**:
   ```
   Repository name: persian-connect
   Description: Modern bilingual classifieds marketplace
   ✅ Public (for free GitHub Pages)
   ✅ Add a README file
   ✅ Add .gitignore → Node
   ✅ Choose a license → MIT License
   ```
4. **Click "Create repository"**

### Option B: Use GitHub CLI (Advanced)
```bash
# Install GitHub CLI first: https://cli.github.com/
gh repo create persian-connect --public --description "Modern bilingual classifieds marketplace"
```

---

## 🔧 Step 2: Prepare Your Local Project

### Initialize Git in Your Project
```bash
# Navigate to your project folder
cd /path/to/your/persian-connect

# Initialize git (if not already done)
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Persian Connect marketplace"
```

### Connect to GitHub Repository
```bash
# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/persian-connect.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

---

## ⚙️ Step 3: Configure GitHub Pages

### Enable GitHub Pages
1. **Go to your repository** on GitHub.com
2. **Click "Settings"** tab
3. **Scroll down to "Pages"** in the left sidebar
4. **Source settings**:
   ```
   Source: GitHub Actions
   ```
5. **Click "Save"**

### The GitHub Actions workflow is already configured! 
✅ Check `.github/workflows/deploy.yml` - it will automatically:
- Build your React app when you push to `main`
- Deploy to GitHub Pages
- Handle all the technical details

---

## 🌐 Step 4: Custom Domain Setup (Optional)

### If Using GitHub Pages with Custom Domain
1. **In repository Settings → Pages**
2. **Custom domain**: Enter `www.persian-connect.com`
3. **✅ Enforce HTTPS** (wait for certificate)

### DNS Configuration for Your Domain
Add these DNS records in your domain provider:
```
Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io

Type: A  
Name: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153
```

---

## 📝 Step 5: Complete Setup Checklist

### ✅ Essential Files Created
- [x] `package.json` - Dependencies and scripts
- [x] `vite.config.ts` - Build configuration  
- [x] `tsconfig.json` - TypeScript settings
- [x] `index.html` - Entry point
- [x] `/src/main.tsx` - React entry
- [x] `.gitignore` - Files to ignore
- [x] `README.md` - Project documentation
- [x] `.github/workflows/deploy.yml` - Auto-deployment

### 🔍 Verify Your Setup
1. **Check repository**: All files uploaded to GitHub
2. **Check Actions**: Go to "Actions" tab - should see deployment running
3. **Check Pages**: Settings → Pages should show your URL
4. **Test site**: Visit your GitHub Pages URL

---

## 🎉 Step 6: Going Live

### Your URLs After Deployment
```
GitHub Pages: https://YOUR_USERNAME.github.io/persian-connect
Custom Domain: https://www.persian-connect.com (if configured)
```

### First Deployment Timeline
- **Code push**: Instant
- **GitHub Actions build**: 2-5 minutes  
- **Site live**: 5-10 minutes total
- **DNS propagation**: 24-48 hours (custom domain)

---

## 🔄 Step 7: Future Updates

### Making Changes
```bash
# Make your changes to the code
# Then commit and push:

git add .
git commit -m "Your change description"
git push origin main

# GitHub Actions will automatically rebuild and deploy!
```

### Monitoring Deployments
- **GitHub Actions tab**: See build/deploy status
- **Settings → Pages**: Check deployment status
- **Check your live site**: Verify changes are live

---

## 🚨 Troubleshooting

### Build Fails?
1. **Check Actions tab** for error details
2. **Common issues**:
   - Missing dependencies in `package.json`
   - TypeScript errors
   - Import path issues

### Site Not Loading?
1. **Wait longer**: Initial deployment takes time
2. **Check Pages settings**: Ensure source is "GitHub Actions"
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)

### Custom Domain Issues?
1. **DNS propagation**: Can take 24-48 hours
2. **Check DNS**: Use [dnschecker.org](https://dnschecker.org)
3. **HTTPS certificate**: Takes time to provision

---

## 🔧 Advanced Options

### Alternative Deployment Platforms

#### Netlify (Easier custom domain)
1. **Connect GitHub repo** to Netlify
2. **Build settings**: 
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Add custom domain** in Netlify dashboard

#### Vercel (Great performance)
1. **Import GitHub repo** to Vercel  
2. **Auto-detects** React + Vite settings
3. **Add custom domain** in project settings

### Environment Variables
Add in GitHub repository settings → Secrets and variables → Actions:
```
REACT_APP_ENV=production
REACT_APP_DOMAIN=persian-connect.com
```

---

## 📞 Need Help?

### Quick Solutions
- **Build errors**: Check the Actions tab for details
- **Site not updating**: Clear browser cache + wait a few minutes
- **Domain issues**: Most resolve with time (DNS propagation)

### Resources
- **GitHub Pages Docs**: [docs.github.com/pages](https://docs.github.com/pages)
- **Vite Deployment**: [vitejs.dev/guide/static-deploy.html](https://vitejs.dev/guide/static-deploy.html)
- **Custom Domain Setup**: See `SQUARESPACE-DOMAIN-SETUP.md`

### Support Channels
- **GitHub Issues**: For code-related problems
- **GitHub Discussions**: For general questions
- **Stack Overflow**: Tag with `github-pages` + `react`

---

## 🎊 Success!

Your Persian Connect marketplace is now:
- ✅ **Live on the internet**
- ✅ **Automatically deployed** on every code change
- ✅ **Professional domain ready** (if configured)
- ✅ **Mobile responsive** and fast
- ✅ **SEO optimized** with proper meta tags

**Next Steps:**
1. **Share your site** with the Persian community
2. **Monitor usage** with Google Analytics (optional)
3. **Add real payment processing** when ready
4. **Scale with a real backend** as you grow

**🌟 Congratulations on launching your marketplace!**