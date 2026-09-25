import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Info, Server, Cpu, ExternalLink, X } from 'lucide-react';

export default function Header() {
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <header className="header-container">
      <div className="header-brand-row">
        <div className="logo-group">
          <div className="logo-icon-box">
            <ShieldCheck size={32} className="logo-shield" />
          </div>
          <div>
            <div className="brand-title-badge-wrap">
              <h1 className="brand-title">DIGITAL FOOTPRINT EXPOSER</h1>
              <span className="prototype-badge">AUDIT PROTOTYPE</span>
            </div>
            <p className="brand-subtitle">
              Interactive Credential Exposure Diagnostic & Zero-Knowledge Breach Auditor
            </p>
          </div>
        </div>

        <div className="header-badges">
          <div className="status-pill status-live" title="Direct live HIBP API connection">
            <span className="pulse-dot green"></span>
            <span>HIBP Passwords: <strong>LIVE API</strong></span>
          </div>

          <div className="status-pill status-demo" title="Mock dataset for email & username audit">
            <span className="pulse-dot amber"></span>
            <span>Breach DB: <strong>DEMO MODE (12 Leaks)</strong></span>
          </div>

          <button 
            className="info-btn"
            onClick={() => setShowExplainer(!showExplainer)}
            title="Learn how k-Anonymity protects your password"
          >
            <Info size={16} />
            <span>How k-Anonymity Works</span>
          </button>
        </div>
      </div>

      {showExplainer && (
        <div className="explainer-banner glass-panel">
          <div className="explainer-header">
            <div className="explainer-title">
              <Lock size={18} className="text-cyan" />
              <h3>The k-Anonymity Cryptographic Model</h3>
            </div>
            <button className="close-btn" onClick={() => setShowExplainer(false)}>
              <X size={18} />
            </button>
          </div>

          <p className="explainer-desc">
            You never have to trust any website with your actual password. This app implements 
            the zero-knowledge <strong>k-anonymity</strong> model pioneered by security researcher Troy Hunt:
          </p>

          <div className="k-anonymity-steps">
            <div className="step-card">
              <span className="step-num">1</span>
              <h4>Client-Side Hashing</h4>
              <p>Your browser computes the 40-character <code>SHA-1</code> hash locally using standard Web Crypto.</p>
            </div>

            <div className="step-card">
              <span className="step-num">2</span>
              <h4>Prefix Isolation</h4>
              <p>We take ONLY the first <strong>5 characters</strong> (the prefix). The remaining 35 characters never leave your device.</p>
            </div>

            <div className="step-card">
              <span className="step-num">3</span>
              <h4>Range Query</h4>
              <p>The backend queries HIBP with those 5 characters. HIBP returns ~500 to ~3,000 hash suffixes starting with that prefix.</p>
            </div>

            <div className="step-card">
              <span className="step-num">4</span>
              <h4>Local Match</h4>
              <p>Your browser compares your 35-character suffix against the returned list in memory to count breaches.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
