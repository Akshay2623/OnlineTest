import {
  getActiveCategories,
  getActiveTestForStudent,
  getCategoryById,
  getQuestionsByTest,
  getTestsByCategory,
} from '../services/storage.js';

export function getAllCategories() {
  return getActiveCategories().map((category) => ({
    id: category.id,
    title: category.name,
    description: category.description,
    icon: category.icon,
    accent: category.id,
    tests: getTestsByCategoryForStudent(category.id),
  }));
}

export function getCategory(categoryId) {
  const category = getCategoryById(categoryId);
  if (!category || category.active === false) {
    return null;
  }

  return {
    id: category.id,
    title: category.name,
    description: category.description,
    icon: category.icon,
    accent: category.id,
    tests: getTestsByCategoryForStudent(category.id),
  };
}

export function getTest(categoryId, testId) {
  const test = getActiveTestForStudent(categoryId, testId);
  if (!test) {
    return null;
  }

  return {
    id: test.id,
    title: test.name,
    description: test.description,
    durationMinutes: test.durationMinutes,
    questions: test.questions,
    settings: test,
  };
}

export function getTestsByCategoryForStudent(categoryId) {
  return getCategoryById(categoryId)?.active === false
    ? []
    : getTestsByCategory(categoryId)
    .filter((test) => test.status !== 'inactive')
    .map((test) => ({
      id: test.id,
      title: test.name,
      durationMinutes: test.durationMinutes,
      questions: getQuestionsByTest(test.id),
    }));
}
