/**
 * WHITE-LABEL AGENT CONFIGURATION
 *
 * This file allows you to customize the platform for different agents.
 * Simply update these values to rebrand the entire application.
 *
 * To create a new agent instance:
 * 1. Copy this file
 * 2. Update all fields below
 * 3. Deploy to a new domain/subdomain
 */

export interface AgentConfig {
  // Agent Information
  agentName: string;
  agentTitle: string;
  agentEmail: string;
  agentPhone: string;
  agentWebsite?: string;
  agentLogo?: string;
  agentPhoto?: string; // Professional headshot
  agentBio?: string; // Short bio (2-3 sentences)

  // Professional Credentials
  credentials?: {
    certifications?: string[]; // e.g., ["CFP®", "CFA", "ChFC"]
    licenses?: string[]; // e.g., ["Series 7", "Series 65", "Life & Health"]
    yearsOfExperience?: number;
    clientsServed?: number;
    assetsUnderManagement?: string; // e.g., "$50M+"
  };

  // Company Information
  companyName: string;
  companyAddress?: string;

  // Branding
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };

  // Platform Settings
  platformName: string;
  platformTagline: string;

  // Features
  features: {
    showAgentBranding: boolean;
    allowClientSelfService: boolean;
    enableInsuranceProducts: boolean;
    enablePDFReports: boolean;
    enableEmailTemplates: boolean;
  };

  // Social Links (optional)
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

/**
 * DEFAULT CONFIGURATION - SAMPLE PLATFORM
 * Update these values to white-label for your agency
 */
export const agentConfig: AgentConfig = {
  // Agent Information
  agentName: "Agent Name Here",
  agentTitle: "Professional Financial Consultant",
  agentEmail: "agent@example.com",
  agentPhone: "(555) 123-4567",
  agentWebsite: "https://yourwebsite.com", // Update with your website
  agentLogo: undefined, // Path to logo image in /public folder
  agentPhoto: undefined, // Path to professional headshot in /public folder
  agentBio: "Helping families and business owners achieve financial freedom through comprehensive planning and strategic wealth management.",

  // Professional Credentials
  credentials: {
    certifications: ["CFP®", "ChFC", "CLU"], // Update with your certifications
    licenses: ["Series 65", "Life & Health"], // Update with your licenses
    yearsOfExperience: 15,
    clientsServed: 500,
    assetsUnderManagement: "$50M+",
  },

  // Company Information
  companyName: "Your Financial Services",
  companyAddress: undefined,

  // Branding Colors
  brandColors: {
    primary: "#0ea5e9", // Sky blue
    secondary: "#6366f1", // Indigo
    accent: "#10b981", // Green
  },

  // Platform Settings
  platformName: "Wealth Blueprint",
  platformTagline: "Professional Financial Planning Platform",

  // Features
  features: {
    showAgentBranding: true,
    allowClientSelfService: false,
    enableInsuranceProducts: true,
    enablePDFReports: true,
    enableEmailTemplates: true,
  },

  // Social Links
  socialLinks: {
    linkedin: "https://linkedin.com/in/yourusername",
    twitter: undefined,
    facebook: undefined,
  },
};

/**
 * Helper function to get agent display name
 */
export const getAgentDisplayName = (): string => {
  return agentConfig.agentName;
};

/**
 * Helper function to get full contact info
 */
export const getAgentContact = () => {
  return {
    name: agentConfig.agentName,
    title: agentConfig.agentTitle,
    email: agentConfig.agentEmail,
    phone: agentConfig.agentPhone,
    website: agentConfig.agentWebsite,
  };
};
