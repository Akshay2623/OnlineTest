import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAttempts, getCategories, getQuestions, getTests } from '../services/storage.js';

function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

function PieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let cursor = 0;
  const colors = ['#2563eb', '#1f9d66', '#e24a4a', '#d97706'];
  const segments = data.map((item, index) => {
    const start = cursor;
    const angle = (item.value / total) * 360;
    cursor += angle;
    return {
      ...item,
      start,
      end: cursor,
      color: colors[index % colors.length],
    };
  });

  const background = `conic-gradient(${segments
    .map((segment) => `${segment.color} ${segment.start}deg ${segment.end}deg`)
    .join(', ')})`;

  return (
    <div className="admin-pie" style={{ background }}>
      <div className="admin-pie-center">
        <strong>{total}</strong>
        <span>Attempts</span>
      </div>
      <div className="chart-legend">
        {segments.map((segment) => (
          <span key={segment.label}>
            <i className="legend-dot" style={{ background: segment.color }} />
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <div className="admin-bar-chart">
      {data.map((item) => (
        <div className="bar-column" key={item.label}>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${(item.value / max) * 100}%`, background: item.color }}
            />
          </div>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ points }) {
  const width = 560;
  const height = 220;
  const padding = 24;
  const values = points.map((point) => point.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const scaleY = (value) => height - padding - ((value - min) / (max - min || 1)) * (height - padding * 2);
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${padding + index * stepX} ${scaleY(point.value)}`)
    .join(' ');

  return (
    <div className="admin-line">
      <svg viewBox={`0 0 ${width} ${height}`} className="line-svg">
        <path d={`${path}`} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle cx={padding + index * stepX} cy={scaleY(point.value)} r="5" fill="#1f9d66" />
            <text x={padding + index * stepX} y={height - 8} textAnchor="middle" className="line-label">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AdminDashboard() {
  const categories = getCategories();
  const tests = getTests();
  const questions = getQuestions();
  const attempts = getAttempts();

  const stats = useMemo(() => {
    const averageScore = attempts.length
      ? attempts.reduce((sum, attempt) => sum + Number(attempt.summary?.finalScore ?? 0), 0) / attempts.length
      : 0;
    const scores = attempts.map((attempt) => Number(attempt.summary?.finalScore ?? 0));
    const highestScore = scores.length ? Math.max(...scores) : 0;
    const lowestScore = scores.length ? Math.min(...scores) : 0;
    const today = new Date().toISOString().slice(0, 10);
    const todayAttempts = attempts.filter((attempt) => (attempt.submittedAt || '').slice(0, 10) === today).length;

    return {
      averageScore,
      highestScore,
      lowestScore,
      todayAttempts,
    };
  }, [attempts]);

  const pieData = [
    { label: 'Correct', value: attempts.reduce((sum, item) => sum + Number(item.summary?.correct ?? 0), 0) },
    { label: 'Wrong', value: attempts.reduce((sum, item) => sum + Number(item.summary?.wrong ?? 0), 0) },
    { label: 'Skipped', value: attempts.reduce((sum, item) => sum + Number(item.summary?.skipped ?? 0), 0) },
  ];

  const barData = [
    { label: 'Categories', value: categories.length, color: '#2563eb' },
    { label: 'Tests', value: tests.length, color: '#1f9d66' },
    { label: 'Questions', value: questions.length, color: '#d97706' },
    { label: 'Attempts', value: attempts.length, color: '#e24a4a' },
  ];

  const lineData = attempts
    .slice(0, 8)
    .reverse()
    .map((attempt, index) => ({
      label: String(index + 1),
      value: Number(attempt.summary?.finalScore ?? 0),
    }));

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Monitor tests, questions, categories, and student attempts in one place.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/questions">
          Add Question
        </Link>
      </header>

      <section className="stat-grid">
        <StatCard label="Total Categories" value={categories.length} />
        <StatCard label="Total Tests" value={tests.length} />
        <StatCard label="Total Questions" value={questions.length} />
        <StatCard label="Total Attempts" value={attempts.length} />
        <StatCard label="Average Score" value={stats.averageScore.toFixed(2)} />
        <StatCard label="Highest Score" value={stats.highestScore.toFixed(2)} />
        <StatCard label="Lowest Score" value={stats.lowestScore.toFixed(2)} />
        <StatCard label="Today's Attempts" value={stats.todayAttempts} />
      </section>

      <section className="admin-grid">
        <article className="admin-card">
          <div className="section-heading slim">
            <h2>Pie Chart</h2>
            <p>Outcome split across all stored attempts.</p>
          </div>
          <PieChart data={pieData} />
        </article>

        <article className="admin-card">
          <div className="section-heading slim">
            <h2>Bar Chart</h2>
            <p>Content inventory across the portal.</p>
          </div>
          <BarChart data={barData} />
        </article>

        <article className="admin-card full">
          <div className="section-heading slim">
            <h2>Line Chart</h2>
            <p>Recent attempt scores.</p>
          </div>
          <LineChart points={lineData.length ? lineData : [{ label: '1', value: 0 }]} />
        </article>
      </section>
    </div>
  );
}
