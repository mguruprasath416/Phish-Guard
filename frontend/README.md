# 🛡️ PhishGuard Frontend

The React.js frontend for the PhishGuard Security Platform — an enterprise-grade phishing detection and email/URL threat analysis dashboard, powered by an AI microservices pipeline.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Important**: The backend server must be running on port `5000` for API calls to work. The `proxy` field in `package.json` automatically forwards `/api/*` requests to `http://localhost:5000`.

---

## 📂 Project Structure

```
frontend/src/
├── App.js                    # Root app — routing, MUI theme, protected routes
├── index.js                  # Entry point — React 19, StrictMode, GoogleOAuthProvider
├── index.css                 # Global styles and animations
├── App.css                   # App-level styles
│
├── context/
│   └── AuthContext.js        # Global auth state, Axios interceptor, all auth API calls
│
├── api/                      # Axios API call modules
│
├── hooks/                    # Custom React hooks
│
├── components/
│   ├── Navbar.js             # Top navigation bar with user menu and logout
│   ├── Login.js              # Login form (email/password + Google OAuth button)
│   ├── Register.js           # Registration form with validation
│   ├── AIConfidenceCard.jsx  # Scan result: AI model confidence score display
│   ├── AIExplanationCard.jsx # Scan result: LLM summary, findings, recommendations
│   ├── DomainAnalysisCard.jsx# Scan result: Domain age, DNS, SSL status
│   ├── ScanSummaryCard.jsx   # Scan result: High-level verdict and risk score
│   ├── ThreatGauge.jsx       # Scan result: Visual risk gauge (0–100)
│   ├── ThreatIntelCard.jsx   # Scan result: VirusTotal / GSB / AbuseIPDB results
│   └── UrlReputationCard.jsx # Scan result: URL-specific reputation details
│
├── pages/
│   ├── LandingPage.js        # Public homepage with Digital Risk Meter
│   ├── Dashboard.js          # Main security dashboard: stats, charts, session logs
│   ├── Analyze.js            # Email + URL scan interface with full AI result cards
│   ├── History.js            # Paginated scan history viewer with type filter
│   ├── ThreatReport.jsx      # Detailed threat report: IoCs, attack vector, mitigation
│   └── VerifyEmail.js        # Email verification handler (StrictMode useRef guard)
│
└── utils/
    └── theme.js              # MUI theme configuration (dark mode, primary color)
```

---

## 🔐 Authentication Flow

### Local Registration
1. User fills in Name, Email, Password → `POST /api/auth/register`
2. Backend sends verification email via Brevo/Resend API (HTTPS port 443)
3. User clicks verification link → `GET /api/auth/verify-email/:token`
4. User logs in → `POST /api/auth/login`
5. JWT stored in `localStorage`, injected into all requests via Axios interceptor

### Google OAuth
1. User clicks **"Continue with Google"** → Google OAuth popup
2. Google ID token sent to → `POST /api/auth/google`
3. Backend verifies token via `google-auth-library`, creates/links user (`isVerified: true`)
4. JWT stored in `localStorage`
5. User redirected to Dashboard (no email verification needed)

---

## 🛣️ Routes

| Path | Component | Access |
| :--- | :--- | :--- |
| `/` | `LandingPage` | Public |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/verify-email/:token` | `VerifyEmail` | Public |
| `/dashboard` | `Dashboard` (page) | 🔒 Protected |
| `/analyze` | `Analyze` | 🔒 Protected |
| `/history` | `History` | 🔒 Protected |

Protected routes redirect unauthenticated users to `/login`.

---

## 🧠 Scan Result Components

When a scan completes on the **Analyze** page, the following result cards are displayed:

| Component | Description |
| :--- | :--- |
| `ScanSummaryCard` | Phishing verdict (Yes/No), risk score badge, scan type |
| `ThreatGauge` | Circular/arc gauge visually representing 0–100 risk score |
| `AIConfidenceCard` | Model confidence percentage from DeBERTa/Random Forest |
| `AIExplanationCard` | LLM-generated summary, key findings list, recommendations list |
| `ThreatIntelCard` | VirusTotal malicious/suspicious/harmless counts; GSB; AbuseIPDB score |
| `DomainAnalysisCard` | Domain age, SSL certificate status, DNS records (URL scans) |
| `UrlReputationCard` | IP reputation score, suspicion score breakdown (URL scans) |

---

## ⚙️ Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Google OAuth Client ID (required for "Continue with Google" button)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

> **Note:** `REACT_APP_` prefix is required by Create React App for variables to be available in the browser.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| React | 19.1 | UI framework |
| Material UI (MUI) | 7.0 | Component library, theming, dark mode |
| React Router | 7.5 | Client-side routing with protected routes |
| Axios | 1.8 | HTTP client with global JWT auth interceptor |
| `@react-oauth/google` | 0.13 | Google OAuth — `GoogleOAuthProvider` wrapper |
| Emotion | 11.14 | CSS-in-JS (MUI dependency) |

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm start` | Runs development server on port 3000 with hot reload |
| `npm test` | Launches test runner in interactive watch mode |
| `npm run build` | Builds optimized production bundle to `build/` |
| `npm run eject` | Ejects CRA config (one-way, irreversible) |

---

## 🔒 Security Features

| Feature | Implementation |
| :--- | :--- |
| JWT Auto-Injection | Axios request interceptor in `AuthContext.js` injects `Authorization: Bearer` header |
| Protected Routes | `ProtectedRoute` component redirects unauthenticated users to `/login` |
| Token Persistence | JWT stored in `localStorage`; cleared on logout |
| StrictMode Guard | `useRef` in `VerifyEmail.js` prevents double API call in React 18/19 StrictMode |
| Autofill Dark Mode | `-webkit-autofill` CSS overrides in MUI `sx` prevent white box overlays |
| Google OAuth | ID token sent to backend for server-side verification (not client-side trusted) |
