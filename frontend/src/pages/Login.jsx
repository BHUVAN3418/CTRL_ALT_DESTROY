import React, { useState } from 'react';

const CITIES = ['Bangalore', 'Mumbai', 'Chennai', 'Hyderabad'];
const PLATFORMS = ['Swiggy', 'Zomato', 'Both'];

export default function LoginPage({ onLogin }) {
  const [step, setStep]     = useState('landing'); // 'landing' | 'register'
  const [form, setForm]     = useState({
    name: '', phone: '', city: 'Bangalore', platform: 'Swiggy',
    pincode: '', hours: '40', upi: ''
  });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call (Phase 1 mock)
    await new Promise(r => setTimeout(r, 1200));
    onLogin({
      id: 'wkr_demo01',
      name: form.name || 'Raju Kumar',
      phone: form.phone,
      city: form.city,
      platform: form.platform,
      pincode: form.pincode || '560001',
      riskScore: 72,
      tier: 'standard',
      weeklyPremium: 38.5,
      balance: 300,
    });
    setLoading(false);
  };

  if (step === 'landing') {
    return (
      <div className="page" style={{ alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }} className="fade-in">
          <div style={{ fontSize: 52, marginBottom: 8 }}>🌧️</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Rain<span style={{ color: 'var(--accent-blue)' }}>Guard</span> AI
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
            Parametric Income Insurance • Food Delivery Workers
          </p>
        </div>

        {/* Hero card */}
        <div className="card fade-in" style={{ marginBottom: 20, textAlign: 'center', animationDelay: '.1s' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            When rain stops work,<br />
            <span style={{ color: 'var(--accent-green)' }}>RainGuard pays automatically.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
            Heavy rain detected in your zone → ₹300 sent to your UPI. No forms. No waiting. <strong style={{ color: 'var(--text-primary)' }}>Instant.</strong>
          </p>
        </div>

        {/* Steps */}
        <div className="card fade-in" style={{ marginBottom: 24, animationDelay: '.2s' }}>
          <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, letterSpacing: '.5px' }}>HOW IT WORKS</h3>
          {[
            { icon: '📝', title: 'Register in 2 mins', desc: 'Phone number + city + UPI ID' },
            { icon: '💳', title: 'Pay ₹25–50/week', desc: 'Auto-deducted weekly, cancel anytime' },
            { icon: '🌧️', title: 'Rain triggers payout', desc: 'AI detects threshold → UPI sent instantly' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: i < 2 ? 14 : 0 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trigger quick view */}
        <div className="card fade-in" style={{ marginBottom: 24, animationDelay: '.3s' }}>
          <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: '.5px' }}>5 COVERED EVENTS</h3>
          {[
            { e: '🌧️', name: 'Heavy Rain', val: '>35mm / 3h' },
            { e: '🚨', name: 'IMD Red Alert', val: 'District alert' },
            { e: '😷', name: 'AQI Hazardous', val: '>300 AQI' },
            { e: '🌡️', name: 'Extreme Heat', val: '>43°C' },
            { e: '📱', name: 'Platform Outage', val: '0 orders / 2h' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border-color)' : 'none' }}>
              <span style={{ fontSize: 13 }}>{t.e} {t.name}</span>
              <span className="badge badge-blue">{t.val}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary fade-in" style={{ animationDelay: '.4s' }} onClick={() => setStep('register')}>
          🚀 Get Protected — Register Free
        </button>
        <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
          Bangalore • Mumbai • Chennai • Hyderabad
        </p>
      </div>
    );
  }

  // Register form
  return (
    <div className="page" style={{ padding: '24px 16px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }} className="slide-in">
          <button onClick={() => setStep('landing')} style={{ background: 'none', border: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 20 }}>←</button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Create Your Profile</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Protected in under 2 minutes</div>
          </div>
        </div>

        <form onSubmit={handleRegister}>
          <div className="card slide-in" style={{ animationDelay: '.05s' }}>
            <div className="input-group">
              <label className="input-label">FULL NAME</label>
              <input className="input-field" placeholder="Raju Kumar" value={form.name}
                onChange={e => update('name', e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">PHONE NUMBER (UPI linked)</label>
              <input className="input-field" placeholder="9876543210" type="tel" value={form.phone}
                onChange={e => update('phone', e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">UPI ID</label>
              <input className="input-field" placeholder="raju@okaxis" value={form.upi}
                onChange={e => update('upi', e.target.value)} required />
            </div>
          </div>

          <div className="card slide-in" style={{ marginTop: 16, animationDelay: '.1s' }}>
            <div className="input-group">
              <label className="input-label">CITY</label>
              <select className="select-field" value={form.city} onChange={e => update('city', e.target.value)}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">PINCODE</label>
              <input className="input-field" placeholder="560001" maxLength={6} value={form.pincode}
                onChange={e => update('pincode', e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">DELIVERY PLATFORM</label>
              <select className="select-field" value={form.platform} onChange={e => update('platform', e.target.value)}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Coverage tier picker */}
          <div className="card slide-in" style={{ marginTop: 16, animationDelay: '.15s' }}>
            <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, letterSpacing: '.5px' }}>COVERAGE PLAN</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { id: 'basic',    label: 'Basic',    price: '₹20–30', payout: '₹150' },
                { id: 'standard', label: 'Standard', price: '₹30–40', payout: '₹300' },
                { id: 'plus',     label: 'Plus',     price: '₹40–50', payout: '₹500' },
              ].map(tier => (
                <div key={tier.id} onClick={() => update('tier', tier.id)}
                  style={{
                    padding: '12px 8px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                    border: `2px solid ${form.tier === tier.id ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                    background: form.tier === tier.id ? 'rgba(59,130,246,.12)' : 'rgba(255,255,255,.03)',
                    transition: 'all .2s',
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{tier.label}</div>
                  <div style={{ color: 'var(--accent-green)', fontSize: 12, fontWeight: 600 }}>{tier.payout}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{tier.price}/wk</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(59,130,246,.08)',
              borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              🤖 AI will calculate your exact premium based on your city, pincode risk, and delivery hours.
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 20 }} disabled={loading}>
            {loading ? '⏳ Setting up your policy...' : '✅ Activate My Policy'}
          </button>
        </form>
      </div>
    </div>
  );
}
