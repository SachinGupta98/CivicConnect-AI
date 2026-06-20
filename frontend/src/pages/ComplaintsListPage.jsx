import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { PriorityBadge, StatusBadge, LoadingSpinner, EmptyState } from '../components/shared';

export default function ComplaintsListPage({ adminView = false }) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1 });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const endpoint = adminView ? '/complaints/all' : '/complaints/my';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ per_page: 15, ...filters });
    Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
    
    api.get(`${endpoint}?${params}`)
      .then(res => {
        setComplaints(res.data.complaints);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, endpoint]);

  if (loading && complaints.length === 0) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{adminView ? '📋 All Complaints' : '📋 My Complaints'}</h1>
          <p className="page-subtitle">{total} complaint{total !== 1 ? 's' : ''} found</p>
        </div>
        {!adminView && <Link to="/submit" className="btn btn-primary">+ File Complaint</Link>}
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select className="form-select" style={{ maxWidth: 180 }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="form-select" style={{ maxWidth: 180 }} value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value, page: 1 })}>
          <option value="">All Priorities</option>
          <option value="urgent">🔴 Urgent</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
      </div>

      {complaints.length === 0 ? (
        <EmptyState icon="📭" title="No complaints found" subtitle="Adjust filters or file a new complaint" action={!adminView && <Link to="/submit" className="btn btn-primary">File Complaint</Link>} />
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Title</th>
                  {adminView && <th>Citizen</th>}
                  <th>Category</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id}>
                    <td><span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>#{c.complaint_number}</span></td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    </td>
                    {adminView && <td style={{ fontSize: '0.8rem' }}>{c.citizen_name}</td>}
                    <td style={{ fontSize: '0.8rem' }}>{c.category || '-'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{c.department_name || 'Routing...'}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(c.created_at + (c.created_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                    <td>
                      <Link to={`/complaint/${c.id}`} className="btn btn-secondary btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`btn btn-sm ${filters.page === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilters({ ...filters, page: p })}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
