import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import './BottomNav.css';

const navItems = {
  citizen: [
    { to: '/dashboard', icon: '🏠', label: 'Home' },
    { to: '/submit', icon: '📝', label: 'File' },
    { to: '/my-complaints', icon: '📋', label: 'Mine' },
    { to: '/assistant', icon: '🤖', label: 'AI' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ],
  admin: [
    { to: '/admin', icon: '📊', label: 'Dashboard' },
    { to: '/admin/complaints', icon: '📋', label: 'Cases' },
    { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
    { to: '/assistant', icon: '🤖', label: 'AI' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ],
  department_head: [
    { to: '/dept', icon: '📊', label: 'Dashboard' },
    { to: '/dept/complaints', icon: '📋', label: 'Cases' },
    { to: '/assistant', icon: '🤖', label: 'AI' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ],
};

export default function BottomNav() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const items = navItems[user?.role] || navItems.citizen;

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          aria-label={item.label}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
      <button 
        onClick={toggleTheme} 
        className="bottom-nav-item" 
        aria-label="Toggle Theme"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <span className="bottom-nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
        <span className="bottom-nav-label">Theme</span>
      </button>
    </nav>
  );
}
