import React from 'react';

export default function Concept() {
  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <h1>Food security shouldn't depend on Congress</h1>
        <p>SNAP Aid Token demonstrates how blockchain technology could help families buy food when benefits stop — a transparent, community-funded emergency assistance network.</p>
        <div className="cta">
          <a className="btn btn-primary" href="#how">Learn How It Works</a>
          <a className="btn btn-secondary" href="#mission">View Concept Details</a>
        </div>
        <p className="small">A conceptual framework for emergency food assistance using XRP Ledger technology</p>
      </section>

      {/* Mission */}
      <section id="mission" className="section">
        <h2>The Mission</h2>
        <p>When government benefits are delayed, families suffer immediately. This concept explores how a transparent, dollar-pegged digital token could bridge the gap — redeemable for groceries, powered by the XRP Ledger.</p>
        <div className="grid three">
          <div className="card">
            <h3>Compassionate</h3>
            <p>Designed to support families in crisis with dignity and immediate access to food resources.</p>
          </div>
          <div className="card">
            <h3>Trustworthy</h3>
            <p>Every transaction traceable on-chain while protecting family privacy and maintaining security.</p>
          </div>
          <div className="card">
            <h3>Transparent</h3>
            <p>Public metrics show exactly how tokens flow from donors to families to merchants.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section">
        <h2>How It Works</h2>
        <p>A simple four-step cycle that moves value from donors to families to merchants, all tracked transparently on the XRP Ledger.</p>
        <div className="grid four">
          <div className="card">
            <div className="pill">Step 1</div>
            <h3>Donors Contribute</h3>
            <p>Donors purchase or contribute USD to mint $FSNAP tokens into the reserve.</p>
          </div>
          <div className="card">
            <div className="pill">Step 2</div>
            <h3>Distribution to Families</h3>
            <p>Tokens are distributed to verified households through digital wallets or prepaid smart cards.</p>
          </div>
          <div className="card">
            <div className="pill">Step 3</div>
            <h3>Purchase Food</h3>
            <p>Partner grocers and food markets accept $FSNAP as payment for groceries.</p>
          </div>
          <div className="card">
            <div className="pill">Step 4</div>
            <h3>Merchant Redemption</h3>
            <p>Merchants redeem tokens back into USD through the issuer reserve.</p>
          </div>
        </div>
        <p><strong>1 $FSNAP = $1 USD</strong> — Simple, stable, and redeemable for food</p>
      </section>

      {/* Transparency Dashboard (simulated) */}
      <section className="section">
        <h2>Transparency Dashboard</h2>
        <p>Simulated impact metrics demonstrating how the system could track every token from donation to redemption.</p>
        <div className="stat-grid">
          <div className="stat"><div className="stat-num">2,450,000</div><div className="stat-label">Tokens Issued</div><div className="stat-sub">Total $FSNAP in circulation</div></div>
          <div className="stat"><div className="stat-num">42,300</div><div className="stat-label">Households Served</div><div className="stat-sub">Families receiving assistance</div></div>
          <div className="stat"><div className="stat-num">1,847</div><div className="stat-label">Partner Merchants</div><div className="stat-sub">Stores accepting $FSNAP</div></div>
          <div className="stat"><div className="stat-num">98%</div><div className="stat-label">Transparency Score</div><div className="stat-sub">On-chain verification rate</div></div>
        </div>
        <p className="small">* Simulated data for concept demonstration purposes</p>
      </section>

      {/* For Everyone */}
      <section className="section">
        <h2>For Everyone</h2>
        <p>A three-sided network connecting those who need help, those who can give, and those who provide food.</p>
        <div className="grid three">
          <div className="card">
            <h3>For Families</h3>
            <p>You'll receive a free wallet or card. Each $FSNAP equals $1 in food. Spend it like a debit card at participating stores.</p>
            <ul>
              <li>✓ No crypto knowledge needed</li>
              <li>✓ Works at local grocery stores</li>
              <li>✓ Privacy protected</li>
              <li>✓ Instant access to funds</li>
            </ul>
            <a className="btn" href="#how">Learn More</a>
          </div>
          <div className="card">
            <h3>For Donors</h3>
            <p>Every $50 you give equals 50 meals. Track your impact live. 100% of donations go directly to food, not bureaucracy.</p>
            <ul>
              <li>✓ Track your impact in real-time</li>
              <li>✓ 100% goes to families</li>
              <li>✓ Tax-deductible contributions</li>
              <li>✓ Complete transparency</li>
            </ul>
            <a className="btn" href="#how">See Impact</a>
          </div>
          <div className="card">
            <h3>For Merchants</h3>
            <p>Accept $FSNAP tokens like cash. Get instant reimbursement in USD. Join a verified, impact-driven merchant network.</p>
            <ul>
              <li>✓ Instant USD reimbursement</li>
              <li>✓ No processing fees</li>
              <li>✓ Verified customer base</li>
              <li>✓ Corporate social impact</li>
            </ul>
            <a className="btn" href="#how">Partner With Us</a>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="section" id="tech">
        <h2>Technical Architecture</h2>
        <p>Built on Proven Technology — leveraging the XRP Ledger for fast, secure, and sustainable token transactions with minimal environmental impact.</p>
        <div className="grid four">
          <div className="card">
            <h3>XRP Ledger</h3>
            <p>Fast, low-fee, environmentally sustainable blockchain infrastructure</p>
            <p className="small">&lt;0.01 kWh per transaction</p>
          </div>
          <div className="card">
            <h3>Digital Wallets</h3>
            <p>Xaman (XUMM) or hosted custodial wallets designed for ease of use</p>
            <p className="small">No technical knowledge required</p>
          </div>
          <div className="card">
            <h3>USD-Backed Reserve</h3>
            <p>Stable treasury maintaining 1:1 peg with regular audits</p>
            <p className="small">Quarterly transparency reports</p>
          </div>
          <div className="card">
            <h3>Smart Issuance</h3>
            <p>Automated token distribution and redemption system</p>
            <p className="small">Real-time verification</p>
          </div>
        </div>
        <div className="grid four">
          <div className="card">
            <h3>Compliance & Governance</h3>
            <ul>
              <li>501(c)(3) Charitable issuer status</li>
              <li>100% On-chain auditable</li>
              <li>KYC/AML for merchants only</li>
              <li>Governance by non-profit consortium</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="section">
        <h2>Imagine a World Without Food Insecurity</h2>
        <p>This is a conceptual framework exploring how blockchain technology could create transparent, efficient emergency food assistance networks. The future of social support could be decentralized, immediate, and accountable.</p>
        <div className="cta">
          <a className="btn btn-primary" href="#how">Explore the Full Concept</a>
          <a className="btn btn-secondary" href="#tech">Read Technical Paper</a>
        </div>
        <div className="section">
          <p><strong>Interested in implementing this concept?</strong></p>
          <p>Contact: <a href="mailto:partnerships@snapaidtoken.org">partnerships@snapaidtoken.org</a></p>
        </div>
      </section>
    </div>
  );
}
