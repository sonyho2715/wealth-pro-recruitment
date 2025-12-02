'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Types for jsPDF autotable are augmented in types/jspdf-autotable.d.ts

interface AssetBreakdown {
  savings: number;
  investments: number;
  retirement401k: number;
  homeEquity: number;
  otherAssets: number;
}

interface LiabilityBreakdown {
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  creditCards: number;
  otherDebts: number;
}

interface InsuranceNeed {
  type: string;
  recommendedCoverage: number;
  currentCoverage: number;
  gap: number;
  monthlyPremium: number | null;
  priority: number;
  reasoning: string;
}

interface AgentProjection {
  year1Income: number;
  year3Income: number;
  year5Income: number;
  lifetimeValue: number;
}

interface PDFExportButtonProps {
  prospectName: string;
  email: string;
  phone?: string | null;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  assets: AssetBreakdown;
  liabilities: LiabilityBreakdown;
  insuranceNeeds: InsuranceNeed[];
  totalRecommendedCoverage: number;
  totalCurrentCoverage: number;
  protectionGap: number;
  yearsToRetirement: number;
  retirementAge: number;
  currentAge: number;
  agentProjection: AgentProjection | null;
  className?: string;
}

const insuranceTypeLabels: Record<string, string> = {
  TERM_LIFE: 'Term Life Insurance',
  WHOLE_LIFE: 'Whole Life Insurance',
  UNIVERSAL_LIFE: 'Universal Life Insurance',
  DISABILITY: 'Disability Insurance',
  LONG_TERM_CARE: 'Long-Term Care Insurance',
};

export default function PDFExportButton({
  prospectName,
  email,
  phone,
  totalAssets,
  totalLiabilities,
  netWorth,
  monthlyIncome,
  monthlyExpenses,
  assets,
  liabilities,
  insuranceNeeds,
  totalRecommendedCoverage,
  totalCurrentCoverage,
  protectionGap,
  yearsToRetirement,
  retirementAge,
  currentAge,
  agentProjection,
  className = '',
}: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount: number) => {
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Title
      doc.setFontSize(24);
      doc.setTextColor(31, 41, 55); // gray-900
      doc.text('Personal Balance Sheet', pageWidth / 2, yPos, { align: 'center' });

      // Prospect Info
      yPos += 15;
      doc.setFontSize(14);
      doc.setTextColor(55, 65, 81); // gray-700
      doc.text(prospectName, pageWidth / 2, yPos, { align: 'center' });

      yPos += 7;
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // gray-500
      doc.text(email + (phone ? ` | ${phone}` : ''), pageWidth / 2, yPos, { align: 'center' });

      yPos += 5;
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });

      // Net Worth Summary
      yPos += 15;
      doc.setFillColor(240, 253, 244); // green-50
      doc.rect(14, yPos - 5, pageWidth - 28, 25, 'F');
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text('Net Worth', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      doc.setFontSize(20);
      doc.setTextColor(netWorth >= 0 ? 22 : 220, netWorth >= 0 ? 163 : 38, netWorth >= 0 ? 74 : 38); // green-600 or red-600
      doc.text(formatCurrency(netWorth), pageWidth / 2, yPos, { align: 'center' });

      // Assets and Liabilities side by side summary
      yPos += 20;
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Total Assets: ${formatCurrency(totalAssets)}`, 50, yPos, { align: 'center' });
      doc.text(`Total Liabilities: ${formatCurrency(totalLiabilities)}`, pageWidth - 50, yPos, { align: 'center' });

      // Assets Table
      yPos += 15;
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Assets Breakdown', 14, yPos);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Asset Type', 'Amount']],
        body: [
          ['Savings', formatCurrency(assets.savings)],
          ['Investments', formatCurrency(assets.investments)],
          ['401(k)/Retirement', formatCurrency(assets.retirement401k)],
          ['Home Equity', formatCurrency(assets.homeEquity)],
          ['Other Assets', formatCurrency(assets.otherAssets)],
          ['Total', formatCurrency(totalAssets)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }, // green-600
        margin: { left: 14, right: pageWidth / 2 + 5 },
        tableWidth: pageWidth / 2 - 19,
        styles: { fontSize: 9 },
        didParseCell: (data) => {
          if (data.row.index === 5) {
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      // Liabilities Table (side by side)
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Liabilities Breakdown', pageWidth / 2 + 5, yPos);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Liability Type', 'Amount']],
        body: [
          ['Mortgage', formatCurrency(liabilities.mortgage)],
          ['Car Loans', formatCurrency(liabilities.carLoans)],
          ['Student Loans', formatCurrency(liabilities.studentLoans)],
          ['Credit Cards', formatCurrency(liabilities.creditCards)],
          ['Other Debts', formatCurrency(liabilities.otherDebts)],
          ['Total', formatCurrency(totalLiabilities)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] }, // red-600
        margin: { left: pageWidth / 2 + 5, right: 14 },
        tableWidth: pageWidth / 2 - 19,
        styles: { fontSize: 9 },
        didParseCell: (data) => {
          if (data.row.index === 5) {
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      // Cash Flow Section
      yPos = doc.lastAutoTable!.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Monthly Cash Flow', 14, yPos);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Category', 'Amount']],
        body: [
          ['Monthly Income', formatCurrency(monthlyIncome)],
          ['Monthly Expenses', formatCurrency(monthlyExpenses)],
          ['Monthly Surplus/Deficit', formatCurrency(monthlyIncome - monthlyExpenses)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }, // blue-600
        styles: { fontSize: 10 },
        didParseCell: (data) => {
          if (data.row.index === 2) {
            data.cell.styles.fontStyle = 'bold';
            if (data.column.index === 1) {
              data.cell.styles.textColor = monthlyIncome - monthlyExpenses >= 0 ? [22, 163, 74] : [220, 38, 38];
            }
          }
        },
      });

      // Insurance Needs
      yPos = doc.lastAutoTable!.finalY + 15;

      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Insurance Needs Analysis', 14, yPos);

      if (insuranceNeeds.length > 0) {
        autoTable(doc, {
          startY: yPos + 5,
          head: [['Coverage Type', 'Recommended', 'Current', 'Gap', 'Est. Premium']],
          body: [
            ...insuranceNeeds.map((need) => [
              insuranceTypeLabels[need.type] || need.type,
              formatCurrency(need.recommendedCoverage),
              formatCurrency(need.currentCoverage),
              formatCurrency(need.gap),
              need.monthlyPremium ? `${formatCurrency(need.monthlyPremium)}/mo` : 'N/A',
            ]),
            ['Total Protection Gap', '', '', formatCurrency(protectionGap), ''],
          ],
          theme: 'striped',
          headStyles: { fillColor: [139, 92, 246] }, // purple-600
          styles: { fontSize: 9 },
          didParseCell: (data) => {
            if (data.row.index === insuranceNeeds.length) {
              data.cell.styles.fontStyle = 'bold';
            }
          },
        });
      } else {
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text('No insurance needs analysis available', 14, yPos);
      }

      // Retirement Info
      yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Retirement Planning', 14, yPos);

      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.text(`Current Age: ${currentAge}`, 14, yPos);
      yPos += 6;
      doc.text(`Target Retirement Age: ${retirementAge}`, 14, yPos);
      yPos += 6;
      doc.text(`Years to Retirement: ${yearsToRetirement}`, 14, yPos);

      // Agent Projection (if exists)
      if (agentProjection) {
        yPos += 15;

        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('Agent Career Opportunity Projection', 14, yPos);

        autoTable(doc, {
          startY: yPos + 5,
          head: [['Timeframe', 'Projected Income']],
          body: [
            ['Year 1', formatCurrency(agentProjection.year1Income)],
            ['Year 3', formatCurrency(agentProjection.year3Income)],
            ['Year 5', formatCurrency(agentProjection.year5Income)],
            ['Lifetime Value', formatCurrency(agentProjection.lifetimeValue)],
          ],
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241] }, // indigo-600
          styles: { fontSize: 10 },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175); // gray-400
        doc.text(
          `Page ${i} of ${pageCount} | Generated by WealthPro Recruitment`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const filename = `balance-sheet-${prospectName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`btn-secondary text-sm flex items-center gap-2 ${className} ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Generate PDF
        </>
      )}
    </button>
  );
}
