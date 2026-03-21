import React, { useState, useEffect } from 'react';

const TRIGGERS = [
  { id: 'heavy_rainfall', icon: '🌧️', name: 'Heavy Rainfall',  unit: 'mm/3h', threshold: 35, active: true,  value: 42.5, cooldown: false },
  { id: 'imd_red_alert',  icon: '🚨', name: 'IMD Red Alert',   unit: 'alert', threshold: 1,  active: true,  value: 1,    cooldown: false },
  { id: 'aqi_hazardous',  icon: '😷', name: 'AQI Hazardous',   unit: 'AQI',   threshold: 300, active: false, value: 145,  cooldown: false },
  { id: 'extreme_heat',   icon: '🌡️', name: 'Extreme Heat',    unit: '°C',    threshold: 43,  active: false, value: 34.2, cooldown: false },
  { id: 'platform_outage',icon: '📱', name: 'Platform Outage', unit: 'orders',threshold: 0,  active: false, value: 3,    cooldown: false },
];

const TIER_PAYOUT = { basic: 150, standard: 300, plus: 500 };

export default function Dashboard({ worker, onTrigger }) {
  const [tab, setTab]           = useState('overview'); // 'overview' | 'triggers' | 'claims'
  const [simulating, setSimulating] = useState(false);
  const [claims, setClaims]     = useState([
    { id: 'clm_001', trigger: '🌧️ Heavy Rainfall', amount: 300, status: 'paid', date: '2026-03-15', city: 'Bangalore' },
    { id: 'clm_002', trigger: '🚨 IMD Red Alert',  amount: 300, status: 'paid', date: '2026-02-28', city: 'Bangalore' },
  ]);

  const payout = TIER_PAYOUT[worker?.tier || 'standard'];
  const risk = worker?.riskScore || 72;

  const handleSimulateTrigger = async (trigger) => {
    if (!trigger.active || simulating) return;
    setSimulating(true);
    await new Promise(r => setTimeout(r, 1500));
    const newClaim = {
      id: `clm_${Date.now()}`,
      trigger: `${trigger.icon} ${trigger.name}`,
      amount: payout,
      status: 'paid',
      date: new Date().toISOString().slice(0, 10),
      city: worker?.city || 'Bangalore',
    };
    setClaims(prev => [newClaim, ...prev]);
    setSimulating(false);
    onTrigger({ trigger, amount: payout, claim: newClaim });
  };

  // Risk bar color
  const riskColor = risk > 70 ? 'var(--accent-red)' : risk > 40 ? 'var(--accent-amber)' : 'var(--accent-green)';

  return (
    <div className="page" style={{ paddingBottom: 32 }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          🌧️ Rain<span className="drop">Guard</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-green">● ACTIVE</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{worker?.city}</span>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: 20 }}>

        {/* Greeting */}
        <div className="fade-in" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Hey, {worker?.name?.split(' ')[0] || 'Raju'} 👋</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {TRIGGERS.filter(t => t.active).length} active trigger(s) in your zone — you're covered.
          </p>
        </div>

        {/* Alert banner — active triggers */}
        {TRIGGERS.some(t => t.active) && (
          <div className="fade-in" style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,.15), rgba(245,158,11,.08))',
            border: '1px solid rgba(239,68,68,.4)', borderRadius: 12, padding: '14px 16px',
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12
          }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Active Weather Alert — {worker?.city}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                Heavy rain detected ({TRIGGERS[0].value}mm). Payout <strong style={{ color: 'var(--accent-green)' }}>₹{payout}</strong> processing...
              </div>
            </div>
          </div>
        )}

        {/* Policy Summary */}
        <div className="card fade-in" style={{ marginBottom: 16, animationDelay: '.05s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>ACTIVE POLICY</div>
              <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'capitalize' }}>
                {worker?.tier || 'Standard'} Plan
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                Valid until: {new Date(Date.now() + 7*86400000).toDateString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>MAX PAYOUT</div>
              <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--accent-green)' }}>₹{payout}</div>
            </div>
          </div>

          {/* Premium row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0',
            borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Weekly Premium</span>
            <span style={{ fontWeight: 600 }}>₹{worker?.weeklyPremium?.toFixed(2) || '38.50'}</span>
          </div>

          {/* Risk Score */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>AI Risk Score</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: riskColor }}>{risk}/100</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${risk}%`, background: riskColor,
                borderRadius: 99, transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              Bangalore High-risk zone · {worker?.hours || 40}h/week delivery
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar fade-in" style={{ animationDelay: '.1s' }}>
          {[['overview', '📊 Overview'], ['triggers', '⚡ Triggers'], ['claims', '📋 Claims']].map(([id, label]) => (
            <button key={id} className={`tab-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Total Paid Out', value: `₹${claims.reduce((s,c) => s+c.amount,0)}`, icon: '💰', color: 'var(--accent-green)' },
                { label: 'Claims This Month', value: claims.filter(c=>c.date.startsWith('2026-03')).length, icon: '📑', color: 'var(--accent-cyan)' },
                { label: 'Pincode Zone', value: worker?.pincode || '560001', icon: '📍', color: 'var(--accent-amber)' },
                { label: 'Platform', value: worker?.platform || 'Swiggy', icon: '🛵', color: 'var(--accent-blue)' },
              ].map((stat, i) => (
                <div key={i} className="card" style={{ padding: '16px', animationDelay: `${i*.05}s` }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>📡 How Your Payout Works</div>
              <ol style={{ paddingLeft:16, lineHeight:1.8 }}>
                <li>Weather API checks your pincode every 15 minutes</li>
                <li>If rainfall &gt;35mm/3h → trigger fires</li>
                <li>Fraud check runs in &lt;2 seconds (GPS + ML)</li>
                <li>₹{payout} sent to your UPI: <strong style={{color:'var(--text-primary)'}}>{worker?.phone}@upi</strong></li>
              </ol>
            </div>
          </div>
        )}

        {/* Triggers Tab */}
        {tab === 'triggers' && (
          <div className="fade-in">
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Real-time trigger status for {worker?.city || 'Bangalore'}. Tap an active trigger to simulate a demo payout.
            </p>
            {TRIGGERS.map(t => (
              <div key={t.id} className={`trigger-card ${t.active ? 'active' : ''}`}
                onClick={() => t.active && handleSimulateTrigger(t)}
                style={{ cursor: t.active ? 'pointer' : 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="trigger-icon">{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Threshold: {t.threshold}{t.unit === 'alert' ? '' : ' ' + t.unit} · Now: {t.value}{t.unit === 'alert' ? ' issued' : ' ' + t.unit}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {t.active
                    ? <span className="badge badge-red">🔴 ACTIVE</span>
                    : <span className="badge badge-green">✅ CLEAR</span>}
                  {t.active && <span style={{ fontSize: 11, color: 'var(--accent-amber)' }}>Tap to demo</span>}
                </div>
              </div>
            ))}
            {simulating && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--accent-blue)' }}>
                ⏳ Processing payout...
              </div>
            )}
          </div>
        )}

        {/* Claims Tab */}
        {tab === 'claims' && (
          <div className="fade-in">
            {claims.map((c, i) => (
              <div key={c.id} className="trigger-card" style={{ animationDelay: `${i*.05}s` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.trigger}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.date} · {c.city}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>+₹{c.amount}</div>
                  <span className="badge badge-green" style={{ marginTop: 4 }}>✓ Paid</span>
                </div>
              </div>
            ))}
            {claims.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>
                No claims yet — stay covered! ☀️
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
