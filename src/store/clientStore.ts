import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ClientData,
  FinancialMetrics,
  RiskAssessment,
  ClientProfile,
} from '../types/financial.types';
import { calculateFinancialMetrics, generateRiskAssessment } from '../utils/calculations';

interface HistorySnapshot {
  timestamp: string;
  data: ClientData;
  metrics: FinancialMetrics;
}

interface ClientStore {
  // Current client data
  currentClient: ClientData | null;
  currentMetrics: FinancialMetrics | null;
  currentRisk: RiskAssessment | null;

  // Saved profiles
  profiles: Record<string, ClientProfile>;

  // Historical tracking
  history: HistorySnapshot[];

  // Actions
  setClientData: (data: ClientData) => void;
  calculateMetrics: () => void;
  saveProfile: (name: string) => void;
  loadProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  clearCurrentClient: () => void;
  loadSampleData: () => void;
  addHistorySnapshot: () => void;
  clearHistory: () => void;
}

// Sample data for demo purposes
const sampleData: ClientData = {
  name: 'John Smith',
  age: 38,
  dependents: 2,
  spouseName: 'Jane Smith',
  spouseAge: 36,
  income: 120000,
  spouseIncome: 80000,
  checking: 15000,
  savings: 45000,
  retirement401k: 180000,
  retirementIRA: 60000,
  brokerage: 75000,
  homeValue: 450000,
  otherAssets: 25000,
  lifeInsuranceCoverage: 500000,
  disabilityInsuranceCoverage: 0,
  mortgage: 320000,
  studentLoans: 25000,
  carLoans: 18000,
  creditCards: 8000,
  otherDebts: 5000,
  monthlyHousing: 2400,
  monthlyTransportation: 800,
  monthlyFood: 1200,
  monthlyUtilities: 400,
  monthlyInsurance: 600,
  monthlyEntertainment: 500,
  monthlyOther: 800,
  hasLifeInsurance: true,
  hasDisabilityInsurance: false,
  hasUmbrellaPolicy: false,
  hasEstatePlan: false,
  goals: {
    retirementAge: 65,
    retirementIncome: 100000,
    emergencyFundMonths: 6,
    homeDownPayment: 0,
    educationSavings: 100000,
    debtFreeDate: '2035-12-31',
    netWorthTarget: 2000000,
    annualSavingsTarget: 40000,
    majorPurchase: {
      description: 'Family Vacation',
      amount: 10000,
      targetDate: '2026-06-01',
    },
  },
  // Detailed debt tracking for advanced payoff analysis
  detailedDebts: {
    creditCardDebts: [
      { name: 'Chase Sapphire', balance: 5000, apr: 18.99, minPayment: 150 },
      { name: 'Amex Blue', balance: 3000, apr: 16.49, minPayment: 90 },
    ],
    studentLoanDebts: [
      { name: 'Federal Loan 1', balance: 15000, apr: 4.5, minPayment: 180 },
      { name: 'Federal Loan 2', balance: 10000, apr: 5.0, minPayment: 120 },
    ],
    carLoanDebts: [
      { name: 'Toyota Highlander', balance: 18000, apr: 3.9, monthlyPayment: 400 },
    ],
  },
  // Portfolio allocation
  portfolio: {
    stocksPercent: 70,
    bondsPercent: 25,
    cashPercent: 5,
    otherPercent: 0,
    averageExpenseRatio: 0.15,
  },
  // Financial assumptions
  assumptions: {
    inflationRate: 3.0,
    investmentReturnRate: 7.0,
    salaryGrowthRate: 3.0,
    socialSecurityStartAge: 67,
  },
};

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      currentClient: null,
      currentMetrics: null,
      currentRisk: null,
      profiles: {},
      history: [],

      setClientData: (data: ClientData) => {
        const metrics = calculateFinancialMetrics(data);
        const risk = generateRiskAssessment(data, metrics);

        // Extract action items from temp storage (set by generateRiskAssessment)
        if ((metrics as any)._actionItemsToAdd) {
          metrics.actionItems = (metrics as any)._actionItemsToAdd;
          delete (metrics as any)._actionItemsToAdd;
        }

        set({
          currentClient: data,
          currentMetrics: metrics,
          currentRisk: risk,
        });

        // Add history snapshot immediately since state is already updated
        get().addHistorySnapshot();
      },

      calculateMetrics: () => {
        const client = get().currentClient;
        if (!client) return;

        const metrics = calculateFinancialMetrics(client);
        const risk = generateRiskAssessment(client, metrics);

        // Extract action items from temp storage (set by generateRiskAssessment)
        if ((metrics as any)._actionItemsToAdd) {
          metrics.actionItems = (metrics as any)._actionItemsToAdd;
          delete (metrics as any)._actionItemsToAdd;
        }

        set({
          currentMetrics: metrics,
          currentRisk: risk,
        });
      },

      saveProfile: (name: string) => {
        const { currentClient, currentMetrics, currentRisk, profiles } = get();
        if (!currentClient) return;

        const id = `profile-${Date.now()}`;
        const profile: ClientProfile = {
          id,
          name,
          data: currentClient,
          metrics: currentMetrics || undefined,
          risk: currentRisk || undefined,
          savedDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };

        set({
          profiles: {
            ...profiles,
            [id]: profile,
          },
        });
      },

      loadProfile: (id: string) => {
        const { profiles } = get();
        const profile = profiles[id];
        if (!profile) return;

        set({
          currentClient: profile.data,
          currentMetrics: profile.metrics || null,
          currentRisk: profile.risk || null,
        });

        // Recalculate in case formulas have changed
        get().calculateMetrics();
      },

      deleteProfile: (id: string) => {
        const { profiles } = get();
        const newProfiles = { ...profiles };
        delete newProfiles[id];
        set({ profiles: newProfiles });
      },

      clearCurrentClient: () => {
        set({
          currentClient: null,
          currentMetrics: null,
          currentRisk: null,
        });
      },

      loadSampleData: () => {
        get().setClientData(sampleData);
      },

      addHistorySnapshot: () => {
        const { currentClient, currentMetrics, history } = get();
        if (!currentClient || !currentMetrics) return;

        const snapshot: HistorySnapshot = {
          timestamp: new Date().toISOString(),
          data: { ...currentClient },
          metrics: { ...currentMetrics },
        };

        // Keep only last 30 snapshots to prevent storage bloat
        const newHistory = [...history, snapshot].slice(-30);
        set({ history: newHistory });
      },

      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'wealth-blueprint-storage',
      partialize: (state) => ({
        profiles: state.profiles,
        history: state.history,
      }),
    }
  )
);
