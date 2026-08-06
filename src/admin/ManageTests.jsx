import React, { useMemo, useState } from 'react';
import {
  deleteTest,
  getCategories,
  getQuestionsByTest,
  getTests,
  upsertTest,
} from '../services/storage.js';

function emptyTest(categoryId = '') {
  return {
    id: '',
    categoryId,
    name: '',
    description: '',
    totalMarks: 0,
    negativeMarking: 0.25,
    durationMinutes: 30,
    passingMarks: 0,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResultImmediately: true,
    status: 'active',
  };
}

function buildTestId(categoryId, name) {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${categoryId}-${slug || `test-${Date.now()}`}`;
}

export default function ManageTests() {
  const categories = getCategories();
  const tests = getTests();
  const [categoryFilter, setCategoryFilter] = useState(categories[0]?.id || '');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyTest(categories[0]?.id || ''));
  const [version, setVersion] = useState(0);

  const filteredTests = useMemo(
    () =>
      tests.filter((test) => {
        const categoryMatch = !categoryFilter || test.categoryId === categoryFilter;
        const searchMatch = [test.name, test.description, test.id]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());
        return categoryMatch && searchMatch;
      }),
    [tests, search, categoryFilter, version],
  );

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.categoryId || !form.name) {
      return;
    }

    const payload = {
      ...form,
      id: editingId ? editingId : form.id || buildTestId(form.categoryId, form.name),
      categoryId: form.categoryId,
      name: form.name.trim(),
      description: form.description.trim(),
      totalMarks: Number(form.totalMarks) || 0,
      negativeMarking: Number(form.negativeMarking) || 0,
      durationMinutes: Number(form.durationMinutes) || 30,
      passingMarks: Number(form.passingMarks) || 0,
      shuffleQuestions: Boolean(form.shuffleQuestions),
      shuffleOptions: Boolean(form.shuffleOptions),
      showResultImmediately: Boolean(form.showResultImmediately),
      status: form.status,
    };

    upsertTest(payload);
    setEditingId('');
    setForm(emptyTest(form.categoryId));
    setVersion((value) => value + 1);
  }

  function startEdit(test) {
    setEditingId(test.id);
    setForm(test);
  }

  function startAdd(categoryId = categoryFilter) {
    setEditingId('');
    setForm(emptyTest(categoryId));
  }

  function handleDelete(testId) {
    deleteTest(testId);
    setVersion((value) => value + 1);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Manage Tests</h1>
          <p>Create, edit, delete, and configure tests inside each category.</p>
        </div>
      </header>

      <section className="admin-grid two-col">
        <article className="admin-card">
          <div className="list-toolbar">
            <h2>{editingId ? 'Edit Test' : 'Add New Test'}</h2>
            <button type="button" className="btn btn-secondary" onClick={() => startAdd()}>
              Add New Test
            </button>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Category
              <select
                value={form.categoryId}
                onChange={(e) => setForm((current) => ({ ...current, categoryId: e.target.value }))}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Test ID
              <input
                value={form.id}
                onChange={(e) => setForm((current) => ({ ...current, id: e.target.value }))}
                placeholder="english-advanced-1"
              />
            </label>
            <label>
              Test Name
              <input
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="Math Test 1"
              />
            </label>
            <label>
              Test Description
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              />
            </label>
            <div className="grid-2">
              <label>
                Total Questions
                <input type="number" value={form.id ? getQuestionsByTest(form.id).length : 0} readOnly />
              </label>
              <label>
                Total Marks
                <input
                  type="number"
                  value={form.totalMarks}
                  onChange={(e) => setForm((current) => ({ ...current, totalMarks: e.target.value }))}
                />
              </label>
            </div>
            <div className="grid-2">
              <label>
                Negative Marking
                <input
                  type="number"
                  step="0.25"
                  value={form.negativeMarking}
                  onChange={(e) => setForm((current) => ({ ...current, negativeMarking: e.target.value }))}
                />
              </label>
              <label>
                Test Duration (Minutes)
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm((current) => ({ ...current, durationMinutes: e.target.value }))}
                />
              </label>
            </div>
            <div className="grid-2">
              <label>
                Passing Marks
                <input
                  type="number"
                  value={form.passingMarks}
                  onChange={(e) => setForm((current) => ({ ...current, passingMarks: e.target.value }))}
                />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={Boolean(form.shuffleQuestions)}
                onChange={(e) => setForm((current) => ({ ...current, shuffleQuestions: e.target.checked }))}
              />
              Shuffle Questions
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={Boolean(form.shuffleOptions)}
                onChange={(e) => setForm((current) => ({ ...current, shuffleOptions: e.target.checked }))}
              />
              Shuffle Options
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={Boolean(form.showResultImmediately)}
                onChange={(e) => setForm((current) => ({ ...current, showResultImmediately: e.target.checked }))}
              />
              Show Result Immediately
            </label>
            <button type="submit" className="btn btn-primary">
              Save Test
            </button>
          </form>
        </article>

        <article className="admin-card">
          <div className="list-toolbar">
            <h2>Tests</h2>
            <div className="toolbar-actions">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                className="search-input"
                placeholder="Search tests"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.name}</td>
                    <td>{categories.find((category) => category.id === test.categoryId)?.name || test.categoryId}</td>
                    <td>{test.durationMinutes} min</td>
                    <td>{getQuestionsByTest(test.id).length}</td>
                    <td>{test.status}</td>
                    <td className="action-cell">
                      <button type="button" className="link-btn" onClick={() => startEdit(test)}>
                        Edit
                      </button>
                      <button type="button" className="link-btn danger" onClick={() => handleDelete(test.id)}>
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
