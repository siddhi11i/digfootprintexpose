import React from 'react';
import { Sparkles, UserX, UserCheck, Code } from 'lucide-react';

export default function PresetBar({ onSelectPreset }) {
  const presets = [
    {
      id: 'high-risk',
      name: 'High-Risk Persona',
      desc: 'Known compromised password + 5 simulated breaches',
      icon: UserX,
      color: 'danger',
      password: 'password123',
      email: 'john.doe@example.com'
    },
    {
      id: 'developer',
      name: 'Developer/Crypto Persona',
      desc: 'Tech breach + common corporate credential',
      icon: Code,
      color: 'warning',
      password: 'admin2024!',
      email: 'developer@web.io'
    },
    {
      id: 'secure',
      name: 'Clean/Hardened Persona',
      desc: 'Unique complex password + zero breach history',
      icon: UserCheck,
      color: 'safe',
      password: 'Kx9#mQ2$vL8@pZ7!uW',
      email: 'clean_user_2026@securezone.net'
    }
  ];

  return (
    <div className="preset-bar glass-panel">
      <div className="preset-bar-title">
        <Sparkles size={16} className="text-cyan" />
        <span>1-Click Test Scenarios:</span>
      </div>
      <div className="preset-cards-grid">
        {presets.map((p) => {
          const IconComponent = p.icon;
          return (
            <button
              key={p.id}
              className={`scenario-btn scenario-${p.color}`}
              onClick={() => onSelectPreset({ password: p.password, email: p.email })}
            >
              <IconComponent size={16} />
              <div className="scenario-btn-text">
                <span className="scenario-name">{p.name}</span>
                <span className="scenario-desc">{p.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
