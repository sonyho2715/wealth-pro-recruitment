# Wealth Blueprint Pro - Modern Financial Planning Platform

A white-labelable, modern financial planning platform built with React, TypeScript, and Tailwind CSS. Designed for financial advisors to analyze client finances, identify insurance gaps, and provide professional recommendations.

## 🌟 Features

### Core Functionality
- **Comprehensive Financial Analysis** - Complete balance sheet, cash flow, and net worth calculations
- **Risk Assessment** - 8-category risk analysis with actionable recommendations
- **Insurance Gap Analysis** - Identify life, disability, and liability coverage gaps
- **Product Recommendations** - Personalized insurance product suggestions
- **Visual Analytics** - Interactive charts powered by Chart.js
- **Client Profile Management** - Save and load multiple client profiles
- **White-Label Ready** - Easy customization for different agents

### Technical Features
- **Modern Stack** - React 18 + Vite + TypeScript
- **Type-Safe** - Full TypeScript coverage for reliability
- **State Management** - Zustand with local storage persistence
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Fast Performance** - Optimized builds with code splitting
- **Component Architecture** - Reusable, maintainable components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (current version: 24.5.0)
- npm or yarn

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

## 🎨 White-Label Customization

See [WHITE-LABEL-GUIDE.md](./WHITE-LABEL-GUIDE.md) for detailed instructions.

**Quick customization:**

1. Edit `/src/config/agent.config.ts`
2. Update agent name, contact info, and branding
3. Customize colors in `tailwind.config.js`
4. Add logo to `/public` folder

## 📊 Platform Modules

### 1. Client Input
- Comprehensive financial data entry
- Personal information, assets, liabilities, expenses
- Insurance status tracking

### 2. Dashboard
- Net worth overview
- Financial health score (0-100)
- Key metrics and critical alerts

### 3. Visual Analysis
- Asset allocation pie chart
- Assets vs liabilities bar chart
- Monthly expense breakdown

### 4. Risk Assessment
- Overall risk score
- 8-category analysis with recommendations
- Critical gap identification

### 5. Insurance Products
- Priority-based recommendations
- Cost estimates and coverage suggestions
- Feature comparisons

## 🛠️ Technology Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Chart.js + react-chartjs-2
- **State Management:** Zustand
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **PDF Generation:** jsPDF (ready for implementation)

## 📁 Project Structure

```
wealth-blueprint-pro/
├── src/
│   ├── components/         # React components
│   ├── config/             # White-label configuration
│   ├── store/              # State management
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Utility functions
│   └── App.tsx             # Main app
├── public/                 # Static assets
├── tailwind.config.js      # Tailwind config
└── package.json
```

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Drag /dist folder to Netlify
```

### Static Hosting
Upload contents of `/dist` folder after running `npm run build`

## 👤 Author

**Sony Ho** - Professional Financial Consultant
- Email: mrsonyho@gmail.com
- Platform: Wealth Blueprint

---

© 2025 Wealth Blueprint Platform | Version 2.0 (Modernized)
