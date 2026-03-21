import React, { useEffect, useState } from 'react';

export default function PayoutNotification({ payout, worker, onBack }) {
  const [step, setStep] = useState(0); // 0=processing, 1=fraud check, 2=success

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const amount  = payout?.amount || 300;
  const trigger = payout?.trigger?.name || 'Heavy Rainfall';
  const icon    = payout?.trigger?.icon || '🌧️';
  const claimId = payout?.claim?.id || 'clm_demo';

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center', padding: '32px 16px', minHeight: '100vh' }}>
      <div className="container">

        {/* Processing step */}
        {step === 0 && (
          <div className="card fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Trigger Detected!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {icon} {trigger} threshold crossed in {worker?.city || 'Bangalore'}
            </p>
            <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(59,130,246,.1)',
              borderRadius: 10, fontSize: 13, color: 'var(--accent-blue)', animation: 'pulse 1s infinite' }}>
              ⏳ Initiating claim {claimId}...
            </div>
          </div>
        )}

        {/* Fraud check step */}
        {step === 1 && (
          <div className="card slide-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Running Fraud Check</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📍', label: 'Layer 1: GPS Verification',   status: '✅ Within zone (0.8km)' },
                { icon: '🤖', label: 'Layer 2: ML Anomaly Score',   status: '✅ Score 0.12 (CLEAR)' },
                { icon: '📱', label: 'Layer 3: Platform Activity',  status: '✅ No orders during event' },
              ].map((check, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: 'rgba(16,185,129,.08)',
                  border: '1px solid rgba(16,185,129,.2)', borderRadius: 10 }}>
                  <span style={{ fontSize: 13 }}>{check.icon} {check.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>{check.status}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)', animation: 'pulse 1s infinite' }}>
              Sending to Razorpay UPI...
            </div>
          </div>
        )}

        {/* Success step */}
        {step === 2 && (
          <div className="zoom-pop" style={{ textAlign: 'center' }}>
            {/* Big payout banner */}
            <div className="payout-banner" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🎉</div>
              <div className="payout-amount">₹{amount}</div>
              <div className="payout-label">Payout Sent to UPI</div>
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--accent-cyan)' }}>
                {worker?.phone || '9876543210'}@upi
              </div>
            </div>

            {/* Claim details */}
            <div className="card" style={{ marginBottom: 16, textAlign: 'left' }}>
              <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: '.5px' }}>CLAIM DETAILS</h3>
              {[
                { label: 'Claim ID',    value: claimId },
                { label: 'Trigger',     value: `${icon} ${trigger}` },
                { label: 'City',        value: worker?.city || 'Bangalore' },
                { label: 'Fraud Score', value: '0.12 (All clear ✅)' },
                { label: 'Razorpay ID', value: `pay_${Date.now().toString(36).toUpperCase()}` },
                { label: 'Paid At',     value: new Date().toLocaleTimeString('en-IN') },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--border-color)' : 'none',
                  fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <span style={{ fontWeight: 500, maxWidth: 180, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Cooldown notice */}
            <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,.1)',
              border: '1px solid rgba(245,158,11,.3)', borderRadius: 10, fontSize: 12,
              color: 'var(--accent-amber)', marginBottom: 20 }}>
              ⏱️ Next payout available in 24 hours (cooldown active). You're protected.
            </div>

            {/* Fraud summary */}
            <div className="card" style={{ marginBottom: 20, textAlign: 'left' }}>
              <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '.5px' }}>🛡️ ANTI-FRAUD REPORT</h3>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div>📍 GPS: You were <strong style={{color:'var(--text-primary)'}}>0.8km</strong> from event centroid ✅</div>
                <div>🤖 ML Score: <strong style={{color:'var(--accent-green)'}}>0.12 / 1.0</strong> — Normal behavior ✅</div>
                <div>📱 Platform: <strong style={{color:'var(--text-primary)'}}>0 orders</strong> during disruption window ✅</div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={onBack}>
              ← Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
