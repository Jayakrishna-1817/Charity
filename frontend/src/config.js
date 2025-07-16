// src/config.js

// Get environment variables (these must be defined in your .env file)
const registry = import.meta.env.VITE_CHARITY_REGISTRY;
const auditTrail = import.meta.env.VITE_AUDIT_TRAIL;
const donationManager = import.meta.env.VITE_DONATION_MANAGER;

// Optional: Validate presence of all required env vars
if (!registry || !auditTrail || !donationManager) {
  console.warn("⚠️ Warning: One or more contract addresses are missing from the .env file.");
  console.warn("Make sure you have VITE_CHARITY_REGISTRY, VITE_AUDIT_TRAIL, VITE_DONATION_MANAGER set.");
}

export const CONTRACT_ADDRESSES = {
  registry,
  auditTrail,
  donationManager,
};
