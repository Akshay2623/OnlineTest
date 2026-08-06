export function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function prepareQuestionsForAttempt(questions, { shuffleQuestions = false, shuffleOptions = false } = {}) {
  const baseQuestions = shuffleQuestions ? shuffleArray(questions) : [...questions];

  return baseQuestions.map((question) => {
    if (!shuffleOptions) {
      return { ...question };
    }

    const options = question.options.map((option, index) => ({ option, originalIndex: index }));
    const shuffled = shuffleArray(options);
    const correctAnswer = shuffled.findIndex((item) => item.originalIndex === question.correctAnswer);

    return {
      ...question,
      options: shuffled.map((item) => item.option),
      correctAnswer,
    };
  });
}
