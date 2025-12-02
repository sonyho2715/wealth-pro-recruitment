'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  Target,
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  Activity as ActivityIcon,
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ReportData {
  agent: {
    name: string;
    monthlyGoal: number | null;
  };
  production: {
    totalCommissionsAllTime: number;
    totalCommissionsThisMonth: number;
    totalCommissionsThisYear: number;
    totalCommissionsLastMonth: number;
    policiesSoldAllTime: number;
    policiesSoldThisMonth: number;
    policiesSoldThisYear: number;
    policiesSoldLastMonth: number;
    avgCommissionPerPolicy: number;
    monthlyTrend: Array<{ month: string; amount: number; count: number }>;
  };
  pipeline: {
    prospectsByStage: {
      LEAD: number;
      QUALIFIED: number;
      INSURANCE_CLIENT: number;
      AGENT_PROSPECT: number;
      LICENSED_AGENT: number;
      INACTIVE: number;
    };
    conversionRates: {
      leadToQualified: number;
      qualifiedToClient: number;
      clientToAgent: number;
    };
    totalActiveProspects: number;
  };
  activities: {
    totalActivities: number;
    activitiesThisMonth: number;
    activitiesLastMonth: number;
    completedActivities: number;
    completionRate: number;
    activitiesByType: {
      CALL: number;
      MEETING: number;
      EMAIL: number;
      FOLLOW_UP: number;
      PRESENTATION: number;
      APPLICATION: number;
      OTHER: number;
    };
  };
  goal: {
    monthlyGoal: number | null;
    currentProgress: number;
    goalProgress: number | null;
    daysRemaining: number;
  };
}

export default function ReportsClient({ data }: { data: ReportData }) {
  const [dateRange, setDateRange] = useState<'all' | 'year' | 'month'>('all');

  // Export to CSV function
  const handleExportCSV = () => {
    const csvRows = [
      ['Wealth Pro Recruitment - Reports Export'],
      ['Generated on', new Date().toLocaleString()],
      ['Agent', data.agent.name],
      [],
      ['Production Metrics'],
      ['Total Commissions (All Time)', `$${data.production.totalCommissionsAllTime.toLocaleString()}`],
      ['Total Commissions (This Month)', `$${data.production.totalCommissionsThisMonth.toLocaleString()}`],
      ['Total Commissions (This Year)', `$${data.production.totalCommissionsThisYear.toLocaleString()}`],
      ['Policies Sold (All Time)', data.production.policiesSoldAllTime],
      ['Policies Sold (This Month)', data.production.policiesSoldThisMonth],
      ['Policies Sold (This Year)', data.production.policiesSoldThisYear],
      ['Average Commission per Policy', `$${data.production.avgCommissionPerPolicy.toLocaleString()}`],
      [],
      ['Pipeline Metrics'],
      ['Leads', data.pipeline.prospectsByStage.LEAD],
      ['Qualified', data.pipeline.prospectsByStage.QUALIFIED],
      ['Insurance Clients', data.pipeline.prospectsByStage.INSURANCE_CLIENT],
      ['Agent Prospects', data.pipeline.prospectsByStage.AGENT_PROSPECT],
      ['Licensed Agents', data.pipeline.prospectsByStage.LICENSED_AGENT],
      ['Inactive', data.pipeline.prospectsByStage.INACTIVE],
      [],
      ['Activity Metrics'],
      ['Total Activities', data.activities.totalActivities],
      ['Activities This Month', data.activities.activitiesThisMonth],
      ['Activities Last Month', data.activities.activitiesLastMonth],
      ['Completed Activities', data.activities.completedActivities],
      ['Completion Rate', `${data.activities.completionRate.toFixed(1)}%`],
      [],
      ['Activities by Type'],
      ['Calls', data.activities.activitiesByType.CALL],
      ['Meetings', data.activities.activitiesByType.MEETING],
      ['Emails', data.activities.activitiesByType.EMAIL],
      ['Follow-ups', data.activities.activitiesByType.FOLLOW_UP],
      ['Presentations', data.activities.activitiesByType.PRESENTATION],
      ['Applications', data.activities.activitiesByType.APPLICATION],
      ['Other', data.activities.activitiesByType.OTHER],
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealth-pro-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Chart data configurations
  const lineChartData = {
    labels: data.production.monthlyTrend.map(m => m.month),
    datasets: [
      {
        label: 'Monthly Commissions',
        data: data.production.monthlyTrend.map(m => m.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `$${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  const pipelineChartData = {
    labels: ['Lead', 'Qualified', 'Insurance Client', 'Agent Prospect', 'Licensed Agent'],
    datasets: [
      {
        data: [
          data.pipeline.prospectsByStage.LEAD,
          data.pipeline.prospectsByStage.QUALIFIED,
          data.pipeline.prospectsByStage.INSURANCE_CLIENT,
          data.pipeline.prospectsByStage.AGENT_PROSPECT,
          data.pipeline.prospectsByStage.LICENSED_AGENT,
        ],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(99, 102, 241, 0.8)',
        ],
        borderColor: [
          'rgb(156, 163, 175)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)',
          'rgb(99, 102, 241)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const pipelineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const activityTypeChartData = {
    labels: ['Calls', 'Meetings', 'Emails', 'Follow-ups', 'Presentations', 'Applications', 'Other'],
    datasets: [
      {
        label: 'Activities',
        data: [
          data.activities.activitiesByType.CALL,
          data.activities.activitiesByType.MEETING,
          data.activities.activitiesByType.EMAIL,
          data.activities.activitiesByType.FOLLOW_UP,
          data.activities.activitiesByType.PRESENTATION,
          data.activities.activitiesByType.APPLICATION,
          data.activities.activitiesByType.OTHER,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
    ],
  };

  const activityTypeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive performance insights and metrics</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Download className="w-5 h-5" />
          Export to CSV
        </button>
      </div>

      {/* Production Dashboard */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Production Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card-gradient">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">All Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${data.production.totalCommissionsAllTime.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {data.production.policiesSoldAllTime} {data.production.policiesSoldAllTime === 1 ? 'policy' : 'policies'} sold
            </p>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${data.production.totalCommissionsThisMonth.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {data.production.policiesSoldThisMonth} {data.production.policiesSoldThisMonth === 1 ? 'policy' : 'policies'} sold
            </p>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Year</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${data.production.totalCommissionsThisYear.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {data.production.policiesSoldThisYear} {data.production.policiesSoldThisYear === 1 ? 'policy' : 'policies'} sold
            </p>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg per Policy</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${data.production.avgCommissionPerPolicy.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Average commission</p>
          </div>
        </div>

        {/* Commission Trend Chart */}
        <div className="card-gradient">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Commission Trend</h3>
          <div className="h-80">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>

      {/* Goal Tracking */}
      {data.goal.monthlyGoal && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Monthly Goal Tracking
          </h2>
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Current Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${data.goal.currentProgress.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Monthly Goal</p>
                <p className="text-3xl font-bold text-indigo-600">
                  ${data.goal.monthlyGoal.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {data.goal.goalProgress !== null ? `${data.goal.goalProgress.toFixed(1)}%` : '0%'} Complete
                </span>
                <span className="text-sm text-gray-600">
                  {data.goal.daysRemaining} {data.goal.daysRemaining === 1 ? 'day' : 'days'} remaining
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((data.goal.goalProgress || 0), 100)}%`,
                  }}
                />
              </div>
            </div>
            {data.goal.goalProgress !== null && data.goal.goalProgress >= 100 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <p className="text-green-800 font-medium">
                  Congratulations! You've reached your monthly goal!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pipeline Dashboard */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Pipeline Dashboard
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Prospect Stages */}
          <div className="card-gradient">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prospects by Stage</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Lead</span>
                <span className="text-2xl font-bold text-gray-900">{data.pipeline.prospectsByStage.LEAD}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-700">Qualified</span>
                <span className="text-2xl font-bold text-blue-900">{data.pipeline.prospectsByStage.QUALIFIED}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-700">Insurance Client</span>
                <span className="text-2xl font-bold text-green-900">{data.pipeline.prospectsByStage.INSURANCE_CLIENT}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-700">Agent Prospect</span>
                <span className="text-2xl font-bold text-purple-900">{data.pipeline.prospectsByStage.AGENT_PROSPECT}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <span className="font-medium text-indigo-700">Licensed Agent</span>
                <span className="text-2xl font-bold text-indigo-900">{data.pipeline.prospectsByStage.LICENSED_AGENT}</span>
              </div>
            </div>
          </div>

          {/* Pipeline Chart */}
          <div className="card-gradient">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Visualization</h3>
            <div className="h-80">
              <Doughnut data={pipelineChartData} options={pipelineChartOptions} />
            </div>
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="card-gradient">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Lead → Qualified</p>
              <p className="text-3xl font-bold text-blue-900">
                {data.pipeline.conversionRates.leadToQualified.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Qualified → Client</p>
              <p className="text-3xl font-bold text-green-900">
                {data.pipeline.conversionRates.qualifiedToClient.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">Client → Agent</p>
              <p className="text-3xl font-bold text-purple-900">
                {data.pipeline.conversionRates.clientToAgent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ActivityIcon className="w-6 h-6 text-orange-600" />
          Activity Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ActivityIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{data.activities.totalActivities}</p>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{data.activities.completedActivities}</p>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{data.activities.activitiesThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.activities.completionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Month Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card-gradient">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Month over Month</h3>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Last Month</p>
                <p className="text-3xl font-bold text-gray-900">{data.activities.activitiesLastMonth}</p>
              </div>
              <div className="text-4xl text-gray-300">→</div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-blue-600">{data.activities.activitiesThisMonth}</p>
              </div>
            </div>
            {data.activities.activitiesLastMonth > 0 && (
              <div className="mt-4 text-center">
                <span
                  className={`text-sm font-medium ${
                    data.activities.activitiesThisMonth >= data.activities.activitiesLastMonth
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {data.activities.activitiesThisMonth >= data.activities.activitiesLastMonth ? '↑' : '↓'}{' '}
                  {Math.abs(
                    ((data.activities.activitiesThisMonth - data.activities.activitiesLastMonth) /
                      data.activities.activitiesLastMonth) *
                      100
                  ).toFixed(1)}
                  % vs last month
                </span>
              </div>
            )}
          </div>

          {/* Activities by Type Chart */}
          <div className="card-gradient">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities by Type</h3>
            <div className="h-64">
              <Bar data={activityTypeChartData} options={activityTypeChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
