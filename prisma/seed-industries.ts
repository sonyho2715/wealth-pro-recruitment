/**
 * ICE (Intelligent Calibration Engine) - Industry Seed Data
 *
 * This script seeds the database with:
 * 1. NAICS industry classifications for common small business sectors
 * 2. Industry benchmarks with percentile data (based on RMA/IBISWorld patterns)
 *
 * Run: npx tsx prisma/seed-industries.ts
 */

import { PrismaClient, RevenueTier } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// INDUSTRY CLASSIFICATIONS (NAICS)
// ============================================
const industries = [
  // === CONSTRUCTION (23) ===
  { naicsCode: '23', title: 'Construction', shortTitle: 'Construction', level: 2, parentCode: null },
  { naicsCode: '236', title: 'Construction of Buildings', shortTitle: 'Building Construction', level: 3, parentCode: '23' },
  { naicsCode: '236115', title: 'New Single-Family Housing Construction', shortTitle: 'Home Builders', level: 6, parentCode: '236' },
  { naicsCode: '236118', title: 'Residential Remodelers', shortTitle: 'Remodeling', level: 6, parentCode: '236' },
  { naicsCode: '238', title: 'Specialty Trade Contractors', shortTitle: 'Trade Contractors', level: 3, parentCode: '23' },
  { naicsCode: '238210', title: 'Electrical Contractors', shortTitle: 'Electrical', level: 6, parentCode: '238' },
  { naicsCode: '238220', title: 'Plumbing, Heating, and Air-Conditioning Contractors', shortTitle: 'HVAC/Plumbing', level: 6, parentCode: '238' },
  { naicsCode: '238320', title: 'Painting and Wall Covering Contractors', shortTitle: 'Painting', level: 6, parentCode: '238' },
  { naicsCode: '238910', title: 'Site Preparation Contractors', shortTitle: 'Site Prep', level: 6, parentCode: '238' },

  // === MANUFACTURING (31-33) ===
  { naicsCode: '31', title: 'Manufacturing', shortTitle: 'Manufacturing', level: 2, parentCode: null },
  { naicsCode: '327', title: 'Nonmetallic Mineral Product Manufacturing', shortTitle: 'Nonmetallic Products', level: 3, parentCode: '31' },
  { naicsCode: '327215', title: 'Glass Product Manufacturing', shortTitle: 'Glass Products', level: 6, parentCode: '327' },
  { naicsCode: '332', title: 'Fabricated Metal Product Manufacturing', shortTitle: 'Metal Fabrication', level: 3, parentCode: '31' },
  { naicsCode: '332710', title: 'Machine Shops', shortTitle: 'Machine Shops', level: 6, parentCode: '332' },

  // === RETAIL TRADE (44-45) ===
  { naicsCode: '44', title: 'Retail Trade', shortTitle: 'Retail', level: 2, parentCode: null },
  { naicsCode: '441', title: 'Motor Vehicle and Parts Dealers', shortTitle: 'Auto Dealers', level: 3, parentCode: '44' },
  { naicsCode: '441310', title: 'Automotive Parts and Accessories Stores', shortTitle: 'Auto Parts', level: 6, parentCode: '441' },
  { naicsCode: '445', title: 'Food and Beverage Stores', shortTitle: 'Food Stores', level: 3, parentCode: '44' },
  { naicsCode: '445110', title: 'Supermarkets and Grocery Stores', shortTitle: 'Grocery', level: 6, parentCode: '445' },
  { naicsCode: '448', title: 'Clothing and Clothing Accessories Stores', shortTitle: 'Clothing Stores', level: 3, parentCode: '44' },
  { naicsCode: '448140', title: 'Family Clothing Stores', shortTitle: 'Family Apparel', level: 6, parentCode: '448' },

  // === PROFESSIONAL SERVICES (54) ===
  { naicsCode: '54', title: 'Professional, Scientific, and Technical Services', shortTitle: 'Professional Services', level: 2, parentCode: null },
  { naicsCode: '541', title: 'Professional Services', shortTitle: 'Professional', level: 3, parentCode: '54' },
  { naicsCode: '541110', title: 'Offices of Lawyers', shortTitle: 'Law Firms', level: 6, parentCode: '541' },
  { naicsCode: '541211', title: 'Offices of CPAs', shortTitle: 'CPA Firms', level: 6, parentCode: '541' },
  { naicsCode: '541330', title: 'Engineering Services', shortTitle: 'Engineering', level: 6, parentCode: '541' },
  { naicsCode: '541511', title: 'Custom Computer Programming Services', shortTitle: 'Software Dev', level: 6, parentCode: '541' },
  { naicsCode: '541611', title: 'Management Consulting Services', shortTitle: 'Consulting', level: 6, parentCode: '541' },
  { naicsCode: '541810', title: 'Advertising Agencies', shortTitle: 'Advertising', level: 6, parentCode: '541' },
  { naicsCode: '541990', title: 'Other Professional Services', shortTitle: 'Other Prof Svcs', level: 6, parentCode: '541' },

  // === HEALTHCARE (62) ===
  { naicsCode: '62', title: 'Health Care and Social Assistance', shortTitle: 'Healthcare', level: 2, parentCode: null },
  { naicsCode: '621', title: 'Ambulatory Health Care Services', shortTitle: 'Ambulatory Care', level: 3, parentCode: '62' },
  { naicsCode: '621111', title: 'Offices of Physicians', shortTitle: 'Medical Practices', level: 6, parentCode: '621' },
  { naicsCode: '621210', title: 'Offices of Dentists', shortTitle: 'Dental Practices', level: 6, parentCode: '621' },
  { naicsCode: '621310', title: 'Offices of Chiropractors', shortTitle: 'Chiropractic', level: 6, parentCode: '621' },
  { naicsCode: '621399', title: 'Other Health Practitioners', shortTitle: 'Other Health', level: 6, parentCode: '621' },
  { naicsCode: '621610', title: 'Home Health Care Services', shortTitle: 'Home Health', level: 6, parentCode: '621' },

  // === FOOD SERVICES (72) ===
  { naicsCode: '72', title: 'Accommodation and Food Services', shortTitle: 'Food & Lodging', level: 2, parentCode: null },
  { naicsCode: '722', title: 'Food Services and Drinking Places', shortTitle: 'Food Services', level: 3, parentCode: '72' },
  { naicsCode: '722511', title: 'Full-Service Restaurants', shortTitle: 'Full-Service Dining', level: 6, parentCode: '722' },
  { naicsCode: '722513', title: 'Limited-Service Restaurants', shortTitle: 'Quick Service', level: 6, parentCode: '722' },
  { naicsCode: '722515', title: 'Snack and Nonalcoholic Beverage Bars', shortTitle: 'Cafes/Coffee', level: 6, parentCode: '722' },

  // === OTHER SERVICES (81) ===
  { naicsCode: '81', title: 'Other Services', shortTitle: 'Other Services', level: 2, parentCode: null },
  { naicsCode: '811', title: 'Repair and Maintenance', shortTitle: 'Repair Services', level: 3, parentCode: '81' },
  { naicsCode: '811111', title: 'General Automotive Repair', shortTitle: 'Auto Repair', level: 6, parentCode: '811' },
  { naicsCode: '811121', title: 'Automotive Body Repair', shortTitle: 'Auto Body', level: 6, parentCode: '811' },
  { naicsCode: '812', title: 'Personal and Laundry Services', shortTitle: 'Personal Services', level: 3, parentCode: '81' },
  { naicsCode: '812111', title: 'Barber Shops', shortTitle: 'Barber', level: 6, parentCode: '812' },
  { naicsCode: '812112', title: 'Beauty Salons', shortTitle: 'Beauty Salon', level: 6, parentCode: '812' },
  { naicsCode: '812199', title: 'Other Personal Care Services', shortTitle: 'Personal Care', level: 6, parentCode: '812' },
  { naicsCode: '812320', title: 'Dry Cleaning and Laundry Services', shortTitle: 'Dry Cleaning', level: 6, parentCode: '812' },
];

// ============================================
// BENCHMARK DATA BY INDUSTRY
// ============================================

interface BenchmarkData {
  naicsCode: string;
  tiers: {
    tier: RevenueTier;
    // Profitability (as decimals)
    grossProfitMargin: [number, number, number];  // [p25, p50, p75]
    netProfitMargin: [number, number, number];
    operatingMargin: [number, number, number];
    // Efficiency
    cogsRatio: [number, number, number];  // Lower is better
    laborCostRatio: [number, number, number];
    rentRatio: [number, number, number];
    // Liquidity & Leverage
    currentRatio: [number, number, number];
    debtToEquity: [number, number, number];
    // Growth & Pension
    revenueGrowth: [number, number, number];
    pensionRate: [number, number, number];
    sampleSize: number;
  }[];
}

// Sample benchmark data (based on industry patterns)
const benchmarkData: BenchmarkData[] = [
  // Glass Products Manufacturing (like Zion Glass)
  {
    naicsCode: '327215',
    tiers: [
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.28, 0.38, 0.48],
        netProfitMargin: [-0.02, 0.05, 0.12],
        operatingMargin: [0.02, 0.08, 0.15],
        cogsRatio: [0.52, 0.62, 0.72],
        laborCostRatio: [0.18, 0.25, 0.32],
        rentRatio: [0.03, 0.05, 0.08],
        currentRatio: [0.9, 1.4, 2.2],
        debtToEquity: [0.5, 1.2, 2.5],
        revenueGrowth: [-0.05, 0.05, 0.15],
        pensionRate: [0, 0.01, 0.03],
        sampleSize: 145,
      },
      {
        tier: 'TIER_1M_3M',
        grossProfitMargin: [0.32, 0.42, 0.52],
        netProfitMargin: [0.02, 0.08, 0.15],
        operatingMargin: [0.05, 0.12, 0.18],
        cogsRatio: [0.48, 0.58, 0.68],
        laborCostRatio: [0.15, 0.22, 0.28],
        rentRatio: [0.02, 0.04, 0.06],
        currentRatio: [1.1, 1.8, 2.8],
        debtToEquity: [0.4, 0.9, 1.8],
        revenueGrowth: [0, 0.08, 0.18],
        pensionRate: [0.01, 0.02, 0.04],
        sampleSize: 89,
      },
    ],
  },

  // Full-Service Restaurants
  {
    naicsCode: '722511',
    tiers: [
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.58, 0.65, 0.72],
        netProfitMargin: [-0.03, 0.03, 0.08],
        operatingMargin: [0.02, 0.06, 0.12],
        cogsRatio: [0.28, 0.35, 0.42],
        laborCostRatio: [0.30, 0.35, 0.42],
        rentRatio: [0.06, 0.08, 0.12],
        currentRatio: [0.5, 0.8, 1.3],
        debtToEquity: [1.0, 2.5, 5.0],
        revenueGrowth: [-0.08, 0.03, 0.12],
        pensionRate: [0, 0.005, 0.015],
        sampleSize: 523,
      },
      {
        tier: 'TIER_1M_3M',
        grossProfitMargin: [0.60, 0.68, 0.75],
        netProfitMargin: [0.01, 0.05, 0.10],
        operatingMargin: [0.04, 0.08, 0.14],
        cogsRatio: [0.25, 0.32, 0.40],
        laborCostRatio: [0.28, 0.33, 0.38],
        rentRatio: [0.05, 0.07, 0.10],
        currentRatio: [0.6, 1.0, 1.5],
        debtToEquity: [0.8, 2.0, 4.0],
        revenueGrowth: [-0.05, 0.05, 0.15],
        pensionRate: [0.005, 0.01, 0.025],
        sampleSize: 312,
      },
    ],
  },

  // Limited-Service / Quick Service Restaurants
  {
    naicsCode: '722513',
    tiers: [
      {
        tier: 'TIER_250K_500K',
        grossProfitMargin: [0.55, 0.62, 0.70],
        netProfitMargin: [-0.05, 0.02, 0.07],
        operatingMargin: [0, 0.04, 0.10],
        cogsRatio: [0.30, 0.38, 0.45],
        laborCostRatio: [0.25, 0.30, 0.38],
        rentRatio: [0.08, 0.10, 0.14],
        currentRatio: [0.4, 0.7, 1.1],
        debtToEquity: [1.5, 3.0, 6.0],
        revenueGrowth: [-0.10, 0.02, 0.10],
        pensionRate: [0, 0.003, 0.01],
        sampleSize: 412,
      },
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.58, 0.65, 0.72],
        netProfitMargin: [-0.02, 0.04, 0.09],
        operatingMargin: [0.02, 0.06, 0.12],
        cogsRatio: [0.28, 0.35, 0.42],
        laborCostRatio: [0.24, 0.28, 0.35],
        rentRatio: [0.06, 0.09, 0.12],
        currentRatio: [0.5, 0.9, 1.4],
        debtToEquity: [1.2, 2.5, 5.0],
        revenueGrowth: [-0.05, 0.05, 0.12],
        pensionRate: [0, 0.005, 0.015],
        sampleSize: 287,
      },
    ],
  },

  // Professional Services (Consulting)
  {
    naicsCode: '541611',
    tiers: [
      {
        tier: 'TIER_250K_500K',
        grossProfitMargin: [0.75, 0.85, 0.92],
        netProfitMargin: [0.08, 0.18, 0.30],
        operatingMargin: [0.12, 0.22, 0.35],
        cogsRatio: [0.08, 0.15, 0.25],
        laborCostRatio: [0.35, 0.45, 0.55],
        rentRatio: [0.02, 0.04, 0.08],
        currentRatio: [1.5, 2.5, 4.0],
        debtToEquity: [0.1, 0.3, 0.8],
        revenueGrowth: [0, 0.10, 0.25],
        pensionRate: [0.01, 0.03, 0.06],
        sampleSize: 234,
      },
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.78, 0.88, 0.94],
        netProfitMargin: [0.12, 0.22, 0.35],
        operatingMargin: [0.15, 0.28, 0.40],
        cogsRatio: [0.06, 0.12, 0.22],
        laborCostRatio: [0.32, 0.42, 0.52],
        rentRatio: [0.02, 0.03, 0.06],
        currentRatio: [1.8, 3.0, 5.0],
        debtToEquity: [0.05, 0.2, 0.5],
        revenueGrowth: [0.02, 0.12, 0.28],
        pensionRate: [0.02, 0.04, 0.08],
        sampleSize: 178,
      },
      {
        tier: 'TIER_1M_3M',
        grossProfitMargin: [0.80, 0.90, 0.95],
        netProfitMargin: [0.15, 0.25, 0.38],
        operatingMargin: [0.18, 0.32, 0.45],
        cogsRatio: [0.05, 0.10, 0.20],
        laborCostRatio: [0.30, 0.38, 0.48],
        rentRatio: [0.01, 0.025, 0.05],
        currentRatio: [2.0, 3.5, 6.0],
        debtToEquity: [0.03, 0.15, 0.4],
        revenueGrowth: [0.05, 0.15, 0.30],
        pensionRate: [0.03, 0.05, 0.09],
        sampleSize: 145,
      },
    ],
  },

  // Software Development
  {
    naicsCode: '541511',
    tiers: [
      {
        tier: 'TIER_250K_500K',
        grossProfitMargin: [0.80, 0.88, 0.95],
        netProfitMargin: [0.10, 0.20, 0.35],
        operatingMargin: [0.15, 0.25, 0.40],
        cogsRatio: [0.05, 0.12, 0.20],
        laborCostRatio: [0.40, 0.50, 0.60],
        rentRatio: [0.01, 0.02, 0.04],
        currentRatio: [2.0, 3.5, 6.0],
        debtToEquity: [0.05, 0.2, 0.5],
        revenueGrowth: [0.05, 0.20, 0.40],
        pensionRate: [0.02, 0.04, 0.07],
        sampleSize: 189,
      },
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.82, 0.90, 0.96],
        netProfitMargin: [0.12, 0.25, 0.40],
        operatingMargin: [0.18, 0.30, 0.45],
        cogsRatio: [0.04, 0.10, 0.18],
        laborCostRatio: [0.38, 0.48, 0.58],
        rentRatio: [0.01, 0.02, 0.03],
        currentRatio: [2.5, 4.0, 7.0],
        debtToEquity: [0.02, 0.15, 0.4],
        revenueGrowth: [0.08, 0.25, 0.45],
        pensionRate: [0.03, 0.05, 0.09],
        sampleSize: 156,
      },
    ],
  },

  // Auto Repair
  {
    naicsCode: '811111',
    tiers: [
      {
        tier: 'TIER_250K_500K',
        grossProfitMargin: [0.45, 0.55, 0.65],
        netProfitMargin: [0.02, 0.08, 0.15],
        operatingMargin: [0.05, 0.12, 0.20],
        cogsRatio: [0.35, 0.45, 0.55],
        laborCostRatio: [0.20, 0.28, 0.35],
        rentRatio: [0.04, 0.06, 0.10],
        currentRatio: [0.8, 1.3, 2.0],
        debtToEquity: [0.5, 1.2, 2.5],
        revenueGrowth: [-0.03, 0.05, 0.12],
        pensionRate: [0, 0.01, 0.025],
        sampleSize: 298,
      },
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.48, 0.58, 0.68],
        netProfitMargin: [0.05, 0.12, 0.18],
        operatingMargin: [0.08, 0.15, 0.22],
        cogsRatio: [0.32, 0.42, 0.52],
        laborCostRatio: [0.18, 0.25, 0.32],
        rentRatio: [0.03, 0.05, 0.08],
        currentRatio: [1.0, 1.5, 2.3],
        debtToEquity: [0.4, 1.0, 2.0],
        revenueGrowth: [0, 0.08, 0.15],
        pensionRate: [0.005, 0.015, 0.03],
        sampleSize: 187,
      },
    ],
  },

  // HVAC/Plumbing Contractors
  {
    naicsCode: '238220',
    tiers: [
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.35, 0.45, 0.55],
        netProfitMargin: [0.03, 0.08, 0.15],
        operatingMargin: [0.06, 0.12, 0.18],
        cogsRatio: [0.45, 0.55, 0.65],
        laborCostRatio: [0.22, 0.30, 0.38],
        rentRatio: [0.02, 0.04, 0.06],
        currentRatio: [1.0, 1.6, 2.4],
        debtToEquity: [0.4, 1.0, 2.0],
        revenueGrowth: [0, 0.08, 0.18],
        pensionRate: [0.005, 0.015, 0.03],
        sampleSize: 234,
      },
      {
        tier: 'TIER_1M_3M',
        grossProfitMargin: [0.38, 0.48, 0.58],
        netProfitMargin: [0.05, 0.12, 0.18],
        operatingMargin: [0.08, 0.15, 0.22],
        cogsRatio: [0.42, 0.52, 0.62],
        laborCostRatio: [0.20, 0.28, 0.35],
        rentRatio: [0.015, 0.03, 0.05],
        currentRatio: [1.2, 1.8, 2.8],
        debtToEquity: [0.3, 0.8, 1.5],
        revenueGrowth: [0.03, 0.10, 0.20],
        pensionRate: [0.01, 0.02, 0.04],
        sampleSize: 167,
      },
    ],
  },

  // Electrical Contractors
  {
    naicsCode: '238210',
    tiers: [
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.32, 0.42, 0.52],
        netProfitMargin: [0.02, 0.07, 0.13],
        operatingMargin: [0.05, 0.10, 0.16],
        cogsRatio: [0.48, 0.58, 0.68],
        laborCostRatio: [0.25, 0.32, 0.40],
        rentRatio: [0.02, 0.035, 0.05],
        currentRatio: [1.0, 1.5, 2.2],
        debtToEquity: [0.5, 1.2, 2.2],
        revenueGrowth: [-0.02, 0.06, 0.15],
        pensionRate: [0.005, 0.012, 0.025],
        sampleSize: 256,
      },
      {
        tier: 'TIER_1M_3M',
        grossProfitMargin: [0.35, 0.45, 0.55],
        netProfitMargin: [0.04, 0.10, 0.16],
        operatingMargin: [0.07, 0.13, 0.20],
        cogsRatio: [0.45, 0.55, 0.65],
        laborCostRatio: [0.22, 0.30, 0.38],
        rentRatio: [0.015, 0.03, 0.045],
        currentRatio: [1.2, 1.8, 2.6],
        debtToEquity: [0.4, 0.9, 1.8],
        revenueGrowth: [0, 0.08, 0.18],
        pensionRate: [0.01, 0.02, 0.035],
        sampleSize: 189,
      },
    ],
  },

  // Beauty Salons
  {
    naicsCode: '812112',
    tiers: [
      {
        tier: 'TIER_0_250K',
        grossProfitMargin: [0.55, 0.65, 0.75],
        netProfitMargin: [0, 0.08, 0.18],
        operatingMargin: [0.05, 0.12, 0.22],
        cogsRatio: [0.25, 0.35, 0.45],
        laborCostRatio: [0.35, 0.42, 0.50],
        rentRatio: [0.08, 0.12, 0.18],
        currentRatio: [0.6, 1.0, 1.6],
        debtToEquity: [0.8, 1.8, 3.5],
        revenueGrowth: [-0.05, 0.05, 0.15],
        pensionRate: [0, 0.005, 0.015],
        sampleSize: 345,
      },
      {
        tier: 'TIER_250K_500K',
        grossProfitMargin: [0.58, 0.68, 0.78],
        netProfitMargin: [0.05, 0.12, 0.22],
        operatingMargin: [0.08, 0.15, 0.25],
        cogsRatio: [0.22, 0.32, 0.42],
        laborCostRatio: [0.32, 0.40, 0.48],
        rentRatio: [0.06, 0.10, 0.15],
        currentRatio: [0.8, 1.2, 2.0],
        debtToEquity: [0.6, 1.5, 3.0],
        revenueGrowth: [0, 0.08, 0.18],
        pensionRate: [0.005, 0.01, 0.02],
        sampleSize: 234,
      },
    ],
  },

  // CPA Firms
  {
    naicsCode: '541211',
    tiers: [
      {
        tier: 'TIER_250K_500K',
        grossProfitMargin: [0.70, 0.80, 0.88],
        netProfitMargin: [0.12, 0.22, 0.32],
        operatingMargin: [0.15, 0.28, 0.38],
        cogsRatio: [0.12, 0.20, 0.30],
        laborCostRatio: [0.35, 0.45, 0.52],
        rentRatio: [0.03, 0.05, 0.08],
        currentRatio: [1.5, 2.5, 4.0],
        debtToEquity: [0.1, 0.35, 0.8],
        revenueGrowth: [0.02, 0.08, 0.15],
        pensionRate: [0.02, 0.04, 0.07],
        sampleSize: 278,
      },
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.72, 0.82, 0.90],
        netProfitMargin: [0.15, 0.25, 0.35],
        operatingMargin: [0.18, 0.30, 0.42],
        cogsRatio: [0.10, 0.18, 0.28],
        laborCostRatio: [0.32, 0.42, 0.50],
        rentRatio: [0.025, 0.04, 0.07],
        currentRatio: [1.8, 3.0, 5.0],
        debtToEquity: [0.08, 0.25, 0.6],
        revenueGrowth: [0.03, 0.10, 0.18],
        pensionRate: [0.03, 0.05, 0.09],
        sampleSize: 198,
      },
    ],
  },

  // Medical Practices
  {
    naicsCode: '621111',
    tiers: [
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.50, 0.60, 0.70],
        netProfitMargin: [0.08, 0.15, 0.25],
        operatingMargin: [0.12, 0.20, 0.30],
        cogsRatio: [0.30, 0.40, 0.50],
        laborCostRatio: [0.28, 0.35, 0.42],
        rentRatio: [0.04, 0.06, 0.10],
        currentRatio: [1.2, 2.0, 3.2],
        debtToEquity: [0.3, 0.8, 1.8],
        revenueGrowth: [0, 0.06, 0.12],
        pensionRate: [0.02, 0.04, 0.07],
        sampleSize: 345,
      },
      {
        tier: 'TIER_1M_3M',
        grossProfitMargin: [0.52, 0.62, 0.72],
        netProfitMargin: [0.10, 0.18, 0.28],
        operatingMargin: [0.14, 0.22, 0.32],
        cogsRatio: [0.28, 0.38, 0.48],
        laborCostRatio: [0.25, 0.32, 0.40],
        rentRatio: [0.035, 0.05, 0.08],
        currentRatio: [1.4, 2.2, 3.5],
        debtToEquity: [0.25, 0.6, 1.5],
        revenueGrowth: [0.02, 0.08, 0.15],
        pensionRate: [0.03, 0.05, 0.08],
        sampleSize: 267,
      },
    ],
  },

  // Dental Practices
  {
    naicsCode: '621210',
    tiers: [
      {
        tier: 'TIER_500K_1M',
        grossProfitMargin: [0.55, 0.65, 0.75],
        netProfitMargin: [0.12, 0.20, 0.30],
        operatingMargin: [0.15, 0.25, 0.35],
        cogsRatio: [0.25, 0.35, 0.45],
        laborCostRatio: [0.25, 0.32, 0.40],
        rentRatio: [0.05, 0.07, 0.11],
        currentRatio: [1.3, 2.2, 3.5],
        debtToEquity: [0.4, 1.0, 2.0],
        revenueGrowth: [0.02, 0.08, 0.15],
        pensionRate: [0.025, 0.05, 0.08],
        sampleSize: 312,
      },
      {
        tier: 'TIER_1M_3M',
        grossProfitMargin: [0.58, 0.68, 0.78],
        netProfitMargin: [0.15, 0.25, 0.35],
        operatingMargin: [0.18, 0.28, 0.38],
        cogsRatio: [0.22, 0.32, 0.42],
        laborCostRatio: [0.22, 0.30, 0.38],
        rentRatio: [0.04, 0.06, 0.09],
        currentRatio: [1.5, 2.5, 4.0],
        debtToEquity: [0.3, 0.8, 1.6],
        revenueGrowth: [0.03, 0.10, 0.18],
        pensionRate: [0.03, 0.06, 0.10],
        sampleSize: 234,
      },
    ],
  },

  // Home Builders
  {
    naicsCode: '236115',
    tiers: [
      {
        tier: 'TIER_1M_3M',
        grossProfitMargin: [0.18, 0.25, 0.32],
        netProfitMargin: [0.02, 0.06, 0.12],
        operatingMargin: [0.04, 0.08, 0.14],
        cogsRatio: [0.68, 0.75, 0.82],
        laborCostRatio: [0.08, 0.12, 0.18],
        rentRatio: [0.01, 0.02, 0.035],
        currentRatio: [1.0, 1.5, 2.2],
        debtToEquity: [0.8, 1.5, 3.0],
        revenueGrowth: [-0.05, 0.08, 0.22],
        pensionRate: [0.005, 0.015, 0.03],
        sampleSize: 178,
      },
      {
        tier: 'TIER_3M_5M',
        grossProfitMargin: [0.20, 0.28, 0.35],
        netProfitMargin: [0.04, 0.08, 0.14],
        operatingMargin: [0.06, 0.10, 0.16],
        cogsRatio: [0.65, 0.72, 0.80],
        laborCostRatio: [0.06, 0.10, 0.15],
        rentRatio: [0.008, 0.015, 0.025],
        currentRatio: [1.2, 1.8, 2.5],
        debtToEquity: [0.6, 1.2, 2.5],
        revenueGrowth: [0, 0.10, 0.25],
        pensionRate: [0.01, 0.02, 0.04],
        sampleSize: 134,
      },
    ],
  },
];

// ============================================
// SEED FUNCTION
// ============================================
async function seed() {
  console.log('Starting ICE industry seed...\n');

  // 1. Seed Industry Classifications
  console.log('Seeding industry classifications...');
  for (const industry of industries) {
    await prisma.industryClassification.upsert({
      where: { naicsCode: industry.naicsCode },
      update: {
        title: industry.title,
        shortTitle: industry.shortTitle,
        level: industry.level,
        parentCode: industry.parentCode,
      },
      create: industry,
    });
  }
  console.log(`  Created/updated ${industries.length} industry classifications`);

  // 2. Seed Industry Benchmarks
  console.log('\nSeeding industry benchmarks...');
  let benchmarkCount = 0;

  for (const data of benchmarkData) {
    const industry = await prisma.industryClassification.findUnique({
      where: { naicsCode: data.naicsCode },
    });

    if (!industry) {
      console.log(`  Warning: Industry ${data.naicsCode} not found, skipping benchmarks`);
      continue;
    }

    for (const tier of data.tiers) {
      await prisma.industryBenchmark.upsert({
        where: {
          industryId_revenueTier_dataYear: {
            industryId: industry.id,
            revenueTier: tier.tier,
            dataYear: 2024,
          },
        },
        update: {
          grossProfitMargin_p25: tier.grossProfitMargin[0],
          grossProfitMargin_p50: tier.grossProfitMargin[1],
          grossProfitMargin_p75: tier.grossProfitMargin[2],
          netProfitMargin_p25: tier.netProfitMargin[0],
          netProfitMargin_p50: tier.netProfitMargin[1],
          netProfitMargin_p75: tier.netProfitMargin[2],
          operatingMargin_p25: tier.operatingMargin[0],
          operatingMargin_p50: tier.operatingMargin[1],
          operatingMargin_p75: tier.operatingMargin[2],
          cogsRatio_p25: tier.cogsRatio[0],
          cogsRatio_p50: tier.cogsRatio[1],
          cogsRatio_p75: tier.cogsRatio[2],
          laborCostRatio_p25: tier.laborCostRatio[0],
          laborCostRatio_p50: tier.laborCostRatio[1],
          laborCostRatio_p75: tier.laborCostRatio[2],
          rentRatio_p25: tier.rentRatio[0],
          rentRatio_p50: tier.rentRatio[1],
          rentRatio_p75: tier.rentRatio[2],
          currentRatio_p25: tier.currentRatio[0],
          currentRatio_p50: tier.currentRatio[1],
          currentRatio_p75: tier.currentRatio[2],
          debtToEquity_p25: tier.debtToEquity[0],
          debtToEquity_p50: tier.debtToEquity[1],
          debtToEquity_p75: tier.debtToEquity[2],
          revenueGrowth_p25: tier.revenueGrowth[0],
          revenueGrowth_p50: tier.revenueGrowth[1],
          revenueGrowth_p75: tier.revenueGrowth[2],
          pensionContributionRate_p25: tier.pensionRate[0],
          pensionContributionRate_p50: tier.pensionRate[1],
          pensionContributionRate_p75: tier.pensionRate[2],
          sampleSize: tier.sampleSize,
          source: 'Sample',
        },
        create: {
          industryId: industry.id,
          revenueTier: tier.tier,
          dataYear: 2024,
          grossProfitMargin_p25: tier.grossProfitMargin[0],
          grossProfitMargin_p50: tier.grossProfitMargin[1],
          grossProfitMargin_p75: tier.grossProfitMargin[2],
          netProfitMargin_p25: tier.netProfitMargin[0],
          netProfitMargin_p50: tier.netProfitMargin[1],
          netProfitMargin_p75: tier.netProfitMargin[2],
          operatingMargin_p25: tier.operatingMargin[0],
          operatingMargin_p50: tier.operatingMargin[1],
          operatingMargin_p75: tier.operatingMargin[2],
          cogsRatio_p25: tier.cogsRatio[0],
          cogsRatio_p50: tier.cogsRatio[1],
          cogsRatio_p75: tier.cogsRatio[2],
          laborCostRatio_p25: tier.laborCostRatio[0],
          laborCostRatio_p50: tier.laborCostRatio[1],
          laborCostRatio_p75: tier.laborCostRatio[2],
          rentRatio_p25: tier.rentRatio[0],
          rentRatio_p50: tier.rentRatio[1],
          rentRatio_p75: tier.rentRatio[2],
          currentRatio_p25: tier.currentRatio[0],
          currentRatio_p50: tier.currentRatio[1],
          currentRatio_p75: tier.currentRatio[2],
          debtToEquity_p25: tier.debtToEquity[0],
          debtToEquity_p50: tier.debtToEquity[1],
          debtToEquity_p75: tier.debtToEquity[2],
          revenueGrowth_p25: tier.revenueGrowth[0],
          revenueGrowth_p50: tier.revenueGrowth[1],
          revenueGrowth_p75: tier.revenueGrowth[2],
          pensionContributionRate_p25: tier.pensionRate[0],
          pensionContributionRate_p50: tier.pensionRate[1],
          pensionContributionRate_p75: tier.pensionRate[2],
          sampleSize: tier.sampleSize,
          source: 'Sample',
        },
      });
      benchmarkCount++;
    }
  }
  console.log(`  Created/updated ${benchmarkCount} industry benchmarks`);

  console.log('\n=== ICE Industry Seed Complete ===');
  console.log(`Industries: ${industries.length}`);
  console.log(`Benchmarks: ${benchmarkCount}`);
}

// Run seed
seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
