/**
 * PDF Generator for CPA-Ready Business Analysis Reports
 * Uses jsPDF and jspdf-autotable for professional PDF generation
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuickFix, getTimeframeLabel } from './quick-fix-calculator';
import { RetirementPlanOption, getPlanTypeName } from './retirement-plan-calculator';
import { TrendAnalysis, YearlyFinancialData, formatPercentage } from './trend-analysis';

export interface BusinessReportData {
  // Business Info
  businessName: string;
  ownerName: string;
  reportDate: string;
  preparedBy?: string;

  // Financial Summary
  annualRevenue: number;
  grossProfit: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;

  // Ratios
  grossProfitMargin: number;
  netProfitMargin: number;
  currentRatio: number;
  debtToEquityRatio: number;

  // Protection
  keyPersonInsurance: number;
  keyPersonGap: number;
  buyoutFundingGap: number;

  // Historical Data
  yearlyData?: YearlyFinancialData[];
  trendAnalysis?: TrendAnalysis | null;

  // Recommendations
  quickFixes?: QuickFix[];
  retirementOptions?: RetirementPlanOption[];

  // Calibration
  healthScore?: number;
  industryName?: string;
  percentileRankings?: {
    grossProfit: number;
    netProfit: number;
    currentRatio: number;
  };
}

/**
 * Generate comprehensive business analysis PDF
 */
export async function generateBusinessAnalysisPDF(
  data: BusinessReportData
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Helper functions
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const addNewPage = () => {
    doc.addPage();
    yPosition = margin;
  };

  const checkPageBreak = (neededSpace: number) => {
    if (yPosition + neededSpace > doc.internal.pageSize.getHeight() - margin) {
      addNewPage();
    }
  };

  // ========== COVER PAGE ==========
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Financial Analysis', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text(data.businessName, pageWidth / 2, 80, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Prepared for: ${data.ownerName}`, pageWidth / 2, 100, { align: 'center' });
  doc.text(`Report Date: ${data.reportDate}`, pageWidth / 2, 110, { align: 'center' });

  if (data.preparedBy) {
    doc.text(`Prepared by: ${data.preparedBy}`, pageWidth / 2, 120, { align: 'center' });
  }

  // Confidential notice
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'CONFIDENTIAL - This report contains sensitive financial information',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 30,
    { align: 'center' }
  );

  // ========== EXECUTIVE SUMMARY ==========
  addNewPage();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, yPosition);
  yPosition += 10;

  // Health Score Box (if available)
  if (data.healthScore !== undefined) {
    doc.setFillColor(data.healthScore >= 70 ? 34 : data.healthScore >= 50 ? 251 : 239,
                     data.healthScore >= 70 ? 197 : data.healthScore >= 50 ? 191 : 68,
                     data.healthScore >= 70 ? 94 : data.healthScore >= 50 ? 36 : 68);
    doc.roundedRect(margin, yPosition, 50, 30, 3, 3, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(`${data.healthScore}`, margin + 25, yPosition + 20, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Health Score', margin + 25, yPosition + 27, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPosition += 40;
  }

  // Key Metrics Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Financial Metrics', margin, yPosition);
  yPosition += 5;

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value', 'Assessment']],
    body: [
      ['Annual Revenue', formatCurrency(data.annualRevenue), getAssessment(data.annualRevenue, 500000, 1000000)],
      ['Net Income', formatCurrency(data.netIncome), getAssessment(data.netIncome, 50000, 100000)],
      ['Gross Margin', formatPercent(data.grossProfitMargin), getMarginAssessment(data.grossProfitMargin, 0.30, 0.45)],
      ['Net Margin', formatPercent(data.netProfitMargin), getMarginAssessment(data.netProfitMargin, 0.08, 0.15)],
      ['Net Worth', formatCurrency(data.netWorth), getAssessment(data.netWorth, 100000, 500000)],
      ['Current Ratio', data.currentRatio.toFixed(2), getRatioAssessment(data.currentRatio, 1.2, 2.0)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ========== BALANCE SHEET SUMMARY ==========
  checkPageBreak(80);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Balance Sheet Summary', margin, yPosition);
  yPosition += 5;

  autoTable(doc, {
    startY: yPosition,
    head: [['Assets', 'Amount', 'Liabilities', 'Amount']],
    body: [
      ['Total Assets', formatCurrency(data.totalAssets), 'Total Liabilities', formatCurrency(data.totalLiabilities)],
      ['', '', 'Net Worth (Equity)', formatCurrency(data.netWorth)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ========== PROTECTION GAPS ==========
  checkPageBreak(60);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Protection Analysis', margin, yPosition);
  yPosition += 5;

  autoTable(doc, {
    startY: yPosition,
    head: [['Coverage Type', 'Current', 'Recommended', 'Gap']],
    body: [
      [
        'Key Person Insurance',
        formatCurrency(data.keyPersonInsurance),
        formatCurrency(data.keyPersonInsurance + data.keyPersonGap),
        data.keyPersonGap > 0 ? formatCurrency(data.keyPersonGap) : 'Adequate',
      ],
      [
        'Buy-Sell Funding',
        data.buyoutFundingGap > 0 ? 'Not Funded' : 'Funded',
        formatCurrency(data.buyoutFundingGap > 0 ? data.buyoutFundingGap : 0),
        data.buyoutFundingGap > 0 ? formatCurrency(data.buyoutFundingGap) : 'Adequate',
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin },
    columnStyles: {
      3: { fontStyle: 'bold' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ========== HISTORICAL TREND (if available) ==========
  if (data.yearlyData && data.yearlyData.length > 0) {
    addNewPage();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Historical Performance', margin, yPosition);
    yPosition += 10;

    // Historical data table
    autoTable(doc, {
      startY: yPosition,
      head: [['Tax Year', 'Revenue', 'Gross Profit', 'Net Income', 'Net Margin']],
      body: data.yearlyData.map(year => [
        year.taxYear.toString(),
        formatCurrency(year.netReceipts),
        formatCurrency(year.grossProfit),
        formatCurrency(year.netIncome),
        year.netReceipts > 0 ? formatPercent(year.netIncome / year.netReceipts) : 'N/A',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Trend Analysis Summary
    if (data.trendAnalysis) {
      checkPageBreak(60);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Trend Analysis', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const trendLines = [
        `Revenue CAGR: ${formatPercentage(data.trendAnalysis.revenueCAGR)} annually`,
        `Profit CAGR: ${formatPercentage(data.trendAnalysis.profitCAGR)} annually`,
        `Average Gross Margin: ${formatPercent(data.trendAnalysis.avgGrossMargin)}`,
        `Average Net Margin: ${formatPercent(data.trendAnalysis.avgNetMargin)}`,
        `Growth Phase: ${data.trendAnalysis.growthPhase.replace('_', ' ')}`,
        `Consistency: ${data.trendAnalysis.consistency}`,
      ];

      trendLines.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Next Year Projection
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Next Year Projection:', margin, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`Revenue: ${formatCurrency(data.trendAnalysis.nextYearRevenue)} (Range: ${formatCurrency(data.trendAnalysis.confidenceBand.low)} - ${formatCurrency(data.trendAnalysis.confidenceBand.high)})`, margin, yPosition);
      yPosition += 15;
    }
  }

  // ========== QUICK FIX RECOMMENDATIONS ==========
  if (data.quickFixes && data.quickFixes.length > 0) {
    addNewPage();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Action Plan: Quick Wins', margin, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Prioritized recommendations for immediate financial improvement', margin, yPosition);
    yPosition += 10;

    const quickFixRows = data.quickFixes.slice(0, 8).map((fix, index) => [
      `${index + 1}`,
      fix.action,
      fix.category.replace('_', ' '),
      formatCurrency(fix.annualImpact),
      getTimeframeLabel(fix.implementation),
      fix.complexity,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Action', 'Category', 'Annual Impact', 'Timeline', 'Complexity']],
      body: quickFixRows,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        3: { fontStyle: 'bold' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Total Impact Summary
    const totalImpact = data.quickFixes.reduce((sum, fix) => sum + fix.annualImpact, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Potential Annual Impact: ${formatCurrency(totalImpact)}`, margin, yPosition);
    yPosition += 15;

    // Detailed recommendations
    checkPageBreak(100);
    doc.setFontSize(14);
    doc.text('Detailed Implementation Notes', margin, yPosition);
    yPosition += 8;

    data.quickFixes.slice(0, 5).forEach((fix, index) => {
      checkPageBreak(40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${fix.action}`, margin, yPosition);
      yPosition += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      // Word wrap for long text
      const lines = doc.splitTextToSize(fix.requiredAction, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
      yPosition += 5;
    });
  }

  // ========== RETIREMENT PLAN OPTIONS ==========
  if (data.retirementOptions && data.retirementOptions.length > 0) {
    addNewPage();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Retirement Plan Comparison', margin, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Tax-advantaged retirement savings options based on your business profile', margin, yPosition);
    yPosition += 10;

    const retirementRows = data.retirementOptions.slice(0, 4).map(plan => [
      getPlanTypeName(plan.planType),
      formatCurrency(plan.maxContribution),
      formatCurrency(plan.taxSavings),
      plan.setupCost,
      plan.annualAdminCost,
      plan.complexity,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Plan Type', 'Max Contribution', 'Tax Savings', 'Setup Cost', 'Annual Admin', 'Complexity']],
      body: retirementRows,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
      margin: { left: margin, right: margin },
      columnStyles: {
        1: { fontStyle: 'bold' },
        2: { fontStyle: 'bold' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Recommended plan details
    const recommended = data.retirementOptions[0];
    checkPageBreak(60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Recommended: ${getPlanTypeName(recommended.planType)}`, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text('Best For:', margin, yPosition);
    yPosition += 5;
    recommended.bestFor.forEach(benefit => {
      doc.text(`  - ${benefit}`, margin, yPosition);
      yPosition += 4;
    });

    yPosition += 5;
    doc.text('Key Requirements:', margin, yPosition);
    yPosition += 5;
    recommended.requirements.forEach(req => {
      doc.text(`  - ${req}`, margin, yPosition);
      yPosition += 4;
    });

    yPosition += 5;
    doc.text(`Setup Deadline: ${recommended.deadlineToSetup}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Funding Deadline: ${recommended.deadlineToFund}`, margin, yPosition);
  }

  // ========== DISCLAIMERS ==========
  addNewPage();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Important Disclosures', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const disclaimers = [
    'This report is provided for informational purposes only and does not constitute financial, tax, legal, or investment advice.',
    'All calculations and projections are based on information provided and industry benchmarks that may not reflect your specific situation.',
    'Past performance is not indicative of future results. Projected figures are estimates only.',
    'Insurance recommendations should be reviewed by a licensed insurance professional.',
    'Retirement plan recommendations should be reviewed by a qualified tax advisor or CPA before implementation.',
    'This report does not replace the advice of qualified professionals including CPAs, attorneys, and financial advisors.',
    'Benchmark data is derived from industry averages and may not reflect current market conditions.',
  ];

  disclaimers.forEach(disclaimer => {
    checkPageBreak(20);
    const lines = doc.splitTextToSize(`* ${disclaimer}`, pageWidth - 2 * margin);
    lines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 4;
    });
    yPosition += 3;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  return doc.output('blob');
}

// Helper functions for assessments
function getAssessment(value: number, lowThreshold: number, highThreshold: number): string {
  if (value >= highThreshold) return 'Strong';
  if (value >= lowThreshold) return 'Moderate';
  return 'Needs Attention';
}

function getMarginAssessment(value: number, lowThreshold: number, highThreshold: number): string {
  if (value >= highThreshold) return 'Excellent';
  if (value >= lowThreshold) return 'Good';
  return 'Below Average';
}

function getRatioAssessment(value: number, lowThreshold: number, highThreshold: number): string {
  if (value >= highThreshold) return 'Strong';
  if (value >= lowThreshold) return 'Adequate';
  return 'Concerning';
}

/**
 * Generate a simple one-page summary PDF
 */
export async function generateQuickSummaryPDF(
  data: BusinessReportData
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Financial Summary', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.businessName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text(`As of ${data.reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Key Numbers
  autoTable(doc, {
    startY: yPosition,
    body: [
      ['Annual Revenue', formatCurrency(data.annualRevenue), 'Net Income', formatCurrency(data.netIncome)],
      ['Total Assets', formatCurrency(data.totalAssets), 'Total Liabilities', formatCurrency(data.totalLiabilities)],
      ['Net Worth', formatCurrency(data.netWorth), 'Gross Margin', `${(data.grossProfitMargin * 100).toFixed(1)}%`],
    ],
    theme: 'grid',
    margin: { left: margin, right: margin },
    styles: { fontSize: 10 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Protection Gaps
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Protection Gaps:', margin, yPosition);
  yPosition += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Key Person Insurance Gap: ${formatCurrency(data.keyPersonGap)}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Buy-Sell Funding Gap: ${formatCurrency(data.buyoutFundingGap)}`, margin, yPosition);
  yPosition += 10;

  // Top 3 Quick Fixes
  if (data.quickFixes && data.quickFixes.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 3 Recommendations:', margin, yPosition);
    yPosition += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    data.quickFixes.slice(0, 3).forEach((fix, index) => {
      doc.text(`${index + 1}. ${fix.action} (Impact: ${formatCurrency(fix.annualImpact)})`, margin, yPosition);
      yPosition += 5;
    });
  }

  return doc.output('blob');
}

/**
 * Download helper function
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
