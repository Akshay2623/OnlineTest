import React, { useMemo, useRef, useState } from 'react';
import {
  bulkUpsertQuestions,
  deleteQuestion,
  getCategories,
  getQuestions,
  getQuestionsByTest,
  getTestsByCategory,
  upsertQuestion,
} from '../services/storage.js';
import { downloadJson } from '../services/export.js';

const optionLabels = ['A', 'B', 'C', 'D'];

function emptyQuestion(categoryId = '', testId = '') {
  return {
    id: '',
    categoryId,
    testId,
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1,
    negativeMarks: 0.25,
    image: '',
    explanation: '',
  };
}

function buildQuestionId(categoryId, testId) {
  return `${categoryId}-${testId}-${Date.now()}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export default function ManageQuestions() {
  const categories = getCategories();
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [testId, setTestId] = useState(getTestsByCategory(categories[0]?.id || '')[0]?.id || '');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyQuestion(categoryId, testId));
  const [version, setVersion] = useState(0);
  const importRef = useRef(null);

  const tests = getTestsByCategory(categoryId);
  const questions = useMemo(() => {
    const list = getQuestionsByTest(testId);
    return list.filter((question) =>
      [question.question, question.explanation, question.id]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [testId, search, version]);

  function resetForm(nextCategoryId = categoryId, nextTestId = testId) {
    setEditingId('');
    setForm(emptyQuestion(nextCategoryId, nextTestId));
  }

  function handleCategoryChange(nextCategoryId) {
    const nextTests = getTestsByCategory(nextCategoryId);
    const nextTestId = nextTests[0]?.id || '';
    setCategoryId(nextCategoryId);
    setTestId(nextTestId);
    resetForm(nextCategoryId, nextTestId);
  }

  function handleTestChange(nextTestId) {
    setTestId(nextTestId);
    resetForm(categoryId, nextTestId);
  }

  async function handleImageUpload(file) {
    if (!file) {
      return;
    }
    const image = await readFileAsDataUrl(file);
    setForm((current) => ({ ...current, image }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.question.trim() || !form.testId) {
      return;
    }

    const payload = {
      ...form,
      id: editingId ? editingId : form.id || buildQuestionId(categoryId, testId),
      categoryId,
      testId,
      question: form.question.trim(),
      options: form.options.map((option) => option.trim()),
      correctAnswer: Number(form.correctAnswer),
      marks: Number(form.marks) || 1,
      negativeMarks: Number(form.negativeMarks) || 0.25,
    };

    upsertQuestion(payload);
    resetForm(categoryId, testId);
    setVersion((value) => value + 1);
  }

  function startEdit(question) {
    setEditingId(question.id);
    setForm(question);
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    const parsed = JSON.parse(text);
    const incoming = Array.isArray(parsed) ? parsed : parsed.questions || [];
    const prepared = incoming.map((question, index) => ({
      id: question.id || buildQuestionId(categoryId, testId) + `-${index + 1}`,
      categoryId: question.categoryId || categoryId,
      testId: question.testId || testId,
      question: question.question || '',
      options: (question.options || ['', '', '', '']).slice(0, 4).map((option) => String(option)),
      correctAnswer: Number(question.correctAnswer ?? 0),
      marks: Number(question.marks ?? 1),
      negativeMarks: Number(question.negativeMarks ?? 0.25),
      image: question.image || '',
      explanation: question.explanation || '',
    }));
    bulkUpsertQuestions(prepared);
    resetForm(categoryId, testId);
    setVersion((value) => value + 1);
    event.target.value = '';
  }

  function handleExport() {
    downloadJson(`${categoryId}-${testId}-questions.json`, getQuestionsByTest(testId));
  }

  function handleDelete(questionId) {
    deleteQuestion(questionId);
    setVersion((value) => value + 1);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Manage Questions</h1>
          <p>Add unlimited questions, import JSON, export JSON, and edit every field.</p>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="btn btn-secondary" onClick={handleExport}>
            Export JSON
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => importRef.current?.click()}>
            Import JSON
          </button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={handleImport} />
        </div>
      </header>

      <section className="admin-grid two-col">
        <article className="admin-card">
          <h2>{editingId ? 'Edit Question' : 'Add Question'}</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="grid-2">
              <label>
                Category
                <select value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Test
                <select value={testId} onChange={(e) => handleTestChange(e.target.value)}>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Question
              <textarea
                rows="4"
                value={form.question}
                onChange={(e) => setForm((current) => ({ ...current, question: e.target.value }))}
              />
            </label>
            <div className="grid-2">
              {optionLabels.map((label, index) => (
                <label key={label}>
                  Option {label}
                  <input
                    value={form.options[index]}
                    onChange={(e) =>
                      setForm((current) => {
                        const options = [...current.options];
                        options[index] = e.target.value;
                        return { ...current, options };
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <div className="grid-2">
              <label>
                Correct Answer
                <select
                  value={form.correctAnswer}
                  onChange={(e) => setForm((current) => ({ ...current, correctAnswer: Number(e.target.value) }))}
                >
                  {optionLabels.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Marks
                <input
                  type="number"
                  step="0.25"
                  value={form.marks}
                  onChange={(e) => setForm((current) => ({ ...current, marks: e.target.value }))}
                />
              </label>
            </div>
            <label>
              Negative Marks
              <input
                type="number"
                step="0.25"
                value={form.negativeMarks}
                onChange={(e) => setForm((current) => ({ ...current, negativeMarks: e.target.value }))}
              />
            </label>
            <label>
              Question Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />
            </label>
            {form.image ? <img className="question-preview" src={form.image} alt="Question preview" /> : null}
            <label>
              Explanation
              <textarea
                rows="3"
                value={form.explanation}
                onChange={(e) => setForm((current) => ({ ...current, explanation: e.target.value }))}
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Save Question
            </button>
          </form>
        </article>

        <article className="admin-card">
          <div className="list-toolbar">
            <h2>Questions</h2>
            <input
              className="search-input"
              placeholder="Search questions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Correct</th>
                  <th>Marks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id}>
                    <td>{question.question}</td>
                    <td>{optionLabels[question.correctAnswer] || 'A'}</td>
                    <td>{question.marks}</td>
                    <td className="action-cell">
                      <button type="button" className="link-btn" onClick={() => startEdit(question)}>
                        Edit
                      </button>
                      <button type="button" className="link-btn danger" onClick={() => handleDelete(question.id)}>
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
