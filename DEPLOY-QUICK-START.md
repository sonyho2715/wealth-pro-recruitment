# 🚀 Quick Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- ✅ Customized `/src/config/agent.config.ts`
- ✅ Tested locally with `npm run dev`
- ✅ Built successfully with `npm run build`

---

## Option 1: Vercel (Recommended) ⚡

### Method A: CLI Deploy (Fastest - 2 minutes)

```bash
# 1. Install Vercel CLI (one-time)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
npm run deploy:vercel

# Or simply:
vercel --prod
```

**First deployment prompts:**
- Set up and deploy? → **Yes**
- Which scope? → Select your account
- Link to existing project? → **No**
- What's your project's name? → **wealth-blueprint-pro**
- In which directory is your code? → **.**
- Want to override settings? → **No**

**Done!** You'll get a URL like: `https://wealth-blueprint-pro.vercel.app`

### Method B: GitHub Integration (Automatic)

1. Push code to GitHub (see GitHub setup below)
2. Go to https://vercel.com/new
3. Import your repository
4. Click "Deploy"

**Every git push automatically deploys!**

---

## Option 2: Railway 🚂

### Method A: CLI Deploy

```bash
# 1. Install Railway CLI (one-time)
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Deploy
npm run deploy:railway

# Or:
railway up
```

### Method B: GitHub Integration

1. Push code to GitHub
2. Go to https://railway.app
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Click "Deploy"

**Configuration is automatic via `railway.toml`**

---

## Option 3: GitHub Pages 📄

### Setup (One-time)

```bash
# 1. Create GitHub repository
gh repo create wealth-blueprint-pro --public --source=. --remote=origin

# Or manually:
# - Go to github.com
# - Click "New repository"
# - Name: wealth-blueprint-pro
# - Click "Create repository"

# 2. Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/wealth-blueprint-pro.git
git branch -M main
git push -u origin main
```

### Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: **GitHub Actions**
3. The workflow will auto-deploy on every push!

**Or deploy manually:**

```bash
npm run deploy:github
```

---

## Quick Command Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Deployment
npm run deploy:vercel    # Deploy to Vercel
npm run deploy:railway   # Deploy to Railway
npm run deploy:github    # Deploy to GitHub Pages

# Manual commands
vercel --prod           # Vercel production
railway up              # Railway deploy
git push                # Auto-deploys (if configured)
```

---

## Environment Variables (Optional)

Create `.env.production` for production-specific settings:

```env
VITE_APP_NAME="Wealth Blueprint"
VITE_AGENT_NAME="Your Name"
VITE_API_URL="https://api.example.com"
```

Access in code:
```typescript
const appName = import.meta.env.VITE_APP_NAME;
```

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., `wealthblueprint.com`)
3. Add DNS records as instructed:
   - Type: **CNAME**
   - Name: **www**
   - Value: **cname.vercel-dns.com**

### Railway
1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS:
   - Type: **CNAME**
   - Name: **www**
   - Value: **[provided by Railway]**

### GitHub Pages
1. Add `CNAME` file to `/public` folder:
   ```
   wealthblueprint.com
   ```
2. Update DNS:
   - Type: **A** records
   - Values: GitHub IPs (see GitHub docs)

---

## Deployment Checklist

Before deploying, verify:

- [ ] Agent config updated (`/src/config/agent.config.ts`)
- [ ] Contact info is correct
- [ ] Brand colors customized
- [ ] Logo added (if applicable)
- [ ] All features tested locally
- [ ] Build completes without errors
- [ ] Git repository initialized
- [ ] `.gitignore` includes `node_modules`, `dist`
- [ ] Environment variables set (if needed)

---

## Multi-Agent Deployment

### Deploy for Multiple Agents

```bash
# Agent 1: John Smith
cd /path/to/projects
git clone wealth-blueprint-pro john-smith-wealth
cd john-smith-wealth
# Edit agent.config.ts for John
git add -A
git commit -m "Customize for John Smith"
vercel --prod
# URL: john-smith-wealth.vercel.app

# Agent 2: Maria Garcia
cd /path/to/projects
git clone wealth-blueprint-pro maria-garcia-wealth
cd maria-garcia-wealth
# Edit agent.config.ts for Maria
git add -A
git commit -m "Customize for Maria Garcia"
vercel --prod
# URL: maria-garcia-wealth.vercel.app

# Repeat for each agent...
```

**Each agent gets:**
- ✅ Separate deployment
- ✅ Unique URL
- ✅ Custom branding
- ✅ Independent updates

---

## Troubleshooting

### Build fails on deployment

```bash
# Clear cache and rebuild locally
rm -rf node_modules dist
npm install
npm run build
```

### Vercel deployment fails

```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod --force
```

### Railway deployment fails

```bash
# Check logs
railway logs

# Redeploy
railway up
```

### GitHub Pages not updating

1. Check Actions tab for build status
2. Ensure GitHub Pages source is set to "GitHub Actions"
3. Re-run workflow if needed

---

## Performance Tips

Already optimized:
- ✅ Code splitting (React, Charts, UI vendors)
- ✅ Tree shaking
- ✅ Minification
- ✅ Asset optimization
- ✅ Lazy loading

**Average bundle size:** ~200KB gzipped

---

## Cost Comparison

| Platform | Free Tier | Monthly Cost | Best For |
|----------|-----------|--------------|----------|
| Vercel | 100GB bandwidth | $20/mo Pro | Production sites |
| Railway | $5 credit/mo | Pay as you go | Auto-scaling |
| GitHub Pages | Unlimited | Free | Simple hosting |

**Recommendation:** Vercel free tier for most use cases.

---

## Support

- **Vercel Issues:** https://vercel.com/support
- **Railway Issues:** https://railway.app/help
- **GitHub Pages:** https://docs.github.com/pages

---

## Next Steps After Deployment

1. ✅ Test deployed site thoroughly
2. ✅ Set up custom domain (optional)
3. ✅ Add SSL certificate (automatic on Vercel/Railway)
4. ✅ Monitor analytics
5. ✅ Share URL with clients!

---

**🎉 You're live! Start accepting clients!**

---

© 2025 Wealth Blueprint Pro
