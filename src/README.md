# Persian Connect 🏪

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ommzadeh/persian-connect)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ommzadeh/persian-connect)
[![CI/CD](https://github.com/ommzadeh/persian-connect/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/ommzadeh/persian-connect/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)

A modern, clean, and trustworthy bilingual (English & Persian) classifieds marketplace built with React, TypeScript, and Tailwind CSS. Features real-time messaging, secure payments via Stripe, and comprehensive admin controls.

![Persian Connect Preview](https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop&crop=center)

## ✨ Features

### 🌐 **Bilingual Support**
- **English & Persian** with proper RTL layout switching
- Dynamic language switching throughout the app
- Culturally appropriate design elements

### 🏪 **Complete Marketplace**
- **Homepage** with categorized ads display
- **Multi-step ad posting** with image uploads
- **Real-time messaging** system via Supabase
- **Location-based filtering** with "All" options for countries/cities
- **Category browsing** across 15+ specialized categories

### 💳 **Integrated Payments**
- **Stripe integration** for secure payments
- **$2 USD** for 30-day ad posting
- **Optional boost** for $10 extra (1 week featured placement)
- Success/failure payment handling

### 🔐 **Authentication & Security**
- **Supabase Auth** with email/password
- **Role-based admin controls** 
- **Content moderation** capabilities
- **Auto-admin promotion** for `ommzadeh@gmail.com`

### 📱 **Modern Tech Stack**
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Vite** for fast development
- **PWA support** with offline capabilities
- **shadcn/ui** components throughout

## 🚀 Quick Deploy

### **Option 1: Vercel (Recommended)**
1. Click the "Deploy to Vercel" button above
2. Connect your GitHub account
3. Set environment variables
4. Deploy!

### **Option 2: Netlify**
1. Click the "Deploy to Netlify" button above
2. Connect your GitHub account
3. Configure build settings
4. Deploy!

### **Option 3: Manual Deployment**
```bash
# Clone the repository
git clone https://github.com/ommzadeh/persian-connect.git
cd persian-connect

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Build for production
npm run build

# Preview the build
npm run preview
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 📋 Setup Guide

### **1. Supabase Setup**
1. Create a new Supabase project
2. Run the database schemas in `/supabase/` folder
3. Deploy edge functions from `/supabase/functions/server/`
4. Configure RLS policies for security

### **2. Stripe Setup**
1. Create Stripe account
2. Get API keys from dashboard
3. Configure webhook endpoints for payment handling

### **3. Local Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 🗂️ Categories Supported

- 🚗 **Vehicles** - Cars, motorcycles, automotive
- 🏠 **Real Estate** - Apartments, houses, properties
- 🏢 **Commercial Property** - Office spaces, retail
- 💼 **Jobs** - Career opportunities and listings
- 🛠️ **Services** - Professional services
- 👗 **Fashion** - Clothing, accessories, jewelry
- 🐕 **Pets** - Pet sales, accessories, services
- 💻 **Digital Goods** - Software, digital products
- 🎓 **Education** - Courses, training, lessons
- 🏋️ **Fitness** - Personal training, coaching
- 🍽️ **Food & Catering** - Restaurant equipment, catering
- ✈️ **Travel** - Travel agencies, services
- 💰 **Financial** - Accounting, currency exchange
- ⚖️ **Legal** - Solicitor, legal services
- 🏥 **Medical** - Healthcare, beauty clinics
- 📄 **Visa Services** - Immigration assistance

## 🎨 Design System

### **Color Palette**
- **Primary:** Teal (#0ac2af) - Trust and reliability
- **Action:** Vibrant Red (#dc2626) - "Post Ad" and CTAs
- **Accent:** Black (#000000) - Featured items and category icons
- **Background:** Clean whites and subtle grays

### **Typography**
- Clean, modern fonts with proper RTL support
- Consistent sizing using Tailwind's design tokens
- Accessible contrast ratios throughout

## 🛡️ Security Features

- **Row Level Security (RLS)** on all database tables
- **Input validation** and sanitization
- **XSS protection** headers
- **CSRF protection** for forms
- **Secure payment processing** via Stripe

## 📱 PWA Features

- **Offline support** for core functionality
- **Install prompts** for mobile and desktop
- **Push notifications** for new messages
- **App-like experience** when installed

## 🔧 Admin Features

- **Content moderation** dashboard
- **User management** capabilities
- **Ad approval** workflow
- **Analytics** and reporting
- **Bulk operations** for efficiency

## 🌍 Internationalization

- **Dynamic language switching**
- **RTL layout support** for Persian
- **Localized formatting** for dates, numbers
- **Cultural considerations** in design

## 📊 Performance

- **Code splitting** with lazy loading
- **Image optimization** via Unsplash integration
- **CDN delivery** for static assets
- **Lighthouse score:** 95+ across all metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** Check the `/docs` folder
- **Issues:** Report bugs via GitHub Issues
- **Discussions:** Use GitHub Discussions for questions
- **Email:** Support via contact form in app

## 🎯 Roadmap

- [ ] **Mobile apps** (React Native)
- [ ] **Advanced search** with filters
- [ ] **Saved searches** and alerts
- [ ] **Social login** (Google, Facebook)
- [ ] **Multi-currency** support
- [ ] **Video uploads** for ads
- [ ] **Review system** for users
- [ ] **Advanced analytics** dashboard

---

**Built with ❤️ for the Persian community worldwide**

### 🚀 [**Deploy Now**](https://vercel.com/new/clone?repository-url=https://github.com/ommzadeh/persian-connect) | 📚 [**Documentation**](./DEPLOYMENT_GUIDE.md) | 🐛 [**Report Issues**](https://github.com/ommzadeh/persian-connect/issues) | 🤝 [**Contributing**](./CONTRIBUTING.md)