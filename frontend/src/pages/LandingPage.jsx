import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const STATS = [
  { value: '50K+', label: 'Complaints Resolved' },
  { value: '98%', label: 'Citizen Satisfaction' },
  { value: '12', label: 'Departments Covered' },
  { value: '6+', label: 'Languages Supported' },
];

const FEATURES = [
  {
    icon: '🧠',
    title: 'AI Grievance Intelligence',
    desc: 'Automatic complaint classification, priority detection, and intelligent department routing using Groq & Claude AI.',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  {
    icon: '📊',
    title: 'Predictive Analytics',
    desc: 'Historical data analysis, trend prediction, and actionable governance insights for proactive decision-making.',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  },
  {
    icon: '🎤',
    title: 'Multilingual Voice Assistant',
    desc: 'Voice-first AI assistant supporting English, Hindi, Tamil, Telugu, Bengali and more for inclusive access.',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
];

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="landing">
      {/* Animated background */}
      <div className="bg-orbs">
        <div className="orb orb-1" style={{ transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)` }} />
        <div className="orb orb-2" style={{ transform: `translate(${-mousePos.x * 0.01}px, ${-mousePos.y * 0.01}px)` }} />
        <div className="orb orb-3" />
      </div>

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="nav-logo">⚖️</span>
          <span className="nav-title">CivicConnect <span>AI</span></span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#stats">Impact</a>
          <Link to="/login" className="nav-login">Login</Link>
          <Link to="/register" className="nav-register">Get Started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span className="badge-dot" />
          Powered by Groq AI + Claude AI
        </div>
        <h1 className="hero-title">
          Citizen Services,
          <span className="gradient-text"> Reimagined</span>
          <br />with AI Intelligence
        </h1>
        <p className="hero-subtitle">
          One unified platform to file grievances, track resolutions, and access all 
          government services — with AI that understands, prioritizes, and acts.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn-hero-primary">
            🚀 Start For Free
          </Link>
          <Link to="/login" className="btn-hero-secondary">
            Sign In →
          </Link>
        </div>
        <div className="hero-note">
          ✓ No paperwork &nbsp;&nbsp; ✓ AI-powered routing &nbsp;&nbsp; ✓ Real-time tracking
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" id="stats">
        <div className="stats-grid">
          {STATS.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2>Three AI Systems, One Platform</h2>
          <p>Built to solve the real problems citizens face with government services</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" style={{ background: f.gradient }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>From complaint to resolution in minutes, not months</p>
        </div>
        <div className="steps-grid">
          {[
            { step: '01', icon: '🎤', title: 'Report Issue', desc: 'Type or speak your complaint in any language' },
            { step: '02', icon: '🧠', title: 'AI Analyzes', desc: 'Groq AI classifies, prioritizes, and routes instantly' },
            { step: '03', icon: '📬', title: 'Department Acts', desc: 'Correct department receives and assigns your case' },
            { step: '04', icon: '✅', title: 'Resolved Fast', desc: 'Real-time updates until your issue is resolved' },
          ].map(s => (
            <div className="step-card" key={s.step}>
              <div className="step-number">{s.step}</div>
              <div className="step-icon">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to experience smarter governance?</h2>
          <p>Join thousands of citizens already using CivicConnect AI</p>
          <Link to="/register" className="btn-hero-primary">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">⚖️ CivicConnect AI</div>
        <div className="footer-text">Built for the 2025 AI Governance Hackathon</div>
      </footer>
    </div>
  );
}
