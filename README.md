# Wealth Pro Recruitment - Agent Income Potential Platform

A modern recruitment platform designed to showcase the income potential and career opportunities for aspiring financial advisors. Built with React, TypeScript, and Tailwind CSS.

## 🎯 Purpose

This platform helps recruit new agents by demonstrating:
- **Income Potential** - Step-by-step earnings breakdown
- **Commission Structures** - Clear compensation models
- **Career Growth Path** - Advancement opportunities
- **Success Stories** - Real examples of agent success
- **Training & Support** - Resources available to new agents

## 🌟 Key Features

### Recruitment-Focused
- **Income Calculator** - Show potential earnings based on sales volume
- **Commission Breakdown** - Visual representation of commission tiers
- **Career Trajectory** - Growth from new agent to team leader
- **Success Metrics** - Average agent performance data
- **Onboarding Preview** - What new agents can expect

### Technical Features
- **Modern Stack** - React 19 + Vite + TypeScript
- **Type-Safe** - Full TypeScript coverage
- **State Management** - Zustand with persistence
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Fast Performance** - Optimized builds with code splitting

## 🚀 Quick Start

### Prerequisites
- Node.js 24.x
- npm 11+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Recruitment Modules

### 1. Income Potential Calculator
- Monthly earning projections
- Commission tier breakdowns
- Bonus opportunity visualization
- Year-over-year growth scenarios

### 2. Career Path Overview
- New Agent (Year 1)
- Established Agent (Years 2-3)
- Senior Agent (Years 4-5)
- Team Leader/Manager (Years 6+)

### 3. Success Stories
- Real agent testimonials
- Income progression examples
- Work-life balance highlights
- Support system showcases

### 4. Training & Resources
- Initial training program overview
- Ongoing education opportunities
- Mentor program details
- Technology & tools provided

## 🛠️ Technology Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 3
- **Charts:** Chart.js + react-chartjs-2
- **State Management:** Zustand 5
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **PDF Generation:** jsPDF

## 📁 Project Structure

```
wealth-pro-recruitment/
├── src/
│   ├── components/         # React components
│   │   ├── Recruitment/    # Recruitment-specific components
│   │   ├── Dashboard/      # Dashboard views
│   │   └── shared/         # Shared components
│   ├── config/             # Configuration
│   ├── store/              # State management
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Utility functions
│   └── App.tsx             # Main app
├── public/                 # Static assets
└── package.json
```

## 🎨 Customization

Update `/src/config/agent.config.ts` for:
- Company branding
- Commission structures
- Income ranges
- Contact information

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Railway
```bash
railway up
```

### GitHub Pages
```bash
npm run deploy:github
```

## 🔜 Upcoming Features (Steps 3 & 4)

### Step 3: Income Potential Showcase
- [ ] Interactive income calculator
- [ ] Commission tier visualization
- [ ] Side-by-side comparison (traditional job vs agent)
- [ ] First-year earnings projection
- [ ] Residual income explanation

### Step 4: Career Path & Support
- [ ] Career progression timeline
- [ ] Training program details
- [ ] Mentor matching system
- [ ] Success metrics dashboard
- [ ] Application form integration

## 👤 Author

**Sony Ho** - Financial Services Recruitment
- Email: mrsonyho@gmail.com
- Platform: Wealth Pro Recruitment

---

© 2025 Wealth Pro Recruitment Platform | Version 1.0

Built with [Claude Code](https://claude.com/claude-code)
