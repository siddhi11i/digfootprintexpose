import React, { useState } from 'react';
import Header from './components/Header';
import PresetBar from './components/PresetBar';
import PasswordCheck from './components/PasswordCheck';
import ExposureCheck from './components/ExposureCheck';
import RiskScoreCard from './components/RiskScoreCard';
import './App.css';

export default function App() {
  const [passwordAudit, setPasswordAudit] = useState(null);
  const [exposureAudit, setExposureAudit] = useState(null);

  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const handleSelectPreset = (preset) => {
    setPasswordInput(preset.password);
    setEmailInput(preset.email);
  };

  return (
    <div className="app-layout">
      <Header />

      <main className="main-content">
        {/* Preset Quick Scenarios */}
        <PresetBar onSelectPreset={handleSelectPreset} />

        {/* Dual Audit Grid */}
        <div className="audit-columns-grid">
          <PasswordCheck 
            onPasswordAuditChange={setPasswordAudit} 
            initialPassword={passwordInput} 
          />
          <ExposureCheck 
            onExposureAuditChange={setExposureAudit} 
            initialQuery={emailInput} 
          />
        </div>

        {/* Combined Risk Score Assessment */}
        <RiskScoreCard 
          passwordAudit={passwordAudit} 
          exposureAudit={exposureAudit} 
        />
      </main>

      <footer className="footer-bar">
        <div className="footer-content">
          <p>
            <strong>Privacy & Ethics Notice:</strong> Passwords are never sent over the network in plaintext. 
            The password audit utilizes client-side SHA-1 hashing and the zero-knowledge <strong>k-anonymity model</strong> against 
            the public Have I Been Pwned API. Email exposure results are simulated against an educational test database.
          </p>
          <div className="footer-links">
            <span>Security Self-Audit Prototype</span>
            <span>•</span>
            <span>No Auth • No Database • Zero Logs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
