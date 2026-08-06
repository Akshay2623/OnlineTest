import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard.jsx';
import { getCategory, getTest } from '../data/library.js';
import { saveAttempt } from '../services/storage.js';
import { calculateAttemptScore } from '../utils/scoring.js';
import { prepareQuestionsForAttempt } from '../utils/quiz.js';

const ATTEMPT_KEY = 'online-test-portal:last-attempt';

function createAttemptId(categoryId, testId) {
  const suffix =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${categoryId}-${testId}-${suffix}`;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function TestPage() {
  const navigate = useNavigate();
  const { categoryId, testId } = useParams();
  const category = useMemo(() => getCategory(categoryId), [categoryId]);
  const test = useMemo(() => getTest(categoryId, testId), [categoryId, testId]);
  const [studentName, setStudentName] = useState(localStorage.getItem('online-test-portal:last-student') || 'Guest');
  const [preparedQuestions, setPreparedQuestions] = useState([]);
  const questions = preparedQuestions;
  const totalQuestions = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [attemptId, setAttemptId] = useState('');
  const [secondsLeft, setSecondsLeft] = useState((test?.durationMinutes ?? 10) * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [startedAt, setStartedAt] = useState('');
  const submittedRef = useRef(false);
  const currentQuestion = preparedQuestions[currentIndex];

  useEffect(() => {
    if (!test) {
      return;
    }

    const id = createAttemptId(categoryId, testId);
    const questionSet = prepareQuestionsForAttempt(test.questions, {
      shuffleQuestions: Boolean(test.settings?.shuffleQuestions),
      shuffleOptions: Boolean(test.settings?.shuffleOptions),
    });
    const answers = Array(questionSet.length).fill(null);
    setAttemptId(id);
    setPreparedQuestions(questionSet);
    setSelectedAnswers(answers);
    setCurrentIndex(0);
    setSecondsLeft((test.durationMinutes ?? 10) * 60);
    setStartedAt(new Date().toISOString());
    submittedRef.current = false;
    localStorage.setItem(
      ATTEMPT_KEY,
      JSON.stringify({
        attemptId: id,
        categoryId,
        testId,
        selectedAnswers: answers,
      }),
    );
    localStorage.setItem('online-test-portal:last-student', studentName);
  }, [categoryId, testId, test?.id, test?.durationMinutes]);

  useEffect(() => {
    if (!attemptId) {
      return undefined;
    }

    localStorage.setItem(
      ATTEMPT_KEY,
      JSON.stringify({
        attemptId,
        categoryId,
        testId,
        selectedAnswers,
      }),
    );
  }, [attemptId, categoryId, testId, selectedAnswers]);

  useEffect(() => {
    if (!test) {
      return undefined;
    }

    if (secondsLeft <= 0 && !submittedRef.current) {
      submitTest(true);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft, test?.id]);

  const stats = useMemo(() => {
    const attempted = selectedAnswers.filter((answer) => answer !== null).length;
    return {
      attempted,
      skipped: totalQuestions - attempted,
    };
  }, [selectedAnswers, totalQuestions]);

  if (!category || !test) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h2>Test not found</h2>
          <p>The requested test could not be loaded.</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h2>Loading test...</h2>
          <p>Preparing questions and test settings.</p>
        </div>
      </div>
    );
  }

  function updateAnswer(answerIndex) {
    setSelectedAnswers((current) =>
      current.map((item, index) => (index === currentIndex ? answerIndex : item)),
    );
  }

  function goPrevious() {
    setCurrentIndex((value) => Math.max(0, value - 1));
  }

  function goNext() {
    setCurrentIndex((value) => Math.min(totalQuestions - 1, value + 1));
  }

  function submitTest(isAutoSubmit = false) {
    if (submittedRef.current) {
      return;
    }
    submittedRef.current = true;

    const resolvedAnswers = selectedAnswers;
    const summary = calculateAttemptScore(questions, resolvedAnswers);
    const finishedAt = new Date();
    const startAt = startedAt ? new Date(startedAt) : finishedAt;
    const durationTakenSeconds = Math.max(0, Math.round((finishedAt.getTime() - startAt.getTime()) / 1000));
    const durationTakenLabel = `${Math.floor(durationTakenSeconds / 60)}m ${durationTakenSeconds % 60}s`;
    const submittedAt = finishedAt.toISOString().slice(0, 10);

    const result = {
      id: attemptId,
      attemptId,
      categoryId,
      categoryTitle: category.title,
      categoryName: category.title,
      testId,
      testTitle: test.title,
      testName: test.title,
      studentName,
      submittedAt,
      startTime: startedAt,
      endTime: finishedAt.toISOString(),
      durationTakenSeconds,
      durationTakenLabel,
      durationMinutes: test.durationMinutes,
      questions,
      selectedAnswers: resolvedAnswers,
      summary,
    };

    saveAttempt(result);
    localStorage.removeItem(ATTEMPT_KEY);
    localStorage.setItem('online-test-portal:last-student', studentName);
    navigate(`/result/${attemptId}`, { state: { result, autoSubmit: isAutoSubmit } });
  }

  return (
    <div className="page">
      <section className="container test-layout">
        <div className="test-main">
          <div className="test-topbar">
            <div>
              <span className="eyebrow">{category.title}</span>
              <h1>{test.title}</h1>
            </div>
            <div className="timer-pill">Time Left: {formatTime(secondsLeft)}</div>
          </div>

          <div className="student-name-row">
            <label>
              Student Name
              <input
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  localStorage.setItem('online-test-portal:last-student', e.target.value);
                }}
              />
            </label>
          </div>

          <QuestionCard
            currentQuestionNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
            question={currentQuestion}
            selectedAnswer={selectedAnswers[currentIndex]}
            onSelectAnswer={updateAnswer}
            onPrevious={goPrevious}
            onNext={goNext}
            onSubmit={() => setShowConfirm(true)}
            isLastQuestion={currentIndex === totalQuestions - 1}
          />
        </div>

        <aside className="test-sidebar">
          <div className="sidebar-card">
            <h3>Question Palette</h3>
            <div className="palette-grid">
              {questions.map((question, index) => {
                const isCurrent = index === currentIndex;
                const isAnswered = selectedAnswers[index] !== null;
                return (
                  <button
                    key={question.id}
                    type="button"
                    className={`palette-item ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Progress</h3>
            <p>
              Attempted: <strong>{stats.attempted}</strong>
            </p>
            <p>
              Skipped: <strong>{stats.skipped}</strong>
            </p>
            <div className="progress-bar">
              <span style={{ width: `${(stats.attempted / totalQuestions) * 100}%` }} />
            </div>
          </div>
        </aside>
      </section>

      {showConfirm && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal">
            <h3>Submit this test?</h3>
            <p>You can review the result immediately after submission.</p>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={() => submitTest(false)}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
