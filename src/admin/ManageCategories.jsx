import React, { useMemo, useState } from 'react';
import {
  deleteCategory,
  getCategories,
  upsertCategory,
} from '../services/storage.js';

function emptyCategory() {
  return {
    id: '',
    name: '',
    description: '',
    icon: 'A',
    active: true,
  };
}

export default function ManageCategories() {
  const [form, setForm] = useState(emptyCategory());
  const [editingId, setEditingId] = useState('');
  const [search, setSearch] = useState('');
  const [version, setVersion] = useState(0);

  const categories = useMemo(
    () =>
      getCategories().filter((category) =>
        [category.name, category.id, category.description].join(' ').toLowerCase().includes(search.toLowerCase()),
      ),
    [search, version],
  );

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      id: form.id.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon.trim() || 'A',
      active: Boolean(form.active),
    };
    if (!payload.id || !payload.name) {
      return;
    }
    upsertCategory(payload);
    setForm(emptyCategory());
    setEditingId('');
    setVersion((value) => value + 1);
  }

  function startEdit(category) {
    setForm(category);
    setEditingId(category.id);
  }

  function handleDelete(categoryId) {
    deleteCategory(categoryId);
    setVersion((value) => value + 1);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Manage Categories</h1>
          <p>Create, update, disable, or delete test categories.</p>
        </div>
      </header>

      <section className="admin-grid two-col">
        <article className="admin-card">
          <h2>{editingId ? 'Edit Category' : 'Add Category'}</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Category ID
              <input
                value={form.id}
                onChange={(e) => setForm((current) => ({ ...current, id: e.target.value }))}
                placeholder="english"
              />
            </label>
            <label>
              Category Name
              <input
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="English Test"
              />
            </label>
            <label>
              Description
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              />
            </label>
            <label>
              Icon Text
              <input
                value={form.icon}
                onChange={(e) => setForm((current) => ({ ...current, icon: e.target.value }))}
                placeholder="Aa"
              />
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={Boolean(form.active)}
                onChange={(e) => setForm((current) => ({ ...current, active: e.target.checked }))}
              />
              Active
            </label>
            <button type="submit" className="btn btn-primary">
              Save Category
            </button>
          </form>
        </article>

        <article className="admin-card">
          <div className="list-toolbar">
            <h2>Categories</h2>
            <input
              className="search-input"
              placeholder="Search categories"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.active === false ? 'Inactive' : 'Active'}</td>
                    <td className="action-cell">
                      <button type="button" className="link-btn" onClick={() => startEdit(category)}>
                        Edit
                      </button>
                      <button type="button" className="link-btn danger" onClick={() => handleDelete(category.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
