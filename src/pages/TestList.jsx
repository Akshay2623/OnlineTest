import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCategory } from '../data/library.js';

export default function TestList() {
  const { categoryId } = useParams();
  const category = getCategory(categoryId);

  if (!category) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h2>Category not found</h2>
          <p>The requested test category does not exist.</p>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="container section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Category</span>
            <h1>{category.title}</h1>
          </div>
          <p>{category.description}</p>
        </div>

        <div className="test-grid">
          {category.tests.map((test, index) => (
            <article className="test-card" key={test.id}>
              <div className="test-card-number">Test {index + 1}</div>
              <h3>{test.title}</h3>
              <p>{test.questions.length} Questions</p>
              <p>{test.durationMinutes} min timer</p>
              <Link to={`/category/${category.id}/test/${test.id}`} className="btn btn-primary">
                Start Test
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
