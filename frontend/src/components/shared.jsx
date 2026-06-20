import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge badge-${priority}`}>
    {priority === 'urgent' && '🔴'}
    {priority === 'high' && '🟠'}
    {priority === 'medium' && '🟡'}
    {priority === 'low' && '🟢'}
    {' '}{priority?.toUpperCase()}
  </span>;
}

export function StatusBadge({ status }) {
  const labels = {
    submitted: '📥 Submitted',
    under_review: '🔍 Under Review',
    in_progress: '⚙️ In Progress',
    resolved: '✅ Resolved',
    rejected: '❌ Rejected',
  };
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
}

export function LoadingSpinner() {
  return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  );
}

export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ marginBottom: action ? '1.5rem' : 0 }}>{subtitle}</p>
      {action}
    </div>
  );
}

export function SentimentBar({ score }) {
  const pct = Math.round((score + 1) / 2 * 100);
  const color = score < -0.3 ? '#ef4444' : score > 0.3 ? '#10b981' : '#f59e0b';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
        <span>Negative</span>
        <span style={{ color }}>{score > 0 ? '+' : ''}{score?.toFixed(2)}</span>
        <span>Positive</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}
