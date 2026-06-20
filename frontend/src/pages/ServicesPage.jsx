import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/shared';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assistant/services').then(res => setServices(res.data.services)).finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🏛️ Government Services</h1>
        <p className="page-subtitle">Find and access all available citizen services</p>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <input className="form-input" style={{ maxWidth: 420 }} placeholder="🔍 Search services..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filtered.map(s => {
          const CardElement = s.url ? 'a' : 'div';
          return (
            <CardElement 
              key={s.name} 
              className="glass-card service-card"
              href={s.url}
              target={s.url ? "_blank" : undefined}
              rel={s.url ? "noopener noreferrer" : undefined}
              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span>🏛️</span>
                {s.url && <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>↗</span>}
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.375rem' }}>{s.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{s.description}</p>
              <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.2rem 0.6rem', borderRadius: '9999px', display: 'inline-block' }}>
                {s.dept}
              </span>
            </CardElement>
          );
        })}
      </div>
    </div>
  );
}
