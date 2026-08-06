import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../services/auth.js';

const menu = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/categories', label: 'Manage Categories' },
  { to: '/admin/tests', label: 'Manage Tests' },
  { to: '/admin/questions', label: 'Add Questions' },
  { to: '/admin/results', label: 'Student Results' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    logoutAdmin();
    navigate('/admin/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">A</div>
          <div>
            <strong>Admin Panel</strong>
            <span>Local test management</span>
          </div>
        </div>

        <nav className="admin-nav">
          {menu.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="admin-nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="btn btn-secondary admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
