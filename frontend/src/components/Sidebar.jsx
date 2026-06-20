import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import './Sidebar.css';

const navItems = {
  citizen: [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/submit', icon: '📝', label: 'File Complaint' },
    { to: '/my-complaints', icon: '📋', label: 'My Complaints' },
    { to: '/assistant', icon: '🤖', label: 'AI Assistant' },
    { to: '/services', icon: '🏛️', label: 'Services' },
  ],
  admin: [
    { to: '/admin', icon: '📊', label: 'Dashboard' },
    { to: '/admin/complaints', icon: '📋', label: 'All Complaints' },
    { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
    { to: '/admin/departments', icon: '🏛️', label: 'Departments' },
    { to: '/assistant', icon: '🤖', label: 'AI Assistant' },
  ],
  department_head: [
    { to: '/dept', icon: '📊', label: 'Dashboard' },
    { to: '/dept/complaints', icon: '📋', label: 'Complaints' },
    { to: '/assistant', icon: '🤖', label: 'AI Assistant' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  
  const items = navItems[user?.role] || navItems.citizen;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">⚖️</span>
          {!collapsed && (
            <div>
              <div className="logo-name">CivicConnect</div>
              <div className="logo-sub">AI Platform</div>
            </div>
          )}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
        )}
        <button className="nav-item" onClick={toggleTheme}>
          <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!collapsed && <span className="nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <NavLink to="/profile" className="nav-item">
          <span className="nav-icon">👤</span>
          {!collapsed && <span className="nav-label">Profile</span>}
        </NavLink>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
