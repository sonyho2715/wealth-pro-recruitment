'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CalibrationResult,
  getRevenueTierLabel,
  getHealthScoreDisplay,
} from '@/lib/calibration-engine';

interface CalibrationPDFExportProps {
  businessName: string;
  industryName: string;
  calibration: CalibrationResult;
  metrics: {
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    netIncome: number;
  };
  agentName?: string;
  agentPhone?: string | null;
  agentEmail?: string;
  organizationName?: string;
  className?: string;
}

export default function CalibrationPDFExport({
  businessName,
  industryName,
  calibration,
  metrics,
  agentName,
  agentPhone,
  agentEmail,
  organizationName,
  className = '',
}: CalibrationPDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount: number) => {
    const absValue = Math.abs(amount);
    if (absValue >= 1000000) {
      return (amount < 0 ? '-' : '') + '$' + (absValue / 1000000).toFixed(1) + 'M';
    }
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatPercent = (value: number) => {
    return (value * 100).toFixed(1) + '%';
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 75) return 'Excellent';
    if (percentile >= 50) return 'Good';
    if (percentile >= 25) return 'Fair';
    return 'Needs Work';
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      const healthDisplay = getHealthScoreDisplay(calibration.healthScore);

      // Header with organization branding
      if (organizationName) {
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(organizationName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
      }

      // Title
      doc.setFontSize(22);
      doc.setTextColor(31, 41, 55);
      doc.text('Industry Calibration Report', pageWidth / 2, yPos, { align: 'center' });

      // Business Name
      yPos += 12;
      doc.setFontSize(16);
      doc.setTextColor(55, 65, 81);
      doc.text(businessName, pageWidth / 2, yPos, { align: 'center' });

      // Industry & Date
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Industry: ${industryName}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      doc.text(`Revenue Tier: ${getRevenueTierLabel(calibration.revenueTier)}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });

      // Health Score Box
      yPos += 12;
      const healthColor = healthDisplay.color === 'emerald' ? [16, 185, 129] :
                          healthDisplay.color === 'blue' ? [59, 130, 246] :
                          healthDisplay.color === 'amber' ? [245, 158, 11] : [239, 68, 68];

      doc.setFillColor(healthColor[0], healthColor[1], healthColor[2]);
      doc.roundedRect(pageWidth / 2 - 40, yPos, 80, 35, 3, 3, 'F');

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('HEALTH SCORE', pageWidth / 2, yPos + 10, { align: 'center' });

      doc.setFontSize(24);
      doc.text(calibration.healthScore.toString(), pageWidth / 2, yPos + 25, { align: 'center' });

      doc.setFontSize(10);
      doc.text(healthDisplay.label, pageWidth / 2, yPos + 32, { align: 'center' });

      // Current Metrics Summary
      yPos += 45;
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Current Financial Metrics', 14, yPos);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Metric', 'Value', 'Industry Percentile', 'Rating']],
        body: [
          [
            'Gross Profit Margin',
            formatPercent(metrics.grossProfit / metrics.revenue),
            `${Math.round(calibration.percentileScores.grossProfitPercentile)}th`,
            getPercentileLabel(calibration.percentileScores.grossProfitPercentile),
          ],
          [
            'Net Profit Margin',
            formatPercent(metrics.netIncome / metrics.revenue),
            `${Math.round(calibration.percentileScores.netProfitPercentile)}th`,
            getPercentileLabel(calibration.percentileScores.netProfitPercentile),
          ],
          [
            'Cost Efficiency (COGS)',
            formatPercent(metrics.costOfGoodsSold / metrics.revenue),
            `${Math.round(calibration.percentileScores.cogsPercentile)}th`,
            getPercentileLabel(calibration.percentileScores.cogsPercentile),
          ],
          [
            'Liquidity',
            '-',
            `${Math.round(calibration.percentileScores.currentRatioPercentile)}th`,
            getPercentileLabel(calibration.percentileScores.currentRatioPercentile),
          ],
          [
            'Pension Planning',
            '-',
            `${Math.round(calibration.percentileScores.pensionPercentile)}th`,
            getPercentileLabel(calibration.percentileScores.pensionPercentile),
          ],
        ],
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105] },
        styles: { fontSize: 9 },
        columnStyles: {
          3: {
            cellWidth: 25,
          },
        },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.section === 'body') {
            const rating = data.cell.raw as string;
            if (rating === 'Excellent') {
              data.cell.styles.textColor = [16, 185, 129];
            } else if (rating === 'Good') {
              data.cell.styles.textColor = [59, 130, 246];
            } else if (rating === 'Fair') {
              data.cell.styles.textColor = [245, 158, 11];
            } else {
              data.cell.styles.textColor = [239, 68, 68];
            }
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      // Opportunity Analysis
      yPos = doc.lastAutoTable!.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Improvement Opportunities', 14, yPos);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Opportunity Area', 'Potential Annual Benefit']],
        body: [
          ['Revenue Growth (Price Optimization)', formatCurrency(calibration.opportunities.revenueOpportunity)],
          ['Cost Reduction (COGS Efficiency)', formatCurrency(calibration.opportunities.cogsOpportunity)],
          ['Labor Optimization', formatCurrency(calibration.opportunities.laborOpportunity)],
          ['Tax Savings (Pension)', formatCurrency(calibration.opportunities.pensionOpportunity)],
          ['Total Annual Opportunity', formatCurrency(calibration.opportunities.totalOpportunity)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 },
        didParseCell: (data) => {
          if (data.row.index === 4) {
            data.cell.styles.fontStyle = 'bold';
            if (data.column.index === 1) {
              data.cell.styles.textColor = [16, 185, 129];
            }
          }
        },
      });

      // 5-Year Projection Table
      yPos = doc.lastAutoTable!.finalY + 15;

      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('5-Year Net Income Projection', 14, yPos);

      const projectionBody = calibration.withoutScenario.map((without, i) => {
        const withData = calibration.withScenario[i];
        const diff = withData.netIncome - without.netIncome;
        return [
          `Year ${without.year}`,
          formatCurrency(without.netIncome),
          formatCurrency(withData.netIncome),
          (diff >= 0 ? '+' : '') + formatCurrency(diff),
          formatCurrency(withData.taxSavings),
        ];
      });

      // Add totals row
      const withoutTotal = calibration.withoutScenario.reduce((sum, y) => sum + y.netIncome, 0);
      const withTotal = calibration.withScenario.reduce((sum, y) => sum + y.netIncome, 0);
      const taxSavingsTotal = calibration.withScenario.reduce((sum, y) => sum + y.taxSavings, 0);

      projectionBody.push([
        '5-Year Total',
        formatCurrency(withoutTotal),
        formatCurrency(withTotal),
        '+' + formatCurrency(withTotal - withoutTotal),
        formatCurrency(taxSavingsTotal),
      ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Year', 'Without Changes', 'With Improvements', 'Difference', 'Tax Savings']],
        body: projectionBody,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
        didParseCell: (data) => {
          if (data.row.index === 5) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [30, 41, 59];
            data.cell.styles.textColor = [255, 255, 255];
          }
          if (data.column.index === 3 && data.section === 'body' && data.row.index < 5) {
            data.cell.styles.textColor = [16, 185, 129];
          }
          if (data.column.index === 4 && data.section === 'body' && data.row.index < 5) {
            data.cell.styles.textColor = [139, 92, 246];
          }
        },
      });

      // Total Benefit Summary Box
      yPos = doc.lastAutoTable!.finalY + 10;
      const totalBenefit = (withTotal - withoutTotal) + taxSavingsTotal;

      doc.setFillColor(16, 185, 129);
      doc.roundedRect(14, yPos, pageWidth - 28, 25, 3, 3, 'F');

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('TOTAL 5-YEAR BENEFIT', 20, yPos + 10);

      doc.setFontSize(18);
      doc.text(formatCurrency(totalBenefit), pageWidth - 20, yPos + 15, { align: 'right' });

      doc.setFontSize(8);
      doc.text(`(${formatCurrency(withTotal - withoutTotal)} additional income + ${formatCurrency(taxSavingsTotal)} tax savings)`, pageWidth - 20, yPos + 22, { align: 'right' });

      // Key Insights
      yPos += 35;

      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      if (calibration.insights.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('Key Insights & Recommendations', 14, yPos);

        yPos += 8;
        doc.setFontSize(9);

        calibration.insights.slice(0, 5).forEach((insight, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }

          const bulletColor = insight.type === 'success' ? [16, 185, 129] :
                             insight.type === 'opportunity' ? [59, 130, 246] :
                             insight.type === 'warning' ? [245, 158, 11] : [239, 68, 68];

          doc.setFillColor(bulletColor[0], bulletColor[1], bulletColor[2]);
          doc.circle(18, yPos + 2, 2, 'F');

          doc.setTextColor(31, 41, 55);
          doc.setFont('helvetica', 'bold');
          doc.text(insight.title, 24, yPos + 3);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(107, 114, 128);
          const description = doc.splitTextToSize(insight.description, pageWidth - 40);
          doc.text(description, 24, yPos + 10);

          yPos += 10 + (description.length * 4);
        });
      }

      // Talk to Advisor CTA
      if (agentName || agentEmail || agentPhone) {
        yPos += 10;

        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFillColor(240, 249, 255); // blue-50
        doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, 'F');

        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175); // blue-800
        doc.text('Ready to Implement These Improvements?', pageWidth / 2, yPos + 12, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        if (agentName) {
          doc.text(`Contact your advisor: ${agentName}`, pageWidth / 2, yPos + 22, { align: 'center' });
        }
        if (agentEmail || agentPhone) {
          const contactInfo = [agentEmail, agentPhone].filter(Boolean).join(' | ');
          doc.text(contactInfo, pageWidth / 2, yPos + 29, { align: 'center' });
        }
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
          `Page ${i} of ${pageCount} | Industry Calibration Report - ${businessName}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const filename = `calibration-report-${businessName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast.success('Calibration report downloaded');
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
      className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export PDF Report
        </>
      )}
    </button>
  );
}
