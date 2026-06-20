import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../services/api';
import { LoadingSpinner } from '../components/shared';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
  }
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [deptPerf, setDeptPerf] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/trends?days=30'),
      api.get('/analytics/by-category'),
      api.get('/analytics/by-priority'),
      api.get('/analytics/department-performance'),
    ]).then(([ov, tr, cat, pri, dept]) => {
      setOverview(ov.data.data);
      setTrends(tr.data.data);
      setCategories(cat.data.data);
      setPriorities(pri.data.data);
      setDeptPerf(dept.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await api.get('/analytics/insights');
      setInsights(res.data.insights);
    } catch (e) { console.error(e); }
    finally { setInsightsLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  const trendsChart = {
    labels: trends.map(t => new Date(t.date + (t.date.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' })),
    datasets: [{
      label: 'Daily Complaints',
      data: trends.map(t => t.count),
      fill: true,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointRadius: 3,
    }]
  };

  const categoryChart = {
    labels: categories.map(c => c.category),
    datasets: [{
      data: categories.map(c => c.count),
      backgroundColor: ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#f97316','#14b8a6','#a855f7','#ec4899'],
      borderWidth: 0,
    }]
  };

  const priorityColors = { urgent: '#f97316', high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const priorityChart = {
    labels: priorities.map(p => p.priority?.toUpperCase()),
    datasets: [{
      label: 'Count',
      data: priorities.map(p => p.count),
      backgroundColor: priorities.map(p => priorityColors[p.priority] || '#6366f1'),
      borderRadius: 6,
    }]
  };

  const deptChart = {
    labels: deptPerf.map(d => d.department?.split(' ').slice(0,2).join(' ')),
    datasets: [
      { label: 'Total', data: deptPerf.map(d => d.total), backgroundColor: 'rgba(99,102,241,0.5)', borderRadius: 4 },
      { label: 'Resolved', data: deptPerf.map(d => d.resolved), backgroundColor: 'rgba(16,185,129,0.6)', borderRadius: 4 },
    ]
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📊 Governance Dashboard</h1>
        <p className="page-subtitle">Real-time complaint analytics and performance metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-icon">📋</span>
          <div className="kpi-value">{overview?.total}</div>
          <div className="kpi-label">Total Complaints</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">✅</span>
          <div className="kpi-value" style={{ color: '#10b981' }}>{overview?.resolved}</div>
          <div className="kpi-label">Resolved</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">⏳</span>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>{overview?.pending}</div>
          <div className="kpi-label">Pending</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">🚨</span>
          <div className="kpi-value" style={{ color: '#f97316' }}>{overview?.urgent}</div>
          <div className="kpi-label">Urgent</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">📈</span>
          <div className="kpi-value" style={{ color: '#6366f1' }}>{overview?.resolution_rate}%</div>
          <div className="kpi-label">Resolution Rate</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">⏱️</span>
          <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{overview?.avg_resolution_days}d</div>
          <div className="kpi-label">Avg Resolution</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid-2">
        <div className="glass-card">
          <h3 className="chart-title">📈 Complaint Trend (30 Days)</h3>
          <Line data={trendsChart} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
        </div>
        <div className="glass-card">
          <h3 className="chart-title">🥧 By Category</h3>
          <Doughnut data={categoryChart} options={{ responsive: true, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 } } } } }} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid-2">
        <div className="glass-card">
          <h3 className="chart-title">⚡ By Priority</h3>
          <Bar data={priorityChart} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
        </div>
        <div className="glass-card">
          <h3 className="chart-title">🏛️ Department Performance</h3>
          <Bar data={deptChart} options={{ ...chartDefaults }} />
        </div>
      </div>

      {/* AI Insights */}
      <div className="glass-card insights-card">
        <div className="insights-header">
          <h3>🤖 Claude AI Governance Insights</h3>
          <button className="btn btn-primary btn-sm" onClick={loadInsights} disabled={insightsLoading}>
            {insightsLoading ? '⏳ Analyzing...' : '✨ Generate AI Insights'}
          </button>
        </div>
        {insights ? (
          <div className="insights-grid">
            <div className="insight-section">
              <h4>🔴 Top Issues</h4>
              <ul>{insights.top_issues?.map(i => <li key={i}>→ {i}</li>)}</ul>
            </div>
            <div className="insight-section">
              <h4>🔮 Predictions</h4>
              <ul>{insights.predictions?.map(i => <li key={i}>→ {i}</li>)}</ul>
            </div>
            <div className="insight-section">
              <h4>💡 Recommendations</h4>
              <ul>{insights.recommendations?.slice(0,4).map(i => <li key={i}>→ {i}</li>)}</ul>
            </div>
            <div className="insight-section">
              <h4>📋 Executive Summary</h4>
              <p className="insight-summary">{insights.executive_summary}</p>
              <div className="health-score">
                <span>Governance Health</span>
                <div className="health-bar-wrap">
                  <div className="health-bar" style={{ width: `${insights.overall_health_score}%`, background: insights.overall_health_score > 70 ? '#10b981' : insights.overall_health_score > 50 ? '#f59e0b' : '#ef4444' }} />
                </div>
                <strong>{insights.overall_health_score}/100</strong>
              </div>
            </div>
          </div>
        ) : (
          <p className="insights-placeholder">Click "Generate AI Insights" to get Claude AI-powered governance recommendations</p>
        )}
      </div>
    </div>
  );
}
