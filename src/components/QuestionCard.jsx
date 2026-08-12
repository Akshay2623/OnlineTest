import React from 'react';

const optionLetters = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  currentQuestionNumber,
  totalQuestions,
  question,
  selectedAnswer,
  onSelectAnswer,
  onPrevious,
  onNext,
  onSubmit,
  isLastQuestion,
}) {
  return (
    <section className="question-card">
      <div className="question-card-top">
        <div>
          <span className="question-kicker">Question {currentQuestionNumber}</span>
          {question.passage ? <div className="question-passage">{question.passage}</div> : null}
          <h2>{question.question}</h2>
          {question.image ? <img className="question-image" src={question.image} alt="" /> : null}
        </div>
        <div className="question-count">
          {currentQuestionNumber} / {totalQuestions}
        </div>
      </div>

      <fieldset className="options-group">
        <legend className="sr-only">Select one answer</legend>
        {question.options.map((option, index) => {
          const inputId = `question-${question.id}-option-${index}`;
          const isSelected = selectedAnswer === index;

          return (
            <label
              key={inputId}
              htmlFor={inputId}
              className={`option-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectAnswer(index)}
            >
              <input
                id={inputId}
                type="radio"
                name={`question-${question.id}`}
                checked={isSelected}
                onChange={() => onSelectAnswer(index)}
              />
              <span className="option-letter">{optionLetters[index]}</span>
              <span className="option-text">{option}</span>
            </label>
          );
        })}
      </fieldset>

      <div className="question-actions">
        <button type="button" className="btn btn-secondary" onClick={onPrevious} disabled={currentQuestionNumber === 1}>
          Previous
        </button>
        {!isLastQuestion ? (
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Next
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onSubmit}>
            Submit Test
          </button>
        )}
      </div>
    </section>
  );
}
