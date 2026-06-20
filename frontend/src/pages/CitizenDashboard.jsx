import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { LoadingSpinner, PriorityBadge, StatusBadge, EmptyState } from '../components/shared';
import './CitizenDashboard.css';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/complaints/my?per_page=5'),
      api.get('/notifications/'),
    ]).then(([compRes, notifRes]) => {
      const comps = compRes.data.complaints || [];
      setComplaints(comps);
      setNotifications(notifRes.data.notifications?.slice(0, 5) || []);
      setStats({
        total: compRes.data.total || 0,
        resolved: comps.filter(c => c.status === 'resolved').length,
        pending: comps.filter(c => ['submitted','under_review','in_progress'].includes(c.status)).length,
        urgent: comps.filter(c => c.priority === 'urgent').length,
      });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div className="dash-welcome">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's your grievance overview for today</p>
        </div>
        <Link to="/submit" className="btn btn-primary btn-lg">
          + File New Complaint
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-icon">📋</span>
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-label">Total Complaints</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">✅</span>
          <div className="kpi-value" style={{ color: '#10b981' }}>{stats.resolved}</div>
          <div className="kpi-label">Resolved</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">⏳</span>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
          <div className="kpi-label">Pending</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">🚨</span>
          <div className="kpi-value" style={{ color: '#f97316' }}>{stats.urgent}</div>
          <div className="kpi-label">Urgent</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Recent Complaints */}
        <div className="glass-card">
          <div className="card-header">
            <h2 className="card-title">📋 Recent Complaints</h2>
            <Link to="/my-complaints" className="card-link">View all →</Link>
          </div>
          {complaints.length === 0 ? (
            <EmptyState icon="📭" title="No complaints yet" subtitle="File your first complaint to get started" action={<Link to="/submit" className="btn btn-primary btn-sm">File Complaint</Link>} />
          ) : (
            <div className="complaint-list">
              {complaints.map(c => (
                <Link to={`/complaint/${c.id}`} key={c.id} className="complaint-item">
                  <div className="complaint-item-info">
                    <div className="complaint-num">#{c.complaint_number}</div>
                    <div className="complaint-title">{c.title}</div>
                    <div className="complaint-meta">{c.department_name || 'Pending routing'} · {new Date(c.created_at + (c.created_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                  </div>
                  <div className="complaint-item-badges">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="glass-card">
          <div className="card-header">
            <h2 className="card-title">🔔 Notifications</h2>
            <span className="notif-badge">{notifications.filter(n => !n.is_read).length} new</span>
          </div>
          {notifications.length === 0 ? (
            <EmptyState icon="🔕" title="No notifications" subtitle="Updates will appear here" />
          ) : (
            <div className="notif-list">
              {notifications.map(n => (
                <div key={n.id} className={`notif-item notif-${n.type} ${!n.is_read ? 'unread' : ''}`}>
                  <div className="notif-icon">
                    {n.type === 'success' && '✅'}
                    {n.type === 'info' && 'ℹ️'}
                    {n.type === 'warning' && '⚠️'}
                    {n.type === 'urgent' && '🚨'}
                  </div>
                  <div>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{new Date(n.created_at + (n.created_at.endsWith('Z') ? '' : 'Z')).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">⚡ Quick Actions</h2>
        <div className="actions-grid">
          {[
            { to: '/submit', icon: '📝', title: 'File Complaint', desc: 'Report an issue to the right department' },
            { to: '/assistant', icon: '🤖', title: 'AI Assistant', desc: 'Get help finding services or status' },
            { to: '/my-complaints', icon: '🔍', title: 'Track Status', desc: 'Check your complaint progress' },
            { to: '/services', icon: '🏛️', title: 'Gov Services', desc: 'Find all available services' },
          ].map(a => (
            <Link to={a.to} key={a.to} className="action-card glass-card">
              <span style={{ fontSize: '2rem' }}>{a.icon}</span>
              <h4>{a.title}</h4>
              <p>{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
