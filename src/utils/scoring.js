export function calculateAttemptScore(questions, selectedAnswers) {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let positiveMarks = 0;
  let negativeMarks = 0;

  questions.forEach((question, index) => {
    const selected = selectedAnswers[index];
    if (selected === null || selected === undefined) {
      skipped += 1;
      return;
    }

    if (selected === question.correctAnswer) {
      correct += 1;
      positiveMarks += Number(question.marks ?? 1);
    } else {
      wrong += 1;
      negativeMarks += Number(question.negativeMarks ?? 0.25);
    }
  });

  const totalQuestions = questions.length;
  const attempted = totalQuestions - skipped;
  const finalScore = positiveMarks - negativeMarks;
  const accuracy = attempted ? (correct / attempted) * 100 : 0;

  return {
    totalQuestions,
    attempted,
    skipped,
    correct,
    wrong,
    positiveMarks,
    negativeMarks,
    finalScore,
    accuracy,
  };
}

export function getQuestionStatus(selectedAnswer, correctAnswer) {
  if (selectedAnswer === null || selectedAnswer === undefined) {
    return 'skipped';
  }
  return selectedAnswer === correctAnswer ? 'correct' : 'wrong';
}
