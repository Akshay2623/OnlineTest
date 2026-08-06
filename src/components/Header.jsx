import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ siteName = 'Online Test Portal' }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Online Test Portal home">
          <span className="brand-mark">OTP</span>
          <span className="brand-text">
            <strong>{siteName}</strong>
            <small>Practice. Track. Improve.</small>
          </span>
        </Link>
        <div className="header-meta">
          <Link to="/admin/login" className="status-pill">
            {isHome ? 'Home' : 'Test Dashboard'}
          </Link>
        </div>
      </div>
    </header>
  );
}
