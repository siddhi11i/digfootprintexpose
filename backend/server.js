import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Load mock breaches data
const mockBreachesPath = path.join(__dirname, 'data', 'mockBreaches.json');
let mockBreaches = [];
try {
  const fileData = fs.readFileSync(mockBreachesPath, 'utf8');
  mockBreaches = JSON.parse(fileData);
  console.log(`[INFO] Loaded ${mockBreaches.length} mock breaches.`);
} catch (err) {
  console.error('[ERROR] Failed to load mock breaches:', err.message);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Digital Footprint Exposer API',
    timestamp: new Date().toISOString()
  });
});

/**
 * 1. REAL PASSWORD BREACH CHECK (k-anonymity proxy to HIBP)
 * Endpoint: GET /api/pwned-password/:prefix
 * The client only sends the first 5 characters of SHA-1 hash.
 * We fetch the range from Have I Been Pwned API and return suffixes with counts.
 */
app.get('/api/pwned-password/:prefix', async (req, res) => {
  try {
    const prefix = (req.params.prefix || '').trim().toUpperCase();

    // Validate 5 hex characters
    if (!/^[0-9A-F]{5}$/.test(prefix)) {
      return res.status(400).json({
        error: 'Invalid hash prefix. Must be exactly 5 hexadecimal characters.'
      });
    }

    const hibpUrl = `https://api.pwnedpasswords.com/range/${prefix}`;
    const response = await fetch(hibpUrl, {
      headers: {
        'User-Agent': 'DigitalFootprintExposer-SecurityAudit/1.0 (Educational Security Tool)',
        'Add-Padding': 'true' // HIBP privacy padding
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `HIBP API returned status ${response.status}`,
        details: response.statusText
      });
    }

    const rawData = await response.text();
    
    // Parse lines: SUFFIX:COUNT
    const entries = [];
    const lines = rawData.split('\r\n');
    for (const line of lines) {
      if (!line) continue;
      const [suffix, countStr] = line.split(':');
      if (suffix && countStr) {
        entries.push({
          suffix: suffix.trim().toUpperCase(),
          count: parseInt(countStr.trim(), 10) || 0
        });
      }
    }

    res.json({
      prefix,
      totalSuffixesReceived: entries.length,
      entries,
      source: 'Have I Been Pwned Pwned-Passwords API (k-anonymity model)'
    });
  } catch (err) {
    console.error('[ERROR] Failed to query HIBP:', err.message);
    res.status(500).json({
      error: 'Failed to communicate with breach database',
      details: err.message
    });
  }
});

/**
 * 2. EMAIL / USERNAME EXPOSURE CHECK (Simulated Demo Dataset)
 * Endpoint: POST /api/check-exposure
 * Searches mock known breaches
 */
app.post('/api/check-exposure', (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters long' });
    }

    // Extract potential search tokens (e.g. username part of email)
    const emailParts = normalizedQuery.split('@');
    const usernamePart = emailParts[0];
    const domainPart = emailParts.length > 1 ? emailParts[1] : '';

    // Search breaches
    const matchedBreaches = mockBreaches.filter(breach => {
      // 1. Direct target match
      const hasTargetMatch = breach.targets.some(target => {
        const t = target.toLowerCase();
        return (
          t === normalizedQuery ||
          t === usernamePart ||
          (domainPart && t.includes(domainPart)) ||
          normalizedQuery.includes(t)
        );
      });

      if (hasTargetMatch) return true;

      // 2. Keyword match in breach name or category
      if (breach.name.toLowerCase().includes(normalizedQuery) ||
          breach.category.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      return false;
    });

    // Compute aggregated exposure metrics
    let totalExposedRecords = 0;
    const exposedDataTypes = new Set();
    let hasPlaintextOrHashPasswords = false;
    let hasFinancialData = false;
    let highestSeverity = 'Low';

    const severityOrder = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };

    matchedBreaches.forEach(b => {
      b.exposedData.forEach(item => {
        exposedDataTypes.add(item);
        const lower = item.toLowerCase();
        if (lower.includes('password') || lower.includes('token') || lower.includes('keys')) {
          hasPlaintextOrHashPasswords = true;
        }
        if (lower.includes('credit card') || lower.includes('billing') || lower.includes('wallet') || lower.includes('purchase')) {
          hasFinancialData = true;
        }
      });

      if (severityOrder[b.severity] > severityOrder[highestSeverity]) {
        highestSeverity = b.severity;
      }
    });

    res.json({
      query: normalizedQuery,
      matchedBreachesCount: matchedBreaches.length,
      breaches: matchedBreaches,
      isDemoData: true,
      summary: {
        highestSeverity: matchedBreaches.length > 0 ? highestSeverity : 'None',
        exposedDataTypes: Array.from(exposedDataTypes),
        hasPasswordExposure: hasPlaintextOrHashPasswords,
        hasFinancialData
      },
      notice: 'DEMO MODE: Results are simulated using an educational mock incident database.'
    });
  } catch (err) {
    console.error('[ERROR] Exposure check failed:', err);
    res.status(500).json({ error: 'Internal server error while searching breaches' });
  }
});

/**
 * Endpoint: GET /api/sample-queries
 * Returns preset test values to make testing simple and instant for the user
 */
app.get('/api/sample-queries', (req, res) => {
  res.json({
    emailSamples: [
      { label: 'High Exposure Email', value: 'john.doe@example.com', expected: 'Multiple leaks (Social, E-Com, Health)' },
      { label: 'Crypto/Fintech Target', value: 'mike_crypto', expected: 'CryptoVault & GameZone leaks' },
      { label: 'Developer Account', value: 'developer@web.io', expected: 'TechForge & WorkCollab SaaS' },
      { label: 'Clean Account (No breaches)', value: 'unexposed_user_2026@securezone.net', expected: '0 breaches found' }
    ],
    passwordSamples: [
      { label: 'Common Breached ("password123")', value: 'password123', description: 'Extremely high breach frequency' },
      { label: 'Leaked Tech Password ("admin2024!")', value: 'admin2024!', description: 'Known corporate breach credential' },
      { label: 'Strong Unique Password', value: 'Kx9#mQ2$vL8@pZ7!', description: 'Zero known breach occurrences' }
    ]
  });
});

// Serve built frontend assets if dist folder exists (Unified Full-Stack Deployment)
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  console.log(`[INFO] Serving frontend static files from: ${distPath}`);
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[READY] Digital Footprint Exposer Backend running on http://localhost:${PORT}`);
});
