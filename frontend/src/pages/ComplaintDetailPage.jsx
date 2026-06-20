import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { PriorityBadge, StatusBadge, LoadingSpinner, SentimentBar } from '../components/shared';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', message: '' });
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then(res => setComplaint(res.data.complaint))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.status || !updateForm.message) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/complaints/${id}/status`, updateForm);
      setComplaint(res.data.complaint);
      setShowUpdate(false);
      setUpdateForm({ status: '', message: '' });
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!complaint) return null;

  const canUpdate = user?.role === 'admin' || user?.role === 'department_head';

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.4rem' }}>{complaint.title}</h1>
          <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>#{complaint.complaint_number}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Description */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>📝 Complaint Details</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>{complaint.description}</p>
            {complaint.location && (
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                📍 {complaint.location}
              </div>
            )}
            {complaint.voice_transcript && (
              <div style={{ marginTop: '1rem', background: 'rgba(99,102,241,0.06)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                🎤 <strong>Voice Transcript:</strong> {complaint.voice_transcript}
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {complaint.ai_summary && (
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>🧠 AI Analysis</h3>
              <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{complaint.ai_summary}</p>
              </div>
              {complaint.urgency_justification && (
                <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', color: '#fdba74' }}>
                  ⚡ {complaint.urgency_justification}
                </div>
              )}
              {complaint.sentiment_score !== undefined && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Citizen Sentiment</div>
                  <SentimentBar score={complaint.sentiment_score} />
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', fontWeight: 700 }}>📅 Timeline</h3>
            <div style={{ position: 'relative' }}>
              {complaint.updates?.map((u, i) => (
                <div key={u.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, marginTop: '0.2rem' }} />
                    {i < complaint.updates.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(99,102,241,0.2)', marginTop: '4px' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.updated_by_name}</span>
                      {u.status_change && <StatusBadge status={u.status_change} />}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(u.created_at + (u.created_at.endsWith('Z') ? '' : 'Z')).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {canUpdate && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setShowUpdate(!showUpdate)}>
                  {showUpdate ? 'Cancel' : '+ Add Update'}
                </button>
                {showUpdate && (
                  <form onSubmit={handleStatusUpdate} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <select className="form-select" value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })} required>
                      <option value="">Select New Status</option>
                      <option value="under_review">Under Review</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <textarea className="form-textarea" rows={3} placeholder="Update message for the citizen..." value={updateForm.message} onChange={e => setUpdateForm({ ...updateForm, message: e.target.value })} required />
                    <button className="btn btn-success btn-sm" type="submit" disabled={updating}>
                      {updating ? 'Updating...' : '✅ Submit Update'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>📋 Complaint Info</h3>
            {[
              ['Category', complaint.category],
              ['Sub-Category', complaint.sub_category],
              ['AI Department', complaint.ai_department],
              ['Submitted', new Date(complaint.created_at + (complaint.created_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric' })],
              ['Last Updated', new Date(complaint.updated_at + (complaint.updated_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })],
              complaint.resolved_at && ['Resolved At', new Date(complaint.resolved_at + (complaint.resolved_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })],
            ].filter(Boolean).map(([k, v]) => v && (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-secondary)', textAlign: 'right', maxWidth: 160 }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>🏛️ Routing</h3>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📬</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{complaint.department_name || 'Auto-routing...'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>AI-assigned department</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
