import React from 'react';
import { getAllCategories } from '../data/library.js';
import CategoryCard from '../components/CategoryCard.jsx';

export default function Home() {
  const categories = getAllCategories();

  return (
    <div className="page">
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">Fast, clean, and fully local</span>
          <h1>Agniveervayu Y Group</h1>
          <p>
            Choose a category, take a test, submit your answers, and review results with
            detailed analytics.
          </p>
        </div>
        <div className="hero-panel">
          <div className="hero-stat">
            <strong>{categories.length}</strong>
            <span>Test Categories</span>
          </div>
          <div className="hero-stat">
            <strong>-0.25</strong>
            <span>Negative marking</span>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <h2>Choose a Category</h2>
          <p>Each category opens a dedicated test list with reusable test cards.</p>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
