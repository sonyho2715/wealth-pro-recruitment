# Deployment Guide - Wealth Blueprint Pro

## Quick Deployment Options

### Option 1: Vercel (Recommended) ⚡

**Why Vercel?**
- Fastest deployment (< 2 minutes)
- Automatic HTTPS
- Global CDN
- Free tier available
- Perfect for static React apps

**Steps:**

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to production
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project name? **wealth-blueprint-pro**
- In which directory is your code located? **./**
- Want to override settings? **N**

**Done!** You'll get a production URL like: `https://wealth-blueprint-pro.vercel.app`

---

### Option 2: Netlify 🚀

**Steps:**

```bash
# 1. Build the project
npm run build

# 2. Go to Netlify.com
# 3. Drag and drop the /dist folder
```

**Or use Netlify CLI:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

### Option 3: Railway.app 🚂

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize and deploy
railway init
railway up
```

---

### Option 4: GitHub Pages 📄

```bash
# 1. Install gh-pages
npm install -D gh-pages

# 2. Add to package.json scripts:
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# 3. Deploy
npm run deploy
```

---

### Option 5: Custom Server (Any Host) 🌐

```bash
# 1. Build the project
npm run build

# 2. Upload /dist folder contents to your web server
# via FTP, SFTP, or hosting control panel

# 3. Point domain to the uploaded files
```

**Server Requirements:**
- Any web server (Apache, Nginx, etc.)
- No backend required
- Just static file hosting

---

## Environment Setup

### For Production Build

Create `.env.production` (if needed):

```env
VITE_APP_NAME="Wealth Blueprint"
VITE_AGENT_NAME="Your Name"
```

Access in code:
```typescript
const appName = import.meta.env.VITE_APP_NAME;
```

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Update DNS to Netlify nameservers

---

## Pre-Deployment Checklist

- [ ] Update agent configuration in `/src/config/agent.config.ts`
- [ ] Test locally: `npm run dev`
- [ ] Build successfully: `npm run build`
- [ ] Preview build: `npm run preview`
- [ ] Update contact information
- [ ] Customize branding colors
- [ ] Add agent logo (if applicable)
- [ ] Test all features:
  - [ ] Client input form
  - [ ] Dashboard calculations
  - [ ] Charts rendering
  - [ ] Risk assessment
  - [ ] Insurance products
  - [ ] Profile save/load
- [ ] Check mobile responsiveness
- [ ] Verify data persistence (localStorage)

---

## Deployment for Multiple Agents

### Scenario: Deploy for 5 different agents

**Method 1: Separate Deployments (Recommended)**

```bash
# Agent 1
git clone wealth-blueprint-pro agent1-wealth
cd agent1-wealth
# Update agent.config.ts for Agent 1
vercel --prod

# Agent 2
git clone wealth-blueprint-pro agent2-wealth
cd agent2-wealth
# Update agent.config.ts for Agent 2
vercel --prod

# Repeat for other agents...
```

Each agent gets their own:
- Vercel project
- Custom domain
- Separate branding

**Method 2: Subdomains**

Deploy to:
- `john-smith.wealthblueprint.com`
- `maria-garcia.wealthblueprint.com`
- `david-lee.wealthblueprint.com`

---

## Monitoring & Analytics

### Add Vercel Analytics

Already included! Just deploy to Vercel.

### Add Google Analytics

Edit `index.html`:

```html
<head>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
</head>
```

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Charts Not Displaying

Ensure Chart.js is installed:
```bash
npm install chart.js react-chartjs-2
```

### TypeScript Errors

```bash
# Check TypeScript config
npx tsc --noEmit
```

---

## Performance Optimization

Already optimized with:
- ✅ Vite code splitting
- ✅ Lazy loading components
- ✅ Tailwind CSS purging
- ✅ Tree shaking
- ✅ Minification

Average build size: ~200KB gzipped

---

## Security Best Practices

- ✅ No sensitive data stored on server
- ✅ All data in browser localStorage
- ✅ HTTPS enforced (Vercel/Netlify automatic)
- ✅ No external API calls
- ✅ Static site = minimal attack surface

---

## Support

Need help? Check:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Vite Docs](https://vitejs.dev/guide/build.html)

---

## Cost Estimate

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Vercel | ✅ Unlimited | $20/mo Pro |
| Netlify | ✅ 100GB/mo | $19/mo Pro |
| Railway | ✅ $5 credit | Pay as you go |
| GitHub Pages | ✅ Unlimited | Free forever |

**Recommendation:** Start with Vercel free tier. Upgrade only if needed.

---

## Quick Deploy Now! 🚀

```bash
cd /Users/sonyho/Active_Projects/Development/wealth-blueprint-pro
vercel --prod
```

**That's it!** Your platform will be live in under 2 minutes.

---

© 2025 Wealth Blueprint Platform
