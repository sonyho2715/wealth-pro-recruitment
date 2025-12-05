'use client';

import { User, Mail, Phone, Calendar, Users, Briefcase, MapPin, Printer, Share2, Download } from 'lucide-react';

interface FamilyMember {
  name: string;
  relationship: string;
  age: number;
  dateOfBirth?: string;
}

interface ClientHeaderProps {
  clientName: string;
  email: string;
  phone?: string;
  age: number;
  dateOfBirth?: string;
  occupation?: string;
  location?: string;
  spouse?: {
    name?: string;
    age?: number;
    occupation?: string;
  };
  dependents: number;
  familyMembers?: FamilyMember[];
  taxRates?: {
    federal?: number;
    state?: number;
    capitalGains?: number;
  };
  onPrint?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

export default function ClientHeader({
  clientName,
  email,
  phone,
  age,
  dateOfBirth,
  occupation,
  location,
  spouse,
  dependents,
  familyMembers = [],
  taxRates,
  onPrint,
  onExport,
  onShare,
}: ClientHeaderProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Main Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">{clientName}</h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{email}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onPrint && (
              <button
                onClick={onPrint}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span className="text-sm">Print</span>
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Personal Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Age</div>
                  <div className="font-semibold text-slate-800">
                    {age} years old
                    {dateOfBirth && <span className="text-slate-400 font-normal"> ({formatDate(dateOfBirth)})</span>}
                  </div>
                </div>
              </div>

              {occupation && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Occupation</div>
                    <div className="font-semibold text-slate-800">{occupation}</div>
                  </div>
                </div>
              )}

              {location && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Location</div>
                    <div className="font-semibold text-slate-800">{location}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Family */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Family
            </h3>
            <div className="space-y-3">
              {spouse && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <User className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Spouse</div>
                    <div className="font-semibold text-slate-800">
                      {spouse.name || 'Spouse'}
                      {spouse.age && <span className="text-slate-400 font-normal">, {spouse.age} yrs</span>}
                    </div>
                    {spouse.occupation && (
                      <div className="text-xs text-slate-500">{spouse.occupation}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Dependents</div>
                  <div className="font-semibold text-slate-800">
                    {dependents} {dependents === 1 ? 'child' : 'children'}
                  </div>
                </div>
              </div>

              {familyMembers.length > 0 && (
                <div className="mt-3 space-y-2">
                  {familyMembers.map((member, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-slate-700">{member.name}</span>
                      <span className="text-slate-500">
                        {member.relationship}, {member.age} yrs
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tax Rates */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Tax Rates
            </h3>
            {taxRates ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <span className="text-slate-600">Federal Income</span>
                  <span className="font-bold text-slate-800">{taxRates.federal || 22}%</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <span className="text-slate-600">State Income</span>
                  <span className="font-bold text-slate-800">{taxRates.state || 5}%</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <span className="text-slate-600">Capital Gains</span>
                  <span className="font-bold text-slate-800">{taxRates.capitalGains || 15}%</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 bg-slate-50 rounded-lg px-4 py-3">
                Tax rates not configured
              </div>
            )}
          </div>
        </div>

        {/* Report Date */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <span>Financial Snapshot Report</span>
          <span>{today}</span>
        </div>
      </div>
    </div>
  );
}
