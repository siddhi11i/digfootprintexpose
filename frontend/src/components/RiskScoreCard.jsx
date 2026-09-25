import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Key,
  Mail,
  Fingerprint
} from 'lucide-react';

export default function RiskScoreCard({ passwordAudit, exposureAudit }) {
  const hasPasswordCheck = Boolean(passwordAudit && passwordAudit.checked);
  const hasExposureCheck = Boolean(exposureAudit && exposureAudit.query);

  if (!hasPasswordCheck && !hasExposureCheck) {
    return (
      <div className="risk-score-container empty-state glass-panel">
        <div className="empty-state-content">
          <Fingerprint size={48} className="text-dim" />
          <h3>Security Audit Incomplete</h3>
          <p>
            Run either the <strong>Password Breach Check</strong> or the <strong>Email Exposure Check</strong> 
            above to compute your combined digital footprint risk score.
          </p>
        </div>
      </div>
    );
  }

  // Calculate score & factors
  const factors = [];
  let score = 0;

  // 1. Password Evaluation
  if (hasPasswordCheck) {
    if (passwordAudit.isBreached) {
      if (passwordAudit.breachCount > 1000000) {
        score += 45;
        factors.push({
          type: 'danger',
          title: 'Heavily Compromised Password',
          detail: `Your password appeared ${passwordAudit.breachCount.toLocaleString()} times in public leaks. It is likely indexed in automated cracking dictionaries.`,
          impact: '+45 Risk'
        });
      } else if (passwordAudit.breachCount > 1000) {
        score += 35;
        factors.push({
          type: 'danger',
          title: 'Known Leaked Password',
          detail: `Found ${passwordAudit.breachCount.toLocaleString()} times in breach compilations. Highly susceptible to credential stuffing.`,
          impact: '+35 Risk'
        });
      } else {
        score += 25;
        factors.push({
          type: 'warning',
          title: 'Low-Frequency Breached Password',
          detail: `Appeared ${passwordAudit.breachCount.toLocaleString()} times in historical breach collections.`,
          impact: '+25 Risk'
        });
      }
    } else {
      factors.push({
        type: 'safe',
        title: 'Clean Password Hash',
        detail: 'Zero known breach occurrences found in HIBP k-anonymity database.',
        impact: '0 Risk'
      });
    }
  } else {
    factors.push({
      type: 'neutral',
      title: 'Password Audit Pending',
      detail: 'Password check not yet executed. Run the check above to include password risk.',
      impact: 'Pending'
    });
  }

  // 2. Email / Username Evaluation
  if (hasExposureCheck) {
    const breachCount = exposureAudit.matchedBreachesCount || 0;
    const hasPwLeak = exposureAudit.summary?.hasPasswordExposure;
    const hasFinLeak = exposureAudit.summary?.hasFinancialData;

    if (breachCount >= 3) {
      score += 35;
      factors.push({
        type: 'danger',
        title: `Widespread Identity Exposure (${breachCount} Leaks)`,
        detail: `This account matches multiple simulated breach dumps across different platforms.`,
        impact: '+35 Risk'
      });
    } else if (breachCount > 0) {
      score += 20;
      factors.push({
        type: 'warning',
        title: `Account Found in ${breachCount} Incident(s)`,
        detail: `Matched in simulated incident dataset.`,
        impact: '+20 Risk'
      });
    } else {
      factors.push({
        type: 'safe',
        title: 'Zero Identity Exposure',
        detail: 'No matching records discovered in simulated database.',
        impact: '0 Risk'
      });
    }

    if (hasPwLeak) {
      score += 15;
      factors.push({
        type: 'danger',
        title: 'Credentials Exfiltrated in Breaches',
        detail: 'Simulated breaches exposed password hashes/tokens associated with this account.',
        impact: '+15 Risk'
      });
    }

    if (hasFinLeak) {
      score += 15;
      factors.push({
        type: 'danger',
        title: 'Financial / Payment Data Exposed',
        detail: 'Leaked records include billing details, purchase histories, or wallet addresses.',
        impact: '+15 Risk'
      });
    }
  } else {
    factors.push({
      type: 'neutral',
      title: 'Email / Username Audit Pending',
      detail: 'Identity check not yet executed. Run the check above to include account exposure.',
      impact: 'Pending'
    });
  }

  // Clamp score
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Level: Low / Medium / High / Critical
  let riskLevel = 'Low';
  let badgeClass = 'tag-safe';
  let textClass = 'text-emerald';
  let gaugeColor = 'var(--emerald-primary)';

  if (finalScore >= 75) {
    riskLevel = 'Critical';
    badgeClass = 'tag-danger pulse-border';
    textClass = 'text-red';
    gaugeColor = 'var(--red-primary)';
  } else if (finalScore >= 50) {
    riskLevel = 'High';
    badgeClass = 'tag-orange';
    textClass = 'text-orange';
    gaugeColor = '#f97316';
  } else if (finalScore >= 25) {
    riskLevel = 'Medium';
    badgeClass = 'tag-warning';
    textClass = 'text-amber';
    gaugeColor = 'var(--amber-primary)';
  }

  return (
    <div className="risk-score-container glass-panel">
      {/* Top Banner */}
      <div className="risk-header">
        <div className="risk-header-left">
          <div className="icon-badge icon-badge-purple">
            <TrendingUp size={22} />
          </div>
          <div>
            <h2 className="card-heading">Combined Digital Footprint Risk Score</h2>
            <p className="card-subheading">
              Holistic security evaluation based on live password vulnerability and account exposures
            </p>
          </div>
        </div>

        <div className={`risk-grade-badge ${badgeClass}`}>
          <span>{riskLevel.toUpperCase()} RISK</span>
        </div>
      </div>

      {/* Main Score Visualizer */}
      <div className="risk-dashboard-grid">
        <div className="gauge-panel">
          <div className="score-number-wrap">
            <span className={`score-digit mono ${textClass}`}>{finalScore}</span>
            <span className="score-max">/100</span>
          </div>
          
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${finalScore}%`, backgroundColor: gaugeColor }}
            ></div>
          </div>

          <div className="gauge-labels">
            <span className="text-emerald">0 Low</span>
            <span className="text-amber">25 Medium</span>
            <span className="text-orange">50 High</span>
            <span className="text-red">75+ Critical</span>
          </div>

          <div className="risk-verdict-box">
            <h4>Assessment Summary:</h4>
            <p>
              {riskLevel === 'Low' && 'Your evaluated digital footprint shows minimal vulnerability. Keep up proactive credential hygiene.'}
              {riskLevel === 'Medium' && 'Moderate exposure detected. Some credentials or accounts require attention and modernization.'}
              {riskLevel === 'High' && 'Substantial exposure found. Known breaches or compromised passwords put your accounts at serious risk of credential stuffing.'}
              {riskLevel === 'Critical' && 'Severe security risk! Widespread breach appearances and/or heavily cracked passwords require immediate remediation.'}
            </p>
          </div>
        </div>

        {/* Factors Breakdown */}
        <div className="factors-panel">
          <h3 className="panel-title">Contributing Risk Factors</h3>
          <div className="factors-list">
            {factors.map((f, i) => (
              <div key={i} className={`factor-item factor-${f.type}`}>
                <div className="factor-main">
                  <span className="factor-title">{f.title}</span>
                  <span className="factor-detail">{f.detail}</span>
                </div>
                <span className="factor-impact mono">{f.impact}</span>
              </div>
            ))}
          </div>

          {/* Actionable Recommendations */}
          <div className="recommendations-box">
            <h4>Recommended Next Steps:</h4>
            <ul className="rec-list">
              {hasPasswordCheck && passwordAudit.isBreached && (
                <li>
                  <ArrowRight size={14} className="text-red" />
                  <span><strong>Immediately replace the password:</strong> Never reuse it on any online account.</span>
                </li>
              )}
              {hasExposureCheck && exposureAudit.matchedBreachesCount > 0 && (
                <li>
                  <ArrowRight size={14} className="text-amber" />
                  <span><strong>Enable Two-Factor Authentication (2FA):</strong> Use authenticator apps or hardware keys (FIDO2) across all linked accounts.</span>
                </li>
              )}
              <li>
                <ArrowRight size={14} className="text-cyan" />
                <span><strong>Adopt a Password Manager:</strong> Generate 16+ character pseudorandom unique passwords for every service.</span>
              </li>
              <li>
                <ArrowRight size={14} className="text-emerald" />
                <span><strong>Audit OAuth Apps & Authorizations:</strong> Revoke unused third-party application permissions in Google, GitHub, and Microsoft accounts.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
