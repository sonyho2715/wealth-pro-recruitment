'use client';

import { useState, useTransition } from 'react';
import {
  Search, Phone, Check, Circle, Clock, GraduationCap,
  FileCheck, Fingerprint, Award, AlertTriangle, Mail
} from 'lucide-react';

interface Recruit {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  codeNumber: string | null;
  state: string | null;
  status: string;
  startDate: string;
  codeExpiryDate: string | null;
  hoursCompleted: number;
  examPassed: boolean;
  examPassedDate: string | null;
  fingerprinting: boolean;
  fingerprintDate: string | null;
  licenseIssued: boolean;
  licenseIssuedDate: string | null;
  notes: string | null;
  recruiter: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface LicensingClientProps {
  recruits: Recruit[];
}

// Server action to update licensing progress
async function updateLicensingProgress(
  recruitId: string,
  field: string,
  value: boolean | number
) {
  const response = await fetch('/api/recruits/licensing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recruitId, field, value }),
  });
  return response.json();
}

export default function LicensingClient({ recruits }: LicensingClientProps) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [localRecruits, setLocalRecruits] = useState(recruits);

  const filteredRecruits = localRecruits.filter(recruit => {
    const matchesSearch =
      recruit.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recruit.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recruit.phone?.includes(searchQuery) ||
      recruit.codeNumber?.includes(searchQuery);
    return matchesSearch;
  });

  const handleHoursChange = async (recruitId: string, hours: number) => {
    // Optimistic update
    setLocalRecruits(prev =>
      prev.map(r => (r.id === recruitId ? { ...r, hoursCompleted: hours } : r))
    );

    startTransition(async () => {
      await updateLicensingProgress(recruitId, 'hoursCompleted', hours);
    });
  };

  const handleCheckboxChange = async (recruitId: string, field: string, currentValue: boolean) => {
    const newValue = !currentValue;

    // Optimistic update
    setLocalRecruits(prev =>
      prev.map(r => {
        if (r.id === recruitId) {
          const dateField = `${field}Date` as keyof Recruit;
          return {
            ...r,
            [field]: newValue,
            [dateField]: newValue ? new Date().toISOString() : null,
          };
        }
        return r;
      })
    );

    startTransition(async () => {
      await updateLicensingProgress(recruitId, field, newValue);
    });
  };

  const getProgressPercent = (recruit: Recruit) => {
    let steps = 0;
    if (recruit.hoursCompleted >= 52) steps++;
    if (recruit.examPassed) steps++;
    if (recruit.fingerprinting) steps++;
    if (recruit.licenseIssued) steps++;
    return Math.round((steps / 4) * 100);
  };

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Stats
  const totalInProgress = filteredRecruits.filter(r => !r.licenseIssued).length;
  const completedLicensing = filteredRecruits.filter(r => r.licenseIssued).length;
  const examReady = filteredRecruits.filter(r => r.hoursCompleted >= 52 && !r.examPassed).length;
  const expiringCodes = filteredRecruits.filter(r => {
    const days = getDaysUntilExpiry(r.codeExpiryDate);
    return days !== null && days <= 30 && days > 0;
  }).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Licensing Tracker</h1>
        <p className="text-gray-600">Track recruit licensing progress from hours to license issuance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-blue-600">{totalInProgress}</p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-green-600">{completedLicensing}</p>
          <p className="text-sm text-gray-600">Licensed</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-purple-600">{examReady}</p>
          <p className="text-sm text-gray-600">Exam Ready</p>
        </div>
        <div className="card-gradient p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-orange-600">{expiringCodes}</p>
            <p className="text-sm text-gray-600">Codes Expiring</p>
          </div>
          {expiringCodes > 0 && <AlertTriangle className="w-6 h-6 text-orange-500" />}
        </div>
      </div>

      {/* Search */}
      <div className="card-gradient mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Licensing Table */}
      <div className="card-gradient overflow-x-auto">
        {filteredRecruits.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recruits found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name / Code</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Phone</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700" title="Hours Completed">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" /> HRS
                  </div>
                </th>
                <th className="text-center py-3 px-2 font-medium text-gray-700" title="Hours Done (52 required)">
                  Done
                </th>
                <th className="text-center py-3 px-2 font-medium text-gray-700" title="Exam Passed">
                  <div className="flex items-center justify-center gap-1">
                    <FileCheck className="w-4 h-4" /> Test
                  </div>
                </th>
                <th className="text-center py-3 px-2 font-medium text-gray-700" title="Fingerprinting">
                  <div className="flex items-center justify-center gap-1">
                    <Fingerprint className="w-4 h-4" /> FP
                  </div>
                </th>
                <th className="text-center py-3 px-2 font-medium text-gray-700" title="License Issued">
                  <div className="flex items-center justify-center gap-1">
                    <Award className="w-4 h-4" /> Lic
                  </div>
                </th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Code Expiry</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Progress</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecruits.map((recruit) => {
                const progress = getProgressPercent(recruit);
                const daysUntilExpiry = getDaysUntilExpiry(recruit.codeExpiryDate);
                const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
                const hoursComplete = recruit.hoursCompleted >= 52;

                return (
                  <tr key={recruit.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {recruit.firstName} {recruit.lastName}
                        </p>
                        {recruit.codeNumber && (
                          <p className="text-xs text-gray-500">Code: {recruit.codeNumber}</p>
                        )}
                        <p className="text-xs text-gray-400">{recruit.state || 'No state'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm">
                        {recruit.phone && (
                          <a href={`tel:${recruit.phone}`} className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                            <Phone className="w-3 h-3" /> {recruit.phone}
                          </a>
                        )}
                        {recruit.email && (
                          <a href={`mailto:${recruit.email}`} className="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-xs">
                            <Mail className="w-3 h-3" /> {recruit.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={recruit.hoursCompleted}
                        onChange={(e) => handleHoursChange(recruit.id, parseInt(e.target.value) || 0)}
                        disabled={isPending}
                        min="0"
                        max="100"
                        className="w-16 text-center px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded ${
                        hoursComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {hoursComplete ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleCheckboxChange(recruit.id, 'examPassed', recruit.examPassed)}
                        disabled={isPending}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          recruit.examPassed
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {recruit.examPassed ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleCheckboxChange(recruit.id, 'fingerprinting', recruit.fingerprinting)}
                        disabled={isPending}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          recruit.fingerprinting
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {recruit.fingerprinting ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleCheckboxChange(recruit.id, 'licenseIssued', recruit.licenseIssued)}
                        disabled={isPending}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          recruit.licenseIssued
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {recruit.licenseIssued ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {recruit.codeExpiryDate ? (
                        <span className={`text-sm font-medium ${
                          isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {isExpired ? 'Expired' : isExpiringSoon ? `${daysUntilExpiry}d left` : new Date(recruit.codeExpiryDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              progress === 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 max-w-[150px] truncate">
                      {recruit.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" /> HRS = Pre-licensing hours (52 required)
        </span>
        <span className="flex items-center gap-1">
          <FileCheck className="w-4 h-4" /> Test = State exam passed
        </span>
        <span className="flex items-center gap-1">
          <Fingerprint className="w-4 h-4" /> FP = Fingerprinting done
        </span>
        <span className="flex items-center gap-1">
          <Award className="w-4 h-4" /> Lic = License issued
        </span>
      </div>
    </div>
  );
}
