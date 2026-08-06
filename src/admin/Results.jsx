import React, { useMemo, useState } from 'react';
import { deleteAttempt, getAttempts, getCategories, getTestsByCategory } from '../services/storage.js';
import { downloadExcel } from '../services/export.js';

function ResultModal({ attempt, onClose }) {
  if (!attempt) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal large">
        <div className="modal-header">
          <div>
            <h2>{attempt.studentName}</h2>
            <p>
              {attempt.categoryName} - {attempt.testName}
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="detail-grid">
          <div><strong>Attempt Date:</strong> {attempt.submittedAt}</div>
          <div><strong>Start Time:</strong> {attempt.startTime}</div>
          <div><strong>End Time:</strong> {attempt.endTime}</div>
          <div><strong>Duration Taken:</strong> {attempt.durationTakenLabel}</div>
          <div><strong>Correct:</strong> {attempt.summary.correct}</div>
          <div><strong>Wrong:</strong> {attempt.summary.wrong}</div>
          <div><strong>Skipped:</strong> {attempt.summary.skipped}</div>
          <div><strong>Final Score:</strong> {attempt.summary.finalScore.toFixed(2)}</div>
          <div><strong>Accuracy:</strong> {attempt.summary.accuracy.toFixed(2)}%</div>
        </div>

        <div className="review-list modal-review">
          {attempt.questions.map((question, index) => {
            const selected = attempt.selectedAnswers[index];
            const correct = question.correctAnswer;
            const status = selected === null || selected === undefined ? 'skipped' : selected === correct ? 'correct' : 'wrong';
            return (
              <div key={question.id} className={`review-item ${status}`}>
                <div className="review-header">
                  <strong>Question {index + 1}</strong>
                  <span className={`status-badge ${status}`}>
                    {status === 'correct' ? 'Correct' : status === 'wrong' ? 'Wrong' : 'Skipped'}
                  </span>
                </div>
                <p className="review-question">{question.question}</p>
                <div className="review-options">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={`${question.id}-${optionIndex}`}
                      className={`review-option ${selected === optionIndex ? 'selected' : ''} ${correct === optionIndex ? 'correct' : ''}`}
                    >
                      <span className="review-letter">{['A', 'B', 'C', 'D'][optionIndex]}</span>
                      <span className="review-text">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminResults() {
  const categories = getCategories();
  const [search, setSearch] = useState('');
  const [testFilter, setTestFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [version, setVersion] = useState(0);
  const attempts = useMemo(() => getAttempts(), [version]);

  const filtered = useMemo(() => {
    return attempts.filter((attempt) => {
      const matchesSearch = [attempt.studentName, attempt.testName, attempt.categoryName]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesTest = !testFilter || attempt.testId === testFilter;
      const matchesDate = !dateFilter || (attempt.submittedAt || '').slice(0, 10) === dateFilter;
      return matchesSearch && matchesTest && matchesDate;
    });
  }, [attempts, search, testFilter, dateFilter]);

  function handleExport() {
    downloadExcel(
      'student-results.xlsx',
      filtered.map((attempt) => ({
        Student: attempt.studentName,
        Test: attempt.testName,
        Category: attempt.categoryName,
        Date: attempt.submittedAt,
        'Correct Answers': attempt.summary.correct,
        'Wrong Answers': attempt.summary.wrong,
        Skipped: attempt.summary.skipped,
        'Final Score': Number(attempt.summary.finalScore).toFixed(2),
        Accuracy: Number(attempt.summary.accuracy).toFixed(2),
      })),
    );
  }

  function handleDelete(attemptId) {
    deleteAttempt(attemptId);
    if (selectedAttempt?.id === attemptId) {
      setSelectedAttempt(null);
    }
    setVersion((value) => value + 1);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Student Results</h1>
          <p>Search attempts, open full results, delete records, and export to Excel.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleExport}>
          Export Results to Excel
        </button>
      </header>

      <section className="admin-card">
        <div className="list-toolbar">
          <input
            className="search-input"
            placeholder="Search student or test"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="toolbar-actions">
            <select value={testFilter} onChange={(e) => setTestFilter(e.target.value)}>
              <option value="">All Tests</option>
              {categories.flatMap((category) =>
                getTestsByCategory(category.id).map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.name}
                  </option>
                )),
              )}
            </select>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Test Name</th>
                <th>Date</th>
                <th>Duration Taken</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Skipped</th>
                <th>Final Score</th>
                <th>Accuracy %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((attempt) => (
                <tr key={attempt.id}>
                  <td>{attempt.studentName}</td>
                  <td>{attempt.testName}</td>
                  <td>{attempt.submittedAt}</td>
                  <td>{attempt.durationTakenLabel}</td>
                  <td>{attempt.summary.correct}</td>
                  <td>{attempt.summary.wrong}</td>
                  <td>{attempt.summary.skipped}</td>
                  <td>{Number(attempt.summary.finalScore).toFixed(2)}</td>
                  <td>{Number(attempt.summary.accuracy).toFixed(2)}</td>
                  <td className="action-cell">
                    <button type="button" className="link-btn" onClick={() => setSelectedAttempt(attempt)}>
                      View Full Result
                    </button>
                    <button type="button" className="link-btn danger" onClick={() => handleDelete(attempt.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedAttempt ? <ResultModal attempt={selectedAttempt} onClose={() => setSelectedAttempt(null)} /> : null}
    </div>
  );
}
