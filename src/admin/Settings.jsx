import React, { useState } from 'react';
import { getSettings, resetDb, saveSettings } from '../services/storage.js';

export default function AdminSettings() {
  const current = getSettings();
  const [siteName, setSiteName] = useState(current.siteName || 'Online Test Portal');

  function handleSave(event) {
    event.preventDefault();
    saveSettings({ siteName });
  }

  function handleReset() {
    const confirmed = window.confirm('This will reset all local categories, tests, questions, attempts, and settings. Continue?');
    if (!confirmed) {
      return;
    }
    resetDb();
    window.location.reload();
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage global portal settings and reset the local data store.</p>
        </div>
      </header>

      <section className="admin-grid two-col">
        <article className="admin-card">
          <h2>Portal Settings</h2>
          <form className="admin-form" onSubmit={handleSave}>
            <label>
              Site Name
              <input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </label>
            <button type="submit" className="btn btn-primary">
              Save Settings
            </button>
          </form>
        </article>

        <article className="admin-card danger-card">
          <h2>Danger Zone</h2>
          <p>Reset the local database to the default seed data.</p>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Reset All Local Data
          </button>
        </article>
      </section>
    </div>
  );
}
