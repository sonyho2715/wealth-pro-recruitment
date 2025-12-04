'use client';

import { useState, useEffect, useCallback, TouchEvent } from 'react';
import {
  ChevronLeft, ChevronRight, X, DollarSign, Shield, TrendingUp,
  PiggyBank, Target, AlertTriangle, CheckCircle, Building2,
  Briefcase, Phone, Mail, Home, CreditCard, GraduationCap, Car
} from 'lucide-react';
import { logSlideView, endPresentationSession } from '@/app/agent/dashboard/presentations/actions';

interface PresentationData {
  prospect: {
    firstName: string;
    lastName: string;
  };
  agent: {
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string;
  } | null;
  sessionId: string | null;
  financials: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySurplus: number;
    assets: {
      savings: number;
      investments: number;
      retirement401k: number;
      homeEquity: number;
      otherAssets: number;
    };
    liabilities: {
      mortgage: number;
      carLoans: number;
      studentLoans: number;
      creditCards: number;
      otherDebts: number;
    };
  };
  protection: {
    totalRecommended: number;
    totalCurrent: number;
    gap: number;
    needs: Array<{
      type: string;
      recommended: number;
      current: number;
      gap: number;
      priority: number;
      reasoning: string | null;
    }>;
  };
  retirement: {
    currentAge: number;
    targetAge: number;
    yearsToGo: number;
  };
  agentProjection: {
    year1Income: number;
    year3Income: number;
    year5Income: number;
    lifetimeValue: number;
  } | null;
}

interface PresentationViewProps {
  data: PresentationData;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatLargeCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
};

export default function PresentationView({ data }: PresentationViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [ending, setEnding] = useState(false);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const slides = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'net-worth', title: 'Net Worth' },
    { id: 'assets', title: 'Assets' },
    { id: 'liabilities', title: 'Liabilities' },
    { id: 'cash-flow', title: 'Cash Flow' },
    { id: 'protection-gap', title: 'Protection Gap' },
    { id: 'protection-details', title: 'Coverage Details' },
    { id: 'retirement', title: 'Retirement' },
    ...(data.agentProjection ? [{ id: 'opportunity', title: 'Opportunity' }] : []),
    { id: 'next-steps', title: 'Next Steps' },
  ];

  // Log slide view when changing slides
  useEffect(() => {
    if (data.sessionId) {
      logSlideView(data.sessionId, slides[currentSlide].id);
    }
  }, [currentSlide, data.sessionId]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  // Touch handlers for swipe
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        setShowEndModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleEndPresentation = async (outcome: 'COMPLETED' | 'INTERRUPTED' | 'FOLLOW_UP_NEEDED' | 'APPLICATION_STARTED' | 'DECLINED') => {
    if (!data.sessionId) {
      window.close();
      return;
    }

    setEnding(true);
    await endPresentationSession(data.sessionId, outcome);
    window.close();
  };

  const renderSlide = () => {
    const slideId = slides[currentSlide].id;

    switch (slideId) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-xl">
              <span className="text-4xl font-bold text-white">
                {data.prospect.firstName[0]}{data.prospect.lastName[0]}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome, {data.prospect.firstName}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your Personal Financial Overview
            </p>
            {data.agent && (
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
                <p className="text-sm text-gray-500 mb-2">Presented by</p>
                <p className="font-semibold text-gray-900">
                  {data.agent.firstName} {data.agent.lastName}
                </p>
                <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {data.agent.phone}
                  </span>
                </div>
              </div>
            )}
            <p className="text-gray-400 mt-12 text-sm">
              Swipe or tap arrows to navigate
            </p>
          </div>
        );

      case 'net-worth':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Net Worth</h2>
            <div className="relative w-64 h-64 mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-sm opacity-80 mb-1">Total</p>
                  <p className="text-4xl font-bold">{formatLargeCurrency(data.financials.netWorth)}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Assets</p>
                <p className="text-xl font-bold text-gray-900">{formatLargeCurrency(data.financials.totalAssets)}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
                <CreditCard className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Liabilities</p>
                <p className="text-xl font-bold text-gray-900">{formatLargeCurrency(data.financials.totalLiabilities)}</p>
              </div>
            </div>
          </div>
        );

      case 'assets':
        const assetItems = [
          { label: 'Savings', value: data.financials.assets.savings, icon: PiggyBank, color: 'text-blue-500' },
          { label: 'Investments', value: data.financials.assets.investments, icon: TrendingUp, color: 'text-green-500' },
          { label: '401(k)/Retirement', value: data.financials.assets.retirement401k, icon: Briefcase, color: 'text-purple-500' },
          { label: 'Home Equity', value: data.financials.assets.homeEquity, icon: Home, color: 'text-orange-500' },
          { label: 'Other Assets', value: data.financials.assets.otherAssets, icon: DollarSign, color: 'text-gray-500' },
        ].filter(item => item.value > 0);

        return (
          <div className="flex flex-col h-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Your Assets</h2>
            <p className="text-center text-gray-500 mb-6">Total: {formatCurrency(data.financials.totalAssets)}</p>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {assetItems.map((item, index) => {
                const Icon = item.icon;
                const percentage = (item.value / data.financials.totalAssets) * 100;
                return (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-6 h-6 ${item.color}`} />
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'liabilities':
        const liabilityItems = [
          { label: 'Mortgage', value: data.financials.liabilities.mortgage, icon: Home, color: 'text-blue-500' },
          { label: 'Car Loans', value: data.financials.liabilities.carLoans, icon: Car, color: 'text-orange-500' },
          { label: 'Student Loans', value: data.financials.liabilities.studentLoans, icon: GraduationCap, color: 'text-purple-500' },
          { label: 'Credit Cards', value: data.financials.liabilities.creditCards, icon: CreditCard, color: 'text-red-500' },
          { label: 'Other Debts', value: data.financials.liabilities.otherDebts, icon: DollarSign, color: 'text-gray-500' },
        ].filter(item => item.value > 0);

        return (
          <div className="flex flex-col h-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Your Liabilities</h2>
            <p className="text-center text-gray-500 mb-6">Total: {formatCurrency(data.financials.totalLiabilities)}</p>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {liabilityItems.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-900">Debt Free!</p>
                  <p className="text-gray-500">Great job managing your finances</p>
                </div>
              ) : (
                liabilityItems.map((item, index) => {
                  const Icon = item.icon;
                  const percentage = (item.value / data.financials.totalLiabilities) * 100;
                  return (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${item.color}`} />
                          <span className="font-medium text-gray-900">{item.label}</span>
                        </div>
                        <span className="font-bold text-red-600">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'cash-flow':
        const surplusPercentage = (data.financials.monthlySurplus / data.financials.monthlyIncome) * 100;
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Monthly Cash Flow</h2>
            <div className="w-full max-w-md space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Income</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.financials.monthlyIncome)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Expenses</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.financials.monthlyExpenses)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`rounded-2xl p-6 shadow-lg ${data.financials.monthlySurplus >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm opacity-80">Monthly {data.financials.monthlySurplus >= 0 ? 'Surplus' : 'Deficit'}</p>
                    <p className="text-3xl font-bold">{formatCurrency(Math.abs(data.financials.monthlySurplus))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">{Math.abs(surplusPercentage).toFixed(0)}%</p>
                    <p className="text-sm opacity-80">of income</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'protection-gap':
        const gapPercentage = data.protection.totalRecommended > 0
          ? ((data.protection.totalRecommended - data.protection.totalCurrent) / data.protection.totalRecommended) * 100
          : 0;
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Protection Analysis</h2>
            <div className="relative w-56 h-56 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(100 - gapPercentage) * 6.28} 628`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-gray-900">{(100 - gapPercentage).toFixed(0)}%</p>
                <p className="text-sm text-gray-500">Protected</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Current Coverage</p>
                <p className="text-lg font-bold text-gray-900">{formatLargeCurrency(data.protection.totalCurrent)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Recommended</p>
                <p className="text-lg font-bold text-gray-900">{formatLargeCurrency(data.protection.totalRecommended)}</p>
              </div>
            </div>
            {data.protection.gap > 0 && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 w-full max-w-md">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-800">Protection Gap</p>
                    <p className="text-yellow-700">{formatCurrency(data.protection.gap)} additional coverage recommended</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'protection-details':
        return (
          <div className="flex flex-col h-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Coverage Breakdown</h2>
            <div className="flex-1 overflow-y-auto space-y-4">
              {data.protection.needs.map((need, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {need.priority}
                      </span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {need.type.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </div>
                    {need.gap > 0 ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        Gap: {formatLargeCurrency(need.gap)}
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Covered
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Current</p>
                      <p className="font-medium">{formatCurrency(need.current)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Recommended</p>
                      <p className="font-medium">{formatCurrency(need.recommended)}</p>
                    </div>
                  </div>
                  {need.reasoning && (
                    <p className="text-xs text-gray-500 mt-2 italic">{need.reasoning}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'retirement':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Retirement Timeline</h2>
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">{data.retirement.currentAge}</p>
                    <p className="text-sm text-gray-500">Current Age</p>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${(data.retirement.currentAge / data.retirement.targetAge) * 100}%` }}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {data.retirement.yearsToGo} years to go
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-600">{data.retirement.targetAge}</p>
                    <p className="text-sm text-gray-500">Target Age</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Current 401(k)/Retirement</p>
                    <p className="text-2xl font-bold">{formatCurrency(data.financials.assets.retirement401k)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'opportunity':
        if (!data.agentProjection) return null;
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Career Opportunity</h2>
            <p className="text-gray-500 mb-8">Your potential as a financial professional</p>
            <div className="w-full max-w-md space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Year 1 Income</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(data.agentProjection.year1Income)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">Y1</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Year 3 Income</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(data.agentProjection.year3Income)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">Y3</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Year 5 Income</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(data.agentProjection.year5Income)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">Y5</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-5 text-white">
                <p className="text-sm opacity-80">Lifetime Earning Potential</p>
                <p className="text-3xl font-bold">{formatLargeCurrency(data.agentProjection.lifetimeValue)}</p>
              </div>
            </div>
          </div>
        );

      case 'next-steps':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 text-center mb-8 max-w-md">
              We&apos;ve reviewed your complete financial picture. Let&apos;s discuss how we can help protect your family and build your future.
            </p>
            {data.agent && (
              <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md mb-6">
                <p className="text-sm text-gray-500 mb-3">Your Financial Professional</p>
                <p className="font-semibold text-lg text-gray-900 mb-3">
                  {data.agent.firstName} {data.agent.lastName}
                </p>
                <div className="space-y-2">
                  <a href={`tel:${data.agent.phone}`} className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
                    <Phone className="w-5 h-5" />
                    {data.agent.phone}
                  </a>
                  <a href={`mailto:${data.agent.email}`} className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
                    <Mail className="w-5 h-5" />
                    {data.agent.email}
                  </a>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowEndModal(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Complete Presentation
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-b border-gray-100">
        <button
          onClick={() => setShowEndModal(true)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-blue-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-500">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderSlide()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-t border-gray-100">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            currentSlide === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <p className="text-sm text-gray-500">{slides[currentSlide].title}</p>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            currentSlide === slides.length - 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* End Presentation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">End Presentation</h3>
              <p className="text-sm text-gray-500">How did this presentation go?</p>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => handleEndPresentation('APPLICATION_STARTED')}
                disabled={ending}
                className="w-full p-4 text-left rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
              >
                <p className="font-semibold text-green-700">Application Started</p>
                <p className="text-sm text-green-600">Client is ready to proceed</p>
              </button>
              <button
                onClick={() => handleEndPresentation('COMPLETED')}
                disabled={ending}
                className="w-full p-4 text-left rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <p className="font-semibold text-blue-700">Completed</p>
                <p className="text-sm text-blue-600">Presentation finished successfully</p>
              </button>
              <button
                onClick={() => handleEndPresentation('FOLLOW_UP_NEEDED')}
                disabled={ending}
                className="w-full p-4 text-left rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors"
              >
                <p className="font-semibold text-yellow-700">Follow-up Needed</p>
                <p className="text-sm text-yellow-600">Client needs more time to decide</p>
              </button>
              <button
                onClick={() => handleEndPresentation('INTERRUPTED')}
                disabled={ending}
                className="w-full p-4 text-left rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                <p className="font-semibold text-orange-700">Interrupted</p>
                <p className="text-sm text-orange-600">Session ended early</p>
              </button>
              <button
                onClick={() => handleEndPresentation('DECLINED')}
                disabled={ending}
                className="w-full p-4 text-left rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
              >
                <p className="font-semibold text-red-700">Declined</p>
                <p className="text-sm text-red-600">Client not interested at this time</p>
              </button>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowEndModal(false)}
                disabled={ending}
                className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium"
              >
                Continue Presentation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
