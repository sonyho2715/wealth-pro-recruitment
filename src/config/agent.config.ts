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
 * AGENT CONFIGURATION
 * Customize these values for your agency/recruiter branding
 *
 * To white-label for a new agent:
 * 1. Update agent information below
 * 2. Add logo/photo to /public folder
 * 3. Update branding colors to match your brand
 * 4. Redeploy the application
 */
export const agentConfig: AgentConfig = {
  // Agent Information
  agentName: "Sony Ho",
  agentTitle: "Senior Financial Consultant & Recruiter",
  agentEmail: "mrsonyho@gmail.com",
  agentPhone: "(808) 555-0123",
  agentWebsite: "https://wealthpro.com",
  agentLogo: undefined, // Add: "/logo.png"
  agentPhoto: undefined, // Add: "/headshot.jpg"
  agentBio: "Helping ambitious professionals build rewarding careers in financial services. With over 10 years of experience, I've helped hundreds of agents achieve financial freedom and work-life balance.",

  // Professional Credentials
  credentials: {
    certifications: ["Life & Health Licensed", "Series 6", "Series 63"],
    licenses: ["Hawaii Insurance License", "Life & Health"],
    yearsOfExperience: 10,
    clientsServed: 250,
    assetsUnderManagement: undefined,
  },

  // Company Information
  companyName: "Wealth Pro Financial",
  companyAddress: "Honolulu, Hawaii",

  // Branding Colors
  brandColors: {
    primary: "#0ea5e9", // Sky blue
    secondary: "#6366f1", // Indigo
    accent: "#10b981", // Emerald green
  },

  // Platform Settings
  platformName: "Wealth Pro Recruitment",
  platformTagline: "Build Your Future in Financial Services",

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
    linkedin: "https://linkedin.com/in/sonyho",
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
