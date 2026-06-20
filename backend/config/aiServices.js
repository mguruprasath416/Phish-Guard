// AI Services Configuration
// Centralized configuration for all AI microservices

const AI_SERVICES_CONFIG = {
  emailService: {
    url: process.env.EMAIL_SERVICE_URL || 'http://localhost:8001',
    timeout: 10000,
    enabled: process.env.EMAIL_SERVICE_ENABLED !== 'false',
    fallback: true
  },
  urlService: {
    url: process.env.URL_SERVICE_URL || 'http://localhost:8002',
    timeout: 10000,
    enabled: process.env.URL_SERVICE_ENABLED !== 'false',
    fallback: true
  },
  threatIntel: {
    url: process.env.THREAT_INTEL_URL || 'http://localhost:8003',
    timeout: 15000,
    enabled: process.env.THREAT_INTEL_ENABLED !== 'false',
    fallback: true,
    apis: {
      virusTotal: {
        apiKey: process.env.VIRUSTOTAL_API_KEY,
        enabled: !!process.env.VIRUSTOTAL_API_KEY
      },
      googleSafeBrowsing: {
        apiKey: process.env.GOOGLE_SAFE_BROWSING_API_KEY,
        enabled: !!process.env.GOOGLE_SAFE_BROWSING_API_KEY
      },
      abuseIPDB: {
        apiKey: process.env.ABUSEIPDB_API_KEY,
        enabled: !!process.env.ABUSEIPDB_API_KEY
      }
    }
  },
  llmService: {
    url: process.env.LLM_SERVICE_URL || 'http://localhost:8004',
    timeout: 20000,
    enabled: process.env.LLM_SERVICE_ENABLED !== 'false',
    fallback: true,
    provider: process.env.LLM_PROVIDER || 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4',
      enabled: !!process.env.OPENAI_API_KEY
    },
    llama: {
      url: process.env.LLAMA_URL || 'http://localhost:11434',
      model: process.env.LLAMA_MODEL || 'llama2',
      enabled: !!process.env.LLAMA_URL
    },
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY,
      model: process.env.MISTRAL_MODEL || 'mistral-large',
      enabled: !!process.env.MISTRAL_API_KEY
    }
  },
  riskEngine: {
    url: process.env.RISK_ENGINE_URL || 'http://localhost:8005',
    timeout: 5000,
    enabled: process.env.RISK_ENGINE_ENABLED !== 'false',
    fallback: true
  }
};

// Get service configuration
const getServiceConfig = (serviceName) => {
  return AI_SERVICES_CONFIG[serviceName];
};

// Check if service is enabled
const isServiceEnabled = (serviceName) => {
  const config = AI_SERVICES_CONFIG[serviceName];
  return config && config.enabled;
};

// Get service URL
const getServiceUrl = (serviceName) => {
  const config = AI_SERVICES_CONFIG[serviceName];
  return config ? config.url : null;
};

module.exports = {
  AI_SERVICES_CONFIG,
  getServiceConfig,
  isServiceEnabled,
  getServiceUrl
};
