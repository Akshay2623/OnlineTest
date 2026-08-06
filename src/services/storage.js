import { seedDb } from '../data/seedData.js';

const DB_KEY = 'online-test-portal:db';
const ATTEMPTS_KEY = 'online-test-portal:attempts';
const RESULT_PREFIX = 'online-test-portal:result:';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return clone(fallback);
  }

  try {
    return JSON.parse(raw);
  } catch {
    return clone(fallback);
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureDb() {
  const existing = loadJson(DB_KEY, null);
  if (existing?.categories && existing?.tests && existing?.questions) {
    return existing;
  }

  saveJson(DB_KEY, seedDb);
  if (!localStorage.getItem(ATTEMPTS_KEY)) {
    saveJson(ATTEMPTS_KEY, []);
  }
  return clone(seedDb);
}

export function getDb() {
  return ensureDb();
}

export function saveDb(nextDb) {
  saveJson(DB_KEY, nextDb);
}

export function resetDb() {
  saveJson(DB_KEY, seedDb);
  saveJson(ATTEMPTS_KEY, []);
  Object.keys(localStorage)
    .filter((key) => key.startsWith(RESULT_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}

export function getCategories() {
  return getDb().categories;
}

export function getActiveCategories() {
  return getCategories().filter((category) => category.active !== false);
}

export function getCategoryById(categoryId) {
  return getCategories().find((category) => category.id === categoryId);
}

export function getTests() {
  return getDb().tests;
}

export function getTestsByCategory(categoryId) {
  return getTests().filter((test) => test.categoryId === categoryId);
}

export function getTestById(testId) {
  return getTests().find((test) => test.id === testId);
}

export function getQuestions() {
  return getDb().questions;
}

export function getQuestionsByTest(testId) {
  return getQuestions().filter((question) => question.testId === testId);
}

export function getActiveTestForStudent(categoryId, testId) {
  const test = getTestById(testId);
  if (!test || test.categoryId !== categoryId || test.status === 'inactive') {
    return null;
  }
  const questions = getQuestionsByTest(test.id);
  return { ...test, questions };
}

export function upsertCategory(category) {
  const db = getDb();
  const index = db.categories.findIndex((item) => item.id === category.id);
  if (index >= 0) {
    db.categories[index] = category;
  } else {
    db.categories.push(category);
  }
  saveDb(db);
  return category;
}

export function deleteCategory(categoryId) {
  const db = getDb();
  db.categories = db.categories.filter((category) => category.id !== categoryId);
  const testIds = db.tests.filter((test) => test.categoryId === categoryId).map((test) => test.id);
  db.tests = db.tests.filter((test) => test.categoryId !== categoryId);
  db.questions = db.questions.filter((question) => !testIds.includes(question.testId));
  saveDb(db);
}

export function upsertTest(test) {
  const db = getDb();
  const index = db.tests.findIndex((item) => item.id === test.id);
  if (index >= 0) {
    db.tests[index] = test;
  } else {
    db.tests.push(test);
  }
  saveDb(db);
  return test;
}

export function deleteTest(testId) {
  const db = getDb();
  db.tests = db.tests.filter((test) => test.id !== testId);
  db.questions = db.questions.filter((question) => question.testId !== testId);
  saveDb(db);
}

export function upsertQuestion(question) {
  const db = getDb();
  const index = db.questions.findIndex((item) => item.id === question.id);
  if (index >= 0) {
    db.questions[index] = question;
  } else {
    db.questions.push(question);
  }
  saveDb(db);
  return question;
}

export function deleteQuestion(questionId) {
  const db = getDb();
  db.questions = db.questions.filter((question) => question.id !== questionId);
  saveDb(db);
}

export function bulkUpsertQuestions(questions) {
  const db = getDb();
  const map = new Map(db.questions.map((question) => [question.id, question]));
  questions.forEach((question) => map.set(question.id, question));
  db.questions = Array.from(map.values());
  saveDb(db);
}

export function saveAttempt(attempt) {
  const attempts = loadJson(ATTEMPTS_KEY, []);
  const index = attempts.findIndex((item) => item.id === attempt.id);
  if (index >= 0) {
    attempts[index] = attempt;
  } else {
    attempts.unshift(attempt);
  }
  saveJson(ATTEMPTS_KEY, attempts);
  saveJson(`${RESULT_PREFIX}${attempt.id}`, attempt);
  return attempt;
}

export function getAttempts() {
  return loadJson(ATTEMPTS_KEY, []);
}

export function deleteAttempt(attemptId) {
  const attempts = loadJson(ATTEMPTS_KEY, []).filter((attempt) => attempt.id !== attemptId);
  saveJson(ATTEMPTS_KEY, attempts);
  localStorage.removeItem(`${RESULT_PREFIX}${attemptId}`);
}

export function getAttemptById(attemptId) {
  return loadJson(`${RESULT_PREFIX}${attemptId}`, null);
}

export function saveSettings(settings) {
  const db = getDb();
  db.settings = { ...db.settings, ...settings };
  saveDb(db);
  window.dispatchEvent(new Event('online-test-portal:settings-changed'));
}

export function getSettings() {
  return getDb().settings || {};
}
