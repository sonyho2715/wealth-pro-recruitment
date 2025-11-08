# Wealth Blueprint - White Label Guide

## 🎨 Quick Customization Guide

This platform is designed to be easily white-labeled for different financial agents. Follow these steps to rebrand it for a new agent.

---

## Step 1: Update Agent Configuration

Edit `/src/config/agent.config.ts`:

```typescript
export const agentConfig: AgentConfig = {
  // ✏️ Update these fields for your agent
  agentName: "Your Agent Name",
  agentTitle: "Your Professional Title",
  agentEmail: "your@email.com",
  agentPhone: "(555) 123-4567",
  agentWebsite: "https://yourwebsite.com",
  agentLogo: "/logo.png", // Optional: Add logo to /public folder

  // Company Information
  companyName: "Your Company Name",
  companyAddress: "Your Address (optional)",

  // Branding Colors (use hex codes)
  brandColors: {
    primary: "#0ea5e9",   // Main brand color
    secondary: "#6366f1", // Secondary color
    accent: "#10b981",    // Accent color
  },

  // Platform Settings
  platformName: "Your Platform Name",
  platformTagline: "Your Platform Tagline",

  // Features (enable/disable)
  features: {
    showAgentBranding: true,
    allowClientSelfService: false,
    enableInsuranceProducts: true,
    enablePDFReports: true,
    enableEmailTemplates: true,
  },

  // Social Links (optional)
  socialLinks: {
    linkedin: "https://linkedin.com/in/yourprofile",
    twitter: undefined,
    facebook: undefined,
  },
};
```

---

## Step 2: Customize Branding Colors

### Option A: Update Tailwind Config

Edit `/tailwind.config.js` to match your brand colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#YOUR_PRIMARY_COLOR',
        600: '#YOUR_PRIMARY_COLOR_DARK',
      },
    },
  },
}
```

### Option B: Use CSS Variables

Update colors in `/src/index.css` for global styling changes.

---

## Step 3: Add Your Logo (Optional)

1. Place your logo file in `/public` folder (e.g., `logo.png`)
2. Update `agentLogo` in agent.config.ts:
   ```typescript
   agentLogo: "/logo.png"
   ```

---

## Step 4: Customize Features

Enable or disable platform features in `agent.config.ts`:

```typescript
features: {
  showAgentBranding: true,        // Show agent name/contact in header
  allowClientSelfService: false,  // Let clients use without agent
  enableInsuranceProducts: true,  // Show insurance recommendations
  enablePDFReports: true,         // Enable PDF export
  enableEmailTemplates: true,     // Enable email templates
}
```

---

## Step 5: Test Your Changes

```bash
npm run dev
```

Visit `http://localhost:5173` to see your customized platform.

---

## Step 6: Build for Production

```bash
npm run build
```

This creates an optimized production build in the `/dist` folder.

---

## Deployment Options

### Option 1: Vercel (Recommended)

1. Create account at https://vercel.com
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Deploy:
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. Create account at https://netlify.com
2. Drag and drop the `/dist` folder to Netlify

### Option 3: Your Own Server

Upload the contents of `/dist` folder to your web server.

---

## Creating Multiple Agent Instances

### Method 1: Separate Repositories

1. Clone this repository for each agent
2. Update `agent.config.ts` for each
3. Deploy to different domains/subdomains

### Method 2: Environment Variables (Advanced)

Create `.env` files for different agents and use environment variables to switch configs dynamically.

---

## Customization Examples

### Example 1: Agent "John Smith"

```typescript
agentName: "John Smith"
agentTitle: "Certified Financial Planner"
platformName: "Smith Financial Solutions"
brandColors: {
  primary: "#1e40af", // Dark blue
  secondary: "#059669", // Green
  accent: "#dc2626", // Red
}
```

### Example 2: Agent "Maria Garcia"

```typescript
agentName: "Maria Garcia"
agentTitle: "Senior Insurance Advisor"
platformName: "Garcia Wealth Advisors"
brandColors: {
  primary: "#7c3aed", // Purple
  secondary: "#f59e0b", // Amber
  accent: "#ec4899", // Pink
}
```

---

## White-Label Checklist

- [ ] Update `agentName`, `agentTitle`, `agentEmail`, `agentPhone`
- [ ] Update `companyName`
- [ ] Customize `brandColors` (primary, secondary, accent)
- [ ] Update `platformName` and `platformTagline`
- [ ] Add agent logo (optional)
- [ ] Add social media links (optional)
- [ ] Configure feature flags
- [ ] Test locally (`npm run dev`)
- [ ] Build for production (`npm run build`)
- [ ] Deploy to hosting platform
- [ ] Test deployed version
- [ ] Update domain/subdomain (if applicable)

---

## Support & Documentation

### File Structure
```
src/
├── config/
│   └── agent.config.ts    # ← Main configuration file
├── components/            # React components
├── utils/                 # Utility functions
├── types/                 # TypeScript types
└── store/                 # State management
```

### Key Files to Customize
- `src/config/agent.config.ts` - Main configuration
- `tailwind.config.js` - Color scheme
- `index.html` - Page title and meta tags
- `public/` - Logo and static assets

### Need Help?

Contact the developer or refer to the main README.md for technical documentation.

---

## License

This platform is provided for use by authorized agents. Redistribution requires permission.

© 2025 Wealth Blueprint Platform
