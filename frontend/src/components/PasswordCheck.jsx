import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Zap, 
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { sha1, splitHash } from '../utils/crypto';
import { API_BASE } from '../utils/config';

export default function PasswordCheck({ onPasswordAuditChange, initialPassword = '' }) {
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [fullHash, setFullHash] = useState('');
  const [hashPrefix, setHashPrefix] = useState('');
  const [hashSuffix, setHashSuffix] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Re-hash client-side whenever the password changes
  useEffect(() => {
    let isCancelled = false;
    async function compute() {
      if (!password) {
        setFullHash('');
        setHashPrefix('');
        setHashSuffix('');
        setResult(null);
        onPasswordAuditChange(null);
        return;
      }
      try {
        const hash = await sha1(password);
        if (!isCancelled) {
          setFullHash(hash);
          const { prefix, suffix } = splitHash(hash);
          setHashPrefix(prefix);
          setHashSuffix(suffix);
        }
      } catch (err) {
        console.error('Hashing error:', err);
      }
    }
    compute();
    return () => { isCancelled = true; };
  }, [password]);

  // Sync if preset changes from outside
  useEffect(() => {
    if (initialPassword && initialPassword !== password) {
      setPassword(initialPassword);
    }
  }, [initialPassword]);

  const handleCheck = async (e) => {
    if (e) e.preventDefault();
    if (!password || !hashPrefix || !hashSuffix) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Send ONLY first 5 characters to backend
      const response = await fetch(`${API_BASE}/api/pwned-password/${hashPrefix}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const entries = data.entries || [];

      // 2. Perform client-side suffix match
      const matchedEntry = entries.find(item => item.suffix.toUpperCase() === hashSuffix.toUpperCase());
      const breachCount = matchedEntry ? matchedEntry.count : 0;
      const isBreached = breachCount > 0;

      const auditResult = {
        checked: true,
        passwordLength: password.length,
        prefix: hashPrefix,
        suffix: hashSuffix,
        totalSuffixesEvaluated: entries.length,
        breachCount,
        isBreached,
        source: 'Have I Been Pwned Live API'
      };

      setResult(auditResult);
      onPasswordAuditChange(auditResult);
    } catch (err) {
      console.error('Breach check error:', err);
      setError(err.message || 'Failed to connect to HIBP breach service.');
      onPasswordAuditChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setQuickPassword = (val) => {
    setPassword(val);
    setResult(null);
  };

  return (
    <div className="audit-card glass-panel">
      {/* Card Header */}
      <div className="card-top-bar">
        <div className="card-title-group">
          <div className="icon-badge icon-badge-cyan">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="card-heading">Password Breach Check</h2>
            <p className="card-subheading">Live end-to-end check via Have I Been Pwned</p>
          </div>
        </div>
        <div className="live-api-tag">
          <span className="pulse-dot green"></span>
          <span>LIVE WORKING API</span>
        </div>
      </div>

      {/* Input Section */}
      <form onSubmit={handleCheck} className="input-form">
        <label className="field-label" htmlFor="password-input">
          Enter Password to Audit
        </label>
        
        <div className="input-wrapper">
          <input
            id="password-input"
            type={showPassword ? 'text' : 'password'}
            className="text-input mono"
            placeholder="Type or paste any password to audit..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="button"
            className="input-icon-btn"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Real-time Cryptographic k-Anonymity Hash Preview */}
        {fullHash && (
          <div className="hash-preview-box">
            <div className="hash-preview-header">
              <span className="hash-preview-title">
                <Lock size={12} className="text-cyan" />
                <span>Client-Side SHA-1 Hash (k-Anonymity Inspection)</span>
              </span>
              <span className="zero-knowledge-badge">Zero-Knowledge</span>
            </div>

            <div className="hash-display mono">
              <span className="hash-prefix" title="First 5 characters sent to server">
                {hashPrefix}
              </span>
              <span className="hash-suffix" title="Last 35 characters kept locally in browser">
                {hashSuffix}
              </span>
            </div>

            <div className="hash-legend">
              <div className="legend-item">
                <span className="legend-indicator legend-prefix"></span>
                <span>Prefix (5 chars): Sent to API query</span>
              </div>
              <div className="legend-item">
                <span className="legend-indicator legend-suffix"></span>
                <span>Suffix (35 chars): <strong>Never leaves browser</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Test Presets */}
        <div className="preset-buttons-row">
          <span className="preset-label">Quick Test:</span>
          <button 
            type="button" 
            className="preset-chip chip-danger"
            onClick={() => setQuickPassword('password123')}
          >
            "password123" (Massive)
          </button>
          <button 
            type="button" 
            className="preset-chip chip-warning"
            onClick={() => setQuickPassword('admin2024!')}
          >
            "admin2024!" (Common)
          </button>
          <button 
            type="button" 
            className="preset-chip chip-safe"
            onClick={() => setQuickPassword('Kx9#mQ2$vL8@pZ7!uW')}
          >
            "Kx9#mQ2$vL8..." (Clean)
          </button>
        </div>

        <button
          type="submit"
          className="submit-btn btn-cyan"
          disabled={!password || isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="spinner" />
              <span>Querying HIBP k-Anonymity API...</span>
            </>
          ) : (
            <>
              <Search size={18} />
              <span>Audit Password Now</span>
            </>
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="alert-box alert-error">
          <AlertTriangle size={20} />
          <div>
            <strong>Breach Check Failed:</strong> {error}
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className={`result-box ${result.isBreached ? 'result-danger' : 'result-safe'}`}>
          <div className="result-header">
            <div className="result-icon-wrap">
              {result.isBreached ? (
                <ShieldAlert size={28} className="text-red" />
              ) : (
                <ShieldCheck size={28} className="text-emerald" />
              )}
            </div>
            <div>
              <div className="result-badge-row">
                <span className={`status-tag ${result.isBreached ? 'tag-danger' : 'tag-safe'}`}>
                  {result.isBreached ? 'PASSWORD COMPROMISED' : 'NO BREACH DETECTED'}
                </span>
                <span className="source-tag">Live HIBP Database</span>
              </div>
              <h3 className="result-title">
                {result.isBreached ? (
                  <>Found in <strong>{result.breachCount.toLocaleString()}</strong> public data breaches</>
                ) : (
                  <>0 breach occurrences detected</>
                )}
              </h3>
            </div>
          </div>

          <p className="result-description">
            {result.isBreached ? (
              <>
                This password has appeared in <strong>{result.breachCount.toLocaleString()}</strong> exposed credential 
                dumps across the internet. Attackers use automated tools to try this password in credential stuffing attacks 
                against all major platforms. <strong>You should immediately stop using this password.</strong>
              </>
            ) : (
              <>
                Good news! This password does not appear in Have I Been Pwned's database of over 850 million compromised 
                passwords. Evaluated against <strong>{result.totalSuffixesEvaluated.toLocaleString()}</strong> similar hashes 
                with prefix <code className="mono">{result.prefix}</code>.
              </>
            )}
          </p>

          <div className="result-meta-grid">
            <div className="meta-card">
              <span className="meta-label">Breach Occurrences</span>
              <span className={`meta-val mono ${result.isBreached ? 'text-red' : 'text-emerald'}`}>
                {result.breachCount.toLocaleString()}
              </span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Range Matches Checked</span>
              <span className="meta-val mono">{result.totalSuffixesEvaluated.toLocaleString()}</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Privacy Verification</span>
              <span className="meta-val mono text-cyan">k-Anonymity Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
