import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar, 
  Database, 
  Tag, 
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  FileWarning
} from 'lucide-react';

export default function ExposureCheck({ onExposureAuditChange, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleCheck = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/check-exposure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      onExposureAuditChange(data);
    } catch (err) {
      console.error('Exposure check error:', err);
      setError(err.message || 'Failed to check breach database.');
      onExposureAuditChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setQuickQuery = (val) => {
    setQuery(val);
    setResult(null);
  };

  return (
    <div className="audit-card glass-panel">
      {/* Card Header */}
      <div className="card-top-bar">
        <div className="card-title-group">
          <div className="icon-badge icon-badge-amber">
            <Mail size={20} />
          </div>
          <div>
            <h2 className="card-heading">Email & Username Exposure Check</h2>
            <p className="card-subheading">Look up compromised accounts across known leaks</p>
          </div>
        </div>
        <div className="demo-api-tag" title="Simulated demo dataset - not a paid live API">
          <span className="pulse-dot amber"></span>
          <span>DEMO DATASET (12 LEAKS)</span>
        </div>
      </div>

      {/* Demo notice banner */}
      <div className="demo-notice-bar">
        <FileWarning size={16} className="text-amber" />
        <span>
          <strong>Notice:</strong> This section runs against a local simulated incident dataset 
          (12 mock breaches) to demonstrate credential matching without hitting paid APIs.
        </span>
      </div>

      {/* Input Section */}
      <form onSubmit={handleCheck} className="input-form">
        <label className="field-label" htmlFor="exposure-input">
          Enter Email Address or Username
        </label>

        <div className="input-wrapper">
          <input
            id="exposure-input"
            type="text"
            className="text-input"
            placeholder="e.g. john.doe@example.com or username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Quick Test Presets */}
        <div className="preset-buttons-row">
          <span className="preset-label">Quick Test:</span>
          <button 
            type="button" 
            className="preset-chip chip-danger"
            onClick={() => setQuickQuery('john.doe@example.com')}
          >
            john.doe@example.com (5 Leaks)
          </button>
          <button 
            type="button" 
            className="preset-chip chip-warning"
            onClick={() => setQuickQuery('mike_crypto')}
          >
            mike_crypto (Crypto & E-Com)
          </button>
          <button 
            type="button" 
            className="preset-chip chip-warning"
            onClick={() => setQuickQuery('developer@web.io')}
          >
            developer@web.io (OAuth / Code)
          </button>
          <button 
            type="button" 
            className="preset-chip chip-safe"
            onClick={() => setQuickQuery('clean_user_2026@securezone.net')}
          >
            clean_user (0 Leaks)
          </button>
        </div>

        <button
          type="submit"
          className="submit-btn btn-amber"
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="spinner" />
              <span>Scanning Simulated Breach DB...</span>
            </>
          ) : (
            <>
              <Search size={18} />
              <span>Audit Email / Username</span>
            </>
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="alert-box alert-error">
          <AlertTriangle size={20} />
          <div>
            <strong>Lookup Failed:</strong> {error}
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className={`result-box ${result.matchedBreachesCount > 0 ? 'result-danger' : 'result-safe'}`}>
          <div className="result-header">
            <div className="result-icon-wrap">
              {result.matchedBreachesCount > 0 ? (
                <ShieldAlert size={28} className="text-red" />
              ) : (
                <ShieldCheck size={28} className="text-emerald" />
              )}
            </div>
            <div>
              <div className="result-badge-row">
                <span className={`status-tag ${result.matchedBreachesCount > 0 ? 'tag-danger' : 'tag-safe'}`}>
                  {result.matchedBreachesCount > 0 
                    ? `${result.matchedBreachesCount} BREACHES DETECTED` 
                    : 'CLEAN IN SIMULATED DATASET'}
                </span>
                <span className="source-tag">Simulated Dataset (12 Incidents)</span>
              </div>
              <h3 className="result-title">
                {result.matchedBreachesCount > 0 ? (
                  <>Exposed in <strong>{result.matchedBreachesCount}</strong> simulated data breaches</>
                ) : (
                  <>No breach records found for "{result.query}"</>
                )}
              </h3>
            </div>
          </div>

          {result.matchedBreachesCount > 0 ? (
            <div className="breaches-list">
              <p className="section-instruction">
                The following incidents in the simulated dataset exposed records matching this identity:
              </p>

              {result.breaches.map((breach) => (
                <div key={breach.id} className="breach-item-card">
                  <div className="breach-card-top">
                    <div className="breach-title-area">
                      <h4 className="breach-name">{breach.name}</h4>
                      <div className="breach-meta-row">
                        <span className="breach-meta-item">
                          <Calendar size={13} /> {breach.date}
                        </span>
                        <span className="breach-meta-item">
                          <Database size={13} /> {breach.recordsCount} records
                        </span>
                        <span className="breach-category-tag">{breach.category}</span>
                      </div>
                    </div>
                    <span className={`severity-badge sev-${breach.severity.toLowerCase()}`}>
                      {breach.severity} Severity
                    </span>
                  </div>

                  <p className="breach-desc">{breach.description}</p>

                  <div className="exposed-data-group">
                    <span className="exposed-data-label">Exposed Data:</span>
                    <div className="data-pills-wrap">
                      {breach.exposedData.map((dataTag, idx) => {
                        const isSensitive = 
                          dataTag.toLowerCase().includes('password') || 
                          dataTag.toLowerCase().includes('card') ||
                          dataTag.toLowerCase().includes('token') ||
                          dataTag.toLowerCase().includes('passport');
                        return (
                          <span 
                            key={idx} 
                            className={`data-pill ${isSensitive ? 'data-pill-critical' : ''}`}
                          >
                            {dataTag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="result-description">
              No matching records for <strong>{result.query}</strong> were found in our 12 mock security incident 
              tables. In a production environment with commercial APIs, full historical audits would also search 
              dark-web dump archives and stealer-log botnets.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
