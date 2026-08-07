import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ResultCard from '../components/ResultCard.jsx';
import { getAttemptById, getAttemptByIdRemote } from '../services/storage.js';
import { getQuestionStatus } from '../utils/scoring.js';

function getLetter(index) {
  return ['A', 'B', 'C', 'D'][index] ?? '?';
}

function PieChart({ correct, wrong, skipped }) {
  const total = correct + wrong + skipped || 1;
  const correctPct = (correct / total) * 100;
  const wrongPct = (wrong / total) * 100;

  return (
    <div
      className="pie-chart"
      style={{
        background: `conic-gradient(#1f9d66 0 ${correctPct}%, #e24a4a ${correctPct}% ${correctPct + wrongPct}%, #b6becd ${correctPct + wrongPct}% 100%)`,
      }}
    >
      <div className="pie-chart-center">
        <strong>{total}</strong>
        <span>Questions</span>
        <small>
          C {correct} | W {wrong} | S {skipped}
        </small>
      </div>
      <div className="chart-legend">
        <span>
          <i className="legend-dot green" />
          Correct
        </span>
        <span>
          <i className="legend-dot red" />
          Wrong
        </span>
        <span>
          <i className="legend-dot gray" />
          Skipped
        </span>
      </div>
    </div>
  );
}

function BarChart({ positiveMarks, negativeMarks, finalScore }) {
  const maxValue = Math.max(1, positiveMarks, negativeMarks, Math.abs(finalScore));
  const bars = [
    { label: 'Positive', value: positiveMarks, color: 'var(--success)' },
    { label: 'Negative', value: negativeMarks, color: 'var(--danger)' },
    { label: 'Final', value: finalScore, color: 'var(--primary)' },
  ];

  return (
    <div className="bar-chart">
      {bars.map((bar) => (
        <div key={bar.label} className="bar-column">
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${(Math.abs(bar.value) / maxValue) * 100}%`, background: bar.color }}
            />
          </div>
          <strong>{bar.value.toFixed(2)}</strong>
          <span>{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [result, setResult] = useState(location.state?.result ?? getAttemptById(attemptId));
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    let alive = true;

    async function loadRemoteResult() {
      if (result || !attemptId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const remoteResult = await getAttemptByIdRemote(attemptId);
      if (alive && remoteResult) {
        setResult(remoteResult);
      }
      if (alive) {
        setLoading(false);
      }
    }

    loadRemoteResult();

    return () => {
      alive = false;
    };
  }, [attemptId, result]);

  if (loading) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h2>Loading result...</h2>
          <p>Please wait while we fetch the attempt.</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h2>No result found</h2>
          <p>We could not locate this attempt result.</p>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const { summary, questions, selectedAnswers } = result;
  const progress = `${Math.max(0, Math.min(100, (summary.correct / summary.totalQuestions) * 100))}%`;
  const attemptDate = result.submittedAt || new Date().toISOString().slice(0, 10);

  return (
    <div className="page">
      <section className="container section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Result</span>
            <h1>{result.testName || result.testTitle}</h1>
            <p>
              {result.studentName || 'Guest'} - {result.categoryName || result.categoryTitle}
            </p>
          </div>
          <div className="result-actions">
            <Link to="/" className="btn btn-secondary">
              Home
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/category/${result.categoryId}/test/${result.testId}`)}
            >
              Retake Test
            </button>
          </div>
        </div>

        <div className="result-metadata">
          <span><strong>Date:</strong> {attemptDate}</span>
          <span><strong>Start:</strong> {result.startTime ? new Date(result.startTime).toLocaleTimeString() : '-'}</span>
          <span><strong>End:</strong> {result.endTime ? new Date(result.endTime).toLocaleTimeString() : '-'}</span>
          <span><strong>Duration Taken:</strong> {result.durationTakenLabel || '-'}</span>
        </div>

        <div className="result-grid">
          <ResultCard label="Total Questions" value={summary.totalQuestions} tone="primary" />
          <ResultCard label="Attempted Questions" value={summary.attempted} tone="success" />
          <ResultCard label="Unattempted Questions" value={summary.skipped} tone="muted" />
          <ResultCard label="Correct Answers" value={summary.correct} tone="success" />
          <ResultCard label="Wrong Answers" value={summary.wrong} tone="danger" />
          <ResultCard label="Accuracy" value={`${summary.accuracy.toFixed(2)}%`} tone="primary" />
          <ResultCard label="Negative Marks" value={summary.negativeMarks.toFixed(2)} tone="danger" />
          <ResultCard label="Final Score" value={summary.finalScore.toFixed(2)} tone="success" />
        </div>

        <div className="analytics-grid">
          <article className="analytics-card">
            <div className="card-heading">
              <h3>Performance Progress</h3>
              <span>{summary.correct}/{summary.totalQuestions} correct</span>
            </div>
            <div className="progress-bar large">
              <span style={{ width: progress }} />
            </div>
            <div className="score-line">
              <span>Positive: {summary.positiveMarks.toFixed(2)}</span>
              <span>Negative: {summary.negativeMarks.toFixed(2)}</span>
              <span>Final: {summary.finalScore.toFixed(2)}</span>
            </div>
          </article>

          <article className="analytics-card">
            <div className="card-heading">
              <h3>Pie Chart</h3>
              <span>Question outcome split</span>
            </div>
            <PieChart correct={summary.correct} wrong={summary.wrong} skipped={summary.skipped} />
          </article>

          <article className="analytics-card">
            <div className="card-heading">
              <h3>Bar Chart</h3>
              <span>Marks summary</span>
            </div>
            <BarChart
              positiveMarks={summary.positiveMarks}
              negativeMarks={summary.negativeMarks}
              finalScore={summary.finalScore}
            />
          </article>
        </div>

        <article className="analytics-card review-card">
          <div className="card-heading">
            <h3>Question-wise Review</h3>
            <span>Correct answer is green. Your answer is blue.</span>
          </div>
          <div className="review-list">
            {questions.map((question, index) => {
              const selectedAnswer = selectedAnswers[index];
              const outcome = getQuestionStatus(selectedAnswer, question.correctAnswer);
              return (
                <div className={`review-item ${outcome}`} key={question.id}>
                  <div className="review-header">
                    <strong>Question {index + 1}</strong>
                    <span className={`status-badge ${outcome}`}>
                      {outcome === 'correct' ? 'Correct' : outcome === 'wrong' ? 'Wrong' : 'Skipped'}
                    </span>
                  </div>
                  <p className="review-question">{question.question}</p>
                  <div className="review-options">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selectedAnswer === optionIndex;
                      const isCorrect = question.correctAnswer === optionIndex;
                      return (
                        <div
                          key={`${question.id}-${optionIndex}`}
                          className={`review-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''}`}
                        >
                          <span className="review-letter">{getLetter(optionIndex)}</span>
                          <span className="review-text">{option}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
