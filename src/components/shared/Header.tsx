import { Building2, Mail, Phone, Sparkles } from 'lucide-react';
import { agentConfig } from '../../config/agent.config';

interface HeaderProps {
  agentName: string;
  platformName: string;
  platformTagline: string;
}

export default function Header({ agentName, platformName, platformTagline }: HeaderProps) {
  return (
    <header className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl border-b border-slate-700/50 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 via-transparent to-blue-600/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 animate-slide-down">
              <div className="p-2.5 bg-white/20 rounded-xl border border-white/30 shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-2">
                  {platformName}
                  <Sparkles className="w-6 h-6 text-teal-400" />
                </h1>
                <p className="text-slate-300 text-sm md:text-base font-medium mt-0.5">
                  {platformTagline}
                </p>
              </div>
            </div>
          </div>

          {agentConfig.features.showAgentBranding && (
            <div className="md:text-right animate-slide-down">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-white/20 shadow-xl">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {agentConfig.agentPhoto ? (
                      <img
                        src={agentConfig.agentPhoto}
                        alt={agentName}
                        className="w-16 h-16 rounded-full border-3 border-white shadow-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center border-3 border-white shadow-lg">
                        <span className="text-2xl font-bold text-white">
                          {agentName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name and Contact */}
                  <div className="text-left">
                    <p className="text-xl font-extrabold text-white mb-2 drop-shadow-lg">{agentName}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {agentConfig.agentEmail && (
                        <a
                          href={`mailto:${agentConfig.agentEmail}`}
                          className="flex items-center gap-1.5 text-white/90 hover:text-teal-300 transition-colors font-medium"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="hidden sm:inline">{agentConfig.agentEmail}</span>
                        </a>
                      )}
                      {agentConfig.agentPhone && (
                        <a
                          href={`tel:${agentConfig.agentPhone}`}
                          className="flex items-center gap-1.5 text-white/90 hover:text-teal-300 transition-colors font-medium"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{agentConfig.agentPhone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500" />
    </header>
  );
}
