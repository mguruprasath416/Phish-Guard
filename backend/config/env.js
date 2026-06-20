const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Export environment configuration
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  emailService: {
    host: process.env.EMAIL_SERVICE_HOST,
    port: parseInt(process.env.EMAIL_SERVICE_PORT, 10) || 587,
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  aiServices: {
    emailServiceUrl: process.env.EMAIL_SERVICE_URL || 'http://localhost:8001',
    urlServiceUrl: process.env.URL_SERVICE_URL || 'http://localhost:8002',
    threatIntelUrl: process.env.THREAT_INTEL_URL || 'http://localhost:8003',
    llmServiceUrl: process.env.LLM_SERVICE_URL || 'http://localhost:8004',
    riskEngineUrl: process.env.RISK_ENGINE_URL || 'http://localhost:8005',
  },
  apiKeys: {
    virusTotal: process.env.VIRUSTOTAL_API_KEY,
    googleSafeBrowsing: process.env.GOOGLE_SAFE_BROWSING_API_KEY,
    abuseIPDB: process.env.ABUSEIPDB_API_KEY,
    openai: process.env.OPENAI_API_KEY,
  },
  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    llamaUrl: process.env.LLAMA_URL || 'http://localhost:11434',
    llamaModel: process.env.LLAMA_MODEL || 'llama2',
    mistralApiKey: process.env.MISTRAL_API_KEY,
    mistralModel: process.env.MISTRAL_MODEL || 'mistral-large',
  },
};

module.exports = env;
