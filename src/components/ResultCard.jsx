import React from 'react';

export default function ResultCard({ label, value, tone = 'default' }) {
  return (
    <article className={`result-card ${tone}`}>
      <span className="result-label">{label}</span>
      <strong className="result-value">{value}</strong>
    </article>
  );
}
