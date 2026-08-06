import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/auth.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const result = loginAdmin(username, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate('/admin');
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="eyebrow">Admin Login</div>
        <h1>Welcome back</h1>
        <p>Use the local credentials to manage categories, tests, questions, and results.</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button className="btn btn-primary" type="submit">
            Login
          </button>
        </form>

        <div className="login-note">
          Default credentials: <strong>admin / admin123</strong>
        </div>
      </div>
    </div>
  );
}
