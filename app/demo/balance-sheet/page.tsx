import LivingBalanceSheet, { sampleBalanceSheetData } from '@/components/LivingBalanceSheet';

export default function BalanceSheetDemoPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Living Balance Sheet</h1>
          <p className="text-slate-600">Complete financial snapshot at a glance</p>
        </div>

        <LivingBalanceSheet
          data={sampleBalanceSheetData}
          clientName="John & Jane Smith"
        />

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>This is a demonstration of the Living Balance Sheet component.</p>
          <p>Data shown is sample data for illustration purposes only.</p>
        </div>
      </div>
    </div>
  );
}
