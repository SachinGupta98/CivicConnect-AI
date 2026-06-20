import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'bn', label: 'Bengali' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    language_pref: user?.language_pref || 'en',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await updateProfile(payload);
      setMessage('Profile updated successfully!');
      setForm(f => ({ ...f, password: '' }));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Profile Settings</h1>
      <p className="page-subtitle">Manage your account information</p>

      <div className="glass-card" style={{ maxWidth: 560, marginTop: '1.5rem' }}>
        {message && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
            background: message.includes('success') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${message.includes('success') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: message.includes('success') ? '#34d399' : '#f87171',
            fontSize: '0.85rem',
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Language</label>
            <select className="form-select" value={form.language_pref} onChange={e => setForm({ ...form, language_pref: e.target.value })}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">New Password (leave blank to keep current)</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Role:</strong> {user?.role?.replace('_', ' ')} &nbsp;|&nbsp;
            <strong>Joined:</strong> {user?.created_at ? new Date(user.created_at + (user.created_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
