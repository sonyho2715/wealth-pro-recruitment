import { useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import {
  Shield,
  Heart,
  Briefcase,
  Home,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  GitCompare,
  Sparkles,
} from 'lucide-react';

interface InsuranceQuote {
  provider: string;
  productName: string;
  coverage: number;
  term?: number;
  monthlyPremium: number;
  annualPremium: number;
  features: string[];
  rating: string;
  recommended?: boolean;
}

interface DisabilityQuote {
  provider: string;
  monthlyBenefit: number;
  eliminationPeriod: number;
  benefitPeriod: string;
  monthlyPremium: number;
  ownOccupation: boolean;
  colaRider: boolean;
  recommended?: boolean;
}

interface IULQuote {
  provider: string;
  productName: string;
  deathBenefit: number;
  monthlyPremium: number;
  annualPremium: number;
  cashValueProjection10yr: number;
  cashValueProjection20yr: number;
  livingBenefits: string[];
  features: string[];
  rating: string;
  recommended?: boolean;
}

interface HybridStrategy {
  strategyName: string;
  termCoverage: number;
  termLength: number;
  termMonthlyPremium: number;
  permanentType: 'IUL' | 'Whole Life';
  permanentCoverage: number;
  permanentMonthlyPremium: number;
  permanentCashValue10yr: number;
  permanentCashValue20yr: number;
  totalCoverage: number;
  totalMonthlyPremium: number;
  benefits: string[];
  whenToUse: string;
  recommended?: boolean;
}

export default function EnhancedInsurance() {
  const { currentClient, currentMetrics } = useClientStore();
  const [activeTab, setActiveTab] = useState<'term-life' | 'iul' | 'hybrid' | 'disability' | 'umbrella' | 'long-term-care'>('term-life');

  // Hybrid strategy customization state
  const [customizingStrategy, setCustomizingStrategy] = useState<HybridStrategy | null>(null);
  const [customTermPercentage, setCustomTermPercentage] = useState(80);
  const [customTotalCoverage, setCustomTotalCoverage] = useState(0);
  const [customPermanentType, setCustomPermanentType] = useState<'IUL' | 'Whole Life'>('IUL');
  const [customTermLength, setCustomTermLength] = useState(20);

  // Term life insurance customization state
  const [customizingTermLife, setCustomizingTermLife] = useState(false);
  const [customTermCoverage, setCustomTermCoverage] = useState(0);
  const [customTermLifeLength, setCustomTermLifeLength] = useState(20);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');

  // IUL customization state
  const [customizingIUL, setCustomizingIUL] = useState(false);
  const [customIULCoverage, setCustomIULCoverage] = useState(0);
  const [selectedIULCarrier, setSelectedIULCarrier] = useState<string>('');

  if (!currentClient || !currentMetrics) {
    return null;
  }

  const age = currentClient.age;
  const income = currentMetrics.totalIncome;
  const lifeInsuranceNeeded = currentMetrics.lifeInsuranceNeeded;
  const disabilityInsuranceNeeded = currentMetrics.disabilityInsuranceNeeded;

  // Calculate term life insurance quotes based on age and coverage
  const calculateTermLifePremium = (coverage: number, term: number): number => {
    const baseCost = coverage / 100000; // Base cost per $100K
    const ageFactor = 1 + (age - 30) * 0.05; // Age multiplier
    const termFactor = term === 10 ? 0.8 : term === 20 ? 1.0 : 1.2; // Term multiplier
    return Math.round(baseCost * ageFactor * termFactor * 30); // ~$30/month per $100K base
  };

  // Generate term life insurance quotes
  const termLifeQuotes: InsuranceQuote[] = [
    {
      provider: 'Ethos',
      productName: 'Term Life Insurance',
      coverage: lifeInsuranceNeeded,
      term: 20,
      monthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded, 20) * 1.1,
      annualPremium: calculateTermLifePremium(lifeInsuranceNeeded, 20) * 12 * 1.1,
      features: [
        'No medical exam required (simplified issue)',
        'Apply 100% online in minutes',
        'Coverage up to $3 million',
        'Convertible to permanent insurance',
        'Living benefits rider available',
      ],
      rating: 'A',
      recommended: true,
    },
    {
      provider: 'John Hancock',
      productName: 'Term Life with Vitality',
      coverage: lifeInsuranceNeeded,
      term: 20,
      monthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded, 20) * 1.05,
      annualPremium: calculateTermLifePremium(lifeInsuranceNeeded, 20) * 12 * 1.05,
      features: [
        'Level premium for 20 years',
        'Vitality program rewards for healthy living',
        'Accelerated death benefit for chronic/terminal illness',
        'Convertible without medical exam',
        'Premium discounts up to 25% for healthy behaviors',
      ],
      rating: 'A+',
    },
    {
      provider: 'National Life Group',
      productName: 'Level Term Plus',
      coverage: lifeInsuranceNeeded,
      term: 20,
      monthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded, 20),
      annualPremium: calculateTermLifePremium(lifeInsuranceNeeded, 20) * 12,
      features: [
        'Competitive pricing for standard health',
        'Waiver of premium for disability',
        'Accelerated death benefit rider',
        'Convertible to FlexLife IUL',
        'Excellent customer service ratings',
      ],
      rating: 'A+',
    },
    {
      provider: 'F&G (Fidelity & Guaranty)',
      productName: 'Term Life',
      coverage: lifeInsuranceNeeded,
      term: 30,
      monthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded, 30) * 0.95,
      annualPremium: calculateTermLifePremium(lifeInsuranceNeeded, 30) * 12 * 0.95,
      features: [
        'Extended 30-year coverage period',
        'Level premium guarantee',
        'Return of premium option available',
        'Convertible to F&G IUL products',
        'Strong financial ratings',
      ],
      rating: 'A',
    },
  ];

  // Calculate IUL insurance premiums
  const calculateIULPremium = (deathBenefit: number): number => {
    const baseCost = deathBenefit / 100000; // Base cost per $100K
    const ageFactor = 1 + (age - 30) * 0.08; // Age multiplier (higher than term)
    return Math.round(baseCost * ageFactor * 120); // ~$120/month per $100K base
  };

  // Generate IUL (Indexed Universal Life) insurance quotes
  const iulQuotes: IULQuote[] = [
    {
      provider: 'National Life Group',
      productName: 'FlexLife Indexed Universal Life',
      deathBenefit: lifeInsuranceNeeded,
      monthlyPremium: calculateIULPremium(lifeInsuranceNeeded),
      annualPremium: calculateIULPremium(lifeInsuranceNeeded) * 12,
      cashValueProjection10yr: calculateIULPremium(lifeInsuranceNeeded) * 12 * 10 * 1.4,
      cashValueProjection20yr: calculateIULPremium(lifeInsuranceNeeded) * 12 * 20 * 1.8,
      livingBenefits: [
        'Premium Chronic Care Rider - Access benefits if unable to perform 2+ ADLs',
        'Critical Illness - Accelerated death benefit for covered conditions',
        'Terminal Illness - Full acceleration with 12 months or less to live',
        'Value Added Services - Caregiving support and resources',
      ],
      features: [
        'Lifetime coverage - never expires',
        'S&P 500 and MSCI Emerging Markets index options',
        '0% floor - guaranteed no losses from market downturns',
        'Minimum guaranteed interest rate of 1%',
        'Flexible premiums after minimum funding',
        'Tax-free policy loans for retirement income',
      ],
      rating: 'A+',
      recommended: true,
    },
    {
      provider: 'John Hancock',
      productName: 'Accumulation IUL 24',
      deathBenefit: lifeInsuranceNeeded,
      monthlyPremium: calculateIULPremium(lifeInsuranceNeeded) * 1.05,
      annualPremium: calculateIULPremium(lifeInsuranceNeeded) * 12 * 1.05,
      cashValueProjection10yr: calculateIULPremium(lifeInsuranceNeeded) * 12 * 10 * 1.45,
      cashValueProjection20yr: calculateIULPremium(lifeInsuranceNeeded) * 12 * 20 * 1.85,
      livingBenefits: [
        'Chronic Illness Rider - Up to 2% monthly benefit for chronic conditions',
        'Critical Illness Extension - Coverage for heart attack, stroke, cancer',
        'Terminal Illness - 100% death benefit acceleration',
      ],
      features: [
        'No-Lapse Guarantee automatically included',
        'Base Capped indexed account with transparent crediting',
        'Multiple index allocation strategies',
        '0% floor with no indexed performance charge',
        'Vitality wellness program integration available',
        'Strong accumulation potential for retirement',
      ],
      rating: 'A+',
    },
    {
      provider: 'F&G (Fidelity & Guaranty)',
      productName: 'Pathsetter Indexed UL',
      deathBenefit: lifeInsuranceNeeded,
      monthlyPremium: calculateIULPremium(lifeInsuranceNeeded) * 0.97,
      annualPremium: calculateIULPremium(lifeInsuranceNeeded) * 12 * 0.97,
      cashValueProjection10yr: calculateIULPremium(lifeInsuranceNeeded) * 12 * 10 * 1.42,
      cashValueProjection20yr: calculateIULPremium(lifeInsuranceNeeded) * 12 * 20 * 1.82,
      livingBenefits: [
        'Critical Illness Accelerated Benefit - Early access for major diagnoses',
        'Chronic Illness Rider - Monthly payments for long-term care needs',
        'Terminal Illness - Full death benefit advance',
      ],
      features: [
        'Permanent lifetime protection',
        'Competitive cap rates on index crediting',
        'Multiple indexed account options',
        '0% floor - principal protection guaranteed',
        'Flexible premium and death benefit options',
        'Tax-advantaged cash value accumulation',
      ],
      rating: 'A',
    },
    {
      provider: 'John Hancock',
      productName: 'Protection IUL 24',
      deathBenefit: lifeInsuranceNeeded,
      monthlyPremium: calculateIULPremium(lifeInsuranceNeeded) * 1.02,
      annualPremium: calculateIULPremium(lifeInsuranceNeeded) * 12 * 1.02,
      cashValueProjection10yr: calculateIULPremium(lifeInsuranceNeeded) * 12 * 10 * 1.38,
      cashValueProjection20yr: calculateIULPremium(lifeInsuranceNeeded) * 12 * 20 * 1.78,
      livingBenefits: [
        'Death Benefit Protection (DBP) - No-lapse guarantee',
        'Chronic and Critical Illness riders available',
        'Terminal Illness - Accelerated death benefit',
      ],
      features: [
        'Enhanced death benefit protection focus',
        'Policy guaranteed not to lapse even if cash value drops to zero',
        'Base Capped indexed account with simple crediting',
        'No indexed performance charge or multipliers',
        'Ideal for permanent protection priority',
        'Flexible indexing strategies',
      ],
      rating: 'A+',
    },
  ];

  // Generate hybrid insurance strategies
  const hybridStrategies: HybridStrategy[] = [
    {
      strategyName: 'Young Family Builder (80/20 Term/IUL)',
      termCoverage: lifeInsuranceNeeded * 0.8,
      termLength: 20,
      termMonthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded * 0.8, 20),
      permanentType: 'IUL',
      permanentCoverage: lifeInsuranceNeeded * 0.2,
      permanentMonthlyPremium: calculateIULPremium(lifeInsuranceNeeded * 0.2),
      permanentCashValue10yr: calculateIULPremium(lifeInsuranceNeeded * 0.2) * 12 * 10 * 1.4,
      permanentCashValue20yr: calculateIULPremium(lifeInsuranceNeeded * 0.2) * 12 * 20 * 1.8,
      totalCoverage: lifeInsuranceNeeded,
      totalMonthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded * 0.8, 20) + calculateIULPremium(lifeInsuranceNeeded * 0.2),
      benefits: [
        'Immediate high coverage for young family needs',
        'Affordable monthly premium (60-70% less than 100% IUL)',
        'Build permanent coverage + cash value for retirement',
        'Living benefits on IUL portion for critical illness',
        'Flexibility: Convert term to permanent later if needed',
        'Best of both worlds: protection now + wealth building',
      ],
      whenToUse: 'Best for young families (age 30-45) with high coverage needs but limited budget. Need maximum protection now while kids are young.',
      recommended: true,
    },
    {
      strategyName: 'Balanced Approach (50/50 Term/IUL)',
      termCoverage: lifeInsuranceNeeded * 0.5,
      termLength: 20,
      termMonthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded * 0.5, 20),
      permanentType: 'IUL',
      permanentCoverage: lifeInsuranceNeeded * 0.5,
      permanentMonthlyPremium: calculateIULPremium(lifeInsuranceNeeded * 0.5),
      permanentCashValue10yr: calculateIULPremium(lifeInsuranceNeeded * 0.5) * 12 * 10 * 1.4,
      permanentCashValue20yr: calculateIULPremium(lifeInsuranceNeeded * 0.5) * 12 * 20 * 1.8,
      totalCoverage: lifeInsuranceNeeded,
      totalMonthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded * 0.5, 20) + calculateIULPremium(lifeInsuranceNeeded * 0.5),
      benefits: [
        'Balanced protection and wealth accumulation',
        '40-50% less expensive than 100% permanent',
        'Significant cash value growth by retirement',
        'Living benefits on 50% of total coverage',
        'Half your coverage never expires',
        'Strong foundation for retirement income',
      ],
      whenToUse: 'Best for age 35-50 with moderate income. Want significant cash value while keeping costs reasonable.',
    },
    {
      strategyName: 'Wealth Builder (70/30 Term/Whole Life)',
      termCoverage: lifeInsuranceNeeded * 0.7,
      termLength: 20,
      termMonthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded * 0.7, 20),
      permanentType: 'Whole Life',
      permanentCoverage: lifeInsuranceNeeded * 0.3,
      permanentMonthlyPremium: calculateIULPremium(lifeInsuranceNeeded * 0.3) * 1.3, // Whole life ~30% more than IUL
      permanentCashValue10yr: calculateIULPremium(lifeInsuranceNeeded * 0.3) * 12 * 10 * 1.2 * 1.3,
      permanentCashValue20yr: calculateIULPremium(lifeInsuranceNeeded * 0.3) * 12 * 20 * 1.5 * 1.3,
      totalCoverage: lifeInsuranceNeeded,
      totalMonthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded * 0.7, 20) + (calculateIULPremium(lifeInsuranceNeeded * 0.3) * 1.3),
      benefits: [
        'Guaranteed cash value growth (no market risk)',
        'Whole life pays dividends (mutual companies)',
        'Predictable, conservative wealth building',
        'Living benefits available on whole life portion',
        'Loan collateral for business or real estate',
        'Pass-through asset for estate planning',
      ],
      whenToUse: 'Best for conservative investors or business owners who want guaranteed growth and stable collateral for loans.',
    },
    {
      strategyName: 'Maximum Coverage (90/10 Term/IUL)',
      termCoverage: lifeInsuranceNeeded * 0.9,
      termLength: 30,
      termMonthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded * 0.9, 30),
      permanentType: 'IUL',
      permanentCoverage: lifeInsuranceNeeded * 0.1,
      permanentMonthlyPremium: calculateIULPremium(lifeInsuranceNeeded * 0.1),
      permanentCashValue10yr: calculateIULPremium(lifeInsuranceNeeded * 0.1) * 12 * 10 * 1.4,
      permanentCashValue20yr: calculateIULPremium(lifeInsuranceNeeded * 0.1) * 12 * 20 * 1.8,
      totalCoverage: lifeInsuranceNeeded,
      totalMonthlyPremium: calculateTermLifePremium(lifeInsuranceNeeded * 0.9, 30) + calculateIULPremium(lifeInsuranceNeeded * 0.1),
      benefits: [
        'Maximum coverage at lowest possible cost',
        'Small permanent policy ensures you die with coverage',
        '30-year term covers you past retirement',
        'Minimal cash value building for supplemental income',
        'Living benefits on permanent portion',
        'Most affordable hybrid option',
      ],
      whenToUse: 'Best for tight budgets or high debt (mortgage, student loans). Need maximum death benefit now, minimal permanent insurance to avoid dying uninsured.',
    },
  ];

  // Generate disability insurance quotes
  const calculateDisabilityPremium = (monthlyBenefit: number, eliminationPeriod: number): number => {
    const baseCost = monthlyBenefit * 0.02; // ~2% of benefit
    const eliminationFactor = eliminationPeriod === 30 ? 1.2 : eliminationPeriod === 90 ? 1.0 : 0.8;
    const ageFactor = 1 + (age - 30) * 0.03;
    return Math.round(baseCost * eliminationFactor * ageFactor);
  };

  const monthlyBenefitNeeded = Math.round(disabilityInsuranceNeeded / 12);

  const disabilityQuotes: DisabilityQuote[] = [
    {
      provider: 'John Hancock',
      monthlyBenefit: monthlyBenefitNeeded,
      eliminationPeriod: 90,
      benefitPeriod: 'To Age 65',
      monthlyPremium: calculateDisabilityPremium(monthlyBenefitNeeded, 90),
      ownOccupation: true,
      colaRider: true,
      recommended: true,
    },
    {
      provider: 'National Life Group',
      monthlyBenefit: monthlyBenefitNeeded,
      eliminationPeriod: 90,
      benefitPeriod: 'To Age 67',
      monthlyPremium: calculateDisabilityPremium(monthlyBenefitNeeded, 90) * 1.05,
      ownOccupation: true,
      colaRider: true,
    },
    {
      provider: 'F&G (Fidelity & Guaranty)',
      monthlyBenefit: monthlyBenefitNeeded,
      eliminationPeriod: 180,
      benefitPeriod: 'To Age 65',
      monthlyPremium: calculateDisabilityPremium(monthlyBenefitNeeded, 180) * 0.95,
      ownOccupation: false,
      colaRider: false,
    },
    {
      provider: 'Ethos',
      monthlyBenefit: monthlyBenefitNeeded,
      eliminationPeriod: 60,
      benefitPeriod: 'To Age 65',
      monthlyPremium: calculateDisabilityPremium(monthlyBenefitNeeded, 60) * 1.08,
      ownOccupation: true,
      colaRider: true,
    },
  ];

  // Umbrella liability quotes (typical rates from various carriers)
  const umbrellaQuotes = [
    { coverage: 1000000, annualPremium: 200, provider: 'Various Carriers' },
    { coverage: 2000000, annualPremium: 350, provider: 'Various Carriers' },
    { coverage: 3000000, annualPremium: 500, provider: 'Various Carriers' },
    { coverage: 5000000, annualPremium: 750, provider: 'Various Carriers' },
  ];

  // Long-term care quotes (LTC riders on life insurance)
  const ltcMonthlyBenefit = 6000;
  const ltcQuotes = [
    {
      provider: 'John Hancock',
      monthlyBenefit: ltcMonthlyBenefit,
      benefitPeriod: '3 years',
      eliminationPeriod: 90,
      inflationRider: true,
      monthlyPremium: Math.round((age - 40) * 25 + 150),
    },
    {
      provider: 'National Life Group',
      monthlyBenefit: ltcMonthlyBenefit,
      benefitPeriod: '5 years',
      eliminationPeriod: 90,
      inflationRider: true,
      monthlyPremium: Math.round((age - 40) * 28 + 180),
    },
  ];

  // Function to create a custom hybrid strategy based on user inputs
  const createCustomStrategy = (): HybridStrategy => {
    const termCoverage = customTotalCoverage * (customTermPercentage / 100);
    const permanentCoverage = customTotalCoverage * ((100 - customTermPercentage) / 100);
    const termPremium = calculateTermLifePremium(termCoverage, customTermLength);
    const permanentPremium = customPermanentType === 'IUL'
      ? calculateIULPremium(permanentCoverage)
      : calculateIULPremium(permanentCoverage) * 1.3;

    const cashValue10yr = customPermanentType === 'IUL'
      ? permanentPremium * 12 * 10 * 1.4
      : permanentPremium * 12 * 10 * 1.2;

    const cashValue20yr = customPermanentType === 'IUL'
      ? permanentPremium * 12 * 20 * 1.8
      : permanentPremium * 12 * 20 * 1.5;

    return {
      strategyName: `Custom Strategy (${customTermPercentage}/${100 - customTermPercentage} Term/${customPermanentType})`,
      termCoverage,
      termLength: customTermLength,
      termMonthlyPremium: termPremium,
      permanentType: customPermanentType,
      permanentCoverage,
      permanentMonthlyPremium: permanentPremium,
      permanentCashValue10yr: cashValue10yr,
      permanentCashValue20yr: cashValue20yr,
      totalCoverage: customTotalCoverage,
      totalMonthlyPremium: termPremium + permanentPremium,
      benefits: [
        `${customTermPercentage}% term coverage for ${customTermLength} years`,
        `${100 - customTermPercentage}% permanent ${customPermanentType} coverage`,
        'Customized to your specific needs and budget',
        'Flexible premium based on your selections',
        customPermanentType === 'IUL' ? 'Market-linked growth potential' : 'Guaranteed cash value growth',
        'Living benefits on permanent portion',
      ],
      whenToUse: 'Custom strategy tailored to your specific requirements',
    };
  };

  // Handle opening hybrid strategy customization modal
  const handleCustomize = (strategy: HybridStrategy) => {
    setCustomizingStrategy(strategy);
    setCustomTotalCoverage(strategy.totalCoverage);
    setCustomPermanentType(strategy.permanentType);
    setCustomTermLength(strategy.termLength);

    // Calculate percentage from strategy
    const termPercent = Math.round((strategy.termCoverage / strategy.totalCoverage) * 100);
    setCustomTermPercentage(termPercent);
  };

  // Handle opening term life customization modal
  const handleCustomizeTermLife = (quote: InsuranceQuote) => {
    setCustomizingTermLife(true);
    setCustomTermCoverage(quote.coverage);
    setCustomTermLifeLength(quote.term || 20);
    setSelectedCarrier(quote.provider);
  };

  // Calculate custom term life premium
  const getCustomTermLifePremium = (): number => {
    const baseCost = customTermCoverage / 100000;
    const ageFactor = 1 + (age - 30) * 0.05;
    let termFactor = 1.0;
    if (customTermLifeLength === 10) termFactor = 0.8;
    else if (customTermLifeLength === 15) termFactor = 0.9;
    else if (customTermLifeLength === 20) termFactor = 1.0;
    else if (customTermLifeLength === 25) termFactor = 1.1;
    else if (customTermLifeLength === 30) termFactor = 1.2;

    // Carrier-specific multipliers
    let carrierMultiplier = 1.0;
    if (selectedCarrier === 'Ethos') carrierMultiplier = 1.1;
    else if (selectedCarrier === 'John Hancock') carrierMultiplier = 1.05;
    else if (selectedCarrier === 'National Life Group') carrierMultiplier = 1.0;
    else if (selectedCarrier === 'F&G (Fidelity & Guaranty)') carrierMultiplier = 0.95;

    return Math.round(baseCost * ageFactor * termFactor * carrierMultiplier * 30);
  };

  // Handle opening IUL customization modal
  const handleCustomizeIUL = (quote: IULQuote) => {
    setCustomizingIUL(true);
    setCustomIULCoverage(quote.deathBenefit);
    setSelectedIULCarrier(quote.provider);
  };

  // Calculate custom IUL premium with carrier-specific multipliers
  const getCustomIULPremium = (): number => {
    const baseCost = customIULCoverage / 100000;
    const ageFactor = 1 + (age - 30) * 0.08;

    // Carrier-specific multipliers for IUL
    let carrierMultiplier = 1.0;
    if (selectedIULCarrier === 'National Life Group') carrierMultiplier = 1.0;
    else if (selectedIULCarrier === 'John Hancock - Accumulation IUL 24') carrierMultiplier = 1.05;
    else if (selectedIULCarrier === 'F&G (Fidelity & Guaranty)') carrierMultiplier = 0.97;
    else if (selectedIULCarrier === 'John Hancock - Protection IUL 24') carrierMultiplier = 1.02;

    return Math.round(baseCost * ageFactor * carrierMultiplier * 120);
  };

  // Calculate cash value projections for custom IUL
  const getCustomIULCashValue10yr = (): number => {
    return Math.round(getCustomIULPremium() * 12 * 10 * 1.4);
  };

  const getCustomIULCashValue20yr = (): number => {
    return Math.round(getCustomIULPremium() * 12 * 20 * 1.8);
  };

  const tabs = [
    { id: 'term-life', name: 'Term Life Insurance', icon: <Heart className="w-4 h-4" /> },
    { id: 'iul', name: 'IUL with Living Benefits', icon: <Shield className="w-4 h-4" /> },
    { id: 'hybrid', name: 'Hybrid Strategies', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'disability', name: 'Disability Insurance', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'umbrella', name: 'Umbrella Liability', icon: <Shield className="w-4 h-4" /> },
    { id: 'long-term-care', name: 'Long-Term Care', icon: <Home className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Insurance Recommendations & Quotes</h2>
            <p className="text-sm text-gray-600">
              Compare top-rated carriers and get estimated premiums based on your profile
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <p className="text-sm text-red-700 mb-1">Life Insurance Gap</p>
            <p className="text-2xl font-bold text-red-900">{formatCurrency(currentMetrics.lifeInsuranceGap)}</p>
            <p className="text-xs text-red-600 mt-1">Recommended: {formatCurrency(lifeInsuranceNeeded)}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Disability Protection Gap</p>
            <p className="text-2xl font-bold text-orange-900">{formatCurrency(currentMetrics.disabilityInsuranceGap)}</p>
            <p className="text-xs text-orange-600 mt-1">Monthly need: {formatCurrency(monthlyBenefitNeeded)}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Current Annual Income</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(income)}</p>
            <p className="text-xs text-blue-600 mt-1">Age: {age}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Term Life Insurance */}
        {activeTab === 'term-life' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-1">Why Term Life Insurance?</h4>
                  <p className="text-sm text-blue-800">
                    Term life provides affordable, temporary protection during your working years when financial obligations are highest.
                    Recommended coverage: <strong>{formatCurrency(lifeInsuranceNeeded)}</strong> (10x annual income rule).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {termLifeQuotes.map((quote, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    quote.recommended
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{quote.provider}</h3>
                        {quote.recommended && (
                          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{quote.productName}</p>
                      <p className="text-xs text-gray-500 mt-1">Financial Rating: {quote.rating}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">{formatCurrency(quote.monthlyPremium)}</p>
                      <p className="text-sm text-gray-600">per month</p>
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(quote.annualPremium)} annually</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Coverage Amount</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(quote.coverage)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Term Length</p>
                      <p className="text-lg font-bold text-gray-900">{quote.term} years</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Key Features:</p>
                    <ul className="space-y-1">
                      {quote.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCustomizeTermLife(quote)}
                      className="btn btn-secondary"
                    >
                      Adjust Coverage
                    </button>
                    <button className="btn btn-primary">
                      Get Quote from {quote.provider}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IUL with Living Benefits */}
        {activeTab === 'iul' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-purple-900 mb-1">Why IUL with Living Benefits?</h4>
                  <p className="text-sm text-purple-800">
                    Indexed Universal Life (IUL) provides <strong>lifetime protection</strong> plus tax-deferred cash value growth tied to market indexes.
                    <strong> Living Benefits</strong> allow you to access your death benefit early if diagnosed with critical, chronic, or terminal illness -
                    protecting both your family and yourself. Unlike term insurance which only pays at death, IUL provides protection against major illnesses <strong>while you're alive</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <h4 className="font-bold text-green-900 mb-2">💡 Living Benefits Protection Scenarios:</h4>
              <ul className="space-y-2 text-sm text-green-800">
                <li><strong>Heart Attack or Stroke:</strong> Access 50-90% of death benefit for medical expenses and recovery</li>
                <li><strong>Cancer Diagnosis:</strong> Early access to funds for treatment, experimental therapies, or time off work</li>
                <li><strong>Chronic Illness:</strong> Monthly payments if unable to perform daily activities (bathing, dressing, eating)</li>
                <li><strong>Long-Term Care:</strong> Use death benefit for nursing home, assisted living, or in-home care</li>
                <li><strong>Terminal Illness:</strong> Full death benefit advance to spend final months with family instead of working</li>
              </ul>
            </div>

            <div className="space-y-4">
              {iulQuotes.map((quote, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    quote.recommended
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{quote.provider}</h3>
                        {quote.recommended && (
                          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{quote.productName}</p>
                      <p className="text-xs text-gray-500 mt-1">Financial Rating: {quote.rating}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600">{formatCurrency(quote.monthlyPremium)}</p>
                      <p className="text-sm text-gray-600">per month</p>
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(quote.annualPremium)} annually</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Death Benefit</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(quote.deathBenefit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cash Value (10 yrs)</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(quote.cashValueProjection10yr)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cash Value (20 yrs)</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(quote.cashValueProjection20yr)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-purple-900 mb-2">🛡️ Living Benefits Included:</p>
                    <ul className="space-y-1 mb-3">
                      {quote.livingBenefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-sm text-gray-700">
                          <Shield className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span><strong>{benefit.split('-')[0]}</strong> - {benefit.split('-')[1]}</span>
                        </li>
                      ))}
                    </ul>

                    <p className="text-sm font-semibold text-gray-700 mb-2">Key Features:</p>
                    <ul className="space-y-1">
                      {quote.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-purple-900">
                      <strong>💰 Why IUL costs more than term:</strong> Term insurance only pays if you die during the term.
                      IUL provides lifetime coverage, builds cash value you can access, and includes living benefits that pay out
                      for critical/chronic illness - protecting you <strong>while alive</strong>, not just your family after death.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCustomizeIUL(quote)}
                      className="btn btn-secondary"
                    >
                      Adjust Coverage
                    </button>
                    <button className="btn btn-primary">
                      Get Quote from {quote.provider}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h4 className="font-bold text-blue-900 mb-2">📊 IUL vs Term Life Comparison:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Term Life Insurance:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>✓ Lower cost</li>
                    <li>✓ Simple and straightforward</li>
                    <li>✗ No cash value</li>
                    <li>✗ Expires after 10-30 years</li>
                    <li>✗ Only pays if you die</li>
                    <li>✗ No protection for illness</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">IUL with Living Benefits:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>✓ Lifetime coverage</li>
                    <li>✓ Tax-deferred cash value growth</li>
                    <li>✓ Living benefits for illness</li>
                    <li>✓ Tax-free retirement income</li>
                    <li>✓ Market upside, no downside</li>
                    <li>✗ Higher premium</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hybrid Strategies */}
        {activeTab === 'hybrid' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-1">Why Hybrid Strategies? (Term + IUL/Whole Life)</h4>
                  <p className="text-sm text-blue-800">
                    Hybrid strategies give you <strong>maximum coverage NOW</strong> at affordable prices (with term insurance),
                    while building <strong>permanent coverage and cash value</strong> (with IUL or whole life). This is the smartest approach
                    for most families: get the protection you need today without breaking the bank, while ensuring you never die uninsured.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <h4 className="font-bold text-green-900 mb-2">💡 The Problem With "Only Term" or "Only Permanent":</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                <div>
                  <p className="font-semibold mb-1">100% Term Life:</p>
                  <ul className="space-y-1">
                    <li>✗ Expires when you need it most (age 50-70)</li>
                    <li>✗ 98% of policies never pay out</li>
                    <li>✗ No cash value for emergencies or retirement</li>
                    <li>✗ Can't convert if health deteriorates</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">100% Permanent (IUL/Whole Life):</p>
                  <ul className="space-y-1">
                    <li>✗ Very expensive for young families</li>
                    <li>✗ May force you to buy less coverage than needed</li>
                    <li>✗ Takes years to build significant cash value</li>
                    <li>✗ Limits budget for other financial goals</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {hybridStrategies.map((strategy, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    strategy.recommended
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{strategy.strategyName}</h3>
                        {strategy.recommended && (
                          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 italic">{strategy.whenToUse}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">{formatCurrency(strategy.totalMonthlyPremium)}</p>
                      <p className="text-sm text-gray-600">total per month</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-xs text-blue-700 mb-1 font-semibold">Term Life Portion</p>
                      <p className="text-lg font-bold text-blue-900">{formatCurrency(strategy.termCoverage)}</p>
                      <p className="text-xs text-blue-600">{strategy.termLength} years @ {formatCurrency(strategy.termMonthlyPremium)}/mo</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-xs text-purple-700 mb-1 font-semibold">{strategy.permanentType} Portion</p>
                      <p className="text-lg font-bold text-purple-900">{formatCurrency(strategy.permanentCoverage)}</p>
                      <p className="text-xs text-purple-600">Permanent @ {formatCurrency(strategy.permanentMonthlyPremium)}/mo</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-xs text-green-700 mb-1 font-semibold">Total Coverage</p>
                      <p className="text-lg font-bold text-green-900">{formatCurrency(strategy.totalCoverage)}</p>
                      <p className="text-xs text-green-600">Full protection today</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Cash Value (10 years)</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(strategy.permanentCashValue10yr)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Cash Value (20 years)</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(strategy.permanentCashValue20yr)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Key Benefits:</p>
                    <ul className="space-y-1">
                      {strategy.benefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-900">
                      <strong>💰 Cost Savings:</strong> This hybrid approach costs {Math.round((1 - strategy.totalMonthlyPremium / calculateIULPremium(lifeInsuranceNeeded)) * 100)}%
                      less than buying {formatCurrency(lifeInsuranceNeeded)} of 100% {strategy.permanentType} coverage, while still providing the same total death benefit.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleCustomize(strategy)}
                    >
                      Customize This Strategy
                    </button>
                    <button className="btn btn-primary">
                      Get Quotes for This Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h4 className="font-bold text-blue-900 mb-2">📊 Hybrid Strategy Timeline:</h4>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">Year 1-20:</span>
                  <span>Full coverage from both term + permanent policies. Maximum protection during high-risk family years.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">Year 20-30:</span>
                  <span>Term expires, but permanent policy continues. By now, you've paid off mortgage, kids are independent, coverage needs lower.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">Year 30+:</span>
                  <span>Permanent policy provides death benefit + access cash value for retirement income, medical expenses, or legacy planning.</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <h4 className="font-bold text-purple-900 mb-2">🎯 Which Strategy Should You Choose?</h4>
              <div className="space-y-2 text-sm text-purple-800">
                <p><strong>Tight budget or high debt?</strong> → Maximum Coverage (90/10)</p>
                <p><strong>Young family, ages 30-45?</strong> → Young Family Builder (80/20) ⭐ MOST POPULAR</p>
                <p><strong>Balanced approach, ages 35-50?</strong> → Balanced Approach (50/50)</p>
                <p><strong>Business owner or conservative investor?</strong> → Wealth Builder (70/30 with Whole Life)</p>
              </div>
            </div>
          </div>
        )}

        {/* Disability Insurance */}
        {activeTab === 'disability' && (
          <div className="space-y-6">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-orange-900 mb-1">Why Disability Insurance?</h4>
                  <p className="text-sm text-orange-800">
                    Your ability to earn income is your most valuable asset. Disability insurance replaces 60-70% of income if you become unable to work.
                    Recommended monthly benefit: <strong>{formatCurrency(monthlyBenefitNeeded)}</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {disabilityQuotes.map((quote, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    quote.recommended
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{quote.provider}</h3>
                        {quote.recommended && (
                          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Individual Disability Income</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-orange-600">{formatCurrency(quote.monthlyPremium)}</p>
                      <p className="text-sm text-gray-600">per month</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Benefit</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(quote.monthlyBenefit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Elimination Period</p>
                      <p className="text-lg font-bold text-gray-900">{quote.eliminationPeriod} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Benefit Period</p>
                      <p className="text-lg font-bold text-gray-900">{quote.benefitPeriod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Own Occupation</p>
                      <p className="text-lg font-bold text-gray-900">
                        {quote.ownOccupation ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Key Features:</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        {quote.ownOccupation ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Own Occupation Definition (Best protection)
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            Any Occupation Definition
                          </>
                        )}
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        {quote.colaRider ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            COLA Rider Included (Inflation protection)
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            No COLA Rider
                          </>
                        )}
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <Info className="w-4 h-4 text-blue-600" />
                        Elimination period: {quote.eliminationPeriod} days (waiting period before benefits start)
                      </li>
                    </ul>
                  </div>

                  <button className="w-full btn btn-primary">
                    Get Quote from {quote.provider}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Umbrella Liability */}
        {activeTab === 'umbrella' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-purple-900 mb-1">Why Umbrella Liability Insurance?</h4>
                  <p className="text-sm text-purple-800">
                    Umbrella policies provide additional liability coverage beyond your home and auto policies, protecting your assets from lawsuits.
                    Recommended for anyone with a net worth over $500,000 or significant income.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {umbrellaQuotes.map((quote, idx) => (
                <div key={idx} className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-purple-600">{formatCurrency(quote.coverage)}</p>
                    <p className="text-sm text-gray-600">Coverage</p>
                  </div>
                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(quote.annualPremium)}</p>
                    <p className="text-sm text-gray-600">per year</p>
                    <p className="text-xs text-gray-500 mt-1">~{formatCurrency(quote.annualPremium / 12)}/month</p>
                  </div>
                  <button className="w-full btn btn-secondary">
                    Get Quote
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-900">
                <strong>💡 Pro Tip:</strong> Umbrella insurance is very affordable ($200-750/year for $1-5M coverage) and provides significant protection.
                Required underlying coverage: Usually $300K-500K on auto and homeowners policies.
              </p>
            </div>
          </div>
        )}

        {/* Long-Term Care */}
        {activeTab === 'long-term-care' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-1">Why Long-Term Care Insurance?</h4>
                  <p className="text-sm text-blue-800">
                    70% of people over age 65 will need long-term care services. Average cost: $100,000+ per year for nursing home care.
                    Best time to buy: ages 50-60 when premiums are affordable and health allows qualification.
                  </p>
                </div>
              </div>
            </div>

            {age < 40 ? (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">Too Early for LTC Planning</h3>
                <p className="text-sm text-gray-600">
                  Long-term care insurance is typically not recommended until age 40-50. Focus on disability insurance and building savings first.
                  We'll revisit this as you approach age 50.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ltcQuotes.map((quote, idx) => (
                  <div key={idx} className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{quote.provider}</h3>
                        <p className="text-sm text-gray-600">Long-Term Care Insurance</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">{formatCurrency(quote.monthlyPremium)}</p>
                        <p className="text-sm text-gray-600">per month</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Monthly Benefit</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(quote.monthlyBenefit)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Benefit Period</p>
                        <p className="text-lg font-bold text-gray-900">{quote.benefitPeriod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Waiting Period</p>
                        <p className="text-lg font-bold text-gray-900">{quote.eliminationPeriod} days</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {quote.inflationRider ? 'Inflation protection included' : 'No inflation protection'}
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Covers nursing home, assisted living, and home care
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Total benefit pool: {formatCurrency(quote.monthlyBenefit * parseInt(quote.benefitPeriod) * 12)}
                        </li>
                      </ul>
                    </div>

                    <button className="w-full btn btn-primary">
                      Get Quote from {quote.provider}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customization Modal */}
      {customizingStrategy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Customize Your Hybrid Strategy</h2>
                  <p className="text-sm text-blue-100">Adjust coverage and mix to match your needs</p>
                </div>
                <button
                  onClick={() => setCustomizingStrategy(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Total Coverage Input */}
              <div>
                <label className="label">Total Coverage Needed</label>
                <input
                  type="number"
                  className="input"
                  value={customTotalCoverage}
                  onChange={(e) => setCustomTotalCoverage(Number(e.target.value))}
                  min={100000}
                  step={50000}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Recommended: {formatCurrency(lifeInsuranceNeeded)}
                </p>
              </div>

              {/* Term/Permanent Split Slider */}
              <div>
                <label className="label">
                  Coverage Split: {customTermPercentage}% Term / {100 - customTermPercentage}% Permanent
                </label>
                <input
                  type="range"
                  className="w-full"
                  value={customTermPercentage}
                  onChange={(e) => setCustomTermPercentage(Number(e.target.value))}
                  min={10}
                  max={90}
                  step={5}
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>10% Term</span>
                  <span>50/50 Split</span>
                  <span>90% Term</span>
                </div>
              </div>

              {/* Term Length Selector */}
              <div>
                <label className="label">Term Length</label>
                <select
                  className="input"
                  value={customTermLength}
                  onChange={(e) => setCustomTermLength(Number(e.target.value))}
                >
                  <option value={10}>10 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={25}>25 Years</option>
                  <option value={30}>30 Years</option>
                </select>
              </div>

              {/* Permanent Type Selector */}
              <div>
                <label className="label">Permanent Insurance Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCustomPermanentType('IUL')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      customPermanentType === 'IUL'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-bold mb-1">Indexed Universal Life (IUL)</p>
                    <p className="text-xs">Market-linked growth, 0% floor</p>
                  </button>
                  <button
                    onClick={() => setCustomPermanentType('Whole Life')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      customPermanentType === 'Whole Life'
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <p className="font-bold mb-1">Whole Life</p>
                    <p className="text-xs">Guaranteed growth, dividends</p>
                  </button>
                </div>
              </div>

              {/* Live Preview of Custom Strategy */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  Your Custom Strategy Preview
                </h3>

                {(() => {
                  const preview = createCustomStrategy();
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-xs text-blue-700 mb-1 font-semibold">Term Life Portion</p>
                          <p className="text-lg font-bold text-blue-900">{formatCurrency(preview.termCoverage)}</p>
                          <p className="text-xs text-blue-600">{preview.termLength} years @ {formatCurrency(preview.termMonthlyPremium)}/mo</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-xs text-purple-700 mb-1 font-semibold">{preview.permanentType} Portion</p>
                          <p className="text-lg font-bold text-purple-900">{formatCurrency(preview.permanentCoverage)}</p>
                          <p className="text-xs text-purple-600">Permanent @ {formatCurrency(preview.permanentMonthlyPremium)}/mo</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-xs text-green-700 mb-1 font-semibold">Total Monthly Premium</p>
                          <p className="text-2xl font-bold text-green-900">{formatCurrency(preview.totalMonthlyPremium)}</p>
                          <p className="text-xs text-green-600">Full protection today</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Cash Value (10 years)</p>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(preview.permanentCashValue10yr)}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Cash Value (20 years)</p>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(preview.permanentCashValue20yr)}</p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-xs text-yellow-900">
                          <strong>💰 Cost Savings:</strong> This custom strategy costs{' '}
                          {Math.round((1 - preview.totalMonthlyPremium / calculateIULPremium(customTotalCoverage)) * 100)}%
                          less than buying {formatCurrency(customTotalCoverage)} of 100% {preview.permanentType} coverage.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCustomizingStrategy(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would save or request quotes
                    alert(`Custom strategy created!\n\nTotal Coverage: ${formatCurrency(customTotalCoverage)}\nSplit: ${customTermPercentage}/${100-customTermPercentage} (Term/${customPermanentType})\nMonthly Premium: ${formatCurrency(createCustomStrategy().totalMonthlyPremium)}\n\nClick "Get Quotes for This Plan" to receive actual quotes from carriers.`);
                    setCustomizingStrategy(null);
                  }}
                  className="btn btn-primary"
                >
                  Apply Custom Strategy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Term Life Insurance Customization Modal */}
      {customizingTermLife && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Adjust Your Term Life Quote</h2>
                  <p className="text-sm text-blue-100">Customize coverage and term length - {selectedCarrier}</p>
                </div>
                <button
                  onClick={() => setCustomizingTermLife(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Coverage Amount Slider */}
              <div>
                <label className="label">
                  Coverage Amount: {formatCurrency(customTermCoverage)}
                </label>
                <input
                  type="range"
                  className="w-full"
                  value={customTermCoverage}
                  onChange={(e) => setCustomTermCoverage(Number(e.target.value))}
                  min={100000}
                  max={5000000}
                  step={50000}
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>$100K</span>
                  <span className="font-semibold">Recommended: {formatCurrency(lifeInsuranceNeeded)}</span>
                  <span>$5M</span>
                </div>
              </div>

              {/* Term Length Selector */}
              <div>
                <label className="label">Term Length</label>
                <div className="grid grid-cols-5 gap-2">
                  {[10, 15, 20, 25, 30].map((years) => (
                    <button
                      key={years}
                      onClick={() => setCustomTermLifeLength(years)}
                      className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                        customTermLifeLength === years
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {years} yrs
                    </button>
                  ))}
                </div>
              </div>

              {/* Carrier Selector */}
              <div>
                <label className="label">Select Insurance Carrier</label>
                <div className="grid grid-cols-2 gap-3">
                  {termLifeQuotes.map((quote) => (
                    <button
                      key={quote.provider}
                      onClick={() => setSelectedCarrier(quote.provider)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedCarrier === quote.provider
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <p className="font-bold text-gray-900">{quote.provider}</p>
                      <p className="text-xs text-gray-600">{quote.productName}</p>
                      <p className="text-xs text-gray-500 mt-1">Rating: {quote.rating}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Quote Preview */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  Your Customized Quote
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Carrier</p>
                    <p className="text-xl font-bold text-gray-900">{selectedCarrier}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Coverage Amount</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(customTermCoverage)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Term Length</p>
                    <p className="text-xl font-bold text-gray-900">{customTermLifeLength} years</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Your Age</p>
                    <p className="text-xl font-bold text-gray-900">{age} years old</p>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-xl p-6 text-center">
                  <p className="text-sm text-blue-100 mb-1">Estimated Monthly Premium</p>
                  <p className="text-5xl font-bold text-white mb-2">{formatCurrency(getCustomTermLifePremium())}</p>
                  <p className="text-sm text-blue-100">per month</p>
                  <p className="text-xs text-blue-200 mt-2">{formatCurrency(getCustomTermLifePremium() * 12)} annually</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-yellow-900">
                    <strong>💡 Cost Per Day:</strong> This coverage costs approximately{' '}
                    {formatCurrency(getCustomTermLifePremium() / 30)} per day - less than most people spend on coffee!
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-2">📋 What Happens Next?</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>Click "Get Official Quote" to submit your customized request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>You'll receive an official quote from {selectedCarrier} within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>Most applicants can apply online without a medical exam (depending on coverage amount and health)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">4.</span>
                    <span>Coverage typically begins within 2-4 weeks of approval</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCustomizingTermLife(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Quote request submitted!\n\nCarrier: ${selectedCarrier}\nCoverage: ${formatCurrency(customTermCoverage)}\nTerm: ${customTermLifeLength} years\nEstimated Premium: ${formatCurrency(getCustomTermLifePremium())}/month\n\nYou'll receive an official quote within 24-48 hours.`);
                    setCustomizingTermLife(false);
                  }}
                  className="btn btn-primary"
                >
                  Get Official Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IUL Customization Modal */}
      {customizingIUL && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Adjust Your IUL Quote</h2>
                  <p className="text-sm text-purple-100">Customize death benefit and carrier - {selectedIULCarrier}</p>
                </div>
                <button
                  onClick={() => setCustomizingIUL(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Death Benefit Amount Slider */}
              <div>
                <label className="label">
                  Death Benefit Amount: {formatCurrency(customIULCoverage)}
                </label>
                <input
                  type="range"
                  className="w-full"
                  value={customIULCoverage}
                  onChange={(e) => setCustomIULCoverage(Number(e.target.value))}
                  min={100000}
                  max={5000000}
                  step={50000}
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>$100K</span>
                  <span className="font-semibold">Recommended: {formatCurrency(lifeInsuranceNeeded)}</span>
                  <span>$5M</span>
                </div>
              </div>

              {/* Carrier Selector */}
              <div>
                <label className="label">Select IUL Carrier</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {iulQuotes.map((quote) => (
                    <button
                      key={quote.provider + quote.productName}
                      onClick={() => {
                        // Handle John Hancock products specially to distinguish them
                        if (quote.productName === 'Accumulation IUL 24') {
                          setSelectedIULCarrier('John Hancock - Accumulation IUL 24');
                        } else if (quote.productName === 'Protection IUL 24') {
                          setSelectedIULCarrier('John Hancock - Protection IUL 24');
                        } else {
                          setSelectedIULCarrier(quote.provider);
                        }
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedIULCarrier === quote.provider ||
                        selectedIULCarrier === `${quote.provider} - ${quote.productName}`
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      <p className="font-bold text-gray-900">{quote.provider}</p>
                      <p className="text-xs text-gray-600">{quote.productName}</p>
                      <p className="text-xs text-gray-500 mt-1">Rating: {quote.rating}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Quote Preview */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Your Customized IUL Quote
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Carrier</p>
                    <p className="text-lg font-bold text-gray-900">{selectedIULCarrier}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Death Benefit</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(customIULCoverage)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Cash Value (10 yrs)</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(getCustomIULCashValue10yr())}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Cash Value (20 yrs)</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(getCustomIULCashValue20yr())}</p>
                  </div>
                </div>

                <div className="bg-purple-600 rounded-xl p-6 text-center mb-4">
                  <p className="text-sm text-purple-100 mb-1">Estimated Monthly Premium</p>
                  <p className="text-5xl font-bold text-white mb-2">{formatCurrency(getCustomIULPremium())}</p>
                  <p className="text-sm text-purple-100">per month</p>
                  <p className="text-xs text-purple-200 mt-2">{formatCurrency(getCustomIULPremium() * 12)} annually</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-900">
                      <strong>🛡️ Living Benefits Included:</strong> Access your death benefit early for critical, chronic, or terminal illness diagnosis
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-900">
                      <strong>💰 Cash Value Growth:</strong> Tax-deferred accumulation linked to market indexes with 0% floor protection
                    </p>
                  </div>
                </div>
              </div>

              {/* IUL Benefits Explanation */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-2">🌟 Why Choose IUL?</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">•</span>
                    <span><strong>Lifetime Protection:</strong> Coverage never expires as long as premiums are paid</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">•</span>
                    <span><strong>Living Benefits:</strong> Access funds for critical illness, chronic care, or terminal diagnosis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">•</span>
                    <span><strong>Market-Linked Growth:</strong> Cash value tied to S&P 500 or other indexes with downside protection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">•</span>
                    <span><strong>Tax-Free Retirement Income:</strong> Access cash value through tax-free policy loans</span>
                  </li>
                </ul>
              </div>

              {/* What Happens Next */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-blue-900 mb-2">📋 What Happens Next?</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>Click "Get Official Quote" to submit your customized IUL request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>Receive detailed illustration from {selectedIULCarrier} within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>Review projected cash values, death benefit, and living benefits with your advisor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">4.</span>
                    <span>Medical exam may be required (depending on coverage amount and age)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">5.</span>
                    <span>Coverage begins once approved and first premium is paid</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCustomizingIUL(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`IUL Quote request submitted!\n\nCarrier: ${selectedIULCarrier}\nDeath Benefit: ${formatCurrency(customIULCoverage)}\nEstimated Monthly Premium: ${formatCurrency(getCustomIULPremium())}\nProjected Cash Value (20yr): ${formatCurrency(getCustomIULCashValue20yr())}\n\nYou'll receive a detailed illustration within 24-48 hours.`);
                    setCustomizingIUL(false);
                  }}
                  className="btn btn-primary"
                >
                  Get Official Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
