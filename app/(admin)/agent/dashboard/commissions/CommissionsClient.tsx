'use client';

import { useState, useMemo } from 'react';
import { Commission, Prospect, CommissionStatus } from '@prisma/client';
import Pagination from '@/components/Pagination';
import {
  DollarSign,
  Plus,
  Filter,
  X,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createCommission, updateCommissionStatus, deleteCommission } from './actions';

type CommissionWithProspect = Commission & {
  prospect: Prospect | null;
};

interface CommissionsClientProps {
  commissions: CommissionWithProspect[];
  prospects: Prospect[];
}

const statusColors: Record<CommissionStatus, { bg: string; text: string; icon: typeof Clock }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  APPROVED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle2 },
  PAID: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  CHARGEBACK: { bg: 'bg-red-100', text: 'text-red-700', icon: TrendingDown },
};

const productTypes = [
  'Life Insurance',
  'Disability Insurance',
  'Long-term Care',
  'Universal Life',
  'Whole Life',
  'Term Life',
  'Annuity',
  'Other',
];

const ITEMS_PER_PAGE = 10;

export default function CommissionsClient({ commissions, prospects }: CommissionsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<CommissionStatus | 'ALL'>('ALL');
  const [filterProductType, setFilterProductType] = useState<string>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<'ALL' | 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter commissions
  const filteredCommissions = commissions.filter((commission) => {
    // Status filter
    if (filterStatus !== 'ALL' && commission.status !== filterStatus) return false;

    // Product type filter
    if (filterProductType !== 'ALL' && commission.productType !== filterProductType) return false;

    // Date range filter
    if (filterDateRange !== 'ALL' && commission.earnedDate) {
      const earnedDate = new Date(commission.earnedDate);
      const now = new Date();

      if (filterDateRange === 'THIS_MONTH') {
        if (earnedDate.getMonth() !== now.getMonth() || earnedDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (filterDateRange === 'THIS_QUARTER') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const earnedQuarter = Math.floor(earnedDate.getMonth() / 3);
        if (earnedQuarter !== currentQuarter || earnedDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (filterDateRange === 'THIS_YEAR') {
        if (earnedDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      }
    }

    return true;
  });

  // Sort by earned date (most recent first)
  const sortedCommissions = [...filteredCommissions].sort((a, b) => {
    if (a.earnedDate && b.earnedDate) {
      return new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime();
    }
    if (a.earnedDate && !b.earnedDate) return -1;
    if (!a.earnedDate && b.earnedDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedCommissions.length / ITEMS_PER_PAGE);
  const paginatedCommissions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedCommissions.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedCommissions, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  // Calculate totals
  const pendingTotal = commissions
    .filter(c => c.status === 'PENDING')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const approvedTotal = commissions
    .filter(c => c.status === 'APPROVED')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const paidYTD = commissions
    .filter(c => {
      if (c.status !== 'PAID' || !c.paidDate) return false;
      const paidDate = new Date(c.paidDate);
      const now = new Date();
      return paidDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const chargebackTotal = commissions
    .filter(c => c.status === 'CHARGEBACK')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const handleCreateCommission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCommission(formData);

    if (result.success) {
      setIsModalOpen(false);
      e.currentTarget.reset();
    } else {
      setError(result.error || 'Failed to create commission');
    }

    setIsSubmitting(false);
  };

  const handleStatusChange = async (commissionId: string, newStatus: CommissionStatus) => {
    const formData = new FormData();
    formData.append('status', newStatus);

    const result = await updateCommissionStatus(commissionId, formData);
    if (result.success) {
      toast.success('Status updated');
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteCommission = async (commissionId: string) => {
    setDeletingId(commissionId);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const result = await deleteCommission(deletingId);
    if (result.success) {
      toast.success('Commission deleted');
    } else {
      toast.error(result.error || 'Failed to delete commission');
    }
    setDeletingId(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Prospect', 'Product Type', 'Policy Number', 'Amount', 'Status', 'Paid Date', 'Notes'];
    const rows = sortedCommissions.map(c => [
      c.earnedDate ? new Date(c.earnedDate).toLocaleDateString() : '',
      c.prospect ? `${c.prospect.firstName} ${c.prospect.lastName}` : '',
      c.productType,
      c.policyNumber || '',
      c.amount.toString(),
      c.status,
      c.paidDate ? new Date(c.paidDate).toLocaleDateString() : '',
      c.notes || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get unique product types from existing commissions
  const uniqueProductTypes = Array.from(new Set(commissions.map(c => c.productType))).sort();

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Tracker</h1>
          <p className="text-gray-600">Track and manage all your commissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Commission
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">${pendingTotal.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">${approvedTotal.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">${paidYTD.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Paid (YTD)</div>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">${chargebackTotal.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Chargebacks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-gradient mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus, e.target.value as typeof filterStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="CHARGEBACK">Chargeback</option>
            </select>
          </div>

          {/* Product Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
            <select
              value={filterProductType}
              onChange={(e) => handleFilterChange(setFilterProductType, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Products</option>
              {uniqueProductTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filterDateRange}
              onChange={(e) => handleFilterChange(setFilterDateRange, e.target.value as typeof filterDateRange)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Time</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="THIS_QUARTER">This Quarter</option>
              <option value="THIS_YEAR">This Year</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(filterStatus !== 'ALL' || filterProductType !== 'ALL' || filterDateRange !== 'ALL') && (
          <button
            onClick={() => {
              setFilterStatus('ALL');
              setFilterProductType('ALL');
              setFilterDateRange('ALL');
              setCurrentPage(1);
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Commissions Table */}
      <div className="card-gradient">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Commissions ({sortedCommissions.length})
        </h2>

        {sortedCommissions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No commissions found</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Add your first commission
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Prospect</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Policy #</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCommissions.map((commission) => {
                  const statusConfig = statusColors[commission.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {commission.earnedDate
                          ? new Date(commission.earnedDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {commission.prospect
                          ? `${commission.prospect.firstName} ${commission.prospect.lastName}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{commission.productType}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {commission.policyNumber || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        ${Number(commission.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={commission.status}
                          onChange={(e) => handleStatusChange(commission.id, e.target.value as CommissionStatus)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="PAID">Paid</option>
                          <option value="CHARGEBACK">Chargeback</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCommission(commission.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={sortedCommissions.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* Add Commission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Commission</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateCommission} className="space-y-4">
                {/* Prospect */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prospect (Optional)
                  </label>
                  <select
                    name="prospectId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">None</option>
                    {prospects.map((prospect) => (
                      <option key={prospect.id} value={prospect.id}>
                        {prospect.firstName} {prospect.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="productType"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select product type...</option>
                    {productTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Policy Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="policyNumber"
                    placeholder="e.g., POL-123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="amount"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Earned Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Earned Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="earnedDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Add any notes or details..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Commission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Commission</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this commission? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
